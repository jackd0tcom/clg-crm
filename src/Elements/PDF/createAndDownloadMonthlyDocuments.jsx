import { pdf } from "@react-pdf/renderer";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import PDFDocument from "./PDFDocument";
import StatementPDFDocument from "./StatementPDFDocument";
import axios from "axios";
import {
  formatBillTo,
  getClientPeople,
  resolveBillablePerson,
} from "../../helpers/billingHelpers";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
let MIN_STEP_MS = 600;

const ensureMinDuration = async (startedAt, ms) => {
  const elapsed = Date.now() - startedAt;
  if (elapsed < ms) await delay(ms - elapsed);
};

const sanitizeZipPathPart = (value) =>
  String(value ?? "")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

const getCaseFolderName = (startDate, caseData) => {
  const monthKey = new Date(startDate).toISOString().slice(0, 7);
  const client = resolveBillablePerson(caseData);
  const clientName =
    `${client?.firstName ?? ""} ${client?.lastName ?? ""}`.trim();
  const caseTitle = (caseData?.title ?? "").trim();
  return sanitizeZipPathPart(
    [monthKey, clientName, caseTitle].filter(Boolean).join(" - "),
  );
};

const uniqueCasesById = (cases) => {
  const uniqueCases = [];
  const seenCaseIds = new Set();
  for (const cas of cases) {
    if (seenCaseIds.has(cas.caseId)) continue;
    seenCaseIds.add(cas.caseId);
    uniqueCases.push(cas);
  }
  return uniqueCases;
};

async function createAndDownloadMonthlyDocuments({
  startDate,
  endDate,
  setZipStatus,
}) {
  MIN_STEP_MS = 600;
  const zip = new JSZip();
  const foldersByCaseId = {};
  let invoiceTotal = 0;
  let statementTotal = 0;

  const getFolderNameForCase = (caseId, caseData) => {
    if (caseId != null && foldersByCaseId[caseId]) {
      return foldersByCaseId[caseId];
    }
    let folderName = getCaseFolderName(startDate, caseData);
    const usedNames = new Set(Object.values(foldersByCaseId));
    if (!folderName || usedNames.has(folderName)) {
      folderName = sanitizeZipPathPart(
        `${folderName || new Date(startDate).toISOString().slice(0, 7)} (${caseId ?? "case"})`,
      );
    }
    if (caseId != null) {
      foldersByCaseId[caseId] = folderName;
    }
    return folderName;
  };

  setZipStatus?.("Creating invoices…");
  const invoiceCreateStarted = Date.now();

  const { data: invoices } = await axios.post("/api/createMonthlyInvoices", {
    startDate,
    endDate,
  });
  await ensureMinDuration(invoiceCreateStarted, MIN_STEP_MS);

  if (Array.isArray(invoices) && invoices.length) {
    invoiceTotal = invoices.length;

    for (const [index, inv] of invoices.entries()) {
      setZipStatus?.(`Generating invoice PDF ${index + 1} of ${invoiceTotal}…`);
      const stepStarted = Date.now();

      const { data } = await axios.get(`/api/getInvoice/${inv.invoiceId}`);
      const defaultClient = resolveBillablePerson(data.case, data);
      const blob = await pdf(
        <PDFDocument
          invoiceData={data}
          billTo={data.billTo ?? formatBillTo(defaultClient)}
          payTo={data.payTo ?? data.settings?.payTo ?? ""}
          entryServices={data.entryServices}
          rates={data.rates}
        />,
      ).toBlob();

      const caseId = data.caseId ?? data.case?.caseId ?? inv.caseId;
      const folderName = getFolderNameForCase(caseId, data.case);
      zip.file(
        `${folderName}/${sanitizeZipPathPart(data.invoiceTitle || inv.invoiceId)}.pdf`,
        blob,
      );

      await ensureMinDuration(stepStarted, MIN_STEP_MS);
      MIN_STEP_MS -= 150;
    }
  }

  MIN_STEP_MS = 600;
  setZipStatus?.("Creating statements…");
  const statementCreateStarted = Date.now();

  const { data: cases } = await axios.post("/api/createMonthlyStatements", {
    startDate,
    endDate,
  });
  await ensureMinDuration(statementCreateStarted, MIN_STEP_MS);

  const uniqueCases = uniqueCasesById(Array.isArray(cases) ? cases : []);

  if (uniqueCases.length) {
    statementTotal = uniqueCases.length;

    for (const [index, cas] of uniqueCases.entries()) {
      setZipStatus?.(
        `Generating statement PDF ${index + 1} of ${statementTotal}…`,
      );
      const stepStarted = Date.now();

      const defaultPerson = resolveBillablePerson(cas);
      const people = getClientPeople(cas.people, defaultPerson);
      const fileName = sanitizeZipPathPart(
        `${new Date(startDate).toISOString().slice(0, 7)}-${cas.title}-statements`,
      );
      const blob = await pdf(
        <StatementPDFDocument
          caseData={{ ...cas, billablePerson: defaultPerson, people }}
        />,
      ).toBlob();

      const folderName = getFolderNameForCase(cas.caseId, {
        ...cas,
        billablePerson: defaultPerson,
      });
      zip.file(`${folderName}/${fileName}.pdf`, blob);

      await ensureMinDuration(stepStarted, MIN_STEP_MS);
      MIN_STEP_MS -= 150;
    }
  }

  if (!invoiceTotal && !statementTotal) {
    setZipStatus?.("No documents to download");
    return { ok: false, count: 0 };
  }

  setZipStatus?.("Building zip…");
  MIN_STEP_MS = 1000;
  const zipStarted = Date.now();

  const zipBlob = await zip.generateAsync({ type: "blob" });
  await ensureMinDuration(zipStarted, MIN_STEP_MS);

  saveAs(
    zipBlob,
    `documents-${new Date(startDate).toISOString().slice(0, 7)}.zip`,
  );
  setZipStatus?.(
    `Done — ${invoiceTotal} invoices, ${statementTotal} statements downloaded`,
  );
  return { ok: true, count: invoiceTotal + statementTotal };
}
export default createAndDownloadMonthlyDocuments;

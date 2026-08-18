import { pdf } from "@react-pdf/renderer";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import PDFDocument from "./PDFDocument";
import StatementPDFDocument from "./StatementPDFDocument";
import axios from "axios";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
let MIN_STEP_MS = 600;

const ensureMinDuration = async (startedAt, ms) => {
  const elapsed = Date.now() - startedAt;
  if (elapsed < ms) await delay(ms - elapsed);
};

const getClientFolderName = (startDate, caseData) => {
  const monthKey = new Date(startDate).toISOString().slice(0, 7);
  const client = caseData?.billablePerson;
  const clientName =
    `${client?.firstName ?? ""} ${client?.lastName ?? ""}`.trim();
  return `${monthKey} ${clientName}`.trim();
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

  const getFolderNameForCase = (caseId, people) => {
    if (caseId != null && foldersByCaseId[caseId]) {
      return foldersByCaseId[caseId];
    }
    const folderName = getClientFolderName(startDate, people);
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

  if (invoices.length) {
    invoiceTotal = invoices.length;

    for (const [index, inv] of invoices.entries()) {
      setZipStatus?.(`Generating invoice PDF ${index + 1} of ${invoiceTotal}…`);
      const stepStarted = Date.now();

      const { data } = await axios.get(`/api/getInvoice/${inv.invoiceId}`);
      const defaultClient = data.case?.billablePerson;
      const defaultBillTo = defaultClient
        ? `${defaultClient.firstName ?? ""} ${defaultClient.lastName ?? ""}\n${defaultClient.address ?? ""} ${defaultClient.city ?? ""}, ${defaultClient.state ?? ""} ${defaultClient.zip ?? ""}\n${defaultClient.phoneNumber ?? ""}  `
        : "";
      const blob = await pdf(
        <PDFDocument
          invoiceData={data}
          billTo={data.billTo ?? defaultBillTo ?? ""}
          payTo={data.payTo ?? data.settings.payTo ?? ""}
          entryServices={data.entryServices}
          rates={data.rates}
        />,
      ).toBlob();

      const caseId = data.caseId ?? data.case?.caseId ?? inv.caseId;
      const folderName = getFolderNameForCase(caseId, data.case);
      zip.file(`${folderName}/${data.invoiceTitle || inv.invoiceId}.pdf`, blob);

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

  const uniqueCases = uniqueCasesById(cases);

  if (uniqueCases.length) {
    statementTotal = uniqueCases.length;

    for (const [index, cas] of uniqueCases.entries()) {
      setZipStatus?.(
        `Generating statement PDF ${index + 1} of ${statementTotal}…`,
      );
      const stepStarted = Date.now();

      const defaultPerson = cas.billablePerson;
      const people = defaultPerson
        ? [
            defaultPerson,
            ...(cas.people ?? []).filter(
              (person) => person.personId !== defaultPerson.personId,
            ),
          ]
        : cas.people;
      const fileName = `${new Date(startDate).toISOString().slice(0, 7)}-${cas.title}-statements.pdf`;
      const blob = await pdf(
        <StatementPDFDocument caseData={{ ...cas, people }} />,
      ).toBlob();

      const folderName = getFolderNameForCase(cas.caseId, cas.data);
      zip.file(`${folderName}/${fileName}`, blob);

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

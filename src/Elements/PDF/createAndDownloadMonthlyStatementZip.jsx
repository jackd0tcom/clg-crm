import { pdf } from "@react-pdf/renderer";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import PDFDocument from "./PDFDocument";
import StatementPDFDocument from "./StatementPDFDocument";
import axios from "axios";
import { formatNumericalDate } from "../../helpers/helperFunctions";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
let MIN_STEP_MS = 600;

const ensureMinDuration = async (startedAt, ms) => {
  const elapsed = Date.now() - startedAt;
  if (elapsed < ms) await delay(ms - elapsed);
};

async function createAndDownloadMonthlyStatementZip({
  startDate,
  endDate,
  setZipStatus,
}) {
  setZipStatus?.("Creating invoices…");
  const createStarted = Date.now();

  const { data: cases } = await axios.post("/api/createMonthlyStatements", {
    startDate,
    endDate,
  });
  await ensureMinDuration(createStarted, MIN_STEP_MS);

  if (!cases.length) {
    setZipStatus?.("No statements to download");
    return { ok: false, count: 0 };
  }

  const zip = new JSZip();
  const total = cases.length;

  for (const [index, cas] of cases.entries()) {
    setZipStatus?.(`Generating PDF ${index + 1} of ${total}…`);
    const stepStarted = Date.now();

    const fileName = `${new Date(startDate).toISOString().slice(0, 7)}-${cas.title}-statements.pdf`;

    const blob = await pdf(<StatementPDFDocument caseData={cas} />).toBlob();

    zip.file(fileName, blob);

    await ensureMinDuration(stepStarted, MIN_STEP_MS);
    MIN_STEP_MS -= 150;
  }

  setZipStatus?.("Building zip…");
  MIN_STEP_MS = 1000;
  const zipStarted = Date.now();

  const zipBlob = await zip.generateAsync({ type: "blob" });
  await ensureMinDuration(zipStarted, MIN_STEP_MS);

  saveAs(
    zipBlob,
    `statements-${new Date(startDate).toISOString().slice(0, 7)}.zip`,
  );
  setZipStatus?.(`Done — ${total} invoices downloaded`);
  return { ok: true, count: total };
}
export default createAndDownloadMonthlyStatementZip;

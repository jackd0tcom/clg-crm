import { pdf } from "@react-pdf/renderer";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import PDFDocument from "./PDFDocument";
import axios from "axios";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
let MIN_STEP_MS = 600;

const ensureMinDuration = async (startedAt, ms) => {
  const elapsed = Date.now() - startedAt;
  if (elapsed < ms) await delay(ms - elapsed);
};

async function createAndDownloadMonthlyZip({
  startDate,
  endDate,
  setZipStatus,
}) {
  setZipStatus?.("Creating invoices…");
  const createStarted = Date.now();

  const { data: invoices } = await axios.post("/api/createMonthlyInvoices", {
    startDate,
    endDate,
  });
  await ensureMinDuration(createStarted, MIN_STEP_MS);

  if (!invoices.length) {
    setZipStatus?.("No invoices to download");
    return { ok: false, count: 0 };
  }

  const zip = new JSZip();
  const total = invoices.length;

  for (const [index, inv] of invoices.entries()) {
    setZipStatus?.(`Generating PDF ${index + 1} of ${total}…`);
    const stepStarted = Date.now();

    const { data } = await axios.get(`/api/getInvoice/${inv.invoiceId}`);
    const defaultClient = data.entries[0]?.case
      ? data.entries[0].case?.people[0]
      : null;
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

    zip.file(`${data.invoiceTitle || inv.invoiceId}.pdf`, blob);

    await ensureMinDuration(stepStarted, MIN_STEP_MS);
    MIN_STEP_MS -= 150;
  }

  setZipStatus?.("Building zip…");
  MIN_STEP_MS = 1000;
  const zipStarted = Date.now();

  const zipBlob = await zip.generateAsync({ type: "blob" });
  await ensureMinDuration(zipStarted, MIN_STEP_MS);

  saveAs(zipBlob, `invoices-${new Date().toISOString().slice(0, 7)}.zip`);
  setZipStatus?.(`Done — ${total} invoices downloaded`);
  return { ok: true, count: total };
}
export default createAndDownloadMonthlyZip;

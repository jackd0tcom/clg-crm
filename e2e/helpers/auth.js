import { expect } from "@playwright/test";

const E2E_SECRET = process.env.E2E_TEST_SECRET || "clg-e2e-local";

export async function loginAsE2EUser(page) {
  const response = await page.request.post("/api/e2e/session", {
    headers: { "x-e2e-secret": E2E_SECRET },
  });

  if (!response.ok()) {
    throw new Error(
      `E2E session failed (${response.status()}). Start the app with E2E_TEST_SECRET=${E2E_SECRET} (or let Playwright start it).`,
    );
  }

  const fixture = await response.json();

  await page.addInitScript((user) => {
    window.__E2E_USER__ = user;
  }, fixture.user);

  await page.reload();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({
    timeout: 15_000,
  });

  return fixture;
}

export async function linkInvoiceToCase(page, { invoiceId, caseId, personId }) {
  const response = await page.request.post("/api/e2e/link-invoice", {
    headers: { "x-e2e-secret": E2E_SECRET },
    data: { invoiceId, caseId, personId },
  });

  if (!response.ok()) {
    throw new Error(`Failed to link invoice ${invoiceId} to case ${caseId}`);
  }
}

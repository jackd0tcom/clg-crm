import { test, expect, linkInvoiceToCase, loginAsE2EUser } from "./fixtures.js";

test("login, create an invoice, and record a payment", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Welcome Back" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continue with Google" }),
  ).toBeVisible();

  const fixture = await loginAsE2EUser(page);

  await page.getByRole("link", { name: "Invoices" }).click();
  await expect(page.getByRole("heading", { name: "Invoices" })).toBeVisible();

  await page.getByRole("button", { name: "Create Invoice" }).click();
  await page.getByText("Blank Invoice").click();
  await page.waitForURL(/\/invoice\/\d+/);

  const invoiceId = Number(page.url().match(/\/invoice\/(\d+)/)[1]);
  await linkInvoiceToCase(page, {
    invoiceId,
    caseId: fixture.caseId,
    personId: fixture.personId,
  });
  await page.reload();

  await expect(page.getByRole("heading", { name: "Payments" })).toBeVisible();
  await page.getByRole("button", { name: "Add Payment" }).click();
  await expect(
    page.getByRole("heading", { name: "Invoice Payment" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /E2eAda/ })).toBeVisible();

  const amount = 100 + (Date.now() % 800);
  await page.getByRole("spinbutton").fill(String(amount));
  await page.getByRole("button", { name: "Select a Description" }).click();
  await page
    .locator(".pay-modal-description-item")
    .filter({ hasText: "Invoice Payment" })
    .click();
  await page.locator(".pay-modal-save").click();

  const paymentRow = page
    .locator(".payment-items-wrapper .payment-item")
    .filter({ hasText: `$${amount}` })
    .filter({ hasText: "Invoice Payment" });
  await expect(paymentRow).toHaveCount(1);
  await expect(paymentRow.getByText("E2eAda Client")).toBeVisible();
});

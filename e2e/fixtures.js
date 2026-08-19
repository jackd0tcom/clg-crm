import { test as base, expect } from "@playwright/test";
import { cleanupE2eData, linkInvoiceToCase, loginAsE2EUser } from "./helpers/auth.js";

export const test = base.extend({});

test.afterEach(async ({ page }) => {
  await cleanupE2eData(page);
});

export { expect, cleanupE2eData, linkInvoiceToCase, loginAsE2EUser };

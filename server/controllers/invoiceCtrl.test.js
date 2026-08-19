import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  mockReq,
  mockRes,
  sequelizeRow,
  silenceConsole,
} from "../test/httpMocks.js";

vi.mock("../model.js", () => {
  const model = () => ({
    findAll: vi.fn(),
    findOne: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
    findOrCreate: vi.fn(),
  });

  return {
    Case: model(),
    User: model(),
    Person: model(),
    Task: model(),
    TimeEntry: model(),
    Invoice: model(),
    UserSettings: model(),
    CustomCharge: model(),
    EntryService: model(),
    Rate: model(),
    Payment: model(),
  };
});

import {
  Invoice,
  TimeEntry,
  CustomCharge,
  Payment,
  EntryService,
  UserSettings,
  Rate,
} from "../model.js";
import invoiceCtrl, {
  resolveCaseIdFromEntries,
  backfillInvoiceCaseId,
} from "./invoiceCtrl.js";

const authedReq = (overrides = {}) =>
  mockReq({
    session: { user: { userId: 1 } },
    ...overrides,
  });

describe("resolveCaseIdFromEntries", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when there are no entry ids", async () => {
    await expect(resolveCaseIdFromEntries([])).resolves.toBeNull();
    await expect(resolveCaseIdFromEntries(null)).resolves.toBeNull();
    expect(TimeEntry.findAll).not.toHaveBeenCalled();
  });

  it("prefers the time entry caseId", async () => {
    TimeEntry.findAll.mockResolvedValue([
      { caseId: 9, task: { caseId: 3 } },
      { caseId: 12 },
    ]);

    await expect(resolveCaseIdFromEntries([1, 2])).resolves.toBe(9);
  });

  it("falls back to the linked task caseId", async () => {
    TimeEntry.findAll.mockResolvedValue([
      { caseId: null, task: { caseId: 3 } },
    ]);

    await expect(resolveCaseIdFromEntries([1])).resolves.toBe(3);
  });

  it("returns null when neither the entry nor the task has a case", async () => {
    TimeEntry.findAll.mockResolvedValue([{ caseId: null, task: null }]);
    await expect(resolveCaseIdFromEntries([1])).resolves.toBeNull();
  });
});

describe("backfillInvoiceCaseId", () => {
  it("returns the existing caseId without updating", async () => {
    const invoice = sequelizeRow({ invoiceId: 1, caseId: 4 });

    await expect(backfillInvoiceCaseId(invoice, [{ caseId: 9 }])).resolves.toBe(
      4,
    );
    expect(invoice.update).not.toHaveBeenCalled();
  });

  it("updates from an entry caseId", async () => {
    const invoice = sequelizeRow({ invoiceId: 1, caseId: null });

    await expect(
      backfillInvoiceCaseId(invoice, [{ caseId: 9 }]),
    ).resolves.toBe(9);
    expect(invoice.update).toHaveBeenCalledWith({ caseId: 9 });
  });

  it("updates from a nested case, task, or custom charge", async () => {
    const fromCase = sequelizeRow({ invoiceId: 1, caseId: null });
    await backfillInvoiceCaseId(fromCase, [{ case: { caseId: 8 } }]);
    expect(fromCase.update).toHaveBeenCalledWith({ caseId: 8 });

    const fromTask = sequelizeRow({ invoiceId: 2, caseId: null });
    await backfillInvoiceCaseId(fromTask, [{ task: { caseId: 7 } }]);
    expect(fromTask.update).toHaveBeenCalledWith({ caseId: 7 });

    const fromCharge = sequelizeRow({ invoiceId: 3, caseId: null });
    await backfillInvoiceCaseId(fromCharge, [], [{ caseId: 6 }]);
    expect(fromCharge.update).toHaveBeenCalledWith({ caseId: 6 });
  });

  it("returns null when nothing has a caseId", async () => {
    const invoice = sequelizeRow({ invoiceId: 1, caseId: null });
    await expect(backfillInvoiceCaseId(invoice, [], [])).resolves.toBeNull();
    expect(invoice.update).not.toHaveBeenCalled();
  });
});

describe("invoiceCtrl", () => {
  beforeEach(() => {
    silenceConsole();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe("auth", () => {
    it.each([
      ["getInvoice", { params: { invoiceId: 1 } }],
      ["getInvoices", {}],
      ["newInvoice", { body: {} }],
      ["saveInvoice", { body: { invoiceData: { invoiceId: 1 } } }],
      ["deleteInvoice", { body: { invoiceId: 1 } }],
      ["newCustomCharge", { body: { invoiceId: 1 } }],
      ["updateInvoiceStatus", { body: { invoiceId: 1, status: "paid", entryIds: [] } }],
      ["deleteEntryFromInvoice", { body: { timeEntryId: 1 } }],
      ["markAsPaid", { body: { invoiceId: 1, isPaid: true } }],
      ["createMonthlyInvoices", { body: {} }],
    ])("%s returns 401 when the user is not authenticated", async (method, extra) => {
      const res = mockRes();
      await invoiceCtrl[method](mockReq(extra), res);
      expect(res.statusCode).toBe(401);
      expect(res.body).toBe("User not authenticated");
    });
  });

  describe("newInvoice", () => {
    it("creates an invoice using the caseId from the request body", async () => {
      Invoice.create.mockResolvedValue(
        sequelizeRow({ invoiceId: 10, userId: 1, caseId: 9 }),
      );
      const res = mockRes();

      await invoiceCtrl.newInvoice(
        authedReq({ body: { caseId: 9 } }),
        res,
      );

      expect(Invoice.create).toHaveBeenCalledWith({ userId: 1, caseId: 9 });
      expect(res.statusCode).toBe(200);
      expect(res.body.invoiceId).toBe(10);
      expect(TimeEntry.findByPk).not.toHaveBeenCalled();
    });

    it("resolves caseId from time entries and attaches them to the invoice", async () => {
      TimeEntry.findAll.mockResolvedValue([{ caseId: 9 }]);
      Invoice.create.mockResolvedValue(
        sequelizeRow({ invoiceId: 10, userId: 1, caseId: 9 }),
      );
      const entry = sequelizeRow({ timeEntryId: 3, invoiceId: null });
      TimeEntry.findByPk.mockResolvedValue(entry);
      const res = mockRes();

      await invoiceCtrl.newInvoice(
        authedReq({ body: { entries: [3] } }),
        res,
      );

      expect(Invoice.create).toHaveBeenCalledWith({ userId: 1, caseId: 9 });
      expect(entry.update).toHaveBeenCalledWith({ invoiceId: 10 });
      expect(res.body.entries).toHaveLength(1);
    });
  });

  describe("getInvoice", () => {
    it("returns 404 when the invoice does not exist", async () => {
      EntryService.findAll.mockResolvedValue([]);
      UserSettings.findOne.mockResolvedValue(null);
      Rate.findAll.mockResolvedValue([]);
      Invoice.findOne.mockResolvedValue(null);
      const res = mockRes();

      await invoiceCtrl.getInvoice(
        authedReq({ params: { invoiceId: 99 } }),
        res,
      );

      expect(res.statusCode).toBe(404);
    });

    it("backfills a missing caseId and includes case payments", async () => {
      const invoice = sequelizeRow({
        invoiceId: 1,
        caseId: null,
        timeEntries: [{ caseId: 9 }],
        customCharges: [],
      });
      EntryService.findAll.mockResolvedValue([]);
      UserSettings.findOne.mockResolvedValue({ roundingAmount: 6 });
      Rate.findAll.mockResolvedValue([]);
      Invoice.findOne.mockResolvedValue(invoice);
      Payment.findAll.mockResolvedValue([{ paymentId: 3, amount: 50 }]);
      const res = mockRes();

      await invoiceCtrl.getInvoice(
        authedReq({ params: { invoiceId: 1 } }),
        res,
      );

      expect(invoice.update).toHaveBeenCalledWith({ caseId: 9 });
      expect(Payment.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: { caseId: 9 } }),
      );
      expect(res.statusCode).toBe(200);
      expect(res.body.caseId).toBe(9);
      expect(res.body.payments).toEqual([{ paymentId: 3, amount: 50 }]);
    });
  });

  describe("saveInvoice", () => {
    it("returns 400 when invoiceId is missing", async () => {
      const res = mockRes();
      await invoiceCtrl.saveInvoice(
        authedReq({ body: { invoiceData: {} } }),
        res,
      );
      expect(res.statusCode).toBe(400);
    });

    it("returns 404 when the invoice does not exist", async () => {
      Invoice.findOne.mockResolvedValue(null);
      const res = mockRes();
      await invoiceCtrl.saveInvoice(
        authedReq({ body: { invoiceData: { invoiceId: 1 } } }),
        res,
      );
      expect(res.statusCode).toBe(404);
    });

    it("returns 403 when another user owns the invoice", async () => {
      Invoice.findOne.mockResolvedValue(
        sequelizeRow({ invoiceId: 1, userId: 99 }),
      );
      const res = mockRes();
      await invoiceCtrl.saveInvoice(
        authedReq({ body: { invoiceData: { invoiceId: 1 } } }),
        res,
      );
      expect(res.statusCode).toBe(403);
    });

    it("updates invoice fields, entries, and custom charges", async () => {
      const invoice = sequelizeRow({
        invoiceId: 1,
        userId: 1,
        caseId: 9,
        invoiceTitle: "Old",
      });
      const entry = sequelizeRow({ timeEntryId: 3 });
      const charge = sequelizeRow({ chargeId: 4, caseId: 9 });
      Invoice.findOne.mockResolvedValue(invoice);
      TimeEntry.findByPk.mockResolvedValue(entry);
      CustomCharge.findByPk.mockResolvedValue(charge);
      const res = mockRes();

      await invoiceCtrl.saveInvoice(
        authedReq({
          body: {
            invoiceData: {
              invoiceId: 1,
              invoiceTitle: "New title",
              invoiceStatus: "sent",
              roundingAmount: 6,
              isPaid: false,
              billTo: "Ada",
              payTo: "Firm",
              caseId: 9,
              entries: [
                {
                  timeEntryId: 3,
                  notes: "Research",
                  startTime: "2026-08-01T10:00:00.000Z",
                  endTime: "2026-08-01T11:00:00.000Z",
                  isRunning: false,
                  invoiceId: 1,
                  isPaid: false,
                  rateId: 2,
                },
              ],
              customCharges: [{ chargeId: 4, description: "Filing", amount: 40 }],
            },
          },
        }),
        res,
      );

      expect(invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          invoiceTitle: "New title",
          invoiceStatus: "sent",
          roundingAmount: 6,
          billTo: "Ada",
        }),
      );
      expect(entry.update).toHaveBeenCalledWith(
        expect.objectContaining({ notes: "Research", rateId: 2 }),
      );
      expect(charge.update).toHaveBeenCalledWith({
        description: "Filing",
        amount: 40,
        caseId: 9,
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe("deleteInvoice", () => {
    it("returns 404 when the invoice does not exist", async () => {
      Invoice.findOne.mockResolvedValue(null);
      const res = mockRes();
      await invoiceCtrl.deleteInvoice(
        authedReq({ body: { invoiceId: 1 } }),
        res,
      );
      expect(res.statusCode).toBe(404);
    });

    it("unlinks charges and entries, then deletes the invoice", async () => {
      const invoice = sequelizeRow({ invoiceId: 7 });
      const charge = sequelizeRow({ chargeId: 1, invoiceId: 7 });
      const entry = sequelizeRow({
        timeEntryId: 2,
        invoiceId: 7,
        paidStatus: "invoiced",
      });
      Invoice.findOne.mockResolvedValue(invoice);
      CustomCharge.findAll.mockResolvedValue([charge]);
      TimeEntry.findAll.mockResolvedValue([entry]);
      const res = mockRes();

      await invoiceCtrl.deleteInvoice(
        authedReq({ body: { invoiceId: 7 } }),
        res,
      );

      expect(charge.update).toHaveBeenCalledWith({ invoiceId: null });
      expect(entry.update).toHaveBeenCalledWith({
        invoiceId: null,
        paidStatus: "draft",
      });
      expect(invoice.destroy).toHaveBeenCalledOnce();
      expect(res.statusCode).toBe(200);
    });
  });

  describe("newCustomCharge", () => {
    it("copies the invoice caseId onto the new charge", async () => {
      Invoice.findByPk.mockResolvedValue(
        sequelizeRow({ invoiceId: 1, caseId: 9 }),
      );
      CustomCharge.create.mockResolvedValue(
        sequelizeRow({ chargeId: 2, invoiceId: 1, caseId: 9 }),
      );
      const res = mockRes();

      await invoiceCtrl.newCustomCharge(
        authedReq({ body: { invoiceId: 1 } }),
        res,
      );

      expect(CustomCharge.create).toHaveBeenCalledWith({
        invoiceId: 1,
        caseId: 9,
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe("updateInvoiceStatus", () => {
    it("returns 403 when another user owns the invoice", async () => {
      Invoice.findOne.mockResolvedValue(
        sequelizeRow({ invoiceId: 1, userId: 99 }),
      );
      const res = mockRes();
      await invoiceCtrl.updateInvoiceStatus(
        authedReq({
          body: { invoiceId: 1, status: "paid", entryIds: [] },
        }),
        res,
      );
      expect(res.statusCode).toBe(403);
    });
  });
});

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

import { Invoice, Case, Payment } from "../model.js";
import statementCtrl from "./statementCtrl.js";

const authedReq = (overrides = {}) =>
  mockReq({
    session: { user: { userId: 1 } },
    ...overrides,
  });

describe("statementCtrl", () => {
  beforeEach(() => {
    silenceConsole();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe("auth", () => {
    it.each(["addPayment", "updatePayment", "getPayments", "createMonthlyStatements"])(
      "%s returns 401 when the user is not authenticated",
      async (method) => {
        const res = mockRes();
        await statementCtrl[method](mockReq({ body: { objects: [] } }), res);
        expect(res.statusCode).toBe(401);
        expect(res.body).toBe("User not authenticated");
      },
    );
  });

  describe("addPayment", () => {
    it("creates a payment linked to an invoice and person", async () => {
      Invoice.findOne.mockResolvedValue(
        sequelizeRow({ invoiceId: 10, payments: [] }),
      );
      const created = sequelizeRow({ paymentId: 3, invoiceId: 10, amount: 250 });
      Payment.create.mockResolvedValue(created);
      Payment.findOne.mockResolvedValue({
        ...created,
        person: { personId: 1, firstName: "Ada" },
      });
      const res = mockRes();

      await statementCtrl.addPayment(
        authedReq({
          body: {
            objects: [{ type: "invoice", id: 10 }],
            payment: {
              paidDescription: "Invoice Payment",
              paidAmount: 250,
              paidDate: "2026-08-18",
            },
            personId: 1,
          },
        }),
        res,
      );

      expect(Invoice.findOne).toHaveBeenCalled();
      expect(Payment.create).toHaveBeenCalledWith({
        invoiceId: 10,
        description: "Invoice Payment",
        amount: 250,
        paidDate: "2026-08-18",
        personId: 1,
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.person.firstName).toBe("Ada");
    });

    it("attaches a payment to both a case and an invoice", async () => {
      Invoice.findOne.mockResolvedValue(sequelizeRow({ invoiceId: 10 }));
      Case.findOne.mockResolvedValue(sequelizeRow({ caseId: 9 }));
      Payment.create.mockResolvedValue(sequelizeRow({ paymentId: 4 }));
      Payment.findOne.mockResolvedValue(sequelizeRow({ paymentId: 4 }));
      const res = mockRes();

      await statementCtrl.addPayment(
        authedReq({
          body: {
            objects: [
              { type: "invoice", id: 10 },
              { type: "case", id: 9 },
            ],
            payment: {
              paidDescription: "Retainer Payment",
              paidAmount: 1000,
              paidDate: "2026-08-01",
            },
            personId: 1,
          },
        }),
        res,
      );

      expect(Payment.create).toHaveBeenCalledWith({
        invoiceId: 10,
        caseId: 9,
        description: "Retainer Payment",
        amount: 1000,
        paidDate: "2026-08-01",
        personId: 1,
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe("updatePayment", () => {
    it("returns 404 when the payment does not exist", async () => {
      Payment.findByPk.mockResolvedValue(null);
      const res = mockRes();

      await statementCtrl.updatePayment(
        authedReq({
          body: {
            paymentId: 99,
            payment: { description: "Updated", amount: 10, paidDate: "2026-08-18" },
          },
        }),
        res,
      );

      expect(res.statusCode).toBe(404);
    });

    it("updates description, amount, and paid date", async () => {
      const payment = sequelizeRow({
        paymentId: 3,
        description: "Old",
        amount: 50,
      });
      Payment.findByPk.mockResolvedValue(payment);
      const res = mockRes();

      await statementCtrl.updatePayment(
        authedReq({
          body: {
            paymentId: 3,
            payment: {
              description: "Invoice Payment",
              amount: 75,
              paidDate: "2026-08-18",
            },
          },
        }),
        res,
      );

      expect(payment.update).toHaveBeenCalledWith({
        description: "Invoice Payment",
        amount: 75,
        paidDate: "2026-08-18",
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe("createMonthlyStatements", () => {
    it("returns an empty list when no cases have activity in range", async () => {
      Payment.findAll.mockResolvedValue([]);
      Invoice.findAll.mockResolvedValue([]);
      const res = mockRes();

      await statementCtrl.createMonthlyStatements(
        authedReq({
          body: { startDate: "2026-08-01", endDate: "2026-08-31" },
        }),
        res,
      );

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
      expect(Case.findAll).not.toHaveBeenCalled();
    });

    it("returns serialized billing data for matching cases", async () => {
      Payment.findAll.mockResolvedValue([{ caseId: 9 }]);
      Invoice.findAll.mockResolvedValue([]);
      Case.findAll.mockResolvedValue([
        sequelizeRow({
          caseId: 9,
          title: "Lovelace",
          billableContact: 1,
          people: [
            {
              personId: 1,
              firstName: "Ada",
              lastName: "Lovelace",
              type: "client",
            },
          ],
          billablePerson: {
            personId: 1,
            firstName: "Ada",
            lastName: "Lovelace",
            type: "client",
          },
          payments: [],
          invoices: [],
        }),
      ]);
      const res = mockRes();

      await statementCtrl.createMonthlyStatements(
        authedReq({
          body: { startDate: "2026-08-01", endDate: "2026-08-31" },
        }),
        res,
      );

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].caseId).toBe(9);
      expect(res.body[0].billablePerson.firstName).toBe("Ada");
    });
  });
});

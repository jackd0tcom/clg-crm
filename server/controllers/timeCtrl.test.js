import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  mockReq,
  mockRes,
  sequelizeRow,
  silenceConsole,
} from "../test/httpMocks.js";

vi.mock("../model.js", async () => {
  const { createModelModuleMock } = await import("../test/httpMocks.js");
  return createModelModuleMock();
});

import {
  TimeEntry,
  CustomCharge,
  Case,
  EntryService,
  Rate,
} from "../model.js";
import timeCtrl from "./timeCtrl.js";

const authedReq = (overrides = {}) =>
  mockReq({
    session: { user: { userId: 1 } },
    ...overrides,
  });

describe("timeCtrl", () => {
  beforeEach(() => {
    silenceConsole();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe("auth", () => {
    it.each([
      ["startEntry", { body: {} }],
      ["stopEntry", { body: { timeEntryId: 1 } }],
      ["updateEntry", { body: { timeEntryId: 1 } }],
      ["deleteEntry", { body: { timeEntryId: 1 } }],
      ["newEntry", { body: {} }],
      ["runningTimer", {}],
      ["newCharge", { body: {} }],
      ["updateCharge", { body: { chargeId: 1 } }],
    ])("%s returns 401 when the user is not authenticated", async (method, extra) => {
      const res = mockRes();
      await timeCtrl[method](mockReq(extra), res);
      expect(res.statusCode).toBe(401);
      expect(res.body).toBe("User not authenticated");
    });
  });

  describe("startEntry", () => {
    it("starts a running timer for the session user", async () => {
      TimeEntry.create.mockResolvedValue(
        sequelizeRow({ timeEntryId: 4, userId: 1, isRunning: true }),
      );
      const res = mockRes();

      await timeCtrl.startEntry(
        authedReq({ body: { caseId: 9, notes: "Call" } }),
        res,
      );

      expect(TimeEntry.create).toHaveBeenCalledWith(
        expect.objectContaining({
          caseId: 9,
          notes: "Call",
          userId: 1,
          isRunning: true,
          startTime: expect.any(Number),
        }),
      );
      expect(res.statusCode).toBe(200);
    });

    it("can start a timer for another userId when provided", async () => {
      TimeEntry.create.mockResolvedValue(sequelizeRow({ userId: 7 }));
      const res = mockRes();

      await timeCtrl.startEntry(
        authedReq({ body: { taskId: 2, userId: 7 } }),
        res,
      );

      expect(TimeEntry.create).toHaveBeenCalledWith(
        expect.objectContaining({ taskId: 2, userId: 7, isRunning: true }),
      );
    });
  });

  describe("stopEntry", () => {
    it("returns 401 when the entry does not exist", async () => {
      TimeEntry.findOne.mockResolvedValue(null);
      const res = mockRes();

      await timeCtrl.stopEntry(
        authedReq({ body: { timeEntryId: 99 } }),
        res,
      );

      expect(res.statusCode).toBe(401);
      expect(res.body).toBe("Entry does not exist");
    });

    it("stops the timer and sets an end time", async () => {
      const entry = sequelizeRow({ timeEntryId: 4, isRunning: true });
      TimeEntry.findOne.mockResolvedValue(entry);
      const res = mockRes();

      await timeCtrl.stopEntry(
        authedReq({ body: { timeEntryId: 4 } }),
        res,
      );

      expect(entry.update).toHaveBeenCalledWith({
        endTime: expect.any(Number),
        isRunning: false,
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe("newEntry", () => {
    it("creates a completed entry with the given times and rate", async () => {
      TimeEntry.create.mockResolvedValue(sequelizeRow({ timeEntryId: 8 }));
      const res = mockRes();

      await timeCtrl.newEntry(
        authedReq({
          body: {
            caseId: 9,
            notes: "Research",
            startTime: "2026-08-18T10:00:00.000Z",
            endTime: "2026-08-18T11:00:00.000Z",
            rateId: 2,
            entryServiceId: 3,
          },
        }),
        res,
      );

      expect(TimeEntry.create).toHaveBeenCalledWith({
        caseId: 9,
        taskId: undefined,
        userId: 1,
        notes: "Research",
        startTime: "2026-08-18T10:00:00.000Z",
        endTime: "2026-08-18T11:00:00.000Z",
        entryServiceId: 3,
        isRunning: false,
        rateId: 2,
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe("deleteEntry", () => {
    it("destroys an existing entry", async () => {
      const entry = sequelizeRow({ timeEntryId: 4 });
      TimeEntry.findOne.mockResolvedValue(entry);
      const res = mockRes();

      await timeCtrl.deleteEntry(
        authedReq({ body: { timeEntryId: 4 } }),
        res,
      );

      expect(entry.destroy).toHaveBeenCalledOnce();
      expect(res.statusCode).toBe(200);
    });
  });

  describe("runningTimer", () => {
    it("returns services and rates with 201 when nothing is running", async () => {
      TimeEntry.findOne.mockResolvedValue(null);
      EntryService.findAll.mockResolvedValue([{ entryServiceId: 1 }]);
      Rate.findAll.mockResolvedValue([{ rateId: 2, rate: 300 }]);
      const res = mockRes();

      await timeCtrl.runningTimer(authedReq(), res);

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        entryServices: [{ entryServiceId: 1 }],
        rates: [{ rateId: 2, rate: 300 }],
      });
    });

    it("includes the case when a timer is running against a case", async () => {
      TimeEntry.findOne.mockResolvedValue(
        sequelizeRow({
          timeEntryId: 4,
          caseId: 9,
          taskId: null,
          isRunning: true,
        }),
      );
      EntryService.findAll.mockResolvedValue([]);
      Rate.findAll.mockResolvedValue([]);
      Case.findOne.mockResolvedValue(sequelizeRow({ caseId: 9, title: "Ada" }));
      const res = mockRes();

      await timeCtrl.runningTimer(authedReq(), res);

      expect(res.statusCode).toBe(200);
      expect(res.body.caseId).toBe(9);
      expect(res.body.case.title).toBe("Ada");
    });
  });

  describe("newCharge / updateCharge", () => {
    it("creates a custom charge on a case", async () => {
      CustomCharge.create.mockResolvedValue(
        sequelizeRow({ chargeId: 1, caseId: 9, amount: 40 }),
      );
      const res = mockRes();

      await timeCtrl.newCharge(
        authedReq({
          body: { caseId: 9, description: "Filing", amount: 40 },
        }),
        res,
      );

      expect(CustomCharge.create).toHaveBeenCalledWith({
        caseId: 9,
        invoiceId: null,
        description: "Filing",
        amount: 40,
      });
      expect(res.statusCode).toBe(200);
    });

    it("updates an existing charge", async () => {
      const charge = sequelizeRow({ chargeId: 1, amount: 40 });
      CustomCharge.findByPk.mockResolvedValue(charge);
      const res = mockRes();

      await timeCtrl.updateCharge(
        authedReq({
          body: { chargeId: 1, description: "Court fee", amount: 55 },
        }),
        res,
      );

      expect(charge.update).toHaveBeenCalledWith({
        description: "Court fee",
        amount: 55,
      });
      expect(res.statusCode).toBe(200);
    });

    it("returns 400 when the charge does not exist", async () => {
      CustomCharge.findByPk.mockResolvedValue(null);
      const res = mockRes();

      await timeCtrl.updateCharge(
        authedReq({ body: { chargeId: 99, description: "x", amount: 1 } }),
        res,
      );

      expect(res.statusCode).toBe(400);
    });
  });
});

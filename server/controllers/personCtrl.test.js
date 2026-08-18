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

vi.mock("../helpers/activityHelper.js", () => ({
  createActivityLog: vi.fn().mockResolvedValue({}),
  ACTIVITY_ACTIONS: {
    PERSON_UPDATED: "person_updated",
    PERSON_CREATED: "person_created",
    PERSON_REMOVED: "person_removed",
  },
  capitalize: (str) => str,
  format: (str) => str,
  spaceOut: (str) => str,
}));

import { Person, Case, CasePerson } from "../model.js";
import { createActivityLog } from "../helpers/activityHelper.js";
import personCtrl from "./personCtrl.js";

const authedReq = (overrides = {}) =>
  mockReq({
    session: { user: { userId: 1 } },
    ...overrides,
  });

describe("personCtrl", () => {
  beforeEach(() => {
    silenceConsole();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe("auth", () => {
    it.each([
      ["updatePerson", { body: { personId: 1, fieldName: "firstName", value: "Ada" } }],
      ["getPeople", {}],
      ["deletePerson", { body: { personId: 1, caseId: 9 } }],
      ["assignPersonToCase", { body: { personId: 1, caseId: 9 } }],
    ])("%s returns 401 when the user is not authenticated", async (method, extra) => {
      const res = mockRes();
      await personCtrl[method](mockReq(extra), res);
      expect(res.statusCode).toBe(401);
    });
  });

  describe("updatePerson", () => {
    it("returns 404 when the person does not exist", async () => {
      Person.findOne.mockResolvedValue(null);
      const res = mockRes();

      await personCtrl.updatePerson(
        authedReq({
          body: { personId: 99, fieldName: "phoneNumber", value: "555" },
        }),
        res,
      );

      expect(res.statusCode).toBe(404);
    });

    it("updates the field and writes an activity log", async () => {
      const person = sequelizeRow({ personId: 1, firstName: "Ada", city: null });
      Person.findOne.mockResolvedValue(person);
      const res = mockRes();

      await personCtrl.updatePerson(
        authedReq({
          body: { personId: 1, fieldName: "city", value: "London" },
        }),
        res,
      );

      expect(person.update).toHaveBeenCalledWith({ city: "London" });
      expect(createActivityLog).toHaveBeenCalledWith(
        expect.objectContaining({
          authorId: 1,
          objectType: "person",
          objectId: 1,
          action: "person_updated",
        }),
      );
      expect(res.statusCode).toBe(200);
    });
  });

  describe("newPerson", () => {
    it("sets billableContact when the first client is added to the case", async () => {
      CasePerson.count.mockResolvedValue(0);
      Person.create.mockResolvedValue(
        sequelizeRow({ personId: 4, firstName: "Ada" }),
      );
      CasePerson.create.mockResolvedValue({});
      const cas = sequelizeRow({ caseId: 9, billableContact: null });
      Case.findByPk.mockResolvedValue(cas);
      const res = mockRes();

      await personCtrl.newPerson(
        authedReq({
          body: {
            caseId: 9,
            fieldName: "firstName",
            value: "Ada",
            type: "client",
          },
        }),
        res,
      );

      expect(CasePerson.create).toHaveBeenCalledWith({
        caseId: 9,
        personId: 4,
        type: "client",
      });
      expect(cas.update).toHaveBeenCalledWith({ billableContact: 4 });
      expect(res.statusCode).toBe(200);
      expect(res.body.type).toBe("client");
    });

    it("does not overwrite billableContact for a later client", async () => {
      CasePerson.count.mockResolvedValue(1);
      Person.create.mockResolvedValue(
        sequelizeRow({ personId: 5, firstName: "Lin" }),
      );
      CasePerson.create.mockResolvedValue({});
      const res = mockRes();

      await personCtrl.newPerson(
        authedReq({
          body: {
            caseId: 9,
            fieldName: "firstName",
            value: "Lin",
            type: "client",
          },
        }),
        res,
      );

      expect(Case.findByPk).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
    });

    it("does not set billableContact for a non-client", async () => {
      CasePerson.count.mockResolvedValue(0);
      Person.create.mockResolvedValue(
        sequelizeRow({ personId: 6, firstName: "Opposing" }),
      );
      CasePerson.create.mockResolvedValue({});
      const res = mockRes();

      await personCtrl.newPerson(
        authedReq({
          body: {
            caseId: 9,
            fieldName: "firstName",
            value: "Opposing",
            type: "opposing",
          },
        }),
        res,
      );

      expect(Case.findByPk).not.toHaveBeenCalled();
      expect(CasePerson.create).toHaveBeenCalledWith({
        caseId: 9,
        personId: 6,
        type: "opposing",
      });
    });
  });

  describe("assignPersonToCase", () => {
    it("returns 404 when the person does not exist", async () => {
      Person.findByPk.mockResolvedValue(null);
      CasePerson.count.mockResolvedValue(0);
      const res = mockRes();

      await personCtrl.assignPersonToCase(
        authedReq({ body: { personId: 99, caseId: 9, type: "client" } }),
        res,
      );

      expect(res.statusCode).toBe(404);
    });

    it("returns 409 when the person is already on the case", async () => {
      Person.findByPk.mockResolvedValue(sequelizeRow({ personId: 1 }));
      CasePerson.count.mockResolvedValue(0);
      CasePerson.findOne.mockResolvedValue(sequelizeRow({ personId: 1, caseId: 9 }));
      const res = mockRes();

      await personCtrl.assignPersonToCase(
        authedReq({ body: { personId: 1, caseId: 9, type: "client" } }),
        res,
      );

      expect(res.statusCode).toBe(409);
    });

    it("sets billableContact when assigning the first client", async () => {
      const person = sequelizeRow({
        personId: 1,
        firstName: "Ada",
        lastName: "Lovelace",
      });
      Person.findByPk.mockResolvedValue(person);
      CasePerson.count.mockResolvedValue(0);
      CasePerson.findOne.mockResolvedValue(null);
      CasePerson.create.mockResolvedValue({});
      const cas = sequelizeRow({ caseId: 9, billableContact: null });
      Case.findByPk.mockResolvedValue(cas);
      const res = mockRes();

      await personCtrl.assignPersonToCase(
        authedReq({ body: { personId: 1, caseId: 9, type: "client" } }),
        res,
      );

      expect(cas.update).toHaveBeenCalledWith({ billableContact: 1 });
      expect(res.statusCode).toBe(200);
    });
  });

  describe("deletePerson", () => {
    it("returns 404 when the person is not on the case", async () => {
      Person.findOne.mockResolvedValue(sequelizeRow({ personId: 1, firstName: "Ada" }));
      CasePerson.findOne.mockResolvedValue(null);
      const res = mockRes();

      await personCtrl.deletePerson(
        authedReq({ body: { personId: 1, caseId: 9 } }),
        res,
      );

      expect(res.statusCode).toBe(404);
      expect(res.body).toBe("Person not found on this case");
    });

    it("removes the case link without deleting the person record", async () => {
      const person = sequelizeRow({
        personId: 1,
        firstName: "Ada",
        lastName: "Lovelace",
      });
      const casePerson = sequelizeRow({ personId: 1, caseId: 9 });
      Person.findOne.mockResolvedValue(person);
      CasePerson.findOne.mockResolvedValue(casePerson);
      const res = mockRes();

      await personCtrl.deletePerson(
        authedReq({ body: { personId: 1, caseId: 9 } }),
        res,
      );

      expect(casePerson.destroy).toHaveBeenCalledOnce();
      expect(person.destroy).not.toHaveBeenCalled();
      expect(createActivityLog).toHaveBeenCalledWith(
        expect.objectContaining({
          objectType: "case",
          action: "person_removed",
        }),
      );
      expect(res.statusCode).toBe(200);
    });
  });
});

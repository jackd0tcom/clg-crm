import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  mockReq,
  mockRes,
  mockNext,
  sequelizeRow,
  silenceConsole,
} from "../test/httpMocks.js";

vi.mock("../model.js", async () => {
  const { createModelModuleMock } = await import("../test/httpMocks.js");
  return createModelModuleMock();
});

import { User } from "../model.js";
import adminCtrl from "./adminCtrl.js";

const adminReq = (overrides = {}) =>
  mockReq({
    session: { user: { userId: 1, role: "admin" } },
    ...overrides,
  });

describe("adminCtrl", () => {
  beforeEach(() => {
    silenceConsole();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe("requireAdmin", () => {
    it("returns 403 when the session user is not an admin", () => {
      const res = mockRes();
      const next = mockNext();

      adminCtrl.requireAdmin(mockReq({ session: { user: { role: "user" } } }), res, next);

      expect(res.statusCode).toBe(403);
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next for an admin", () => {
      const next = mockNext();
      adminCtrl.requireAdmin(adminReq(), mockRes(), next);
      expect(next).toHaveBeenCalledOnce();
    });
  });

  describe("updateUserAccess", () => {
    it("returns 400 when isAllowed is not a boolean", async () => {
      const res = mockRes();
      await adminCtrl.updateUserAccess(
        adminReq({ params: { userId: "2" }, body: { isAllowed: "yes" } }),
        res,
      );
      expect(res.statusCode).toBe(400);
    });

    it("returns 404 when the user does not exist", async () => {
      User.findByPk.mockResolvedValue(null);
      const res = mockRes();
      await adminCtrl.updateUserAccess(
        adminReq({ params: { userId: "99" }, body: { isAllowed: true } }),
        res,
      );
      expect(res.statusCode).toBe(404);
    });

    it("prevents an admin from revoking their own access", async () => {
      User.findByPk.mockResolvedValue(
        sequelizeRow({ userId: 1, username: "admin", isAllowed: true }),
      );
      const res = mockRes();

      await adminCtrl.updateUserAccess(
        adminReq({ params: { userId: "1" }, body: { isAllowed: false } }),
        res,
      );

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("Cannot revoke own access");
    });

    it("grants access to another user", async () => {
      const user = sequelizeRow({
        userId: 2,
        username: "ada",
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        isAllowed: false,
      });
      User.findByPk.mockResolvedValue(user);
      const res = mockRes();

      await adminCtrl.updateUserAccess(
        adminReq({ params: { userId: "2" }, body: { isAllowed: true } }),
        res,
      );

      expect(user.update).toHaveBeenCalledWith({ isAllowed: true });
      expect(res.body.success).toBe(true);
    });
  });

  describe("updateUserRole", () => {
    it("rejects roles other than admin or user", async () => {
      const res = mockRes();
      await adminCtrl.updateUserRole(
        adminReq({ params: { userId: "2" }, body: { role: "team_member" } }),
        res,
      );
      expect(res.statusCode).toBe(400);
    });

    it("prevents an admin from demoting themselves", async () => {
      User.findByPk.mockResolvedValue(sequelizeRow({ userId: 1, role: "admin" }));
      const res = mockRes();

      await adminCtrl.updateUserRole(
        adminReq({ params: { userId: "1" }, body: { role: "user" } }),
        res,
      );

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("Cannot change own role");
    });

    it("updates another user's role", async () => {
      const user = sequelizeRow({
        userId: 2,
        username: "ada",
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        role: "user",
      });
      User.findByPk.mockResolvedValue(user);
      const res = mockRes();

      await adminCtrl.updateUserRole(
        adminReq({ params: { userId: "2" }, body: { role: "admin" } }),
        res,
      );

      expect(user.update).toHaveBeenCalledWith({ role: "admin" });
      expect(res.body.success).toBe(true);
    });
  });

  describe("addUserByEmail", () => {
    it("returns 400 when email is missing", async () => {
      const res = mockRes();
      await adminCtrl.addUserByEmail(adminReq({ body: {} }), res);
      expect(res.statusCode).toBe(400);
    });

    it("returns 409 when the email already exists", async () => {
      User.findOne.mockResolvedValue(
        sequelizeRow({ userId: 2, email: "ada@example.com", username: "ada" }),
      );
      const res = mockRes();

      await adminCtrl.addUserByEmail(
        adminReq({ body: { email: "ada@example.com" } }),
        res,
      );

      expect(res.statusCode).toBe(409);
    });

    it("creates an allowed user from the email prefix", async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(
        sequelizeRow({
          userId: 3,
          email: "ada@example.com",
          username: "ada",
          firstName: "Ada",
          lastName: "Lovelace",
          role: "user",
          isAllowed: true,
        }),
      );
      const res = mockRes();

      await adminCtrl.addUserByEmail(
        adminReq({
          body: {
            email: "ada@example.com",
            firstName: "Ada",
            lastName: "Lovelace",
          },
        }),
        res,
      );

      expect(User.create).toHaveBeenCalledWith({
        email: "ada@example.com",
        firstName: "Ada",
        lastName: "Lovelace",
        username: "ada",
        role: "user",
        isAllowed: true,
      });
      expect(res.statusCode).toBe(201);
    });
  });

  describe("checkUserAccess", () => {
    it("returns 401 when there is no session", async () => {
      const res = mockRes();
      await adminCtrl.checkUserAccess(mockReq(), res);
      expect(res.statusCode).toBe(401);
      expect(res.body.isAllowed).toBe(false);
    });

    it("returns the user's current access flag", async () => {
      User.findByPk.mockResolvedValue({
        userId: 1,
        username: "ada",
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        role: "user",
        isAllowed: true,
      });
      const res = mockRes();

      await adminCtrl.checkUserAccess(adminReq(), res);

      expect(res.body.isAllowed).toBe(true);
      expect(res.body.user.email).toBe("ada@example.com");
    });
  });

  describe("bulkUpdateUserAccess", () => {
    it("returns 400 when updates is not an array", async () => {
      const res = mockRes();
      await adminCtrl.bulkUpdateUserAccess(
        adminReq({ body: { updates: { userId: 2 } } }),
        res,
      );
      expect(res.statusCode).toBe(400);
    });

    it("skips revoking the current admin and applies the rest", async () => {
      const other = sequelizeRow({ userId: 2, isAllowed: false });
      User.findByPk.mockImplementation(async (id) => {
        if (Number(id) === 1) return sequelizeRow({ userId: 1, isAllowed: true });
        if (Number(id) === 2) return other;
        return null;
      });
      const res = mockRes();

      await adminCtrl.bulkUpdateUserAccess(
        adminReq({
          body: {
            updates: [
              { userId: 1, isAllowed: false },
              { userId: 2, isAllowed: true },
            ],
          },
        }),
        res,
      );

      expect(other.update).toHaveBeenCalledWith({ isAllowed: true });
      expect(res.body.results).toEqual([
        { userId: 2, success: true, isAllowed: true },
      ]);
      expect(res.body.errors).toEqual([
        { userId: 1, error: "Cannot revoke own access" },
      ]);
    });
  });
});

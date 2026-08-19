import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  mockReq,
  mockRes,
  mockNext,
  silenceConsole,
} from "../test/httpMocks.js";

vi.mock("../model.js", () => ({
  User: {
    findByPk: vi.fn(),
  },
}));

import { User } from "../model.js";
import {
  requireAccess,
  requireAdmin,
  requireAdminOrOwner,
  checkUserPermission,
} from "./authMiddleware.js";

const allowedUser = {
  userId: 5,
  username: "ada",
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  role: "user",
  isAllowed: true,
};

describe("requireAccess", () => {
  beforeEach(() => {
    silenceConsole();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("returns 401 when there is no session user", async () => {
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    await requireAccess(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Authentication required");
    expect(next).not.toHaveBeenCalled();
    expect(User.findByPk).not.toHaveBeenCalled();
  });

  it("returns 404 when the session user is missing from the database", async () => {
    User.findByPk.mockResolvedValue(null);
    const req = mockReq({ session: { user: { userId: 5 } } });
    const res = mockRes();
    const next = mockNext();

    await requireAccess(req, res, next);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("User not found");
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 when the user is not allowed", async () => {
    User.findByPk.mockResolvedValue({ ...allowedUser, isAllowed: false });
    const req = mockReq({ session: { user: { userId: 5 } } });
    const res = mockRes();
    const next = mockNext();

    await requireAccess(req, res, next);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe("Access denied");
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches the user and calls next when access is allowed", async () => {
    User.findByPk.mockResolvedValue(allowedUser);
    const req = mockReq({ session: { user: { userId: 5 } } });
    const res = mockRes();
    const next = mockNext();

    await requireAccess(req, res, next);

    expect(req.user).toEqual(allowedUser);
    expect(next).toHaveBeenCalledOnce();
    expect(User.findByPk).toHaveBeenCalledWith(5, {
      attributes: [
        "userId",
        "username",
        "firstName",
        "lastName",
        "email",
        "role",
        "isAllowed",
      ],
    });
  });

  it("returns 500 when the database lookup throws", async () => {
    User.findByPk.mockRejectedValue(new Error("db down"));
    const req = mockReq({ session: { user: { userId: 5 } } });
    const res = mockRes();
    const next = mockNext();

    await requireAccess(req, res, next);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Authentication error");
    expect(next).not.toHaveBeenCalled();
  });
});

describe("requireAdmin", () => {
  it("returns 403 when the user is missing or not an admin", () => {
    const res = mockRes();
    const next = mockNext();

    requireAdmin(mockReq(), res, next);
    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();

    requireAdmin(mockReq({ user: { role: "user" } }), mockRes(), next);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next for an admin", () => {
    const next = mockNext();
    requireAdmin(mockReq({ user: { role: "admin" } }), mockRes(), next);
    expect(next).toHaveBeenCalledOnce();
  });
});

describe("requireAdminOrOwner", () => {
  it("returns 401 when there is no authenticated user", () => {
    const res = mockRes();
    const next = mockNext();

    requireAdminOrOwner(mockReq(), res, next);

    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("allows an admin to access another user's resource", () => {
    const next = mockNext();
    requireAdminOrOwner(
      mockReq({
        user: { userId: 1, role: "admin" },
        params: { userId: "99" },
      }),
      mockRes(),
      next,
    );
    expect(next).toHaveBeenCalledOnce();
  });

  it("allows the owner to access their own resource from params or body", () => {
    const next = mockNext();
    requireAdminOrOwner(
      mockReq({
        user: { userId: 5, role: "user" },
        params: { userId: "5" },
      }),
      mockRes(),
      next,
    );
    expect(next).toHaveBeenCalledOnce();

    next.mockClear();
    requireAdminOrOwner(
      mockReq({
        user: { userId: 5, role: "user" },
        body: { userId: "5" },
      }),
      mockRes(),
      next,
    );
    expect(next).toHaveBeenCalledOnce();
  });

  it("returns 403 when a non-admin accesses someone else's resource", () => {
    const res = mockRes();
    const next = mockNext();

    requireAdminOrOwner(
      mockReq({
        user: { userId: 5, role: "user" },
        params: { userId: "9" },
      }),
      res,
      next,
    );

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe("Access denied");
    expect(next).not.toHaveBeenCalled();
  });
});

describe("checkUserPermission", () => {
  it("returns 401 when there is no user", () => {
    const res = mockRes();
    const next = mockNext();

    checkUserPermission("read")(mockReq(), res, next);

    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("allows a regular user to read and write", () => {
    const next = mockNext();
    const req = mockReq({ user: { role: "user" } });

    checkUserPermission("read")(req, mockRes(), next);
    checkUserPermission("write")(req, mockRes(), next);

    expect(next).toHaveBeenCalledTimes(2);
  });

  it("blocks a regular user from delete and manage operations", () => {
    const res = mockRes();
    const next = mockNext();

    checkUserPermission("delete")(mockReq({ user: { role: "user" } }), res, next);

    expect(res.statusCode).toBe(403);
    expect(res.body.requiredPermission).toBe("delete");
    expect(next).not.toHaveBeenCalled();
  });

  it("allows an admin to manage users", () => {
    const next = mockNext();
    checkUserPermission("manage_users")(
      mockReq({ user: { role: "admin" } }),
      mockRes(),
      next,
    );
    expect(next).toHaveBeenCalledOnce();
  });
});

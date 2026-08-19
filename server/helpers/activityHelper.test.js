import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { silenceConsole } from "../test/httpMocks.js";

vi.mock("../model.js", async () => {
  const { createModelModuleMock } = await import("../test/httpMocks.js");
  return createModelModuleMock();
});

import {
  ActivityLog,
  ActivityReaders,
  CaseAssignees,
  TaskAssignees,
  CasePerson,
  Case,
} from "../model.js";
import {
  capitalize,
  spaceOut,
  format,
  createActivityLog,
  ACTIVITY_ACTIONS,
} from "./activityHelper.js";

describe("activityHelper string helpers", () => {
  it("capitalizes each word", () => {
    expect(capitalize("hello world")).toBe("Hello World");
  });

  it("spaces out camelCase and special-cases dob", () => {
    expect(spaceOut("firstName")).toBe("first name");
    expect(spaceOut("dob")).toBe("date of birth");
  });

  it("formats camelCase labels", () => {
    expect(format("phoneNumber")).toBe("Phone Number");
    expect(format("dob")).toBe("Date of Birth");
  });

  it("exposes stable activity action names", () => {
    expect(ACTIVITY_ACTIONS.PERSON_CREATED).toBe("person_created");
    expect(ACTIVITY_ACTIONS.CASE_ARCHIVED).toBe("case_archived");
  });
});

describe("createActivityLog", () => {
  beforeEach(() => {
    silenceConsole();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("notifies the provided custom reader ids", async () => {
    ActivityLog.create.mockResolvedValue({ activityId: 10 });

    await createActivityLog({
      authorId: 1,
      objectType: "case",
      objectId: 5,
      action: ACTIVITY_ACTIONS.CASE_UPDATED,
      details: "updated title",
      customReaderIds: [2, 3],
    });

    expect(ActivityReaders.bulkCreate).toHaveBeenCalledWith([
      { activityId: 10, userId: 2, isRead: false },
      { activityId: 10, userId: 3, isRead: false },
    ]);
    expect(CaseAssignees.findAll).not.toHaveBeenCalled();
  });

  it("notifies case assignees when no custom readers are given", async () => {
    ActivityLog.create.mockResolvedValue({ activityId: 10 });
    CaseAssignees.findAll.mockResolvedValue([{ userId: 2 }, { userId: 4 }]);

    await createActivityLog({
      authorId: 1,
      objectType: "case",
      objectId: 5,
      action: ACTIVITY_ACTIONS.CASE_UPDATED,
      details: "updated title",
    });

    expect(CaseAssignees.findAll).toHaveBeenCalledWith({
      where: { caseId: 5 },
      attributes: ["userId"],
    });
    expect(ActivityReaders.bulkCreate).toHaveBeenCalledWith([
      { activityId: 10, userId: 2, isRead: false },
      { activityId: 10, userId: 4, isRead: false },
    ]);
  });

  it("notifies task assignees", async () => {
    ActivityLog.create.mockResolvedValue({ activityId: 11 });
    TaskAssignees.findAll.mockResolvedValue([{ userId: 8 }]);

    await createActivityLog({
      authorId: 1,
      objectType: "task",
      objectId: 3,
      action: ACTIVITY_ACTIONS.TASK_UPDATED,
      details: "updated status",
    });

    expect(TaskAssignees.findAll).toHaveBeenCalledWith({
      where: { taskId: 3 },
      attributes: ["userId"],
    });
    expect(ActivityReaders.bulkCreate).toHaveBeenCalledWith([
      { activityId: 11, userId: 8, isRead: false },
    ]);
  });

  it("notifies case assignees and the case owner for person activity", async () => {
    ActivityLog.create.mockResolvedValue({ activityId: 12 });
    CasePerson.findAll.mockResolvedValue([{ caseId: 9 }]);
    CaseAssignees.findAll.mockResolvedValue([{ userId: 2 }]);
    Case.findByPk.mockResolvedValue({ ownerId: 1 });

    await createActivityLog({
      authorId: 2,
      objectType: "person",
      objectId: 4,
      action: ACTIVITY_ACTIONS.PERSON_UPDATED,
      details: "updated city",
    });

    expect(ActivityReaders.bulkCreate).toHaveBeenCalledWith([
      { activityId: 12, userId: 2, isRead: false },
      { activityId: 12, userId: 1, isRead: false },
    ]);
  });

  it("skips reader rows when nobody should be notified", async () => {
    ActivityLog.create.mockResolvedValue({ activityId: 10 });
    CaseAssignees.findAll.mockResolvedValue([]);

    await createActivityLog({
      authorId: 1,
      objectType: "case",
      objectId: 5,
      action: ACTIVITY_ACTIONS.CASE_UPDATED,
      details: "updated title",
    });

    expect(ActivityReaders.bulkCreate).not.toHaveBeenCalled();
  });
});

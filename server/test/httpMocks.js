import { vi } from "vitest";

export const mockReq = (overrides = {}) => ({
  session: {},
  params: {},
  body: {},
  user: undefined,
  ...overrides,
});

export const mockRes = () => {
  const res = {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    send(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
};

export const mockNext = () => vi.fn();

export const sequelizeRow = (data = {}) => {
  const row = {
    ...data,
    update: vi.fn(async (patch) => {
      Object.assign(data, patch);
      Object.assign(row, patch);
      return row;
    }),
    destroy: vi.fn(async () => {}),
    toJSON() {
      return { ...data };
    },
  };
  return row;
};

export const silenceConsole = () => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
};

export const createSequelizeModelMock = () => ({
  findAll: vi.fn(),
  findOne: vi.fn(),
  findByPk: vi.fn(),
  create: vi.fn(),
  count: vi.fn(),
  findOrCreate: vi.fn(),
  bulkCreate: vi.fn(),
});

export const createModelModuleMock = () => ({
  Case: createSequelizeModelMock(),
  User: createSequelizeModelMock(),
  Person: createSequelizeModelMock(),
  Task: createSequelizeModelMock(),
  TimeEntry: createSequelizeModelMock(),
  Invoice: createSequelizeModelMock(),
  UserSettings: createSequelizeModelMock(),
  CustomCharge: createSequelizeModelMock(),
  EntryService: createSequelizeModelMock(),
  Rate: createSequelizeModelMock(),
  Payment: createSequelizeModelMock(),
  CasePerson: createSequelizeModelMock(),
  AllowedEmails: createSequelizeModelMock(),
  ActivityLog: createSequelizeModelMock(),
  ActivityReaders: createSequelizeModelMock(),
  CaseAssignees: createSequelizeModelMock(),
  TaskAssignees: createSequelizeModelMock(),
  Notification: createSequelizeModelMock(),
});

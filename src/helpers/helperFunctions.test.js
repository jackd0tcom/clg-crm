import { describe, it, expect, vi, afterEach } from "vitest";
import {
  getDuration,
  getRoundedDuration,
  getDurationFromNumber,
  getDurationNumber,
  getAmountOfEntry,
  getRoundedAmountOfEntry,
  formatDollarNoCents,
  buildFilters,
  getInvoiceStatementItems,
  getInvoiceStatementItemFromInvoice,
} from "./helperFunctions.jsx";

const timedEntry = (startTime, endTime, extras = {}) => ({
  startTime,
  endTime,
  ...extras,
});

const sevenMinutes = timedEntry(
  "2026-08-18T10:00:00.000Z",
  "2026-08-18T10:07:00.000Z",
);

const sixtyMinutes = timedEntry(
  "2026-08-18T10:00:00.000Z",
  "2026-08-18T11:00:00.000Z",
);

describe("getDuration", () => {
  it("formats under an hour as 0:MM:SS", () => {
    expect(getDuration(sevenMinutes)).toBe("0:07:00");
  });

  it("formats hours without padding", () => {
    expect(
      getDuration(
        timedEntry("2026-08-18T10:00:00.000Z", "2026-08-18T11:05:03.000Z"),
      ),
    ).toBe("1:05:03");
  });

  it("formats zero duration", () => {
    expect(
      getDuration(
        timedEntry("2026-08-18T10:00:00.000Z", "2026-08-18T10:00:00.000Z"),
      ),
    ).toBe("0:00:00");
  });
});

describe("getRoundedDuration", () => {
  it("does not round when rounding is 0", () => {
    expect(getRoundedDuration(sevenMinutes, 0)).toBe("0:07:00");
  });

  it("rounds 7 minutes up to 12 at a 6-minute increment", () => {
    expect(getRoundedDuration(sevenMinutes, 6)).toBe("0:12:00");
  });

  it("keeps an exact multiple unchanged", () => {
    expect(
      getRoundedDuration(
        timedEntry("2026-08-18T10:00:00.000Z", "2026-08-18T10:06:00.000Z"),
        6,
      ),
    ).toBe("0:06:00");
  });

  it("rounds 7 minutes up to 15 at a 15-minute increment", () => {
    expect(getRoundedDuration(sevenMinutes, 15)).toBe("0:15:00");
  });

  it("does not round a zero-length entry", () => {
    expect(
      getRoundedDuration(
        timedEntry("2026-08-18T10:00:00.000Z", "2026-08-18T10:00:00.000Z"),
        6,
      ),
    ).toBe("0:00:00");
  });
});

describe("getDurationNumber / getDurationFromNumber", () => {
  it("returns duration in seconds", () => {
    expect(getDurationNumber(sevenMinutes)).toBe(420);
    expect(getDurationNumber(sixtyMinutes)).toBe(3600);
  });

  it("formats seconds back into H:MM:SS", () => {
    expect(getDurationFromNumber(420)).toBe("0:07:00");
    expect(getDurationFromNumber(3903)).toBe("1:05:03");
  });
});

describe("getAmountOfEntry", () => {
  it("bills 60 minutes at $300/hr as $300", () => {
    expect(getAmountOfEntry(300, sixtyMinutes)).toBe(300);
  });

  it("bills 7 minutes at $300/hr as $35", () => {
    expect(getAmountOfEntry(300, sevenMinutes)).toBe(35);
  });

  it("floors fractional dollars", () => {
    // 1 minute at $250/hr = 250/60 = 4.166..., floored to 4
    expect(
      getAmountOfEntry(
        250,
        timedEntry("2026-08-18T10:00:00.000Z", "2026-08-18T10:01:00.000Z"),
      ),
    ).toBe(4);
  });

  it("returns 0 when the rate is 0", () => {
    expect(getAmountOfEntry(0, sixtyMinutes)).toBe(0);
  });
});

describe("getRoundedAmountOfEntry", () => {
  it("matches unrounded amount when rounding is 0", () => {
    expect(getRoundedAmountOfEntry(300, sevenMinutes, 0)).toBe(35);
  });

  it("rounds 7 minutes up to 12 at $300/hr ($60)", () => {
    expect(getRoundedAmountOfEntry(300, sevenMinutes, 6)).toBe(60);
  });

  it("keeps an exact 6-minute increment unchanged", () => {
    expect(
      getRoundedAmountOfEntry(
        300,
        timedEntry("2026-08-18T10:00:00.000Z", "2026-08-18T10:06:00.000Z"),
        6,
      ),
    ).toBe(30);
  });

  it("rounds 7 minutes up to 15 at $300/hr ($75)", () => {
    expect(getRoundedAmountOfEntry(300, sevenMinutes, 15)).toBe(75);
  });
});

describe("formatDollarNoCents", () => {
  it("formats whole USD amounts without cents", () => {
    expect(formatDollarNoCents(0)).toBe("$0");
    expect(formatDollarNoCents(1234)).toBe("$1,234");
  });
});

describe("buildFilters", () => {
  const payments = [
    { personId: 1, person: { firstName: "Ada" }, description: "Retainer Payment" },
    { personId: 1, person: { firstName: "Ada" }, description: "Retainer Payment" },
    { personId: 2, person: { firstName: "Lin" }, description: "Invoice Payment" },
    { personId: 3, person: { firstName: "Kai" }, description: "INV-104" },
    { personId: 4, person: { firstName: "Noe" }, description: "INV-105" },
  ];

  it("builds unique options from dotted paths", () => {
    expect(buildFilters(payments, "personId", "person.firstName")).toEqual([
      { id: 1, title: "Ada" },
      { id: 2, title: "Lin" },
      { id: 3, title: "Kai" },
      { id: 4, title: "Noe" },
    ]);
  });

  it("supports a title getter function", () => {
    expect(
      buildFilters(payments.slice(0, 2), "personId", (p) =>
        p.person.firstName.toUpperCase(),
      ),
    ).toEqual([{ id: 1, title: "ADA" }]);
  });

  it("groups non-retainer/invoice-payment descriptions as Invoice", () => {
    expect(buildFilters(payments, "description", "description")).toEqual([
      { id: "Retainer Payment", title: "Retainer Payment" },
      { id: "Invoice Payment", title: "Invoice Payment" },
      { id: "invoice", title: "Invoice" },
    ]);
  });
});

describe("getInvoiceStatementItems", () => {
  const hourAt300 = {
    startTime: "2026-08-18T10:00:00.000Z",
    endTime: "2026-08-18T11:00:00.000Z",
    rate: { rate: 300 },
  };

  it("rolls time entries and custom charges onto the same invoice", () => {
    const items = getInvoiceStatementItems(
      [
        {
          ...hourAt300,
          invoiceId: 10,
          invoice: { invoiceTitle: "INV-10", createdAt: "2026-08-01" },
        },
        {
          ...hourAt300,
          invoiceId: 10,
          invoice: { invoiceTitle: "INV-10", createdAt: "2026-08-01" },
        },
        { ...hourAt300 },
      ],
      [
        {
          invoiceId: 10,
          amount: 50,
          invoice: { invoiceTitle: "INV-10", createdAt: "2026-08-01" },
        },
      ],
    );

    expect(items).toEqual([
      {
        invoiceId: 10,
        title: "INV-10",
        amount: 650,
        createdAt: "2026-08-01",
        description: "Invoice",
      },
    ]);
  });

  it("creates an invoice item from charges when there are no matching entries", () => {
    const items = getInvoiceStatementItems([], [
      {
        invoiceId: 22,
        amount: 100,
        createdAt: "2026-08-02",
        invoice: { invoiceTitle: "INV-22", createdAt: "2026-08-03" },
      },
    ]);

    expect(items).toEqual([
      {
        invoiceId: 22,
        title: "INV-22",
        amount: 100,
        createdAt: "2026-08-03",
        description: "Invoice",
      },
    ]);
  });

  it("skips entries and charges without an invoiceId", () => {
    expect(
      getInvoiceStatementItems([{ ...hourAt300 }], [{ amount: 25 }]),
    ).toEqual([]);
  });

  it("treats a missing rate as 0", () => {
    const items = getInvoiceStatementItems([
      {
        ...hourAt300,
        rate: undefined,
        invoiceId: 1,
        invoice: { invoiceTitle: "INV-1", createdAt: "2026-08-01" },
      },
    ]);

    expect(items[0].amount).toBe(0);
  });
});

describe("getInvoiceStatementItemFromInvoice", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const hourAt300 = {
    startTime: "2026-08-18T10:00:00.000Z",
    endTime: "2026-08-18T11:00:00.000Z",
    rate: { rate: 300 },
  };

  it("sums custom charges and time entries and uses the billable person", () => {
    vi.spyOn(console, "log").mockImplementation(() => {});

    const [item] = getInvoiceStatementItemFromInvoice([
      {
        invoiceId: 8,
        invoiceTitle: "August invoice",
        createdAt: "2026-08-10",
        customCharges: [{ amount: 40 }, { amount: 10 }],
        timeEntries: [hourAt300, hourAt300],
        case: { billablePerson: { firstName: "Ada", lastName: "Lovelace" } },
      },
    ]);

    expect(item).toEqual({
      createdAt: "2026-08-10",
      title: "August invoice",
      invoiceId: 8,
      description: "August invoice",
      person: { firstName: "Ada", lastName: "Lovelace" },
      amount: 650,
      paidDate: "2026-08-10",
    });
  });

  it("uses a fallback person when the case has no billable contact", () => {
    vi.spyOn(console, "log").mockImplementation(() => {});

    const [item] = getInvoiceStatementItemFromInvoice([
      {
        invoiceId: 9,
        invoiceTitle: "Empty case",
        createdAt: "2026-08-11",
        customCharges: [],
        timeEntries: [],
        case: {},
      },
    ]);

    expect(item.amount).toBe(0);
    expect(item.person).toEqual({ firstName: "No billable client" });
  });
});

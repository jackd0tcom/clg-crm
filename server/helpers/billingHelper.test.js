import { describe, it, expect, vi } from "vitest";
import {
  getPersonType,
  flattenCasePerson,
  flattenCasePeople,
  formatBillTo,
  resolveBillablePerson,
  serializeCaseBilling,
  serializeInvoiceBilling,
  getInvoiceBillingSnapshot,
  ensureCaseBillableContact,
} from "./billingHelper.js";

const ada = {
  personId: 1,
  firstName: "Ada",
  lastName: "Lovelace",
  type: "client",
  address: "123 Main St",
  city: "London",
  state: "UK",
  zip: "SW1A",
  phoneNumber: "555-0100",
};

const opposing = {
  personId: 2,
  firstName: "Opposing",
  lastName: "Counsel",
  type: "opposing",
};

const nestedWitness = {
  personId: 3,
  firstName: "Ada",
  lastName: "Witness",
  casePerson: { type: "witness" },
};

describe("getPersonType", () => {
  it("reads type from the person or nested casePerson", () => {
    expect(getPersonType(ada)).toBe("client");
    expect(getPersonType(nestedWitness)).toBe("witness");
    expect(getPersonType(undefined)).toBeNull();
  });
});

describe("flattenCasePerson / flattenCasePeople", () => {
  it("lifts casePerson.type onto the person and drops the nested object", () => {
    expect(flattenCasePerson(nestedWitness)).toEqual({
      personId: 3,
      firstName: "Ada",
      lastName: "Witness",
      type: "witness",
    });
  });

  it("uses toJSON when the value is a Sequelize instance", () => {
    const instance = {
      toJSON: () => nestedWitness,
    };

    expect(flattenCasePerson(instance).type).toBe("witness");
  });

  it("returns null for a missing person and filters nulls from lists", () => {
    expect(flattenCasePerson(null)).toBeNull();
    expect(flattenCasePeople([nestedWitness, null])).toEqual([
      {
        personId: 3,
        firstName: "Ada",
        lastName: "Witness",
        type: "witness",
      },
    ]);
  });
});

describe("formatBillTo", () => {
  it("formats name, address, and phone", () => {
    expect(formatBillTo(ada)).toBe(
      "Ada Lovelace\n123 Main St London, UK SW1A\n555-0100",
    );
  });

  it("returns an empty string when there is no person", () => {
    expect(formatBillTo(null)).toBe("");
  });
});

describe("resolveBillablePerson", () => {
  it("returns null when there is no case", () => {
    expect(resolveBillablePerson(null)).toBeNull();
  });

  it("uses and flattens cas.billablePerson", () => {
    expect(
      resolveBillablePerson({
        billablePerson: nestedWitness,
        people: [ada],
      }),
    ).toEqual({
      personId: 3,
      firstName: "Ada",
      lastName: "Witness",
      type: "witness",
    });
  });

  it("matches billableContact against flattened people", () => {
    expect(
      resolveBillablePerson({
        billableContact: 1,
        people: [opposing, ada],
      }),
    ).toEqual(ada);
  });

  it("falls back to the first client, then the first person", () => {
    expect(resolveBillablePerson({ people: [opposing, ada] })).toEqual(ada);
    expect(resolveBillablePerson({ people: [opposing] })).toEqual(opposing);
  });
});

describe("serializeCaseBilling", () => {
  it("flattens people and fills billableContact from the resolved person", () => {
    const result = serializeCaseBilling({
      caseId: 9,
      people: [nestedWitness, ada],
    });

    expect(result.people).toEqual([
      {
        personId: 3,
        firstName: "Ada",
        lastName: "Witness",
        type: "witness",
      },
      ada,
    ]);
    expect(result.billablePerson).toEqual(ada);
    expect(result.billableContact).toBe(1);
  });

  it("keeps an existing billableContact even if people order differs", () => {
    const result = serializeCaseBilling({
      caseId: 9,
      billableContact: 2,
      people: [ada, opposing],
    });

    expect(result.billablePerson).toEqual(opposing);
    expect(result.billableContact).toBe(2);
  });

  it("returns the original value when the case is missing", () => {
    expect(serializeCaseBilling(null)).toBeNull();
  });
});

describe("serializeInvoiceBilling", () => {
  it("prefers the invoice person and fills personId", () => {
    const result = serializeInvoiceBilling({
      invoiceId: 4,
      case: { people: [ada] },
      person: opposing,
    });

    expect(result.person).toEqual(opposing);
    expect(result.personId).toBe(2);
    expect(result.case.billablePerson).toEqual(ada);
  });

  it("falls back to the case billable person", () => {
    const result = serializeInvoiceBilling({
      invoiceId: 5,
      case: { people: [ada] },
    });

    expect(result.person).toEqual(ada);
    expect(result.personId).toBe(1);
  });
});

describe("getInvoiceBillingSnapshot", () => {
  it("returns the billable person, personId, and formatted bill-to block", () => {
    expect(getInvoiceBillingSnapshot({ billablePerson: ada })).toEqual({
      personId: 1,
      billTo: "Ada Lovelace\n123 Main St London, UK SW1A\n555-0100",
      person: ada,
    });
  });

  it("returns nulls when the case has no people", () => {
    expect(getInvoiceBillingSnapshot({})).toEqual({
      personId: null,
      billTo: "",
      person: null,
    });
  });
});

describe("ensureCaseBillableContact", () => {
  it("returns the existing billableContact without updating", async () => {
    const caseInstance = {
      billableContact: 1,
      update: vi.fn(),
    };

    await expect(ensureCaseBillableContact(caseInstance)).resolves.toBe(1);
    expect(caseInstance.update).not.toHaveBeenCalled();
  });

  it("sets billableContact to the first client", async () => {
    const caseInstance = {
      billableContact: null,
      update: vi.fn(),
    };

    await expect(
      ensureCaseBillableContact(caseInstance, [opposing, nestedWitness, ada]),
    ).resolves.toBe(1);
    expect(caseInstance.update).toHaveBeenCalledWith({ billableContact: 1 });
  });

  it("falls back to the first person when nobody is a client", async () => {
    const caseInstance = {
      billableContact: null,
      update: vi.fn(),
    };

    await expect(
      ensureCaseBillableContact(caseInstance, [opposing]),
    ).resolves.toBe(2);
    expect(caseInstance.update).toHaveBeenCalledWith({ billableContact: 2 });
  });

  it("returns null when there is no case or no people", async () => {
    await expect(ensureCaseBillableContact(null)).resolves.toBeNull();

    const caseInstance = { billableContact: null, update: vi.fn() };
    await expect(ensureCaseBillableContact(caseInstance, [])).resolves.toBeNull();
    expect(caseInstance.update).not.toHaveBeenCalled();
  });
});

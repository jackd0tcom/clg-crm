import { describe, it, expect } from "vitest";
import {
  getPersonType,
  formatBillTo,
  resolveBillablePerson,
  getClientPeople,
} from "./billingHelpers.js";

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

const witness = {
  personId: 3,
  firstName: "Ada",
  lastName: "Witness",
  casePerson: { type: "witness" },
};

describe("getPersonType", () => {
  it("reads type from the person", () => {
    expect(getPersonType(ada)).toBe("client");
  });

  it("falls back to nested casePerson.type", () => {
    expect(getPersonType(witness)).toBe("witness");
  });

  it("prefers person.type over casePerson.type", () => {
    expect(
      getPersonType({ type: "client", casePerson: { type: "witness" } }),
    ).toBe("client");
  });

  it("returns null when neither type is present", () => {
    expect(getPersonType({})).toBeNull();
    expect(getPersonType(undefined)).toBeNull();
  });
});

describe("formatBillTo", () => {
  it("returns an empty string when there is no person", () => {
    expect(formatBillTo(null)).toBe("");
    expect(formatBillTo(undefined)).toBe("");
  });

  it("formats name, address, and phone on separate lines", () => {
    expect(formatBillTo(ada)).toBe(
      "Ada Lovelace\n123 Main St London, UK SW1A\n555-0100",
    );
  });

  it("omits missing address pieces without extra spaces", () => {
    expect(
      formatBillTo({
        firstName: "Ada",
        lastName: "Lovelace",
        city: "London",
        phoneNumber: "555-0100",
      }),
    ).toBe("Ada Lovelace\nLondon\n555-0100");
  });

  it("returns only the name when there is no address or phone", () => {
    expect(formatBillTo({ firstName: "Ada", lastName: "Lovelace" })).toBe(
      "Ada Lovelace",
    );
  });
});

describe("resolveBillablePerson", () => {
  const cas = {
    billableContact: 1,
    billablePerson: ada,
    people: [opposing, ada, witness],
  };

  it("prefers the person already stored on the invoice", () => {
    expect(resolveBillablePerson(cas, { person: opposing })).toEqual(opposing);
  });

  it("uses the case billablePerson next", () => {
    expect(resolveBillablePerson(cas)).toEqual(ada);
  });

  it("matches billableContact against the people list", () => {
    expect(
      resolveBillablePerson({
        billableContact: 1,
        people: [opposing, ada],
      }),
    ).toEqual(ada);
  });

  it("falls back to the first client", () => {
    expect(resolveBillablePerson({ people: [opposing, ada] })).toEqual(ada);
  });

  it("falls back to the first person when nobody is a client", () => {
    expect(resolveBillablePerson({ people: [opposing, witness] })).toEqual(
      opposing,
    );
  });

  it("returns null when the case has no people", () => {
    expect(resolveBillablePerson({})).toBeNull();
    expect(resolveBillablePerson(null)).toBeNull();
  });
});

describe("getClientPeople", () => {
  it("returns only clients when the case has clients", () => {
    expect(getClientPeople([opposing, ada, witness])).toEqual([ada]);
  });

  it("returns everyone when there are no clients", () => {
    expect(getClientPeople([opposing, witness])).toEqual([opposing, witness]);
  });

  it("prepends a billable person who is not already in the list", () => {
    expect(getClientPeople([opposing], ada)).toEqual([ada, opposing]);
  });

  it("does not duplicate a billable person already in the list", () => {
    expect(getClientPeople([ada, opposing], ada)).toEqual([ada]);
  });

  it("treats a missing people array as empty", () => {
    expect(getClientPeople(undefined, ada)).toEqual([ada]);
  });
});

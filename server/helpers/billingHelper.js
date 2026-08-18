export const getPersonType = (person) =>
  person?.type ?? person?.casePerson?.type ?? null;

export const flattenCasePerson = (person) => {
  if (!person) return null;
  const json = person.toJSON?.() ?? person;
  const type = getPersonType(json);
  const { casePerson, ...rest } = json;
  return { ...rest, type };
};

export const flattenCasePeople = (people = []) =>
  (people ?? []).map(flattenCasePerson).filter(Boolean);

export const formatBillTo = (person) => {
  if (!person) return "";
  const name = `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim();
  const cityState = [person.city, person.state].filter(Boolean).join(", ");
  const addressLine = [person.address, cityState, person.zip]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  const phone = person.phoneNumber ?? "";
  return [name, addressLine, phone].filter(Boolean).join("\n");
};

export const resolveBillablePerson = (cas) => {
  if (!cas) return null;
  if (cas.billablePerson) return flattenCasePerson(cas.billablePerson);
  const people = flattenCasePeople(cas.people);
  if (cas.billableContact) {
    const match = people.find((p) => p.personId === cas.billableContact);
    if (match) return match;
  }
  const clients = people.filter((p) => p.type === "client");
  return clients[0] ?? people[0] ?? null;
};

export const serializeCaseBilling = (casJson) => {
  if (!casJson) return casJson;
  const people = flattenCasePeople(casJson.people);
  const billablePerson =
    flattenCasePerson(casJson.billablePerson) ??
    people.find((p) => p.personId === casJson.billableContact) ??
    people.find((p) => p.type === "client") ??
    people[0] ??
    null;
  return {
    ...casJson,
    people,
    billableContact:
      casJson.billableContact ?? billablePerson?.personId ?? null,
    billablePerson,
  };
};

export const serializeInvoiceBilling = (invoiceJson) => {
  if (!invoiceJson) return invoiceJson;
  const cas = serializeCaseBilling(invoiceJson.case);
  const person =
    flattenCasePerson(invoiceJson.person) ?? cas?.billablePerson ?? null;
  return {
    ...invoiceJson,
    case: cas,
    person,
    personId: invoiceJson.personId ?? person?.personId ?? null,
  };
};

export const getInvoiceBillingSnapshot = (cas) => {
  const person = resolveBillablePerson(cas);
  return {
    personId: person?.personId ?? null,
    billTo: formatBillTo(person),
    person,
  };
};

export const ensureCaseBillableContact = async (caseInstance, people) => {
  if (!caseInstance) return null;
  if (caseInstance.billableContact) return caseInstance.billableContact;

  const flattened = flattenCasePeople(people ?? caseInstance.people ?? []);
  const fallback =
    flattened.find((p) => p.type === "client") ?? flattened[0] ?? null;
  if (!fallback) return null;

  await caseInstance.update({ billableContact: fallback.personId });
  return fallback.personId;
};

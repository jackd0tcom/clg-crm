export const getPersonType = (person) =>
  person?.type ?? person?.casePerson?.type ?? null;

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

export const resolveBillablePerson = (cas, invoice) => {
  if (invoice?.person) return invoice.person;
  if (cas?.billablePerson) return cas.billablePerson;
  const people = cas?.people ?? [];
  if (cas?.billableContact) {
    const match = people.find((p) => p.personId === cas.billableContact);
    if (match) return match;
  }
  const clients = people.filter((p) => getPersonType(p) === "client");
  return clients[0] ?? people[0] ?? null;
};

export const getClientPeople = (people = [], billablePerson = null) => {
  const list = people ?? [];
  const clients = list.filter((p) => getPersonType(p) === "client");
  const base = clients.length ? clients : list;
  if (
    billablePerson &&
    !base.some((p) => p.personId === billablePerson.personId)
  ) {
    return [billablePerson, ...base];
  }
  return base;
};

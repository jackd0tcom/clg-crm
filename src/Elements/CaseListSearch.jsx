import { useState, useEffect } from "react";

const CaseListSearch = ({
  cases,
  setCases,
  originalCases,
  setOriginalCases,
  showArchived,
}) => {
  const [search, setSearch] = useState("");

  // Filter cases based on search term
  useEffect(() => {
    if (!originalCases) return;

    if (search.trim() === "") {
      // If search is empty, restore to the current filtered state
      const filteredCases = showArchived
        ? originalCases.filter((a) => a.isArchived)
        : originalCases.filter((a) => !a.isArchived);
      setCases(filteredCases);
    } else {
      // Filter cases based on search term, but respect current archive filter
      const baseFilteredCases = showArchived
        ? originalCases.filter((a) => a.isArchived)
        : originalCases.filter((a) => !a.isArchived);

      const searchFilteredCases = baseFilteredCases.filter((caseItem) => {
        const searchTerm = search.toLowerCase();

        // Search in title
        if (caseItem.title?.toLowerCase().includes(searchTerm)) return true;

        // Search in client name
        if (caseItem.clientName?.toLowerCase().includes(searchTerm))
          return true;

        // Search in practice areas
        if (
          caseItem.practiceAreas?.some((area) =>
            area.name.toLowerCase().includes(searchTerm)
          )
        )
          return true;

        // Search in people names
        if (
          caseItem.people?.some((person) =>
            `${person.firstName} ${person.lastName}`
              .toLowerCase()
              .includes(searchTerm)
          )
        )
          return true;

        return false;
      });

      setCases(searchFilteredCases);
    }
  }, [search, originalCases, setCases, showArchived]);

  return (
    <div className="case-list-search">
      <input
        type="text"
        placeholder="Search"
        value={search}
        name="case-list-search"
        id="case-list-search"
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />
    </div>
  );
};

export default CaseListSearch;

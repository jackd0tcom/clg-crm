import { useState, useEffect } from "react";

const CaseListSearch = ({ cases, setCases, originalCases, setOriginalCases }) => {
  const [search, setSearch] = useState("");

  // Filter cases based on search term
  useEffect(() => {
    if (!originalCases) return;
    
    if (search.trim() === "") {
      // If search is empty, restore original cases
      setCases([...originalCases]);
    } else {
      // Filter cases based on search term
      const filteredCases = originalCases.filter((caseItem) => {
        const searchTerm = search.toLowerCase();
        
        // Search in title
        if (caseItem.title?.toLowerCase().includes(searchTerm)) return true;
        
        // Search in client name
        if (caseItem.clientName?.toLowerCase().includes(searchTerm)) return true;
        
        // Search in practice areas
        if (caseItem.practiceAreas?.some(area => 
          area.name.toLowerCase().includes(searchTerm)
        )) return true;
        
        // Search in people names
        if (caseItem.people?.some(person => 
          `${person.firstName} ${person.lastName}`.toLowerCase().includes(searchTerm)
        )) return true;
        
        return false;
      });
      
      setCases(filteredCases);
    }
  }, [search, originalCases, setCases]);

  return (
    <div className="case-list-search">
      <input
        type="text"
        placeholder="Search cases, clients, practice areas..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />
    </div>
  );
};

export default CaseListSearch;
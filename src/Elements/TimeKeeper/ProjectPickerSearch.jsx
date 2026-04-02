import { useState, useEffect, useRef } from "react";

const ProjectPickerSearch = ({
  originalData,
  filteredData,
  setFilteredData,
}) => {
  const [search, setSearch] = useState("");
  const originalDataRef = useRef(originalData);

  // Update ref when originalData changes
  useEffect(() => {
    originalDataRef.current = originalData;
  }, [originalData]);

  // Filter cases and tasks based on search term
  useEffect(() => {
    const data = originalDataRef.current;
    if (!data) return;

    if (search.trim() === "") {
      // If search is empty, restore to original data
      setFilteredData(data);
    } else {
      const searchTerm = search.toLowerCase();

      // Filter cases: include case if case title matches OR any task title matches
      const searchFilteredCases = data.filter((caseItem) => {
        // Search in case title
        if (caseItem.title?.toLowerCase().includes(searchTerm)) {
          return true;
        }

        // Search in task titles - if any task matches, include the entire case
        if (
          caseItem.tasks?.some((task) =>
            task.title?.toLowerCase().includes(searchTerm),
          )
        ) {
          return true;
        }

        return false;
      });

      setFilteredData(searchFilteredCases);
    }
  }, [search, setFilteredData]);

  return (
    <div className="project-picker-search">
      <input
        type="text"
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
};
export default ProjectPickerSearch;

import { useState, useEffect } from "react";

const CaseListSearch = ({ search, setSearch }) => {
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

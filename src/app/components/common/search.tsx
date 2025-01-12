// src/components/Search.tsx
import React from "react";

interface SearchProps {
  searchTerm: string;
  onSearch: (term: string) => void;
}

const Search: React.FC<SearchProps> = ({ searchTerm, onSearch }) => {
  return (
    <div className="flex justify-center mt-4">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search..."
        className="px-4 py-2 border rounded w-3/4 m-4"
      />
    </div>
  );
};

export default Search;

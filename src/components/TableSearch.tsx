"use client";

import Image from "next/image";
import { useState } from "react";

interface TableSearchProps {
  onSearch?: (value: string) => void;
}

const TableSearch = ({ onSearch }: TableSearchProps) => {
  const [searchValue, setSearchValue] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = (e.currentTarget[0] as HTMLInputElement).value;
    
    if (onSearch) {
      onSearch(value);
    } else {
      // Fallback to URL params for backward compatibility
      const params = new URLSearchParams(window.location.search);
      params.set("search", value);
      window.history.pushState({}, '', `${window.location.pathname}?${params}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full md:w-auto flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2"
    >
      <Image src="/search.png" alt="" width={14} height={14} />
      <input
        type="text"
        placeholder="Search..."
        value={searchValue}
        onChange={handleInputChange}
        className="w-[200px] p-2 bg-transparent outline-none"
      />
    </form>
  );
};

export default TableSearch;

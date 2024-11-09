"use client";
import { createContext, useState, useContext } from "react";
import { useRouter } from "next/navigation";

const priceRanges = [
  { min: 0, max: 500000, label: "Under 500.000 VND" },
  { min: 500000, max: 1000000, label: "500.000 VND - 1.000.000 VND" },
  { min: 1000000, max: 5000000, label: "1.000.000 VND - 5.000.000 VND" },
  { min: 5000000, max: 10000000, label: "5.000.000 VND - 10.000.000 VND" },
  { min: 10000000, max: 20000000, label: "10.000.000 VND - 20.000.000 VND" },
  { min: 20000000, max: 50000000, label: " 20.000.000 VND - 50.000.000 VND " },
];

export const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [filterQuery, setFilterQuery] = useState("");
  const [filterResults, setFilterResults] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);

  const router = useRouter();

  const fetchFilterResults = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.API}/product/filter?filterQuery=${filterQuery}`
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setFilterResults(data);
      router.push(`/filter?filterQuery=${filterQuery}`);
    } catch (error) {
      console.error("Error fetching filter results:", error);
    }
  };

  return (
    <FilterContext.Provider
      value={{
        filterQuery,
        setFilterQuery,
        filterResults,
        setFilterResults,
        fetchFilterResults,
        selectedPriceRange,
        setSelectedPriceRange,
        priceRanges,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => useContext(FilterContext);

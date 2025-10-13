"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { searchSettlements } from "@/services/locationService";
import { debounce } from "lodash";
import type { Settlement, SettlementInputProps } from "@/lib/types/interfaces";

export default function SettlementInput({
  value,
  onChange,
  onSelect,
  required = false,
  className = "",
}: SettlementInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const debouncedSetSearchQuery = useMemo(
    () =>
      debounce((query: string) => {
        setSearchQuery(query);
      }, 300),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSetSearchQuery.cancel();
    };
  }, [debouncedSetSearchQuery]);

  const {
    data: suggestions = [],
    isFetching,
    isError,
  } = useQuery<Settlement[]>({
    queryKey: ["settlements", searchQuery],
    queryFn: () => searchSettlements(searchQuery),
    enabled: searchQuery.length >= 1,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  useEffect(() => {
    return () => {
      queryClient.cancelQueries({ queryKey: ["settlements"] });
    };
  }, [queryClient]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        if (!value) {
          setShowSuggestions(false);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (inputValue.length >= 1) {
      debouncedSetSearchQuery(inputValue);
      setShowSuggestions(true);
    } else {
      setSearchQuery("");
      setShowSuggestions(false);
    }
  };

  const handleSelectSettlement = (settlement: Settlement) => {
    const displayValue = `${settlement.placeName}, ${settlement.postalCode} (${
      settlement.adminName2 || settlement.adminName1
    })`;
    onChange(displayValue);
    onSelect(settlement);
    setShowSuggestions(false);
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={() => value.length >= 1 && setShowSuggestions(true)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={required}
          />
          {isFetching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
        {showSuggestions && (isFetching || suggestions.length > 0) && (
          <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
            <div className="max-h-[9.5rem] overflow-y-auto">
              {isFetching ? (
                <li className="px-4 py-2 text-center text-gray-500 dark:text-gray-400">
                  Зареждане...
                </li>
              ) : isError ? (
                <li className="px-4 py-2 text-center text-red-500">
                  Възникна грешка при зареждане на предложенията!
                </li>
              ) : (
                suggestions.map((settlement, index) => (
                  <li
                    key={`${settlement.placeName}-${settlement.postalCode}-${index}`}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleSelectSettlement(settlement)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {settlement.placeName}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-300">
                        {settlement.postalCode}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {settlement.adminName2
                        ? `${settlement.adminName2}, `
                        : ""}
                      {settlement.adminName1}
                    </div>
                  </li>
                ))
              )}
            </div>
          </ul>
        )}
      </div>
    </div>
  );
}

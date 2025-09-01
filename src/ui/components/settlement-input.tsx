"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { searchSettlements } from "@/services/locationService";
import { Settlement, SettlementInputProps } from "@/lib/interfaces";

export default function SettlementInput({
  value,
  onChange,
  onSelect,
  required = false,
  className = "",
}: SettlementInputProps) {
  const [suggestions, setSuggestions] = useState<Settlement[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchSettlements(query);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.error(
        "Възникна грешка при извличане на населените места:",
        error
      );
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedFetchSuggestions = useCallback(
    (query: string) => {
      const timeoutId = setTimeout(() => {
        fetchSuggestions(query);
      }, 300);

      return () => clearTimeout(timeoutId);
    },
    [fetchSuggestions]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (inputValue.length > 1) {
      debouncedFetchSuggestions(inputValue);
    } else {
      setSuggestions([]);
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
            onFocus={() => value.length > 1 && setShowSuggestions(true)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={required}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
            <div className="max-h-[9.5rem] overflow-y-auto">
              {suggestions.map((settlement, index) => (
                <li
                  key={`${settlement.placeName}-${settlement.postalCode}-${index}`}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleSelectSettlement(settlement)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{settlement.placeName}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-300">
                      {settlement.postalCode}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {settlement.adminName2 ? `${settlement.adminName2}, ` : ""}
                    {settlement.adminName1}
                  </div>
                </li>
              ))}
            </div>
          </ul>
        )}
      </div>
    </div>
  );
}

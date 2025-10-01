"use client";

import { useState } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
  Slider,
} from "@mui/material";
import { formatPrice } from "@/lib/utils/currency";
import { ProductFiltersProps } from "@/lib/types/interfaces";

export default function ProductFilters({
  categories,
  subcategories,
  showCategoryFilter = true,
  onFiltersChange,
  initialFilters = {},
  includeContainer = true,
}: ProductFiltersProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialFilters.selectedCategories || []
  );
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    initialFilters.selectedSubcategories || []
  );
  const [sortOption, setSortOption] = useState<string>(
    initialFilters.sortOption || "newest"
  );
  const [priceRange, setPriceRange] = useState<[number, number]>(
    initialFilters.priceRange || [0, 500]
  );

  const handleCategoryChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setSelectedCategories(value);

    if (value.length > 0) {
      const validSubcategories = selectedSubcategories.filter((subcatId) => {
        const sub = subcategories.find((s) => s.id === subcatId);
        return sub && value.includes(sub.categoryId);
      });
      setSelectedSubcategories(validSubcategories);
    }

    onFiltersChange({
      selectedCategories: value,
      selectedSubcategories:
        value.length > 0
          ? selectedSubcategories.filter((subcatId) => {
              const sub = subcategories.find((s) => s.id === subcatId);
              return sub && value.includes(sub.categoryId);
            })
          : selectedSubcategories,
      sortOption,
      priceRange,
    });
  };

  const handleSubcategoryChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setSelectedSubcategories(value);

    onFiltersChange({
      selectedCategories,
      selectedSubcategories: value,
      sortOption,
      priceRange,
    });
  };

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setSortOption(value);

    onFiltersChange({
      selectedCategories,
      selectedSubcategories,
      sortOption: value,
      priceRange,
    });
  };

  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    const value = newValue as [number, number];
    setPriceRange(value);

    onFiltersChange({
      selectedCategories,
      selectedSubcategories,
      sortOption,
      priceRange: value,
    });
  };

  const filtersContent = (
    <>
      <FormControl fullWidth variant="outlined">
        <InputLabel htmlFor="sort-select">Сортиране</InputLabel>
        <Select
          id="sort-select"
          value={sortOption}
          onChange={handleSortChange}
          label="Сортиране"
        >
          <MenuItem value="newest">Първо най-новите</MenuItem>
          <MenuItem value="alphabetical">Азбучен ред</MenuItem>
          <MenuItem value="price-asc">Цена: Ниска към висока</MenuItem>
          <MenuItem value="price-desc">Цена: Висока към ниска</MenuItem>
        </Select>
      </FormControl>

      {showCategoryFilter && (
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="category-select">
            Филтриране на подкатегориите според избраните категории
          </InputLabel>
          <Select
            id="category-select"
            multiple
            value={selectedCategories}
            onChange={handleCategoryChange}
            label="Филтриране на подкатегориите според избраните категории"
            renderValue={(selected) =>
              selected
                .map((id) => {
                  const cat = categories.find((c) => c.id === id);
                  return cat ? `${cat.code} - ${cat.name}` : "";
                })
                .join(", ")
            }
          >
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.code} - {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <FormControl fullWidth variant="outlined">
        <InputLabel htmlFor="subcategory-select">
          Филтриране на продуктите според избраните подкатегории
        </InputLabel>
        <Select
          id="subcategory-select"
          multiple
          value={selectedSubcategories}
          onChange={handleSubcategoryChange}
          label="Филтриране на продуктите според избраните подкатегории"
          renderValue={(selected) =>
            selected
              .map((id) => {
                const sub = subcategories.find((s) => s.id === id);
                return sub ? `${sub.code} - ${sub.name}` : "";
              })
              .join(", ")
          }
        >
          {subcategories
            .filter(
              (sub) =>
                selectedCategories.length === 0 ||
                selectedCategories.includes(sub.categoryId)
            )
            .sort(
              (a, b) =>
                (a.code || "").localeCompare(b.code || "") ||
                a.name.localeCompare(b.name)
            )
            .map((sub) => (
              <MenuItem key={sub.id} value={sub.id}>
                {sub.code} - {sub.name}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      <Box className="w-full px-4 font-semibold">
        <p>Диапазон на цените</p>
        <Slider
          value={priceRange}
          onChange={handlePriceChange}
          valueLabelDisplay="auto"
          min={0}
          max={500}
        />
        <div className="flex flex-col gap-1 mt-2">
          <div className="flex justify-between text-base">
            <span>{formatPrice(priceRange[0], "BGN")}</span>
            <span>{formatPrice(priceRange[1], "BGN")}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>{formatPrice(priceRange[0], "EUR")}</span>
            <span>{formatPrice(priceRange[1], "EUR")}</span>
          </div>
        </div>
      </Box>
    </>
  );

  if (includeContainer) {
    return (
      <div className="products-filter-container flex flex-col items-center max-w-screen-2xl mx-auto space-y-4 py-4 px-4">
        {filtersContent}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      {filtersContent}
    </div>
  );
}

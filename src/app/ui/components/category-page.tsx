"use client";

import React, { useState, useEffect } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
  Slider,
} from "@mui/material";
import { Subcategory, Product } from "@prisma/client";
import ProductCard from "./product-card";
import CircularProgress from "./circular-progress";
import usePagination, { ITEMS_PER_PAGE } from "@/app/lib/usePagination";
import PaginationButtons from "@/app/ui/components/pagination";
import { useQuery } from "@tanstack/react-query";

interface CategoryPageProps {
  category: {
    id: string;
    name: string;
  };
  subcategories: Subcategory[];
}

async function fetchProducts(
  categoryId: string,
  selectedSubcategories: string[],
  subcategories: Subcategory[]
) {
  const subcategoryIds = selectedSubcategories
    .map((subcategoryCode) => {
      const subcategory = subcategories.find(
        (subcategory) =>
          `${subcategory.code} - ${subcategory.name}` === subcategoryCode
      );
      return subcategory?.id;
    })
    .filter(Boolean);

  const url = subcategoryIds.length
    ? `/api/public/products?subcategories=${subcategoryIds.join(
        ","
      )}&categoryId=${categoryId}`
    : `/api/public/products?categoryId=${categoryId}`;

  const response = await fetch(url);
  const fetchedProducts = await response.json();

  if (Array.isArray(fetchedProducts)) {
    return fetchedProducts;
  } else {
    throw new Error("Възникна грешка! Не е получен масив от продукти!");
  }
}

export default function CategoryPageServerComponent({
  category,
  subcategories,
}: CategoryPageProps) {
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    []
  );
  const [sortOption, setSortOption] = useState<string>("newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);

  const [isQueryEnabled, setIsQueryEnabled] = useState(false);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["products", category.id, selectedSubcategories],
    queryFn: () =>
      fetchProducts(category.id, selectedSubcategories, subcategories),
    enabled: isQueryEnabled,
  });

  useEffect(() => {
    setIsQueryEnabled(true);
  }, [category.id, selectedSubcategories]);

  const handleSubcategoryChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedSubcategories(event.target.value as string[]);
  };

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    setSortOption(event.target.value);
  };

  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as [number, number]);
  };

  const handleAddToCart = (productId: string) => {
    console.log(`Added product ${productId} to cart`);
  };

  const sortedProducts = [...products];

  if (sortOption === "alphabetical") {
    sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOption === "price-asc") {
    sortedProducts.sort((a, b) => a.price - b.price);
  } else if (sortOption === "price-desc") {
    sortedProducts.sort((a, b) => b.price - a.price);
  } else if (sortOption === "newest") {
    sortedProducts.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  const filteredProducts = sortedProducts.filter(
    (product) =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
  );

  const { currentPage, currentItems, paginate } =
    usePagination<Product>(filteredProducts);

  return (
    <div className="container mx-auto py-4 sm:py-6">
      <h1 className="text-3xl text-center font-bold mb-0 sm:mb-2 tracking-wide">
        {category.name}
      </h1>
      <div className="products-filter-container flex flex-col items-center max-w-screen-2xl mx-auto space-y-4 py-4 px-4">
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="subcategory-select">
            Изберете подкатегории
          </InputLabel>
          <Select
            id="subcategory-select"
            multiple
            value={selectedSubcategories}
            onChange={handleSubcategoryChange}
            label="Изберете подкатегории"
          >
            {subcategories.map((subcategory) => (
              <MenuItem
                key={subcategory.id}
                value={`${subcategory.code} - ${subcategory.name}`}
              >
                {subcategory.code} - {subcategory.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
        <Box className="w-full px-4 font-semibold">
          <p>Диапазон на цените</p>
          <Slider
            value={priceRange}
            onChange={handlePriceChange}
            valueLabelDisplay="auto"
            min={0}
            max={500}
          />
          <div className="flex justify-between text-base">
            <span>{priceRange[0]} лв.</span>
            <span>{priceRange[1]} лв.</span>
          </div>
        </Box>
      </div>
      {filteredProducts.length > 0 && (
        <PaginationButtons
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={filteredProducts.length}
          paginate={paginate}
          currentPage={currentPage}
        />
      )}
      <div>
        {isLoading ? (
          <Box className="flex justify-center items-center py-10 my-auto">
            <CircularProgress message="Зареждане на продуктите..." />
          </Box>
        ) : currentItems.length === 0 ? (
          <div className="container mx-auto px-4 mt-4 font-bold">
            <p className="text-center text-2xl p-16 bg-white rounded-md text-gray-600">
              Няма налични продукти
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 py-4 sm:py-6 md:py-8 px-4">
              {currentItems.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
            <PaginationButtons
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredProducts.length}
              paginate={paginate}
              currentPage={currentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}

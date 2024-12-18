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

interface CategoryPageProps {
  category: {
    id: string;
    name: string;
  };
  subcategories: Subcategory[];
}

export default function CategoryPageServerComponent({
  category,
  subcategories,
}: CategoryPageProps) {
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    []
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortOption, setSortOption] = useState<string>("newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);

  const { currentPage, currentItems, paginate } =
    usePagination(filteredProducts);

  const handleSubcategoryChange = (event: SelectChangeEvent<string[]>) => {
    const subcategoryIds = event.target.value as string[];
    setSelectedSubcategories(subcategoryIds);
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

  useEffect(() => {
    const fetchProducts = async () => {
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
          )}&categoryId=${category.id}`
        : `/api/public/products?categoryId=${category.id}`;

      try {
        const response = await fetch(url);
        const fetchedProducts = await response.json();

        if (Array.isArray(fetchedProducts)) {
          setProducts(fetchedProducts);
        } else {
          console.error(
            "Очакван е масив от продукти, а е получено:",
            fetchedProducts
          );
          setProducts([]);
        }
      } catch (error) {
        console.error("Възникна грешка при извличане на продуктите:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedSubcategories, subcategories, category.id]);

  useEffect(() => {
    const sorted = [...products];

    if (sortOption === "alphabetical") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "price-asc") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-desc") {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortOption === "newest") {
      sorted.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    }

    const filtered = sorted.filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    setFilteredProducts(filtered);
  }, [products, sortOption, priceRange]);

  return (
    <div className="container mx-auto px-4 py-4 font-bold">
      <h1 className="text-3xl text-center">{category.name}</h1>
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
        <Box className="w-full px-4">
          <InputLabel>Диапазон на цените</InputLabel>
          <Slider
            value={priceRange}
            onChange={handlePriceChange}
            valueLabelDisplay="auto"
            min={0}
            max={500}
          />
          <div className="flex justify-between text-sm">
            <span>{priceRange[0]} лв</span>
            <span>{priceRange[1]} лв</span>
          </div>
        </Box>
        {filteredProducts.length > 0 && (
          <div className="pb-2">
            <PaginationButtons
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredProducts.length}
              paginate={paginate}
              currentPage={currentPage}
            />
          </div>
        )}
      </div>
      <div>
        {loading ? (
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
          <div className="container mx-auto pt-4 lg:px-4">
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {currentItems.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
            <div className="pt-10">
              <PaginationButtons
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={filteredProducts.length}
                paginate={paginate}
                currentPage={currentPage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ProductWithRelations, CategoryPageProps } from "@/lib/interfaces";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
  Slider,
} from "@mui/material";
import { Product } from "@prisma/client";
import ProductCard from "./product-card";
import CircularProgress from "./circular-progress";
import usePagination, { ITEMS_PER_PAGE } from "@/lib/usePagination";
import PaginationButtons from "@/ui/components/pagination";
import { useQuery } from "@tanstack/react-query";
import { fetchFilteredProducts } from "@/services/productService";
import { useDispatch, useSelector } from "react-redux";
import { loadFavorites } from "@/lib/favoriteSlice";
import { RootState, AppDispatch } from "@/lib/store";
import { formatPrice } from "@/lib/currencyUtils";

export default function CategoryPageServerComponent({
  category,
  subcategories,
  allProducts,
  categories = [],
}: CategoryPageProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoggedIn, id: userId } = useSelector(
    (state: RootState) => state.user
  );

  const loadUserFavorites = useCallback(() => {
    if (isLoggedIn && userId) {
      dispatch(loadFavorites(userId));
    }
  }, [dispatch, isLoggedIn, userId]);

  useEffect(() => {
    loadUserFavorites();
  }, [loadUserFavorites]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    []
  );
  const [sortOption, setSortOption] = useState<string>("newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [isQueryEnabled, setIsQueryEnabled] = useState(false);
  const isAllProductsPage = category.id === "all";

  const {
    data: productsData = allProducts || [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", category.id, selectedSubcategories],
    queryFn: () =>
      allProducts && allProducts.length > 0
        ? Promise.resolve(allProducts)
        : fetchFilteredProducts(
            category.id,
            selectedSubcategories,
            subcategories
          ),
    enabled: isQueryEnabled,
  });

  const products = useMemo(
    () =>
      Array.isArray(productsData)
        ? productsData.map((item) => ({
            ...item,
            subcategories: item.subcategories || [],
          }))
        : [],
    [productsData]
  );

  const availableCategories = useMemo(
    () =>
      isAllProductsPage && categories
        ? [...categories].sort((a, b) => a.code.localeCompare(b.code))
        : [],
    [isAllProductsPage, categories]
  );

  const filterProductsBySubcategories = useCallback(
    (products: ProductWithRelations[], selectedSubcategories: string[]) => {
      if (selectedSubcategories.length === 0) {
        return products;
      }

      return products.filter((product) => {
        return (product.subcategories || []).some(
          ({ subcategory }: { subcategory: { id: string } }) =>
            selectedSubcategories.includes(subcategory?.id || "")
        );
      });
    },
    []
  );

  useEffect(() => {
    setIsQueryEnabled(true);
  }, [category.id, selectedSubcategories]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return filterProductsBySubcategories(products, selectedSubcategories);
  }, [products, selectedSubcategories, filterProductsBySubcategories]);

  useEffect(() => {
    if (error) {
      console.error("Възникна грешка при извличане на продуктите:", error);
    }
  }, [products, error]);

  const handleCategoryChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setSelectedCategories(value);

    if (value.length > 0) {
      const validSubcategories = selectedSubcategories.filter((subcatId) => {
        const subcategory = subcategories.find((s) => s.id === subcatId);
        return subcategory && value.includes(subcategory.categoryId);
      });
      setSelectedSubcategories(validSubcategories);
    }
  };

  const handleSubcategoryChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setSelectedSubcategories(value);
  };

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    setSortOption(event.target.value);
  };

  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as [number, number]);
  };

  const sortedProducts = [...filteredProducts];

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

  const priceFilteredProducts = sortedProducts.filter(
    (product) =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
  );

  const { currentPage, currentItems, paginate } = usePagination<Product>(
    priceFilteredProducts
  );

  return (
    <div className="container mx-auto py-4 sm:py-6 bg-bg-primary">
      <h1 className="text-2xl sm:text-3xl text-center font-bold mb-0 sm:mb-2 tracking-wide text-text-primary">
        {category.name}
      </h1>
      <div className="products-filter-container flex flex-col items-center max-w-screen-2xl mx-auto space-y-4 py-4 px-4">
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
        {isAllProductsPage && (
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
                    const cat = availableCategories.find((c) => c.id === id);
                    return cat ? `${cat.code} - ${cat.name}` : "";
                  })
                  .join(", ")
              }
            >
              {availableCategories.map((c) => (
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
            {[...subcategories]
              .filter(
                (subcategory) =>
                  selectedCategories.length === 0 ||
                  selectedCategories.includes(subcategory.categoryId)
              )
              .sort((a, b) => {
                const codeA = a.code || "";
                const codeB = b.code || "";
                return (
                  codeA.localeCompare(codeB) || a.name.localeCompare(b.name)
                );
              })
              .map((subcategory) => (
                <MenuItem key={subcategory.id} value={subcategory.id}>
                  {subcategory.code} - {subcategory.name}
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
      </div>
      {priceFilteredProducts.length > 0 && (
        <PaginationButtons
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={priceFilteredProducts.length}
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
            <p className="text-center text-2xl p-16 bg-card-bg rounded-md text-text-secondary border border-card-border transition-colors duration-300">
              {selectedSubcategories.length > 0 ||
              selectedCategories.length > 0 ||
              priceRange[0] > 0 ||
              priceRange[1] < 500
                ? "Няма продукти, отговарящи на избраните филтри"
                : "Няма налични продукти"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 py-4 sm:py-6 md:py-8 px-4">
              {currentItems.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <PaginationButtons
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={priceFilteredProducts.length}
              paginate={paginate}
              currentPage={currentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardNav from "@/app/ui/dashboard/dashboard-primary-nav";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Button from "@mui/material/Button";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

export default function DashboardEditSubcategoryPage() {
  const router = useRouter();
  const { id } = useParams();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | "">("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [subcategoryCode, setSubcategoryCode] = useState("");
  const [categories, setCategories] = useState<
    { id: string; name: string; code: string }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesResponse = await fetch("/api/categories");
        const categoriesData = await categoriesResponse.json();
        const sortedCategories = categoriesData.sort(
          (a: { code: string }, b: { code: string }) =>
            a.code.localeCompare(b.code)
        );
        setCategories(sortedCategories);

        if (id) {
          const subcategoryResponse = await fetch(`/api/subcategories/${id}`);
          if (!subcategoryResponse.ok)
            throw new Error("Failed to fetch subcategory data");
          const subcategoryData = await subcategoryResponse.json();
          setSubcategoryName(subcategoryData.name);
          setSubcategoryCode(subcategoryData.code);
          setSelectedCategoryId(subcategoryData.categoryId);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id]);

  const handleCategorySelectChange = (event: SelectChangeEvent<string>) => {
    const selectedId = event.target.value as string;
    setSelectedCategoryId(selectedId);
  };

  const handleSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await fetch(`/api/subcategories/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: subcategoryName,
        code: subcategoryCode,
        categoryId: selectedCategoryId,
      }),
    });

    router.push("/dashboard/subcategories");
  };

  return (
    <>
      <DashboardNav />
      <div className="container mx-auto py-10 px-28">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10 tracking-wide">
          Редактиране на подкатегория
        </h2>
        <form
          onSubmit={handleSubcategorySubmit}
          className="bg-white shadow-lg rounded-lg p-6 mb-8 min-h-96"
        >
          <FormControl fullWidth variant="outlined" className="mb-4" required>
            <InputLabel htmlFor="subcategory-name">
              Име на подкатегория
            </InputLabel>
            <OutlinedInput
              id="subcategory-name"
              value={subcategoryName}
              onChange={(e) => setSubcategoryName(e.target.value)}
              label="Име на подкатегория"
            />
          </FormControl>
          <FormControl fullWidth variant="outlined" className="mb-4" required>
            <InputLabel htmlFor="subcategory-code">
              Код на подкатегория
            </InputLabel>
            <OutlinedInput
              id="subcategory-code"
              value={subcategoryCode}
              onChange={(e) => setSubcategoryCode(e.target.value)}
              label="Код на подкатегория"
            />
          </FormControl>
          <FormControl fullWidth variant="outlined" className="mb-4" required>
            <InputLabel htmlFor="category-select">
              Изберете категория
            </InputLabel>
            <Select
              id="category-select"
              value={selectedCategoryId}
              onChange={handleCategorySelectChange}
              label="Изберете категория"
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.code} - {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className="w-full mt-4"
          >
            Запази промените
          </Button>
        </form>
      </div>
    </>
  );
}

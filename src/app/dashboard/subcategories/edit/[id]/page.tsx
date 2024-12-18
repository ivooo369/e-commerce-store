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
import CircularProgress from "@/app/ui/components/circular-progress";
import { getCustomButtonStyles } from "@/app/ui/mui-custom-styles/custom-button";
import AlertMessage from "@/app/ui/components/alert-message";

export default function DashboardEditSubcategoryPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | "">("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [subcategoryCode, setSubcategoryCode] = useState("");
  const [categories, setCategories] = useState<
    { id: string; name: string; code: string }[]
  >([]);
  const [alert, setAlert] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesResponse = await fetch("/api/dashboard/categories");
        const categoriesData = await categoriesResponse.json();
        const sortedCategories = categoriesData.sort(
          (a: { code: string }, b: { code: string }) =>
            a.code.localeCompare(b.code)
        );
        setCategories(sortedCategories);

        if (id) {
          const subcategoryResponse = await fetch(
            `/api/dashboard/subcategories/${id}`
          );
          if (!subcategoryResponse.ok)
            throw new Error("Failed to fetch subcategory data");
          const subcategoryData = await subcategoryResponse.json();
          setSubcategoryName(subcategoryData.name);
          setSubcategoryCode(subcategoryData.code);
          setSelectedCategoryId(subcategoryData.categoryId);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
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
    setIsEditing(true);

    try {
      const response = await fetch(`/api/dashboard/subcategories/${id}`, {
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

      const responseData = await response.json();

      if (!response.ok) {
        setAlert({
          message: responseData.error,
          severity: "error",
        });
        return;
      }

      setAlert({
        message: responseData.message,
        severity: "success",
      });

      setSubcategoryName("");
      setSubcategoryCode("");
      setSelectedCategoryId("");

      setTimeout(() => {
        router.push("/dashboard/subcategories");
      }, 1000);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setAlert({
        message: "Възникна грешка! Моля, опитайте отново!",
        severity: "error",
      });
    } finally {
      setIsEditing(false);
      setTimeout(() => setAlert(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress message="Зареждане на данните на подкатегорията..." />
      </div>
    );
  }

  return (
    <>
      <DashboardNav />
      <div className="container mx-auto p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8 tracking-wide">
          Редактиране на подкатегория
        </h2>
        <form
          onSubmit={handleSubcategorySubmit}
          className="bg-white shadow-lg rounded-lg p-6 space-y-4"
        >
          <FormControl fullWidth variant="outlined" required>
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
          <FormControl fullWidth variant="outlined" required>
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
          <FormControl fullWidth variant="outlined" required>
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
            sx={getCustomButtonStyles}
            disabled={isEditing}
          >
            {isEditing ? "ЗАПАЗВАНЕ..." : "ЗАПАЗИ ПРОМЕНИТЕ"}
          </Button>
          {alert && (
            <div>
              <AlertMessage severity={alert.severity} message={alert.message} />
            </div>
          )}
        </form>
      </div>
    </>
  );
}

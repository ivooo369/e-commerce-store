"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import DashboardNav from "@/ui/dashboard/dashboard-primary-nav";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Button from "@mui/material/Button";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@/ui/components/circular-progress";
import AlertMessage from "@/ui/components/alert-message";
import { Category } from "@prisma/client";
import { fetchCategories } from "@/services/categoryService";
import {
  editSubcategory,
  fetchSubcategory,
} from "@/services/subcategoryService";

export default function DashboardEditSubcategoryPage() {
  const router = useRouter();
  const { id } = useParams();
  const subcategoryId = Array.isArray(id) ? id[0] : id || "";
  const [subcategoryData, setSubcategoryData] = useState({
    name: "",
    code: "",
    categoryId: "",
  });
  const [alert, setAlert] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const {
    data,
    isLoading: isSubcategoryLoading,
    isError: isSubcategoryError,
  } = useQuery({
    queryKey: ["subcategory", subcategoryId],
    queryFn: () => fetchSubcategory(subcategoryId),
    enabled: !!subcategoryId,
  });

  useEffect(() => {
    if (data) {
      setSubcategoryData({
        name: data.name,
        code: data.code,
        categoryId: data.categoryId,
      });
    }
  }, [data]);

  const handleCategorySelectChange = (event: SelectChangeEvent<string>) => {
    setSubcategoryData((prev) => ({
      ...prev,
      categoryId: event.target.value,
    }));
  };

  const handleSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(true);

    if (subcategoryId) {
      try {
        const updatedSubcategory = {
          name: subcategoryData.name,
          code: subcategoryData.code,
          categoryId: subcategoryData.categoryId,
        };

        queryClient.setQueryData(
          ["subcategory", subcategoryId],
          updatedSubcategory
        );

        const response = await editSubcategory({
          id: subcategoryId,
          updatedSubcategory,
        });

        setAlert({ message: response.message, severity: "success" });

        queryClient.invalidateQueries({
          queryKey: ["subcategory", subcategoryId],
        });

        setTimeout(() => {
          router.push("/dashboard/subcategories");
        }, 1000);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setAlert({ message: error.message, severity: "error" });
        }
      } finally {
        setIsEditing(false);
        setTimeout(() => setAlert(null), 5000);
      }
    }
  };

  if (isCategoriesLoading || isSubcategoryLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress message="Зареждане на данните на подкатегорията..." />
      </div>
    );
  }

  if (isCategoriesError || isSubcategoryError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Възникна грешка при зареждане на данните!</p>
      </div>
    );
  }

  return (
    <>
      <DashboardNav />
      <div className="flex flex-col justify-center container mx-auto px-4 py-4 sm:py-6 max-w-5xl bg-bg-primary">
        <h1 className="text-3xl font-bold text-center text-text-primary mb-8 tracking-wide">
          Редактиране на подкатегория
        </h1>
        <form
          onSubmit={handleSubcategorySubmit}
          className="bg-card-bg shadow-lg rounded-lg p-4 sm:p-6 space-y-4 border border-card-border transition-colors duration-300"
        >
          <FormControl fullWidth variant="outlined" required>
            <InputLabel htmlFor="subcategory-name">
              Име на подкатегория
            </InputLabel>
            <OutlinedInput
              id="subcategory-name"
              value={subcategoryData.name}
              onChange={(e) =>
                setSubcategoryData({ ...subcategoryData, name: e.target.value })
              }
              label="Име на подкатегория"
            />
          </FormControl>
          <FormControl fullWidth variant="outlined" required>
            <InputLabel htmlFor="subcategory-code">
              Код на подкатегория
            </InputLabel>
            <OutlinedInput
              id="subcategory-code"
              value={subcategoryData.code}
              onChange={(e) =>
                setSubcategoryData({ ...subcategoryData, code: e.target.value })
              }
              label="Код на подкатегория"
            />
          </FormControl>
          <FormControl fullWidth variant="outlined" required>
            <InputLabel htmlFor="category-select">Категория</InputLabel>
            <Select
              id="category-select"
              value={subcategoryData.categoryId}
              onChange={handleCategorySelectChange}
              label="Категория"
            >
              {categories?.map((category: Category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.code} - {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            type="submit"
            className="font-bold w-full bg-blue-500 hover:bg-blue-600 text-white"
            variant="contained"
            disabled={isEditing}
          >
            {isEditing ? "Редактиране..." : "Редактирай подкатегорията"}
          </Button>
          {alert && (
            <AlertMessage severity={alert.severity} message={alert.message} />
          )}
        </form>
      </div>
    </>
  );
}

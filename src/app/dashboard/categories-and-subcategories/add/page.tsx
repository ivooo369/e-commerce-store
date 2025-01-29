"use client";

import { useState, useRef } from "react";
import DashboardNav from "@/app/ui/dashboard/dashboard-primary-nav";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Image from "next/image";
import { getCustomButtonStyles } from "@/app/ui/mui-custom-styles/custom-button";
import AlertMessage from "@/app/ui/components/alert-message";
import { useQuery, useMutation } from "@tanstack/react-query";

const fetchCategories = async () => {
  const response = await fetch("/api/dashboard/categories");
  const data = await response.json();
  return data.sort((a: { code: string }, b: { code: string }) =>
    a.code.localeCompare(b.code)
  );
};

const createCategory = async (categoryData: {
  name: string;
  code: string;
  imageUrl: string | null;
}) => {
  const response = await fetch("/api/dashboard/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(categoryData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  return response.json();
};

const createSubcategory = async (subcategoryData: {
  name: string;
  code: string;
  categoryId: string;
}) => {
  const response = await fetch("/api/dashboard/subcategories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subcategoryData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return response.json();
};

export default function DashboardAddCategoriesAndSubcategoriesPage() {
  const [categoryData, setCategoryData] = useState({
    name: "",
    code: "",
    imageUrl: "",
  });
  const [subcategoryData, setSubcategoryData] = useState({
    name: "",
    code: "",
    categoryId: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [alertCategory, setAlertCategory] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);
  const [alertSubcategory, setAlertSubcategory] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: categories = [], refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const createCategoryMutation = useMutation<
    { message: string },
    Error,
    { name: string; code: string; imageUrl: string | null }
  >({
    mutationFn: createCategory,
    onSuccess: (data) => {
      setAlertCategory({
        message: data.message,
        severity: "success",
      });

      setCategoryData({
        name: "",
        code: "",
        imageUrl: "",
      });
      setSelectedFile(null);
      fileInputRef.current!.value = "";

      refetch();
    },
    onError: (error: Error) => {
      setAlertCategory({
        message: error.message,
        severity: "error",
      });
    },
    onSettled: () => {
      setTimeout(() => setAlertCategory(null), 5000);
    },
  });

  const createSubcategoryMutation = useMutation<
    { message: string },
    Error,
    { name: string; code: string; categoryId: string }
  >({
    mutationFn: createSubcategory,

    onSuccess: (data) => {
      setAlertSubcategory({
        message: data.message,
        severity: "success",
      });

      setSubcategoryData({
        name: "",
        code: "",
        categoryId: "",
      });
    },
    onError: (error: Error) => {
      setAlertSubcategory({
        message: error.message,
        severity: "error",
      });
    },
    onSettled: () => {
      setTimeout(() => setAlertSubcategory(null), 5000);
    },
  });

  const handleCategorySelectChange = (event: SelectChangeEvent<string>) => {
    setSubcategoryData((prevData) => ({
      ...prevData,
      categoryId: event.target.value,
    }));
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const imageUrl = selectedFile
      ? await new Promise<string | null>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(selectedFile);
        })
      : null;

    createCategoryMutation.mutate({
      name: categoryData.name,
      code: categoryData.code,
      imageUrl,
    });
  };

  const handleSubcategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSubcategoryMutation.mutate({
      name: subcategoryData.name,
      code: subcategoryData.code,
      categoryId: subcategoryData.categoryId,
    });
  };

  const handleChange = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      setCategoryData((prevData) => ({
        ...prevData,
        imageUrl: URL.createObjectURL(file),
      }));
    }
  };

  return (
    <>
      <DashboardNav />
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-4 sm:mb-6 tracking-wide">
          Добавяне на категории и подкатегории
        </h1>
        <div className="flex flex-col gap-5 m-auto">
          <div className="flex-1">
            <form
              onSubmit={handleCategorySubmit}
              className="bg-white shadow-lg rounded-lg m-auto p-4 space-y-4 max-w-5xl"
            >
              <h2 className="text-2xl font-semibold text-center">
                Нова категория
              </h2>
              <FormControl fullWidth variant="outlined" required>
                <InputLabel htmlFor="category-name">
                  Име на категория
                </InputLabel>
                <OutlinedInput
                  id="category-name"
                  value={categoryData.name}
                  onChange={(e) =>
                    setCategoryData({ ...categoryData, name: e.target.value })
                  }
                  label="Име на категория"
                />
              </FormControl>
              <FormControl fullWidth variant="outlined" required>
                <InputLabel htmlFor="category-code">
                  Код на категория
                </InputLabel>
                <OutlinedInput
                  id="category-code"
                  value={categoryData.code}
                  onChange={(e) =>
                    setCategoryData({ ...categoryData, code: e.target.value })
                  }
                  label="Код на категория"
                />
              </FormControl>
              <Box>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleChange(e.target.files?.[0] || null)}
                  style={{ display: "none" }}
                  id="upload-button"
                  ref={fileInputRef}
                />
                <label htmlFor="upload-button">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    sx={{ textTransform: "none" }}
                  >
                    {selectedFile ? selectedFile.name : "Качете изображение *"}
                  </Button>
                </label>
              </Box>
              {selectedFile && (
                <div className="relative flex justify-center items-center">
                  <Image
                    src={categoryData.imageUrl}
                    alt={`Изображение с име: ${selectedFile.name}`}
                    width={200}
                    height={200}
                    className="rounded-md"
                  />
                </div>
              )}
              <div>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={getCustomButtonStyles}
                  disabled={createCategoryMutation.status === "pending"}
                >
                  {createCategoryMutation.status === "pending"
                    ? "Добавяне..."
                    : "Добави нова категория"}
                </Button>
              </div>
              {alertCategory && (
                <AlertMessage
                  severity={alertCategory.severity}
                  message={alertCategory.message}
                />
              )}
            </form>
          </div>
          <div className="flex-1">
            <form
              onSubmit={handleSubcategorySubmit}
              className="bg-white shadow-lg rounded-lg m-auto p-4 space-y-4 max-w-5xl"
            >
              <h2 className="text-2xl font-semibold text-center">
                Нова подкатегория
              </h2>
              <FormControl fullWidth variant="outlined" required>
                <InputLabel htmlFor="subcategory-name">
                  Име на подкатегория
                </InputLabel>
                <OutlinedInput
                  id="subcategory-name"
                  value={subcategoryData.name}
                  onChange={(e) =>
                    setSubcategoryData({
                      ...subcategoryData,
                      name: e.target.value,
                    })
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
                    setSubcategoryData({
                      ...subcategoryData,
                      code: e.target.value,
                    })
                  }
                  label="Код на подкатегория"
                />
              </FormControl>
              <FormControl fullWidth variant="outlined" required>
                <InputLabel htmlFor="subcategory-category">
                  Изберете категория
                </InputLabel>
                <Select
                  id="subcategory-category"
                  value={subcategoryData.categoryId}
                  onChange={handleCategorySelectChange}
                  label="Изберете категория"
                >
                  {categories.map(
                    (category: { id: string; name: string; code: string }) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.code} - {category.name}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
              <div>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={getCustomButtonStyles}
                  disabled={createSubcategoryMutation.status === "pending"}
                >
                  {createSubcategoryMutation.status === "pending"
                    ? "Добавяне..."
                    : "Добави нова подкатегория"}
                </Button>
              </div>
              {alertSubcategory && (
                <AlertMessage
                  severity={alertSubcategory.severity}
                  message={alertSubcategory.message}
                />
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

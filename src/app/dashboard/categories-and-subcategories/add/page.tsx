/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useRef, useEffect } from "react";
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

export default function DashboardAddCategoriesAndSubcategoriesPage() {
  const [categoryName, setCategoryName] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [categoryImageUrl, setCategoryImageUrl] = useState<string>("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [subcategoryCode, setSubcategoryCode] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | "">("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [categories, setCategories] = useState<
    { id: string; name: string; code: string }[]
  >([]);
  const [alertCategory, setAlertCategory] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);
  const [alertSubcategory, setAlertSubcategory] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await fetch("/api/categories");
      const data = await response.json();
      const sortedCategories = data.sort(
        (a: { code: string }, b: { code: string }) =>
          a.code.localeCompare(b.code)
      );
      setCategories(sortedCategories);
    };

    fetchCategories();
  }, []);

  const handleCategorySelectChange = (event: SelectChangeEvent<string>) => {
    const selectedId = event.target.value as string;
    setSelectedCategoryId(selectedId);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: categoryName,
          code: categoryCode,
          imageUrl: selectedFile
            ? await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(selectedFile);
              })
            : null,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Покажи съобщението за грешка от бекенда
        setAlertCategory({
          message: responseData.error,
          severity: "error",
        });
        return;
      }

      // Успешно съобщение от бекенда
      setAlertCategory({
        message: responseData.message,
        severity: "success",
      });

      // Изчистване на полетата
      setCategoryName("");
      setCategoryCode("");
      setCategoryImageUrl("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      // Ако няма връзка с API или друга грешка
      setAlertCategory({
        message: "Възникна грешка! Моля, опитайте отново!",
        severity: "error",
      });
    } finally {
      setTimeout(() => setAlertCategory(null), 5000);
    }
  };

  const handleSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/subcategories", {
        method: "POST",
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
        // Покажи съобщението за грешка от бекенда
        setAlertSubcategory({
          message: responseData.error,
          severity: "error",
        });
        return;
      }

      // Успешно съобщение от бекенда
      setAlertSubcategory({
        message: responseData.message,
        severity: "success",
      });

      // Изчистване на полетата
      setSubcategoryName("");
      setSubcategoryCode("");
      setSelectedCategoryId("");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Ако няма връзка с API или друга грешка
      setAlertSubcategory({
        message: "Възникна грешка! Моля, опитайте отново!",
        severity: "error",
      });
    } finally {
      setTimeout(() => setAlertSubcategory(null), 5000);
    }
  };

  const handleChange = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setCategoryImageUrl(imageUrl);
    }
  };

  return (
    <>
      <DashboardNav />
      <div className="container mx-auto p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8 tracking-wide">
          Добавяне на категории и подкатегории
        </h2>
        <div className="flex space-x-8">
          <div className="flex-1">
            <form
              onSubmit={handleCategorySubmit}
              className="bg-white shadow-lg rounded-lg p-6"
            >
              <h2 className="text-2xl font-semibold mb-6 text-center">
                Нова категория
              </h2>
              <FormControl
                fullWidth
                variant="outlined"
                className="mb-4"
                required
              >
                <InputLabel htmlFor="category-name">
                  Име на категория
                </InputLabel>
                <OutlinedInput
                  id="category-name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  label="Име на категория"
                />
              </FormControl>
              <FormControl
                fullWidth
                variant="outlined"
                className="mb-4"
                required
              >
                <InputLabel htmlFor="category-code">
                  Код на категория
                </InputLabel>
                <OutlinedInput
                  id="category-code"
                  value={categoryCode}
                  onChange={(e) => setCategoryCode(e.target.value)}
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
                    sx={{ textTransform: "none", height: "100%" }}
                  >
                    {selectedFile ? selectedFile.name : "Качете изображение *"}
                  </Button>
                </label>
              </Box>
              <div className="flex justify-center">
                {selectedFile && (
                  <div className="flex justify-center mt-4">
                    <div className="w-[200px] h-auto">
                      <Image
                        src={categoryImageUrl}
                        alt="Selected Category"
                        width={200}
                        height={200}
                        style={{ maxHeight: "250px" }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className="mt-4"
                sx={getCustomButtonStyles}
              >
                Добави нова категория
              </Button>
              {alertCategory && (
                <div className="mt-4">
                  <AlertMessage
                    severity={alertCategory.severity}
                    message={alertCategory.message}
                  />
                </div>
              )}
            </form>
          </div>
          <div className="flex-1">
            <form
              onSubmit={handleSubcategorySubmit}
              className="bg-white shadow-lg rounded-lg p-6"
            >
              <h2 className="text-2xl font-semibold mb-6 text-center">
                Нова подкатегория
              </h2>
              <FormControl
                fullWidth
                variant="outlined"
                className="mb-4"
                required
              >
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
              <FormControl
                fullWidth
                variant="outlined"
                className="mb-4"
                required
              >
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
              <FormControl
                fullWidth
                variant="outlined"
                className="mb-4"
                required
              >
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
              >
                Добави нова подкатегория
              </Button>
              {alertSubcategory && (
                <div className="mt-4">
                  <AlertMessage
                    severity={alertSubcategory.severity}
                    message={alertSubcategory.message}
                  />
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

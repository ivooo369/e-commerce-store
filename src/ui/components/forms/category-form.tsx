"use client";

import { useState, useRef } from "react";
import FormControl from "@mui/material/FormControl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Image from "next/image";
import AlertMessage from "@/ui/components/feedback/alert-message";
import { useAutoDismissAlert } from "@/lib/hooks/useAutoDismissAlert";
import { createCategory } from "@/services/categoryService";

export default function CategoryForm() {
  const queryClient = useQueryClient();
  const [categoryData, setCategoryData] = useState({
    name: "",
    code: "",
    imageUrl: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [alert, setAlert] = useAutoDismissAlert(5000);

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (data: {
      message?: string;
      category?: {
        id: string;
        name: string;
        code: string;
        imageUrl: string;
        createdAt: string;
        updatedAt: string;
      };
    }) => {
      setAlert({
        message: data.message || "Категорията е добавена успешно!",
        severity: "success",
      });
      setCategoryData({ name: "", code: "", imageUrl: "" });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (data.category) {
        queryClient.setQueryData(
          ["dashboardCategories"],
          (
            old:
              | {
                  id: string;
                  name: string;
                  code: string;
                  imageUrl: string;
                  createdAt: string;
                  updatedAt: string;
                }[]
              | undefined
          ) => (old ? [...old, data.category] : [data.category])
        );
      }

      queryClient.invalidateQueries({ queryKey: ["dashboardCategories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categoriesForHeader"] });
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
    },
    onError: (error: Error) => {
      setAlert({
        message:
          error.message || "Възникна грешка при добавяне на категорията!",
        severity: "error",
      });
    },
    onSettled: () => {},
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryData.name.trim() || !categoryData.code.trim()) {
      setAlert({
        message: "Моля, попълнете всички задължителни полета!",
        severity: "error",
      });
      return;
    }

    if (!selectedFile) {
      setAlert({
        message: "Моля, качете изображение за категорията!",
        severity: "error",
      });
      return;
    }

    try {
      const imageUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () =>
          reject(new Error("Възникна грешка при прочитане на изображението"));
        reader.readAsDataURL(selectedFile!);
      });

      createCategoryMutation.mutate({ ...categoryData, imageUrl });
    } catch {
      setAlert({
        message:
          "Възникна грешка при обработка на изображението. Моля, опитайте отново.",
        severity: "error",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setCategoryData((prev) => ({
        ...prev,
        imageUrl: "",
      }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      setAlert({
        message: "Моля, изберете валиден файл с изображение!",
        severity: "error",
      });
      if (e.target) e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAlert({
        message: "Изображението надвишава максималния размер от 2 MB!",
        severity: "error",
      });
      if (e.target) e.target.value = "";
      return;
    }

    setSelectedFile(file);
    const tempUrl = URL.createObjectURL(file);
    setCategoryData((prev) => ({
      ...prev,
      imageUrl: tempUrl,
    }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card-bg shadow-lg rounded-lg p-4 space-y-4 w-full max-w-5xl border border-card-border transition-colors duration-300"
    >
      <h2 className="text-2xl font-semibold text-center text-text-primary">
        Нова категория
      </h2>
      <FormControl fullWidth variant="outlined" required>
        <InputLabel htmlFor="category-name">Име на категория</InputLabel>
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
        <InputLabel htmlFor="category-code">Код на категория</InputLabel>
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
          onChange={handleFileChange}
          className="hidden"
          id="upload-button"
          ref={fileInputRef}
        />
        <label htmlFor="upload-button">
          <Button
            variant="outlined"
            component="span"
            fullWidth
            className="normal-case"
          >
            {selectedFile ? selectedFile.name : "Качете изображение *"}
          </Button>
        </label>
      </Box>
      {categoryData.imageUrl && (
        <div className="flex justify-center">
          <div className="relative w-48 h-32">
            <Image
              src={categoryData.imageUrl}
              alt="Изображение на категория"
              fill
              className="rounded-md object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      )}
      <Button
        type="submit"
        className="font-bold w-full bg-blue-500 hover:bg-blue-600 text-white"
        variant="contained"
        disabled={createCategoryMutation.isPending}
      >
        {createCategoryMutation.isPending
          ? "Добавяне..."
          : "Добави нова категория"}
      </Button>
      {alert && (
        <AlertMessage severity={alert.severity} message={alert.message} />
      )}
    </form>
  );
}

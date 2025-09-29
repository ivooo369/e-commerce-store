"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import DashboardNav from "@/ui/components/layouts/dashboard-primary-nav";
import CircularProgress from "@/ui/components/feedback/circular-progress";
import AlertMessage from "@/ui/components/feedback/alert-message";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useState, useRef, useEffect } from "react";
import { useAutoDismissAlert } from "@/lib/hooks/useAutoDismissAlert";
import { editCategory, fetchCategory } from "@/services/categoryService";
import DashboardSecondaryNav from "@/ui/components/layouts/dashboard-secondary-nav";

export default function DashboardEditCategoryPage() {
  const router = useRouter();
  const { id } = useParams();
  const categoryId = Array.isArray(id) ? id[0] : id;
  const [categoryData, setCategoryData] = useState({
    name: "",
    code: "",
    imageUrl: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [alert, setAlert] = useAutoDismissAlert(5000);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["category", categoryId],
    queryFn: () => fetchCategory(categoryId),
    enabled: !!categoryId,
  });

  useEffect(() => {
    if (data) {
      setCategoryData({
        name: data.name,
        code: data.code,
        imageUrl: data.imageUrl || "",
      });
    }
  }, [data]);

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];

      if (!file.type.startsWith("image/")) {
        setAlert({
          message: "Моля, изберете валиден файл с изображение!",
          severity: "error",
        });
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        setAlert({
          message: "Изображението надвишава максималния размер от 2 MB!",
          severity: "error",
        });
        return;
      }

      setSelectedFile(file);
      setCategoryData((prev) => ({
        ...prev,
        imageUrl: URL.createObjectURL(file),
      }));
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryData.name.trim() || !categoryData.code.trim()) {
      setAlert({
        message: "Моля, попълнете всички задължителни полета!",
        severity: "error",
      });
      return;
    }

    if (!categoryData.imageUrl && !selectedFile) {
      setAlert({
        message: "Моля, качете изображение за категорията!",
        severity: "error",
      });
      return;
    }

    setIsEditing(true);

    try {
      const imageUrl = selectedFile
        ? await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () =>
              reject(
                new Error("Възникна грешка при обработка на изображението!")
              );
            reader.readAsDataURL(selectedFile);
          })
        : categoryData.imageUrl;

      const updatedCategoryData = {
        name: categoryData.name.trim(),
        code: categoryData.code.trim(),
        imageUrl,
      };

      queryClient.setQueryData(["category", categoryId], updatedCategoryData);

      const responseData = await editCategory(updatedCategoryData, categoryId);

      setAlert({
        message: responseData.message || "Категорията е обновена успешно!",
        severity: "success",
      });

      queryClient.invalidateQueries({ queryKey: ["category", categoryId] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });

      setCategoryData({ name: "", code: "", imageUrl: "" });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      setTimeout(() => {
        router.push("/dashboard/categories");
      }, 1000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Възникна грешка при обновяване на категорията. Моля, опитайте отново!";

      setAlert({
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setIsEditing(false);
    }
  };

  if (isLoading || !data) {
    return (
      <Box className="flex justify-center items-center h-screen">
        <CircularProgress message="Зареждане на данните за категорията..." />
      </Box>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Възникна грешка при зареждане на категорията!</p>
      </div>
    );
  }

  return (
    <>
      <DashboardNav />
      <DashboardSecondaryNav />
      <div className="flex flex-col justify-center container mx-auto px-4 py-4 sm:py-6 max-w-5xl bg-bg-primary">
        <h1 className="text-3xl font-bold text-center text-text-primary mb-8 tracking-wide">
          Редактиране на категория
        </h1>
        <form
          onSubmit={handleCategorySubmit}
          className="bg-card-bg shadow-lg rounded-lg p-4 sm:p-6 space-y-4 border border-card-border transition-colors duration-300"
        >
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
              onChange={(e) => handleFileChange(e.target.files)}
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
                {selectedFile
                  ? selectedFile.name
                  : categoryData.imageUrl
                  ? categoryData.imageUrl.split("/").pop()
                  : "Качете изображение *"}
              </Button>
            </label>
          </Box>
          <div className="flex justify-center">
            {categoryData.imageUrl && (
              <div className="relative w-48 h-32">
                <Image
                  src={categoryData.imageUrl}
                  alt="Изображение на категория"
                  fill
                  className="rounded-md object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  loading="lazy"
                />
              </div>
            )}
          </div>
          <Button
            type="submit"
            variant="contained"
            className="font-bold w-full bg-blue-500 hover:bg-blue-600 text-white"
            disabled={isEditing}
          >
            {isEditing ? "Редактиране..." : "Редактирай категорията"}
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

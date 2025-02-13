"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import DashboardNav from "@/app/ui/dashboard/dashboard-primary-nav";
import CircularProgress from "@/app/ui/components/circular-progress";
import { getCustomButtonStyles } from "@/app/ui/mui-custom-styles/custom-button";
import AlertMessage from "@/app/ui/components/alert-message";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useState, useRef, useEffect } from "react";

interface Category {
  name: string;
  code: string;
  imageUrl: string;
}

const fetchCategory = async (id: string) => {
  const response = await fetch(`/api/dashboard/categories/${id}`);
  if (!response.ok) {
    throw new Error("Възникна грешка при извличане на категорията!");
  }
  return response.json();
};

const editCategory = async (updatedCategory: Category, id: string) => {
  try {
    const response = await fetch(`/api/dashboard/categories/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedCategory),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message);
    }

    return responseData;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
};

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
  const [alert, setAlert] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);
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
      setSelectedFile(file);
      setCategoryData((prev) => ({
        ...prev,
        imageUrl: URL.createObjectURL(file),
      }));
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(true);

    const updatedCategoryData = {
      name: categoryData.name,
      code: categoryData.code,
      imageUrl: selectedFile
        ? await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(selectedFile);
          })
        : categoryData.imageUrl,
    };

    queryClient.setQueryData(["category", categoryId], updatedCategoryData);

    try {
      const responseData = await editCategory(updatedCategoryData, categoryId);

      setAlert({
        message: responseData.message,
        severity: "success",
      });

      queryClient.invalidateQueries({ queryKey: ["category", categoryId] });

      setCategoryData({ name: "", code: "", imageUrl: "" });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      setTimeout(() => {
        router.push("/dashboard/categories");
      }, 1000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setAlert({
          message: error.message,
          severity: "error",
        });
      } else {
        setAlert({
          message: "Възникна грешка! Моля, опитайте отново!",
          severity: "error",
        });
      }
    } finally {
      setIsEditing(false);
      setTimeout(() => setAlert(null), 5000);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress message="Зареждане на данните на категорията..." />
      </div>
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
      <div className="container mx-auto p-8 max-w-5xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8 tracking-wide">
          Редактиране на категория
        </h1>
        <form
          onSubmit={handleCategorySubmit}
          className="bg-white shadow-lg rounded-lg p-4 sm:p-6 space-y-4"
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
              <div className="flex justify-center items-center">
                <Image
                  src={categoryData.imageUrl}
                  alt={`Продукт изображение ${categoryData.imageUrl}`}
                  width={200}
                  height={200}
                  className="rounded-md"
                  loading="lazy"
                />
              </div>
            )}
          </div>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={getCustomButtonStyles}
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

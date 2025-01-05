"use client";

import { useState, useEffect, useRef } from "react";
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

export default function DashboardEditCategoryPage() {
  const router = useRouter();
  const { id } = useParams();

  const [categoryName, setCategoryName] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [categoryImageUrl, setCategoryImageUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [alert, setAlert] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          const categoryResponse = await fetch(
            `/api/dashboard/categories/${id}`
          );
          if (!categoryResponse.ok)
            throw new Error("Възникна грешка при извличане на категорията!");
          const categoryData = await categoryResponse.json();
          setCategoryName(categoryData.name);
          setCategoryCode(categoryData.code);
          setCategoryImageUrl(categoryData.imageUrl || "");
        }
      } catch (error) {
        console.error("Възникна грешка при извличане на категорията:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      setCategoryImageUrl(URL.createObjectURL(file));
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(true);

    try {
      const imageUrl = selectedFile
        ? await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(selectedFile);
          })
        : categoryImageUrl;

      const response = await fetch(`/api/dashboard/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: categoryName,
          code: categoryCode,
          imageUrl,
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

      setCategoryName("");
      setCategoryCode("");
      setCategoryImageUrl("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      setTimeout(() => {
        router.push("/dashboard/categories");
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
        <CircularProgress message="Зареждане на данните на категорията..." />
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
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              label="Име на категория"
            />
          </FormControl>
          <FormControl fullWidth variant="outlined" required>
            <InputLabel htmlFor="category-code">Код на категория</InputLabel>
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
                  : categoryImageUrl
                  ? categoryImageUrl.split("/").pop()
                  : "Качете изображение *"}
              </Button>
            </label>
          </Box>
          <div className="flex justify-center">
            {categoryImageUrl && (
              <div className="flex justify-center items-center">
                <Image
                  src={categoryImageUrl}
                  alt={`Продукт изображение ${categoryImageUrl}`}
                  width={200}
                  height={200}
                  className="rounded-md"
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
            {isEditing ? "Запазване..." : "Запази промените"}
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

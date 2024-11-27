"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardNav from "@/app/ui/dashboard/dashboard-primary-nav";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Image from "next/image";
import CircularProgress from "@/app/ui/components/circular-progress";
import { getCustomButtonStyles } from "@/app/ui/mui-custom-styles/custom-button";
import AlertMessage from "@/app/ui/components/alert-message";

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
          const categoryResponse = await fetch(`/api/categories/${id}`);
          if (!categoryResponse.ok)
            throw new Error("Failed to fetch category data");
          const categoryData = await categoryResponse.json();
          setCategoryName(categoryData.name);
          setCategoryCode(categoryData.code);
          setCategoryImageUrl(categoryData.imageUrl || "");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
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
      setCategoryImageUrl(URL.createObjectURL(file)); // Промяна на изображението на клиента
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
        : categoryImageUrl; // Ако няма ново изображение, използваме старото

      const response = await fetch(`/api/categories/${id}`, {
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

      // Нулиране на стойностите
      setCategoryName("");
      setCategoryCode("");
      setCategoryImageUrl("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Пренасочване
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
      <div className="container mx-auto p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8 tracking-wide">
          Редактиране на категория
        </h2>
        <form
          onSubmit={handleCategorySubmit}
          className="bg-white shadow-lg rounded-lg p-6"
        >
          <FormControl fullWidth variant="outlined" className="mb-4" required>
            <InputLabel htmlFor="category-name">Име на категория</InputLabel>
            <OutlinedInput
              id="category-name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              label="Име на категория"
            />
          </FormControl>
          <FormControl fullWidth variant="outlined" className="mb-4" required>
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
                  ? categoryImageUrl.split("/").pop() // Extract the filename from the URL
                  : "Качете изображение *"}
              </Button>
            </label>
          </Box>
          <div className="flex justify-center">
            {categoryImageUrl && (
              <div className="flex justify-center items-center mt-4">
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
            className="mt-4"
            sx={getCustomButtonStyles}
            disabled={isEditing}
          >
            {isEditing ? "ЗАПАЗВАНЕ НА ПРОМЕНИТЕ..." : "ЗАПАЗИ ПРОМЕНИТЕ"}
          </Button>
          {alert && (
            <div className="mt-4">
              <AlertMessage severity={alert.severity} message={alert.message} />
            </div>
          )}
        </form>
      </div>
    </>
  );
}

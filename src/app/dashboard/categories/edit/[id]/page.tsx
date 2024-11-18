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
import { FaTrash } from "react-icons/fa";

export default function DashboardEditCategoryPage() {
  const router = useRouter();
  const { id } = useParams();

  const [categoryName, setCategoryName] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [categoryImageUrl, setCategoryImageUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleImageRemove = () => {
    setCategoryImageUrl("");
    setSelectedFile(null);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const imageUrl = selectedFile
      ? await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(selectedFile);
        })
      : categoryImageUrl;

    const imageToRemove =
      categoryImageUrl !== imageUrl ? categoryImageUrl : null;

    await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: categoryName,
        code: categoryCode,
        imageUrl: imageUrl,
        imageToRemove: imageToRemove,
      }),
    });

    router.push("/dashboard/categories");
  };

  return (
    <>
      <DashboardNav />
      <div className="container mx-auto py-10 px-28">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10 tracking-wide">
          Редактиране на категория
        </h2>
        <form
          onSubmit={handleCategorySubmit}
          className="bg-white shadow-lg rounded-lg p-6 mb-8 min-h-96"
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
                Качено изображение
              </Button>
            </label>
          </Box>
          <div className="mt-4 flex justify-center">
            {categoryImageUrl && (
              <div className="relative w-[200px] h-auto flex items-center">
                <Image
                  src={categoryImageUrl}
                  alt="Category Image"
                  width={200}
                  height={200}
                  style={{ maxHeight: "250px" }}
                />
                <Button
                  onClick={handleImageRemove}
                  variant="contained"
                  color="error"
                  aria-label="Изтрий изображение"
                  className="self-center p-1 ml-0.5 min-w-10"
                >
                  <FaTrash />
                </Button>
              </div>
            )}
          </div>
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

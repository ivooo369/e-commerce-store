"use client";

import { useState, useRef } from "react";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Image from "next/image";
import AlertMessage from "@/ui/components/alert-message";
import { useMutation } from "@tanstack/react-query";
import { createCategory } from "@/services/categoryService";

export default function CategoryForm({ refetch }: { refetch: () => void }) {
  const [categoryData, setCategoryData] = useState({
    name: "",
    code: "",
    imageUrl: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [alert, setAlert] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (data) => {
      setAlert({ message: data.message, severity: "success" });
      setCategoryData({ name: "", code: "", imageUrl: "" });
      setSelectedFile(null);
      fileInputRef.current!.value = "";
      refetch();
    },
    onError: (error: Error) => {
      setAlert({ message: error.message, severity: "error" });
    },
    onSettled: () => {
      setTimeout(() => setAlert(null), 5000);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const imageUrl = selectedFile
      ? await new Promise<string | null>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(selectedFile);
        })
      : null;

    createCategoryMutation.mutate({ ...categoryData, imageUrl });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);

    if (file) {
      const tempUrl = URL.createObjectURL(file);
      setCategoryData((prev) => ({
        ...prev,
        imageUrl: tempUrl,
      }));
    } else {
      setCategoryData((prev) => ({
        ...prev,
        imageUrl: "",
      }));
    }
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
        <div className="relative flex justify-center items-center w-[200px] h-[200px] m-auto">
          <Image
            src={categoryData.imageUrl}
            alt="Изображение"
            fill
            className="rounded-md object-cover"
            unoptimized
          />
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

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
import AlertMessage from "@/app/ui/components/alert-message";
import { FaTrash } from "react-icons/fa";
import { getCustomButtonStyles } from "@/app/ui/mui-custom-styles/custom-button";
import { useMutation, useQuery } from "@tanstack/react-query";

interface Subcategory {
  id: string;
  name: string;
  code: string;
}

const fetchSubcategories = async (): Promise<Subcategory[]> => {
  const response = await fetch("/api/dashboard/subcategories");
  if (!response.ok) {
    throw new Error("Възникна грешка при извличане на подкатегориите!");
  }
  const data = await response.json();
  return data.sort((a: Subcategory, b: Subcategory) =>
    a.code.localeCompare(b.code)
  );
};

const createProduct = async (productData: {
  name: string;
  code: string;
  subcategoryIds: string[];
  price: number | undefined;
  description: string;
  images: string[];
}) => {
  const response = await fetch("/api/dashboard/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  return response.json();
};

export default function DashboardAddNewProductPage() {
  const [productName, setProductName] = useState("");
  const [productCode, setProductCode] = useState("");
  const [subcategoryIds, setSubcategoryIds] = useState<string[]>([]);
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState("");
  const [productImageUrls, setProductImageUrls] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [alert, setAlert] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: subcategories = [] } = useQuery<Subcategory[]>({
    queryKey: ["subcategories"],
    queryFn: fetchSubcategories,
  });

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onMutate: async () => {
      setIsAdding(true);
      setAlert(null);
    },
    onSuccess: (data) => {
      setAlert({
        message: data.message,
        severity: "success",
      });
      setProductName("");
      setProductCode("");
      setSubcategoryIds([]);
      setPrice(undefined);
      setDescription("");
      setProductImageUrls([]);
      setSelectedFiles([]);
    },

    onError: (error: Error) => {
      setAlert({
        message: error.message,
        severity: "error",
      });
    },
    onSettled: () => {
      setIsAdding(false);
      setTimeout(() => setAlert(null), 5000);
    },
  });

  const handleImageRemove = (index: number) => {
    setProductImageUrls((prevUrls) => {
      URL.revokeObjectURL(prevUrls[index]);
      return prevUrls.filter((_, i) => i !== index);
    });
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleFileChange = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      const newImageUrls = newFiles.map((file) => URL.createObjectURL(file));

      setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
      setProductImageUrls((prevUrls) => [...prevUrls, ...newImageUrls]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);

    try {
      const imageUrls = selectedFiles.length
        ? await Promise.all(
            selectedFiles.map(
              (file) =>
                new Promise<string>((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.readAsDataURL(file);
                })
            )
          )
        : [];

      createProductMutation.mutate({
        name: productName,
        code: productCode,
        subcategoryIds,
        price,
        description,
        images: imageUrls,
      });
    } catch (error) {
      if (error instanceof Error) {
        setAlert({
          message: error.message,
          severity: "error",
        });
      }
    }
  };

  return (
    <>
      <DashboardNav />
      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-5xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-4 sm:mb-6 tracking-wide">
          Добавяне на нов продукт
        </h1>
        <form
          onSubmit={handleProductSubmit}
          className="bg-white shadow-lg rounded-lg p-4 sm:p-6 space-y-4"
        >
          <FormControl fullWidth variant="outlined" required>
            <InputLabel htmlFor="product-name">Име на продукт</InputLabel>
            <OutlinedInput
              id="product-name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              label="Име на продукт"
            />
          </FormControl>
          <FormControl fullWidth variant="outlined" required>
            <InputLabel htmlFor="product-code">Код на продукт</InputLabel>
            <OutlinedInput
              id="product-code"
              value={productCode}
              onChange={(e) => setProductCode(e.target.value)}
              label="Код на продукт"
            />
          </FormControl>
          <FormControl fullWidth variant="outlined" required>
            <InputLabel htmlFor="subcategory-select">
              Изберете подкатегории
            </InputLabel>
            <Select
              id="subcategory-select"
              multiple
              value={subcategoryIds}
              onChange={(e: SelectChangeEvent<string[]>) =>
                setSubcategoryIds(e.target.value as string[])
              }
              label="Изберете подкатегории"
            >
              {subcategories.map((subcategory: Subcategory) => (
                <MenuItem key={subcategory.id} value={subcategory.id}>
                  {subcategory.code} - {subcategory.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth variant="outlined" required>
            <InputLabel htmlFor="product-price">Цена (лв.)</InputLabel>
            <OutlinedInput
              id="product-price"
              type="number"
              value={price !== undefined ? price : ""}
              onChange={(e) =>
                setPrice(
                  e.target.value ? parseFloat(e.target.value) : undefined
                )
              }
              label="Цена (лв.)"
            />
          </FormControl>
          <FormControl fullWidth variant="outlined" required>
            <InputLabel htmlFor="product-description">Описание</InputLabel>
            <OutlinedInput
              id="product-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              label="Описание"
              multiline
              rows={4}
            />
          </FormControl>
          <Box>
            <input
              type="file"
              accept="image/*"
              multiple
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
                sx={{ textTransform: "none" }}
              >
                {productImageUrls.length > 0
                  ? `Качени изображения (${productImageUrls.length})`
                  : "Качете изображения *"}
              </Button>
            </label>
          </Box>
          {productImageUrls.length > 0 && (
            <div className="flex flex-wrap justify-center gap-10">
              {productImageUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative flex justify-center items-center"
                >
                  <Image
                    src={url}
                    alt={`Изображение на продукт: ${index + 1}`}
                    width={200}
                    height={200}
                    className="rounded-md"
                  />
                  <button
                    type="button"
                    className="absolute top-0 right-0 p-2 bg-red-600 hover:bg-red-800 transition text-white rounded-full"
                    onClick={() => handleImageRemove(index)}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={getCustomButtonStyles}
            disabled={isAdding}
          >
            {isAdding ? "Добавяне..." : "Добави нов продукт"}
          </Button>
          {alert && (
            <AlertMessage message={alert.message} severity={alert.severity} />
          )}
        </form>
      </div>
    </>
  );
}

"use client";

import { useState, useRef } from "react";
import DashboardNav from "@/ui/dashboard/dashboard-primary-nav";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Image from "next/image";
import AlertMessage from "@/ui/components/alert-message";
import { FaTrash } from "react-icons/fa";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Subcategory as SubcategoryPrisma } from "@prisma/client";
import { createProduct } from "@/services/productService";
import { fetchSubcategories } from "@/services/subcategoryService";
import DashboardSecondaryNav from "@/ui/dashboard/dashboard-secondary-nav";

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
  const queryClient = useQueryClient();

  const { data: subcategories = [] } = useQuery<SubcategoryPrisma[]>({
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
      if (data.newCount !== undefined) {
        queryClient.setQueryData(["productCount"], data.newCount);
      }
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

      if (price === undefined) {
        setAlert({
          message: "Моля, въведете цена на продукта!",
          severity: "error",
        });
        setIsAdding(false);
        return;
      }

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
      <DashboardSecondaryNav />
      <div className="flex flex-col justify-center container mx-auto px-4 py-4 sm:py-6 max-w-5xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-text-primary mb-4 sm:mb-6 tracking-wide">
          Добавяне на нов продукт
        </h1>
        <form
          onSubmit={handleProductSubmit}
          className="bg-card-bg shadow-lg rounded-lg p-4 sm:p-6 space-y-4 border border-card-border transition-colors duration-300"
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
              {subcategories.map((subcategory: SubcategoryPrisma) => (
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
                    className="absolute top-0 right-0 p-2 bg-error-color hover:bg-red-700 transition text-white rounded-full"
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
            className="font-bold w-full bg-blue-500 hover:bg-blue-600 text-white"
            variant="contained"
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

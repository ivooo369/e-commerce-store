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
import AlertMessage from "@/app/ui/components/alert-message";
import { FaTrash } from "react-icons/fa";
import { getCustomButtonStyles } from "@/app/ui/mui-custom-styles/custom-button";

export default function DashboardAddNewProductPage() {
  const [productName, setProductName] = useState("");
  const [productCode, setProductCode] = useState("");
  const [subcategoryIds, setSubcategoryIds] = useState<string[]>([]);
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState("");
  const [productImageUrls, setProductImageUrls] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [subcategories, setSubcategories] = useState<
    { id: string; name: string; code: string }[]
  >([]);
  const [alert, setAlert] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const response = await fetch("/api/dashboard/subcategories");
        if (!response.ok)
          throw new Error("Възникна грешка при извличане на подкатегориите!");

        const data = await response.json();
        const sortedData = data.sort(
          (a: { code: string }, b: { code: string }) =>
            a.code.localeCompare(b.code)
        );
        setSubcategories(sortedData);
      } catch (error) {
        console.error(
          "Възникна грешка при извличане на подкатегориите:",
          error
        );
      }
    };

    fetchSubcategories();
  }, []);

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
    setLoading(true);

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

      const response = await fetch("/api/dashboard/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: productName,
          code: productCode,
          subcategoryIds,
          price,
          description,
          images: imageUrls,
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

      setProductName("");
      setProductCode("");
      setSubcategoryIds([]);
      setPrice(undefined);
      setDescription("");
      setProductImageUrls([]);
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setAlert({
        message: "Възникна грешка при свързването с API.",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setAlert(null), 5000);
    }
  };

  return (
    <>
      <DashboardNav />
      <div className="container mx-auto p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8 tracking-wide">
          Добавяне на нов продукт
        </h2>
        <form
          onSubmit={handleProductSubmit}
          className="bg-white shadow-lg rounded-lg p-6 space-y-4"
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
              {subcategories.map((subcategory) => (
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
            disabled={loading}
          >
            {loading ? "ДОБАВЯНЕ..." : "ДОБАВИ НОВ ПРОДУКТ"}
          </Button>
          {alert && (
            <AlertMessage message={alert.message} severity={alert.severity} />
          )}
        </form>
      </div>
    </>
  );
}

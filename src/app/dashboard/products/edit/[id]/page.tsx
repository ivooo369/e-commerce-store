"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { FaTrash } from "react-icons/fa";
import DashboardNav from "@/app/ui/dashboard/dashboard-primary-nav";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import CircularProgress from "@/app/ui/components/circular-progress";
import { getCustomButtonStyles } from "@/app/ui/mui-custom-styles/custom-button";
import AlertMessage from "@/app/ui/components/alert-message";

export default function DashboardEditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [productName, setProductName] = useState("");
  const [productCode, setProductCode] = useState("");
  const [subcategoryIds, setSubcategoryIds] = useState<string[]>([]);
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState("");
  const [productImageUrls, setProductImageUrls] = useState<string[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [subcategories, setSubcategories] = useState<
    { id: string; name: string; code: string }[]
  >([]);
  const [alert, setAlert] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          const productResponse = await fetch(`/api/dashboard/products/${id}`);
          if (!productResponse.ok)
            throw new Error("Възникна грешка при извличане на продукта!");
          const productData = await productResponse.json();
          setProductName(productData.name);
          setProductCode(productData.code);
          setSubcategoryIds(productData.subcategoryIds || []);
          setPrice(productData.price);
          setDescription(productData.description);
          setProductImageUrls(productData.images);
        }

        const subcategoryResponse = await fetch("/api/dashboard/subcategories");
        if (!subcategoryResponse.ok)
          throw new Error("Възникна грешка при извличане на подкатегориите!");
        const subcategoryData = await subcategoryResponse.json();
        const sortedData = subcategoryData.sort(
          (a: { code: string }, b: { code: string }) =>
            a.code.localeCompare(b.code)
        );
        setSubcategories(sortedData);
      } catch (error) {
        console.error("Възникна грешка при извличане на данните:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleImageRemove = (index: number) => {
    const imageUrlToRemove = productImageUrls[index];
    const fileToRemove = selectedFiles.find(
      (file) => file.name === imageUrlToRemove
    );

    if (fileToRemove) {
      setSelectedFiles((prevFiles) =>
        prevFiles.filter((file) => file.name !== fileToRemove.name)
      );
    } else {
      setImagesToRemove((prev) => [...prev, imageUrlToRemove]);
    }

    setProductImageUrls((prevUrls) => prevUrls.filter((_, i) => i !== index));
  };

  const handleFileChange = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);

      const newImageUrls = newFiles.map((file) => URL.createObjectURL(file));
      setProductImageUrls((prevUrls) => [...prevUrls, ...newImageUrls]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(true);

    try {
      const imageUrls =
        selectedFiles.length > 0
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
          : productImageUrls.filter((url) => !imagesToRemove.includes(url));

      const response = await fetch(`/api/dashboard/products/${id}`, {
        method: "PUT",
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
          imagesToRemove,
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
      setImagesToRemove([]);

      setTimeout(() => {
        router.push("/dashboard/products");
      }, 1000);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setAlert({
        message: "Възникна грешка! Моля, опитайте отново!",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setIsEditing(false);

      setTimeout(() => setAlert(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress message="Зареждане на данните на продукта..." />
      </div>
    );
  }

  return (
    <>
      <DashboardNav />
      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-5xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-4 sm:mb-6 tracking-wide">
          Редактиране на продукт
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
              label="Цена (лв.) *"
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
                sx={{ textTransform: "none", height: "100%" }}
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
                    alt={`Продукт изображение ${index + 1}`}
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
          <div>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={getCustomButtonStyles}
              disabled={isEditing}
            >
              {isEditing ? "Запазване..." : "Запази промените"}
            </Button>
          </div>
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

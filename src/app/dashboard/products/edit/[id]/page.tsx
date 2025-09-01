"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { FaTrash } from "react-icons/fa";
import DashboardNav from "@/ui/dashboard/dashboard-primary-nav";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import CircularProgress from "@/ui/components/circular-progress";
import AlertMessage from "@/ui/components/alert-message";
import { editProduct, fetchProduct } from "@/services/productService";
import { fetchSubcategories } from "@/services/subcategoryService";

export default function DashboardEditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const productId = Array.isArray(id) ? id[0] : id;
  const [productName, setProductName] = useState("");
  const [productCode, setProductCode] = useState("");
  const [subcategoryIds, setSubcategoryIds] = useState<string[]>([]);
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState("");
  const [productImageUrls, setProductImageUrls] = useState<string[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [alert, setAlert] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);
  const queryClient = useQueryClient();

  const { data: updatedProduct, isLoading: isProductLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProduct(productId),
    enabled: !!productId,
  });

  const { data: subcategories, isLoading: isSubcategoriesLoading } = useQuery({
    queryKey: ["subcategories"],
    queryFn: fetchSubcategories,
  });

  const resetForm = () => {
    setProductName("");
    setProductCode("");
    setSubcategoryIds([]);
    setPrice(undefined);
    setDescription("");
    setProductImageUrls([]);
    setSelectedFiles([]);
    setImagesToRemove([]);
  };

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

    const finalPrice = price !== undefined && price > 0 ? price : 0;

    const updatedProductData = {
      id: updatedProduct.id,
      name: productName,
      code: productCode,
      subcategoryIds,
      price: finalPrice,
      description,
      images: imageUrls,
      imagesToRemove,
      createdAt: updatedProduct.createdAt,
      updatedAt: new Date(),
    };

    queryClient.setQueryData(["product", productId], updatedProductData);

    try {
      const responseData = await editProduct(productId, updatedProductData);
      setAlert({
        message: responseData.message,
        severity: "success",
      });

      resetForm();
      setTimeout(() => router.push("/dashboard/products"), 1000);
    } catch (error: unknown) {
      setAlert({
        message:
          (error instanceof Error
            ? error.message
            : "Възникна грешка! Моля, опитайте отново!") || "",
        severity: "error",
      });

      setIsEditing(false);
      setTimeout(() => setAlert(null), 5000);
    }
  };

  useEffect(() => {
    if (updatedProduct) {
      setProductName(updatedProduct.name);
      setProductCode(updatedProduct.code);
      setSubcategoryIds(updatedProduct.subcategoryIds || []);
      setPrice(updatedProduct.price);
      setDescription(updatedProduct.description);
      setProductImageUrls(updatedProduct.images);
    }
  }, [updatedProduct]);

  if (isProductLoading || isSubcategoriesLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress message="Зареждане на данните на продукта..." />
      </div>
    );
  }

  return (
    <>
      <DashboardNav />
      <div className="flex flex-col justify-center container mx-auto px-4 py-4 sm:py-6 max-w-5xl bg-bg-primary">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-text-primary mb-4 sm:mb-6 tracking-wide">
          Редактиране на продукт
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
              {subcategories?.map((subcategory) => (
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
                    alt={`Продукт изображение ${index + 1}`}
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
            disabled={isEditing}
          >
            {isEditing ? "Редактиране..." : "Редактирай продукта"}
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

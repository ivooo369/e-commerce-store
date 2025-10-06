"use client";

import { useState, useRef, useEffect } from "react";
import { useAutoDismissAlert } from "@/lib/hooks/useAutoDismissAlert";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { FaTrash } from "react-icons/fa";
import DashboardNav from "@/ui/components/layouts/dashboard-primary-nav";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import CircularProgress from "@/ui/components/feedback/circular-progress";
import AlertMessage from "@/ui/components/feedback/alert-message";
import { editProduct, fetchProduct } from "@/services/productService";
import { fetchSubcategories } from "@/services/subcategoryService";
import DashboardSecondaryNav from "@/ui/components/layouts/dashboard-secondary-nav";

export default function DashboardEditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const productId = Array.isArray(id) ? id[0] : id;
  const queryClient = useQueryClient();
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
  const [alert, setAlert] = useAutoDismissAlert(5000);

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

    if (imageUrlToRemove.startsWith("blob:")) {
      setSelectedFiles((prevFiles) => {
        const blobIndex = productImageUrls
          .slice(0, index)
          .filter((url) => url.startsWith("blob:")).length;
        const newBlobFiles = prevFiles.filter(
          (_, fileIndex) => fileIndex !== blobIndex
        );
        return newBlobFiles;
      });
    } else if (imageUrlToRemove.startsWith("http")) {
      setImagesToRemove((prev) => [...prev, imageUrlToRemove]);
    }

    setProductImageUrls((prevUrls) => prevUrls.filter((_, i) => i !== index));
  };

  const MAX_FILE_SIZE = 2 * 1024 * 1024;

  const handleFileChange = (files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    const oversizedFiles: string[] = [];

    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        oversizedFiles.push(file.name);
      } else {
        validFiles.push(file);
      }
    });

    if (oversizedFiles.length > 0) {
      setAlert({
        message:
          "Едно или повече изображения надвишават максималния размер от 2 MB!",
        severity: "error",
      });
      return;
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prevFiles) => [...prevFiles, ...validFiles]);
      const newImageUrls = validFiles.map((file) => URL.createObjectURL(file));
      setProductImageUrls((prevUrls) => [...prevUrls, ...newImageUrls]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim() || !productCode.trim() || !subcategoryIds.length) {
      setAlert({
        message: "Моля, попълнете всички задължителни полета!",
        severity: "error",
      });
      return;
    }

    if (price === undefined || price <= 0) {
      setAlert({
        message: "Цената трябва да бъде по-голяма от 0!",
        severity: "error",
      });
      return;
    }

    const existingHttpImages = productImageUrls.filter(
      (url) => url.startsWith("http") && !imagesToRemove.includes(url)
    );

    const totalImages = existingHttpImages.length + selectedFiles.length;

    if (totalImages === 0) {
      setAlert({
        message: "Моля, качете поне едно изображение на продукта!",
        severity: "error",
      });
      return;
    }

    setIsEditing(true);

    try {
      const newImageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        const convertPromises = selectedFiles.map(
          (file) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                if (reader.result) {
                  resolve(reader.result as string);
                } else {
                  reject(new Error("Failed to read file"));
                }
              };
              reader.onerror = () =>
                reject(new Error("Възникна грешка, свързана с FileReader!"));
              reader.readAsDataURL(file);
            })
        );

        try {
          const convertedImages = await Promise.all(convertPromises);
          newImageUrls.push(...convertedImages);
        } catch {
          throw new Error("Възникна грешка при обработка на изображенията!");
        }
      }

      const finalPrice = price > 0 ? price : 0;

      const allImages = [...existingHttpImages, ...newImageUrls];

      const updatedProductData = {
        id: updatedProduct.id,
        name: productName.trim(),
        code: productCode.trim(),
        subcategoryIds,
        price: finalPrice,
        description: description.trim(),
        images: allImages,
        imagesToRemove,
        createdAt: updatedProduct.createdAt,
        updatedAt: new Date(),
      };

      const responseData = await editProduct(productId, updatedProductData);

      setAlert({
        message: responseData.message || "Продуктът е обновен успешно!",
        severity: "success",
      });

      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      queryClient.invalidateQueries({ queryKey: ["products", "all"] });
      queryClient.invalidateQueries({ queryKey: ["publicProducts"] });
      queryClient.invalidateQueries({ queryKey: ["allPublicProducts"] });
      queryClient.invalidateQueries({
        queryKey: ["products"],
        predicate: (query) => query.queryKey[0] === "products",
      });

      resetForm();
      setTimeout(() => router.push("/dashboard/products"), 1000);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Възникна грешка при обновяване на продукта. Моля, опитайте отново!";

      setAlert({
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setIsEditing(false);
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
      <Box className="flex justify-center items-center h-screen">
        <CircularProgress message="Зареждане на данните за продукта..." />
      </Box>
    );
  }

  return (
    <>
      <DashboardNav />
      <DashboardSecondaryNav />
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
                  : "Качи изображения *"}
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
                  <div className="relative w-48 h-32">
                    <Image
                      src={url}
                      alt={`Продукт изображение ${index + 1}`}
                      fill
                      className="rounded-md object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>

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
            className="font-bold"
            color="primary"
            variant="contained"
            fullWidth
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

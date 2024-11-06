"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardNav from "@/app/ui/dashboard/dashboard-primary-nav";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Image from "next/image";
import { FaTrash } from "react-icons/fa";

export default function DashboardEditProductPage() {
  const router = useRouter();
  const { id } = useParams();

  const [productName, setProductName] = useState("");
  const [productCode, setProductCode] = useState("");
  const [subcategoryIds, setSubcategoryIds] = useState<string[]>([]);
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState("");
  const [productImageUrls, setProductImageUrls] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [subcategories, setSubcategories] = useState<
    { id: string; name: string; code: string }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          const productResponse = await fetch(`/api/products/${id}`);
          if (!productResponse.ok)
            throw new Error("Failed to fetch product data");
          const productData = await productResponse.json();
          setProductName(productData.name);
          setProductCode(productData.code);
          setSubcategoryIds(productData.subcategoryIds || []);
          setPrice(productData.price);
          setDescription(productData.description);
          setProductImageUrls(productData.images);
        }

        const subcategoryResponse = await fetch("/api/subcategories");
        if (!subcategoryResponse.ok)
          throw new Error("Failed to fetch subcategories");
        const subcategoryData = await subcategoryResponse.json();
        const sortedData = subcategoryData.sort(
          (a: { code: string }, b: { code: string }) =>
            a.code.localeCompare(b.code)
        );
        setSubcategories(sortedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id]);

  const handleFileChange = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      const newImageUrls = newFiles.map((file) => URL.createObjectURL(file));

      setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
      setProductImageUrls((prevUrls) => [...prevUrls, ...newImageUrls]);
    }
  };

  const handleImageRemove = (index: number) => {
    setProductImageUrls((prevUrls) => prevUrls.filter((_, i) => i !== index));
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        : productImageUrls;

    await fetch(`/api/products/${id}`, {
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
      }),
    });

    router.push("/dashboard/products");
  };

  return (
    <>
      <DashboardNav />
      <div className="container mx-auto py-10 px-28">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10 tracking-wide">
          Редактиране на продукт
        </h2>
        <form
          onSubmit={handleProductSubmit}
          className="bg-white shadow-lg rounded-lg p-6 mb-8 min-h-96"
        >
          <FormControl fullWidth variant="outlined" className="mb-4" required>
            <InputLabel htmlFor="product-name">Име на продукт</InputLabel>
            <OutlinedInput
              id="product-name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              label="Име на продукт"
            />
          </FormControl>
          <FormControl fullWidth variant="outlined" className="mb-4" required>
            <InputLabel htmlFor="product-code">Код на продукт</InputLabel>
            <OutlinedInput
              id="product-code"
              value={productCode}
              onChange={(e) => setProductCode(e.target.value)}
              label="Код на продукт"
            />
          </FormControl>
          <FormControl fullWidth variant="outlined" className="mb-4" required>
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
          <FormControl fullWidth variant="outlined" className="mb-4" required>
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
          <FormControl fullWidth variant="outlined" className="mb-4" required>
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
            <div className="mt-4 flex flex-wrap justify-center gap-10">
              {productImageUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative w-[200px] h-auto m-2 flex items-center"
                >
                  <Image
                    src={url}
                    alt={`Selected Product ${index + 1}`}
                    width={200}
                    height={200}
                    style={{ maxHeight: "250px" }}
                  />
                  <Button
                    onClick={() => handleImageRemove(index)}
                    variant="contained"
                    color="error"
                    aria-label="Изтрий изображение"
                    className="self-center p-1 ml-0.5 min-w-10"
                  >
                    <FaTrash />
                  </Button>
                </div>
              ))}
            </div>
          )}
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

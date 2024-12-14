"use client";

import { useEffect, useState } from "react";
import { Product } from "@prisma/client";
import Button from "@mui/material/Button";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CircularProgress from "@/app/ui/components/circular-progress";

interface ProductDetailsPageProps {
  params: { code: string };
}

export default function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductByCode = async (code: string) => {
    try {
      const response = await fetch(`/api/public/products/${code}`);
      if (!response.ok) {
        throw new Error("Неуспешно зареждане на данните на продукта!");
      }
      const data: Product = await response.json();
      setProduct(data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Възникна грешка при зареждане на данните на продукта!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductByCode(params.code);
  }, [params.code]);

  const handleBackClick = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10 my-auto">
        <CircularProgress message="Зареждане на продукта..." />{" "}
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto mt-4 font-bold text-center text-2xl p-16 bg-white rounded-md text-gray-600 flex flex-col items-center">
        <p>Продуктът не е намерен!</p>
        <Button
          variant="contained"
          onClick={handleBackClick}
          sx={{ marginTop: 2 }}
        >
          Назад
        </Button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center">
        <p className="text-center text-2xl p-16 bg-white rounded-md text-gray-600">
          Продуктът не е намерен
        </p>

        <Button
          variant="contained"
          sx={{ marginTop: 2 }}
          onClick={handleBackClick}
        >
          Обратно към каталога
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto shadow-2xl p-4 rounded-lg my-8 border-slate-200 border-2">
      <div
        className="bg-cover bg-center h-96 rounded-lg"
        style={{ backgroundImage: `url(${product.images[0]})` }}
      ></div>
      <div className="mt-4">
        <h2 className="text-3xl font-bold text-center break-words">
          {product.name}
        </h2>
        <p className="text-lg text-center text-gray-500">
          Код на продукта: {product.code}
        </p>
        <p className="text-xl text-center text-black mt-4">
          Цена: {product.price} лв.
        </p>
        <p className="text-lg text-center text-gray-700 mt-4 break-words">
          Описание: {product.description || "Няма описание за този продукт."}
        </p>
        <div className="flex justify-center gap-4 my-8">
          <Button
            variant="contained"
            color="primary"
            className="font-bold"
            startIcon={<ShoppingCartIcon />}
          >
            Добави в количката
          </Button>
          <Button
            variant="contained"
            color="error"
            className="font-bold"
            onClick={handleBackClick}
          >
            Назад
          </Button>
        </div>
      </div>
    </div>
  );
}

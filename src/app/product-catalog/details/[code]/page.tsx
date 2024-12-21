"use client";

import { useEffect, useState } from "react";
import { Product } from "@prisma/client";
import Button from "@mui/material/Button";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CircularProgress from "@/app/ui/components/circular-progress";
import Image from "next/image";

interface ProductDetailsPageProps {
  params: { code: string };
}

export default function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProductByCode = async (code: string) => {
    try {
      const response = await fetch(`/api/public/products/${code}`);
      if (!response.ok) {
        throw new Error("Възникна грешка при извличане на продукта!");
      }
      const data: Product = await response.json();
      setProduct(data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Възникна грешка при извличане на продукта!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductByCode(params.code);
  }, [params.code]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  const handleBackClick = () => {
    window.history.back();
  };

  const showNextImage = () => {
    if (product && product.images.length > 1) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const showPrevImage = () => {
    if (product && product.images.length > 1) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
      );
    }
  };

  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10 my-auto">
        <CircularProgress message="Зареждане на продукта..." />
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
          sx={{ marginTop: 2, fontWeight: "bold" }}
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
          sx={{ marginTop: 2, fontWeight: "bold" }}
          onClick={handleBackClick}
        >
          Обратно към каталога
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto shadow-2xl p-4 rounded-lg my-8 border-slate-200 border-2">
      <div className="relative">
        <div
          className="bg-cover bg-center h-96 rounded-lg cursor-pointer"
          style={{
            backgroundImage: `url(${product.images[currentImageIndex]})`,
          }}
          onClick={openModal}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <span className="text-white text-xl font-bold">
              Виж изображението в цял размер
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-start gap-2 mt-4 relative">
        <div className="flex flex-wrap justify-center">
          <div className="flex flex-wrap justify-center items-center">
            {product.images.map((image, index) => (
              <div
                key={index}
                className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 flex justify-center items-center"
              >
                <Image
                  src={image}
                  alt={`product image ${index + 1}`}
                  width={120}
                  height={120}
                  loading="lazy"
                  className={`object-cover rounded-lg cursor-pointer transition-all duration-200 ${
                    index === currentImageIndex
                      ? "border-2 border-blue-500"
                      : ""
                  }`}
                  onClick={() => selectImage(index)}
                />
              </div>
            ))}
          </div>
        </div>
        {product.images.length > 1 && (
          <>
            <button
              onClick={showPrevImage}
              className="absolute font-bold text-xl left-0 top-1/2 transform -translate-y-1/2 text-white bg-gray-700 bg-opacity-75 p-5 rounded-full shadow-lg hover:bg-gray-800 transition-all duration-300"
            >
              &lt;
            </button>
            <button
              onClick={showNextImage}
              className="absolute font-bold text-xl right-0 top-1/2 transform -translate-y-1/2 text-white bg-gray-700 bg-opacity-75 p-5 rounded-full shadow-lg hover:bg-gray-800 transition-all duration-300"
            >
              &gt;
            </button>
          </>
        )}
      </div>
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
            sx={{ fontWeight: "bold" }}
            startIcon={<ShoppingCartIcon />}
          >
            Добави в количката
          </Button>
          <Button
            variant="contained"
            color="error"
            sx={{ fontWeight: "bold" }}
            onClick={handleBackClick}
          >
            Назад
          </Button>
        </div>
      </div>
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50"
          onClick={handleOutsideClick}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <Image
              src={product.images[currentImageIndex]}
              alt="Enlarged product image"
              width={800}
              height={800}
              priority
              className="max-w-screen-lg max-h-screen-lg object-contain"
            />
            <button
              onClick={showPrevImage}
              className="absolute font-bold text-2xl left-[-100px] top-1/2 transform -translate-y-1/2 bg-gray-300 bg-opacity-80 p-5 rounded-full shadow-lg hover:bg-gray-400 transition-all duration-300"
            >
              &lt;
            </button>
            <button
              onClick={showNextImage}
              className="absolute font-bold text-2xl right-[-100px] top-1/2 transform -translate-y-1/2 bg-gray-300 bg-opacity-80 p-5 rounded-full shadow-lg hover:bg-gray-400 transition-all duration-300"
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

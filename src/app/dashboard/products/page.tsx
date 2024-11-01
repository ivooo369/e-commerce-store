"use client";

import { useEffect, useState } from "react";
import DashboardNav from "@/app/ui/dashboard/dashboard-primary-nav";
import DashboardSecondaryNav from "@/app/ui/dashboard/dashboard-secondary-nav";
import ProductCard from "@/app/ui/components/ProductCard";
import Search from "@/app/ui/components/Search";
import Box from "@mui/material/Box";
import { Product } from "@prisma/client";
import ConfirmationModal from "@/app/ui/components/ConfirmationModal";

export default function DashboardInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Failed to fetch products");

        const data: Product[] = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleOpenModal = (id: string) => {
    setProductToDelete(id);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setProductToDelete(null);
  };

  const handleDelete = async () => {
    if (productToDelete) {
      try {
        const response = await fetch(`/api/products?id=${productToDelete}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete product");

        setProducts((prevProducts) =>
          prevProducts.filter((product) => product.id !== productToDelete)
        );
      } catch (error) {
        console.error("Error deleting product:", error);
      } finally {
        handleCloseModal();
      }
    }
  };

  return (
    <>
      <DashboardNav />
      <DashboardSecondaryNav />
      <div className="search-container flex justify-center py-4">
        <Search />
      </div>
      <div className="container mx-auto py-4 lg:px-10">
        <Box className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={handleOpenModal}
            />
          ))}
        </Box>
      </div>

      <ConfirmationModal
        open={openModal}
        onClose={handleCloseModal}
        onConfirm={handleDelete}
      />
    </>
  );
}

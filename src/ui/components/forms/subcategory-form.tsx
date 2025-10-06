"use client";

import { useState } from "react";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import AlertMessage from "@/ui/components/feedback/alert-message";
import { useAutoDismissAlert } from "@/lib/hooks/useAutoDismissAlert";
import { createSubcategory } from "@/services/subcategoryService";
import { fetchDashboardCategories } from "@/services/categoryService";

export default function SubcategoryForm({
  categories: propCategories,
}: {
  categories: { id: string; name: string; code: string }[];
}) {
  const queryClient = useQueryClient();
  const [subcategoryData, setSubcategoryData] = useState({
    name: "",
    code: "",
    categoryId: "",
  });
  const [alert, setAlert] = useAutoDismissAlert(5000);

  const { data: categories = propCategories || [] } = useQuery({
    queryKey: ["dashboardCategories"],
    queryFn: fetchDashboardCategories,
    initialData: propCategories,
  });

  const createSubcategoryMutation = useMutation({
    mutationFn: createSubcategory,
    onSuccess: (data) => {
      setAlert({
        message: data.message || "Подкатегорията е добавена успешно!",
        severity: "success",
      });
      setSubcategoryData({ name: "", code: "", categoryId: "" });

      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
    },
    onError: (error: Error) => {
      setAlert({
        message:
          error.message || "Възникна грешка при добавяне на подкатегорията!",
        severity: "error",
      });
    },
    onSettled: () => {},
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !subcategoryData.name.trim() ||
      !subcategoryData.code.trim() ||
      !subcategoryData.categoryId
    ) {
      setAlert({
        message: "Моля, попълнете всички задължителни полета!",
        severity: "error",
      });
      return;
    }

    createSubcategoryMutation.mutate({
      ...subcategoryData,
      id: "",
      category: { name: "" },
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card-bg shadow-lg rounded-lg p-4 space-y-4 w-full max-w-5xl border border-card-border transition-colors duration-300"
    >
      <h2 className="text-2xl font-semibold text-center text-text-primary">
        Нова подкатегория
      </h2>
      <FormControl fullWidth variant="outlined" required>
        <InputLabel htmlFor="subcategory-name">Име на подкатегория</InputLabel>
        <OutlinedInput
          id="subcategory-name"
          value={subcategoryData.name}
          onChange={(e) =>
            setSubcategoryData({ ...subcategoryData, name: e.target.value })
          }
          label="Име на подкатегория"
        />
      </FormControl>
      <FormControl fullWidth variant="outlined" required>
        <InputLabel htmlFor="subcategory-code">Код на подкатегория</InputLabel>
        <OutlinedInput
          id="subcategory-code"
          value={subcategoryData.code}
          onChange={(e) =>
            setSubcategoryData({ ...subcategoryData, code: e.target.value })
          }
          label="Код на подкатегория"
        />
      </FormControl>
      <FormControl fullWidth variant="outlined" required>
        <InputLabel htmlFor="subcategory-category">
          Изберете категория
        </InputLabel>
        <Select
          id="subcategory-category"
          label="Изберете категория"
          value={subcategoryData.categoryId}
          onChange={(e) =>
            setSubcategoryData({
              ...subcategoryData,
              categoryId: e.target.value,
            })
          }
        >
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.code} - {category.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        type="submit"
        className="font-bold"
        color="primary"
        variant="contained"
        fullWidth
        disabled={createSubcategoryMutation.isPending}
      >
        {createSubcategoryMutation.isPending
          ? "Добавяне..."
          : "Добави нова подкатегория"}
      </Button>
      {alert && (
        <AlertMessage severity={alert.severity} message={alert.message} />
      )}
    </form>
  );
}

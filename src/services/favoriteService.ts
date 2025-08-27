export const getFavorites = async (customerId: string) => {
  if (typeof window === "undefined" && !process.env.NEXT_RUNTIME) {
    return [];
  }

  try {
    const baseUrl =
      typeof window !== "undefined" ? "" : "http://localhost:3000";
    const response = await fetch(
      `${baseUrl}/api/public/favorites?customerId=${customerId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message ||
          "Възникна грешка при извличане на любимите продукти!"
      );
    }

    const favoriteProducts = await response.json();
    return favoriteProducts;
  } catch (error) {
    console.error("Възникна грешка при извличане на любимите продукти:", error);
    throw error;
  }
};

export const addFavorite = async (customerId: string, productId: string) => {
  if (typeof window === "undefined" && !process.env.NEXT_RUNTIME) {
    return { success: true, message: "Build time mock" };
  }

  try {
    const baseUrl =
      typeof window !== "undefined" ? "" : "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/public/favorites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerId,
        productId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Възникна грешка при добавяне в 'Любими'!"
      );
    }

    const result = await response.json();
    return { success: true, message: result.message };
  } catch (error) {
    console.error("Възникна грешка при добавяне в 'Любими':", error);
    throw error;
  }
};

export const removeFavorite = async (customerId: string, productId: string) => {
  if (typeof window === "undefined" && !process.env.NEXT_RUNTIME) {
    return { success: true, message: "Build time mock" };
  }

  try {
    const baseUrl =
      typeof window !== "undefined" ? "" : "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/public/favorites`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerId,
        productId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Възникна грешка при премахване от 'Любими'!"
      );
    }

    const result = await response.json();
    return { success: true, message: result.message };
  } catch (error) {
    console.error("Възникна грешка при премахване от 'Любими':", error);
    throw error;
  }
};

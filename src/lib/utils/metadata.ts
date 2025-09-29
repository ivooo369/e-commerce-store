import { Metadata } from "next";
import { DynamicMetadata, RouteConfig, RouteMetadata } from "../types/interfaces";

export const routeMetadata: RouteConfig = {
  "/": {
    title: "Начало | Lipci Design Studio",
    description:
      "Онлайн магазин за продукти, изработени с 3D принтер и лазер за гравиране.",
  },
  "/contact": {
    title: "Контакт с нас | Lipci Design Studio",
    description:
      "Свържете се с нас, ако имате въпроси. Ще ви отговорим в най-кратък срок.",
  },
  "/product-catalog/all": {
    title: "Всички продукти | Lipci Design Studio",
    description: "Разгледайте всички продукти в нашия магазин.",
  },
  "/product-catalog/results": {
    title: "Търсене | Lipci Design Studio",
    description: "Търсене на продукти в Lipci Design Studio",
  },
};

export const defaultMetadata: Metadata = {
  title: "Lipci Design Studio",
  description:
    "Онлайн магазин за продукти, изработени с 3D принтер и лазер за гравиране.",
  icons: {
    icon: "/assets/images/logo.jpg",
  },
  openGraph: {
    type: "website",
    siteName: "Lipci Design Studio",
    locale: "bg_BG",
  },
};

export function generateMetadata(
  route: string,
  dynamicData?: Partial<RouteMetadata>
): Metadata {
  const baseMetadata = routeMetadata[route] || {
    title: "Lipci Design Studio",
    description:
      "Онлайн магазин за продукти, изработени с 3D принтер и лазер за гравиране.",
  };

  return {
    ...baseMetadata,
    ...(dynamicData || {}),
    openGraph: {
      ...baseMetadata.openGraph,
      ...(dynamicData?.openGraph || {}),
      title: dynamicData?.title || baseMetadata.title,
      description: dynamicData?.description || baseMetadata.description,
      type: "website",
      siteName: "Lipci Design Studio",
      locale: "bg_BG",
    },
  };
}

export async function getDynamicMetadata(
  basePath: string,
  dynamicData: () => Promise<DynamicMetadata>
): Promise<Metadata> {
  const defaultData = routeMetadata[basePath] || {};
  const dynamicDataResult = await dynamicData();

  return {
    ...defaultData,
    ...dynamicDataResult,
    openGraph: {
      ...defaultData.openGraph,
      ...dynamicDataResult.openGraph,
      title: dynamicDataResult.title || defaultData.title,
      description: dynamicDataResult.description || defaultData.description,
    },
  };
}

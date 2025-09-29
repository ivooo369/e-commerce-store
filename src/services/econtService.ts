import axios from "axios";
import { EcontOffice, EcontOfficeResponse } from "@/lib/types/interfaces";

export async function getEcontOfficesRest(
  cityName: string
): Promise<EcontOffice[]> {
  try {
    const response = await axios.get(`/api/public/econt-offices`, {
      params: { city: cityName },
    });
    return response.data;
  } catch {
    throw new Error("Възникна грешка при извличане на офисите на Еконт!");
  }
}

export async function getEcontOffices(
  cityName: string
): Promise<EcontOffice[]> {
  try {
    const normalizedCityName = cityName
      .split(",")[0]
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const response = await axios.post(
      "https://ee.econt.com/services/Nomenclatures/NomenclaturesService.getOffices.json",
      {
        countryCode: "BGR",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data.offices || !Array.isArray(response.data.offices)) {
      return [];
    }

    return response.data.offices
      .filter((office: EcontOfficeResponse) => {
        if (!office.address?.city?.name) return false;
        const officeCity = office.address.city.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        return (
          officeCity === normalizedCityName ||
          officeCity.startsWith(normalizedCityName.split(" ")[0])
        );
      })
      .map((office: EcontOfficeResponse) => {
        const addressParts = [
          office.address.street,
          office.address.num,
          office.address.quarter,
          office.address.other,
        ].filter(Boolean);

        const cityName = office.address.city?.name || "";
        const fullAddress =
          office.address.full ||
          office.address.fullAddress ||
          [...addressParts, cityName].filter(Boolean).join(", ");

        return {
          id: office.code || office.id,
          name: office.name || "Офис на Еконт",
          address: {
            full: fullAddress,
            city: cityName,
            street: office.address.street || "",
            number: office.address.num || "",
            quarter: office.address.quarter || "",
            other: office.address.other || "",
          },
          phones: Array.isArray(office.phones) ? office.phones : [],
          isMachine: office.isMachine || false,
          latitude: office.location?.latitude || office.latitude,
          longitude: office.location?.longitude || office.longitude,
        };
      });
  } catch {
    throw new Error("Възникна грешка при извличане на офисите на Еконт!");
  }
}

import { Settlement } from "@/lib/types/interfaces";
import axios from "axios";

const GEONAMES_USERNAME = "lipci";

function mapSettlementData(item: Settlement): Settlement {
  return {
    placeName: item.placeName,
    postalCode: item.postalCode,
    adminName1: item.adminName1,
    adminName2: item.adminName2,
    countryCode: item.countryCode,
    lat: item.lat,
    lng: item.lng,
  };
}

export async function searchSettlements(query: string): Promise<Settlement[]> {
  try {
    const response = await axios.get(
      "https://secure.geonames.org/postalCodeSearchJSON",
      {
        params: {
          placename_startsWith: query,
          maxRows: 20,
          username: GEONAMES_USERNAME,
          country: "BG",
        },
        timeout: 10000,
      }
    );

    if (response.data?.postalCodes?.length > 0) {
      return response.data.postalCodes.map(mapSettlementData);
    }

    return [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error("Възникна грешка при извличане на населените места!");
    }
    return [];
  }
}

export async function getSettlementByPostalCode(
  postalCode: string
): Promise<Settlement | null> {
  try {
    const response = await axios.get(
      "https://secure.geonames.org/postalCodeSearchJSON",
      {
        params: {
          postalcode: postalCode,
          maxRows: 1,
          username: GEONAMES_USERNAME,
          country: "BG",
        },
        timeout: 10000,
      }
    );

    if (response.data?.postalCodes?.length > 0) {
      return mapSettlementData(response.data.postalCodes[0]);
    }

    return null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        "Възникна грешка при извличане на населените места по пощенски код!"
      );
    }
    return null;
  }
}

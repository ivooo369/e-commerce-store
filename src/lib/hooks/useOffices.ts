import { useQuery } from "@tanstack/react-query";
import { getEcontOfficesRest } from "@/services/econtService";
import { Office, ApiOffice } from "@/lib/types/interfaces";

const mapApiOfficeToOffice = (office: ApiOffice): Office => {
  const workTime = office.workTime || "";
  const weeklySchedule = (office.weeklySchedule || []).map((schedule) => ({
    day: schedule.day,
    time: schedule.time || null,
    isDayOff: !schedule.time,
  }));

  const safeString = (value: unknown): string =>
    value != null ? String(value) : "";

  const safePhones = (phones: unknown[] | undefined): string[] =>
    Array.isArray(phones) ? phones.map(safeString) : [];

  const latitude = office.latitude ?? office.location?.latitude;
  const longitude = office.longitude ?? office.location?.longitude;

  return {
    id: safeString(office.id),
    name: `Офис ${safeString(office.name)}`,
    address: {
      full: safeString(office.fullAddress || ""),
      city:
        typeof office.city === "object"
          ? office.city.name
          : safeString(office.city),
      street: safeString(office.street || office.address?.street || ""),
      number: safeString(office.num || office.address?.num || ""),
      quarter: safeString(office.quarter || office.address?.quarter || ""),
      other: safeString(office.other || office.address?.other || ""),
      workTime,
    },
    phones: safePhones(office.phones),
    workTime,
    isMachine: Boolean(office.isAPS || office.isMachine),
    latitude,
    longitude,
    weeklySchedule,
  };
};

export const useOffices = (deliveryMethod: string, city: string) => {
  return useQuery<Office[], Error>({
    queryKey: ["offices", deliveryMethod, city],
    queryFn: async () => {
      if (!city) return [];

      let offices: Office[] = [];
      if (deliveryMethod === "econt") {
        const econtOffices = await getEcontOfficesRest(city);
        offices = econtOffices.map((office) => {
          const mapped = mapApiOfficeToOffice(office);
          return {
            ...mapped,
            name: `Еконт офис ${mapped.name}`,
          };
        });
      } else if (deliveryMethod === "speedy") {
        const { getSpeedyOfficesRest } = await import(
          "@/services/speedyService"
        );
        const speedyOffices = await getSpeedyOfficesRest(city);
        offices = speedyOffices.map((office) => {
          const mapped = mapApiOfficeToOffice(office);
          return {
            ...mapped,
            name: `Спиди офис ${mapped.name}`,
          };
        });
      }

      return offices;
    },
    enabled: !!city && deliveryMethod !== "address",
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

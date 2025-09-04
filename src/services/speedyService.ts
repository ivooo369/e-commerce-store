import { SpeedyOfficeResponse } from "@/lib/interfaces";

function parseWorkTime(workTime: string): { day: string; time: string }[] {
  if (!workTime) {
    return [];
  }

  const parts = workTime.split(",").map((p) => p.trim());
  const schedule: { day: string; time: string }[] = [];

  const daysInOrder = [
    "Понеделник",
    "Вторник",
    "Сряда",
    "Четвъртък",
    "Петък",
    "Събота",
    "Неделя",
  ];

  for (const part of parts) {
    if (!part) continue;

    const dayMatch = part.match(/^([^:]+):/);
    if (!dayMatch) continue;

    const dayName = dayMatch[1].trim();
    const timePart = part.substring(dayMatch[0].length).trim();

    let formattedTime = timePart;
    if (timePart.toLowerCase() !== "почивен ден") {
      const timeMatch = timePart.match(
        /(\d{1,2})(?::(\d{2}))?\s*-\s*(\d{1,2})(?::(\d{2}))?/
      );
      if (timeMatch) {
        const [, startH, startM = "00", endH, endM = "00"] = timeMatch;
        formattedTime = `${startH.padStart(2, "0")}:${startM} - ${endH.padStart(
          2,
          "0"
        )}:${endM}`;
      }
    }

    schedule.push({
      day: dayName,
      time: formattedTime,
    });
  }

  const result = [];
  for (const day of daysInOrder) {
    const dayEntry = schedule.find((s) => s.day === day);
    if (dayEntry) {
      result.push(dayEntry);
    } else {
      result.push({
        day,
        time: "Почивен ден",
      });
    }
  }

  return result;
}

export async function getSpeedyOfficesRest(
  cityName: string
): Promise<SpeedyOfficeResponse[]> {
  try {
    const normalizeCityName = (name: string) => {
      if (!name) return "";

      let normalized = name
        .replace(/\(.*?\)/g, "")
        .split(",")[0]
        .replace(/\d+/g, "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\p{L}\s]/gu, "")
        .replace(/\s+/g, " ")
        .trim();

      if (normalized.includes("/")) {
        normalized = normalized.split("/")[0].trim();
      }

      return normalized;
    };

    const searchCity = normalizeCityName(cityName);

    const allOffices = (await import("@/lib/speedyOffices")).speedyOffices;

    const filteredOffices = allOffices.filter((office) => {
      const officeCity = normalizeCityName(office.city);

      return (
        officeCity === searchCity ||
        officeCity.includes(searchCity) ||
        searchCity.includes(officeCity) ||
        officeCity.split(" ").some((part) => part === searchCity) ||
        searchCity.split(" ").some((part) => part === officeCity)
      );
    });

    return filteredOffices.map((office) => {
      const weeklySchedule = parseWorkTime(office.workTime);

      let coordinates: [number, number] | null = null;
      const lat =
        office.latitude !== undefined ? Number(office.latitude) : null;
      const lng =
        office.longitude !== undefined ? Number(office.longitude) : null;

      if (
        lat !== null &&
        lng !== null &&
        !isNaN(lat) &&
        !isNaN(lng) &&
        Math.abs(lat) <= 90 &&
        Math.abs(lng) <= 180
      ) {
        coordinates = [lat, lng];
      } else {
        console.warn(
          "Пропускане на офис поради невалидни координати:",
          office.id,
          {
            lat,
            lng,
          }
        );
      }

      return {
        id: office.id,
        code: office.id,
        name: office.name,
        fullAddress: office.address,
        address: {
          city: {
            name: office.city,
          },
          fullAddress: office.address,
          quarter: "",
          street: office.address.split(",")[0] || "",
          num: "",
          other: "",
        },
        phones: [office.phone],
        workTime: weeklySchedule.map((s) => `${s.day}: ${s.time}`).join(", "),
        isAPS: office.isMachine,
        isMachine: office.isMachine,
        ...(coordinates && {
          location: {
            latitude: coordinates[0],
            longitude: coordinates[1],
          },
        }),
        weeklySchedule:
          weeklySchedule.length > 0
            ? weeklySchedule
            : [
                { day: "Понеделник", time: "09:00 ч. - 18:00 ч." },
                { day: "Вторник", time: "09:00 ч. - 18:00 ч." },
                { day: "Сряда", time: "09:00 ч. - 18:00 ч." },
                { day: "Четвъртък", time: "09:00 ч. - 18:00 ч." },
                { day: "Петък", time: "09:00 ч. - 18:00 ч." },
                { day: "Събота", time: "09:00 ч. - 14:00 ч." },
                { day: "Неделя", time: "Почивен ден" },
              ],
      };
    });
  } catch (error) {
    console.error("Възникна грешка:", error);
    return [];
  }
}

export async function getSpeedyOffices(
  cityName: string
): Promise<SpeedyOfficeResponse[]> {
  return getSpeedyOfficesRest(cityName);
}

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { EcontOffice } from "@/lib/types/interfaces";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

const formatTimeRange = (from: number, to: number) => {
  if (!from || !to) return null;
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(fromDate.getHours())}:${pad(fromDate.getMinutes())} ч. - ${pad(
    toDate.getHours()
  )}:${pad(toDate.getMinutes())} ч.`;
};

export async function GET(req: NextRequest) {
  try {
    const city = req.nextUrl.searchParams.get("city");
    const raw = req.nextUrl.searchParams.get("raw");
    const username = process.env.ECONT_USERNAME;
    const password = process.env.ECONT_PASSWORD;

    if (!username || !password) {
      return NextResponse.json(
        { message: "Липсват данни за достъп до Econt API!" },
        { status: 500 }
      );
    }

    const response = await axios.post(
      "https://ee.econt.com/services/Nomenclatures/NomenclaturesService.getOffices.json",
      { countryCode: "BGR" },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`
          ).toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data;

    if (raw === "1") {
      return NextResponse.json(data, { status: 200 });
    }

    let offices = data.offices || [];

    if (city) {
      const normalizedCity = city.split("/")[0].toLowerCase().trim();
      offices = offices.filter((office: EcontOffice) => {
        const officeCity = office.address?.city?.name?.toLowerCase().trim();
        return officeCity === normalizedCity;
      });
    }

    const mappedOffices = offices.map((office: EcontOffice) => {
      const normalTime = formatTimeRange(
        office.normalBusinessHoursFrom,
        office.normalBusinessHoursTo
      );

      const halfDayTime = formatTimeRange(
        office.halfDayBusinessHoursFrom,
        office.halfDayBusinessHoursTo
      );

      const weeklySchedule = [
        { day: "Понеделник", time: normalTime, isDayOff: !normalTime },
        { day: "Вторник", time: normalTime, isDayOff: !normalTime },
        { day: "Сряда", time: normalTime, isDayOff: !normalTime },
        { day: "Четвъртък", time: normalTime, isDayOff: !normalTime },
        { day: "Петък", time: normalTime, isDayOff: !normalTime },
        { day: "Събота", time: halfDayTime, isDayOff: !halfDayTime },
        { day: "Неделя", time: null, isDayOff: true },
      ];

      const allDaysOff = weeklySchedule.every((d) => d.isDayOff);

      return {
        id: office.id,
        name: office.name,
        fullAddress: office.address?.fullAddress || "",
        latitude: office.address?.location?.latitude || null,
        longitude: office.address?.location?.longitude || null,
        phones: Array.isArray(office.phones) ? office.phones : [],
        emails: Array.isArray(office.emails) ? office.emails : [],
        weeklySchedule,
        allDaysOff,
      };
    });

    return NextResponse.json(mappedOffices, { status: 200 });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { message: "Възникна грешка при извличане на офисите на Econt!" },
      { status: 500 }
    );
  }
}

"use client";

import React, { useEffect, useRef, useCallback, memo } from "react";
import L from "leaflet";
import { Office, OfficeMapProps } from "@/lib/types/interfaces";

const OfficeMap = memo(function OfficeMap({
  offices,
  selectedOfficeId,
  onOfficeSelect,
  className = "",
  center,
}: OfficeMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  const calculateMapBounds = useCallback(() => {
    const validOffices = offices.filter(
      (office) =>
        office.latitude !== undefined &&
        office.longitude !== undefined &&
        Math.abs(office.latitude) <= 90 &&
        Math.abs(office.longitude) <= 180
    );

    if (validOffices.length === 0) {
      return { center: [42.7339, 25.4858] as [number, number], zoom: 7 };
    }

    if (selectedOfficeId) {
      const selectedOffice = validOffices.find(
        (o) => o.id === selectedOfficeId
      );
      if (selectedOffice) {
        return {
          center: [selectedOffice.latitude!, selectedOffice.longitude!] as [
            number,
            number
          ],
          zoom: 15,
        };
      }
    }

    const lats = validOffices.map((o) => o.latitude!);
    const lngs = validOffices.map((o) => o.longitude!);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);
    const zoom =
      maxDiff < 0.1 ? 13 : maxDiff < 0.3 ? 12 : maxDiff < 0.5 ? 11 : 10;

    return {
      center: [centerLat, centerLng] as [number, number],
      zoom: Math.min(zoom, 15),
    };
  }, [offices, selectedOfficeId]);

  const centerMapOnLocation = useCallback(
    (lat: number, lng: number, zoom: number = 12) => {
      const map = mapRef.current;
      if (
        map &&
        !isNaN(lat) &&
        !isNaN(lng) &&
        Math.abs(lat) <= 90 &&
        Math.abs(lng) <= 180
      ) {
        map.setView(L.latLng(lat, lng), zoom, {
          animate: true,
          duration: 0.5,
        });
      } else {
        throw new Error(`Невалидни координати: lat=${lat}, lng=${lng}`);
      }
    },
    []
  );

  const createMarkerIcon = useCallback((letter: string = "O") => {
    return L.divIcon({
      html: `<div style="background-color: #3182ce; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${letter}</div>`,
      className: "",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    });
  }, []);

  const cleanupMarkers = useCallback(() => {
    if (!markersRef.current) return;

    markersRef.current.forEach((marker) => {
      try {
        if (marker && mapRef.current && mapRef.current.hasLayer(marker)) {
          mapRef.current.removeLayer(marker);
        }
      } catch {
        throw new Error("Възникна грешка при премахване на маркера!");
      }
    });
    markersRef.current = [];
  }, []);

  const cleanupMap = useCallback(() => {
    if (!mapRef.current) return;

    try {
      mapRef.current.eachLayer((layer) => {
        try {
          mapRef.current?.removeLayer(layer);
        } catch {
          throw new Error("Възникна грешка при премахване на слоя!");
        }
      });

      mapRef.current.remove();
      mapRef.current = null;
      initializedRef.current = false;
    } catch {
      throw new Error("Възникна грешка при изчистване на картата!");
    }
  }, []);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        cleanupMap();
      }
    };
  }, [cleanupMap]);

  useEffect(() => {
    return () => {
      cleanupMarkers();
    };
  }, [cleanupMarkers]);

  const officesString = JSON.stringify(offices);

  const centerLat = center?.[0];
  const centerLng = center?.[1];
  const centerKey = center ? `${centerLat},${centerLng}` : "";

  useEffect(() => {
    let updateTimeout: NodeJS.Timeout;
    const isMounted = true;

    if (!mapRef.current && mapContainerRef.current) {
      try {
        const { center: initialCenter, zoom: initialZoom } =
          calculateMapBounds();

        const center: L.LatLngTuple =
          Array.isArray(initialCenter) &&
          initialCenter.length === 2 &&
          typeof initialCenter[0] === "number" &&
          typeof initialCenter[1] === "number"
            ? [initialCenter[0], initialCenter[1]]
            : [42.7339, 25.4858];

        const map = L.map(mapContainerRef.current, {
          center: center,
          zoom: initialZoom,
          zoomControl: true,
          attributionControl: true,
          maxZoom: 22,
          minZoom: 3,
          zoomSnap: 0.5,
          zoomDelta: 0.5,
          wheelPxPerZoomLevel: 60,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 22,
          minZoom: 3,
        }).addTo(map);

        mapRef.current = map;
      } catch {
        throw new Error("Възникна грешка при инициализиране на картата!");
      }
    }

    const updateMap = () => {
      if (!isMounted || !mapRef.current || !mapContainerRef.current) return;

      try {
        const map = mapRef.current;

        const validOffices = offices.filter((office) => {
          const hasValidCoords =
            office.latitude !== undefined &&
            office.longitude !== undefined &&
            !isNaN(office.latitude) &&
            !isNaN(office.longitude) &&
            Math.abs(office.latitude) <= 90 &&
            Math.abs(office.longitude) <= 180;

          return hasValidCoords;
        });

        cleanupMarkers();

        const officeGroups: { [key: string]: Office[] } = {};
        validOffices.forEach((office) => {
          const key = `${office.latitude?.toFixed(
            6
          )},${office.longitude?.toFixed(6)}`;
          if (!officeGroups[key]) {
            officeGroups[key] = [];
          }
          officeGroups[key].push(office);
        });

        Object.entries(officeGroups).forEach(
          ([coords, officesAtLocation], index) => {
            try {
              const [lat, lng] = coords.split(",").map(Number);
              const firstOffice = officesAtLocation[0];
              const marker = L.marker([lat, lng], {
                icon: createMarkerIcon((index + 1).toString()),
                title: firstOffice.name,
              }).addTo(map);

              const popupContent = `
              <div style="min-width: 250px; max-height: 300px; overflow-y: auto;">
                ${officesAtLocation
                  .map(
                    (office, i) => `
                    <div style="${
                      i > 0
                        ? "margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;"
                        : ""
                    }">
                      <h3 style="margin: 0 0 8px 0; font-size: 1.1em; color: #2c5282;">${
                        office.name
                      }</h3>
                      <p style="margin: 0 0 4px 0; color: #4a5568;">${
                        office.address.full || ""
                      }</p>
                      ${
                        office.phones?.length
                          ? `<p style="margin: 6px 0 0 0; font-size: 0.9em; color: #4a5568;">
                            <span style="color: #2c5282; font-weight: 500;">📞 Телефон:</span> ${office.phones.join(
                              ", "
                            )}
                          </p>`
                          : ""
                      }
                    </div>
                  `
                  )
                  .join("")}
              </div>
            `;

              marker.bindPopup(popupContent);
              markersRef.current.push(marker);

              marker.on("click", () => {
                if (onOfficeSelect) {
                  onOfficeSelect(firstOffice.id);
                }
              });

              const selectedOffice = officesAtLocation.find(
                (o) => o.id === selectedOfficeId
              );
              if (selectedOffice) {
                centerMapOnLocation(lat, lng, 15);
                marker.openPopup();
              }
            } catch {
              throw new Error(
                `Възникна грешка при добавяне на маркер за местоположение: ${JSON.stringify(
                  coords
                )}`
              );
            }
          }
        );

        if (validOffices.length > 0) {
          if (selectedOfficeId) {
            const selectedOffice = validOffices.find(
              (o) => o.id === selectedOfficeId
            );
            if (selectedOffice) {
              centerMapOnLocation(
                selectedOffice.latitude!,
                selectedOffice.longitude!,
                15
              );
            }
          } else {
            const group = L.featureGroup(markersRef.current);
            if (group.getLayers().length > 0) {
              map.fitBounds(group.getBounds().pad(0.1));
            }
          }
        }
      } catch {
        throw new Error("Възникна грешка при обновяване на картата!");
      }
    };

    const debouncedUpdate = () => {
      if (updateTimeout) clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        if (isMounted && mapContainerRef.current) {
          updateMap();
        }
      }, 100);
    };

    if (mapRef.current) {
      debouncedUpdate();
    } else {
      const timer = setTimeout(() => {
        if (isMounted && mapContainerRef.current) {
          debouncedUpdate();
        }
      }, 100);

      return () => clearTimeout(timer);
    }

    return () => {
      if (updateTimeout) clearTimeout(updateTimeout);
    };
  }, [
    officesString,
    selectedOfficeId,
    onOfficeSelect,
    centerKey,
    calculateMapBounds,
    cleanupMarkers,
    centerMapOnLocation,
    createMarkerIcon,
    offices,
  ]);

  return (
    <div
      ref={mapContainerRef}
      className={`w-full h-full min-h-[400px] rounded-lg overflow-hidden z-[1] ${className}`}
    />
  );
});

export default OfficeMap;

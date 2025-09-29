import { memo } from "react";
import dynamic from "next/dynamic";
import type { OfficeMapProps } from "@/lib/types/interfaces";

const MapComponent = dynamic<OfficeMapProps>(
  () =>
    import("@/ui/components/maps/office-map").then((mod) => mod.default || mod),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="animate-pulse text-gray-500">
          Зареждане на картата...
        </div>
      </div>
    ),
  }
);

const DynamicOfficeMap = memo(function DynamicOfficeMap(props: OfficeMapProps) {
  return <MapComponent {...props} />;
});

DynamicOfficeMap.displayName = "DynamicOfficeMap";

export default DynamicOfficeMap;

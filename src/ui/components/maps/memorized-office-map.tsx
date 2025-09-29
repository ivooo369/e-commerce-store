import React, { memo, useMemo, useCallback } from "react";
import DynamicOfficeMap from "@/ui/components/maps/dynamic-office-map";
import { OfficeMapProps } from "@/lib/types/interfaces";

export const MemoizedOfficeMap = memo<OfficeMapProps>(
  ({ cityName, offices, selectedOfficeId, onOfficeSelect }) => {
    const handleOfficeSelect = useCallback(
      (officeId: string) => {
        onOfficeSelect?.(officeId);
      },
      [onOfficeSelect]
    );

    const memoizedMap = useMemo(() => {
      return (
        <DynamicOfficeMap
          cityName={cityName}
          offices={offices}
          selectedOfficeId={selectedOfficeId}
          onOfficeSelect={handleOfficeSelect}
        />
      );
    }, [cityName, offices, selectedOfficeId, handleOfficeSelect]);

    return memoizedMap;
  },
  (prevProps: OfficeMapProps, nextProps: OfficeMapProps) => {
    return (
      prevProps.cityName === nextProps.cityName &&
      prevProps.selectedOfficeId === nextProps.selectedOfficeId &&
      prevProps.offices === nextProps.offices
    );
  }
);

MemoizedOfficeMap.displayName = "MemoizedOfficeMap";

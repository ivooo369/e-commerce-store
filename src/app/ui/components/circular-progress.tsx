import * as React from "react";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";

export default function CircularSize({ message }: { message: string }) {
  return (
    <Stack direction="row" alignItems="center" className="flex gap-7">
      <CircularProgress size="7rem" />
      <p className="text-2xl font-bold">{message}</p>
    </Stack>
  );
}

import { PaginationButtonsProps } from "@/lib/interfaces";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { ChangeEvent } from "react";

export default function PaginationButtons({
  itemsPerPage,
  totalItems,
  paginate,
  currentPage,
  className = ""
}: PaginationButtonsProps & { className?: string }) {
  const pageCount = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (event: ChangeEvent<unknown>, value: number) => {
    paginate(value);
  };

  return (
    <Stack spacing={2} className={`justify-self-center ${className}`}>
      <Pagination
        count={pageCount}
        onChange={handlePageChange}
        variant="outlined"
        shape="rounded"
        color="primary"
        page={currentPage}
      />
    </Stack>
  );
}

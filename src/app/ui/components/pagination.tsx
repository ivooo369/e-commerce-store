import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { ChangeEvent } from "react";

interface PaginationButtonsProps {
  itemsPerPage: number;
  totalItems: number;
  paginate: (pageNumber: number) => void;
  currentPage: number;
}

export default function PaginationButtons({
  itemsPerPage,
  totalItems,
  paginate,
  currentPage,
}: PaginationButtonsProps) {
  const pageCount = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (event: ChangeEvent<unknown>, value: number) => {
    paginate(value);
  };

  return (
    <Stack spacing={2} className="justify-self-center">
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

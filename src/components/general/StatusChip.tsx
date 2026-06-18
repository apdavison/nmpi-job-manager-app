import { Chip } from "@mui/material";
import type { ChipProps } from "@mui/material";

interface StatusChipProps {
  status: string;
}

function StatusChip(props: StatusChipProps) {
  const colours: Record<string, ChipProps["color"]> = {
    finished: "success",
    error: "error",
    running: "warning",
    validated: "info",
    submitted: "info",
  };

  return <Chip label={props.status} size="small" color={colours[props.status]} />;
}

export default StatusChip;

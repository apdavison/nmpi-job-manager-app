import { isValidElement } from "react";
import type { ReactNode } from "react";
import { Paper, Table, TableBody, TableRow, TableContainer, TableCell } from "@mui/material";

interface KeyValueTableProps {
  data?: Record<string, unknown>;
  boldKeys?: boolean;
}

function KeyValueTable(props: KeyValueTableProps) {
  let formatKey = (key: string): ReactNode => {
    return key;
  };
  if (props.boldKeys) {
    formatKey = (key: string): ReactNode => {
      return <b>{key}</b>;
    };
  }

  const rows: ReactNode[] = [];
  if (props.data) {
    for (const [key, value] of Object.entries(props.data)) {
      let valueStr: ReactNode = value as ReactNode;
      if (!isValidElement(value)) {
        // allow passing JSX as values
        valueStr = String(value);
        if (Array.isArray(value)) {
          valueStr = value.join(", ");
        }
      }

      rows.push(
        <TableRow key={key} sx={{ "&:last-child td": { border: 0 } }}>
          <TableCell>{formatKey(key)}</TableCell>
          <TableCell>{valueStr}</TableCell>
        </TableRow>
      );
    }
  }

  return (
    <TableContainer component={Paper} sx={{ width: "max-content" }}>
      <Table size="small" aria-label="key-value table">
        <TableBody>{rows}</TableBody>
      </Table>
    </TableContainer>
  );
}

export default KeyValueTable;

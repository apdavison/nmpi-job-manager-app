import { useState } from "react";
import type { ChangeEvent } from "react";
import {
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";

import type { Quota } from "../../types";
import { defaultQuotaSizes, platformUnits } from "../../globals";

interface QuotasTableProps {
  quotas: Quota[];
  newQuotaPlatform: string;
  setNewQuotaPlatform: (value: string) => void;
  newQuotaLimit: string;
  setNewQuotaLimit: (value: string) => void;
  allowNew: boolean;
}

function QuotasTable(props: QuotasTableProps) {
  const { quotas, newQuotaPlatform, setNewQuotaPlatform, newQuotaLimit, setNewQuotaLimit } = props;
  const [nonDefaultQuota, setNonDefaultQuota] = useState(false);

  const isValidNumber = (value: string) => {
    return !isNaN(Number(value));
  };

  let newQuotaForm = <></>;
  if (props.allowNew) {
    newQuotaForm = (
      <TableRow key="new quota">
        <TableCell>
          <Select
            size="small"
            label="Platform"
            value={newQuotaPlatform}
            onChange={(event: SelectChangeEvent) => {
              setNewQuotaPlatform(event.target.value);
            }}
          >
            <MenuItem value="SpiNNaker">SpiNNaker</MenuItem>
            <MenuItem value="BrainScaleS">BrainScaleS</MenuItem>
            <MenuItem value="BrainScaleS-2">BrainScaleS-2</MenuItem>
            <MenuItem value="Spikey">Spikey</MenuItem>
            <MenuItem value="Demo">Demo</MenuItem>
          </Select>
        </TableCell>
        <TableCell>
          <TextField
            size="small"
            value={nonDefaultQuota ? newQuotaLimit : defaultQuotaSizes[newQuotaPlatform]}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setNonDefaultQuota(true);
              setNewQuotaLimit(event.target.value);
            }}
            error={!isValidNumber(newQuotaLimit)}
            helperText={isValidNumber(newQuotaLimit) ? "" : "Enter a number"}
          />
        </TableCell>
        <TableCell>0</TableCell>
        <TableCell>{platformUnits[newQuotaPlatform]}</TableCell>
      </TableRow>
    );
  }
  if (quotas.length > 0 || props.allowNew) {
    return (
      <>
        <Typography variant="subtitle1">Quotas</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Platform</TableCell>
              <TableCell>Limit</TableCell>
              <TableCell>Usage</TableCell>
              <TableCell>Units</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quotas.map((quota) => (
              <TableRow key={quota.resource_uri}>
                <TableCell>{quota.platform}</TableCell>
                <TableCell>{quota.limit}</TableCell>
                <TableCell>{quota.usage}</TableCell>
                <TableCell>{quota.units}</TableCell>
              </TableRow>
            ))}
            {newQuotaForm}
          </TableBody>
        </Table>
      </>
    );
  } else {
    return null;
  }
}

export default QuotasTable;

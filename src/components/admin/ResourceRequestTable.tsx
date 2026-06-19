import { useState, useEffect, useCallback } from "react";
import type { ChangeEvent } from "react";
import {
  Box,
  ButtonGroup,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper,
  Typography,
} from "@mui/material";

import FilterButton from "./FilterButton";
import ResourceRequestDialog from "./ResourceRequestDialog";
import { queryResourceRequests } from "../../datastore";
import type { Auth, Quota, Project } from "../../types";

interface Counter {
  [key: string]: number;
}

interface Dict {
  [key: string]: string;
}

function sortById(a: Project, b: Project) {
  /* Newer requests should be at the start of the list */
  if (a.submission_date) {
    if (b.submission_date) {
      if (a.submission_date > b.submission_date) {
        return -1;
      } else {
        return 1;
      }
    } else {
      return -1;
    }
  } else {
    if (b.submission_date) {
      return 1;
    } else {
      return 0;
    }
  }
}

function QuotaSummary({ quotas }: { quotas: Quota[] }) {
  /* Where we have multiple quotas for the same platform, sum up the usage and limits,
     so we have at most one line per platform. */
  const summedUsage: Counter = {};
  const summedLimits: Counter = {};
  const units: Dict = {};

  for (const quota of quotas) {
    if (quota.platform in summedUsage) {
      summedUsage[quota.platform] += quota.usage;
      summedLimits[quota.platform] += quota.limit;
      // todo: check units match
    } else {
      summedUsage[quota.platform] = quota.usage;
      summedLimits[quota.platform] = quota.limit;
      units[quota.platform] = quota.units;
    }
  }
  const percentUsed: Counter = {};
  for (const platform in summedUsage) {
    percentUsed[platform] = Math.floor((100 * summedUsage[platform]) / summedLimits[platform]);
  }

  const getColour = (usage: number) => {
    if (usage < 50) {
      return "green";
    } else if (usage >= 100) {
      return "red";
    } else {
      return "orange";
    }
  };

  return (
    <div>
      {Object.keys(summedUsage).map((platform) => (
        <Typography variant="body2" key={platform} sx={{ color: getColour(percentUsed[platform]) }}>
          {`${platform}: ${percentUsed[platform]}%`}
          <br />
        </Typography>
      ))}
    </div>
  );
}

function ResourceRequestTable({ auth }: { auth: Auth }) {
  const [resourceRequests, setResourceRequests] = useState<Project[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentResourceRequest, setCurrentResourceRequest] = useState(0);
  const [statusFilter, setStatusFilter] = useState("under review");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(
    (signal?: AbortSignal) => {
      queryResourceRequests(auth, signal)
        .then((data) => {
          setResourceRequests(data.sort(sortById));
          setLoading(false);
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.error(err);
            // Stop showing the spinner even on failure, rather than spinning forever.
            setLoading(false);
          }
        });
    },
    [auth]
  );

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  const handleRowClick = (rowIndex: number) => {
    setCurrentResourceRequest(rowIndex);
    setDialogOpen(true);
  };

  const handleClose = async () => {
    setDialogOpen(false);
    loadData();
  };

  const filterResourceRequests = (rr: Project) => {
    let include = rr.status === statusFilter;
    if (include && searchInput) {
      include =
        rr.title.toLowerCase().includes(searchInput) ||
        rr.abstract.toLowerCase().includes(searchInput) ||
        rr.owner.includes(searchInput);
    }
    return include;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const visibleRequests = resourceRequests.filter(filterResourceRequests);

  return (
    <>
      <Stack direction="row" spacing={2}>
        <ButtonGroup sx={{ paddingBottom: 3 }}>
          <FilterButton target="accepted" current={statusFilter} onClick={setStatusFilter} />
          <FilterButton target="under review" current={statusFilter} onClick={setStatusFilter} />
          <FilterButton target="in preparation" current={statusFilter} onClick={setStatusFilter} />
          <FilterButton target="rejected" current={statusFilter} onClick={setStatusFilter} />
        </ButtonGroup>
        <TextField
          id="searchField"
          label="Search"
          variant="outlined"
          size="small"
          sx={{ width: "50%" }}
          value={searchInput}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setSearchInput(event.target.value.toLowerCase());
          }}
        />
      </Stack>

      {visibleRequests.length > 0 ? (
        <TableContainer component={Paper} sx={{ marginBottom: 5 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Abstract</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Quotas</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRequests.map((rr, index) => (
                <TableRow key={rr.resource_uri} onClick={() => handleRowClick(index)}>
                  <TableCell>{rr.title}</TableCell>
                  <TableCell>{rr.status}</TableCell>
                  <TableCell>{rr.abstract}</TableCell>
                  <TableCell>{rr.owner}</TableCell>
                  <TableCell>
                    <QuotaSummary quotas={rr.quotas} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>
          No {statusFilter} resource requests
        </Typography>
      )}

      <ResourceRequestDialog
        open={dialogOpen}
        onClose={handleClose}
        resourceRequest={visibleRequests[currentResourceRequest]}
        auth={auth}
      />
    </>
  );
}

export default ResourceRequestTable;

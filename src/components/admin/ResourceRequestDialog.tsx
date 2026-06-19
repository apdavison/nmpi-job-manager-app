import { useEffect, useState } from "react";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";

import QuotasTable from "./QuotasTable";
import { addQuota, updateResourceRequest } from "../../datastore";
import { platformUnits } from "../../globals";
import type { Auth, NewQuota, Project } from "../../types";

interface RRDialogProps {
  auth: Auth;
  open: boolean;
  resourceRequest: Project | undefined;
  onClose: () => void;
}

const chipColours: Record<string, string> = {
  accepted: "#99cc33",
  "under review": "#99cc33",
  "in preparation": "#ffcc00",
  rejected: "#ff9966",
};

function isValidNumber(value: string): boolean {
  return value.trim() !== "" && !isNaN(Number(value));
}

interface AcceptedRequestActionsProps {
  onClose: () => void;
  onAddQuota: () => void;
}

interface UnderReviewRequestActionsProps {
  onClose: () => void;
  onAcceptRequest: () => void;
  onRejectRequest: () => void;
  onUpdateRequest: () => void;
}

function AcceptedRequestActions(props: AcceptedRequestActionsProps) {
  return (
    <>
      <Button variant="contained" color="secondary" onClick={props.onClose}>
        Cancel
      </Button>
      <Button variant="contained" onClick={props.onAddQuota}>
        Add quota
      </Button>
    </>
  );
}

function UnderReviewRequestActions(props: UnderReviewRequestActionsProps) {
  return (
    <>
      <Button variant="contained" color="secondary" onClick={props.onClose}>
        Cancel
      </Button>
      <Button variant="contained" onClick={props.onRejectRequest}>
        Reject
      </Button>
      <Button variant="contained" onClick={props.onAcceptRequest}>
        Accept with Requested Quotas
      </Button>
      <Button variant="contained" onClick={props.onUpdateRequest}>
        Accept but Set Different Quotas
      </Button>
    </>
  );
}

function DefaultActions({ onClose }: { onClose: () => void }) {
  return (
    <Button variant="contained" color="secondary" onClick={onClose}>
      Cancel
    </Button>
  );
}

function ResourceRequestDialog(props: RRDialogProps) {
  const { auth, onClose, resourceRequest, open } = props;
  const [newQuotaPlatform, setNewQuotaPlatform] = useState("SpiNNaker");
  const [newQuotaLimit, setNewQuotaLimit] = useState("0");
  const [description, setDescription] = useState("");

  // Seed the editable description from the current request whenever it changes,
  // rather than mutating the prop during render.
  useEffect(() => {
    setDescription(resourceRequest?.description ?? "");
  }, [resourceRequest]);

  if (!resourceRequest) {
    return null;
  }

  const handleAddQuota = () => {
    if (!isValidNumber(newQuotaLimit)) {
      return;
    }
    const newQuota: NewQuota = {
      platform: newQuotaPlatform,
      limit: Number(newQuotaLimit),
      units: platformUnits[newQuotaPlatform] || "",
    };
    addQuota(resourceRequest, newQuota, auth)
      .then(onClose)
      .catch((err) => console.error(err));
  };

  const update = (status: string, newDescription?: string) => {
    updateResourceRequest(
      resourceRequest,
      {
        title: resourceRequest.title,
        abstract: resourceRequest.abstract,
        owner: resourceRequest.owner,
        status,
        ...(newDescription !== undefined ? { description: newDescription } : {}),
      },
      auth
    )
      .then(onClose)
      .catch((err) => console.error(err));
  };

  const handleUpdateRequest = () => update("accepted", description);
  const handleAcceptRequest = () => update("accepted");
  const handleRejectRequest = () => update("rejected");

  let actions = <DefaultActions onClose={onClose} />;
  let dateInformation = <></>;
  switch (resourceRequest.status) {
    case "accepted":
      actions = <AcceptedRequestActions onClose={onClose} onAddQuota={handleAddQuota} />;
      dateInformation = (
        <Typography variant="caption">
          <b>Submitted</b>: {resourceRequest.submission_date}&nbsp;
          <b>Accepted</b>: {resourceRequest.decision_date}
        </Typography>
      );
      break;
    case "under review":
      actions = (
        <UnderReviewRequestActions
          onClose={onClose}
          onAcceptRequest={handleAcceptRequest}
          onRejectRequest={handleRejectRequest}
          onUpdateRequest={handleUpdateRequest}
        />
      );
      dateInformation = (
        <Typography variant="caption" component="div">
          <b>Submitted</b>: {resourceRequest.submission_date}
          <TextField
            fullWidth
            multiline
            size="small"
            label="Description"
            sx={{ mt: 1 }}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Typography>
      );
      break;
  }

  return (
    <Dialog onClose={onClose} open={open} fullWidth maxWidth="lg">
      <DialogTitle>
        <Chip
          label={resourceRequest.status}
          size="small"
          sx={{ backgroundColor: chipColours[resourceRequest.status] }}
        />
        &nbsp;{resourceRequest.title}
        <br />
        {dateInformation}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ marginBottom: 1 }}>
          {resourceRequest.abstract}
        </Typography>
        <Typography variant="caption" sx={{ marginBottom: 2 }}>
          {resourceRequest.description}
        </Typography>
        <QuotasTable
          quotas={resourceRequest.quotas}
          newQuotaPlatform={newQuotaPlatform}
          setNewQuotaPlatform={setNewQuotaPlatform}
          newQuotaLimit={newQuotaLimit}
          setNewQuotaLimit={setNewQuotaLimit}
          allowNew={resourceRequest.status === "accepted"}
        />
      </DialogContent>
      <DialogActions>{actions}</DialogActions>
    </Dialog>
  );
}

export default ResourceRequestDialog;

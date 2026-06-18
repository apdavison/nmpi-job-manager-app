import React from "react";
import type { ReactNode } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";

interface AlertDialogProps {
  open: boolean;
  onClose: (value: boolean) => void;
  content: ReactNode;
}

export default function AlertDialog(props: AlertDialogProps) {
  return (
    <React.Fragment>
      <Dialog open={props.open} onClose={() => props.onClose(false)}>
        <DialogContent>
          <DialogContentText>{props.content}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={() => props.onClose(false)}>
            No
          </Button>
          <Button variant="contained" color="primary" onClick={() => props.onClose(true)} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

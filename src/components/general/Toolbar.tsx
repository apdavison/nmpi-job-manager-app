import { Fragment, useContext } from "react";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";

import {
  AppBar,
  Avatar,
  Button,
  ButtonGroup,
  Toolbar as MUIToolbar,
  Typography,
} from "@mui/material";

import { AuthContext, RequestedCollabContext } from "../../context";

function renderButtons(page: string, collab?: string): ReactNode {
  switch (page) {
    case "jobs":
      return (
        <Fragment>
          <Typography variant="body2" color="inherit" noWrap sx={{ mr: 1 }}>
            {collab}
          </Typography>
          <ButtonGroup>
            <Button
              color="inherit"
              variant="outlined"
              component={RouterLink}
              to={`/${collab}/projects/`}
            >
              Quotas
            </Button>
            <Button
              color="inherit"
              variant="outlined"
              component={RouterLink}
              to={`/${collab}/jobs/new`}
            >
              New job
            </Button>
          </ButtonGroup>
        </Fragment>
      );
    case "job-detail":
      return (
        <Fragment>
          <Typography variant="body2" color="inherit" noWrap sx={{ mr: 1 }}>
            {collab}
          </Typography>
          <ButtonGroup>
            <Button
              color="inherit"
              variant="outlined"
              component={RouterLink}
              to={`/${collab}/jobs/`}
            >
              Jobs
            </Button>
            <Button
              color="inherit"
              variant="outlined"
              component={RouterLink}
              to={`/${collab}/projects/`}
            >
              Quotas
            </Button>
            <Button
              color="inherit"
              variant="outlined"
              component={RouterLink}
              to={`/${collab}/jobs/new`}
            >
              New job
            </Button>
          </ButtonGroup>
        </Fragment>
      );
    case "create":
      return (
        <Fragment>
          <Typography variant="body2" color="inherit" noWrap sx={{ mr: 1 }}>
            {collab}
          </Typography>
          <ButtonGroup>
            <Button
              color="inherit"
              variant="outlined"
              component={RouterLink}
              to={`/${collab}/projects/`}
            >
              Quotas
            </Button>
            <Button
              color="inherit"
              variant="outlined"
              component={RouterLink}
              to={`/${collab}/jobs/`}
            >
              Jobs
            </Button>
          </ButtonGroup>
        </Fragment>
      );
    case "projects":
      return (
        <Fragment>
          <Typography variant="body2" color="inherit" noWrap sx={{ mr: 1 }}>
            {collab}
          </Typography>
          <ButtonGroup>
            <Button
              color="inherit"
              variant="outlined"
              component={RouterLink}
              to={`/${collab}/jobs/`}
            >
              Jobs
            </Button>
          </ButtonGroup>
        </Fragment>
      );
    default:
      return "";
  }
}

function getHomeURL(requestedCollabId: string | null): string {
  if (requestedCollabId) {
    return `/?clb-collab-auth=${requestedCollabId}`;
  } else {
    return "/";
  }
}

interface ToolbarProps {
  page: string;
  collab?: string;
}

function Toolbar(props: ToolbarProps) {
  const requestedCollabId = useContext(RequestedCollabContext);
  const auth = useContext(AuthContext);
  const appName = props.page === "admin" ? "Admin" : "Job Manager";

  return (
    <Fragment>
      <AppBar
        position="relative"
        sx={{
          backgroundImage: "linear-gradient(to right, #00395d, #5cc766)",
        }}
      >
        <MUIToolbar>
          <Avatar sx={{ mr: 2 }} alt="EBRAINS" src="/favicon.png" />
          <Typography
            variant="h6"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1, textDecoration: "none" }}
            component={RouterLink}
            to={getHomeURL(requestedCollabId)}
          >
            EBRAINS Neuromorphic Computing Service: {appName}
          </Typography>
          {auth?.isAdmin && props.page !== "admin" && (
            <Button
              color="inherit"
              variant="outlined"
              component={RouterLink}
              to="/admin"
              sx={{ mr: 1 }}
            >
              Admin
            </Button>
          )}
          {renderButtons(props.page, props.collab)}
        </MUIToolbar>
      </AppBar>
    </Fragment>
  );
}

export default Toolbar;

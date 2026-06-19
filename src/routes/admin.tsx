// TODO: bring this route in line with the rest of the app's data flow. Every other route
// reads through a `getLoader(auth)` closure with defer/Await, and `projects` routes its
// mutations through a router `action` + `useFetcher` (which auto-revalidates the loader).
// This route instead self-fetches in ResourceRequestTable's useEffect and reloads
// imperatively on dialog close. Left as a follow-up.

import { useContext } from "react";

import { Container, Typography } from "@mui/material";

import Toolbar from "../components/general/Toolbar";
import ResourceRequestTable from "../components/admin/ResourceRequestTable";
import { AuthContext } from "../context";

function AdminRoute() {
  const auth = useContext(AuthContext);

  return (
    <div>
      <Toolbar page="admin" />
      <main>
        <Container maxWidth="xl">
          <Typography variant="h2" sx={{ mt: 4, mb: 2 }}>
            Resource Requests
          </Typography>
          {auth?.isAdmin ? (
            <ResourceRequestTable auth={auth} />
          ) : (
            <Typography>This section is for administrators only.</Typography>
          )}
        </Container>
      </main>
    </div>
  );
}

export default AdminRoute;

import React from "react";
import { Await, defer, useLoaderData, useParams } from "react-router-dom";
import type { LoaderFunctionArgs } from "react-router-dom";

import { Container } from "@mui/material";

import { queryProjects } from "../datastore";
import ProjectList from "../components/projects/ProjectList";
import Toolbar from "../components/general/Toolbar";
import ProgressIndicator from "../components/general/ProgressIndicator";
import ErrorInDataLoading from "../components/general/ErrorInDataLoading";
import type { Auth, Project } from "../types";

export function getLoader(auth: Auth) {
  const loader = async ({ params }: LoaderFunctionArgs) => {
    const projectListPromise = queryProjects(params.collabId!, auth);
    return defer({ projects: projectListPromise });
  };
  return loader;
}

function ProjectListRoute() {
  const data = useLoaderData() as { projects: Promise<Project[]> };
  const { collabId } = useParams() as { collabId: string };

  return (
    <div>
      <Toolbar page="projects" collab={collabId} />
      <main>
        <Container maxWidth="xl">
          <div id="project-list">
            <React.Suspense fallback={<ProgressIndicator />}>
              <Await resolve={data.projects} errorElement={<ErrorInDataLoading />}>
                {(projects: Project[]) => <ProjectList projects={projects} collab={collabId} />}
              </Await>
            </React.Suspense>
          </div>
        </Container>
      </main>
    </div>
  );
}

export default ProjectListRoute;

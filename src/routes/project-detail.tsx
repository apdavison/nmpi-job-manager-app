import type { ActionFunctionArgs } from "react-router-dom";

import { patchProject, createProject, deleteProject } from "../datastore";
import type { Auth } from "../types";

function updateProject(auth: Auth) {
  const wrappedUpdateProject = async ({ request, params }: ActionFunctionArgs) => {
    const { collabId } = params;
    const projectData = await request.json();
    const projectId = projectData.id;
    delete projectData.id;
    if (request.method === "PUT") {
      return patchProject(collabId!, projectId, projectData, auth);
    } else if (request.method === "POST") {
      return createProject(collabId!, projectData, auth);
    } else if (request.method === "DELETE") {
      return deleteProject(collabId!, projectId, auth);
    } else {
      throw new Error("unexpected request method");
    }
  };
  return wrappedUpdateProject;
}

export { updateProject };

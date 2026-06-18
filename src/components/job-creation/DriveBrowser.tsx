import { useEffect, useState, useContext } from "react";

import { driveServer } from "../../globals";
import { AuthContext } from "../../context";
import FileBrowser from "./FileBrowser";
import type { Auth } from "../../types";

export interface DriveRepo {
  id: string;
  group_name: string;
}

export interface DriveEntry {
  id: string;
  name: string;
  type: string;
  size?: number;
  mtime?: number;
  // populated by getRepoContents before the entries are rendered
  path: string;
}

function getRequestConfig(auth: Auth): RequestInit {
  const config: RequestInit = {
    headers: {
      Authorization: `Bearer ${auth.token}`,
      "Content-Type": "application/json",
    },
  };
  return config;
}

async function getCollabRepo(collabId: string, auth: Auth): Promise<DriveRepo> {
  const url = driveServer + "/api2/repos/?type=group";
  const response = await fetch(url, getRequestConfig(auth));
  const repos: DriveRepo[] = await response.json();
  const repo = repos.filter((r) => r.group_name.startsWith(`collab-${collabId}-`));
  return repo[0];
}

async function getRepoContents(
  repoId: string,
  path: string,
  auth: Auth
): Promise<DriveEntry[]> {
  let url = driveServer + "/api2/repos/" + repoId + "/dir/";
  if (path) {
    url += "?p=" + path;
  }
  const response = await fetch(url, getRequestConfig(auth));
  const contents: DriveEntry[] = await response.json();
  for (const index in contents) {
    contents[index].path = path;
  }
  return contents;
}

interface DriveBrowserProps {
  collab: string;
  height: string;
  value: string;
  onChange: (value: string) => void;
}

function DriveBrowser(props: DriveBrowserProps) {
  const [contents, setContents] = useState<DriveEntry[]>([]);
  const [path, setPath] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = useContext(AuthContext)!;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const repo = await getCollabRepo(props.collab, auth);
      setContents(await getRepoContents(repo.id, path, auth));
      setLoading(false);
    }
    fetchData();
  }, [props.collab, path, auth]);

  // todo: only show .py, .tar, .tar.gz, .tgz, .zip files

  return (
    <FileBrowser
      contents={contents}
      path={path}
      onChangePath={setPath}
      selected={props.value}
      onSetSelected={props.onChange}
      height={props.height}
      loading={loading}
    />
  );
}

export default DriveBrowser;

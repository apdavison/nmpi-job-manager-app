import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useSubmit } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  Download as DownloadIcon,
  FolderOpen as FolderOpenIcon,
  InsertDriveFile as FileIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import Panel from "../general/Panel";
import Preview from "./Preview";
import { guessContentType } from "../../utils";
import type { DataItem, DataSet } from "../../types";

function removePrefixFromPath(prefix: string, path: string | undefined): string {
  return (path ?? "").slice(prefix.length);
}

function formatFileSize(size: number | undefined): ReactNode {
  if (size) {
    let text = `${size} bytes`;
    if (size >= 1024) {
      text = `${(size / 1024).toFixed(1)} KiB`;
    }
    return (
      <Typography variant="body2" color="gray" sx={{ lineHeight: "24px" }} noWrap>
        {text}
      </Typography>
    );
  } else {
    return "";
  }
}

function getContentType(
  contentType: string | undefined,
  url: string
): string | null | undefined {
  if (contentType) {
    return contentType;
  } else {
    return guessContentType(url);
  }
}

interface CopyButtonsProps {
  collab: string;
  jobId: number | string;
  currentRepository: string;
}

function CopyButtons(props: CopyButtonsProps) {
  const submit = useSubmit();
  const [copying, setCopying] = useState(false);

  const handleCopy = (destination: string) => {
    setCopying(true);
    const repositoryData = {
      targetRepository: destination,
    };
    submit(repositoryData, {
      method: "put",
      encType: "application/json",
      action: `/${props.collab}/jobs/${props.jobId}`,
      navigate: true,
    });
  };

  useEffect(() => {
    setCopying(false);
  }, [props.currentRepository]);

  let progressIndicator: ReactNode = "";
  if (copying) {
    progressIndicator = <CircularProgress size={20} />;
  }

  if (props.currentRepository.includes("temporary") && !props.collab.startsWith("private-")) {
    return (
      <Stack direction="row" spacing={1} sx={{ paddingTop: 2 }}>
        <Button
          size="small"
          variant="contained"
          disabled={copying}
          onClick={() => handleCopy("EBRAINS Drive")}
        >
          Copy to Drive
        </Button>
        <Button
          size="small"
          variant="contained"
          disabled={copying}
          onClick={() => handleCopy("EBRAINS Bucket")}
        >
          Copy to Bucket
        </Button>
        {progressIndicator}
      </Stack>
    );
  }
}

interface FilesPanelProps {
  dataset: DataSet | null;
  label: string;
  collab: string;
  jobId: number | string;
}

function FilesPanel(props: FilesPanelProps) {
  const [previewTarget, setPreviewTarget] = useState<DataItem | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  const handleOpenPreview = (target: DataItem) => {
    setPreviewTarget(target);
    setPreviewDialogOpen(true);
  };

  if (props.dataset) {
    return (
      <Panel
        label={props.label}
        icon={<FolderOpenIcon color="disabled" sx={{ mr: 1 }} />}
        defaultExpanded={true}
      >
        <Typography variant="body2" sx={{ paddingTop: 2, paddingBottom: 1 }}>
          {props.dataset.repository}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
          {props.dataset.files.map((file) => (
            <Card key={file.path} sx={{ paddingTop: 1, backgroundColor: "#f8f8f8" }}>
              <CardContent>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <FileIcon color="disabled" />

                  <Tooltip title={`digest: ${file.hash}`}>
                    <Typography variant="body2" color="primary" noWrap>
                      {removePrefixFromPath(`/${props.collab}`, file.path)}
                    </Typography>
                  </Tooltip>

                  {formatFileSize(file.size)}

                  <Tooltip title="Download">
                    <IconButton href={file.url} target="_blank">
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  {getContentType(file.content_type, file.url) ? (
                    <Tooltip title="Preview">
                      <IconButton onClick={() => handleOpenPreview(file)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    ""
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
        <CopyButtons
          currentRepository={props.dataset.repository}
          collab={props.collab}
          jobId={props.jobId}
        />
        <Preview
          url={previewTarget?.url}
          size={previewTarget?.size}
          contentType={previewTarget?.content_type}
          open={previewDialogOpen}
          onClose={() => setPreviewDialogOpen(false)}
        />
      </Panel>
    );
  } else {
    return "";
  }
}
export default FilesPanel;

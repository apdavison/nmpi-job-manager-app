function timeFormat(defaultFormatDate: string | null | undefined): string {
  const formattedDate =
    String(defaultFormatDate).slice(0, 4) +
    "/" +
    String(defaultFormatDate).slice(5, 7) +
    "/" +
    String(defaultFormatDate).slice(8, 10) +
    " " +
    String(defaultFormatDate).slice(11, 19);

  return formattedDate;
}

function parseArray(string: string): string[] {
  const parts = string.split(",");
  return parts.map((item) => item.trim());
}

function formatArray(arr: unknown): string {
  if (Array.isArray(arr)) {
    return arr.join(", ");
  } else if (arr) {
    return String(arr);
  } else {
    return "";
  }
}

function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

function isAlmostEmpty(obj: object): boolean {
  return Object.keys(obj).length <= 1;
}

function jobIsIncomplete(job: { status: string }): boolean {
  return ["submitted", "running", "validated"].includes(job.status);
}

const EXTENSION_CONTENT_TYPE_MAP: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  txt: "text/plain",
  out: "text/plain",
  err: "text/plain",
  //zip: "application/zip",
  //pdf: "application/pdf",
};

function guessContentType(url: string): string | null | undefined {
  const parts = url.split(".");
  const extension = parts[parts.length - 1];
  if (extension) {
    return EXTENSION_CONTENT_TYPE_MAP[extension.toLowerCase()];
  } else {
    return null;
  }
}

export {
  timeFormat,
  parseArray,
  formatArray,
  isEmpty,
  isAlmostEmpty,
  jobIsIncomplete,
  guessContentType,
};

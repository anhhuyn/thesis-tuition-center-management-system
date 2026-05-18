// utils/storageHelpers.ts
export const parseFileSize = (size: string): number => {
  if (!size) return 0;

  const text = size.trim().toUpperCase();
  const value = parseFloat(text);

  if (text.includes("GB")) return value * 1024 * 1024 * 1024;
  if (text.includes("MB")) return value * 1024 * 1024;
  if (text.includes("KB")) return value * 1024;
  if (text.includes("B")) return value;

  return value || 0;
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + " " + sizes[i];
};

export const calculateStorageStats = (materials: any[], maxStorage: number) => {
  const totalUsed = materials.reduce(
    (sum, item) => sum + parseFileSize(item.fileSize),
    0
  );

  const usedPercent = Math.min((totalUsed / maxStorage) * 100, 100);

  const pdfSize = materials
    .filter((m) => m.type.includes("pdf"))
    .reduce((sum, m) => sum + parseFileSize(m.fileSize), 0);

  const docsSize = materials
    .filter((m) =>
      ["doc", "docx", "ppt", "pptx", "xls", "xlsx"].some((t) =>
        m.type.includes(t)
      )
    )
    .reduce((sum, m) => sum + parseFileSize(m.fileSize), 0);

  const videoSize = materials
    .filter((m) => m.type.includes("mp4"))
    .reduce((sum, m) => sum + parseFileSize(m.fileSize), 0);

  const otherSize = Math.max(0, totalUsed - pdfSize - docsSize - videoSize);

  return {
    totalUsed,
    usedPercent,
    pdfSize,
    docsSize,
    videoSize,
    otherSize,
  };
};
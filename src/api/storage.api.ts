import api from "./axios";
import env from "@/config/env";

export interface FileInfo {
  fileName: string;
  originalName: string;
  filePath: string;
  fileUrl: string;
  contentType: string;
  size: number;
  uploadedAt: string;
}

/**
 * Upload a single file to the given folder.
 */
export async function uploadFile(
  file: File,
  folder: string
): Promise<FileInfo> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post<FileInfo>(
    `/files/upload?folder=${encodeURIComponent(folder)}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return res.data;
}

/**
 * Upload multiple files to the given folder.
 */
export async function uploadFiles(
  files: File[],
  folder: string
): Promise<FileInfo[]> {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));

  const res = await api.post<FileInfo[]>(
    `/files/upload-multiple?folder=${encodeURIComponent(folder)}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return res.data;
}

/**
 * Delete a file by its relative path.
 */
export async function deleteFile(filePath: string): Promise<void> {
  await api.delete(`/files?path=${encodeURIComponent(filePath)}`);
}

/**
 * Get file metadata by its relative path.
 */
export async function getFileInfo(filePath: string): Promise<FileInfo> {
  const res = await api.get<FileInfo>(
    `/files/info?path=${encodeURIComponent(filePath)}`
  );
  return res.data;
}

/**
 * Returns the full URL to access/download a file.
 */
export function getFileUrl(filePath: string): string {
  return `${env.API_URL}/files/${filePath}`;
}

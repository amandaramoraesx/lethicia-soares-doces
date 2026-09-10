import "server-only";
import { randomUUID } from "crypto";
import { adminBucket } from "@/lib/firebase-admin";

async function uploadImage(file: File, folder: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${randomUUID()}.${ext}`;

  const gcsFile = adminBucket.file(path);
  await gcsFile.save(buffer, {
    metadata: { contentType: file.type || "image/jpeg" },
  });
  await gcsFile.makePublic();

  return `https://storage.googleapis.com/${adminBucket.name}/${path}`;
}

export function uploadProductImage(file: File): Promise<string> {
  return uploadImage(file, "products");
}

export function uploadOrderCatalogImage(file: File): Promise<string> {
  return uploadImage(file, "order-catalog");
}

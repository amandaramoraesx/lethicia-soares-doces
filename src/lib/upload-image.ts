import "server-only";
import { randomUUID } from "crypto";
import { adminBucket } from "@/lib/firebase-admin";

export async function uploadProductImage(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `products/${randomUUID()}.${ext}`;

  const gcsFile = adminBucket.file(path);
  await gcsFile.save(buffer, {
    metadata: { contentType: file.type || "image/jpeg" },
  });
  await gcsFile.makePublic();

  return `https://storage.googleapis.com/${adminBucket.name}/${path}`;
}

/**
 * Shrinks a large photo in the browser before upload (longest side
 * `maxEdge`, WebP) so it fits the 4 MB upload limit. GIFs and images the
 * browser can't decode are sent unchanged.
 */
const MAX_UPLOAD_BYTES = 3.8 * 1024 * 1024;

export async function shrinkImage(file: File, maxEdge = 2400): Promise<File> {
  if (file.type === "image/gif") return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= MAX_UPLOAD_BYTES) return file;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  for (const quality of [0.86, 0.75, 0.6]) {
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", quality));
    if (blob && blob.size <= MAX_UPLOAD_BYTES) return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" });
  }
  return file;
}

import "server-only";
import { prisma } from "@/lib/db";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 4 * 1024 * 1024;

/**
 * Saves a profile photo for a user (stored in the database like every other
 * upload, served at /media/<id>) and removes their previous one.
 */
export async function setProfilePhoto(userId: string, form: FormData | null, uploadedBy: string) {
  const file = form?.get("file");
  if (!(file instanceof File)) return { ok: false as const, error: "Choose a photo to upload.", status: 400 };
  if (!ALLOWED.includes(file.type)) return { ok: false as const, error: "Use a JPG, PNG or WebP photo.", status: 415 };
  if (file.size > MAX_BYTES) return { ok: false as const, error: "Photo must be under 4 MB.", status: 413 };

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { photoUrl: true } });
  if (!user) return { ok: false as const, error: "Account not found.", status: 404 };

  const media = await prisma.mediaFile.create({
    data: { filename: `profile-${userId}.${file.type.split("/")[1]}`, mimeType: file.type, size: file.size, data: Buffer.from(await file.arrayBuffer()), uploadedBy },
    select: { id: true },
  });
  const url = `/media/${media.id}`;
  await prisma.user.update({ where: { id: userId }, data: { photoUrl: url } });
  await removeOldPhoto(user.photoUrl);
  return { ok: true as const, url };
}

export async function clearProfilePhoto(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { photoUrl: true } });
  if (!user) return;
  await prisma.user.update({ where: { id: userId }, data: { photoUrl: null } });
  await removeOldPhoto(user.photoUrl);
}

async function removeOldPhoto(url: string | null) {
  const id = url?.match(/^\/media\/([a-z0-9]+)$/)?.[1];
  if (id) await prisma.mediaFile.delete({ where: { id } }).catch(() => null);
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 4;

// MIMEタイプとマジックバイトの対応
const ALLOWED: Record<string, { mime: string[]; magic: number[][] }> = {
  jpg:  { mime: ["image/jpeg"], magic: [[0xFF, 0xD8, 0xFF]] },
  jpeg: { mime: ["image/jpeg"], magic: [[0xFF, 0xD8, 0xFF]] },
  png:  { mime: ["image/png"],  magic: [[0x89, 0x50, 0x4E, 0x47]] },
  gif:  { mime: ["image/gif"],  magic: [[0x47, 0x49, 0x46]] },
  webp: { mime: ["image/webp"], magic: [[0x52, 0x49, 0x46, 0x46]] },
  mp4:  { mime: ["video/mp4", "video/mpeg"], magic: [] },
  mov:  { mime: ["video/quicktime"], magic: [] },
  heic: { mime: ["image/heic", "image/heif"], magic: [] },
};

function checkMagicBytes(buffer: Buffer, ext: string): boolean {
  const rules = ALLOWED[ext];
  if (!rules || rules.magic.length === 0) return true; // 動画等はスキップ
  return rules.magic.some(bytes => bytes.every((b, i) => buffer[i] === b));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const files = (formData.getAll("files") as File[]).slice(0, MAX_FILES);

  if (!files.length) {
    return NextResponse.json({ error: "No files" }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const urls: string[] = [];

  for (const file of files) {
    if (!(file instanceof File)) continue;

    // ファイルサイズチェック
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `ファイルサイズは10MB以内にしてください` }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    if (!ALLOWED[ext]) {
      return NextResponse.json({ error: `${ext} は対応していません` }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // マジックバイト検証
    if (!checkMagicBytes(buffer, ext)) {
      return NextResponse.json({ error: `ファイルの形式が正しくありません` }, { status: 400 });
    }

    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    urls.push(`/uploads/${fileName}`);
  }

  return NextResponse.json({ urls });
}

/* eslint-disable no-console */
import { promises as fs } from "fs";
import path from "path";

const API_URL = "https://api.hugoramonpereira.dev/meals";
const TOKEN =
  "eyJraWQiOiI3QVwvc25adjdBXC81N3BKeWZicUxaeWdcLzFRNGJyMHVcL29USzR6c2E5TEppST0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxMzRjZWFlYS1lMDUxLTcwMjMtMzMyMy00MTQ0YmM5M2FjN2QiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuc2EtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3NhLWVhc3QtMV9ZNUNOV3hXVVoiLCJjbGllbnRfaWQiOiI2czg1MXBqcm1qOGFxZGFyN2I4bDJsMmtobCIsIm9yaWdpbl9qdGkiOiJiZTdmODBhMy03ZWZjLTQ4YTItOTEzZC02MTg4YWRmYWU1NjAiLCJpbnRlcm5hbElkIjoiM0FKOFVoTzd3eXQzdmpBeG5rS1A1Smxaa0JlIiwiZXZlbnRfaWQiOiIyOTdlYzIzNi1iZGNmLTRjMDQtODAzOS0yMGRiZWM1MzBmODYiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIiwiYXV0aF90aW1lIjoxNzcyMjk5MzMxLCJleHAiOjE3NzIzNDI1MzEsImlhdCI6MTc3MjI5OTMzMSwianRpIjoiMGIxMTA1NGItYTEzYy00YWVlLThiNzYtYWE1YmIwNjdlMTQ0IiwidXNlcm5hbWUiOiIxMzRjZWFlYS1lMDUxLTcwMjMtMzMyMy00MTQ0YmM5M2FjN2QifQ.mrC928FoKYo-sh-gndTuingzx5zFeGIjoCgPk8xv53Y9QjPA3gF0dTLyvEa2BWCA9cCbOOpy25gK75V8ugY-OUKWYIpezmuu17YEjGlN--C569s8LbcZOuPH86OTzyQRrcSe9ep_kLByxIswtU5r7apHQSjAQ6bfLbVc2JI4hw_e2CU7BCfHvoP0HeFmfMEQpRMplHJ7ofPm12CBa-J9uiCMdjNgKS357PfNCe0sdZzwxWVrXscke5Vl-bgVHHjEoaianBBa9hGCcqj-LLcnUe_OEnDSuf_etYuLUk0RtLNdqvjsdu1O3rnqn723AvmrlNWYTyW_wv9OrmRJztSo8g";

interface IPresignResponse {
  uploadSignature: string;
}

interface IPresignDecoded {
  url: string;
  fields: Record<string, string>;
}

async function readFile(
  filePath: string,
  type: "audio/m4a" | "image/jpeg",
): Promise<{
  data: Buffer;
  size: number;
  type: string;
}> {
  console.log(`🔍 Reading file from disk: ${filePath}`);
  const data = await fs.readFile(filePath);
  return {
    data,
    size: data.length,
    type,
  };
}

async function createMeal(
  fileType: string,
  fileSize: number,
): Promise<IPresignDecoded> {
  console.log(
    `🚀 Requesting presigned POST for ${fileSize} bytes of type ${fileType}`,
  );
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ file: { type: fileType, size: fileSize } }),
  });

  if (!res.ok) {
    throw new Error(
      `Failed to get presigned POST: ${res.status} ${res.statusText}`,
    );
  }

  const json = (await res.json()) as IPresignResponse;
  const decoded = JSON.parse(
    Buffer.from(json.uploadSignature, "base64").toString("utf-8"),
  ) as IPresignDecoded;

  console.log("✅ Received presigned POST data");
  return decoded;
}

function buildFormData(
  fields: Record<string, string>,
  fileData: Buffer,
  filename: string,
  fileType: string,
): FormData {
  console.log(
    `📦 Building FormData with ${Object.keys(fields).length} fields and file ${filename}`,
  );
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    form.append(key, value);
    console.log({ key, value });
  }

  const blob = new Blob([new Uint8Array(fileData)], { type: fileType });
  form.append("file", blob, filename);
  return form;
}

async function uploadToS3(url: string, form: FormData): Promise<void> {
  console.log(`📤 Uploading to S3 at ${url}`);
  const res = await fetch(url, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `S3 upload failed: ${res.status} ${res.statusText} — ${text}`,
    );
  }

  console.log("🎉 Upload completed successfully");
}

async function uploadFile(
  filePath: string,
  fileType: "audio/m4a" | "image/jpeg",
): Promise<void> {
  try {
    const { data, size, type } = await readFile(filePath, fileType);
    const { url, fields } = await createMeal(type, size);
    const form = buildFormData(fields, data, path.basename(filePath), type);
    await uploadToS3(url, form);
  } catch (err) {
    console.error("❌ Error during uploadFile:", err);
    throw err;
  }
}

uploadFile(
  path.resolve(__dirname, "assets", "delicious-meal.jpg"),
  "image/jpeg",
).catch(() => process.exit(1));

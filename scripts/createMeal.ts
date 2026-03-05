/* eslint-disable no-console */
import { promises as fs } from "fs";
import path from "path";

const API_URL = "https://api.hugoramonpereira.dev/meals";
const TOKEN =
  "eyJraWQiOiI3QVwvc25adjdBXC81N3BKeWZicUxaeWdcLzFRNGJyMHVcL29USzR6c2E5TEppST0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjM2FjNGE5YS1hMDYxLTcwNTYtMmNmMy1lZDBjZTZlNmI2OGYiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuc2EtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3NhLWVhc3QtMV9ZNUNOV3hXVVoiLCJjbGllbnRfaWQiOiI2czg1MXBqcm1qOGFxZGFyN2I4bDJsMmtobCIsIm9yaWdpbl9qdGkiOiJmNmU5Y2NjOC1hYzE0LTRkMzktODIwMS0wNWNiYzM3NWE2ODIiLCJpbnRlcm5hbElkIjoiM0FMVEZicUhaeWtEN2ZVMjdYSjNLQ1VPZWFSIiwiZXZlbnRfaWQiOiIwNzE0YmZjNC0yZDJmLTQ3OTctYjkzZC01MmFkMzc0ZjY5MmMiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIiwiYXV0aF90aW1lIjoxNzcyNjc3MTY2LCJleHAiOjE3NzI3MjAzNjYsImlhdCI6MTc3MjY3NzE2NywianRpIjoiMzE2NTQ4YzktMGU2Yy00ODdkLTllNDUtNzk3NDJlYjhmNTkxIiwidXNlcm5hbWUiOiJjM2FjNGE5YS1hMDYxLTcwNTYtMmNmMy1lZDBjZTZlNmI2OGYifQ.krn6SVbaYRKRdRb1mvCD90QkgyYp3ALvoQH6mitKapHBG31rWVortYFKJpVGcvYTJoCKetcrHy5MyKySMu3DZAmXUVd0KePK0ASjVZccwXp3iBTB8qYWcKaTeODRrABZptote4nr3hcfPEUQnkSm9vF9BicD3tLO1DY4OO3Dn2JwBnjtln5ThZ2BM7t1WHMT6hRMLU6Q2nHK43TNSzXqEEQ8HeP6JmWEDA0lydebI-ermI09-btQ3-es2vmbv77_NBT8bwwrHwrRNFHGlFQmyPr4xSCyCmO-Xt0kzc_W5SdHFriT7kBBoFY7FtLTOvBmZosyz-HMIkDi3_TUg-vaQw";

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

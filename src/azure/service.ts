import { readFileSync } from "fs";

export async function retrieveSrt(srtFileName: string): Promise<string> {
  console.log("Retrieving SRT from Azure:", srtFileName);

  const token = process.env.AZURE_SUBTITLES_TOKEN;
  const blobUrl = process.env.AZURE_BLOB_URL;

  if (!token || !blobUrl) {
    throw new Error("Missing AZURE_SUBTITLES_TOKEN or AZURE_BLOB_URL env vars");
  }

  const url = `${blobUrl}/subtitles/${srtFileName}.srt?${token}`;
  const response = await fetch(url);

  if (response.ok) {
    const content = await response.text();
    console.log("Content:", content);
    return content;
  }

  const errorText = await response.text();
  console.log("Response:", errorText);
  console.log("Failed to retrieve srt from azure");
  throw new Error("No captions found");
}

export async function uploadSrt(
  srtFileName: string,
  srtContent: string,
): Promise<{ message: string; blobUrl: string }> {
  console.log("Uploading SRT to Azure:", srtFileName);

  let content = srtContent;
  if (!content) {
    content = readFileSync(`./srts/edited/${srtFileName}.srt`, "utf-8");
  }

  const account = process.env.STORAGE_ACCOUNT;
  const accessKey = process.env.STORAGE_ACCESS_KEY;
  const container = process.env.STORAGE_CONTAINER;

  if (!account || !accessKey || !container) {
    throw new Error(
      "Missing STORAGE_ACCOUNT, STORAGE_ACCESS_KEY, or STORAGE_CONTAINER env vars",
    );
  }

  const fileName = `${srtFileName}.srt`;
  const uploadUrl = `https://${account}.blob.core.windows.net/${container}/${fileName}?${accessKey}`;

  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "text/plain",
      "x-ms-blob-type": "BlockBlob",
    },
    body: content,
  });

  if (!uploadResponse.ok) {
    throw new Error(
      `Failed to upload to Azure: ${uploadResponse.status} ${uploadResponse.statusText}`,
    );
  }

  const blobUrlResult = `https://${account}.blob.core.windows.net/${container}/${fileName}`;
  console.log("Uploaded SRT to Azure:", blobUrlResult);

  return {
    message: "Successfully uploaded SRT to Azure",
    blobUrl: blobUrlResult,
  };
}

import { YouTubeResponse } from "./model";

export async function retrieveVideoClient(
  video_id: string
): Promise<YouTubeResponse> {
  console.log("Retrieving video client for video ID:", video_id);
  const response = await fetch(`https://www.youtube.com/youtubei/v1/player`, {
    method: "POST",
    body: JSON.stringify({
      video_id,
      context: {
        client: {
          hl: "en",
          client_name: "WEB",
          client_version: "2.20241107.11.00",
        },
        request: {
          use_ssl: true,
        },
      },
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to retrieve video client: ${response.statusText}`);
  }
  const data = await response.json();
  console.log(data);
  return data as YouTubeResponse;
}

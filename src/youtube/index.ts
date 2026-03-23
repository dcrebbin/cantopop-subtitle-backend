import { Elysia } from "elysia";
import {
  mergeSubtitles,
  retrieveSubtitles,
  retrieveVideoClient,
} from "./service";
import type { YouTubeResponse } from "./model";
import {
  openAIRequestChunking,
  TRANSLATION_SYSTEM_PROMPT,
} from "../ai/service";
import { downloadVideo } from "./service";
import { uploadSrt } from "../azure/service";

export const youtube = new Elysia({ prefix: "/youtube" })
  .post("/video", async ({ body }) => {
    console.log("Body:", body);
    const { video_id } = body as { video_id: string };
    const response = (await retrieveVideoClient(video_id)) as YouTubeResponse;
    return response;
  })
  .post("/download", async ({ body }) => {
    console.log("Body:", body);
    const { video_id } = body as { video_id: string };
    const response = await downloadVideo(video_id);
    return response;
  })
  .post("/subtitles", async ({ body }) => {
    console.log("Body:", body);
    const { video_id, language } = body as {
      video_id: string;
      language: string;
    };
    const subtitles = await retrieveSubtitles(video_id, language).catch(
      (error) => {
        console.error("Error retrieving subtitles:", error);
        return error;
      },
    );
    return subtitles;
  })
  .post("/translate-youtube-video", async ({ body }) => {
    const { video_id, language, provider, upload_srt } = body as {
      video_id: string;
      language: string;
      provider: "openai" | "anthropic" | "groq" | "gemini";
      upload_srt: boolean;
    };
    const subtitles = await retrieveSubtitles(video_id, language);
    const translatedSubtitles = await openAIRequestChunking(
      subtitles,
      TRANSLATION_SYSTEM_PROMPT,
    );
    if (upload_srt) {
      await uploadSrt(video_id, translatedSubtitles);
    }
    return translatedSubtitles;
  })
  .post("/merge", async ({ body }) => {
    const { video_id, language } = body as {
      video_id: string;
      language: string;
    };
    const mergedSubtitles = await mergeSubtitles(video_id, language);
    return mergedSubtitles;
  })
  .post("/client", async ({ body }) => {
    const { url } = body as { url: string };
    const response = await retrieveVideoClient(url);
    return response;
  });

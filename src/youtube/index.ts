import { Elysia } from "elysia";
import { retrieveSubtitles, retrieveVideoClient } from "./service";
import type { YouTubeResponse } from "./model";
import {
  openAIRequestChunking,
  TRANSLATION_SYSTEM_PROMPT,
} from "../ai/service";

export const youtube = new Elysia({ prefix: "/youtube" })
  .post("/video", async ({ body }) => {
    console.log("Body:", body);
    const { video_id } = body as { video_id: string };
    const response = (await retrieveVideoClient(video_id)) as YouTubeResponse;
    return response;
  })
  .post("/subtitles", async ({ body }) => {
    console.log("Body:", body);
    const { video_id, language } = body as {
      video_id: string;
      language: string;
    };
    const subtitles = await retrieveSubtitles(video_id, language);
    return subtitles;
  })
  .post("/translate", async ({ body }) => {
    const { video_id, language } = body as {
      video_id: string;
      language: string;
    };
    const subtitles = await retrieveSubtitles(video_id, language);
    const translatedSubtitles = await openAIRequestChunking(
      subtitles,
      TRANSLATION_SYSTEM_PROMPT
    );
    return translatedSubtitles;
  });

import { Elysia } from "elysia";
import {
  cerebrasRequest,
  openAIRequestChunking,
  openAIWhisperRequest,
  TRANSLATION_SYSTEM_PROMPT,
} from "./service";

export const ai = new Elysia({ prefix: "/ai" })
  .post("/speech-to-text", async ({ body }) => {
    console.log("Body:", body);
    const { video_id, model, language } = body as {
      video_id: string;
      model: "whisper-large-v2" | "whisper-large-v3";
      language: string;
    };
    const response = await openAIWhisperRequest(video_id, model, language);
    return response;
  })
  .post("/translate", async ({ body }) => {
    console.log("Body:", body);
    const { text, language } = body as {
      text: string;
      language: string;
    };
    const response = await openAIRequestChunking(
      text,
      TRANSLATION_SYSTEM_PROMPT,
    );
    return response;
  })
  .post("/cerebras", async ({ body }) => {
    const { text, language } = body as {
      text: string;
      language: string;
    };
    const response = await cerebrasRequest(text, TRANSLATION_SYSTEM_PROMPT);
    return response;
  });

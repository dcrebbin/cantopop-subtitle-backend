import { Elysia } from "elysia";
import { senseVoice } from "./service";

export const huggingface = new Elysia({ prefix: "/huggingface" }).post(
  "/sense-voice",
  async ({ body }) => {
    console.log("Body:", body);
    const { language, file_path } = body as {
      language: string;
      file_path: string;
    };
    const response = await senseVoice(language, file_path);
    return response;
  }
);

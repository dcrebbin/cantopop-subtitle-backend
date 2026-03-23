import { Elysia } from "elysia";
import { retrieveSrt, uploadSrt } from "./service";

export const azure = new Elysia({ prefix: "/azure" })
  .get("/srt/:srtFileName", async ({ params }) => {
    const { srtFileName } = params;
    return await retrieveSrt(srtFileName);
  })
  .post("/srt", async ({ body }) => {
    const { srt_file_name, srt_content } = body as {
      srt_file_name: string;
      srt_content: string;
    };
    return await uploadSrt(srt_file_name, srt_content ?? "");
  });

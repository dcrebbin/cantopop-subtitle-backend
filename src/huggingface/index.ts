import { Elysia } from "elysia";
import { retrieveVideoClient } from "./service";
import { YouTubeResponse } from "./model";

export const youtube = new Elysia({ prefix: "/youtube" }).get(
  "/video",
  async ({ query }) => {
    console.log("Query:", query);
    const { video_id } = query as { video_id: string };
    const response = (await retrieveVideoClient(video_id)) as YouTubeResponse;
    return response;
  }
);

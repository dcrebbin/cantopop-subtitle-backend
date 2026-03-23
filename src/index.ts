import { Elysia } from "elysia";
import { youtube } from "./youtube";
import { huggingface } from "./huggingface";
import openapi from "@elysiajs/openapi";
import { ai } from "./ai";

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .use(youtube)
  .use(huggingface)
  .use(ai)
  .use(openapi())
  .listen(4000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);

import { Elysia } from "elysia";
import { youtube } from "./youtube";
import { huggingface } from "./huggingface";
import openapi from "@elysiajs/openapi";
import { ai } from "./ai";
import { azure } from "./azure";

const app = new Elysia({ prefix: "/api" })
  .get("/", () => "Hello Elysia")
  .use(youtube)
  .use(huggingface)
  .use(ai)
  .use(azure)
  .use(openapi())
  .listen(process.env.PORT ? parseInt(process.env.PORT) : 4000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);

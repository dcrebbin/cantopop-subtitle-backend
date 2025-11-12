import { Elysia } from "elysia";
import { youtube } from "./youtube";

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .use(youtube)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

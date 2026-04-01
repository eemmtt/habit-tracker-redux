import { Hono } from "hono";
import { CtxVariables } from "../types";

const habits = new Hono<{ Variables: CtxVariables }>();

habits.post("/", async (c) => {
  //create habit
  // description: habitDescription,
  // interval: habitType.interval,
  // reps: habitType.reps,
  // stickerpack_id: -1, //TODO: implement sticker pack selection
});

habits.get("/:userid/summary", async (c) => {
  //get habit data for user necessary for dashboard view
});

habits.get("/:id", async (c) => {
  //get complete habit data
});

habits.get("/:id/summary", async (c) => {
  //get habit data necessary for dashboard view
});

export default habits;

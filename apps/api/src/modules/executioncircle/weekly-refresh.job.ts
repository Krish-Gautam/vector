import cron from "node-cron";
import { supabase } from "../../data/supabase.client.js";
import { CircleRematchService } from "./circle-rematch.service.js";

const rematchService =
  new CircleRematchService(supabase);

cron.schedule(
 "0 0 * * 0",
 async () => {
   await rematchService.rematchUsers();
   console.log("Weekly rematching complete");
 }
);
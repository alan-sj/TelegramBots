import { bot } from "./bot.js";
import { webhookCallback } from "https://deno.land/x/grammy@v1.30.0/mod.js";

const handleUpdate = webhookCallback(bot, "std/http");

Deno.serve(async (req) => {
  if(req.method==="POST"){
    const url = new URL(req.url);
    if(url.pathname.slice(1)===bot.token){
      try { return await handleUpdate(req); } 
      catch(err){ console.error(err); }
    }
  }
  return new Response();
});

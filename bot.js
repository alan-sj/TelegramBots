import { Bot, webhookCallback } from "https://deno.land/x/grammy@v1.30.0/mod.ts";
import { startGuessGame, handleGuess } from "./RideBus.js";
import { startBlackjack, handleBlackjack } from "./blackjack.js";
import { setupCommands } from "./commands.js";

export const bot = new Bot(Deno.env.get("BOT_TOKEN"));

// Setup commands & start menu
setupCommands(bot);

// Handle callback queries
bot.on("callback_query:data", async ctx => {
  const data = ctx.callbackQuery.data;
  const chatId = ctx.chat.id;

  if (data === "start_guess") await startGuessGame(chatId);
  else if (data === "start_blackjack") await startBlackjack(chatId);
  else if (data === "choose_game") {
    await ctx.reply("Choose a game to play:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Ride the Bus Game", callback_data: "start_guess" }],
          [{ text: "Blackjack", callback_data: "start_blackjack" }],
        ],
      },
    });
  } else if (data === "exit") {
    await ctx.reply("Thanks for playing!");
  } else {
    // route to game handlers
    if (globalGames[chatId]?.type === "guess") await handleGuess(ctx, data);
    else if (globalGames[chatId]?.type === "blackjack") await handleBlackjack(ctx, data);
  }

  await ctx.answerCallbackQuery();
});

// ------------------ Start Bot ------------------
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
const handleUpdate = webhookCallback(bot, "std/http");

serve(async (req) => {
  if (req.method === "POST") {
    const url = new URL(req.url);
    if (url.pathname.slice(1) === bot.token) {
      try {
        return await handleUpdate(req);
      } catch (err) {
        console.error(err);
      }
    }
  }
  return new Response();
});

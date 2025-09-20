import { Bot, InlineKeyboard } from "https://deno.land/x/grammy@v1.30.0/mod.js";
import { loadStickers } from "./stickers.js";
import * as guessGame from "./guess.js";
import * as blackjackGame from "./blackjack.js";

export const games = {};
export const bot = new Bot(Deno.env.get("BOT_TOKEN"));
export const CARD_STICKERS = await loadStickers("https://raw.githubusercontent.com/alan-sj/TelegramBots/main/stickers.json");

bot.command("start", async ctx => {
  const keyboard = new InlineKeyboard()
    .text("Card Guess Game","start_guess")
    .text("Blackjack","start_blackjack");
  await ctx.reply("Choose a game to play:",{reply_markup:keyboard});
});

bot.on("callback_query:data", async ctx => {
  const data=ctx.callbackQuery.data;
  const chatId=ctx.chat.id;

  if(data==="start_guess") await guessGame.startGuessGame(bot, chatId, games, CARD_STICKERS);
  else if(data==="start_blackjack") await blackjackGame.startBlackjack(bot, chatId, games, CARD_STICKERS);
  else if(data==="choose_game"){
    const keyboard = new InlineKeyboard()
      .text("Card Guess Game","start_guess")
      .text("Blackjack","start_blackjack");
    await ctx.reply("Choose a game to play:", { reply_markup: keyboard });
  }
  else if(data==="exit"){ await ctx.reply("Thanks for playing!"); delete games[chatId]; }
  else{
    const game = games[chatId];
    if(!game){await ctx.answerCallbackQuery(); return;}
    if(game.type==="guess") await guessGame.handleGuess(bot, ctx, games, CARD_STICKERS, data);
    else if(game.type==="blackjack") await blackjackGame.handleBlackjack(bot, ctx, games, CARD_STICKERS, data);
  }
  await ctx.answerCallbackQuery();
});

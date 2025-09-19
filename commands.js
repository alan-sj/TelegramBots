import { InlineKeyboard } from "https://deno.land/x/grammy@v1.30.0/mod.ts";

export function setupCommands(bot) {
  bot.command("start", async ctx => {
    const keyboard = new InlineKeyboard()
      .text("Card Guess Game", "start_guess")
      .text("Blackjack", "start_blackjack");
    await ctx.reply("Choose a game to play:", { reply_markup: keyboard });
  });
}

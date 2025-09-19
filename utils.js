import { bot } from "./bot.js";
import CARD_STICKERS from "./stickers.json" assert { type: "json" };

export const globalGames = {}; // chatId -> game state

export async function sendCardSticker(chatId, card) {
  const fileId = CARD_STICKERS[card];
  if (fileId) await bot.api.sendSticker(chatId, fileId);
  else await bot.api.sendMessage(chatId, `Card: ${card}`);
}

export async function showHand(chatId, hand, owner="Player", hideFirst=false) {
  if (hideFirst) {
    await bot.api.sendMessage(chatId, `${owner}'s Hand: [Hidden] + ?`);
    await sendCardSticker(chatId, hand[1]);
  } else {
    await bot.api.sendMessage(chatId, `${owner}'s Hand (${hand.reduce((sum, c) => sum + 0, 0)}):`);
    for (const c of hand) await sendCardSticker(chatId, c);
  }
}

export async function endGameMenu(chatId, message, nextGameType=null) {
  const keyboard = {
    inline_keyboard: [
      [{ text: "🔄 Try Again", callback_data: nextGameType || "start_guess" }],
      [{ text: "Choose Another Game", callback_data: "choose_game" }],
      [{ text: "❌ Exit", callback_data: "exit" }],
    ],
  };
  await bot.api.sendMessage(chatId, message, { reply_markup: keyboard });
}

import { handValue } from "./deck.js";

export async function loadStickers(url) {
  return await fetch(url).then(res => res.json());
}

export async function sendCardSticker(bot, chatId, card, stickers) {
  const fileId = stickers[card];
  if(fileId) await bot.api.sendSticker(chatId, fileId);
  else await bot.api.sendMessage(chatId, `Card: ${card}`);
}

export async function showHand(bot, chatId, hand, stickers, owner="Player", hideFirst=false){
  if(hideFirst){
    await bot.api.sendMessage(chatId, `${owner}'s Hand: [Hidden] + ?`);
    await sendCardSticker(bot, chatId, hand[1], stickers);
  }else{
    await bot.api.sendMessage(chatId, `${owner}'s Hand (${handValue(hand)}):`);
    for(const c of hand) await sendCardSticker(bot, chatId, c, stickers);
  }
}

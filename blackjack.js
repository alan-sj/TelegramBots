import { createDeck, handValue } from "./deck.js";
import { showHand, sendCardSticker } from "./stickers.js";
import { InlineKeyboard } from "https://deno.land/x/grammy@v1.30.0/mod.js";

export async function startBlackjack(bot, chatId, games, stickers){
  const deck = createDeck().sort(()=>Math.random()-0.5);
  const player=[deck.pop(),deck.pop()], dealer=[deck.pop(),deck.pop()];
  games[chatId]={type:"blackjack",deck,player,dealer};
  await bot.api.sendMessage(chatId,"Blackjack Game Started!");
  await showHand(bot, chatId, player, stickers,"Player");
  await showHand(bot, chatId, dealer, stickers,"Dealer",true);
  await bot.api.sendMessage(chatId,"Your move:", {reply_markup: new InlineKeyboard().text("Hit","hit").text("Stand","stand")});
}

export async function handleBlackjack(bot, ctx, games, stickers, action){
  const chatId = ctx.chat.id;
  const game = games[chatId];
  if(!game || game.type!=="blackjack") return;

  const {deck,player,dealer}=game;

  if(action==="hit"){
    player.push(deck.pop());
    await showHand(bot, chatId, player, stickers,"Player");
    if(handValue(player)>21){ await bot.api.sendMessage(chatId,"Bust! You lose."); delete games[chatId]; return; }
    await ctx.reply("Your move:", {reply_markup:new InlineKeyboard().text("Hit","hit").text("Stand","stand")});
  }else if(action==="stand"){
    await showHand(bot, chatId, dealer, stickers,"Dealer");
    while(handValue(dealer)<17){dealer.push(deck.pop()); await sendCardSticker(bot, chatId, dealer[dealer.length-1], stickers);}
    const dealerScore=handValue(dealer), playerScore=handValue(player);
    let result="";
    if(dealerScore>21 || playerScore>dealerScore) result="You win!";
    else if(dealerScore===playerScore) result="Draw!";
    else result="Dealer wins!";
    await bot.api.sendMessage(chatId, `Final Scores:\nPlayer:${playerScore}\nDealer:${dealerScore}\n${result}`);
    delete games[chatId];
  }
}

import { createDeck, handValue } from "./deck.js";
import { globalGames, sendCardSticker, showHand, endGameMenu } from "./utils.js";

export async function startBlackjack(chatId) {
  const deck = createDeck().sort(() => Math.random() - 0.5);
  const player = [deck.pop(), deck.pop()], dealer = [deck.pop(), deck.pop()];
  globalGames[chatId] = { type: "blackjack", deck, player, dealer };
  await bot.api.sendMessage(chatId, "Blackjack Game Started!");
  await showHand(chatId, player, "Player");
  await showHand(chatId, dealer, "Dealer", true);
  await bot.api.sendMessage(chatId, "Your move:", { reply_markup: { inline_keyboard: [
    [{ text: "Hit", callback_data: "hit" }, { text: "Stand", callback_data: "stand" }]
  ]}});
}

export async function handleBlackjack(ctx, action) {
  const chatId = ctx.chat.id;
  const game = globalGames[chatId];
  if (!game || game.type !== "blackjack") return;

  const { deck, player, dealer } = game;

  if(action === "hit"){
    player.push(deck.pop());
    await showHand(chatId, player, "Player");
    if(handValue(player) > 21){
      await endGameMenu(chatId, `Bust! You lose.`, "start_blackjack");
      delete globalGames[chatId]; return;
    }
    await ctx.reply("Your move:", { reply_markup: { inline_keyboard: [[
      { text: "Hit", callback_data: "hit" }, { text: "Stand", callback_data: "stand" }
    ]] }});
  } else if(action === "stand"){
    await showHand(chatId, dealer, "Dealer");
    while(handValue(dealer) < 17){
      dealer.push(deck.pop());
      await sendCardSticker(chatId, dealer[dealer.length-1]);
    }
    const dealerScore = handValue(dealer), playerScore = handValue(player);
    let result = "";
    if(dealerScore>21 || playerScore>dealerScore) result="You win!";
    else if(dealerScore===playerScore) result="Draw!";
    else result="Dealer wins!";
    await endGameMenu(chatId, `Final Scores:\nPlayer:${playerScore}\nDealer:${dealerScore}\n\n${result}`, "start_blackjack");
    delete globalGames[chatId];
  }
}

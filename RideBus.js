import { createDeck, cardValue, cardColor } from "./deck.js";
import { globalGames, sendCardSticker, endGameMenu } from "./utils.js";

export async function startGuessGame(chatId) {
  const deck = createDeck().sort(() => Math.random() - 0.5);
  globalGames[chatId] = { type: "guess", deck, round: 1, score: 0 };
  await sendNextGuess(chatId);
}

export async function sendNextGuess(chatId) {
  const game = globalGames[chatId];
  if (!game || game.type !== "guess") return;

  const round = game.round;
  let text = "", keyboard = { inline_keyboard: [] };

  switch(round) {
    case 1:
      text = "Q1: Will the next card be Red or Black?";
      keyboard.inline_keyboard.push(
        [{ text: "Red", callback_data: "red" }, { text: "Black", callback_data: "black" }]
      );
      break;
    case 2:
      text = "Q2: Will the next card be Higher or Lower?";
      keyboard.inline_keyboard.push(
        [{ text: "Higher", callback_data: "higher" }, { text: "Lower", callback_data: "lower" }]
      );
      break;
    case 3:
      text = "Q3: Inside or Outside previous cards?";
      keyboard.inline_keyboard.push(
        [{ text: "Inside", callback_data: "inside" }, { text: "Outside", callback_data: "outside" }]
      );
      break;
    case 4:
      text = "Q4: Guess the suit!";
      keyboard.inline_keyboard.push(
        [{ text: "♠", callback_data: "♠" }, { text: "♥", callback_data: "♥" }],
        [{ text: "♦", callback_data: "♦" }, { text: "♣", callback_data: "♣" }]
      );
      break;
    default:
      await endGameMenu(chatId, `Game Over! Score: ${game.score}`, "start_guess");
      delete globalGames[chatId]; 
      return;
  }

  await bot.api.sendMessage(chatId, text, { reply_markup: keyboard });
}

export async function handleGuess(ctx, guess) {
  const chatId = ctx.chat.id;
  const game = globalGames[chatId];
  if (!game || game.type !== "guess") return;

  if (!game.deck.length) {
    await endGameMenu(chatId, "Deck empty! Game over.", "start_guess");
    delete globalGames[chatId]; 
    return;
  }

  const nextCard = game.deck.pop();
  let correct = false;

  switch(game.round) {
    case 1: correct = guess === cardColor(nextCard); break;
    case 2:
      if(game.prevCard) {
        correct = (guess==="higher" && cardValue(nextCard)>cardValue(game.prevCard)) ||
                  (guess==="lower" && cardValue(nextCard)<cardValue(game.prevCard));
      }
      break;
    case 3:
      if (!game.prevCard1 || !game.prevCard2) {
    // Defensive check: if somehow previous cards are missing, use current card as prev
        game.prevCard1 = game.prevCard1 || nextCard;
        game.prevCard2 = game.prevCard2 || nextCard;
        correct = true; // continue game
      } else {
        const low = Math.min(cardValue(game.prevCard1), cardValue(game.prevCard2));
        const high = Math.max(cardValue(game.prevCard1), cardValue(game.prevCard2));
        const val = cardValue(nextCard);

        correct = (guess === "inside" && val > low && val < high) ||
              (guess === "outside" && (val < low || val > high));

    // Optionally update previous cards for next inside/outside check
        game.prevCard1 = game.prevCard2;
        game.prevCard2 = nextCard;
    }
  break;

    case 4: correct = guess === nextCard.slice(-1); break;
  }

  await sendCardSticker(chatId, nextCard);

  if(correct){
    game.score++; game.prevCard = nextCard; game.prevCard2 = nextCard; game.round++;
    await ctx.reply(`Correct! Score: ${game.score}`);
    await sendNextGuess(chatId);
  } else {
    await endGameMenu(chatId, `Wrong! Game Over. Score: ${game.score}`, "start_guess");
    delete globalGames[chatId];
  }
}

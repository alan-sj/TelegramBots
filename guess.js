import { createDeck, cardValue, cardColor } from "./deck.js";
import { sendCardSticker } from "./stickers.js";
import { InlineKeyboard } from "https://deno.land/x/grammy@v1.30.0/mod.js";

export async function startGuessGame(bot, chatId, games, stickers) {
  const deck = createDeck().sort(()=>Math.random()-0.5);
  games[chatId] = { type: "guess", deck, round:1, score:0 };
  await sendNextGuess(bot, chatId, games, stickers);
}

export async function sendNextGuess(bot, chatId, games, stickers) {
  const game = games[chatId];
  if(!game || game.type!=="guess") return;
  const round = game.round;
  let text="", keyboard=new InlineKeyboard();

  switch(round){
    case 1: text="Red or Black?"; keyboard.text("Red","red").text("Black","black"); break;
    case 2: text="Higher or Lower?"; keyboard.text("Higher","higher").text("Lower","lower"); break;
    case 3: text="Inside or Outside?"; keyboard.text("Inside","inside").text("Outside","outside"); break;
    case 4: text="Guess the suit!"; keyboard.row({text:"♠",callback_data:"♠"},{text:"♥",callback_data:"♥"})
                                         .row({text:"♦",callback_data:"♦"},{text:"♣",callback_data:"♣"}); break;
    default:
      await bot.api.sendMessage(chatId, `Game Over! Score: ${game.score}`);
      delete games[chatId]; return;
  }

  await bot.api.sendMessage(chatId, text, { reply_markup: keyboard });
}

export async function handleGuess(bot, ctx, games, stickers, guess) {
  const chatId = ctx.chat.id;
  const game = games[chatId];
  if(!game || game.type!=="guess") return;

  if(!game.deck.length){ delete games[chatId]; return; }

  const nextCard = game.deck.pop();
  let correct=false, round=game.round;

  switch(round){
    case 1: if(guess===cardColor(nextCard)) correct=true; break;
    case 2:
      const prev=game.prevCard;
      if(prev){
        if((guess==="higher" && cardValue(nextCard)>cardValue(prev)) ||
           (guess==="lower" && cardValue(nextCard)<cardValue(prev))) correct=true;
      }
      break;
    case 3:
      if(!game.prevCard1){ game.prevCard1=nextCard; correct=true; }
      else{
        const val1=cardValue(game.prevCard1);
        const val2=cardValue(game.prevCard2);
        const low=Math.min(val1,val2), high=Math.max(val1,val2);
        const nextVal=cardValue(nextCard);
        if((guess==="inside" && nextVal>low && nextVal<high) || (guess==="outside" && (nextVal<low||nextVal>high))) correct=true;
        game.prevCard1=game.prevCard2; game.prevCard2=nextCard;
      }
      break;
    case 4: if(guess===nextCard.slice(-1)) correct=true; break;
  }

  await sendCardSticker(bot, chatId, nextCard, stickers);

  if(correct){ game.score++; game.prevCard=nextCard; game.prevCard2=nextCard; game.round++; 
    await ctx.reply(`Correct! Score: ${game.score}`);
    await sendNextGuess(bot, chatId, games, stickers);
  }else{
    await bot.api.sendMessage(chatId, `Wrong! Game Over. Score: ${game.score}`);
    delete games[chatId];
  }
}

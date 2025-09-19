export function createDeck() {
  const suits = ['♠','♥','♦','♣'];
  const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const deck = [];
  suits.forEach(suit => ranks.forEach(rank => deck.push(rank + suit)));
  return deck;
}

export function cardValue(card) {
  const rank = card.slice(0, -1);
  if (['J','Q','K'].includes(rank)) return 10;
  if (rank === 'A') return 11;
  return parseInt(rank);
}

export function handValue(hand) {
  let total = hand.reduce((sum, c) => sum + cardValue(c), 0);
  let aces = hand.filter(c => c.slice(0, -1) === "A").length;
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

export function cardColor(card) {
  return ['♥','♦'].includes(card.slice(-1)) ? 'red' : 'black';
}

const suits = {
  clubs   : '♣',
  diamonds: '♦',
  hearts  : '♥',
  spades  : '♠',
};
const ranks = [...Array(9).keys()].map(r => (r + 2).toString()).concat(['J', 'Q', 'K', 'A']);

function buildDeck(){
  const deck = [];

  function shuffle(array){
    for (let i = array.length - 1, downTo = 1; i >= downTo; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
  }

  Object.entries(suits).forEach(([suit, icon]) => {
    ranks.forEach(rank => {
      const newCard = {suit, icon, rank, position: null};
      deck.push(newCard);
    });
  });

  return shuffle(deck);
}

function drawCardBack(position){
  const newCard = document.querySelector('#templates > .card-back').cloneNode(true);

  position.insertBefore(newCard, null);
}

function drawCardFace(position, card){
  const newCard = document.querySelector('#templates > .card-face').cloneNode(true);
  newCard.classList.add(card.suit);

  newCard.querySelector('.card-top').innerHTML = `<div>${card.rank}<br>${card.icon}</div><div>${card.rank}<br>${card.icon}</div>`;
  newCard.querySelector('.card-mid').innerHTML = `<div>${card.icon}</div>`;
  newCard.querySelector('.card-bot').innerHTML = `<div>${card.rank}<br>${card.icon}</div><div>${card.rank}<br>${card.icon}</div>`;

  position.insertBefore(newCard, null);
}

const deck = buildDeck();





for (let pileIndex = 0, pilesTotal = 7; pileIndex < pilesTotal; pileIndex++) {
  const pile = document.querySelector(`#pile-${pileIndex}`);

  for (let cardIndex = 0, cardsTotal = pileIndex; cardIndex <= cardsTotal; cardIndex++) {
    const selectedCard = deck[pileIndex + cardIndex];
    selectedCard.position = `pile-${pileIndex}--num-${cardIndex}`;

    if (cardIndex === cardsTotal) {
      drawCardFace(pile, selectedCard);
    } else {
      drawCardBack(pile);
    }
  }
}

const stock = document.querySelector('#stock');
drawCardBack(stock);

const waste = document.querySelector('#waste');
drawCardFace(waste, deck[7]);

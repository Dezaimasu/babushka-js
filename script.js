const suits = {
  clubs   : '♣',
  diamonds: '♦',
  hearts  : '♥',
  spades  : '♠',
};
const ranks = [...Array(9).keys()].map(r => (r + 2).toString()).concat(['J', 'Q', 'K', 'A']);

function buildDeck(){
  let deck = [];

  function shuffle(array){
    for (let i = array.length - 1, downTo = 1; i >= downTo; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
  }

  Object.entries(suits).forEach(([suit, icon]) => {
    ranks.forEach(rank => {
      const newCard = {suit, icon, rank, slotName: null, index: null};
      deck.push(newCard);
    });
  });

  deck = shuffle(deck);

  return deck.map((card, index) => {
    card.index = index;
    return card;
  });
}

const deck = buildDeck();

function drawCard(card){
  const cardNode = document.querySelector('#templates > .card').cloneNode(true);

  cardNode.querySelector('.card-top').innerHTML = `<div>${card.rank}<br>${card.icon}</div><div class="debug"></div><div>${card.rank}<br>${card.icon}</div>`;
  cardNode.querySelector('.card-mid').innerHTML = `<div>${card.icon}</div>`;
  cardNode.querySelector('.card-bot').innerHTML = `<div>${card.rank}<br>${card.icon}</div><div class="debug"></div><div>${card.rank}<br>${card.icon}</div>`;

  return cardNode;
}

function placeCard(card, slotName, upturned){
  const cardNode = drawCard(card);
  upturned = true; // TODO: remove after debug
  cardNode.dataset.upturned = upturned ? '1': '0';
  cardNode.dataset.suit = card.suit;
  cardNode.dataset.index = card.index;
  cardNode.dataset.debug = `${card.index}-${slotName}`; // TODO: remove after debug

  const slot = slots[slotName];
  slot.node.insertBefore(cardNode, null);
  slot.cards.push(card);
  card.slotName = slotName;
}

function removeCard(card){
  document.querySelector(`.card[data-index='${card.index}']`).remove();
}

function moveCard(card, from, to, upturned = true){
  const removedCard = slots[from].cards.pop();
  if (removedCard.suit !== card.suit || removedCard.rank !== card.rank) {
  	alert('ERROR');
  }

  removeCard(card);
  placeCard(card, to, upturned);
}

const slots = {
  stock       : {cards: [], node: document.querySelector('#stock')},
  waste       : {cards: [], node: document.querySelector('#waste')},
  foundation0 : {cards: [], node: document.querySelector('#foundation0')},
  foundation1 : {cards: [], node: document.querySelector('#foundation1')},
  foundation2 : {cards: [], node: document.querySelector('#foundation2')},
  foundation3 : {cards: [], node: document.querySelector('#foundation3')},
  pile0       : {cards: [], node: document.querySelector('#pile0')},
  pile1       : {cards: [], node: document.querySelector('#pile1')},
  pile2       : {cards: [], node: document.querySelector('#pile2')},
  pile3       : {cards: [], node: document.querySelector('#pile3')},
  pile4       : {cards: [], node: document.querySelector('#pile4')},
  pile5       : {cards: [], node: document.querySelector('#pile5')},
  pile6       : {cards: [], node: document.querySelector('#pile6')},
};

function moveCardsBetweenStockAndWaste(){
  const stockCards = slots.stock.cards;

  if (stockCards.length === 0) {
    const wasteCardIndexes = slots.waste.cards.map(card => card.index);
    wasteCardIndexes.reverse().forEach(cardIndex => {
      moveCard(deck[cardIndex], 'waste', 'stock', false);
    });
  } else {
    moveCard(stockCards.at(-1), 'stock', 'waste');
  }
}

const styleElem = document.createElement('style');
document.head.appendChild(styleElem);

let activeCard = null;

function toggleActiveCard(card){
  if (activeCard && activeCard.index === card.index) {
    activeCard = null;
    styleElem.sheet.cssRules.length > 0 && styleElem.sheet.deleteRule(0);
    return;
  }

  activeCard = card;

  styleElem.sheet.cssRules.length > 0 && styleElem.sheet.deleteRule(0);
  styleElem.sheet.insertRule(`[data-index='${activeCard.index}'] {box-shadow: 4px 4px purple inset, -4px -4px purple inset;}`);
}

function cardClickHandler(e){
  const slot = slots[e.currentTarget.id];
  if (slot.cards.length === 0) {
  	return;
  }

  toggleActiveCard(slot.cards.at(-1));
}

function init(){
  let cardIndex = 0;
  for (let pileIndex = 0, pilesTotal = 7; pileIndex < pilesTotal; pileIndex++) {
    for (let indexInPile = 0, cardsInPileTotal = pileIndex; indexInPile <= cardsInPileTotal; indexInPile++) {
      placeCard(
        deck[cardIndex++],
        `pile${pileIndex}`,
        indexInPile === cardsInPileTotal
      );
    }
  }

  const cardsInPiles = 28;
  deck.slice(cardsInPiles).forEach(card => {
    placeCard(card, 'stock', false);
  });

  slots.stock.node.addEventListener('click', moveCardsBetweenStockAndWaste);

  slots.waste.node.addEventListener('click', cardClickHandler);
  for (let i = 0, len = 7; i < len; i++) {
    slots[`pile${i}`].node.addEventListener('click', cardClickHandler);
  }
}

init();

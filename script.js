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
      const newCard = {
        index   : null,
        node    : null,
        slotName: null,
        upturned: false,
        suit,
        icon,
        rank,
      };
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

function buildCardNode(card){
  card.node = document.querySelector('#templates > .card').cloneNode(true);

  card.node.dataset.suit = card.suit;
  card.node.dataset.index = card.index;

  card.node.querySelector('.card-top').innerHTML = `<div>${card.rank}<br>${card.icon}</div><div class="debug"></div><div>${card.rank}<br>${card.icon}</div>`;
  card.node.querySelector('.card-mid').innerHTML = `<div>${card.icon}</div>`;
  card.node.querySelector('.card-bot').innerHTML = `<div>${card.rank}<br>${card.icon}</div><div class="debug"></div><div>${card.rank}<br>${card.icon}</div>`;
}

function moveCard(card, newSlotName, upturned = true){
  card.slotName && slots[card.slotName].cards.pop();

  card.node.dataset.upturned = upturned ? '1': '0';
  card.node.dataset.debug = `${card.index}-${newSlotName}`; // TODO: remove after debug

  slots[newSlotName].cards.push(card);
  slots[newSlotName].node.insertBefore(card.node, null);

  card.slotName = newSlotName;
  card.upturned = upturned;
  card.node.dataset.upturned = upturned ? '1': '0';
  card.node.dataset.debug = `${card.index}-${newSlotName}`; // TODO: remove after debug

  toggleActiveCard();
}

function placeCardOnTable(card, slotName, upturned){
  buildCardNode(card);
  moveCard(card, slotName, upturned);
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

const styleElem = document.createElement('style');
document.head.appendChild(styleElem);

let activeCard = null;

function toggleActiveCard(card = null){
  styleElem.sheet.cssRules.length > 0 && styleElem.sheet.deleteRule(0);

  if (card) {
    activeCard = card;
    styleElem.sheet.insertRule(`[data-index='${activeCard.index}'] {box-shadow: 4px 4px purple inset, -4px -4px purple inset;}`);
  } else {
    activeCard = null;
  }
}

function isLast(card){
  return slots[card.slotName].cards.at(-1).index === card.index;
}

function isMovable(card){
  if (card.slotName.startsWith('pile')) {
    return card.upturned || isLast(card);
  } else {
    return isLast(card);
  }
}

function cardClickHandler(e){
  const card = deck[e.currentTarget.dataset.index];

  if (card.slotName === 'stock' && isMovable(card)) {
  	moveCard(card, 'waste');
    return;
  }

  if (activeCard) {
    if (activeCard.index === card.index) {
      toggleActiveCard();
    } else {
      console.log('moving');
      // TODO: check if card can be moved here, then move
    }
  } else {
    if (isMovable(card)) {
      toggleActiveCard(card);
    }
  }
}

function moveWasteToStock(){
  if (slots.stock.cards.length > 0) {
  	return;
  }

  const wasteCardIndexes = slots.waste.cards.map(card => card.index);
  wasteCardIndexes.reverse().forEach(cardIndex => {
    moveCard(deck[cardIndex], 'stock', false);
  });
}

function placeCardsOnTable(){
  let cardIndex = 0;
  for (let pileIndex = 0, pilesTotal = 7; pileIndex < pilesTotal; pileIndex++) {
    for (let indexInPile = 0, cardsInPileTotal = pileIndex; indexInPile <= cardsInPileTotal; indexInPile++) {
      placeCardOnTable(
        deck[cardIndex++],
        `pile${pileIndex}`,
        indexInPile === cardsInPileTotal
      );
    }
  }

  const cardsInPiles = 28;
  deck.slice(cardsInPiles).forEach(card => {
    placeCardOnTable(card, 'stock', false);
  });
}

function initListeners(){
  deck.forEach(card => {
    card.node.addEventListener('click', cardClickHandler);
  });

  document.querySelector('#stock').addEventListener('click', moveWasteToStock);
}

placeCardsOnTable();
initListeners();

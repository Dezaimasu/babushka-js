let debug; // Ctrl+Alt+D

function toggleDebug(forceDebug = null){
  debug = forceDebug === null ? !debug : forceDebug;
  document.querySelector('#table').dataset.debug = debug || '';
}

function updateCardsDebugInfo(){
  if (deck.find(c => !c.node)) {
  	return;
  }

  deck.forEach(card => {
    const {node, ...debugData} = card;
    card.node.dataset.debug = JSON.stringify(debugData, null, ' ');
  });
}

let dragMode = true;

const suits = {
  spades  : '♠',
  clubs   : '♣',
  diamonds: '♦',
  hearts  : '♥',
};
const ranks = ['A'].concat([...Array(9).keys()].map(r => (r + 2).toString()), ['J', 'Q', 'K']);

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
        index     : null,
        node      : null,
        slotName  : null,
        upturned  : false,
        blocksCard: false,
        suitColor : ['spades', 'clubs'].includes(suit) ? 'black' : 'red',
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

  card.node.querySelectorAll('.rank').forEach(node => node.innerText = card.rank);
  card.node.querySelectorAll('.icon').forEach(node => node.innerText = card.icon);
}

function moveCard(card, newSlotName, upturned = true){
  if (card.slotName) {
    const slotCards = slots[card.slotName].cards;
    slotCards.splice(slotCards.indexOf(card), 1);
  }

  slots[newSlotName].cards.push(card);
  slots[newSlotName].node.insertBefore(card.node, null);

  card.slotName = newSlotName;
  card.upturned = upturned;
  card.node.dataset.upturned = upturned || '';

  if (card.slotName.startsWith('pile')) {
    let hasMultipleUpturned = false;

    slots[card.slotName].cards.forEach(cardInPile => {
      const blocksCard = hasMultipleUpturned;
      cardInPile.blocksCard = blocksCard;
      cardInPile.node.dataset.blocksCard = blocksCard || '';

      if (cardInPile.upturned) {
        hasMultipleUpturned = true;
      }
    });
  }

  toggleActiveCard();
  updateCardsDebugInfo();
}

function getCardsPile(){
  const slotCards = slots[activeCard.slotName].cards,
    cardIndexInSlot = slotCards.indexOf(activeCard);

  return slotCards.slice(cardIndexInSlot);
}

function moveCardsPile(newSlotName){
  getCardsPile().forEach(card => {
    moveCard(card, newSlotName);
  });
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
let slotToPlaceOn = null;
let movedCards = []; // {index, x, y}[]

function toggleActiveCard(card = null){
  styleElem.sheet.cssRules.length > 0 && styleElem.sheet.deleteRule(0);

  if (card) {
    activeCard = card;
    styleElem.sheet.insertRule(`[data-index='${activeCard.index}'] {box-shadow: 4px 4px purple inset, -4px -4px purple inset;}`);
  } else {
    activeCard = null;
  }
}

function flipCard(card){
  card.upturned = true;
  card.node.dataset.upturned = card.upturned;
  updateCardsDebugInfo();
}

function isLast(card){
  return slots[card.slotName].cards.at(-1).index === card.index;
}

function canBeMoved(card){
  if (card.slotName.startsWith('pile')) {
    return card.upturned || isLast(card);
  } else {
    return isLast(card);
  }
}

function canBePlacedOnThisCard(potentialCardToPlaceOn){
  if (potentialCardToPlaceOn.slotName.startsWith('foundation')) {
    return (
      potentialCardToPlaceOn.suit === activeCard.suit &&
      ranks.indexOf(potentialCardToPlaceOn.rank) === ranks.indexOf(activeCard.rank) - 1
    )
  }
  if (potentialCardToPlaceOn.slotName.startsWith('pile')) {
    return (
      potentialCardToPlaceOn.suitColor !== activeCard.suitColor &&
      ranks.indexOf(potentialCardToPlaceOn.rank) === ranks.indexOf(activeCard.rank) + 1
    );
  }
  return false;
}

function getEventCard(e){
  return deck[e.target.dataset.index];
}

function cardClickHandler(e){
  e.stopPropagation();

  const card = getEventCard(e);

  if (card.slotName === 'stock' && canBeMoved(card)) {
  	moveCard(card, 'waste');
    return;
  }

  if (card.slotName.startsWith('pile') && !card.upturned && isLast(card)) {
    flipCard(card);
    return;
  }

  if (dragMode) {
    return;
  }

  if (activeCard) {
    if (activeCard.index !== card.index && canBePlacedOnThisCard(card)) {
      moveCardsPile(card.slotName);
    }
    toggleActiveCard();

  } else {
    if (canBeMoved(card)) {
      toggleActiveCard(card);
    }
  }
}

function stockClickHandler(){
  if (slots.stock.cards.length > 0) {
  	return;
  }

  const wasteCardIndexes = slots.waste.cards.map(card => card.index);
  wasteCardIndexes.reverse().forEach(cardIndex => {
    moveCard(deck[cardIndex], 'stock', false);
  });
}

function foundationClickHandler(e){
  if (dragMode) {
    return;
  }

  const slotName = e.target.id;
  if (slots[slotName].cards.length > 0) {
  	return;
  }

  if (activeCard && activeCard.rank === 'A') {
  	moveCard(activeCard, slotName);
  } else {
    toggleActiveCard();
  }
}

function pileClickHandler(e){
  if (dragMode) {
    return;
  }

  const slotName = e.target.id;
  if (slots[slotName].cards.length > 0) {
    return;
  }

  if (activeCard && activeCard.rank === 'K') {
    moveCardsPile(slotName);
  } else {
    toggleActiveCard();
  }
}

let dragging = false;

function mousedownHandler(e){
  if (!dragMode) {
  	return;
  }
  if (e.buttons !== 1 || !('index' in e.target.dataset) || !e.target.dataset.upturned) {
    return;
  }

  dragging = true;
  const card = getEventCard(e);
  toggleActiveCard(card);

  const cardsToMove = getCardsPile();
  cardsToMove.forEach((c, i) => {
    movedCards.push({
      i: c.index,
      x: e.clientX,
      y: e.clientY,
    });
    c.node.style.zIndex = '1';
    card.node.style.pointerEvents = 'none';
  });
}

function mousemoveHandler(e){
  if (!dragMode || !dragging) {
    return;
  }
  movedCards.forEach(mc => {
    const card = deck[mc.i];
    card.node.style.left = (e.clientX - mc.x) + 'px';
    card.node.style.top = (e.clientY - mc.y) + 'px';
  });
}

function mouseoverHandler(e){
  if (!dragMode || !dragging) {
    return;
  }

  const cardUnderCursor = getEventCard(e);
  if (cardUnderCursor) {
    if (activeCard.index !== cardUnderCursor.index && canBePlacedOnThisCard(cardUnderCursor)) {
      slotToPlaceOn = cardUnderCursor.slotName;
    }
  } else {
    const slotName = e.target.getAttribute('id');

    if (
      (slotName.startsWith('foundation') && activeCard.rank === 'A') ||
      (/^pile\d$/.test(slotName) && slots[slotName].cards.length === 0 && activeCard.rank === 'K')
    ) {
      slotToPlaceOn = slotName;
    }
  }
}

function mouseupHandler(e){
  if (!dragMode) {
    return;
  }

  movedCards.forEach(mc => {
    const card = deck[mc.i];
    card.node.style.left = 'auto';
    card.node.style.top = 'auto';
    card.node.style.zIndex = 'auto';
    card.node.style.pointerEvents = 'auto';
  });
  movedCards = [];
  dragging = false;

  slotToPlaceOn && moveCardsPile(slotToPlaceOn);
  slotToPlaceOn = null;

  toggleActiveCard();
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

  const cardsInPiles = cardIndex;
  deck.slice(cardsInPiles).forEach(card => {
    placeCardOnTable(card, 'stock', false);
  });
}

function initListeners(){
  deck.forEach(card => {
    card.node.addEventListener('click', cardClickHandler);
  });

  document.querySelector('#stock').addEventListener('click', stockClickHandler);

  for (let i = 0, len = 4; i < len; i++) {
    document.querySelector('#foundation' + i).addEventListener('click', foundationClickHandler);
  }

  for (let i = 0, len = 7; i < len; i++) {
    document.querySelector('#pile' + i).addEventListener('click', pileClickHandler);
  }

  document.addEventListener('keyup', e => {
    if (e.ctrlKey && e.altKey) {
      e.code === 'KeyD' && toggleDebug();
      e.code === 'KeyM' && (dragMode = !dragMode);
    }
  });

  document.addEventListener('mousedown', mousedownHandler);
  document.addEventListener('mousemove', mousemoveHandler);
  document.addEventListener('mouseover', mouseoverHandler);
  document.addEventListener('mouseup', mouseupHandler);
  document.addEventListener('contextmenu', e => !debug && e.preventDefault());
}

placeCardsOnTable();
initListeners();
toggleDebug(false);

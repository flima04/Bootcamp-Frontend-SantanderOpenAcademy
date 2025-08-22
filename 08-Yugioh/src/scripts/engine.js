const state = {
  score: {
    playerScore: 0,
    computerScore: 0,
    scoreBox: document.getElementById("score_points"),
  },
  cardDisplay: {
    avatar: document.getElementById("card-image"),
    name: document.getElementById("card-name"),
    type: document.getElementById("card-type"),
  },
  fieldCards: {
    player: document.getElementById("player-field-card"),
    computer: document.getElementById("computer-field-card"),
  },
  playerAreas: {
    player: {
      id: "player-cards",
      element: document.querySelector("#player-cards"),
    },
    computer: {
      id: "computer-cards",
      element: document.querySelector("#computer-cards"),
    },
  },
  actions: {
    nextDuelButton: document.getElementById("next-duel"),
  },
  audio: {
    bgm: document.getElementById("bgm"),
  },
};

const PATH_IMAGES = "./src/assets/icons/";

const CARD_DATA = [
  {
    id: 0,
    name: "Blue Eyes White Dragon",
    type: "Paper",
    img: `${PATH_IMAGES}dragon.png`,
    winsAgainst: [1],
    losesTo: [2],
  },
  {
    id: 1,
    name: "Dark Magician",
    type: "Rock",
    img: `${PATH_IMAGES}magician.png`,
    winsAgainst: [2],
    losesTo: [0],
  },
  {
    id: 2,
    name: "Exodia",
    type: "Scissors",
    img: `${PATH_IMAGES}exodia.png`,
    winsAgainst: [0],
    losesTo: [1],
  },
];

function getRandomCardId() {
  return Math.floor(Math.random() * CARD_DATA.length);
}

async function playAudio(status) {
  const audio = new Audio(`./src/assets/audios/${status}.wav`);
  audio.volume = 0.2;

  try {
    await audio.play();
  } catch (error) {
    console.error(`Error playing audio for status "${status}":`, error);
  }
}

function createCardImage(cardId, fieldSide) {
  const cardImage = document.createElement("img");
  cardImage.setAttribute("height", "100px");
  cardImage.setAttribute("src", `${PATH_IMAGES}card-back.png`);
  cardImage.setAttribute("data-id", cardId);
  cardImage.classList.add("card");

  if (fieldSide.id === state.playerAreas.player.id) {
    cardImage.addEventListener("mouseover", () =>
      displaySelectedCardDetails(cardId)
    );
    cardImage.addEventListener("click", () => handleCardSelection(cardId));
  }

  return cardImage;
}

function removeAllCardsImages() {
  state.playerAreas.computer.element
    .querySelectorAll("img")
    .forEach((img) => img.remove());
  state.playerAreas.player.element
    .querySelectorAll("img")
    .forEach((img) => img.remove());
}

function displaySelectedCardDetails(index) {
  state.cardDisplay.avatar.src = CARD_DATA[index].img;
  state.cardDisplay.name.innerText = CARD_DATA[index].name;
  state.cardDisplay.type.innerText = `Attribute: ${CARD_DATA[index].type}`;
}

function hideCardDetails() {
  state.cardDisplay.avatar.src = "";
  state.cardDisplay.name.innerText = "";
  state.cardDisplay.type.innerText = "";
}

function drawCards(numberOfCards, fieldSide) {
  for (let i = 0; i < numberOfCards; i++) {
    const randomIdCard = getRandomCardId();
    const cardImage = createCardImage(randomIdCard, fieldSide);
    fieldSide.element.appendChild(cardImage);
  }
}

function toggleFieldCardVisibility(show) {
  state.fieldCards.player.style.display = show ? "block" : "none";
  state.fieldCards.computer.style.display = show ? "block" : "none";
}

function updateScoreDisplay() {
  state.score.scoreBox.innerText = `Win: ${state.score.playerScore} | Lose: ${state.score.computerScore}`;
}

function displayDuelCards(playerCardId, computerCardId) {
  state.fieldCards.player.src = CARD_DATA[playerCardId].img;
  state.fieldCards.computer.src = CARD_DATA[computerCardId].img;
}

function applyVisualEffect(status) {
  document.body.style.transition = "background-color 0.5s";
  let backgroundColor = "";

  if (status === "Win") {
    backgroundColor = "rgba(0, 255, 0, 0.3)";
  } else if (status === "Lose") {
    backgroundColor = "rgba(255, 0, 0, 0.3)";
  }

  document.body.style.backgroundColor = backgroundColor;

  setTimeout(() => {
    document.body.style.backgroundColor = "";
  }, 500);
}

function drawNextDuelButton(text) {
  state.actions.nextDuelButton.innerText = text.toUpperCase();
  state.actions.nextDuelButton.style.display = "block";
}

async function checkDuelResults(playerCardId, computerCardId) {
  let duelResult = "Draw";
  const playerCard = CARD_DATA[playerCardId];

  if (playerCard.winsAgainst.includes(computerCardId)) {
    duelResult = "Win";
    state.score.playerScore++;
  } else if (playerCard.losesTo.includes(computerCardId)) {
    duelResult = "Lose";
    state.score.computerScore++;
  }

  await playAudio(duelResult.toLowerCase());
  applyVisualEffect(duelResult);
  return duelResult;
}

async function handleCardSelection(cardId) {
  removeAllCardsImages();
  const computerCardId = getRandomCardId();

  toggleFieldCardVisibility(true);
  hideCardDetails();
  displayDuelCards(cardId, computerCardId);

  const duelResults = await checkDuelResults(cardId, computerCardId);
  updateScoreDisplay();
  drawNextDuelButton(duelResults);
}

function resetDuel() {
  hideCardDetails();
  state.actions.nextDuelButton.style.display = "none";
  toggleFieldCardVisibility(false);
  init();
}

function init() {
  toggleFieldCardVisibility(false);
  drawCards(5, state.playerAreas.player);
  drawCards(5, state.playerAreas.computer);
  updateScoreDisplay();

  if (state.audio.bgm) {
    state.audio.bgm.volume = 0.1;
    state.audio.bgm.loop = true;
    state.audio.bgm.play().catch((error) => {
      console.error("Error playing background music:", error);
    });
  } else {
    console.warn("Background music element not found.");
  }

  state.actions.nextDuelButton.removeEventListener("click", resetDuel);
  state.actions.nextDuelButton.addEventListener("click", resetDuel);
}

init();

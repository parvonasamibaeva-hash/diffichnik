/* ВЫБЕРИ СВОЙ КОМПРОМАТ — игровая логика.
   Чтобы изменить вопросы, редактируйте только массив TASKS ниже. */
"use strict";

const TASKS = [
  { id: 1, category: "КОМПРОМАТ", question: "Какую историю обо мне ты бы рассказала Роме, если бы он заплатил тебе миллион рублей?", instruction: "Расскажи историю так, будто даёшь показания следователю." },
  { id: 2, category: "КРИНЖ-ЗАДАНИЯ", question: "Изобрази Парвону, когда она очень хочет что-то купить, а Рома говорит, что это совершенно не нужно", instruction: "Без подготовки. Остальные угадывают, насколько точно получилось." },
  { id: 3, category: "НЕУДОБНЫЕ ВОПРОСЫ", question: "Какая моя черта характера тебя иногда откровенно бесит, но ты уже смирилась?", instruction: "" },
  { id: 4, category: "СЕКРЕТНЫЕ КАРТОЧКИ", question: "Какой наш общий день ты хотела бы пережить ещё раз, ничего в нём не меняя?", instruction: "" },
  { id: 5, category: "КРИНЖ-ЗАДАНИЯ", question: "Произнеси свадебный тост в стиле российских свадеб 90-х. Обязательно упомяни детей, семейный долг и будущих внуков", instruction: "" },
  { id: 6, category: "КОМПРОМАТ", question: "Вспомни момент, когда ты посмотрела на меня и подумала: «Господи, с кем я вообще дружу?»", instruction: "" },
  { id: 7, category: "НЕУДОБНЫЕ ВОПРОСЫ", question: "Какой у меня самый большой ред-флаг как у подруги?", instruction: "" },
  { id: 8, category: "СЕКРЕТНЫЕ КАРТОЧКИ", question: "Есть ли что-то, за что ты мне благодарна, но никогда не говорила об этом?", instruction: "" },
  { id: 9, category: "КОМПРОМАТ", question: "Какую нашу общую историю невозможно рассказывать с серьёзным лицом?", instruction: "" },
  { id: 10, category: "КРИНЖ-ЗАДАНИЯ", question: "Прорекламируй Парвону как товар с маркетплейса. Назови три достоинства, два недостатка и условия возврата", instruction: "" },
  { id: 11, category: "СЕКРЕТНЫЕ КАРТОЧКИ", question: "В какой момент нашей дружбы тебе было особенно важно, что я рядом?", instruction: "" },
  { id: 12, category: "НЕУДОБНЫЕ ВОПРОСЫ", question: "Что ты подумала о Роме, когда впервые его увидела? Только без красивых ответов!", instruction: "" },
  { id: 13, category: "КРИНЖ-ЗАДАНИЯ", question: "Сыграй Парвону в трёх состояниях: когда она только проснулась, когда голодная и когда ей пришла очередная гениальная идея", instruction: "" },
  { id: 14, category: "КОМПРОМАТ", question: "Какой мой самый нелепый поступок ты до сих пор помнишь?", instruction: "" },
  { id: 15, category: "СЕКРЕТНЫЕ КАРТОЧКИ", question: "Какими ты представляешь нас четверых через десять лет? Где мы, что делаем и над чем смеёмся?", instruction: "" },
  { id: 16, category: "НЕУДОБНЫЕ ВОПРОСЫ", question: "Что ты обо мне поняла раньше, чем я сама это осознала?", instruction: "" },
  { id: 17, category: "КРИНЖ-ЗАДАНИЯ", question: "Разыграй самый нелепый семейный скандал Парвоны и Ромы. Ты играешь обе роли", instruction: "" },
  { id: 18, category: "КОМПРОМАТ", question: "Какой эпизод из наших студенческих лет пришлось бы вырезать из фильма, чтобы он прошёл цензуру?", instruction: "" },
  { id: 19, category: "НЕУДОБНЫЕ ВОПРОСЫ", question: "Какой самый нелепый совет ты могла бы дать Роме перед свадьбой, чтобы он был готов к жизни со мной?", instruction: "" },
  { id: 20, category: "СЕКРЕТНЫЕ КАРТОЧКИ", question: "Что во мне с годами изменилось, а что, к счастью, осталось прежним?", instruction: "" }
];

const PLAYERS = ["Наташа Алексеева", "Наташа Ананьева", "Катя Русакова"];
const STORAGE_KEY = "parvona-kompromat-game-v1";

const DEFAULT_STATE = {
  completedIds: [],
  openedIds: [],
  skippedIds: [],
  currentPlayerIndex: 0,
  currentCardId: null,
  screen: "intro"
};

let state = loadState();
let timerInterval = null;
let timerRemaining = 30;
let toastTimeout = null;
let previousFocus = null;

const screens = {
  intro: document.getElementById("intro-screen"),
  game: document.getElementById("game-screen"),
  task: document.getElementById("task-screen"),
  final: document.getElementById("final-screen")
};

const el = {
  start: document.getElementById("start-button"),
  grid: document.getElementById("card-grid"),
  progressLabel: document.getElementById("progress-label"),
  progressFill: document.getElementById("progress-fill"),
  progressTrack: document.getElementById("progress-track"),
  playerSelect: document.getElementById("player-select"),
  taskNumber: document.getElementById("task-number"),
  taskCategory: document.getElementById("task-category"),
  taskQuestion: document.getElementById("task-question"),
  taskInstruction: document.getElementById("task-instruction"),
  taskStatus: document.getElementById("task-status"),
  complete: document.getElementById("complete-button"),
  skip: document.getElementById("skip-button"),
  back: document.getElementById("back-to-field"),
  timerDisplay: document.getElementById("timer-display"),
  timerButton: document.getElementById("timer-button"),
  fullscreen: document.getElementById("fullscreen-button"),
  reset: document.getElementById("reset-button"),
  modal: document.getElementById("confirm-modal"),
  cancelReset: document.getElementById("cancel-reset"),
  confirmReset: document.getElementById("confirm-reset"),
  openFinal: document.getElementById("open-final-button"),
  finalBack: document.getElementById("final-back-button"),
  toast: document.getElementById("toast")
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== "object") return { ...DEFAULT_STATE };
    const validIds = (items) => Array.isArray(items) ? [...new Set(items.filter(id => Number.isInteger(id) && id >= 1 && id <= TASKS.length))] : [];
    return {
      completedIds: validIds(saved.completedIds),
      openedIds: validIds(saved.openedIds),
      skippedIds: validIds(saved.skippedIds),
      currentPlayerIndex: Number.isInteger(saved.currentPlayerIndex) && saved.currentPlayerIndex >= 0 && saved.currentPlayerIndex < PLAYERS.length ? saved.currentPlayerIndex : 0,
      currentCardId: Number.isInteger(saved.currentCardId) && saved.currentCardId >= 1 && saved.currentCardId <= TASKS.length ? saved.currentCardId : null,
      screen: ["intro", "game", "task", "final"].includes(saved.screen) ? saved.screen : "intro"
    };
  } catch (error) {
    console.warn("Не удалось прочитать сохранённую игру:", error);
    return { ...DEFAULT_STATE };
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Не удалось сохранить прогресс:", error);
  }
}

function showScreen(name, { pushHistory = true, focus = true } = {}) {
  if (!screens[name]) name = "game";
  Object.entries(screens).forEach(([key, screen]) => {
    const active = key === name;
    screen.hidden = !active;
    screen.classList.toggle("is-active", active);
    screen.classList.remove("is-entering");
    if (active) {
      // Перезапуск CSS-перехода при смене экрана.
      void screen.offsetWidth;
      screen.classList.add("is-entering");
    }
  });
  state.screen = name;
  if (pushHistory) {
    try { history.pushState({ appScreen: name }, "", `#${name}`); } catch (_) {}
  }
  saveState();
  stopTimer();
  if (name === "game") renderGame();
  if (name === "task") renderTask();
  if (focus) {
    window.setTimeout(() => {
      if (name === "game") el.grid.querySelector("button")?.focus({ preventScroll: true });
      if (name === "task") el.taskQuestion.focus({ preventScroll: true });
      if (name === "final") el.finalBack.focus({ preventScroll: true });
    }, 80);
  }
}

function renderGame() {
  el.grid.innerHTML = "";
  TASKS.forEach(task => {
    const isCompleted = state.completedIds.includes(task.id);
    const isOpened = state.openedIds.includes(task.id);
    const isSkipped = state.skippedIds.includes(task.id);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "number-card";
    if (isOpened) button.classList.add("is-opened");
    if (isCompleted) button.classList.add("is-completed");
    button.setAttribute("aria-label", `Карточка ${task.id}${isCompleted ? ", выполнена" : isOpened ? ", уже открывалась" : ", закрыта"}`);
    const number = document.createElement("span");
    number.className = "card-number";
    number.textContent = String(task.id).padStart(2, "0");
    const bottom = document.createElement("span");
    bottom.className = "card-bottom";
    bottom.textContent = isCompleted ? "ЗАКРЫТО" : isOpened ? "УЖЕ ОТКРЫВАЛИ" : "ДОСЬЕ";
    button.append(number, bottom);
    if (isSkipped && !isCompleted) {
      const skipMark = document.createElement("span");
      skipMark.className = "card-skip-mark";
      skipMark.textContent = "↻";
      skipMark.setAttribute("aria-label", "Отложено");
      button.append(skipMark);
    }
    if (isCompleted) {
      const check = document.createElement("span");
      check.className = "card-check";
      check.textContent = "✓";
      check.setAttribute("aria-hidden", "true");
      button.append(check);
    }
    button.addEventListener("click", () => openTask(task.id));
    el.grid.append(button);
  });

  const openedCount = state.openedIds.length;
  el.progressLabel.textContent = `Открыто ${openedCount} из ${TASKS.length} карточек`;
  el.progressFill.style.width = `${(openedCount / TASKS.length) * 100}%`;
  el.progressTrack.setAttribute("aria-valuenow", String(openedCount));
  el.playerSelect.value = String(state.currentPlayerIndex);
}

function openTask(id) {
  const task = TASKS.find(item => item.id === id);
  if (!task) return;
  state.currentCardId = id;
  if (!state.openedIds.includes(id)) state.openedIds.push(id);
  state.skippedIds = state.skippedIds.filter(item => item !== id);
  saveState();
  showScreen("task");
}

function renderTask() {
  const task = TASKS.find(item => item.id === state.currentCardId);
  if (!task) {
    showScreen("game", { pushHistory: false });
    return;
  }
  el.taskNumber.textContent = `КАРТОЧКА № ${String(task.id).padStart(2, "0")}`;
  el.taskCategory.textContent = task.category;
  el.taskQuestion.textContent = task.question;
  el.taskInstruction.textContent = task.instruction;
  el.taskInstruction.hidden = !task.instruction;
  const completed = state.completedIds.includes(task.id);
  el.taskStatus.textContent = completed ? "УЖЕ ВЫПОЛНЕНО" : "ИСТОРИЯ ОЖИДАЕТ";
  el.complete.innerHTML = completed ? 'УЖЕ ВЫПОЛНЕНО <span aria-hidden="true">✓</span>' : 'ВЫПОЛНЕНО <span aria-hidden="true">✓</span>';
  resetTimerDisplay();
}

function completeTask() {
  const id = state.currentCardId;
  if (!id) return;
  const wasCompleted = state.completedIds.includes(id);
  if (!wasCompleted) {
    state.completedIds.push(id);
    state.skippedIds = state.skippedIds.filter(item => item !== id);
    state.currentPlayerIndex = (state.currentPlayerIndex + 1) % PLAYERS.length;
    showToast(`Следующий ход: ${PLAYERS[state.currentPlayerIndex]}`);
  } else {
    showToast("Эта карточка уже отмечена как выполненная.");
  }
  state.currentCardId = null;
  saveState();
  showScreen("game");
}

function skipTask() {
  const id = state.currentCardId;
  if (!id) return;
  if (!state.completedIds.includes(id) && !state.skippedIds.includes(id)) state.skippedIds.push(id);
  state.currentCardId = null;
  saveState();
  showScreen("game");
  showToast("Карточка отложена. К ней можно вернуться позже.");
}

function returnToField() {
  state.currentCardId = null;
  saveState();
  showScreen("game");
}

function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.add("is-visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => el.toast.classList.remove("is-visible"), 2600);
}

function stopTimer() {
  if (timerInterval) window.clearInterval(timerInterval);
  timerInterval = null;
  timerRemaining = 30;
  if (el.timerButton) {
    el.timerButton.disabled = false;
    el.timerButton.textContent = "ЗАПУСТИТЬ 30 СЕКУНД";
  }
  if (el.timerDisplay) el.timerDisplay.textContent = "00:30";
}

function resetTimerDisplay() {
  stopTimer();
}

function startTimer() {
  if (timerInterval) return;
  timerRemaining = 30;
  el.timerButton.disabled = true;
  el.timerButton.textContent = "ТАЙМЕР ИДЁТ";
  updateTimer();
  timerInterval = window.setInterval(() => {
    timerRemaining -= 1;
    updateTimer();
    if (timerRemaining <= 0) {
      window.clearInterval(timerInterval);
      timerInterval = null;
      el.timerButton.disabled = false;
      el.timerButton.textContent = "ЗАПУСТИТЬ ЕЩЁ РАЗ";
      showToast("Время вышло. Но история может продолжаться!");
    }
  }, 1000);
}

function updateTimer() {
  const seconds = Math.max(0, timerRemaining);
  el.timerDisplay.textContent = `00:${String(seconds).padStart(2, "0")}`;
}

function openResetModal() {
  previousFocus = document.activeElement;
  el.modal.hidden = false;
  el.cancelReset.focus();
}

function closeResetModal() {
  el.modal.hidden = true;
  previousFocus?.focus?.();
}

function resetGame() {
  state = { ...DEFAULT_STATE };
  saveState();
  closeResetModal();
  showScreen("intro");
  showToast("Досье очищено. Можно начинать заново.");
}

async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      el.fullscreen.setAttribute("aria-label", "Выйти из полноэкранного режима");
      el.fullscreen.title = "Выйти из полноэкранного режима";
    } else {
      await document.exitFullscreen();
      el.fullscreen.setAttribute("aria-label", "Включить полноэкранный режим");
      el.fullscreen.title = "Полноэкранный режим";
    }
  } catch (error) {
    showToast("Полноэкранный режим недоступен в этом браузере.");
  }
}

function openFinal() {
  state.currentCardId = null;
  saveState();
  showScreen("final");
}

function handlePopState(event) {
  const requested = event.state?.appScreen;
  if (requested === "task" && state.currentCardId) {
    showScreen("task", { pushHistory: false, focus: false });
  } else if (requested === "final") {
    showScreen("final", { pushHistory: false, focus: false });
  } else if (requested === "game" || requested === "intro") {
    state.currentCardId = null;
    showScreen(requested, { pushHistory: false, focus: false });
  } else if (state.screen === "task") {
    state.currentCardId = null;
    showScreen("game", { pushHistory: false, focus: false });
  } else {
    showScreen("game", { pushHistory: false, focus: false });
  }
}

function init() {
  el.start.addEventListener("click", () => showScreen("game"));
  el.back.addEventListener("click", returnToField);
  el.complete.addEventListener("click", completeTask);
  el.skip.addEventListener("click", skipTask);
  el.timerButton.addEventListener("click", startTimer);
  el.playerSelect.addEventListener("change", event => {
    const nextIndex = Number(event.target.value);
    if (Number.isInteger(nextIndex) && PLAYERS[nextIndex]) {
      state.currentPlayerIndex = nextIndex;
      saveState();
      showToast(`Теперь ходит: ${PLAYERS[nextIndex]}`);
    }
  });
  el.fullscreen.addEventListener("click", toggleFullscreen);
  document.addEventListener("fullscreenchange", () => {
    const active = Boolean(document.fullscreenElement);
    el.fullscreen.setAttribute("aria-label", active ? "Выйти из полноэкранного режима" : "Включить полноэкранный режим");
    el.fullscreen.title = active ? "Выйти из полноэкранного режима" : "Полноэкранный режим";
  });
  el.reset.addEventListener("click", openResetModal);
  el.cancelReset.addEventListener("click", closeResetModal);
  el.confirmReset.addEventListener("click", resetGame);
  el.modal.addEventListener("click", event => {
    if (event.target === el.modal) closeResetModal();
  });
  el.openFinal.addEventListener("click", openFinal);
  el.finalBack.addEventListener("click", () => showScreen("game"));
  window.addEventListener("popstate", handlePopState);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      if (!el.modal.hidden) {
        closeResetModal();
      } else if (state.screen === "task") {
        returnToField();
      } else if (state.screen === "final") {
        showScreen("game");
      }
    }
  });

  renderGame();

  // Возвращаемся к текущему делу, если страницу обновили во время вопроса.
  if (state.screen === "task" && state.currentCardId) {
    showScreen("task", { pushHistory: false, focus: false });
  } else if (state.screen === "final") {
    showScreen("final", { pushHistory: false, focus: false });
  } else if (state.screen === "game") {
    showScreen("game", { pushHistory: false, focus: false });
  } else {
    showScreen("intro", { pushHistory: false, focus: false });
  }
}

init();

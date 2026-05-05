import { getElements, renderState, showStatus, clearStatus } from "./dom.js";
import { initDragAndDrop } from "./drag-drop.js";
import { addItem, createDefaultState, deleteItem, moveItem, setExtraTiers } from "./state.js";
import { parseStateFromUrl, writeStateToUrl } from "./url-state.js";

let state = parseStateFromUrl(window.location.search);
const elements = getElements();
const uiState = {
  selectedItemId: null,
  statusTimer: null,
};

renderState(state, elements, uiState);
resizeTitleInput();
setCopyrightYear();
bindEvents();

function bindEvents() {
  elements.titleInput.addEventListener("input", () => {
    state.title = elements.titleInput.value;
    resizeTitleInput();
    writeStateToUrl(state);
  });

  elements.titleInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      elements.titleInput.blur();
    }
  });

  elements.addItemButton.addEventListener("click", () => {
    elements.addItemForm.hidden = false;
    elements.itemInput.focus();
  });

  elements.collapseAddItemButton.addEventListener("click", () => {
    collapseAddItemForm();
  });

  elements.addItemForm.addEventListener("submit", (event) => {
    event.preventDefault();
    submitItem();
  });

  elements.itemInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      collapseAddItemForm();
    }
  });

  elements.copyLinkButton.addEventListener("click", copyCurrentLink);

  elements.clearListButton.addEventListener("click", () => {
    if (!window.confirm("Clear this tier list?")) {
      return;
    }

    state = createDefaultState();
    uiState.selectedItemId = null;
    collapseAddItemForm({ focusButton: false });
    renderAndSync();
    flashStatus("List cleared");
  });

  window.addEventListener("resize", resizeTitleInput);

  elements.settingsButton.addEventListener("click", () => {
    const isOpen = elements.settingsPanel.hidden;
    elements.settingsPanel.hidden = !isOpen;
    elements.settingsButton.setAttribute("aria-expanded", String(isOpen));
  });

  elements.showExtraTiersToggle.addEventListener("change", () => {
    setExtraTiers(state, elements.showExtraTiersToggle.checked);
    renderAndSync();
  });

  elements.app.addEventListener("click", handleAppClick);

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".settings")) {
      elements.settingsPanel.hidden = true;
      elements.settingsButton.setAttribute("aria-expanded", "false");
    }
  });

  initDragAndDrop(elements.app, {
    onMove(itemId, destination, destinationIndex) {
      if (moveItem(state, itemId, destination, destinationIndex)) {
        uiState.selectedItemId = itemId;
        renderAndSync();
      }
    },
    onSelect(itemId) {
      uiState.selectedItemId = itemId;
    },
  });
}

function submitItem() {
  const item = addItem(state, elements.itemInput.value);

  if (!item) {
    return;
  }

  elements.itemInput.value = "";
  uiState.selectedItemId = item.id;
  renderAndSync();
  elements.itemInput.focus();
}

function collapseAddItemForm({ focusButton = true } = {}) {
  elements.addItemForm.hidden = true;
  elements.itemInput.value = "";

  if (focusButton) {
    elements.addItemButton.focus();
  }
}

function handleAppClick(event) {
  const deleteButton = event.target.closest("[data-delete-item]");

  if (deleteButton) {
    deleteItem(state, deleteButton.dataset.deleteItem);
    uiState.selectedItemId = null;
    renderAndSync();
    return;
  }

  const item = event.target.closest(".tier-item");

  if (item && uiState.selectedItemId !== item.dataset.itemId) {
    uiState.selectedItemId = item.dataset.itemId;
    renderState(state, elements, uiState);
  }
}

async function copyCurrentLink() {
  writeStateToUrl(state);

  try {
    await navigator.clipboard.writeText(window.location.href);
    flashStatus("Link copied");
  } catch {
    fallbackCopyLink();
  }
}

function fallbackCopyLink() {
  const copyInput = document.createElement("input");
  copyInput.value = window.location.href;
  copyInput.setAttribute("readonly", "");
  copyInput.className = "visually-hidden";
  document.body.append(copyInput);
  copyInput.select();

  try {
    document.execCommand("copy");
    flashStatus("Link copied");
  } catch {
    flashStatus("Could not copy link");
  } finally {
    copyInput.remove();
  }
}

function renderAndSync() {
  renderState(state, elements, uiState);
  resizeTitleInput();
  writeStateToUrl(state);
}

function flashStatus(message) {
  window.clearTimeout(uiState.statusTimer);
  showStatus(elements, message);
  uiState.statusTimer = window.setTimeout(() => {
    clearStatus(elements);
  }, 1800);
}

function resizeTitleInput() {
  const titleLength = elements.titleInput.value.trim().length;
  elements.titleInput.classList.toggle("is-title-long", titleLength > 22);
  elements.titleInput.classList.toggle("is-title-extra-long", titleLength > 48);
  elements.titleInput.style.height = "auto";
  elements.titleInput.style.height = `${elements.titleInput.scrollHeight}px`;
}

function setCopyrightYear() {
  elements.copyrightYear.textContent = new Date().getFullYear();
}

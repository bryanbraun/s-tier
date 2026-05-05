import { getVisibleTiers } from "./state.js";

export function getElements() {
  return {
    app: document.querySelector("#app"),
    titleInput: document.querySelector("#tier-title"),
    addItemButton: document.querySelector("#add-item-button"),
    addItemForm: document.querySelector("#add-item-form"),
    itemInput: document.querySelector("#item-name"),
    copyLinkButton: document.querySelector("#copy-link-button"),
    clearListButton: document.querySelector("#clear-list-button"),
    settingsButton: document.querySelector("#settings-button"),
    settingsPanel: document.querySelector("#settings-panel"),
    showExtraTiersToggle: document.querySelector("#show-extra-tiers"),
    unrankedZone: document.querySelector("#unranked-zone"),
    tierBoard: document.querySelector("#tier-board"),
    statusMessage: document.querySelector("#status-message"),
  };
}

export function renderState(state, elements, uiState) {
  elements.titleInput.value = state.title;
  elements.showExtraTiersToggle.checked = state.showExtraTiers;

  renderItemZone(elements.unrankedZone, state.unranked, uiState);
  renderTierRows(state, elements, uiState);
}

export function showStatus(elements, message) {
  elements.statusMessage.textContent = message;
}

export function clearStatus(elements) {
  elements.statusMessage.textContent = "";
}

function renderTierRows(state, elements, uiState) {
  elements.tierBoard.replaceChildren(
    ...getVisibleTiers(state).map((tier) => createTierRow(tier, state.tiers[tier], uiState)),
  );
}

function createTierRow(tier, items, uiState) {
  const row = document.createElement("div");
  row.className = "tier-row";
  row.dataset.tier = tier;

  const label = document.createElement("div");
  label.className = `tier-label tier-label-${tier.toLowerCase()}`;
  label.textContent = tier;

  const itemZone = document.createElement("div");
  itemZone.className = "tier-items drop-zone";
  itemZone.dataset.zone = "tier";
  itemZone.dataset.tier = tier;

  renderItemZone(itemZone, items, uiState);

  row.append(label, itemZone);
  return row;
}

function renderItemZone(zone, items, uiState) {
  zone.replaceChildren(...items.map((item) => createItemChip(item, uiState)));
}

function createItemChip(item, uiState) {
  const chip = document.createElement("div");
  chip.className = "tier-item";
  chip.draggable = true;
  chip.tabIndex = 0;
  chip.dataset.itemId = item.id;

  if (uiState.selectedItemId === item.id) {
    chip.classList.add("is-selected");
  }

  const name = document.createElement("span");
  name.className = "item-name";
  name.textContent = item.name;

  const deleteButton = document.createElement("button");
  deleteButton.className = "item-delete";
  deleteButton.type = "button";
  deleteButton.textContent = "x";
  deleteButton.title = "Delete item";
  deleteButton.setAttribute("aria-label", `Delete ${item.name}`);
  deleteButton.dataset.deleteItem = item.id;

  chip.append(name, deleteButton);
  return chip;
}

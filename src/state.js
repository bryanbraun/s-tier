export const TIER_ORDER = ["S", "A", "B", "C", "D", "E", "F"];
export const DEFAULT_VISIBLE_TIERS = ["S", "A", "B", "C", "D"];
export const EXTRA_TIERS = ["E", "F"];

export function createDefaultState() {
  return {
    title: "",
    showExtraTiers: false,
    tiers: Object.fromEntries(TIER_ORDER.map((tier) => [tier, []])),
    unranked: [],
    nextId: 1,
  };
}

export function createItemFactory(state) {
  return (name) => {
    const item = {
      id: `item-${state.nextId}`,
      name,
    };

    state.nextId += 1;
    return item;
  };
}

export function getVisibleTiers(state) {
  return state.showExtraTiers ? TIER_ORDER : DEFAULT_VISIBLE_TIERS;
}

export function addItem(state, rawName) {
  const name = normalizeItemName(rawName);

  if (!name) {
    return null;
  }

  const createItem = createItemFactory(state);
  const item = createItem(name);
  state.unranked.push(item);
  return item;
}

export function deleteItem(state, itemId) {
  return Boolean(removeItem(state, itemId));
}

export function moveItem(state, itemId, destination, destinationIndex) {
  const item = removeItem(state, itemId);

  if (!item) {
    return false;
  }

  const target = getDestinationList(state, destination);

  if (!target) {
    state.unranked.push(item);
    return false;
  }

  const index = clampIndex(destinationIndex, target.length);
  target.splice(index, 0, item);
  return true;
}

export function setExtraTiers(state, enabled) {
  state.showExtraTiers = enabled;

  if (!enabled) {
    for (const tier of EXTRA_TIERS) {
      state.unranked.push(...state.tiers[tier]);
      state.tiers[tier] = [];
    }
  }
}

export function hasShareableContent(state) {
  return Boolean(
    state.title.trim() ||
      state.showExtraTiers ||
      state.unranked.length ||
      TIER_ORDER.some((tier) => state.tiers[tier].length),
  );
}

export function normalizeItemName(rawName) {
  return rawName.trim().replace(/\s+/g, " ");
}

function getDestinationList(state, destination) {
  if (destination === "unranked") {
    return state.unranked;
  }

  if (TIER_ORDER.includes(destination)) {
    return state.tiers[destination];
  }

  return null;
}

function removeItem(state, itemId) {
  const lists = [state.unranked, ...TIER_ORDER.map((tier) => state.tiers[tier])];

  for (const list of lists) {
    const itemIndex = list.findIndex((item) => item.id === itemId);

    if (itemIndex >= 0) {
      const [item] = list.splice(itemIndex, 1);
      return item;
    }
  }

  return null;
}

function clampIndex(index, max) {
  if (!Number.isInteger(index)) {
    return max;
  }

  return Math.max(0, Math.min(index, max));
}

import { TIER_ORDER, createDefaultState, createItemFactory, hasShareableContent } from "./state.js";

const TITLE_PARAM = "title";
const UNRANKED_PARAM = "unranked";
const SHOW_PARAM = "show";
const EXTRA_TIER_VALUE = "EF";

export function parseStateFromUrl(search) {
  const params = new URLSearchParams(search);

  if (!hasKnownStateParams(params)) {
    return createDefaultState();
  }

  const state = createDefaultState();
  const createItem = createItemFactory(state);
  state.title = params.get(TITLE_PARAM) ?? "";
  state.showExtraTiers =
    params.get(SHOW_PARAM) === EXTRA_TIER_VALUE || params.has("E") || params.has("F");

  for (const tier of TIER_ORDER) {
    state.tiers[tier] = parseItemList(params.get(tier)).map(createItem);
  }

  state.unranked = parseItemList(params.get(UNRANKED_PARAM)).map(createItem);

  return state;
}

export function writeStateToUrl(state) {
  const queryString = serializeState(state);
  const nextUrl = queryString
    ? `${window.location.pathname}?${queryString}`
    : window.location.pathname;

  window.history.replaceState(null, "", nextUrl);
}

export function serializeState(state) {
  if (!hasShareableContent(state)) {
    return "";
  }

  const params = new URLSearchParams();
  const title = state.title.trim();

  if (title) {
    params.set(TITLE_PARAM, title);
  }

  if (state.showExtraTiers) {
    params.set(SHOW_PARAM, EXTRA_TIER_VALUE);
  }

  for (const tier of TIER_ORDER) {
    if (state.tiers[tier].length) {
      params.set(tier, serializeItems(state.tiers[tier]));
    }
  }

  if (state.unranked.length) {
    params.set(UNRANKED_PARAM, serializeItems(state.unranked));
  }

  return params.toString();
}

function parseItemList(rawValue) {
  if (!rawValue) {
    return [];
  }

  return rawValue
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
}

function serializeItems(items) {
  return items.map((item) => item.name).join(",");
}

function hasKnownStateParams(params) {
  return (
    params.has(TITLE_PARAM) ||
    params.has(UNRANKED_PARAM) ||
    params.has(SHOW_PARAM) ||
    TIER_ORDER.some((tier) => params.has(tier))
  );
}

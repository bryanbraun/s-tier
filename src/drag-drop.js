export function initDragAndDrop(root, callbacks) {
  let draggedItemId = null;

  root.addEventListener("dragstart", (event) => {
    const chip = event.target.closest(".tier-item");

    if (!chip) {
      return;
    }

    draggedItemId = chip.dataset.itemId;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", draggedItemId);
    chip.classList.add("is-dragging");
    callbacks.onSelect(draggedItemId);
  });

  root.addEventListener("dragend", () => {
    draggedItemId = null;
    clearDragState(root);
  });

  root.addEventListener("dragover", (event) => {
    const zone = event.target.closest(".drop-zone");

    if (!zone || !draggedItemId) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    markDropZone(root, zone);
  });

  root.addEventListener("dragleave", (event) => {
    const zone = event.target.closest(".drop-zone");

    if (zone && !zone.contains(event.relatedTarget)) {
      zone.classList.remove("is-drop-target");
    }
  });

  root.addEventListener("drop", (event) => {
    const zone = event.target.closest(".drop-zone");

    if (!zone) {
      return;
    }

    event.preventDefault();
    const itemId = event.dataTransfer.getData("text/plain") || draggedItemId;

    if (!itemId) {
      return;
    }

    const destination = zone.dataset.zone === "tier" ? zone.dataset.tier : "unranked";
    const destinationIndex = getInsertionIndex(zone, event);

    callbacks.onMove(itemId, destination, destinationIndex);
    clearDragState(root);
    draggedItemId = null;
  });
}

function markDropZone(root, activeZone) {
  for (const zone of root.querySelectorAll(".drop-zone.is-drop-target")) {
    if (zone !== activeZone) {
      zone.classList.remove("is-drop-target");
    }
  }

  activeZone.classList.add("is-drop-target");
}

function clearDragState(root) {
  for (const element of root.querySelectorAll(".is-dragging, .is-drop-target")) {
    element.classList.remove("is-dragging", "is-drop-target");
  }
}

function getInsertionIndex(zone, event) {
  const items = [...zone.querySelectorAll(".tier-item:not(.is-dragging)")];

  if (!items.length) {
    return 0;
  }

  let closestIndex = items.length;
  let closestDistance = Number.POSITIVE_INFINITY;

  items.forEach((item, index) => {
    const rect = item.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const isBefore =
      event.clientY < centerY ||
      (event.clientY >= rect.top &&
        event.clientY <= rect.bottom &&
        event.clientX < centerX);

    if (!isBefore) {
      return;
    }

    const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
}

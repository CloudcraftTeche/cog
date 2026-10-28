"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";

// Touch-first drag and drop for games. Works two ways, so small children and
// keyboard/switch users can all play:
// - drag an item with a finger, mouse or pen and let go over a target, or
// - tap an item to pick it up, then tap a target.
// Targets are found with elementFromPoint, so they only need the drop props.

const DRAG_THRESHOLD_PX = 8;

interface Options {
  onDrop: (itemId: string, targetId: string) => void;
  disabled?: boolean;
}

interface DragState {
  itemId: string;
  startX: number;
  startY: number;
  x: number;
  y: number;
  moved: boolean;
}

export function useTapOrDrag({ onDrop, disabled = false }: Options) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const onDropRef = useRef(onDrop);
  onDropRef.current = onDrop;

  useEffect(() => {
    if (disabled) {
      setSelectedId(null);
      setDrag(null);
      dragRef.current = null;
    }
  }, [disabled]);

  const targetAt = (x: number, y: number) =>
    (document.elementFromPoint(x, y)?.closest("[data-drop-id]") as HTMLElement | null)?.dataset.dropId ?? null;

  const getItemProps = useCallback(
    (itemId: string, { locked = false }: { locked?: boolean } = {}) => ({
      "data-drag-id": itemId,
      role: "button",
      tabIndex: locked || disabled ? -1 : 0,
      "aria-pressed": selectedId === itemId,
      "aria-disabled": locked || disabled,
      style: { touchAction: "none" as const },
      onPointerDown: (event: ReactPointerEvent<HTMLElement>) => {
        if (locked || disabled || (event.pointerType === "mouse" && event.button !== 0)) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        const state = { itemId, startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY, moved: false };
        dragRef.current = state;
        setDrag(state);
      },
      onPointerMove: (event: ReactPointerEvent<HTMLElement>) => {
        const current = dragRef.current;
        if (!current || current.itemId !== itemId) return;
        const moved =
          current.moved ||
          Math.hypot(event.clientX - current.startX, event.clientY - current.startY) > DRAG_THRESHOLD_PX;
        const next = { ...current, x: event.clientX, y: event.clientY, moved };
        dragRef.current = next;
        setDrag(next);
        setOverId(moved ? targetAt(event.clientX, event.clientY) : null);
      },
      onPointerUp: (event: ReactPointerEvent<HTMLElement>) => {
        const current = dragRef.current;
        dragRef.current = null;
        setDrag(null);
        setOverId(null);
        if (!current || current.itemId !== itemId) return;
        if (current.moved) {
          const target = targetAt(event.clientX, event.clientY);
          if (target) onDropRef.current(itemId, target);
          setSelectedId(null);
        } else {
          setSelectedId((selected) => (selected === itemId ? null : itemId));
        }
      },
      onPointerCancel: () => {
        dragRef.current = null;
        setDrag(null);
        setOverId(null);
      },
      onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => {
        if (locked || disabled || (event.key !== "Enter" && event.key !== " ")) return;
        event.preventDefault();
        setSelectedId((selected) => (selected === itemId ? null : itemId));
      },
    }),
    [disabled, selectedId]
  );

  const getTargetProps = useCallback(
    (targetId: string, { locked = false }: { locked?: boolean } = {}) => ({
      "data-drop-id": locked ? undefined : targetId,
      role: "button",
      tabIndex: locked || disabled || !selectedId ? -1 : 0,
      "aria-disabled": locked || disabled || !selectedId,
      onClick: () => {
        if (locked || disabled || !selectedId) return;
        onDropRef.current(selectedId, targetId);
        setSelectedId(null);
      },
      onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => {
        if (locked || disabled || !selectedId || (event.key !== "Enter" && event.key !== " ")) return;
        event.preventDefault();
        onDropRef.current(selectedId, targetId);
        setSelectedId(null);
      },
    }),
    [disabled, selectedId]
  );

  return {
    getItemProps,
    getTargetProps,
    selectedId,
    draggingId: drag?.moved ? drag.itemId : null,
    dragPosition: drag?.moved ? { x: drag.x, y: drag.y } : null,
    overId,
    clearSelection: () => setSelectedId(null),
  };
}

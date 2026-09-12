"use client";

import { useState } from "react";
import { CheckCircle2, GripVertical, XCircle } from "lucide-react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import type { ActivityResult, MatchingActivityConfig } from "@/types/student/activity.types";

interface Props {
  config: MatchingActivityConfig;
  onComplete: (result: ActivityResult) => void;
}

export function MatchingGame({ config, onComplete }: Props) {
  const [matched, setMatched] = useState<string[]>([]);
  const [rightOrder] = useState(() => [...config.pairs].sort(() => Math.random() - 0.5));
  const [wrong, setWrong] = useState(false);

  const handleDrop = ({ draggableId, destination }: DropResult) => {
    if (!destination || destination.droppableId === "left" || matched.includes(draggableId)) return;
    if (destination.droppableId === draggableId) {
      const next = [...matched, draggableId];
      setMatched(next);
      setWrong(false);
      if (next.length === config.pairs.length) {
        onComplete({ completed: true, score: next.length, total: next.length, answers: next });
      }
    } else {
      setWrong(true);
      window.setTimeout(() => setWrong(false), 700);
    }
  };

  return (
    <section className="space-y-5" aria-live="polite">
      <p className="text-center text-lg font-bold text-slate-800">Drag each word to its match.</p>
      <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
        <span>{matched.length} of {config.pairs.length} matched</span>
        <span>Use one finger</span>
      </div>
      <DragDropContext onDragEnd={handleDrop}>
        <div className="grid gap-4 md:grid-cols-2">
          <Droppable droppableId="left" isDropDisabled>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                <p className="text-sm font-black uppercase tracking-wide text-sky-700">Words</p>
                {config.pairs.map((pair, index) => (
                  <Draggable key={pair.id} draggableId={pair.id} index={index} isDragDisabled={matched.includes(pair.id)}>
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`flex min-h-20 items-center gap-2 rounded-2xl border-2 p-4 text-base font-bold text-slate-800 transition ${matched.includes(pair.id) ? "border-emerald-300 bg-emerald-50 text-emerald-700" : snapshot.isDragging ? "border-sky-500 bg-sky-100 shadow-lg" : "border-slate-200 bg-white shadow-sm"}`}>
                        <GripVertical className="shrink-0 text-sky-500" aria-hidden="true" />
                        <span>{pair.left}</span>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          <div className="space-y-3">
            <p className="text-sm font-black uppercase tracking-wide text-emerald-700">Answers</p>
            {rightOrder.map((pair) => (
              <Droppable key={pair.id} droppableId={pair.id}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className={`flex min-h-20 items-center rounded-2xl border-2 p-4 text-sm font-bold text-slate-800 transition ${matched.includes(pair.id) ? "border-emerald-300 bg-emerald-50 text-emerald-700" : snapshot.isDraggingOver ? "border-sky-500 bg-sky-50 ring-2 ring-sky-200" : "border-dashed border-slate-300 bg-slate-50"}`}>
                    {matched.includes(pair.id) && <CheckCircle2 className="mr-2 shrink-0 text-emerald-600" aria-hidden="true" />}
                    <span>{pair.right}</span>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </div>
      </DragDropContext>
      {matched.length === config.pairs.length && <p className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-100 p-3 font-bold text-emerald-800"><CheckCircle2 /> All matched!</p>}
      {wrong && <p className="flex items-center justify-center gap-2 rounded-2xl bg-rose-100 p-3 font-bold text-rose-800"><XCircle /> That match is not right. Try again.</p>}
    </section>
  );
}

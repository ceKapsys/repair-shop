"use client";

import { useState, useTransition } from "react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";

type Item = { _id: string };

/** Drag-to-reorder list (mouse, touch and keyboard: Space to lift, arrows to move). */
export function SortableList<T extends Item>({
  items: initial,
  onReorder,
  render,
  empty,
}: {
  items: T[];
  onReorder: (ids: string[]) => Promise<unknown>;
  render: (item: T) => React.ReactNode;
  empty?: React.ReactNode;
}) {
  const [items, setItems] = useState(initial);
  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setItems(initial);
  }
  const [, start] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const next = arrayMove(items, items.findIndex((i) => i._id === active.id), items.findIndex((i) => i._id === over.id));
    setItems(next);
    start(async () => {
      try {
        await onReorder(next.map((i) => i._id));
      } catch {
        toast.error("Couldn’t save the new order");
        setItems(items);
      }
    });
  };
  if (!items.length) return <>{empty}</>;
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i._id)} strategy={verticalListSortingStrategy}>
        <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-bg">
          {items.map((item) => (
            <Row key={item._id} id={item._id}>{render(item)}</Row>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function Row({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 bg-bg pr-3 ${isDragging ? "relative z-10 shadow-card" : ""}`}
    >
      <button type="button" {...attributes} {...listeners} aria-label="Drag to reorder" className="flex h-14 w-10 shrink-0 cursor-grab touch-none items-center justify-center text-ink-soft active:cursor-grabbing">
        <GripVertical size={18} strokeWidth={1.5} />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </li>
  );
}

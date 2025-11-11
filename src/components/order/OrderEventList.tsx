"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import type { OrderEvent, OrderHint } from "@/types/orderGameState";
import { DraggableEventCard } from "@/components/order/DraggableEventCard";

interface OrderEventListProps {
  events: OrderEvent[];
  ordering: string[];
  onOrderingChange: (ordering: string[]) => void;
  lockedEventIds?: string[];
  hintsByEvent?: Record<string, OrderHint[]>;
}

export function OrderEventList({
  events,
  ordering,
  onOrderingChange,
  lockedEventIds = [],
  hintsByEvent = {},
}: OrderEventListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const [announcement, setAnnouncement] = useState<string>("");

  const eventMap = useMemo(() => {
    const map = new Map<string, OrderEvent>();
    for (const event of events) {
      map.set(event.id, event);
    }
    return map;
  }, [events]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = ordering.indexOf(String(active.id));
    const newIndex = ordering.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const next = [...ordering];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);
    onOrderingChange(next);

    const movedEvent = eventMap.get(String(active.id));
    setAnnouncement(
      movedEvent
        ? `${movedEvent.text} moved to position ${newIndex + 1}`
        : `Item moved to position ${newIndex + 1}`,
    );
  };

  return (
    <div>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <SortableContext items={ordering} strategy={verticalListSortingStrategy}>
          <ol className="space-y-3">
            {ordering.map((eventId, index) => {
              const event = eventMap.get(eventId);
              if (!event) return null;
              return (
                <DraggableEventCard
                  key={event.id}
                  event={event}
                  index={index}
                  isLocked={lockedEventIds.includes(event.id)}
                  activeHints={hintsByEvent[event.id] ?? []}
                  allEvents={events}
                />
              );
            })}
          </ol>
        </SortableContext>
      </DndContext>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}

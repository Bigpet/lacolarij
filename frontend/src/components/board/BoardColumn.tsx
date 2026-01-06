import { Droppable, Draggable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import type { Issue } from "@/types";
import { BoardCard } from "./BoardCard";

interface BoardColumnProps {
  id: string;
  title: string;
  issues: Issue[];
  colorClass?: string;
}

export function BoardColumn({
  id,
  title,
  issues,
  colorClass = "bg-muted/50",
}: BoardColumnProps) {
  return (
    <div className="flex flex-col h-full min-w-[280px] max-w-[320px]">
      {/* Column Header */}
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2 rounded-t-lg border-b",
          colorClass
        )}
      >
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">
          {issues.length}
        </span>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 p-2 space-y-2 overflow-y-auto rounded-b-lg border border-t-0 min-h-[200px]",
              snapshot.isDraggingOver && "bg-accent/50"
            )}
          >
            {issues.map((issue, index) => (
              <Draggable key={issue.id} draggableId={issue.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <BoardCard
                      issue={issue}
                      isDragging={snapshot.isDragging}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {issues.length === 0 && !snapshot.isDraggingOver && (
              <p className="text-xs text-muted-foreground text-center py-4 italic">
                No issues
              </p>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}

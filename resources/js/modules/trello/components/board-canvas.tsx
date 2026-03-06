import { useState } from 'react';
import type { ReactNode } from 'react';
import { DndContext, type DragEndEvent, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, horizontalListSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Board, TrelloCard } from '../types';
import { ListColumn } from './list-column';

interface Props {
  board: Board;
  compactMode: boolean;
  onBoardChange: (board: Board) => void;
  onSelectCard: (card: TrelloCard) => void;
  onCreateList: (title: string) => void;
  onDeleteList: (listId: string) => void;
  onCreateCard: (listId: string, title: string) => void;
  onDeleteCard: (cardId: string) => void;
}

function SortableList({ listId, children }: { listId: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: listId });

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export function BoardCanvas({
  board,
  compactMode,
  onBoardChange,
  onSelectCard,
  onCreateList,
  onDeleteList,
  onCreateCard,
  onDeleteCard,
}: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  const moveCard = (activeId: string, overId: string) => {
    const source = board.lists.find((list) => list.cards.some((card) => card.id === activeId));
    const target = board.lists.find((list) => list.id === overId || list.cards.some((card) => card.id === overId));
    if (!source || !target) return;

    const activeCard = source.cards.find((card) => card.id === activeId);
    if (!activeCard) return;

    const nextLists = board.lists.map((list) => ({ ...list, cards: [...list.cards] }));
    const src = nextLists.find((l) => l.id === source.id)!;
    const dst = nextLists.find((l) => l.id === target.id)!;

    src.cards = src.cards.filter((card) => card.id !== activeId);
    const overIndex = dst.cards.findIndex((card) => card.id === overId);
    const insertIndex = overIndex >= 0 ? overIndex : dst.cards.length;
    dst.cards.splice(insertIndex, 0, activeCard);

    onBoardChange({ ...board, lists: nextLists });
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const listIds = board.lists.map((list) => list.id);
    if (listIds.includes(String(active.id)) && listIds.includes(String(over.id))) {
      const oldIndex = listIds.indexOf(String(active.id));
      const newIndex = listIds.indexOf(String(over.id));
      onBoardChange({ ...board, lists: arrayMove(board.lists, oldIndex, newIndex) });
      return;
    }

    moveCard(String(active.id), String(over.id));
  };

  const addList = () => {
    const title = newListTitle.trim();
    if (!title) return;

    onCreateList(title);
    setNewListTitle('');
    setIsAddingList(false);
  };

  return (
    <div className="glass fade-up rounded-[28px] border border-slate-200/80 p-4 shadow-sm dark:border-slate-700/80 md:p-5">
      <div className={`mb-5 flex flex-wrap items-center justify-between gap-3 ${compactMode ? 'mb-4' : ''}`}>
        <div className="space-y-0.5">
          <h2 className="heading-font text-2xl font-bold text-slate-900 dark:text-white md:text-[1.8rem]">{board.name}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{board.description ?? 'Plan, prioritize, and ship.'}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {board.lists.length} list{board.lists.length === 1 ? '' : 's'}
        </div>
        {isAddingList ? (
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <input
              className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
              placeholder="List title"
              value={newListTitle}
              onChange={(event) => setNewListTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') addList();
                if (event.key === 'Escape') {
                  setIsAddingList(false);
                  setNewListTitle('');
                }
              }}
            />
            <Button className="rounded-lg" onClick={addList}>Save</Button>
            <Button variant="ghost" className="rounded-lg" onClick={() => setIsAddingList(false)}>Cancel</Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            onClick={() => setIsAddingList(true)}
          >
            Add List
          </Button>
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <ScrollArea className={`rounded-2xl border border-slate-200/70 bg-slate-100/45 pb-2 dark:border-slate-700/70 dark:bg-slate-900/40 ${compactMode ? 'p-1.5' : 'p-2'}`}>
          <SortableContext items={board.lists.map((list) => list.id)} strategy={horizontalListSortingStrategy}>
            <div className={`flex pb-3 ${compactMode ? 'gap-3' : 'gap-4'}`}>
              {board.lists.map((list, index) => (
                <SortableList key={list.id} listId={list.id}>
                  <ListColumn
                    compactMode={compactMode}
                    className="list-reveal"
                    style={{ animationDelay: `${index * 55}ms` }}
                    list={list}
                    onSelectCard={onSelectCard}
                    onDeleteList={onDeleteList}
                    onDeleteCard={(_listId, cardId) => onDeleteCard(cardId)}
                    onCreateCard={onCreateCard}
                  />
                </SortableList>
              ))}
            </div>
          </SortableContext>
        </ScrollArea>
      </DndContext>
    </div>
  );
}

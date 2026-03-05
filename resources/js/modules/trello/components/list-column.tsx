import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UserAvatar } from '@/components/ui/avatar';
import { checklistStats, normalizeChecklist } from '../utils/checklist';
import type { TrelloCard, TrelloList } from '../types';

interface Props {
  list: TrelloList;
  onSelectCard: (card: TrelloCard) => void;
  onDeleteList: (listId: string) => void;
  onDeleteCard: (listId: string, cardId: string) => void;
  onCreateCard: (listId: string, title: string) => void;
}

function SortableCard({
  listId,
  card,
  onSelectCard,
  onDeleteCard,
}: {
  listId: string;
  card: TrelloCard;
  onSelectCard: (card: TrelloCard) => void;
  onDeleteCard: (listId: string, cardId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });
  const stats = checklistStats(normalizeChecklist(card.checklist));

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? undefined : transition,
      }}
      className={`cursor-grab touch-none select-none will-change-transform active:cursor-grabbing ${
        isDragging ? 'z-10' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <Card
        className={`rounded-2xl border border-slate-200/90 bg-white p-3 transition-shadow hover:shadow-md ${
          isDragging ? 'shadow-lg ring-2 ring-sky-100' : ''
        }`}
        onClick={() => onSelectCard(card)}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-slate-900">{card.title}</p>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 rounded-md p-0 text-slate-400 hover:text-red-600"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onDeleteCard(listId, card.id);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
        {stats.total > 0 ? (
          <div className="mt-2">
            <Badge className="rounded-md bg-green-100 px-1.5 py-0 text-[10px] font-semibold text-green-700">
              {stats.completed}/{stats.total}
            </Badge>
          </div>
        ) : null}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {card.labels.slice(0, 2).map((label) => (
              <Badge key={label.id} className="rounded-md px-1.5 py-0 text-[10px] font-semibold text-white" style={{ backgroundColor: label.color }}>
                {label.name}
              </Badge>
            ))}
          </div>
          <div className="-space-x-1">
            {card.assignees.slice(0, 2).map((member) => (
              <UserAvatar key={member.id} name={member.name} />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

export function ListColumn({ list, onSelectCard, onDeleteList, onDeleteCard, onCreateCard }: Props) {
  const { setNodeRef } = useDroppable({ id: list.id });
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState('');

  return (
    <div className="w-80 shrink-0 rounded-3xl border border-slate-200 bg-white/70 p-3 shadow-sm">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h3 className="heading-font text-sm font-bold tracking-wide text-slate-800">{list.title}</h3>
          <Badge className="rounded-lg bg-slate-900 px-2 text-white">{list.cards.length}</Badge>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 rounded-lg p-0 text-slate-400 hover:text-red-600"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onDeleteList(list.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div ref={setNodeRef} className="space-y-2 rounded-2xl bg-slate-50/70 p-2">
        <SortableContext items={list.cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
          {list.cards.map((card) => (
            <SortableCard
              key={card.id}
              listId={list.id}
              card={card}
              onSelectCard={onSelectCard}
              onDeleteCard={onDeleteCard}
            />
          ))}
        </SortableContext>

        {isAddingCard ? (
          <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-2">
            <input
              className="h-9 w-full rounded-lg border border-slate-300 px-2 text-sm outline-none"
              placeholder="Card title"
              value={cardTitle}
              onChange={(event) => setCardTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && cardTitle.trim()) {
                  onCreateCard(list.id, cardTitle.trim());
                  setCardTitle('');
                  setIsAddingCard(false);
                }
              }}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  if (!cardTitle.trim()) return;
                  onCreateCard(list.id, cardTitle.trim());
                  setCardTitle('');
                  setIsAddingCard(false);
                }}
              >
                Add
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsAddingCard(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="ghost" className="w-full justify-start rounded-xl" onClick={() => setIsAddingCard(true)}>
            + Add a card
          </Button>
        )}
      </div>
    </div>
  );
}

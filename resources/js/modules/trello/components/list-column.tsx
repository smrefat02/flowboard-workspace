import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UserAvatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { checklistStats, normalizeChecklist } from '../utils/checklist';
import type { TrelloCard, TrelloList } from '../types';
import type { CSSProperties } from 'react';

interface Props {
  list: TrelloList;
  compactMode: boolean;
  className?: string;
  style?: CSSProperties;
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
  compactMode,
  revealDelayMs,
}: {
  listId: string;
  card: TrelloCard;
  onSelectCard: (card: TrelloCard) => void;
  onDeleteCard: (listId: string, cardId: string) => void;
  compactMode: boolean;
  revealDelayMs: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });
  const stats = checklistStats(normalizeChecklist(card.checklist));

  return (
    <div
      ref={setNodeRef}
      className={`cursor-grab touch-none select-none will-change-transform active:cursor-grabbing ${
        isDragging ? 'z-10' : ''
      } card-reveal`}
      style={{ animationDelay: `${revealDelayMs}ms`, transform: CSS.Transform.toString(transform), transition: isDragging ? undefined : transition }}
      {...attributes}
      {...listeners}
    >
      <Card
        className={`rounded-2xl border border-slate-200/90 bg-white transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md ${
          compactMode ? 'p-2.5' : 'p-3'
        } ${
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

export function ListColumn({ list, compactMode, className, style, onSelectCard, onDeleteList, onDeleteCard, onCreateCard }: Props) {
  const { setNodeRef } = useDroppable({ id: list.id });
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState('');

  return (
    <div
      className={cn(
        'w-80 shrink-0 rounded-[22px] border border-slate-200/90 bg-white/90 shadow-sm',
        compactMode ? 'w-72 p-2.5' : 'p-3',
        className,
      )}
      style={style}
    >
      <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/70 px-2 py-1.5">
        <div className="flex items-center gap-2">
          <h3 className="heading-font text-sm font-bold tracking-wide text-slate-800">{list.title}</h3>
          <Badge className="rounded-lg bg-slate-900 px-2 text-[11px] text-white">{list.cards.length}</Badge>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 rounded-lg p-0 text-slate-400 hover:bg-red-50 hover:text-red-600"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onDeleteList(list.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div ref={setNodeRef} className={cn('rounded-2xl border border-slate-200/70 bg-slate-50/80', compactMode ? 'space-y-1.5 p-1.5' : 'space-y-2 p-2')}>
        <SortableContext items={list.cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
          {list.cards.map((card, index) => (
            <SortableCard
              key={card.id}
              listId={list.id}
              card={card}
              onSelectCard={onSelectCard}
              onDeleteCard={onDeleteCard}
              compactMode={compactMode}
              revealDelayMs={index * 40}
            />
          ))}
        </SortableContext>

        {isAddingCard ? (
          <div className={cn('space-y-2 rounded-xl border border-slate-200 bg-white', compactMode ? 'p-1.5' : 'p-2')}>
            <input
              className="h-9 w-full rounded-lg border border-slate-300 px-2 text-sm outline-none focus:border-slate-400"
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
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start rounded-xl border border-dashed border-slate-300 bg-white/70 text-slate-600 hover:bg-white',
              compactMode ? 'h-8 text-xs' : '',
            )}
            onClick={() => setIsAddingCard(true)}
          >
            + Add a card
          </Button>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { CheckSquare, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogRoot } from '@/components/ui/dialog';
import { checklistStats, normalizeChecklist } from '../utils/checklist';
import type { ChecklistGroup, TrelloCard } from '../types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: TrelloCard | null;
  onSave: (card: TrelloCard, payload: Partial<Pick<TrelloCard, 'title' | 'description' | 'due_date' | 'checklist'>>) => Promise<void>;
  onAddComment: (card: TrelloCard, body: string) => Promise<void>;
}

export function CardModal({ open, onOpenChange, card, onSave, onAddComment }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [comment, setComment] = useState('');
  const [checklist, setChecklist] = useState<ChecklistGroup[]>([]);
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [newGroupDate, setNewGroupDate] = useState('');
  const [pendingItems, setPendingItems] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!card) return;
    setTitle(card.title ?? '');
    setDescription(card.description ?? '');
    setDueDate(card.due_date ? card.due_date.slice(0, 10) : '');
    setComment('');
    setChecklist(normalizeChecklist(card.checklist));
    setNewGroupTitle('');
    setNewGroupDate('');
    setPendingItems({});
  }, [card]);

  const save = async () => {
    if (!card) return;
    await onSave(card, {
      title,
      description,
      due_date: dueDate || null,
      checklist,
    });
  };

  const submitComment = async () => {
    if (!card || !comment.trim()) return;
    await onAddComment(card, comment.trim());
    setComment('');
  };

  const { completed: checklistCompleted, total: checklistTotal, percent: checklistPercent, isComplete } = checklistStats(checklist);

  const makeId = () => (
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`
  );

  const addGroup = () => {
    const value = newGroupTitle.trim();
    if (!value) return;

    setChecklist((prev) => [
      ...prev,
      {
        id: makeId(),
        title: value,
        date: newGroupDate || undefined,
        items: [],
      },
    ]);
    setNewGroupTitle('');
    setNewGroupDate('');
  };

  const removeGroup = (groupId: string) => {
    setChecklist((prev) => prev.filter((group) => group.id !== groupId));
    setPendingItems((prev) => {
      const next = { ...prev };
      delete next[groupId];
      return next;
    });
  };

  const addChecklistItem = (groupId: string) => {
    const text = (pendingItems[groupId] ?? '').trim();
    if (!text) return;

    setChecklist((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? { ...group, items: [...group.items, { id: makeId(), text, completed: false }] }
          : group,
      ),
    );
    setPendingItems((prev) => ({ ...prev, [groupId]: '' }));
  };

  const toggleChecklistItem = (groupId: string, itemId: string) => {
    setChecklist((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
            ...group,
            items: group.items.map((item) =>
              item.id === itemId ? { ...item, completed: !item.completed } : item,
            ),
          }
          : group,
      ),
    );
  };

  const updateChecklistItem = (groupId: string, itemId: string, text: string) => {
    setChecklist((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
            ...group,
            items: group.items.map((item) =>
              item.id === itemId ? { ...item, text } : item,
            ),
          }
          : group,
      ),
    );
  };

  const removeChecklistItem = (groupId: string, itemId: string) => {
    setChecklist((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? { ...group, items: group.items.filter((item) => item.id !== itemId) }
          : group,
      ),
    );
  };

  const addDayTemplate = () => {
    const nextIndex = checklist.length + 1;
    const now = new Date();
    const isoDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    setChecklist((prev) => [
      ...prev,
      {
        id: makeId(),
        title: `Day ${nextIndex}`,
        date: isoDate,
        items: [],
      },
    ]);
  };

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {card ? (
          <div className="space-y-5">
            <div>
              <input
                className="heading-font w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-2xl font-bold outline-none"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
              <p className="mt-2 text-sm text-slate-500">Card details and activity timeline</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" className="h-8 rounded-md px-3 text-xs">+ Add</Button>
              <Button variant="outline" className="h-8 rounded-md px-3 text-xs" onClick={addDayTemplate}>Checklist</Button>
              <Button variant="outline" className="h-8 rounded-md px-3 text-xs" disabled>Members</Button>
              <Button variant="outline" className="h-8 rounded-md px-3 text-xs" disabled>Attachment</Button>
            </div>

            <textarea
              className="min-h-28 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add markdown description"
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-slate-500">Due date</p>
                <Badge className={isComplete ? 'bg-green-600 text-white' : 'bg-amber-100 text-amber-700'}>
                  {isComplete ? 'Complete' : 'In Progress'}
                </Badge>
              </div>
              <input type="date" className="h-10 rounded-lg border border-slate-300 px-3 text-sm" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-slate-600" />
                  <p className="text-xs uppercase tracking-wide text-slate-500">Checklist</p>
                </div>
                <p className="text-xs font-semibold text-slate-500">{checklistCompleted}/{checklistTotal}</p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-green-600 transition-all" style={{ width: `${checklistPercent}%` }} />
              </div>
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                {checklist.length === 0 ? <p className="text-sm text-slate-500">No checklist groups yet.</p> : null}
                {checklist.map((group, groupIndex) => (
                  <div key={group.id} className="space-y-2 rounded-lg border border-slate-200 bg-white p-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800">
                        {group.title}
                        {group.date ? ` (${group.date})` : ''}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-slate-100 text-slate-700">
                          {group.items.filter((item) => item.completed).length}/{group.items.length}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                          onClick={() => removeGroup(group.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {group.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <input type="checkbox" checked={item.completed} onChange={() => toggleChecklistItem(group.id, item.id)} />
                        <input
                          className={`h-9 flex-1 rounded-lg border border-slate-300 px-3 text-sm ${
                            item.completed ? 'text-slate-400 line-through' : ''
                          }`}
                          value={item.text}
                          onChange={(event) => updateChecklistItem(group.id, item.id, event.target.value)}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                          onClick={() => removeChecklistItem(group.id, item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <div className="flex gap-2">
                      <input
                        className="h-9 flex-1 rounded-lg border border-slate-300 px-3 text-sm"
                        placeholder={`Add item to Day ${groupIndex + 1}`}
                        value={pendingItems[group.id] ?? ''}
                        onChange={(event) => setPendingItems((prev) => ({ ...prev, [group.id]: event.target.value }))}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') addChecklistItem(group.id);
                        }}
                      />
                      <Button variant="outline" onClick={() => addChecklistItem(group.id)}>Add</Button>
                    </div>
                  </div>
                ))}

                <div className="rounded-lg border border-dashed border-slate-300 bg-white p-2">
                  <div className="grid gap-2 md:grid-cols-[1fr_160px_auto]">
                    <input
                      className="h-9 rounded-lg border border-slate-300 px-3 text-sm"
                      placeholder="Group title (e.g. Day 1)"
                      value={newGroupTitle}
                      onChange={(event) => setNewGroupTitle(event.target.value)}
                    />
                    <input
                      type="date"
                      className="h-9 rounded-lg border border-slate-300 px-3 text-sm"
                      value={newGroupDate}
                      onChange={(event) => setNewGroupDate(event.target.value)}
                    />
                    <Button variant="outline" onClick={addGroup}>Add Day</Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">Labels</p>
              <div className="flex flex-wrap gap-2">
                {card.labels.map((label) => (
                  <Badge key={label.id} className="text-white" style={{ backgroundColor: label.color }}>
                    {label.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">Comments</p>
              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                {(card.comments ?? []).length === 0 ? <p className="text-slate-500">No comments yet.</p> : null}
                {(card.comments ?? []).map((item) => (
                  <div key={item.id} className="rounded-lg bg-white p-2">
                    <p className="text-xs text-slate-500">{item.user?.name ?? 'User'}</p>
                    <p>{item.body}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="h-10 flex-1 rounded-lg border border-slate-300 px-3 text-sm"
                  placeholder="Write a comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') submitComment();
                  }}
                />
                <Button variant="outline" onClick={submitComment}>Comment</Button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </DialogRoot>
  );
}

import { useEffect, useState, useRef } from 'react';
import { CheckSquare, Trash2, Calendar as CalendarIcon, X, MoreHorizontal, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogRoot } from '@/components/ui/dialog';
import { checklistStats, normalizeChecklist } from '../utils/checklist';
import type { ChecklistGroup, TrelloCard } from '../types';
import { DatePickerModal } from './date-picker-modal';
import { format, parse } from 'date-fns';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: TrelloCard | null;
  onSave: (card: TrelloCard, payload: Partial<Pick<TrelloCard, 'title' | 'description' | 'start_date' | 'due_date' | 'due_time' | 'recurring' | 'reminder' | 'checklist' | 'status'>>) => Promise<void>;
  onAddComment: (card: TrelloCard, body: string) => Promise<void>;
}

export function CardModal({ open, onOpenChange, card, onSave, onAddComment }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [recurring, setRecurring] = useState<'never' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('never');
  const [reminder, setReminder] = useState('');
  const [status, setStatus] = useState('In Process');
  const [comment, setComment] = useState('');
  const [checklist, setChecklist] = useState<ChecklistGroup[]>([]);
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [newGroupDate, setNewGroupDate] = useState('');
  const [pendingItems, setPendingItems] = useState<Record<string, string>>({});
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [hideCompletedItems, setHideCompletedItems] = useState<Record<string, boolean>>({});
  const [isChecklistSaving, setIsChecklistSaving] = useState(false);
  const checklistInputRef = useRef<HTMLInputElement>(null);
  const checklistSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastChecklistSnapshotRef = useRef<string>('[]');

  const snapshotChecklist = (groups: ChecklistGroup[]) => JSON.stringify(normalizeChecklist(groups));

  useEffect(() => {
    if (!card) return;
    const normalizedChecklist = normalizeChecklist(card.checklist);
    setTitle(card.title ?? '');
    setDescription(card.description ?? '');
    setStartDate(card.start_date ? card.start_date.slice(0, 10) : '');
    setDueDate(card.due_date ? card.due_date.slice(0, 10) : '');
    setDueTime(card.due_time ?? '');
    setRecurring(card.recurring ?? 'never');
    setReminder(card.reminder ?? '');
    setStatus(card.status ?? 'In Process');
    setComment('');
    setChecklist(normalizedChecklist);
    lastChecklistSnapshotRef.current = snapshotChecklist(normalizedChecklist);
    setNewGroupTitle('');
    setNewGroupDate('');
    setPendingItems({});
    setHideCompletedItems({});
    setIsChecklistSaving(false);
  }, [card]);

  useEffect(() => {
    if (!open || !card) return;

    const nextSnapshot = snapshotChecklist(checklist);
    if (nextSnapshot === lastChecklistSnapshotRef.current) return;

    if (checklistSaveTimerRef.current) clearTimeout(checklistSaveTimerRef.current);

    setIsChecklistSaving(true);
    checklistSaveTimerRef.current = setTimeout(() => {
      void (async () => {
        try {
          await onSave(card, { checklist });
          lastChecklistSnapshotRef.current = nextSnapshot;
        } finally {
          setIsChecklistSaving(false);
        }
      })();
    }, 300);

    return () => {
      if (checklistSaveTimerRef.current) {
        clearTimeout(checklistSaveTimerRef.current);
      }
    };
  }, [checklist, card, open, onSave]);

  const save = async () => {
    if (!card) return;
    await onSave(card, {
      title,
      description,
      start_date: startDate || null,
      due_date: dueDate || null,
      due_time: dueTime || null,
      recurring,
      reminder: reminder || null,
      status,
      checklist,
    });
  };

  const submitComment = async () => {
    if (!card || !comment.trim()) return;
    await onAddComment(card, comment.trim());
    setComment('');
  };

  const { completed: checklistCompleted, total: checklistTotal, percent: checklistPercent, isComplete } = checklistStats(checklist);

  const formatDateDisplay = (dateStr: string | null, timeStr?: string | null) => {
    if (!dateStr) return '';
    try {
      const date = parse(dateStr, 'yyyy-MM-dd', new Date());
      const formattedDate = format(date, 'd MMM');
      if (timeStr) {
        return `${formattedDate}, ${timeStr}`;
      }
      return formattedDate;
    } catch {
      return dateStr;
    }
  };

  const getDueDateLabel = () => {
    if (!dueDate) return null;
    const now = new Date();
    const due = parse(dueDate, 'yyyy-MM-dd', new Date());
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return 'Due soon';
  };

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

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        {card ? (
          <div className="flex gap-4">
            {/* Main Content */}
            <div className="flex-1 space-y-5">
              {/* Header with Status */}
              <div className="flex items-start gap-3">
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="h-8 appearance-none rounded-md border border-slate-300 bg-white pl-3 pr-8 text-xs font-medium hover:bg-slate-50"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Process">In Process</option>
                    <option value="Done">Done</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-1 items-center gap-2">
                  <button className="rounded-sm p-1 hover:bg-slate-100">
                    <img src="/placeholder-icon.svg" alt="" className="h-5 w-5" onError={(e) => e.currentTarget.style.display = 'none'} />
                  </button>
                  <button className="rounded-sm p-1 hover:bg-slate-100">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                  <button onClick={() => onOpenChange(false)} className="ml-auto rounded-sm p-1 hover:bg-slate-100">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div>
                <input
                  className="heading-font w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-2xl font-bold outline-none"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" className="h-8 rounded-md px-3 text-xs">+ Add</Button>
                <Button 
                  variant="outline" 
                  className="h-8 rounded-md px-3 text-xs"
                  onClick={() => checklistInputRef.current?.focus()}
                >
                  <CheckSquare className="mr-1 h-3 w-3" />
                  Checklist
                </Button>
                <Button variant="outline" className="h-8 rounded-md px-3 text-xs" disabled>Members</Button>
                <Button variant="outline" className="h-8 rounded-md px-3 text-xs" disabled>Attachment</Button>
              </div>

              {/* Labels */}
              {card.labels && card.labels.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Labels</p>
                  <div className="flex flex-wrap gap-1">
                    {card.labels.map((label) => (
                      <Badge
                        key={label.id}
                        className="rounded px-3 py-1 text-xs font-medium text-white"
                        style={{ backgroundColor: label.color }}
                      >
                        {label.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Dates</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDatePickerOpen(true)}
                    className="flex h-8 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-xs hover:bg-slate-50"
                  >
                    <CalendarIcon className="h-3 w-3" />
                    {dueDate ? (
                      <>
                        {startDate && <span>{formatDateDisplay(startDate)} - </span>}
                        <span>{formatDateDisplay(dueDate, dueTime)}</span>
                        <Badge className={`ml-1 ${getDueDateLabel() === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {getDueDateLabel()}
                        </Badge>
                      </>
                    ) : (
                      'Set dates'
                    )}
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Description</p>
                <textarea
                  className="min-h-20 w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm outline-none focus:bg-white"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Add a more detailed description..."
                />
              </div>

              {/* Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {isChecklistSaving ? 'Saving checklist...' : 'Checklist auto-saves'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {checklistCompleted}/{checklistTotal} complete
                  </span>
                </div>
                {checklist.map((group, groupIndex) => {
                  const groupStats = checklistStats([group]);
                  const visibleItems = hideCompletedItems[group.id]
                    ? group.items.filter(item => !item.completed)
                    : group.items;

                  return (
                    <div key={group.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="h-4 w-4 text-slate-600" />
                          <p className="text-sm font-semibold text-slate-800">
                            {group.title} {group.date ? `(${formatDateDisplay(group.date)})` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-slate-600"
                            onClick={() => setHideCompletedItems(prev => ({ ...prev, [group.id]: !prev[group.id] }))}
                          >
                            {hideCompletedItems[group.id] ? 'Show' : 'Hide'} checked items
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-slate-600"
                            onClick={() => removeGroup(group.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{groupStats.percent}%</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-green-600 transition-all"
                            style={{ width: `${groupStats.percent}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        {visibleItems.map((item) => (
                          <div key={item.id} className="group flex items-center gap-2 rounded p-1 hover:bg-slate-50">
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => toggleChecklistItem(group.id, item.id)}
                              className="h-4 w-4"
                            />
                            <input
                              className={`h-8 flex-1 rounded border-0 bg-transparent px-2 text-sm outline-none hover:bg-white hover:border hover:border-slate-300 ${
                                item.completed ? 'text-slate-400 line-through' : ''
                              }`}
                              value={item.text}
                              onChange={(event) => updateChecklistItem(group.id, item.id, event.target.value)}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                              onClick={() => removeChecklistItem(group.id, item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}

                        <div className="flex gap-2 pt-1">
                          <input
                            className="h-8 flex-1 rounded-md border border-slate-300 px-3 text-sm"
                            placeholder="Add an item"
                            value={pendingItems[group.id] ?? ''}
                            onChange={(event) =>
                              setPendingItems((prev) => ({ ...prev, [group.id]: event.target.value }))
                            }
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') addChecklistItem(group.id);
                            }}
                          />
                          <Button size="sm" variant="outline" onClick={() => addChecklistItem(group.id)}>
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add New Checklist Group Form */}
                <div className="space-y-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-600">Add Checklist Group</p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      ref={checklistInputRef}
                      className="h-9 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm"
                      placeholder="Group title (e.g., Day 1, Week 1)"
                      value={newGroupTitle}
                      onChange={(event) => setNewGroupTitle(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') addGroup();
                      }}
                    />
                    <input
                      type="date"
                      className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm sm:w-40"
                      value={newGroupDate}
                      onChange={(event) => setNewGroupDate(event.target.value)}
                    />
                    <Button variant="outline" onClick={addGroup} className="h-9">
                      Add Group
                    </Button>
                  </div>
                </div>

                {checklist.length === 0 && (
                  <p className="text-sm text-slate-500">No checklists yet. Add a checklist group above to get started.</p>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                <Button onClick={save}>Save</Button>
              </div>
            </div>

            {/* Right Sidebar */}
            {showDetails && (
              <div className="w-80 space-y-4 border-l pl-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <h3 className="text-sm font-semibold">Comments and activity</h3>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs"
                    onClick={() => setShowDetails(false)}
                  >
                    Hide
                  </Button>
                </div>

                <div className="space-y-3">
                  {card.activities && card.activities.length > 0 ? (
                    card.activities.map((activity) => (
                      <div key={activity.id} className="flex gap-2 text-xs">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
                          {activity.user?.name?.charAt(0) ?? 'U'}
                        </div>
                        <div>
                          <p>
                            <span className="font-semibold">{activity.user?.name ?? 'User'}</span>{' '}
                            {activity.action}
                          </p>
                          <p className="text-slate-500">
                            {format(parse(activity.created_at, "yyyy-MM-dd'T'HH:mm:ss", new Date()), 'd MMM yyyy, HH:mm')}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No activity yet</p>
                  )}
                </div>

                <div className="space-y-2 border-t pt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Add Comment</h4>
                  <textarea
                    className="min-h-20 w-full rounded-lg border border-slate-300 p-2 text-sm"
                    placeholder="Write a comment..."
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                  />
                  <Button size="sm" onClick={submitComment} disabled={!comment.trim()}>
                    Save
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : null}

        <DatePickerModal
          open={datePickerOpen}
          onClose={() => setDatePickerOpen(false)}
          startDate={startDate}
          dueDate={dueDate}
          dueTime={dueTime}
          recurring={recurring}
          reminder={reminder}
          onSave={(data) => {
            setStartDate(data.start_date || '');
            setDueDate(data.due_date || '');
            setDueTime(data.due_time || '');
            setRecurring(data.recurring);
            setReminder(data.reminder || '');
          }}
        />
      </DialogContent>
    </DialogRoot>
  );
}

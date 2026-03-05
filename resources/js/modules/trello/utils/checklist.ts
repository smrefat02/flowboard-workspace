import type { ChecklistGroup, ChecklistItem } from '../types';

function sanitizeItems(items: unknown): ChecklistItem[] {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const value = item as Record<string, unknown>;
      if (typeof value.id !== 'string' || typeof value.text !== 'string') return null;

      return {
        id: value.id,
        text: value.text,
        completed: Boolean(value.completed),
      } satisfies ChecklistItem;
    })
    .filter((item): item is ChecklistItem => item !== null);
}

export function normalizeChecklist(checklist: unknown): ChecklistGroup[] {
  if (!Array.isArray(checklist) || checklist.length === 0) return [];

  const first = checklist[0];
  const looksGrouped = Boolean(first && typeof first === 'object' && 'items' in (first as Record<string, unknown>));

  if (!looksGrouped) {
    return [
      {
        id: 'default',
        title: 'Checklist',
        items: sanitizeItems(checklist),
      },
    ];
  }

  const groups: ChecklistGroup[] = [];

  for (const group of checklist) {
    if (!group || typeof group !== 'object') continue;

    const value = group as Record<string, unknown>;
    if (typeof value.id !== 'string' || typeof value.title !== 'string') continue;

    const nextGroup: ChecklistGroup = {
      id: value.id,
      title: value.title,
      items: sanitizeItems(value.items),
    };

    if (typeof value.date === 'string') {
      nextGroup.date = value.date;
    }

    groups.push(nextGroup);
  }

  return groups;
}

export function checklistStats(groups: ChecklistGroup[]) {
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);
  const completed = groups.reduce(
    (sum, group) => sum + group.items.filter((item) => item.completed).length,
    0,
  );
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return { total, completed, percent, isComplete: total > 0 && completed === total };
}

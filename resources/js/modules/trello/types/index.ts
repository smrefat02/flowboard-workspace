export interface Member {
  id: string;
  name: string;
  email: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Comment {
  id: string;
  body: string;
  user?: Member;
  created_at: string;
}

export interface Activity {
  id: string;
  action: string;
  meta?: Record<string, unknown>;
  user?: Member;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ChecklistGroup {
  id: string;
  title: string;
  date?: string;
  items: ChecklistItem[];
}

export interface TrelloCard {
  id: string;
  title: string;
  description?: string | null;
  start_date?: string | null;
  due_date?: string | null;
  due_time?: string | null;
  recurring?: 'never' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  reminder?: string | null;
  checklist?: ChecklistGroup[];
  position: number;
  labels: Label[];
  assignees: Member[];
  comments?: Comment[];
  activities?: Activity[];
  status?: string;
}

export interface TrelloList {
  id: string;
  title: string;
  position: number;
  cards: TrelloCard[];
}

export interface Board {
  id: string;
  name: string;
  description?: string | null;
  visibility: 'private' | 'workspace' | 'public';
  members: Member[];
  lists: TrelloList[];
}

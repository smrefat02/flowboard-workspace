import axios from 'axios';
import type { Board, TrelloCard, TrelloList } from '../types';

const api = axios.create({
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    Accept: 'application/json',
  },
});

export interface WorkspaceSummary {
  id: string;
  name: string;
}

export interface BoardSummary {
  id: string;
  name: string;
}

let token: string | null = null;

function normalizeCard(card: Partial<TrelloCard> & { id: string; title: string; position: number }): TrelloCard {
  return {
    ...card,
    labels: card.labels ?? [],
    assignees: card.assignees ?? [],
    comments: card.comments ?? [],
    activities: card.activities ?? [],
    checklist: card.checklist ?? [],
  };
}

function normalizeList(list: Partial<TrelloList> & { id: string; title: string; position: number }): TrelloList {
  return {
    ...list,
    cards: (list.cards ?? []).map((card) => normalizeCard(card)),
  };
}

function normalizeBoard(board: Partial<Board> & { id: string; name: string; visibility: Board['visibility'] }): Board {
  return {
    ...board,
    members: board.members ?? [],
    lists: (board.lists ?? []).map((list) => normalizeList(list)),
  };
}

function setToken(next: string) {
  token = next;
  api.defaults.headers.common.Authorization = `Bearer ${next}`;
}

export async function loginDemoUser() {
  if (token) return token;

  const { data } = await api.post('/api/auth/login', {
    email: 'owner@example.com',
    password: 'password',
    device_name: 'trello-ui',
  });

  setToken(data.token as string);
  return token;
}

export async function fetchWorkspaces(): Promise<WorkspaceSummary[]> {
  const { data } = await api.get('/api/workspaces');
  return data.data as WorkspaceSummary[];
}

export async function createWorkspace(name: string): Promise<WorkspaceSummary> {
  const { data } = await api.post('/api/workspaces', { name });
  return data.data as WorkspaceSummary;
}

export async function updateWorkspace(workspaceId: string, payload: Partial<Pick<WorkspaceSummary, 'name'>>) {
  const { data } = await api.patch(`/api/workspaces/${workspaceId}`, payload);
  return data.data as WorkspaceSummary;
}

export async function fetchBoards(workspaceId: string): Promise<BoardSummary[]> {
  const { data } = await api.get(`/api/workspaces/${workspaceId}/boards`);
  return data.data as BoardSummary[];
}

export async function fetchBoard(boardId: string): Promise<Board> {
  const { data } = await api.get(`/api/boards/${boardId}`);
  return normalizeBoard(data.data as Board);
}

export async function createBoard(workspaceId: string, name: string): Promise<Board> {
  const { data } = await api.post('/api/boards', {
    workspace_id: workspaceId,
    name,
    visibility: 'workspace',
  });

  return normalizeBoard(data.data as Board);
}

export async function createList(boardId: string, title: string): Promise<TrelloList> {
  const { data } = await api.post(`/api/boards/${boardId}/lists`, { title });
  return data.data as TrelloList;
}

export async function deleteList(listId: string) {
  await api.delete(`/api/lists/${listId}`);
}

export async function createCard(listId: string, title: string): Promise<TrelloCard> {
  const { data } = await api.post(`/api/lists/${listId}/cards`, { title });
  return data.data as TrelloCard;
}

export async function updateCard(
  cardId: string,
  payload: Partial<Pick<TrelloCard, 'title' | 'description' | 'due_date' | 'checklist'>>,
): Promise<TrelloCard> {
  const { data } = await api.patch(`/api/cards/${cardId}`, payload);
  return data.data as TrelloCard;
}

export async function deleteCard(cardId: string) {
  await api.delete(`/api/cards/${cardId}`);
}

export async function addComment(cardId: string, body: string) {
  const { data } = await api.post(`/api/cards/${cardId}/comments`, { body });
  return data.data as { id: string; body: string; created_at: string };
}

export async function reorderCards(cardsByList: Record<string, string[]>) {
  await api.post('/api/cards/reorder', { cards_by_list: cardsByList });
}

export async function reorderLists(boardId: string, orderedIds: string[]) {
  await api.post(`/api/boards/${boardId}/lists/reorder`, { ordered_ids: orderedIds });
}

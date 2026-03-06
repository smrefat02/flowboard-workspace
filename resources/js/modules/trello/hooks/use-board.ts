import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addComment,
  createBoard,
  createWorkspace,
  createCard,
  createList,
  deleteCard,
  deleteList,
  fetchBoard,
  fetchBoards,
  fetchWorkspaces,
  loginDemoUser,
  reorderCards,
  reorderLists,
  updateCard,
  updateWorkspace,
} from '../services/trello-api';
import type { WorkspaceSummary } from '../services/trello-api';
import type { Board, Comment, TrelloCard } from '../types';

const demoBoard: Board = {
  id: 'demo-board',
  name: 'Product Roadmap',
  description: 'Execution board for Q2',
  visibility: 'workspace',
  members: [],
  lists: [
    { id: 'l1', title: 'Backlog', position: 0, cards: [] },
    { id: 'l2', title: 'In Progress', position: 1, cards: [] },
  ],
};

export function useBoard() {
  const [board, setBoard] = useState<Board | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [hiddenWorkspaceIds, setHiddenWorkspaceIds] = useState<string[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadWorkspaceBoard = useCallback(async (workspaceId: string) => {
    const boards = await fetchBoards(workspaceId);
    const boardSummary = boards[0];
    if (!boardSummary) {
      setBoard(null);
      return;
    }

    const fullBoard = await fetchBoard(boardSummary.id);
    setBoard(fullBoard);
  }, []);

  const loadBoard = useCallback(async () => {
    setLoading(true);

    try {
      await loginDemoUser();
      const fetchedWorkspaces = await fetchWorkspaces();
      const visibleWorkspaces = fetchedWorkspaces.filter((workspace) => !hiddenWorkspaceIds.includes(workspace.id));
      setWorkspaces(visibleWorkspaces);

      const workspace = visibleWorkspaces.find((item) => item.id === activeWorkspaceId) ?? visibleWorkspaces[0];
      if (!workspace) {
        setActiveWorkspaceId(null);
        setBoard(demoBoard);
        return;
      }

      setActiveWorkspaceId(workspace.id);
      await loadWorkspaceBoard(workspace.id);
    } catch {
      setBoard(demoBoard);
    } finally {
      setLoading(false);
    }
  }, [activeWorkspaceId, hiddenWorkspaceIds, loadWorkspaceBoard]);

  useEffect(() => {
    void loadBoard();
  }, [loadBoard]);

  const selectWorkspace = useCallback(
    async (workspaceId: string) => {
      if (activeWorkspaceId === workspaceId) return;

      setLoading(true);
      setActiveWorkspaceId(workspaceId);
      try {
        await loadWorkspaceBoard(workspaceId);
      } catch {
        setBoard(demoBoard);
      } finally {
        setLoading(false);
      }
    },
    [activeWorkspaceId, loadWorkspaceBoard],
  );

  const addWorkspace = useCallback(
    async (name: string) => {
      const trimmedName = name.trim();
      if (!trimmedName) return;

      setLoading(true);
      try {
        await loginDemoUser();
        const workspace = await createWorkspace(trimmedName);
        const newBoard = await createBoard(workspace.id, 'Launch Board');
        setHiddenWorkspaceIds((prev) => prev.filter((id) => id !== workspace.id));
        setWorkspaces((prev) => [...prev, workspace]);
        setActiveWorkspaceId(workspace.id);
        setBoard(newBoard);
      } catch {
        // no-op
      } finally {
        setLoading(false);
      }
    },
    [loadWorkspaceBoard],
  );

  const removeWorkspaceOption = useCallback(
    async (workspaceId: string) => {
      setHiddenWorkspaceIds((prev) => (prev.includes(workspaceId) ? prev : [...prev, workspaceId]));
      const remainingWorkspaces = workspaces.filter((workspace) => workspace.id !== workspaceId);
      setWorkspaces(remainingWorkspaces);

      if (workspaceId !== activeWorkspaceId) return;

      const nextWorkspace = remainingWorkspaces[0];
      if (!nextWorkspace) {
        setActiveWorkspaceId(null);
        setBoard(demoBoard);
        return;
      }

      setActiveWorkspaceId(nextWorkspace.id);
      setLoading(true);
      try {
        await loadWorkspaceBoard(nextWorkspace.id);
      } catch {
        setBoard(demoBoard);
      } finally {
        setLoading(false);
      }
    },
    [workspaces, activeWorkspaceId, loadWorkspaceBoard],
  );

  const renameWorkspace = useCallback(async (workspaceId: string, name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    try {
      await loginDemoUser();
      const updatedWorkspace = await updateWorkspace(workspaceId, { name: trimmedName });
      setWorkspaces((prev) =>
        prev.map((workspace) => (workspace.id === workspaceId ? { ...workspace, name: updatedWorkspace.name } : workspace)),
      );
    } catch {
      // no-op
    }
  }, []);

  const createLaunchBoard = useCallback(async () => {
    if (!activeWorkspaceId) return;

    setLoading(true);
    try {
      await loginDemoUser();
      const newBoard = await createBoard(activeWorkspaceId, 'Launch Board');
      setBoard(newBoard);
    } catch {
      // no-op
    } finally {
      setLoading(false);
    }
  }, [activeWorkspaceId]);

  const addList = useCallback(
    async (title: string) => {
      if (!board) return;
      try {
        await createList(board.id, title);
        await loadBoard();
      } catch {
        // no-op; could show toast in next iteration
      }
    },
    [board, loadBoard],
  );

  const removeList = useCallback(
    async (listId: string) => {
      if (!board) return;
      try {
        await deleteList(listId);
        await loadBoard();
      } catch {
        // no-op
      }
    },
    [board, loadBoard],
  );

  const addCard = useCallback(
    async (listId: string, title: string) => {
      if (!board) return;
      try {
        await createCard(listId, title);
        await loadBoard();
      } catch {
        // no-op
      }
    },
    [board, loadBoard],
  );

  const removeCard = useCallback(
    async (cardId: string) => {
      if (!board) return;
      try {
        await deleteCard(cardId);
        await loadBoard();
      } catch {
        // no-op
      }
    },
    [board, loadBoard],
  );

  const saveCard = useCallback(
    async (card: TrelloCard, payload: Partial<Pick<TrelloCard, 'title' | 'description' | 'due_date' | 'checklist'>>) => {
      if (!board) return;
      try {
        await updateCard(card.id, payload);

        await loadBoard();
      } catch {
        // no-op
      }
    },
    [board, loadBoard],
  );

  const commentCard = useCallback(
    async (card: TrelloCard, body: string) => {
      if (!board) return;
      try {
        await addComment(card.id, body);
        await loadBoard();
      } catch {
        // no-op
      }
    },
    [board, loadBoard],
  );

  const persistReorder = useCallback(
    async (nextBoard: Board) => {
      if (!board) return;

      const orderedIds = nextBoard.lists.map((list) => list.id);
      const cardsByList: Record<string, string[]> = {};
      nextBoard.lists.forEach((list) => {
        cardsByList[list.id] = list.cards.map((card) => card.id);
      });

      setBoard(nextBoard);

      try {
        await reorderLists(nextBoard.id, orderedIds);
        await reorderCards(cardsByList);
      } catch {
        setBoard(board);
      }
    },
    [board],
  );

  const upsertLocalCardComment = useCallback((cardId: string, comment: Comment) => {
    setBoard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        lists: prev.lists.map((list) => ({
          ...list,
          cards: list.cards.map((card) =>
            card.id === cardId
              ? { ...card, comments: [...(card.comments ?? []), comment] }
              : card,
          ),
        })),
      };
    });
  }, []);

  return useMemo(
    () => ({
      board,
      setBoard,
      workspaces,
      activeWorkspaceId,
      loading,
      addList,
      removeList,
      addCard,
      removeCard,
      addWorkspace,
      selectWorkspace,
      removeWorkspaceOption,
      renameWorkspace,
      createLaunchBoard,
      saveCard,
      commentCard,
      persistReorder,
      upsertLocalCardComment,
      reload: loadBoard,
    }),
    [
      board,
      workspaces,
      activeWorkspaceId,
      loading,
      addList,
      removeList,
      addCard,
      removeCard,
      addWorkspace,
      selectWorkspace,
      removeWorkspaceOption,
      renameWorkspace,
      createLaunchBoard,
      saveCard,
      commentCard,
      persistReorder,
      upsertLocalCardComment,
      loadBoard,
    ],
  );
}

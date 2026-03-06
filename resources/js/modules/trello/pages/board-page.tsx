import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardModal } from '../components/card-modal';
import { BoardCanvas } from '../components/board-canvas';
import { DashboardLayout } from '../layouts/dashboard-layout';
import { useBoard } from '../hooks/use-board';
import type { TrelloCard } from '../types';

export function BoardPage() {
  const {
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
  } = useBoard();
  const [selectedCard, setSelectedCard] = useState<TrelloCard | null>(null);
  const [compactMode, setCompactMode] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';

    const savedTheme = window.localStorage.getItem('flowboard-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('flowboard-theme', theme);
  }, [theme]);

  const onBoardChange = (nextBoard: NonNullable<typeof board>) => {
    setBoard(nextBoard);
    void persistReorder(nextBoard);
  };

  const selectedCardRefreshed = useMemo(() => {
    if (!board || !selectedCard) return selectedCard;

    for (const list of board.lists) {
      const found = list.cards.find((card) => card.id === selectedCard.id);
      if (found) return found;
    }

    return selectedCard;
  }, [board, selectedCard]);

  return (
    <DashboardLayout
      workspaces={workspaces}
      activeWorkspaceId={activeWorkspaceId}
      theme={theme}
      compactMode={compactMode}
      onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
      onToggleCompactMode={() => setCompactMode((value) => !value)}
      onSwitchWorkspace={(workspaceId) => void selectWorkspace(workspaceId)}
      onCreateWorkspace={(name) => void addWorkspace(name)}
      onDeleteWorkspace={(workspaceId) => void removeWorkspaceOption(workspaceId)}
      onRenameWorkspace={(workspaceId, name) => void renameWorkspace(workspaceId, name)}
    >
      {loading || !board ? (
        <div className="glass rounded-3xl border border-slate-200 bg-white/90 p-8 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/85 dark:text-slate-300">
          {loading ? (
            'Loading board...'
          ) : (
            <div className="flex items-center justify-between gap-3">
              <span>No board found for this workspace.</span>
              <Button size="sm" onClick={() => void createLaunchBoard()}>
                Create Launch Board
              </Button>
            </div>
          )}
        </div>
      ) : (
        <BoardCanvas
          board={board}
          compactMode={compactMode}
          onBoardChange={onBoardChange}
          onSelectCard={setSelectedCard}
          onCreateList={(title) => void addList(title)}
          onDeleteList={(listId) => {
            if (!window.confirm('Delete this list?')) return;
            void removeList(listId);
          }}
          onCreateCard={(listId, title) => void addCard(listId, title)}
          onDeleteCard={(cardId) => {
            if (!window.confirm('Delete this card?')) return;
            void removeCard(cardId);
          }}
        />
      )}

      <CardModal
        open={Boolean(selectedCard)}
        onOpenChange={(open) => !open && setSelectedCard(null)}
        card={selectedCardRefreshed}
        onSave={saveCard}
        onAddComment={commentCard}
      />
    </DashboardLayout>
  );
}

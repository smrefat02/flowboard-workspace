import { useMemo, useState } from 'react';
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
    createLaunchBoard,
    saveCard,
    commentCard,
    persistReorder,
  } = useBoard();
  const [selectedCard, setSelectedCard] = useState<TrelloCard | null>(null);

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
      onSwitchWorkspace={(workspaceId) => void selectWorkspace(workspaceId)}
      onCreateWorkspace={(name) => void addWorkspace(name)}
      onDeleteWorkspace={(workspaceId) => void removeWorkspaceOption(workspaceId)}
    >
      {loading || !board ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
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

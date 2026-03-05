import type { ReactNode } from 'react';
import { Bell, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WorkspaceSummary } from '../services/trello-api';

interface Props {
  children: ReactNode;
  workspaces: WorkspaceSummary[];
  activeWorkspaceId: string | null;
  onSwitchWorkspace: (workspaceId: string) => void;
  onCreateWorkspace: (name: string) => void;
  onDeleteWorkspace: (workspaceId: string) => void;
}

export function DashboardLayout({
  children,
  workspaces,
  activeWorkspaceId,
  onSwitchWorkspace,
  onCreateWorkspace,
  onDeleteWorkspace,
}: Props) {
  const onCreateWorkspacePrompt = () => {
    const name = window.prompt('Workspace name');
    if (!name) return;

    onCreateWorkspace(name);
  };

  return (
    <div className="min-h-screen px-3 py-4 md:px-5">
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="glass fade-up rounded-3xl border border-slate-200/80 p-5">
          <h1 className="heading-font text-3xl font-bold tracking-tight text-slate-900">Flowboard</h1>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Workspace switcher</p>
          <div className="mt-6 space-y-2">
            {workspaces.map((workspace) => (
              <div key={workspace.id} className="group flex items-center gap-1">
                <Button
                  className={`h-10 w-full justify-start rounded-xl ${
                    activeWorkspaceId === workspace.id ? 'bg-slate-900 text-white hover:bg-slate-800' : ''
                  }`}
                  variant={activeWorkspaceId === workspace.id ? 'default' : 'ghost'}
                  onClick={() => onSwitchWorkspace(workspace.id)}
                >
                  {workspace.name}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 shrink-0 rounded-lg p-0 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-600"
                  onClick={() => onDeleteWorkspace(workspace.id)}
                  title="Remove from switcher"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button className="mt-4 h-10 w-full justify-start rounded-xl" variant="outline" onClick={onCreateWorkspacePrompt}>
            <Plus className="mr-2 h-4 w-4" /> New Workspace
          </Button>
          <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900">
            Drag lists and cards to reprioritize instantly.
          </div>
        </aside>

        <main className="space-y-4">
          <header className="glass fade-up flex items-center justify-between rounded-3xl border border-slate-200/80 px-4 py-3 md:px-5">
            <div className="flex w-full max-w-xl items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
              <Search className="h-4 w-4" />
              <input
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="Search boards"
              />
            </div>
            <Button variant="outline" size="sm" className="ml-3 rounded-xl">
              <Bell className="mr-1 h-4 w-4" /> Notifications
            </Button>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}

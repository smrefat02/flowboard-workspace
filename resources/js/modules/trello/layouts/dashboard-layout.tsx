import type { ReactNode } from 'react';
import { Bell, BriefcaseBusiness, Moon, Plus, Search, Sun, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WorkspaceSummary } from '../services/trello-api';

interface Props {
  children: ReactNode;
  workspaces: WorkspaceSummary[];
  activeWorkspaceId: string | null;
  theme: 'light' | 'dark';
  compactMode: boolean;
  onToggleTheme: () => void;
  onToggleCompactMode: () => void;
  onSwitchWorkspace: (workspaceId: string) => void;
  onCreateWorkspace: (name: string) => void;
  onDeleteWorkspace: (workspaceId: string) => void;
  onRenameWorkspace: (workspaceId: string, name: string) => void;
}

export function DashboardLayout({
  children,
  workspaces,
  activeWorkspaceId,
  theme,
  compactMode,
  onToggleTheme,
  onToggleCompactMode,
  onSwitchWorkspace,
  onCreateWorkspace,
  onDeleteWorkspace,
  onRenameWorkspace,
}: Props) {
  const onCreateWorkspacePrompt = () => {
    const name = window.prompt('Workspace name');
    if (!name) return;

    onCreateWorkspace(name);
  };

  const onRenameWorkspacePrompt = (workspaceId: string, currentName: string) => {
    const name = window.prompt('Rename workspace', currentName);
    if (!name || name.trim() === currentName.trim()) return;

    onRenameWorkspace(workspaceId, name);
  };

  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? null;

  return (
    <div className="min-h-screen px-3 py-4 md:px-6 md:py-6">
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
        <aside className="glass fade-up rounded-[28px] border border-slate-200/80 p-5 md:p-6 dark:border-slate-700/80">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <BriefcaseBusiness className="h-5 w-5" />
            </span>
            <div>
              <h1 className="heading-font text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Flowboard</h1>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Workspace switcher</p>
            </div>
          </div>
          <div className="mt-6 space-y-2.5">
            {workspaces.map((workspace) => (
              <div key={workspace.id} className="group flex items-center gap-1.5">
                <Button
                  className={`h-11 w-full justify-start rounded-xl border ${
                    activeWorkspaceId === workspace.id
                      ? 'border-slate-900 bg-slate-900 text-white shadow-[0_10px_18px_-14px_rgba(15,23,42,0.9)] hover:bg-slate-800'
                      : 'border-slate-200/80 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700'
                  }`}
                  variant={activeWorkspaceId === workspace.id ? 'default' : 'ghost'}
                  onClick={() => onSwitchWorkspace(workspace.id)}
                  onDoubleClick={() => onRenameWorkspacePrompt(workspace.id, workspace.name)}
                  title="Double-click to rename"
                >
                  {workspace.name}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 shrink-0 rounded-lg border-slate-200 bg-white px-2 text-xs font-medium text-slate-600 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white"
                  onClick={() => onRenameWorkspacePrompt(workspace.id, workspace.name)}
                  title="Rename workspace"
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 shrink-0 rounded-lg p-0 text-slate-400 opacity-100 hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                  onClick={() => onDeleteWorkspace(workspace.id)}
                  title="Remove from switcher"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          {activeWorkspace ? (
            <Button
              className="mt-4 h-9 w-full justify-start rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              variant="outline"
              onClick={() => onRenameWorkspacePrompt(activeWorkspace.id, activeWorkspace.name)}
            >
              Rename Active Workspace
            </Button>
          ) : null}
          <Button className="mt-3 h-10 w-full justify-start rounded-xl" variant="outline" onClick={onCreateWorkspacePrompt}>
            <Plus className="mr-2 h-4 w-4" /> New Workspace
          </Button>
          <div className="mt-6 rounded-2xl border border-sky-200/80 bg-sky-50/80 p-3 text-xs leading-relaxed text-sky-900 dark:border-sky-800/70 dark:bg-sky-950/40 dark:text-sky-100">
            Drag lists and cards to reprioritize instantly.
          </div>
        </aside>

        <main className="space-y-4">
          <header className="glass fade-up flex flex-wrap items-center justify-between gap-3 rounded-[26px] border border-slate-200/80 px-4 py-3 dark:border-slate-700/80 md:flex-nowrap md:px-5">
            <div className="flex w-full max-w-xl items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-400"
                placeholder="Search boards"
              />
            </div>
            <Button variant="outline" size="sm" className="rounded-xl border-slate-200 bg-white px-3.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              <Bell className="mr-1 h-4 w-4" /> Notifications
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200 bg-white px-3.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              onClick={onToggleTheme}
            >
              {theme === 'dark' ? <Sun className="mr-1 h-4 w-4" /> : <Moon className="mr-1 h-4 w-4" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Button>
            <Button
              variant={compactMode ? 'default' : 'outline'}
              size="sm"
              className={`rounded-xl px-3.5 ${compactMode ? '' : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'}`}
              onClick={onToggleCompactMode}
            >
              {compactMode ? 'Comfort View' : 'Compact View'}
            </Button>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}

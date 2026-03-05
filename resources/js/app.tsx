import React from 'react';
import ReactDOM from 'react-dom/client';
import { BoardPage } from './modules/trello/pages/board-page';
import './bootstrap';

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  override componentDidCatch(error: Error) {
    console.error('App crashed:', error);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="m-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-semibold">Frontend runtime error</p>
          <p>{this.state.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return <BoardPage />;
}

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>,
);

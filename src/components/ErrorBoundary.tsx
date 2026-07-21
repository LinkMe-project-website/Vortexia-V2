import { Component, type ReactNode } from "react";

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-screen flex-col items-center justify-center gap-3 bg-white p-6 text-center">
          <div className="text-3xl">⚠️</div>
          <p className="font-semibold text-gray-700">Something went wrong</p>
          <p className="max-w-xs break-words text-xs text-gray-400">{this.state.error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-navy px-6 py-2.5 font-semibold text-white"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

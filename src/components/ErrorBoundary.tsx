import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-lg">
                !
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Application Error</h2>
                <p className="text-xs text-slate-500">Multimodal Speech Intelligence Lab</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded border border-slate-200 font-mono text-xs overflow-auto max-h-32">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 py-2 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 py-2 px-4 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium transition-colors shadow-sm"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

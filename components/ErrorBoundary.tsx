import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-white text-center px-4">
                    <div className="max-w-md">
                        <h1 className="text-4xl font-serif text-primary mb-4">Something went wrong</h1>
                        <p className="text-gray-600 mb-8">
                            예기치 않은 오류가 발생했습니다. 페이지를 새로고침 해주세요.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-primary text-white px-8 py-3 text-sm font-medium hover:bg-accent transition-colors uppercase tracking-wider"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

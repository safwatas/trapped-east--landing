import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/button';

/**
 * Error Boundary Component
 * Catches JavaScript errors in child components and displays a fallback UI
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('ErrorBoundary caught:', error, errorInfo);
        }
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[color:var(--bg-base)] flex items-center justify-center p-4">
                    <div className="max-w-md w-full text-center space-y-6">
                        {/* Error Icon */}
                        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-10 h-10 text-red-400" />
                        </div>

                        {/* Error Message */}
                        <div>
                            <h1 className="font-display text-2xl font-bold text-white mb-2">
                                {this.props.title || 'Something went wrong'}
                            </h1>
                            <p className="text-[color:var(--text-muted)]">
                                {this.props.message || "We're sorry, but something unexpected happened. Please try again."}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={this.handleRetry}
                                className="bg-[color:var(--brand-accent)] text-black hover:bg-[color:var(--brand-accent-2)] font-semibold h-12 px-6 rounded-xl"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Try Again
                            </Button>
                            <Link to="/">
                                <Button
                                    variant="outline"
                                    className="bg-transparent text-white border-white/20 hover:border-[color:var(--brand-accent)] h-12 px-6 rounded-xl w-full"
                                >
                                    <Home className="w-4 h-4 mr-2" />
                                    Go Home
                                </Button>
                            </Link>
                        </div>

                        {/* Debug info in development */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-8 text-left p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                                <summary className="text-sm text-red-400 cursor-pointer">
                                    Error Details (Development Only)
                                </summary>
                                <pre className="mt-2 text-xs text-red-300 overflow-auto whitespace-pre-wrap">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

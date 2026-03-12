"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error caught by boundary:", error);
      console.error("Error info:", errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
          <div className="max-w-lg w-full text-center space-y-8">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-destructive" />
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-4">
              <h1 className="text-3xl font-light tracking-tight text-foreground">
                Something went wrong
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                We apologize for the inconvenience. An unexpected error has occurred.
                Please try refreshing the page or return to the homepage.
              </p>
            </div>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="text-left bg-muted/20 rounded-lg p-4 border border-border/20">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground mb-2 hover:text-foreground transition-colors">
                  Error Details (Development)
                </summary>
                <div className="text-xs font-mono text-destructive space-y-2">
                  <div>
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  <div>
                    <strong>Stack:</strong>
                    <pre className="mt-1 whitespace-pre-wrap break-all">
                      {this.state.error.stack}
                    </pre>
                  </div>
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={this.handleRetry}
                variant="default"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Button
                onClick={this.handleReload}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Page
              </Button>
              <Button
                onClick={this.handleGoHome}
                variant="ghost"
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </div>

            {/* Support Message */}
            <div className="text-sm text-muted-foreground">
              If this problem persists, please{" "}
              <a
                href="/contact"
                className="text-primary hover:underline transition-colors"
              >
                contact our support team
              </a>
              .
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
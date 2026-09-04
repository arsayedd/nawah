"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="rounded-[16px] border border-coral/30 bg-white p-6">
        <h2 className="text-lg font-semibold">This screen hit an error</h2>
        <p className="mt-2 text-sm text-navy/60">{this.state.error.message}</p>
        <Button className="mt-4" onClick={() => this.setState({ error: null })}>
          Try again
        </Button>
      </div>
    );
  }
}

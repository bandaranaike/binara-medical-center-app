import React from 'react';
import Loader from "@/components/form/Loader";

const TableActionStatus: React.FC<{ closeWindow: () => void, errorMessage?: string }> = ({closeWindow, errorMessage}) => {

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="flex min-w-80 flex-col items-center space-y-4 rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
                <p className="text-sm text-[var(--foreground-muted)]">The action is being called...</p>
                <Loader/>
                {errorMessage && <div className="text-red-500">{errorMessage}</div>}
                <button
                    className="rounded-[0.7rem] border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-strong)]"
                    onClick={closeWindow}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default TableActionStatus;

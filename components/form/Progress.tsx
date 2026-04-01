import React from 'react';

interface ProgressProps {
    progress: number; // A number between 0 and 10
}

const Progress: React.FC<ProgressProps> = ({progress}) => {
    return (
        <div className="flex gap-1.5">
            {Array.from({length: 10}).map((_, index) => (
                <div
                    key={index}
                    className={`h-4 w-2 rounded-[0.35rem] border ${
                        index < progress
                            ? 'border-emerald-500 bg-emerald-500'
                            : 'border-[var(--border-subtle)] bg-[var(--surface-muted)]'
                    }`}
                />
            ))}
        </div>
    );
};

export default Progress;

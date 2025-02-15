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
                    className={`w-2 h-4 border rounded ${
                        index < progress ? 'bg-green-600 border-green-500' : 'border-gray-600'
                    }`}
                />
            ))}
        </div>
    );
};

export default Progress;
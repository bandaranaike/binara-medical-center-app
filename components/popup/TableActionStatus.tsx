import React from 'react';
import Loader from "@/components/form/Loader";

const TableActionStatus: React.FC<{ closeWindow: () => void, errorMessage?: string }> = ({closeWindow, errorMessage}) => {

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center space-y-4 min-w-80">
                <p className="text-gray-400">The action is being called...</p>
                <Loader/>
                {errorMessage && <div className="text-red-500">{errorMessage}</div>}
                <button className="border bg-gray-800 border-gray-700 rounded py-2 px-4" onClick={closeWindow}>Close</button>
            </div>
        </div>
    );
};

export default TableActionStatus;
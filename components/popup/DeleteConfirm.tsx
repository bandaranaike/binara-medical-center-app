import React, {useState} from "react";
import Loader from "@/components/form/Loader";
import axios from "@/lib/axios";

interface DeleteConfirmProps {
    deleteApiUrl: string;
    deleteId: string|number;
    onClose: () => void;
    onDeleteSuccess?: () => void;
    onDeleteError?: (error: any) => void;
    children: React.ReactNode; // For the slot.
}

const DeleteConfirm: React.FC<DeleteConfirmProps> = ({deleteApiUrl, onClose, onDeleteSuccess, onDeleteError, children, deleteId}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await axios.delete(`${deleteApiUrl}/${deleteId}`);
            setIsLoading(false);
            if (onDeleteSuccess) onDeleteSuccess();
            onClose(); // Close the modal after successful deletion.
        } catch (error: any) {
            if (onDeleteError) {
                if (error?.response?.data) {
                    setError(error.response.data)
                    onDeleteError(error.response.data);
                }
                onDeleteError("There was an error")
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="relative w-full max-w-md bg-gray-800 rounded-lg shadow-lg">
                <div className="flex items-center text-lg border-b border-gray-700 font-bold p-4">
                    <svg className="flex-shrink-0 w-5 h-5 mr-2 text-red-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                    </svg>
                    Delete confirmation
                </div>
                <div className="mb-4 text-gray-400 pt-6 px-4 pb-2">{children}</div>
                {error && <div className="px-4 -mt-3 mb-3 text-red-500">{error}</div>}
                <div className="flex justify-end space-x-2 pb-4 px-4">
                    {isLoading && <Loader/>}
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-300 bg-gray-600 rounded hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isLoading}
                        className={`px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700 ${
                            isLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        {isLoading ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirm;
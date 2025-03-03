import React, {useState} from "react";
import Loader from "@/components/form/Loader";
import axios from "@/lib/axios";

interface DeleteConfirmProps {
    deleteApiUrl: string;
    deleteId: string | number | unknown[];
    onClose: () => void;
    onDeleteSuccess?: () => void;
    onDeleteError?: (error: any) => void;
    children: React.ReactNode; // For the slot.
}

const DeleteConfirm: React.FC<DeleteConfirmProps> = ({deleteApiUrl, onClose, onDeleteSuccess, onDeleteError, children, deleteId}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await axios.delete(`${deleteApiUrl}/${deleteId}`);
            setIsLoading(false);
            if (onDeleteSuccess) onDeleteSuccess();
            onClose(); // Close the modal after successful deletion.
        } catch (error: any) {
            console.log(error)
            let errorMessage = error?.response?.data ? error.response.data.message : error.message ? error.message : "There was an error";
            if (onDeleteError)
                onDeleteError(errorMessage)
            setError(errorMessage)
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="relative w-full max-w-md bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center text-gray-300 text-xl font-bold mb-3">
                    <svg className="flex-shrink-0 w-5 h-5 mr-2 text-yellow-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                    </svg>
                    Delete confirmation
                </div>
                <div className="mb-4 text-gray-400 text-sm">{children}</div>
                {error && <div className="pb-4 text-sm text-red-500">{error}</div>}
                <div className="flex justify-end gap-2">
                    {isLoading && <Loader/>}
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-white bg-gray-600 rounded hover:bg-gray-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isLoading}
                        className={`px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 ${
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
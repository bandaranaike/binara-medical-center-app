import { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react';

interface TableComponentProps {
    apiUrl: string;
    fields: string[];
}

interface FormData {
    [key: string]: any;
    id?: number;
}

export default function TableComponent({ apiUrl, fields }: TableComponentProps) {
    const [data, setData] = useState<FormData[]>([]);
    const [formData, setFormData] = useState<FormData>({});
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isCreateOrUpdateDialogOpen, setIsCreateOrUpdateDialogOpen] = useState(false);
    const [currentRecordId, setCurrentRecordId] = useState<number | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get(apiUrl);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    const handleCreateOrUpdate = async () => {
        try {
            if (currentRecordId) {
                await axios.put(`${apiUrl}/${currentRecordId}`, formData);
            } else {
                await axios.post(apiUrl, formData);
            }
            fetchData();
            setIsCreateOrUpdateDialogOpen(false);
        } catch (error) {
            console.error('Error creating/updating record', error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`${apiUrl}/${id}`);
            fetchData();
            setIsDeleteDialogOpen(false);
        } catch (error) {
            console.error('Error deleting record', error);
        }
    };

    const openCreateOrUpdateDialog = (record: FormData = {}) => {
        setFormData(record);
        setCurrentRecordId(record.id || null);
        setIsCreateOrUpdateDialogOpen(true);
    };

    const openDeleteDialog = (id: number) => {
        setCurrentRecordId(id);
        setIsDeleteDialogOpen(true);
    };

    const closeDialogs = () => {
        setIsCreateOrUpdateDialogOpen(false);
        setIsDeleteDialogOpen(false);
        setCurrentRecordId(null);
        setFormData({});
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-end mb-4">
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => openCreateOrUpdateDialog()}
                >
                    Add New Record
                </button>
            </div>
            <table className="min-w-full bg-white dark:bg-gray-800">
                <thead>
                <tr>
                    {fields.map((field) => (
                        <th key={field} className="py-2 px-4 border-b">
                            {field}
                        </th>
                    ))}
                    <th className="py-2 px-4 border-b">Actions</th>
                </tr>
                </thead>
                <tbody>
                {data.map((record) => (
                    <tr key={record.id}>
                        {fields.map((field) => (
                            <td key={field} className="py-2 px-4 border-b">
                                {record[field]}
                            </td>
                        ))}
                        <td className="py-2 px-4 border-b flex space-x-2">
                            <button
                                className="bg-yellow-500 text-white px-2 py-1 rounded"
                                onClick={() => openCreateOrUpdateDialog(record)}
                            >
                                Edit
                            </button>
                            <button
                                className="bg-red-500 text-white px-2 py-1 rounded"
                                onClick={() => openDeleteDialog(record.id as number)}
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* Delete Confirmation Dialog */}
            <Transition appear show={isDeleteDialogOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeDialogs}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-full p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl dark:bg-gray-800 rounded-2xl">
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                                        Confirm Deletion
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Are you sure you want to delete this record? This action cannot be undone.
                                        </p>
                                    </div>

                                    <div className="mt-4 flex justify-end space-x-2">
                                        <button
                                            type="button"
                                            className="bg-gray-500 text-white px-4 py-2 rounded"
                                            onClick={closeDialogs}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="bg-red-500 text-white px-4 py-2 rounded"
                                            onClick={() => handleDelete(currentRecordId as number)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Create/Update Dialog */}
            <Transition appear show={isCreateOrUpdateDialogOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeDialogs}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-full p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl dark:bg-gray-800 rounded-2xl">
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                                        {currentRecordId ? 'Update Record' : 'Create New Record'}
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        {fields.map((field) => (
                                            <div key={field} className="mt-4">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {field}
                                                </label>
                                                <input
                                                    type="text"
                                                    name={field}
                                                    value={formData[field] || ''}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, [field]: e.target.value })
                                                    }
                                                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 flex justify-end space-x-2">
                                        <button
                                            type="button"
                                            className="bg-gray-500 text-white px-4 py-2 rounded"
                                            onClick={closeDialogs}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="bg-blue-500 text-white px-4 py-2 rounded"
                                            onClick={handleCreateOrUpdate}
                                        >
                                            {currentRecordId ? 'Update' : 'Create'}
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}

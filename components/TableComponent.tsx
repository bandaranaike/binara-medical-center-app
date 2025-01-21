import React, {useState, useEffect, Fragment} from 'react';
import {Dialog, Transition, TransitionChild} from '@headlessui/react';
import axios from "@/lib/axios";
import Pagination from "@/components/table/Pagination";
import Loader from "@/components/form/Loader";
import SearchableSelect from "@/components/form/SearchableSelect";

interface TableComponentProps {
    apiUrl: string;
    fields: string[];
    dropdowns?: any;
}

interface FormData {
    [key: string]: any;

    id?: number;
}

export default function TableComponent({apiUrl, fields, dropdowns}: TableComponentProps) {
    const [data, setData] = useState<FormData[]>([]);
    const [formData, setFormData] = useState<FormData>({});
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isCreateOrUpdateDialogOpen, setIsCreateOrUpdateDialogOpen] = useState(false);
    const [currentRecordId, setCurrentRecordId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState<string>("")
    const [updateOrCreateError, setUpdateOrCreateError] = useState<string>("")
    const [deleteError, setDeleteError] = useState<string>("")

    useEffect(() => {
        setData([])
        setTotalPages(0)
        setError('');
        fetchData();
    }, [currentPage, apiUrl]);

    const fetchData = async () => {
        setLoading(true)
        try {
            const response = await axios.get(`${apiUrl}?page=${currentPage}`);
            setData(response.data.data);
            setTotalPages(response.data.last_page);
        } catch (error) {
            setError('Error fetching data. ' + error);
        } finally {
            setLoading(false)
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
            setUpdateOrCreateError('Error saving record. ' + error);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`${apiUrl}/${id}`);
            fetchData();
            setIsDeleteDialogOpen(false);
        } catch (error) {
            setDeleteError('Error deleting record' + error);
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
        <div className="mx-auto mt-4">
            <div className="flex justify-end mb-4">
                <button
                    className="bg-blue-700 text-white px-4 py-2 rounded"
                    onClick={() => openCreateOrUpdateDialog()}
                >
                    Add New Record
                </button>
            </div>

            <div className="relative overflow-x-auto rounded-lg border border-gray-800">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead>
                    <tr className="bg-gray-800">
                        {fields.map((field) => (
                            <th key={field} className="p-4 first-letter:uppercase">
                                {field}
                            </th>
                        ))}
                        <th className="p-4">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.map((record) => (
                        <tr key={record.id}>
                            {fields.map((field) => (
                                <td key={field} className="border-t border-gray-800 border-r py-2 px-4">
                                    {record[field]}
                                </td>
                            ))}
                            <td className="border-t border-gray-800 p-1">
                                <button
                                    className="bg-gray-800 text-yellow-400 px-2 mr-4 py-0.5 rounded"
                                    onClick={() => openCreateOrUpdateDialog(record)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="bg-gray-800 text-red-400 px-2 py-0.5 rounded"
                                    onClick={() => openDeleteDialog(record.id as number)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <div>
                    {loading &&
                        <div className="p-6 border-t border-gray-800"><Loader/></div>
                    }

                    {error &&
                        <div className="p-6 border-t border-gray-800 text-center text-red-500">{error}</div>
                    }

                    {totalPages > 1 &&
                        <div className="p-6 border-t border-gray-800">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    }

                    {!error && !loading && data.length === 0 &&
                        <div className="p-6 border-t border-gray-800 text-center p-1 text-gray-500">There are no records</div>
                    }
                </div>
            </div>
            {/* Delete Confirmation Dialog */}
            <Transition appear show={isDeleteDialogOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeDialogs}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25"/>
                    </TransitionChild>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-full p-4 text-center">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel
                                    className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl dark:bg-gray-800 rounded-2xl">
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                                        Confirm Deletion
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Are you sure you want to delete this record? This action cannot be undone.
                                        </p>
                                    </div>
                                    {deleteError && <div className="mt-4 text-red-500">{deleteError}</div>}
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
                            </TransitionChild>
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
                        <div className="fixed inset-0 bg-black bg-opacity-25"/>
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
                                <Dialog.Panel
                                    className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl dark:bg-gray-800 rounded-2xl">
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                                        {currentRecordId ? 'Update Record' : 'Create New Record'}
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        {fields.map((field) => (
                                            <div key={field} className="mt-4">
                                                {dropdowns && dropdowns[field] &&
                                                    <SearchableSelect
                                                        placeholder={field}
                                                        value={{value: dropdowns[`${field}_id`], label: formData[field]}}
                                                        id={`Select-${field}`}
                                                        onChange={(option) => {
                                                            if (typeof option === 'object')
                                                                setFormData({...formData, [`${field}_id`]: option?.value})
                                                        }}
                                                        apiUri={dropdowns[field]}
                                                    />
                                                    ||
                                                    <>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            {field}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name={field}
                                                            value={formData[field] || ''}
                                                            onChange={(e) =>
                                                                setFormData({...formData, [field]: e.target.value})
                                                            }
                                                            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                                        />
                                                    </>
                                                }
                                            </div>
                                        ))}
                                    </div>
                                    {updateOrCreateError && <div className="mt-4 text-red-500">{updateOrCreateError}</div>}
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

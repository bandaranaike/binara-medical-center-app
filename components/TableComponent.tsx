import React, {useState, useEffect, Fragment} from 'react';
import {Dialog, Transition, TransitionChild} from '@headlessui/react';
import axios from "@/lib/axios";
import Pagination from "@/components/table/Pagination";
import Loader from "@/components/form/Loader";
import SearchableSelect from "@/components/form/SearchableSelect";
import Select, {SingleValue} from "react-select";
import customStyles from "@/lib/custom-styles";
import {AdminTab} from "@/components/admin/AdminTabs";
import TableActionStatus from "@/components/popup/TableActionStatus";
import {Option} from "@/types/interfaces";
import {PlusFilledIcon} from "@nextui-org/shared-icons";

interface TableComponentProps {
    tab: AdminTab;
}

interface FormData {
    [key: string]: any;

    id?: number;
}

export default function TableComponent({tab}: TableComponentProps) {
    const [data, setData] = useState<FormData[]>([]);
    const [formData, setFormData] = useState<FormData>({});
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isActionCalling, setIsActionCalling] = useState<boolean>(false);
    const [isCreateOrUpdateDialogOpen, setIsCreateOrUpdateDialogOpen] = useState(false);
    const [currentRecordId, setCurrentRecordId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState<string>("")
    const [updateOrCreateError, setUpdateOrCreateError] = useState<string>("")
    const [deleteError, setDeleteError] = useState<string>("")
    const [actionError, setActionError] = useState<string>("")

    const {id: apiUrl, fields, dropdowns, select, actions} = tab;

    useEffect(() => {
        setData([])
        setTotalPages(0)
        setError('');
        fetchData();
    }, [currentPage, apiUrl]);

    const fetchData = () => {
        setLoading(true)
        try {
            axios.get(`${apiUrl}?page=${currentPage}`).then(response => {
                setData(response.data.data);
                setTotalPages(response.data.last_page);
            }).catch(error => {
                setError('Error fetching data. ' + (error.response?.data?.message ?? error.message));
            }).finally(() => setLoading(false));
        } catch (error) {
            console.error(error)
        }
    };

    const handleCreateOrUpdate = () => {
        try {
            if (currentRecordId) {
                axios.put(`${apiUrl}/${currentRecordId}`, formData).then(dataSaveSucceed).catch(dataSaveFailed);
            } else {
                axios.post(apiUrl, formData).then(dataSaveSucceed).catch(dataSaveFailed);
            }
        } catch (error) {
            setUpdateOrCreateError('Error saving record. ' + error);
        }
    };

    const dataSaveSucceed = () => {
        fetchData();
        setIsCreateOrUpdateDialogOpen(false);
    }

    const dataSaveFailed = (error: any) => {
        setUpdateOrCreateError('Error saving record. ' + (error.response?.data?.message ?? error.message));
    }

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
        setUpdateOrCreateError("");
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

    const callTheAction = (callBack: (record: any) => Promise<void>, record: any) => {
        setActionError("")
        setIsActionCalling(true)
        callBack(record).then(() => {
            fetchData()
            setIsActionCalling(false)
        }).catch(error => setActionError(error.response.data.message));
    }

    return (
        loading &&
        <div className="p-6 my-24 border-t border-gray-800"><Loader/></div>
        ||
        <div className="mx-auto mt-4">
            <div className="flex justify-end mb-4">
                <button
                    className="bg-green-700 text-white px-3 py-2 rounded text-sm border-green-500 items-center flex gap-1"
                    onClick={() => openCreateOrUpdateDialog()}
                >
                    <PlusFilledIcon/> Add New Record
                </button>
            </div>

            {!loading && fields && <div className="relative overflow-x-auto rounded-lg border border-gray-800">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead>
                    <tr className="bg-gray-800">
                        {fields.map((field) => (
                            (!field.endsWith("_id") && !["password"].includes(field)) && <th key={field} className="p-4 first-letter:uppercase">
                                {field.replace('_', ' ')}
                            </th>
                        ))}

                        <th className="p-4">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.map((record) => (
                        <tr key={record.id}>
                            {fields.map((field) => (
                                (!field.endsWith("_id") && !["password"].includes(field)) && <td key={field} className="border-t border-gray-800 border-r py-2 px-4">
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

                                {actions && actions.map(action => (
                                    <button
                                        key={action.key}
                                        className="bg-gray-800 text-gray-400 px-2 ml-4 py-0.5 rounded"
                                        onClick={() => callTheAction(action.callBack, record)}
                                    >{action.key}</button>
                                ))}

                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <div>
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
                        <div className="border-t border-gray-800 text-center p-1 text-gray-500">There are no records</div>
                    }
                </div>
            </div>
            }

            {/* Action calling dialog */}
            {isActionCalling && <TableActionStatus errorMessage={actionError} closeWindow={() => setIsActionCalling(false)}></TableActionStatus>}
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
                                    className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform shadow-xl bg-gray-800 rounded-2xl">
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 ">
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
                                            className="bg-gray-600 text-white px-4 py-2 rounded"
                                            onClick={closeDialogs}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="bg-red-600 text-white px-4 py-2 rounded"
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
                                        {currentRecordId ? 'Update record ' : 'Create New record '}
                                    </Dialog.Title>
                                    <div className='text-sm text-gray-400 first-letter:uppercase'>This action will update the list of {apiUrl}</div>
                                    <div className="mt-2">
                                        {fields.map((field) => (
                                            !field.endsWith('_id') && <div key={field} className="mt-4">
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
                                                }

                                                {(!dropdowns || !dropdowns[field]) && (select && select[field]) && (
                                                    <div className="mb-4">
                                                        <label className="block first-letter:uppercase mb-2">
                                                            {field}
                                                        </label>
                                                        <Select
                                                            options={select[field].map((item: string) => {
                                                                return {value: item, label: item}
                                                            })}
                                                            styles={customStyles}
                                                            onChange={(option: SingleValue<Option>) => {
                                                                if (typeof option === 'object')
                                                                    setFormData({...formData, [field]: option?.value})
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                {((!dropdowns || (dropdowns && !dropdowns[field])) && (!select || (select && !select[field]))) && (
                                                    <>
                                                        <label className="block first-letter:uppercase">
                                                            {field.replace('_', ' ')}
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
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {updateOrCreateError && <div className="mt-4 text-red-500">{updateOrCreateError}</div>}
                                    <div className="mt-4 flex justify-end space-x-2">
                                        <button
                                            type="button"
                                            className="bg-gray-600 text-white px-4 py-2 rounded"
                                            onClick={closeDialogs}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="bg-blue-700 text-white px-4 py-2 rounded"
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

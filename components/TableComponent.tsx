"use client"
import React, {useState, useEffect, Fragment, useCallback} from 'react';
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
import TextInput from "@/components/form/TextInput";
import CustomSelect from "@/components/form/CustomSelect";
import debounce from "lodash.debounce";
import {Datepicker} from "flowbite-react";
import {PlusCircleIcon, TrashIcon, XCircleIcon} from "@heroicons/react/24/outline";
import StatusLabel from "@/components/form/StatusLabel";
import {dateToYmdFormat} from "@/lib/readbale-date";
import CustomTableBulkCheckbox from "@/components/form/CustomTableBulkCheckbox";
import DeleteConfirm from "@/components/popup/DeleteConfirm";

interface TableComponentProps {
    tab: AdminTab;
    onLoaded?: (status: boolean) => void;
}

interface FormData {
    [key: string]: any;

    id?: number;
}

export default function TableComponent({tab, onLoaded}: TableComponentProps) {
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
    const [searchField, setSearchField] = useState<string>("");
    const [searchType, setSearchType] = useState('');
    const [selectAll, setSelectAll] = useState(false);
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [searchValue, setSearchValue] = useState<string>("")
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState<boolean>(false)

    const {id: apiUrl, fields, dropdowns, select, actions, filters, labels, types, readonly = false} = tab;

    useEffect(() => {
        setData([])
        setTotalPages(0)
        setError('');
        setLoading(true);
        fetchData();
    }, [currentPage, apiUrl]);

    const fetchData = useCallback(
        debounce((search: string = "") => {
            try {
                axios.get(`${apiUrl}?page=${currentPage}&searchField=${searchField}&searchValue=${search}`)
                    .then(response => {
                        setData(response.data.data);
                        setTotalPages(response.data.last_page);
                    })
                    .catch(error => {
                        setError('Error fetching data. ' + (error.response?.data?.message ?? error.message));
                    })
                    .finally(() => setLoading(false));
            } catch (error) {
                console.error(error);
            }
        }, 50),
        [apiUrl, currentPage, searchField, searchValue] // Dependencies
    );

    useEffect(() => {
        setCurrentPage(1)
        setSelectedRows(new Set());
        setSelectAll(false)
    }, [apiUrl]);

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
        setLoading(true);
        fetchData();
        setIsCreateOrUpdateDialogOpen(false);
    }

    const dataSaveFailed = (error: any) => {
        setUpdateOrCreateError('Error saving record. ' + (error.response?.data?.message ?? error.message));
    }

    const handlePageChange = (page: number) => {
        setLoading(true)
        setCurrentPage(page);
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`${apiUrl}/${id}`);
            setLoading(true);
            fetchData(searchValue);
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
            setLoading(true);
            fetchData()
            setIsActionCalling(false)
        }).catch(error => setActionError(error.response.data.message));
    }

    const searchOnTable = (search: string) => {
        if (searchField) {
            setLoading(true)
            fetchData(search)
        }
    };

    const searchFieldSet = (field: string) => {
        setSearchField(field)
        if (filters && filters.types && filters.types[field]) setSearchType(filters.types[field])
        else setSearchType('text')
    }

    useEffect(() => {
        resetSearch()
    }, [filters]);


    useEffect(() => {
        if (onLoaded) onLoaded(loading)
    }, [loading]);

    const toggleSelectRow = (id: number | string | undefined) => {
        const newSelectedRows = new Set(selectedRows);
        if (newSelectedRows.has(id)) {
            newSelectedRows.delete(id);
        } else {
            newSelectedRows.add(id);
        }

        setSelectedRows(newSelectedRows);
        setSelectAll(newSelectedRows.size === data.length);
    };

    const toggleSelectAll = () => {
        if (selectAll) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(data.map(row => row.id)));
        }
        setSelectAll(!selectAll);
    };

    const debounceSearchOnTable = debounce(searchOnTable, 300)

    const resetSearch = () => {
        if (filters?.options) setSearchField(filters?.options[0].value)
        setSearchType("")
        setSearchValue("")
        fetchData("");
    };
    const handleSearchChange = (searchValue: string) => {
        setSearchValue(searchValue)
        debounceSearchOnTable(searchValue)
    };
    return (
        <div className="mx-auto mt-4">
            <div className="flex justify-between mb-4">
                <div className="flex-grow">
                    {filters && <div className="flex gap-2 items-center">
                        Search :
                        <div className="">
                            <CustomSelect
                                options={filters.options}
                                value={searchField}
                                onChange={searchFieldSet}
                                className="min-w-60"
                            />
                        </div>
                        {searchType == "date" && <Datepicker onChange={e => handleSearchChange(dateToYmdFormat(e))}/> ||
                            <div className="">
                                <TextInput value={searchValue} onChange={handleSearchChange}/>
                            </div>
                        }
                        {searchField && <XCircleIcon width={28} className="cursor-pointer hover:text-yellow-500"
                                                     onClick={() => resetSearch()}/>}
                    </div>
                    }
                </div>
                <div className="flex gap-3">
                    {!readonly && <button
                        onClick={() => setShowBulkDeleteConfirm(true)}
                        className={`bg-red-800 text-white px-3 py-2 rounded text-sm flex gap-2 items-center ${selectedRows.size === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={selectedRows.size === 0}
                    >
                        <TrashIcon width={18}/> Bulk Delete
                    </button>}
                    {!readonly && <button
                        className="bg-green-700 text-white px-3 py-2 rounded text-sm border-green-500 items-center flex gap-1"
                        onClick={() => openCreateOrUpdateDialog()}
                    >
                        <PlusCircleIcon width={20}/> Add New Record
                    </button>}
                </div>
            </div>

            <div className="relative overflow-x-auto rounded-lg border border-gray-800">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead>
                    <tr className="bg-gray-800">
                        {!readonly && <th className="p-4 w-12">
                            <CustomTableBulkCheckbox
                                checked={selectAll}
                                setChecked={toggleSelectAll}
                            />
                        </th>}
                        {fields.map((field) => (
                            (!field.endsWith("_id") && !["password"].includes(field)) &&
                            <th key={field} className="p-4 first-letter:uppercase">
                                {field.replace('_', ' ')}
                            </th>
                        ))}

                        {!readonly && <th className="p-4">Actions</th>}
                    </tr>
                    </thead>
                    <tbody>
                    {data.map((record) => (
                        <tr key={record.id}>
                            {!readonly && <td className="p-4">
                                <CustomTableBulkCheckbox
                                    checked={selectedRows.has(record.id)}
                                    setChecked={() => toggleSelectRow(record.id)}
                                />
                            </td>}
                            {fields.map((field: any) => (
                                (!field.endsWith("_id") && !["password"].includes(field)) &&
                                <td key={field} className="border-t border-gray-800 border-r py-2 px-4">
                                    {labels?.includes(field) && record[field] ?
                                        <StatusLabel status={record[field]}/> : record[field]}
                                </td>
                            ))}
                            {!readonly && <td className="border-t border-gray-800 p-1">
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

                            </td>}
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
                        <div className="border-t border-gray-800 text-center p-3 text-gray-500">There are no
                            records</div>
                    }
                </div>
                {loading &&
                    <div className="p-6 my-24 min-w-max absolute left-1/2 top-0 border-gray-800"><Loader/></div>}
            </div>


            {/* Action calling dialog */}
            {isActionCalling && <TableActionStatus errorMessage={actionError}
                                                   closeWindow={() => setIsActionCalling(false)}></TableActionStatus>}
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

            {showBulkDeleteConfirm &&
                <DeleteConfirm
                    onDeleteSuccess={() => fetchData(searchValue)}
                    deleteApiUrl={apiUrl}
                    deleteId={Array.from(selectedRows)}
                    onClose={() => setShowBulkDeleteConfirm(false)}
                >
                    You are about to delete the selected {selectedRows.size} record{selectedRows.size > 1 ? 's' : ''}.
                    Are you sure you want to proceed?
                </DeleteConfirm>
            }

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
                                    <Dialog.Title as="h3"
                                                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                                        {currentRecordId ? 'Update record ' : 'Create New record '}
                                    </Dialog.Title>
                                    <div className='text-sm text-gray-400 first-letter:uppercase'>This action will
                                        update the list of {apiUrl}</div>
                                    <div className="mt-2">
                                        {fields.map((field) => (
                                            !field.endsWith('_id') && <div key={field} className="mt-4">
                                                {dropdowns && dropdowns[field] &&
                                                    <SearchableSelect
                                                        placeholder={field}
                                                        value={{
                                                            value: dropdowns[`${field}_id`],
                                                            label: formData[field]
                                                        }}
                                                        id={`Select-${field}`}
                                                        onChange={(option) => {
                                                            if (typeof option === 'object')
                                                                setFormData({
                                                                    ...formData,
                                                                    [`${field}_id`]: option?.value
                                                                })
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
                                                            type={(types && types[field]) ? types[field] : 'text'}
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
                                    {updateOrCreateError &&
                                        <div className="mt-4 text-red-500">{updateOrCreateError}</div>}
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

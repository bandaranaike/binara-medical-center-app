"use client"
import React, {useState, useEffect, Fragment, useCallback, useMemo} from 'react';
import {Dialog, Transition, TransitionChild} from '@headlessui/react';
import axios from "@/lib/axios";
import Pagination from "@/components/table/Pagination";
import Loader from "@/components/form/Loader";
import SearchableSelect from "@/components/form/SearchableSelect";
import Select, {SingleValue} from "react-select";
import customStyles from "@/lib/customStyles";
import TableActionStatus from "@/components/popup/TableActionStatus";
import {Option} from "@/types/interfaces";
import TextInput from "@/components/form/TextInput";
import CustomSelect from "@/components/form/CustomSelect";
import debounce from "lodash.debounce";
import {Datepicker} from "flowbite-react";
import {PlusCircleIcon, TrashIcon, XCircleIcon} from "@heroicons/react/24/outline";
import StatusLabel from "@/components/form/StatusLabel";
import {dateToYmdFormat} from "@/lib/readableDate";
import CustomTableBulkCheckbox from "@/components/form/CustomTableBulkCheckbox";
import DeleteConfirm from "@/components/popup/DeleteConfirm";
import {AdminTab, SortDirection, SortState} from "@/types/admin";
import {SortIcon} from "./admin/SortIcon";

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
    const [sortState, setSortState] = useState<SortState>({});

    const {id: apiUrl, fields, dropdowns, select, actions, filters, labels, types, readonly, sort} = tab;

    const buildInitialFormData = useCallback((record: FormData = {}) => {
        const nextFormData = {...record};

        Object.entries(types ?? {}).forEach(([field, type]) => {
            if (type === "checkbox" && nextFormData[field] === undefined) {
                nextFormData[field] = false;
            }
        });

        return nextFormData;
    }, [types]);

    const renderFieldValue = (record: FormData, field: string) => {
        const value = record[field];

        if (labels?.includes(field) && value) {
            return <StatusLabel status={String(value)}/>;
        }

        if (typeof value === "boolean") {
            return value ? "Yes" : "No";
        }

        return value ?? "";
    };

    useEffect(() => {
        setData([])
        setTotalPages(0)
        setError('');
        setLoading(true);
        debouncedFetch();
    }, [currentPage, apiUrl]);

    const sortUri = useMemo(() => {
        if (!sortState || Object.keys(sortState).length === 0) return "";
        const parts = Object.entries(sortState).map(
            ([field, direction]) => `sort[]=${encodeURIComponent(field)}:${direction}`
        );
        return parts.join("&");
    }, [sortState]);

    const doFetch = useCallback(
        async (search: string = "") => {
            setLoading(true);
            setError("");
            try {
                const qs = [
                    `page=${currentPage}`,
                    `searchField=${encodeURIComponent(searchField)}`,
                    `searchValue=${encodeURIComponent(search)}`,
                    sortUri,
                ]
                    .filter(Boolean)
                    .join("&");

                const {data: resp} = await axios.get(`${apiUrl}?${qs}`);
                setData(resp.data);
                setTotalPages(resp.last_page);
            } catch (e: any) {
                setError(
                    "Error fetching data. " + (e?.response?.data?.message ?? e?.message ?? "")
                );
            } finally {
                setLoading(false);
            }
        },
        [apiUrl, currentPage, searchField, sortUri]
    );

    const debouncedFetch = useMemo(() => debounce(doFetch, 150), [doFetch]);

    useEffect(() => {
        debouncedFetch(searchValue);
        return () => debouncedFetch.cancel();
    }, [debouncedFetch, searchValue]);

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
        debouncedFetch(searchValue);
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
            await debouncedFetch(searchValue);
            setIsDeleteDialogOpen(false);
        } catch (error) {
            setDeleteError('Error deleting record' + error);
        }
    };

    const openCreateOrUpdateDialog = (record: FormData = {}) => {
        setUpdateOrCreateError("");
        setFormData(buildInitialFormData(record));
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
            debouncedFetch(searchValue)
            setIsActionCalling(false)
        }).catch(error => setActionError(error.response.data.message));
    }

    const searchOnTable = (search: string) => {
        if (searchField) {
            setLoading(true)
            debouncedFetch(search)
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
        debouncedFetch("");
    };

    const handleSearchChange = (searchValue: string) => {
        setSearchValue(searchValue)
        debounceSearchOnTable(searchValue)
    };

    const handleSortBy = (field: string, direction: SortDirection) => {
        setSortState(prev => {
            const copy = {...prev};
            if (direction === null) {
                delete copy[field];
            } else {
                copy[field] = direction;
            }
            return copy;
        });
        setLoading(true);
    };

    return (
        <div className="mx-auto mt-2 w-full">
            <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                    {filters && <div className="app-panel relative z-20 flex flex-col gap-2 px-2 py-2 lg:flex-row lg:items-center">
                        <span className="app-label mb-0 pl-2 min-w-fit">Search</span>
                        <div className="min-w-[220px]">
                            <CustomSelect
                                options={filters.options}
                                value={searchField}
                                onChange={searchFieldSet}
                                className="min-w-60"
                            />
                        </div>
                        <div className="min-w-[220px] flex-1">
                            {searchType == "date" && <Datepicker onChange={e => handleSearchChange(dateToYmdFormat(e))}/> ||
                                <div>
                                    <TextInput value={searchValue} onChange={handleSearchChange}/>
                                </div>
                            }
                        </div>
                        {searchField && <button
                            type="button"
                            className="app-button-secondary h-10 px-2.5 py-2"
                            onClick={() => resetSearch()}
                        >
                            <XCircleIcon width={18}/>
                        </button>}
                    </div>
                    }
                </div>
                <div className="flex flex-wrap gap-3 pt-3">
                    {!readonly && <button
                        onClick={() => setShowBulkDeleteConfirm(true)}
                        className={`inline-flex items-center gap-2 rounded-[var(--radius-sm)] border px-4 py-3 text-sm font-semibold transition ${selectedRows.size === 0 ? 'cursor-not-allowed opacity-50' : ''}`}
                        style={{background: "rgba(220,38,38,0.08)", borderColor: "rgba(220,38,38,0.18)", color: "var(--danger-strong, #c2410c)"}}
                        disabled={selectedRows.size === 0}
                    >
                        <TrashIcon width={18}/> Bulk Delete
                    </button>}
                    {!readonly && <button
                        className="app-button-primary inline-flex items-center gap-2 text-sm"
                        onClick={() => openCreateOrUpdateDialog()}
                    >
                        <PlusCircleIcon width={20}/> Add New Record
                    </button>}
                </div>
            </div>

            <div className="app-panel relative overflow-hidden">
                <div className="relative overflow-x-auto">
                    <table className="min-w-full text-left text-sm" style={{color: "var(--muted-strong)"}}>
                        <thead>
                        <tr style={{background: "var(--surface-soft)"}}>
                            {!readonly && <th className="w-12 p-4">
                                <CustomTableBulkCheckbox
                                    checked={selectAll}
                                    setChecked={toggleSelectAll}
                                />
                            </th>}
                            {fields.map((field) => (
                                (!field.endsWith("_id") && !["password"].includes(field)) &&
                                <th key={field} className="whitespace-nowrap px-4 py-4 text-xs font-semibold uppercase tracking-[0.24em]" style={{color: "var(--muted)"}}>
                                    <div className="flex gap-1 justify-between">
                                        <span className="first-letter:uppercase">{field.replace('_', ' ')}</span>
                                        {sort && sort[field] && <SortIcon
                                            type={sort[field].type}
                                            inactiveHint
                                            field={field}
                                            onToggle={handleSortBy}
                                        />}
                                    </div>
                                </th>
                            ))}

                            {!readonly && <th className="whitespace-nowrap px-4 py-4 text-xs font-semibold uppercase tracking-[0.24em]" style={{color: "var(--muted)"}}>Actions</th>}
                        </tr>
                        </thead>
                        <tbody>
                        {data.map((record) => (
                            <tr key={record.id} className="transition hover:bg-[var(--surface-soft)]">
                                {!readonly && <td className="p-4">
                                    <CustomTableBulkCheckbox
                                        checked={selectedRows.has(record.id)}
                                        setChecked={() => toggleSelectRow(record.id)}
                                    />
                                </td>}
                                {fields.map((field: any) => (
                                    (!field.endsWith("_id") && !["password"].includes(field)) &&
                                    <td key={field} className="whitespace-nowrap border-t px-4 py-3" style={{borderColor: "var(--border-subtle)"}}>
                                        {renderFieldValue(record, field)}
                                    </td>
                                ))}
                                {!readonly && <td className="border-t p-3" style={{borderColor: "var(--border-subtle)"}}>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            className="rounded-[var(--radius-sm)] border px-3 py-1.5 text-xs font-semibold transition"
                                            style={{background: "rgba(217,119,6,0.1)", borderColor: "rgba(217,119,6,0.16)", color: "#b45309"}}
                                            onClick={() => openCreateOrUpdateDialog(record)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="rounded-[var(--radius-sm)] border px-3 py-1.5 text-xs font-semibold transition"
                                            style={{background: "rgba(220,38,38,0.08)", borderColor: "rgba(220,38,38,0.16)", color: "#f87171"}}
                                            onClick={() => openDeleteDialog(record.id as number)}
                                        >
                                            Delete
                                        </button>

                                        {actions && actions.map(action => (
                                            <button
                                                key={action.key}
                                                className="rounded-[var(--radius-sm)] border px-3 py-1.5 text-xs font-semibold transition"
                                                style={{background: "var(--surface-soft)", borderColor: "var(--border-subtle)", color: "var(--foreground)"}}
                                                onClick={() => callTheAction(action.callBack, record)}
                                            >{action.key}</button>
                                        ))}
                                    </div>
                                </td>}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <div>
                    {error &&
                        <div className="border-t p-6 text-center text-red-500" style={{borderColor: "var(--border-subtle)"}}>{error}</div>
                    }

                    {totalPages > 1 &&
                        <div className="border-t p-6" style={{borderColor: "var(--border-subtle)"}}>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    }

                    {!error && !loading && data.length === 0 &&
                        <div className="border-t p-4 text-center text-sm" style={{borderColor: "var(--border-subtle)", color: "var(--muted)"}}>There are no records</div>
                    }
                </div>
                {loading &&
                    <div className="absolute left-1/2 top-0 my-24 min-w-max -translate-x-1/2 rounded-[var(--radius-sm)] border px-5 py-4" style={{background: "var(--surface-elevated)", borderColor: "var(--border-subtle)"}}><Loader/></div>}
            </div>


            {isActionCalling && <TableActionStatus errorMessage={actionError}
                                                   closeWindow={() => setIsActionCalling(false)}></TableActionStatus>}
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
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
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
                                    className="w-full max-w-md overflow-hidden rounded-[var(--radius-lg)] border p-6 text-left align-middle transition-all transform"
                                    style={{background: "var(--surface-elevated)", borderColor: "var(--border-subtle)", boxShadow: "var(--shadow-soft)"}}
                                >
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6">
                                        Confirm Deletion
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm" style={{color: "var(--muted)"}}>
                                            Are you sure you want to delete this record? This action cannot be undone.
                                        </p>
                                    </div>
                                    {deleteError && <div className="mt-4 text-red-500">{deleteError}</div>}
                                    <div className="mt-4 flex justify-end space-x-2">
                                        <button
                                            type="button"
                                            className="app-button-secondary"
                                            onClick={closeDialogs}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="rounded-[var(--radius-sm)] bg-red-600 px-4 py-2 text-white"
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
                    onDeleteSuccess={() => debouncedFetch(searchValue)}
                    deleteApiUrl={apiUrl}
                    deleteId={Array.from(selectedRows)}
                    onClose={() => setShowBulkDeleteConfirm(false)}
                >
                    You are about to delete the selected {selectedRows.size} record{selectedRows.size > 1 ? 's' : ''}.
                    Are you sure you want to proceed?
                </DeleteConfirm>
            }

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
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
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
                                    className="w-full max-w-md overflow-hidden rounded-[var(--radius-lg)] border p-6 text-left align-middle transition-all transform"
                                    style={{background: "var(--surface-elevated)", borderColor: "var(--border-subtle)", boxShadow: "var(--shadow-soft)"}}
                                >
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6">
                                        {currentRecordId ? 'Update record ' : 'Create New record '}
                                    </Dialog.Title>
                                    <div className='text-sm first-letter:uppercase' style={{color: "var(--muted)"}}>This action will
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
                                                        <label className="app-label">
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
                                                        <label className="app-label">
                                                            {field.replace('_', ' ')}
                                                        </label>
                                                        {types?.[field] === "checkbox" ? (
                                                            <label className="mt-2 inline-flex items-center gap-3 text-sm">
                                                                <input
                                                                    type="checkbox"
                                                                    name={field}
                                                                    checked={Boolean(formData[field])}
                                                                    onChange={(e) =>
                                                                        setFormData({...formData, [field]: e.target.checked})
                                                                    }
                                                                    className="h-4 w-4 rounded border-[var(--border-subtle)]"
                                                                />
                                                                <span style={{color: "var(--muted-strong)"}}>Mark this day as closed</span>
                                                            </label>
                                                        ) : (
                                                            <input
                                                                type={(types && types[field]) ? types[field] : 'text'}
                                                                name={field}
                                                                value={formData[field] || ''}
                                                                onChange={(e) =>
                                                                    setFormData({...formData, [field]: e.target.value})
                                                                }
                                                                className="app-input mt-1"
                                                            />
                                                        )}
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
                                            className="app-button-secondary"
                                            onClick={closeDialogs}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="app-button-primary"
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

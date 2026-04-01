import React, {useState, useEffect} from 'react';
import {AxiosError} from 'axios';
import {format, subDays} from 'date-fns';
import axios from "@/lib/axios";
import printService from "@/lib/printService";
import ExportSummaryReport from "@/components/reports/ExportSummaryReport";

interface ServiceCostItem {
    service_id: number;
    service_name: string;
    service_key: string;
    total_bill_amount: number;
    total_system_amount: number;
    item_count: number;
}

interface ReportMeta {
    start_date: string;
    end_date: string;
    total_services: number;
    total_bill_amount: number;
    total_system_amount: number;
}

interface ApiResponse {
    success: boolean;
    data: ServiceCostItem[];
    meta: ReportMeta;
}

const ServiceCostReport = () => {
    const [report, setReport] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState({
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
    });

    const fetchReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<ApiResponse>('/reports/service-costs', {
                params: {
                    start_date: dateRange.startDate,
                    end_date: dateRange.endDate,
                },
            });
            setReport(response.data);
        } catch (err) {
            const error = err as AxiosError;
            setError(
                // @ts-ignore
                error.response?.data?.message ||
                error.message ||
                'Failed to fetch report'
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchReport();
    }, [dateRange]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setDateRange((prev) => ({...prev, [name]: value}));
    };

    const setQuickRange = (days: number) => {
        const end = new Date();
        const start = subDays(end, days - 1);
        setDateRange({
            startDate: format(start, 'yyyy-MM-dd'),
            endDate: format(end, 'yyyy-MM-dd'),
        });
    };

    if (loading && !report) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="my-6">


            <div className="flex">
                <div className="flex-grow">
                    <h1 className="mb-6 text-2xl font-bold text-[var(--foreground)]">Service Cost Report</h1>
                </div>
                <div className="">
                    <ExportSummaryReport/>
                </div>
            </div>

            {/* Date Range Selector */}
            <div className="app-panel mb-6 p-4">
                <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex-1 min-w-[200px]">
                        <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                            Start Date
                        </label>
                        <input
                            type="date"
                            name="startDate"
                            value={dateRange.startDate}
                            onChange={handleDateChange}
                            className="app-input h-11 px-3"
                        />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                            End Date
                        </label>
                        <input
                            type="date"
                            name="endDate"
                            value={dateRange.endDate}
                            onChange={handleDateChange}
                            className="app-input h-11 px-3"
                        />
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setQuickRange(1)}
                        className={`rounded-[var(--radius-sm)] px-3 py-1 text-sm transition ${
                            dateRange.startDate === format(new Date(), 'yyyy-MM-dd')
                                ? 'bg-[var(--accent-strong)] text-white'
                                : 'border border-[var(--border-subtle)] bg-[var(--surface-soft)] text-[var(--foreground)] hover:bg-[var(--surface-elevated)]'
                        }`}
                    >
                        Today
                    </button>
                    <button
                        onClick={() => setQuickRange(7)}
                        className={`rounded-[var(--radius-sm)] px-3 py-1 text-sm transition ${
                            dateRange.startDate === format(subDays(new Date(), 6), 'yyyy-MM-dd')
                                ? 'bg-[var(--accent-strong)] text-white'
                                : 'border border-[var(--border-subtle)] bg-[var(--surface-soft)] text-[var(--foreground)] hover:bg-[var(--surface-elevated)]'
                        }`}
                    >
                        Last 7 Days
                    </button>
                    <button
                        onClick={() => setQuickRange(30)}
                        className={`rounded-[var(--radius-sm)] px-3 py-1 text-sm transition ${
                            dateRange.startDate === format(subDays(new Date(), 29), 'yyyy-MM-dd')
                                ? 'bg-[var(--accent-strong)] text-white'
                                : 'border border-[var(--border-subtle)] bg-[var(--surface-soft)] text-[var(--foreground)] hover:bg-[var(--surface-elevated)]'
                        }`}
                    >
                        Last 30 Days
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div
                    className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md border border-red-200 dark:border-red-800">
                    {error}
                </div>
            )}

            {/* Report Summary */}
            {report && (
                <>
                    <div className="mb-6 rounded-[var(--radius-md)] border p-4" style={{background: "var(--surface-soft)", borderColor: "var(--border-subtle)"}}>
                        <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">Summary</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="rounded-[var(--radius-sm)] border bg-[var(--surface-elevated)] p-3 shadow-sm" style={{borderColor: "var(--border-subtle)"}}>
                                <p className="text-sm" style={{color: "var(--muted)"}}>Date Range</p>
                                <p className="font-medium text-[var(--foreground)]">
                                    {new Date(report.meta.start_date).toLocaleDateString()} -{' '}
                                    {new Date(report.meta.end_date).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="rounded-[var(--radius-sm)] border bg-[var(--surface-elevated)] p-3 shadow-sm" style={{borderColor: "var(--border-subtle)"}}>
                                <p className="text-sm" style={{color: "var(--muted)"}}>Services</p>
                                <p className="font-medium text-[var(--foreground)]">{report.meta.total_services}</p>
                            </div>
                            <div className="rounded-[var(--radius-sm)] border bg-[var(--surface-elevated)] p-3 shadow-sm" style={{borderColor: "var(--border-subtle)"}}>
                                <p className="text-sm" style={{color: "var(--muted)"}}>Total Bill Amount</p>
                                <p className="font-medium text-green-600 dark:text-green-400">
                                    {report.meta.total_bill_amount.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </p>
                            </div>
                            <div className="rounded-[var(--radius-sm)] border bg-[var(--surface-elevated)] p-3 shadow-sm" style={{borderColor: "var(--border-subtle)"}}>
                                <p className="text-sm" style={{color: "var(--muted)"}}>Total System Amount</p>
                                <p className="font-medium text-blue-600 dark:text-blue-400">
                                    {report.meta.total_system_amount.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Report Table */}
                    <div className="overflow-hidden rounded-[var(--radius-md)] border bg-[var(--surface-elevated)] shadow" style={{borderColor: "var(--border-subtle)"}}>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead style={{background: "var(--surface-soft)"}}>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: "var(--muted)"}}>
                                        Service
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: "var(--muted)"}}>
                                        Key
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{color: "var(--muted)"}}>
                                        Items
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{color: "var(--muted)"}}>
                                        Bill Amount
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{color: "var(--muted)"}}>
                                        System Amount
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {report.data.map((item) => (
                                    <tr key={item.service_id} className="transition hover:bg-[var(--surface-soft)]">
                                        <td className="whitespace-nowrap border-t px-6 py-4 text-sm font-medium text-[var(--foreground)]" style={{borderColor: "var(--border-subtle)"}}>
                                            {item.service_name}
                                        </td>
                                        <td className="whitespace-nowrap border-t px-6 py-4 text-sm" style={{borderColor: "var(--border-subtle)", color: "var(--muted)"}}>
                                            {item.service_key}
                                        </td>
                                        <td className="whitespace-nowrap border-t px-6 py-4 text-right text-sm" style={{borderColor: "var(--border-subtle)", color: "var(--muted)"}}>
                                            {item.item_count}
                                        </td>
                                        <td className="whitespace-nowrap border-t px-6 py-4 text-right text-sm font-medium text-green-600 dark:text-green-400" style={{borderColor: "var(--border-subtle)"}}>
                                            {item.total_bill_amount.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </td>
                                        <td className="whitespace-nowrap border-t px-6 py-4 text-right text-sm font-medium text-blue-600 dark:text-blue-400" style={{borderColor: "var(--border-subtle)"}}>
                                            {item.total_system_amount.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ServiceCostReport;

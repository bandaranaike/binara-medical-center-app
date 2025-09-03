"use client";

import React, {useEffect, useState} from "react";
import CustomCheckbox from "@/components/form/CustomCheckbox";
import axios from "@/lib/axios";
import Loader from "@/components/form/Loader";

type Availability = {
    doctor_id: number | string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM:SS or HH:MM
    seats: number;
    available_seats: number;
    status: string;
};

type GenerateResponse = {
    ok: boolean;
    message: string;
    inserted?: number;
    updated?: number;
    skipped?: number;
};

interface DoctorAvailabilityPanelProps {
    doctorId: number | string;
}

export default function DoctorAvailabilityPanel({doctorId}: DoctorAvailabilityPanelProps) {
    const [override, setOverride] = useState(false);

    const [rows, setRows] = useState<Availability[] | null>(null);
    const [isLoading, setIsLoading] = useState(false); // loading records
    const [isGenerating, setIsGenerating] = useState(false);
    const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(
        null
    );

    const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? '';

    const availabilityUrl = `${apiBaseUrl}doctors/${doctorId}/availabilities`;
    const generateUrl = `${apiBaseUrl}doctor-availabilities/generate-for-doctor`;

    async function loadAvailability() {
        setIsLoading(true);
        setMsg(null);
        try {
            const res = await axios.get<Availability[]>(availabilityUrl);

            setRows(res.data);
        } catch (err: any) {
            setRows([]);
            setMsg({
                type: "error",
                text: err?.message ?? "Failed to load records.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void loadAvailability();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [availabilityUrl]);

    async function onGenerate() {
        setIsGenerating(true);
        setMsg(null);
        try {
            const res = await axios.post<GenerateResponse>(
                generateUrl,
                {override, doctor_id: doctorId.toString()}
            );

            const json = res.data;
            if (res.status !== 200) {
                throw new Error(json?.message || `Failed to generate (${res.status})`);
            }

            const details = [
                json.inserted != null ? `inserted: ${json.inserted}` : null,
                json.updated != null ? `updated: ${json.updated}` : null,
                json.skipped != null ? `skipped: ${json.skipped}` : null,
            ]
                .filter(Boolean)
                .join(" · ");

            setMsg({
                type: "success",
                text: details ? `${json.message} (${details})` : json.message,
            });

            // refresh records for the month
            await loadAvailability();
        } catch (err: any) {
            setMsg({
                type: "error",
                text: err?.response?.data?.message || err?.message || "Generation failed."
            });
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <div className="w-full max-w-5xl mx-auto p-4">
            <div className="flex flex-wrap gap-3 mb-4 items-center">

                <label className="inline-flex items-center gap-2 select-none">
                    <CustomCheckbox setChecked={setOverride} checked={override} label={"Override existing"}/>
                </label>

                <button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2 shadow-sm"
                >
                    {isGenerating && (
                        <svg
                            className="animate-spin h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            />
                        </svg>
                    )}
                    <span>Generate</span>
                </button>
            </div>

            {msg && (
                <div
                    className={
                        "mb-4 rounded-lg px-4 py-3 text-sm " +
                        (msg.type === "success"
                            ? "text-green-700 border border-green-900"
                            : "text-rose-700 border border-rose-900")
                    }
                >
                    {msg.text}
                </div>
            )}

            <div className="rounded-lg shadow border border-gray-700 overflow-hidden">
                <div className="justify-center flex items-center">
                    {isLoading && (<Loader/>)}
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-xs text-gray-500">
                        <thead className="text-gray-400">
                        <tr className="border-b border-gray-700">
                            <th className="text-left px-3 py-2 border-r border-gray-700">Date</th>
                            <th className="text-left px-3 py-2 border-r border-gray-700">Time</th>
                            <th className="text-left px-3 py-2 border-r border-gray-700">Seats</th>
                            <th className="text-left px-3 py-2 border-r border-gray-700">Available</th>
                            <th className="text-left px-3 py-2">Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {!rows?.length && !isLoading && (
                            <tr>
                                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                                    No records found
                                </td>
                            </tr>
                        )}

                        {rows?.map((r, idx) => (
                            <tr key={`${r.date}-${r.time}-${idx}`} className="odd:bg-gray-900 even:bg-gray-800">
                                <td className="px-4 py-1 font-medium ">{r.date}</td>
                                <td className="px-4 py-1 tabular-nums">{r.time.slice(0, 5)}</td>
                                <td className="px-4 py-1">{r.seats}</td>
                                <td className="px-4 py-1">{r.available_seats}</td>
                                <td className="px-4 py-1">
                                    <span
                                        className={
                                            "inline-flex items-center text-xs " +
                                            (r.status?.toLowerCase() === "active"
                                                ? "text-emerald-700"
                                                : "text-gray-600")
                                        }
                                    >
                                        {r.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
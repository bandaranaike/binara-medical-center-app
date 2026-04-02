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
    id: number | string;
}

export default function DoctorAvailabilityPanel({doctorId, id}: DoctorAvailabilityPanelProps) {
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
                {override, doctor_id: doctorId.toString(), id}
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
        <div className="mx-auto w-full max-w-5xl space-y-4 pb-1">
            <div
                className="flex flex-col gap-4 rounded-[var(--radius-md)] border p-4 sm:flex-row sm:items-center sm:justify-between"
                style={{borderColor: "var(--border-subtle)", background: "color-mix(in srgb, var(--surface-soft) 72%, transparent)"}}
            >
                <div>
                    <p className="text-sm font-semibold">Monthly availability generation</p>
                    <p className="mt-1 text-sm" style={{color: "var(--muted)"}}>
                        Generate slots for the selected doctor schedule and optionally replace existing records.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <label
                        className="inline-flex items-center rounded-full border px-3 py-2 select-none"
                        style={{borderColor: "var(--border-subtle)", background: "var(--surface-elevated)"}}
                    >
                        <CustomCheckbox setChecked={setOverride} checked={override} label={"Override"}/>
                    </label>

                    <button
                        onClick={onGenerate}
                        disabled={isGenerating}
                        className="app-button-primary inline-flex items-center gap-2 px-4 py-2.5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isGenerating && (
                            <svg
                                className="h-4 w-4 animate-spin"
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
                        <span>{isGenerating ? "Generating..." : "Generate"}</span>
                    </button>
                </div>
            </div>

            {msg && (
                <div
                    className="rounded-[var(--radius-md)] border px-4 py-3 text-sm"
                    style={{
                        borderColor: msg.type === "success" ? "rgba(34, 197, 94, 0.32)" : "rgba(244, 63, 94, 0.28)",
                        background: msg.type === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(244, 63, 94, 0.08)",
                        color: msg.type === "success" ? "rgb(22, 163, 74)" : "rgb(225, 29, 72)",
                    }}
                >
                    {msg.text}
                </div>
            )}

            <div
                className="overflow-hidden rounded-[var(--radius-md)] border"
                style={{borderColor: "var(--border-subtle)", background: "var(--surface-elevated)"}}
            >
                <div
                    className="flex items-center justify-between border-b px-4 py-3"
                    style={{borderColor: "var(--border-subtle)", background: "color-mix(in srgb, var(--surface-soft) 72%, transparent)"}}
                >
                    <div>
                        <p className="text-sm font-semibold">Current records</p>
                        <p className="mt-1 text-xs" style={{color: "var(--muted)"}}>
                            {rows?.length ? `${rows.length} availability entries loaded` : "Availability list for the selected doctor"}
                        </p>
                    </div>
                    <div className="flex items-center justify-center">
                        {isLoading && (<Loader/>)}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm" style={{color: "var(--muted-strong)"}}>
                        <thead style={{color: "var(--muted)"}}>
                        <tr style={{borderBottom: "1px solid var(--border-subtle)"}}>
                            <th className="px-4 py-3 font-semibold" style={{borderRight: "1px solid var(--border-subtle)"}}>Date</th>
                            <th className="px-4 py-3 font-semibold" style={{borderRight: "1px solid var(--border-subtle)"}}>Time</th>
                            <th className="px-4 py-3 font-semibold" style={{borderRight: "1px solid var(--border-subtle)"}}>Seats</th>
                            <th className="px-4 py-3 font-semibold" style={{borderRight: "1px solid var(--border-subtle)"}}>Available</th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {!rows?.length && !isLoading && (
                            <tr>
                                <td colSpan={5} className="px-4 py-10 text-center text-sm" style={{color: "var(--muted)"}}>
                                    No records found
                                </td>
                            </tr>
                        )}

                        {rows?.map((r, idx) => (
                            <tr
                                key={`${r.date}-${r.time}-${idx}`}
                                style={{
                                    background: idx % 2 === 0 ? "transparent" : "color-mix(in srgb, var(--surface-soft) 52%, transparent)",
                                    borderTop: "1px solid var(--border-subtle)",
                                }}
                            >
                                <td className="px-4 py-3 font-medium" style={{borderRight: "1px solid var(--border-subtle)"}}>{r.date}</td>
                                <td className="px-4 py-3 tabular-nums" style={{borderRight: "1px solid var(--border-subtle)"}}>{r.time.slice(0, 5)}</td>
                                <td className="px-4 py-3" style={{borderRight: "1px solid var(--border-subtle)"}}>{r.seats}</td>
                                <td className="px-4 py-3" style={{borderRight: "1px solid var(--border-subtle)"}}>{r.available_seats}</td>
                                <td className="px-4 py-3">
                                    <span
                                        className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
                                        style={{
                                            background: r.status?.toLowerCase() === "active"
                                                ? "rgba(34, 197, 94, 0.12)"
                                                : "var(--surface-soft)",
                                            color: r.status?.toLowerCase() === "active"
                                                ? "rgb(22, 163, 74)"
                                                : "var(--muted)",
                                        }}
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

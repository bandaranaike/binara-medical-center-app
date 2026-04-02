"use client";

import {CircleX} from "lucide-react";
import {useModalStore} from "@/lib/modalStore";

export default function ModalRoot() {
    const {node, close} = useModalStore();
    if (!node) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={close}/>
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="app-panel-elevated max-h-[90vh] w-full max-w-5xl overflow-hidden">
                    <div
                        className="flex items-center justify-between border-b px-5 py-4 sm:px-6"
                        style={{borderColor: "var(--border-subtle)", background: "color-mix(in srgb, var(--surface-soft) 68%, transparent)"}}
                    >
                        <div>
                            <h3 className="text-lg font-semibold">Doctor Availability</h3>
                            <p className="mt-1 text-sm" style={{color: "var(--muted)"}}>
                                Review generated slots and refresh monthly availability from one place.
                            </p>
                        </div>
                        <button onClick={close} className="rounded-full p-2 transition hover:bg-[var(--surface-soft)]" style={{color: "var(--muted)"}}>
                            <CircleX className="h-5 w-5"/>
                        </button>
                    </div>
                    <div className="max-h-[calc(90vh-96px)] overflow-auto p-4 sm:p-5">{node}</div>
                </div>
            </div>
        </div>
    );
}

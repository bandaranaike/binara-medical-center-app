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
                <div className="app-panel-elevated max-h-[90vh] w-full max-w-5xl overflow-auto">
                    <div className="flex items-center justify-between border-b px-5 py-4" style={{borderColor: "var(--border-subtle)"}}>
                        <h3 className="text-lg font-semibold">Doctor Availability</h3>
                        <button onClick={close} className="rounded-full p-2 transition hover:bg-[var(--surface-soft)]" style={{color: "var(--muted)"}}>
                            <CircleX className="h-5 w-5"/>
                        </button>
                    </div>
                    <div className="p-4">{node}</div>
                </div>
            </div>
        </div>
    );
}

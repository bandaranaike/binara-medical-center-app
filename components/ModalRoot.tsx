"use client";
import { useModalStore } from "@/lib/modalStore";
import {CircleX} from "lucide-react";

export default function ModalRoot() {
    const { node, close } = useModalStore();
    if (!node) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/60" onClick={close} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="bg-gray-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-auto">
                    <div className="flex items-center justify-between p-4 border-b border-gray-700">
                        <h3 className="font-semibold text-lg">Doctor Availability</h3>
                        <button onClick={close} className="px-2 py-1 text-sm text-gray-500 hover:text-gray-400"><CircleX/></button>
                    </div>
                    <div className="p-4">{node}</div>
                </div>
            </div>
        </div>
    );
}
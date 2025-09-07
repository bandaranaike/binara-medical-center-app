import {ArrowDownAZ, ArrowDownZA, ArrowDown01, ArrowDown10} from 'lucide-react';
import {SortDirection, SortType} from "@/types/admin";
import React from "react";

export function SortIcon(
    {
        type,
        inactiveHint = false,
        onToggle,
        field
    }: {
        type: SortType,
        inactiveHint?: boolean,
        onToggle: (field: string, direction: SortDirection) => void,
        field: string
    }) {

    const [direction, setDirection] = React.useState<SortDirection>(null);

    const toggleField = () => {
        const next: SortDirection = direction === null ? "asc" : direction === "asc" ? "desc" : direction === "desc" ? null : "asc";
        onToggle(field, next)
        setDirection(next);
    }

    function selectCorrectIcon() {

        if (direction === null) {
            if (!inactiveHint) return null;
            return type == "string" ? (
                <ArrowDownAZ className="w-4 h-4 opacity-60"/>
            ) : (
                <ArrowDown01 className="w-4 h-4 opacity-60"/>
            );
        }

        if (type === "string") {
            return direction == "asc" ? (
                <ArrowDownAZ className="w-4 h-4"/>
            ) : (
                <ArrowDownZA className="w-4 h-4"/>
            );
        }
        // number
        return direction == "asc" ? (
            <ArrowDown01 className="w-4 h-4"/>
        ) : (
            <ArrowDown10 className="w-4 h-4"/>
        );
    }

    const icon = selectCorrectIcon();

    return <button
        type="button"
        className="cursor-pointer"
        onClick={() => toggleField()}
        title={
            direction === null
                ? "Sort ascending"
                : direction === "asc"
                    ? "Sort descending"
                    : "Clear sort"
        }
    >{icon}</button>
}
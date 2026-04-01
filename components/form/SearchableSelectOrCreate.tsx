import React, {useState, useEffect, useRef, KeyboardEvent} from 'react';
import Loader from './Loader';
import axios from "@/lib/axios";
import {Option} from "@/types/interfaces";
import {XCircleIcon} from "@heroicons/react/24/outline"; // Assuming you have a Loader component

interface SearchableSelectOrCreateProps {
    apiUri: string;
    apiUriType?: string;
    placeholder?: string;
    onSelect: (selectedItem: Option) => void;
    onNotSelect?: (typedText: string) => void;
    resetTrigger?: any;
    extraParams?: any;
    creatable?: boolean;
}

const SearchableSelectOrCreate: React.FC<SearchableSelectOrCreateProps> = ({apiUri, apiUriType, onSelect, onNotSelect, placeholder, resetTrigger, extraParams, creatable}) => {
    const [query, setQuery] = useState<string>('');
    const [selectedValue, setSelectedValue] = useState<Option>();
    const [results, setResults] = useState<Option[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [searchRequired, setSearchRequired] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [initialSearch, setInitialSearch] = useState<boolean>(false)


    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if ((query.length > 0 && searchRequired) || (initialSearch && !selectedValue)) {
                setLoading(true);
                const typeUri = apiUriType ? `&type=${apiUriType}` : "";
                axios
                    .get(`/dropdown/${apiUri}?search=${query}${typeUri}`, {
                        params: extraParams
                    })
                    .then((response) => {
                        setResults(response.data);
                        setLoading(false);
                    })
                    .catch(() => {

                        setResults([]);
                        setLoading(false);
                    });
            } else {
                if (!initialSearch) {
                    setResults([]);
                }
            }
        }, 200);

        return () => clearTimeout(delayDebounceFn);
    }, [query, apiUri, initialSearch, extraParams]);

    useEffect(() => {
        setQuery('');
        setSelectedValue(undefined);
    }, [resetTrigger]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchRequired(true)
        setInitialSearch(false);
        setQuery(e.target.value);
        setSelectedIndex(-1);
        getTheItemForQuery(e.target.value);
        if (selectedValue) {
            setSelectedValue(undefined);
        }
    };
    const getTheItemForQuery = (query: string) => {
        const delayDebounceFn = setTimeout(() => {
            const suspectedItem = results.find(item => item.label == query);
            if (results.length > 0 && suspectedItem) setSelectedValue(suspectedItem);
        }, 200);
        return () => clearTimeout(delayDebounceFn);
    }

    const handleSelect = (item: Option) => {
        setSearchRequired(false)
        setInitialSearch(false);
        setQuery(item.label);
        setSelectedValue(item);
        onSelect(item);
        setResults([]);
        setIsFocused(false);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') {
            setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            setSelectedIndex((prev) => Math.max(prev - 1, -1));
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            handleSelect(results[selectedIndex]);
        } else if (e.key === 'Enter' && selectedIndex === -1 && onNotSelect) {
            onNotSelect(query);
            setQuery('');
            setIsFocused(false);
        }
    };

    const handleBlur = () => {
        setTimeout(() => setIsFocused(false), 100); // Delay to allow click events on dropdown
    };

    const borderColor = () => {
        if (!isFocused) return 'border-[var(--border-subtle)]';
        if (results.length === 0 && query.length > 0) {
            return onNotSelect ? 'border-emerald-500' : 'border-rose-500';
        }
        return 'border-[var(--accent-strong)]';
    };

    const handleFocus = () => {
        setInitialSearch(true);
        setIsFocused(true)
    };
    const resetSelection = () => {
        setQuery("")
        setInitialSearch(true)
        setSelectedValue(undefined);
        onSelect({label: "", value: ""})
    };

    return (
        <div className="relative">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    ref={inputRef}
                    className={`w-full rounded-[0.7rem] border bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--foreground)] shadow-none transition placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-color)] ${borderColor()}`}
                    placeholder={placeholder ? placeholder : 'Search'}
                />

                {loading && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 top-0">
                        <Loader size={`w-6 h-6`}/>
                    </div>
                )}
                {query && (
                    <div
                        className="absolute right-3 top-3 cursor-pointer text-[var(--foreground-muted)] transition hover:text-[var(--foreground)]"
                        onClick={() => resetSelection()}
                    >
                        <XCircleIcon width={20}/>
                    </div>
                )}
            </div>
            {(!onNotSelect && query && !selectedValue) && <div className="text-red-500 text-sm my-1">This value is invalid</div>}

            {isFocused && (results.length > 0 || creatable && onNotSelect && query) && (
                <ul className="absolute top-10 z-10 mt-1 w-full overflow-hidden rounded-[0.9rem] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
                    {results.map((item: Option, index) => (
                        <li
                            key={index}
                            className={`cursor-pointer border-b border-[var(--border-subtle)] px-3 py-2 text-sm text-[var(--foreground)] transition last:border-b-0 hover:bg-[var(--surface-muted)] ${
                                selectedIndex === index ? 'bg-[var(--surface-muted)]' : ''
                            }`}
                            onMouseDown={() => handleSelect(item)}
                        >
                            {item.label}
                            {item.extra && <span className="mt-1 block text-xs text-[var(--foreground-muted)]">{item.extra}</span>}
                        </li>
                    ))}

                    {(creatable && onNotSelect && query && !selectedValue) && <li
                        key={0}
                        className="cursor-pointer border-b border-[var(--border-subtle)] px-3 py-2 text-sm text-[var(--foreground)] transition last:border-b-0 hover:bg-[var(--surface-muted)]"
                        onPointerDown={() => onNotSelect(query)}
                    >
                        Create <span className="italic">{query}</span>
                    </li>}
                </ul>
            )}
        </div>
    );
};

export default SearchableSelectOrCreate;

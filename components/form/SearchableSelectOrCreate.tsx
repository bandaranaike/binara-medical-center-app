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
        if (!isFocused) return 'border-gray-600';
        if (results.length === 0 && query.length > 0) {
            return onNotSelect ? 'border-green-700' : 'border-red-700';
        }
        return 'border-gray-300';
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
                    className={`w-full p-2 border rounded bg-gray-800 ${borderColor()} focus:outline-none text-gray-300 border-gray-700`}
                    placeholder={placeholder ? placeholder : 'Search'}
                />

                {loading && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 top-0">
                        <Loader size={`w-6 h-6`}/>
                    </div>
                )}
                {query && <div className="absolute top-3 right-3 cursor-pointer" onClick={() => resetSelection()}><XCircleIcon width={20}/></div>}
            </div>
            {(!onNotSelect && query && !selectedValue) && <div className="text-red-500 text-sm my-1">This value is invalid</div>}

            {isFocused && (results.length > 0 || creatable && onNotSelect && query) && (
                <ul className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg top-10">
                    {results.map((item: Option, index) => (
                        <li
                            key={index}
                            className={`p-2 hover:bg-gray-700 cursor-pointer text-gray-400 border-b border-gray-700 last:border-b-0 ${
                                selectedIndex === index ? 'bg-gray-600' : ''
                            }`}
                            onMouseDown={() => handleSelect(item)}
                        >
                            {item.label}
                            {item.extra && <span className="text-xs block text-gray-500">{item.extra}</span>}
                        </li>
                    ))}

                    {(creatable && onNotSelect && query && !selectedValue) && <li
                        key={0}
                        className={`p-2 hover:bg-gray-700 cursor-pointer text-gray-400 border-b border-gray-700 last:border-b-0`}
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
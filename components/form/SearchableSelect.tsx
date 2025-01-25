import React, {useCallback, useEffect, useState} from 'react';
import AsyncCreatableSelect from 'react-select/async-creatable';
import {SingleValue} from 'react-select';
import axios from "@/lib/axios";
import {Option} from "@/types/interfaces";
import customStyles from "@/lib/custom-styles";
import debounce from 'lodash.debounce';


export interface SearchableSelectProps {
    placeholder?: string;
    apiUri?: string;
    type?: string;
    onChange?: (selectedOption: SingleValue<Option> | string | undefined) => void;
    onOptionChange?: (selectedOption: Option | null) => void;
    onCreateOption?: (newValue: string) => void;
    onExtraDataHas?: (item: string) => void;
    value: Option | undefined;
    id: string;
    options?: Option[];
    resetValue?: boolean
}

const SearchableSelect: React.FC<SearchableSelectProps> = (
    {
        placeholder,
        onCreateOption,
        apiUri,
        type,
        id,
        onChange,
        value,
        resetValue,
        onExtraDataHas
    }) => {
    const [selectedValue, setSelectedValue] = useState<Option | undefined>(value);
    const [extraData, setExtraData] = useState<any>();
    const [error, setError] = useState<string>("");

    useEffect(() => {
        if (onExtraDataHas && selectedValue && extraData && extraData[selectedValue.value]) {
            onExtraDataHas(extraData[selectedValue.value])
        }
    }, [selectedValue]);

    useEffect(() => {
        if (resetValue === true) {
            setSelectedValue({value: "0", label: ""})
        }
    }, [resetValue]);

    const fetchOptions = async (inputValue: string) => {
        try {
            const typeUri = type ? `&type=${type}` : "";
            const response = await axios.get(`/dropdown/${apiUri}?search=${inputValue}${typeUri}`);
            return response.data?.map((item: any) => {
                if (item.extra) setExtraData({...extraData, [item.value]: item.extra})
                return ({
                    value: item.value,
                    label: item.label,
                })
            });
        } catch (error: any) {
            if (error?.response?.data?.message) {
                setError(error.response.data.message)
            } else {
                console.error("Error fetching options:", error);
            }
            return [];
        }
    };

    // Debounce fetchOptions to avoid frequent calls
    const debouncedFetchOptions = useCallback(
        debounce((inputValue: string, callback: (options: Option[]) => void) => {
            fetchOptions(inputValue).then(callback);
        }, 300),
        [apiUri]
    );

    const handleOnChange = (selectedOption: SingleValue<Option>) => {
        setSelectedValue(selectedOption as Option);
        if (onChange) onChange(selectedOption);
    };

    const handleOnCreateOption = (inputValue: string) => {
        const newOption = {value: inputValue, label: inputValue};
        setSelectedValue(newOption);
        if (onCreateOption) onCreateOption(inputValue);
    };

    return (
        <div className="mb-4">
            <label className="flex-grow-1">
                <span className="block mb-2 first-letter:uppercase">{placeholder}</span>
                <AsyncCreatableSelect
                    defaultOptions
                    onChange={handleOnChange}
                    styles={customStyles}
                    onCreateOption={handleOnCreateOption}
                    loadOptions={debouncedFetchOptions}
                    instanceId={id}
                    value={selectedValue}
                    isClearable
                    backspaceRemovesValue
                    escapeClearsValue
                />
            </label>
            {error && <div className="text-sm text-red-500 my-2">{error}</div>}
        </div>
    );
};

export default SearchableSelect;

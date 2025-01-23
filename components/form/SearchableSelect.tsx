import React, {useState, useCallback, useEffect} from 'react';
import AsyncCreatableSelect from 'react-select/async-creatable';
import {SingleValue} from 'react-select';
import axios from "@/lib/axios";
import {Option, SearchableSelectProps} from "@/types/interfaces";
import customStyles from "@/lib/custom-styles";
import debounce from 'lodash.debounce';

const SearchableSelect: React.FC<SearchableSelectProps> = (
    {
        placeholder,
        onCreateOption,
        apiUri,
        type,
        id,
        onChange,
        value,
        resetValue
    }) => {
    const [selectedValue, setSelectedValue] = useState<Option | undefined>(value);

    useEffect(() => {
        if (resetValue === true) {
            setSelectedValue({value: "0", label: ""})
        }
    }, [resetValue]);

    const fetchOptions = async (inputValue: string) => {
        try {
            const typeUri = type ? `&type=${type}` : "";
            const response = await axios.get(`/dropdown/${apiUri}?search=${inputValue}${typeUri}`);
            return response.data?.map((item: any) => ({
                value: item.value,
                label: item.label,
            }));
        } catch (error) {
            console.error("Error fetching options:", error);
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
                />
            </label>
        </div>
    );
};

export default SearchableSelect;

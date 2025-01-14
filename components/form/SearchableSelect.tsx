import React, {useState, useCallback} from 'react';
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
        id,
        onChange,
        value,
    }) => {
    const [selectedValue, setSelectedValue] = useState<Option | undefined>(value);

    // Function to fetch options from the API
    const fetchOptions = async (inputValue: string) => {
        // if (!inputValue.trim()) return []; // Avoid API call for empty input
        try {
            const response = await axios.get(`/dropdown/${apiUri}?search=${inputValue}`);
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
                <span className="block mb-2">{placeholder} :</span>
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

import React, {useEffect, useCallback} from 'react';
import AsyncCreatableSelect from 'react-select/async-creatable';
import Select from 'react-select';
import axios from "@/lib/axios";
import {SingleValue} from "react-select";
import debounce from 'lodash/debounce';

interface Option {
    value: string;
    label: string;
}

interface SearchableSelectProps {
    placeholder?: string;
    apiUri?: string;
    onChange?: (selectedOption: SingleValue<string> | null) => void;
    onOptionChange?: (selectedOption: { value: string, label: string } | null) => void;
    onCreateOption?: (newValue: string | null) => void;
    value: string;
    id: string;
    options?: { value: string, label: string }[];
}

const customStyles = {
    control: (provided: object) => ({
        ...provided,
        backgroundColor: 'rgb(31, 41, 55)',
        color: '#a6a6a6',
        borderColor: 'rgb(55, 65, 81)',
    }),
    singleValue: (provided: object) => ({
        ...provided,
        color: '#a6a6a6',
    }),
    menu: (provided: object) => ({
        ...provided,
        backgroundColor: 'rgb(31, 41, 55)',
    }),
    option: (provided: object, state: { isSelected: boolean }) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#202439' : '#212b4a',
        color: '#a6a6a6',
        '&:hover': {
            backgroundColor: '#1c2235',
        },
    }),
    placeholder: (provided: object) => ({
        ...provided,
        color: '#aaa',
    }),
    input: (provided: object) => ({
        ...provided,
        color: '#a6a6a6',
    }),
};

const SearchableSelect: React.FC<SearchableSelectProps> = (
    {
        placeholder,
        onCreateOption,
        apiUri,
        id,
        onChange,
        value,
        options = [],
        onOptionChange
    }
) => {

    const [selectedValue, setSelectedValue] = React.useState('');

    const apiUrl = process.env.BACKEND_API_URL || 'http://localhost/api/dropdown/';

    const fetchOptions = async (inputValue: string) => {
        try {
            const response = await axios.get(apiUrl + apiUri + "?search=" + inputValue);
            return response.data?.map((item: any) => ({
                value: item.value,
                label: item.label
            }));
        } catch (error) {
            console.error("Error fetching options:", error);
            return [];
        }
    };

    // const debouncedFetchOptions = useCallback(debounce(fetchOptions, 300), [1]);

    const promiseOptions = (inputValue: string) => {
        // return debouncedFetchOptions(inputValue);
        return fetchOptions(inputValue);
    };

    useEffect(() => {
        setSelectedValue(value)
    }, [value]);

    return (
        <div className="mb-4">
            <label className="flex-grow-1">
                <span className="block mb-2">{placeholder} :</span>
                {options.length === 0 ?
                    <AsyncCreatableSelect
                        onChange={onChange}
                        styles={customStyles}
                        onCreateOption={onCreateOption}
                        loadOptions={promiseOptions}
                        instanceId={id}
                        value={selectedValue}
                    />
                    :
                    <Select
                        instanceId={id}
                        onChange={onOptionChange}
                        styles={customStyles}
                        options={options}
                    ></Select>}
            </label>
        </div>
    );
};

export default SearchableSelect;

import React, {useEffect} from 'react';
import AsyncCreatableSelect from 'react-select/async-creatable';
import {SingleValue} from 'react-select';
import axios from "@/lib/axios";
import {Option, SearchableSelectProps} from "@/types/interfaces";
import customStyles from "@/lib/custom-styles";

const SearchableSelect: React.FC<SearchableSelectProps> = (
    {
        placeholder,
        onCreateOption,
        apiUri,
        id,
        onChange,
        value,
    }
) => {

    const [selectedValue, setSelectedValue] = React.useState<Option | undefined>(value);

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

    useEffect(() => {
        setSelectedValue(value);
    }, [value]);

    const handleOnChange = (selectedOption: SingleValue<Option>) => {
        setSelectedValue(selectedOption as Option);
        if (onChange) {
            onChange(selectedOption);
        }
    };

    function handleOnCreateOption(inputValue: string) {
        const newOption = {value: inputValue, label: inputValue};
        setSelectedValue(newOption);

        if (onCreateOption) {
            onCreateOption(inputValue);
        }
    }

    return (
        <div className="mb-4">
            <label className="flex-grow-1">
                <span className="block mb-2">{placeholder} :</span>

                <AsyncCreatableSelect
                    onChange={handleOnChange}
                    styles={customStyles}
                    onCreateOption={handleOnCreateOption}
                    loadOptions={fetchOptions}
                    instanceId={id}
                    value={selectedValue}
                />
            </label>
        </div>
    );
};

export default SearchableSelect;

import React, {useEffect} from 'react';
import AsyncCreatableSelect from 'react-select/async-creatable';
import axios from "@/lib/axios";
import {SingleValue} from "react-select";

interface Option {
    value: string;
    label: string;
}


interface SearchableSelectProps {
    options: Option[];
    placeholder?: string;
    apiUri?: string;
    onChange: (selectedOption: SingleValue<string> | null) => void;
    onCreateOption: (newValue: string | null) => void;
    value: string;
    id: string;
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

const SearchableSelect: React.FC<SearchableSelectProps> = ({
                                                               options,
                                                               placeholder,
                                                               onCreateOption,
                                                               apiUri,
                                                               id,
                                                               onChange,
                                                               value
                                                           }) => {

    const [selectedValue, setSelectedValue] = React.useState('');

    const apiUrl = process.env.BACKEND_API_URL || 'http://localhost/api/';
    const promiseOptions = async (inputValue: string) => {
        try {
            const response = await axios.get(apiUrl + apiUri + "?search=" + inputValue);
            return response.data?.data.map((item: any) => ({
                value: item.value,
                label: item.label
            }));
        } catch (error) {
            console.error("Error fetching options:", error);
            return [];
        }
    };

    useEffect(() => {
        console.log("Came ", value)
        setSelectedValue(value)
    }, [value]);


    return (

        <div className="mb-4">
            <label className="flex-grow-1">
                <span className="block mb-2">{placeholder} :</span>
                <AsyncCreatableSelect
                    onChange={onChange}
                    styles={customStyles}
                    onCreateOption={onCreateOption}
                    loadOptions={promiseOptions}
                    instanceId={id}
                    value={selectedValue}
                />
            </label>
        </div>
    );
};

export default SearchableSelect;

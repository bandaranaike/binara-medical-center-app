import {SingleValue} from "react-select";

export interface Option {
    value: string;
    label: string;
}

export interface SearchableSelectProps {
    placeholder?: string;
    apiUri?: string;
    onChange?: (selectedOption: SingleValue<Option> | string | undefined) => void;
    onOptionChange?: (selectedOption: Option | null) => void;
    onCreateOption?: (newValue: string) => void;
    value: Option | string | null;
    id: string;
    options?: Option[];
}

export interface Patient {
    address: string
    age: number
    email: string
    id: number
    name: string
    telephone: string
}

export interface PatientDetailsProps {
    patientPhone: string;
    isNew: boolean;
    onPatientCreated: (patientData: PatientData) => void;
}

export interface PatientData {
    data: Patient;
}
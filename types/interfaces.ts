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
    value: Option | undefined;
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
    allergies: Allergy[]
    diseases: Disease[]
}

export interface PatientDetailsProps {
    patientPhone: string;
    isNew: boolean;
    onPatientCreatedOrSelected: (patientData: Patient) => void;
}

export interface Medicine {
    name: string;
    dosage: string;
    type: string;
    duration: string;
}

export interface MedicineHistory {
    billId: string;
    date: string;
    status: string;
    medicines: Medicine[];
}

export interface PatientBill {
    id: number;
    patient_id: number,
    histories: PatientHistory[];
    medicineHistories: MedicineHistory[];
    patient: Patient;
}


export interface PatientHistory {
    date: string;
    note: string;
}

export interface Allergy {
    name: string;
    id: number;
}

export interface Disease {
    name: string;
    id: number;
}

export interface History {
    id: number;
    date: string;
    note: string;
}

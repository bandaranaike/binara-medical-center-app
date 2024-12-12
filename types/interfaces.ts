import {SingleValue} from "react-select";

export interface Allergy {
    name: string;
    id: number;
}

export interface Bill {
    id: number;
    patient_id: number;
    status: string;
    patient: Patient;
    doctor: Doctor;
    bill_items: BillItem[];
    created_at: string;
    updated_at: string;
}

export interface BillItem {
    id: number;
    bill_id: number;
    service_id: number;
    service: Service;
    bill_amount: string;
    patient_medicines: PatientMedicine[];
}

export interface Disease {
    name: string;
    id: number;
}

export interface Doctor {
    id: number;
    name: string;
}

export interface History {
    id: number;
    date: string;
    note: string;
}

export interface Medicine {
    id: number;
    name: string;
    drug_name: string;
    price: string;
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

export interface Option {
    value: string;
    label: string;
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

export interface PatientBill {
    id: number;
    patient_id: number,
    histories: PatientHistory[];
    medicineHistories: MedicineHistory[];
    patient: Patient;
}

export interface PatientDetailsProps {
    patientPhone: string;
    isNew: boolean;
    onPatientCreatedOrSelected: (patientData: Patient) => void;
}

export interface PatientHistory {
    date: string;
    note: string;
}

export interface PatientMedicine {
    id: number;
    bill_item_id: number;
    medicine_id: number;
    price: string;
    medicine: Medicine;
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

export interface Service {
    id: number;
    name: string;
    price: string;
}
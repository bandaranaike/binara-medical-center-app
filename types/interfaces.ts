import {SingleValue} from "react-select";
import React from "react";

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
    patient_medicines: PatientMedicine[];
    created_at: string;
    updated_at: string;
}

export interface BillComponentProps {
    children?: React.ReactNode;
    form: any,
    setForm: (form: any) => void;
    onCreateInvoiceBill?: () => void;
    onClearData?: () => void;
    doctorRequired?: boolean;
}

export interface BillItem {
    id: number;
    bill_id: number;
    service_id: number;
    service: Service;
    bill_amount: string;
    patient_medicines: PatientMedicine[];
}

export interface Booking {
    bill_amount: number;
    system_amount: number;
    id: number;
    queue_number: number;
    patient_name: string;
    doctor_name: string;
    queue_date: string;
    bill_id: number | null; // Null indicates the bill is not yet created
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
    gender: string
    telephone: string
    birthday?: string
    allergies?: Allergy[]
    diseases?: Disease[]
}

export interface PatientBill {
    id: number;
    patient_id: number,
    doctor_id: number,
    queue_number: number,
    histories: PatientHistory[];
    medicineHistories: MedicineHistory[];
    patient: Patient;
}

export interface PatientDetailsProps {
    patientPhone: string;
    patientName: string;
    patient?: Patient;
    resetForm: boolean;
    patientNotFound: boolean;
    onPatientCreatedOrSelected: (patientData: Patient) => void;
}

export interface PatientHistory {
    date: string;
    note: string;
}

export interface PatientMedicine {
    id: number;
    bill_id: number;
    medicine_id: number;
    price: string;
    dosage: string;
    type: string;
    duration: string;
    medicine: Medicine;
}

export interface SearchableSelectProps {
    placeholder?: string;
    apiUri?: string;
    type?: string;
    onChange?: (selectedOption: SingleValue<Option> | string | undefined) => void;
    onOptionChange?: (selectedOption: Option | null) => void;
    onCreateOption?: (newValue: string) => void;
    value: Option | undefined;
    id: string;
    options?: Option[];
    resetValue?: boolean
}

export interface Service {
    id: number;
    name: string;
    price: string;
}

export interface ServicesProps {
    patientId: number;
    onNotPatientFound?: () => void;
    onServiceStatusChange: (servicesStatus: ServicesStatus) => void;
    resetBillItems: boolean;
    showMedicineTable?: boolean;
    initialBill?: Bill;
}

export interface ServicesStatus {
    bill_id: number;
    count: number;
    total: number;
}

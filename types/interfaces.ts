export interface Allergy {
    name: string;
    id: number;
}

export interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
}

export interface Bill {
    id: number;
    patient_id: number;
    status: string;
    patient: Patient;
    doctor: Doctor;
    bill_items: BillItem[];
    patient_medicines: HistoryItem[];
    created_at: string;
    updated_at: string;
}

export interface BillingPageProps {
    handleFormChange: (name: string, value: string | number | boolean) => void;
    onDoctorNameChange: (name: string) => void;
    resetData: string;
    patientId?: number;
    isBooking?: boolean;
    doctorDate?: Date | null | string;
    onBillIdAdded?: (billId: number) => void;
}

export interface BillItem {
    id: number;
    bill_id: number;
    service_id: number;
    service: Service;
    bill_amount: string;
    system_amount: string;
    patient_medicines: PatientMedicineHistory[];
}

export interface Booking {
    bill_amount: number;
    system_amount: number;
    id: number;
    uuid: string;
    queue_number: number;
    patient_name: string;
    doctor_name: string;
    queue_date: string;
    appointment_type: string;
    payment_type: string;
    payment_status: string;
    status: string;
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

export interface DoctorFee {
    id: number,
    doctor_fee: number,
    institution_charge: number,
    name: string
}

export interface Drug {
    id: number;
    quantity: number;
    total_price: number;
    brand: string;
    drug: string;
}

export interface History {
    id: number;
    date: string;
    note: string;
    doctor: Doctor;
}

export interface HistoryItem {
    id: number;
    duration: string;
    medicine: Medicine;
    medication_frequency: MedicationFrequency;
    sale: Sale;
}

export interface LoggedUser {
    role: string;
    name: string;
    token: string;
}

export interface MedicationFrequency {
    id: number;
    name: string;
    description: string;
}

export interface Medicine {
    id: number;
    name: string;
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
    extra?: string;
}

export interface Patient {
    address: string
    user_id: number;
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
    uuid?: number;
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
    resetForm: string;
    patientNotFound: boolean;
    onPatientCreatedOrSelected: (patientData: Patient) => void;
}

export interface PatientHistory {
    date: string;
    note: string;
}

export interface PatientMedicineHistory {
    id: number;
    status: string;
    created_at: string;
    patient_medicines: HistoryItem[];
}

export interface Sale {
    id: number;
    quantity: number;
    total_quantity: number;
    total_price: number;
    brand: {
        name: string;
        drug: {
            name: string
        }
    }
}

export interface Service {
    id: number;
    name: string;
    price: string;
}

export interface ServicesStatus {
    bill_id: number;
    count: number;
    total: number;
    system_total: number;
    bill_total: number;
}

export interface User {
    id: number | string;
    name: string;
    phone: string;
    patients: Patient[];
}

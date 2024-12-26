import React, {useEffect, useRef} from "react";
import TextInput from "@/components/form/TextInput";
import axios from "@/lib/axios";
import {isEmpty} from "lodash";
import {Option, PatientDetailsProps} from "@/types/interfaces";
import Select from "react-select";
import customStyles from "@/lib/custom-styles";
import Loader from "@/components/form/Loader";

const PatientDetails: React.FC<PatientDetailsProps> = ({patientPhone, patientName, isNew: initialIsNew, onPatientCreatedOrSelected, patientNotFound, patientId,}) => {
    const [id, setId] = React.useState("");
    const [name, setName] = React.useState(patientName);
    const [age, setAge] = React.useState("");
    const [telephone, setTelephone] = React.useState(patientPhone);
    const [email, setEmail] = React.useState("");
    const [address, setAddress] = React.useState("");
    const [year, setYear] = React.useState("");
    const [month, setMonth] = React.useState("");
    const [day, setDay] = React.useState("");
    const [gender, setGender] = React.useState<Option | null>(null);
    const [isNew, setIsNew] = React.useState(initialIsNew);
    const [isLoading, setIsLoading] = React.useState(false);
    const [savedMessage, setSavedMessage] = React.useState({isSuccess: true, message: ""});

    const [errors, setErrors] = React.useState({
        name: "",
        age: "",
        telephone: "",
        email: "",
        address: "",
        year: "",
        month: "",
        day: "",
    });

    const clearDataFlag = useRef(false);

    useEffect(() => {
        if (patientId)
            fetchUserData(patientId);
    }, [patientId]);

    useEffect(() => {
        clearUserData();
        setIsNew(true);
        if (patientName) setName(patientName);
        if (patientPhone) setTelephone(patientPhone);
    }, [patientName, patientPhone]);

    useEffect(() => {
        setIsNew(initialIsNew);
    }, [initialIsNew]);

    useEffect(() => {
        if (patientNotFound) {
            setSavedMessage({
                message: "Please save the patient first!",
                isSuccess: false,
            });
        } else {
            setSavedMessage({
                message: "",
                isSuccess: true,
            });
        }
    }, [patientNotFound]);

    const clearUserData = () => {
        setId("");
        setName("");
        setAge("");
        setTelephone("");
        setEmail("");
        setAddress("");
        setYear("");
        setMonth("");
        setDay("");
        setGender(null);
        setErrors({
            name: "",
            age: "",
            telephone: "",
            email: "",
            address: "",
            year: "",
            month: "",
            day: "",
        });
    };

    const fetchUserData = async (patientId: number) => {
        try {
            setIsLoading(true);
            const response = await axios.get(`/patients/${patientId}`);
            const {id, name, age, telephone, email, address, birthday, gender} = response.data;
            populateFields({id, name, age, address, telephone, email, birthday, gender});
            setIsNew(false); // Allow updating the patient's details
            onPatientCreatedOrSelected(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching patient data:", error);
        }
    };

    const populateFields = ({id, name, age, address, telephone, email, birthday, gender}: any) => {
        setId(id);
        setName(name);
        setAge(age ?? "");
        setTelephone(telephone);
        setEmail(email ?? "");
        setAddress(address ?? "");

        if (birthday) {
            const birthDate = new Date(birthday);
            setYear(birthDate.getFullYear().toString());
            setMonth((birthDate.getMonth() + 1).toString());
            setDay(birthDate.getDate().toString());
        }

        setGender({label: gender, value: gender} ?? null);
    };

    const validateInputs = () => {
        let valid = true;
        let newErrors: any = {};

        if (!name) {
            valid = false;
            newErrors.name = "Name is required.";
        }

        if (!age || !Number.isInteger(Number(age)) || Number(age) < 1) {
            valid = false;
            newErrors.age = "Age must be a positive integer.";
        }

        if (!telephone) {
            valid = false;
            newErrors.telephone = "Telephone is required.";
        }

        setErrors(newErrors);
        return valid;
    };

    const savePatientData = () => {
        setSavedMessage({message: "", isSuccess: false});
        if (!validateInputs()) return;

        const isCreate = isNew && isEmpty(id);
        const birthday = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

        axios(`patients${isCreate ? "" : `/${id}`}`, {
            method: isCreate ? "POST" : "PUT",
            data: {name, age, telephone, email, address, birthday, gender: gender?.value},
        })
            .then((response) => {
                const newPatientData = response.data.data;
                populateFields(newPatientData);
                setIsNew(false); // Update the state to reflect the saved patient
                onPatientCreatedOrSelected(newPatientData);
                setSavedMessage({message: "Patient saved successfully!", isSuccess: true});
            })
            .catch((error) => {
                const message = error.response?.data?.message ?? "Error saving patient.";
                setSavedMessage({message, isSuccess: false});
            });
    };

    const resetToNewPatient = () => {
        clearUserData();
        setIsNew(true);
    };

    const genderOptions = [
        {value: "male", label: "Male"},
        {value: "female", label: "Female"},
        {value: "other", label: "Other"},
    ];

    return (
        <div className={`border border-dashed ${isNew ? "border-green-700" : "border-blue-800"} p-6 rounded-lg`}>
            <div className="grid grid-cols-3 gap-4">
                <TextInput required name={"Name"} value={name} onChange={setName} error={errors.name}/>
                <TextInput required name={"Telephone"} value={telephone} onChange={setTelephone} error={errors.telephone}/>
                <TextInput name={"Age"} required value={age} onChange={setAge} error={errors.age}/>
                <div className="flex space-x-4">
                    <TextInput name={"Birth Year"} value={year} onChange={setYear} error={errors.year}/>
                    <TextInput name={"Month"} value={month} onChange={setMonth} error={errors.month}/>
                    <TextInput name={"Day"} value={day} onChange={setDay} error={errors.day}/>
                </div>
                <TextInput name={"Address"} value={address} onChange={setAddress} error={errors.address}/>
                <TextInput name={"Email"} value={email} onChange={setEmail} error={errors.email}/>
                <Select
                    instanceId="GenderSelect"
                    placeholder="Gender"
                    options={genderOptions}
                    styles={customStyles}
                    value={gender}
                    onChange={(option: Option | null) => setGender(option)}
                />
            </div>
            <div className="flex mt-6 space-x-4">
                <button
                    className={`py-2 px-4 ${isNew ? "bg-green-600 border-green-700" : "bg-blue-800 border-blue-700"} rounded border`}
                    onClick={savePatientData}
                >
                    {isNew ? "Create Profile" : "Save Profile"}
                </button>
                <button
                    className="py-2 px-4 bg-gray-700 border-gray-700 rounded border"
                    onClick={resetToNewPatient}
                >
                    Reset & Create New
                </button>
                <div className={`pt-2 pl-3 ${savedMessage.isSuccess ? "text-green-500" : "text-red-500"}`}>
                    {savedMessage.message}
                </div>
                {isLoading && (
                    <div className="flex grow justify-end">
                        <Loader/>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientDetails;

import React, {useEffect, useState} from "react";
import TextInput from "@/components/form/TextInput";
import axios from "@/lib/axios";
import {isEmpty, round} from "lodash";
import {Option, Patient, PatientDetailsProps} from "@/types/interfaces";
import Select from "react-select";
import customStyles from "@/lib/customStyles";
import Loader from "@/components/form/Loader";
import parsePhoneNumber from "libphonenumber-js";
import Progress from "@/components/form/Progress";
import {getSimilarity} from "@/lib/compareStrChanges";

const PatientDetails: React.FC<PatientDetailsProps> = ({patientPhone, patientName, onPatientCreatedOrSelected, patientNotFound, patient, resetForm}) => {
    const [id, setId] = useState(0);
    const [userId, setUserId] = useState(0);
    const [name, setName] = useState(patientName);
    const [age, setAge] = useState(0);
    const [telephone, setTelephone] = useState(patientPhone);
    const [validatedPhone, setValidatePhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [year, setYear] = useState("");
    const [month, setMonth] = useState("");
    const [day, setDay] = useState("");
    const [gender, setGender] = useState<Option | null>(null);
    const [isNew, setIsNew] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [savedMessage, setSavedMessage] = useState({isSuccess: true, message: ""});
    const [currentPatient, setCurrentPatient] = useState(patient);
    const [hasTelephoneTyped, setHasTelephoneTyped] = useState(false);
    const [nameChangeIndex, setNameChangeIndex] = useState(0);
    const [originalName, setOriginalName] = useState(patientName || "");
    const [debouncedName, setDebouncedName] = useState(name);

    const [errors, setErrors] = useState({
        name: "",
        age: "",
        telephone: "",
        email: "",
        address: "",
        year: "",
        month: "",
        day: "",
    });

    useEffect(() => {
        if (resetForm) {
            clearUserData();
            setName("");
            setTelephone("")
            setIsNew(true);
        }
    }, [resetForm]);

    useEffect(() => {
        clearUserData();
        setName(patientName);
        setTelephone(patientPhone);
        setIsNew(true)
        setCurrentPatient(undefined);
    }, [patientName, patientPhone]);


    useEffect(() => {
        clearUserData();
        if (patient) {
            populateFields(patient);
            setIsNew(false);
            setCurrentPatient(patient);
        }
    }, [patient])

    useEffect(() => {
        if (onPatientCreatedOrSelected && currentPatient) {
            onPatientCreatedOrSelected(currentPatient);
        }
    }, [currentPatient]);

    useEffect(() => {
        if (patientNotFound) {
            setSavedMessage({message: "Please save the patient first!", isSuccess: false,});
        } else {
            setSavedMessage({message: "", isSuccess: true,});
        }
    }, [patientNotFound]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedName(name);
        }, 300);

        return () => clearTimeout(handler);
    }, [name]);

    useEffect(() => {
        if (debouncedName && originalName && debouncedName !== originalName) {
            const similarity = getSimilarity(originalName, debouncedName)
            // setIsNew(similarity < 0.8)
            setNameChangeIndex(round((1 - similarity) * 10))
        }
    }, [debouncedName, originalName]);


    const [debouncedTelephone, setDebouncedTelephone] = useState(telephone);

    useEffect(() => {
        if (telephone) {
            setHasTelephoneTyped(true); // Mark that the user has started typing
        }
        const handler = setTimeout(() => {
            setDebouncedTelephone(telephone);
        }, 300);

        return () => clearTimeout(handler);
    }, [telephone]);

    useEffect(() => {
        if (hasTelephoneTyped)
            validatePhoneNumber(debouncedTelephone);
    }, [debouncedTelephone]);

    const clearUserData = () => {
        setOriginalName('')
        setDebouncedName('')
        setNameChangeIndex(0)
        setId(0);
        setAge(0);
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
        setSavedMessage({message: "", isSuccess: true,});
    };

    const populateFields = ({id, name, age, address, telephone, email, birthday, gender, user_id}: Patient) => {
        setIsLoading(true);
        setId(id);
        setName(name);
        setOriginalName(name);
        setAge(age);
        setTelephone(telephone);
        setEmail(email ?? "");
        setAddress(address ?? "");
        setUserId(user_id);

        if (birthday) {
            const birthDate = new Date(birthday);
            setYear(birthDate.getFullYear().toString());
            setMonth((birthDate.getMonth() + 1).toString());
            setDay(birthDate.getDate().toString());
        }

        setGender({label: gender, value: gender});
        setIsLoading(false);
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
        } else {
            if (!validatePhoneNumber(telephone)) {
                newErrors.telephone = "Phone number is invalid";
                valid = false;
            }
        }

        setErrors(newErrors);
        return valid;
    };

    const validatePhoneNumber = (phone: string) => {
        const formattedPhone = parsePhoneNumber(phone, "LK");
        if (phone && (!formattedPhone || !formattedPhone.isValid())) {
            setErrors({...errors, telephone: "Phone number is invalid"})
            return false;
        } else if (formattedPhone) {
            setErrors({...errors, telephone: ""})
            setValidatePhone(formattedPhone.number);
            return true;
        }
    }

    const savePatientData = (isNewPatient: boolean) => {
        setSavedMessage({message: "", isSuccess: false});
        if (!validateInputs()) return;

        setIsLoading(true);

        const isCreate = isNewPatient || (isNew && isEmpty(id));
        const birthday = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

        const uri = isCreate ? "" : `/${id}`;

        axios(`patients${uri}`, {
            method: isCreate ? "POST" : "PUT",
            data: {name, age, telephone: validatedPhone, email, address, birthday, gender: gender?.value, user_id: userId},
        })
            .then((response) => {
                const newPatientData = response.data.data;
                populateFields(newPatientData);
                setIsNew(false); // Update the state to reflect the saved patient
                onPatientCreatedOrSelected(newPatientData);
                setCurrentPatient(undefined);
                setSavedMessage({message: "Patient saved successfully!", isSuccess: true});
            })
            .catch((error) => {
                const message = error.response?.data?.message ?? "Error saving patient.";
                setSavedMessage({message, isSuccess: false});
            }).finally(() => setIsLoading(false));
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
                <TextInput name={"Age"} required value={age.toString()} onChange={(e) => setAge(Number(e))} error={errors.age}/>
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
            <div className="flex mt-6 space-x-4 items-center">

                {isNew && <button
                    onClick={() => savePatientData(false)}
                    className="bg-green-600 border-green-700 py-2 px-4 rounded border"> Create patient </button>}

                {!isNew && nameChangeIndex > 2 && <button
                    onClick={() => savePatientData(true)}
                    className="bg-green-600 border-green-700 py-2 px-4 rounded border"> Create new patient </button>}

                {!isNew && <button
                    onClick={() => savePatientData(false)}
                    className="bg-blue-800 border-blue-700 py-2 px-4 rounded border">Save patient</button>}

                <button
                    className="py-2 px-4 bg-gray-700 border-gray-700 rounded border"
                    onClick={resetToNewPatient}
                >
                    Reset & Create New
                </button>
                {savedMessage.message &&
                    <div className={`pt-2 pl-3 ${savedMessage.isSuccess ? "text-green-500" : "text-red-500"}`}>
                        {savedMessage.message}
                    </div>
                }
                {isLoading && (
                    <div className="flex grow justify-end">
                        <Loader/>
                    </div>
                )}
                {nameChangeIndex > 0 &&
                    <div className="mr-3 text-xs text-gray-500"><Progress progress={nameChangeIndex}/>
                        <div className="mt-0.5">Name change index : {nameChangeIndex}</div>
                    </div>
                }

            </div>
        </div>
    );
};

export default PatientDetails;

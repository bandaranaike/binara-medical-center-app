import React, { ChangeEvent, useEffect, useRef } from "react";
import TextInput from "@/components/form/TextInput";
import axios from "@/lib/axios";
import { isEmpty } from "lodash";
import { Option, PatientDetailsProps } from "@/types/interfaces";
import Select from "react-select";
import customStyles from "@/lib/custom-styles";

const PatientDetails: React.FC<PatientDetailsProps> = ({ patientPhone, isNew, onPatientCreatedOrSelected }) => {
    const [id, setId] = React.useState("");
    const [name, setName] = React.useState("");
    const [age, setAge] = React.useState("");
    const [telephone, setTelephone] = React.useState(patientPhone);
    const [email, setEmail] = React.useState("");
    const [address, setAddress] = React.useState("");
    const [year, setYear] = React.useState("");
    const [month, setMonth] = React.useState("");
    const [day, setDay] = React.useState("");
    const [gender, setGender] = React.useState<Option | null>(null);
    const [savedMessage, setSavedMessage] = React.useState({ isSuccess: true, message: '' });

    const [errors, setErrors] = React.useState({
        name: "",
        age: "",
        telephone: "",
        email: "",
        address: "",
        year: "",
        month: "",
        day: ""
    });

    const clearDataFlag = useRef(false);

    const fetchUserData = async (phone: string) => {
        try {
            const response = await axios.get(`${apiUrl}patients/get-by-phone/${phone}`);
            const { id, name, age, telephone, email, address, birthday, gender } = response.data;
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

            setGender({ label: gender, value: gender } ?? "");
            onPatientCreatedOrSelected(response.data);
        } catch (error) {
            console.error("Error fetching patient data:", error);
        }
    };

    useEffect(() => {
        clearUserData();
        setTelephone(patientPhone);
        if (!isNew) {
            if (!clearDataFlag.current) {
                clearDataFlag.current = true;
            }
            if (patientPhone) fetchUserData(patientPhone);
        }
    }, [patientPhone]);

    const apiUrl = process.env.BACKEND_API_URL || "http://localhost/api/";

    const clearUserData = () => {
        setName("");
        setAge("");
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
            day: ""
        });
    };

    const validateInputs = () => {
        let valid = true;
        let newErrors: any = {};

        if (!name) {
            valid = false;
            newErrors.name = "Name is required.";
        } else if (name.length > 255) {
            valid = false;
            newErrors.name = "Name must be less than 255 characters.";
        }

        if (!age) {
            valid = false;
            newErrors.age = "Age is required.";
        } else if (!Number.isInteger(Number(age)) || Number(age) < 1) {
            valid = false;
            newErrors.age = "Age must be a positive integer.";
        }

        const currentYear = new Date().getFullYear();
        if (year && (Number(year) < 1900 || Number(year) > currentYear)) {
            valid = false;
            newErrors.year = `Year must be between 1900 and ${currentYear}.`;
        }

        if (month &&( Number(month) < 1 || Number(month) > 12)) {
            valid = false;
            newErrors.month = "Month must be between 1 and 12.";
        }

        if (day && ( Number(day) < 1 || Number(day) > 31)) {
            valid = false;
            newErrors.day = "Day must be between 1 and 31.";
        }

        if (!telephone) {
            valid = false;
            newErrors.telephone = "Telephone is required.";
        } else if (telephone.length > 20) {
            valid = false;
            newErrors.telephone = "Telephone must be less than 20 characters.";
        }

        if (email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
            valid = false;
            newErrors.email = "Invalid email address.";
        }

        if (address && address.length > 255) {
            valid = false;
            newErrors.address = "Address must be less than 255 characters.";
        }

        setErrors(newErrors);
        return valid;
    };

    const genderOptions = [
        {value: 'male', label: 'Male'},
        {value: 'female', label: 'Female'},
        {value: 'other', label: 'Other'},
    ]

    const savePatientData = () => {
        setSavedMessage({ message: "", isSuccess: false });
        if (!validateInputs()) {
            return;
        }

        const isCreate = isNew && isEmpty(id);
        const birthday = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

        axios(apiUrl + `patients${isCreate ? "" : `/${id}`}`, {
            method: isCreate ? "POST" : "PUT",
            data: {
                name,
                age,
                telephone,
                email,
                address,
                birthday,
                gender: gender?.value
            },
        })
            .then((createdResponse) => {
                if (isCreate) onPatientCreatedOrSelected(createdResponse.data.data);
                setSavedMessage({ message: "Patient saved successfully!", isSuccess: true });
            })
            .catch((error) => {
                let message = error.response.data?.message;
                setSavedMessage({ message, isSuccess: false });
            });
    };

    return (
        <>
            <div className={`border border-dashed ${isNew ? 'border-green-700' : 'border-gray-700'} p-6 rounded-lg`}>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <TextInput
                            required
                            name={"Telephone"}
                            value={telephone}
                            onChange={setTelephone}
                            error={errors.telephone}
                        />
                    </div>

                    <div>
                        <TextInput
                            required
                            name={"Name"}
                            value={name}
                            onChange={setName}
                            error={errors.name}
                        />
                    </div>

                    <div>
                        <TextInput
                            name={"Age"}
                            required
                            value={age}
                            onChange={setAge}
                            error={errors.age}
                        />
                    </div>

                    <div className="flex space-x-4">
                        <TextInput
                            name={"Birth Year"}
                            value={year}
                            onChange={setYear}
                            error={errors.year}
                        />
                        <TextInput
                            name={"Month"}
                            value={month}
                            onChange={setMonth}
                            error={errors.month}
                        />
                        <TextInput
                            name={"Day"}
                            value={day}
                            onChange={setDay}
                            error={errors.day}
                        />
                    </div>

                    <div>
                        <TextInput
                            name={"Address"}
                            value={address}
                            onChange={setAddress}
                            error={errors.address}
                        />
                    </div>

                    <div>
                        <TextInput
                            name={"Email"}
                            value={email}
                            onChange={setEmail}
                            error={errors.email}
                        />
                    </div>

                    <div>
                        <Select
                            instanceId="GenderSelect"
                            placeholder="Gender"
                            options={genderOptions}
                            styles={customStyles}
                            value={gender}
                            onChange={(option: Option | null) => setGender(option)}
                        />
                    </div>
                </div>
                <div className="flex mt-6">
                    <button
                        className={`py-2 px-4 ${isNew ? "bg-green-600 border-green-700" : "bg-gray-800 border-gray-700"} rounded border`}
                        onClick={savePatientData}
                    >
                        {isNew ? "Create Profile" : "Save Profile"}
                    </button>
                    <div className={`pt-2 pl-3 ${savedMessage.isSuccess ? "text-green-500" : "text-red-500"}`}>
                        {savedMessage.message}
                    </div>
                </div>
            </div>
        </>
    );
};

export default PatientDetails;

import React, {ChangeEvent, useEffect, useRef} from "react";
import TextInput from "@/components/form/TextInput";
import axios from "@/lib/axios";
import DatePicker from "@/components/form/DatePicker";
import {isEmpty} from "lodash";
import {Option, PatientDetailsProps} from "@/types/interfaces";
import Select from "react-select";
import customStyles from "@/lib/custom-styles";


const PatientDetails: React.FC<PatientDetailsProps> = ({patientPhone, isNew, onPatientCreated}) => {
    const [id, setId] = React.useState("");
    const [name, setName] = React.useState("");
    const [age, setAge] = React.useState("");
    const [telephone, setTelephone] = React.useState(patientPhone);
    const [email, setEmail] = React.useState("");
    const [address, setAddress] = React.useState("");
    const [birthday, setBirthday] = React.useState<Date | undefined>(undefined);
    const [gender, setGender] = React.useState<Option | null>(null); // New state for gender
    const [savedMessage, setSavedMessage] = React.useState({isSuccess: true, message: ''});

    const [errors, setErrors] = React.useState({
        name: "",
        age: "",
        telephone: "",
        email: "",
        address: ""
    });

    const clearDataFlag = useRef(false);

    const fetchUserData = async (phone: string) => {
        try {
            const response = await axios.get(`${apiUrl}patients/get-by-phone/${phone}`);
            const {id, name, age, telephone, email, address, birthday, gender} = response.data;
            setId(id);
            setName(name);
            setAge(age ?? "");
            setTelephone(telephone);
            setEmail(email ?? "");
            setAddress(address ?? "");
            setBirthday(birthday ? new Date(birthday) : undefined);
            setGender({label: gender, value: gender} ?? "");
        } catch (error) {
            console.error('Error fetching patient data:', error);
        }
    };

    const handleOnBirthdayChange = (date: Date) => {
        setBirthday(date)
    }

    useEffect(() => {
        clearUserData();
        setTelephone(patientPhone);
        if (!isNew) {
            if (!clearDataFlag.current) {
                clearDataFlag.current = true;
            }
            if (patientPhone)
                fetchUserData(patientPhone);
        }
    }, [patientPhone]);

    const apiUrl = process.env.BACKEND_API_URL || 'http://localhost/api/';

    const clearUserData = () => {
        setName("");
        setAge("");
        setEmail("");
        setAddress("");
        setBirthday(undefined);
        setGender(null); // Clear gender
        setErrors({
            name: "",
            age: "",
            telephone: "",
            email: "",
            address: ""
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
        setSavedMessage({message: '', isSuccess: false})
        if (!validateInputs()) {
            return;
        }

        const isCreate = isNew && isEmpty(id);

        axios(apiUrl + `patients${isCreate ? '' : `/${id}`}`, {
            method: isCreate ? "POST" : "PUT", data: {
                name,
                age,
                telephone,
                email,
                address,
                birthday,
                gender: gender?.value
            },
        }).then(createdResponse => {
            if (isCreate)
                onPatientCreated(createdResponse.data)
            setSavedMessage({message: "Patient saved successfully!", isSuccess: true})
        }).catch(error => {
            let message = error.response.data?.message;
            setSavedMessage({message, isSuccess: false})
        });
    };

    const setGenderSelect = (option: Option | null) => {
        setGender(option);
    }

    return (
        <>
            <div className={`border border-dashed ${isNew ? 'border-green-700' : 'border-gray-700'} p-6 rounded-lg`}>
                <div className=" grid grid-cols-3 gap-4">
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
                            name={'Name'}
                            value={name}
                            onChange={setName}
                            error={errors.name}
                        />
                    </div>

                    <div>
                        <TextInput
                            name={'Age'}
                            required
                            value={age}
                            onChange={setAge}
                            error={errors.age}
                        />
                    </div>

                    <div>
                        <DatePicker
                            name={'Birthday'}
                            onChange={handleOnBirthdayChange}
                            value={birthday}

                        />
                    </div>

                    <div>
                        <TextInput
                            name={'Address'}
                            value={address}
                            onChange={setAddress}
                            error={errors.address}
                        />
                    </div>

                    <div>
                        <TextInput
                            name={'Email'}
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
                            onChange={(option: Option | null) => setGenderSelect(option)}
                        />
                    </div>
                </div>
                <div className="flex mt-3">
                    <button className={`py-2 px-4 ${isNew ? 'bg-green-600 border-green-700' : 'bg-gray-800 border-gray-700'} rounded border`} onClick={savePatientData}>
                        {isNew ? 'Create Profile' : 'Save Profile'}
                    </button>
                    <div className={`pt-2 pl-3 ${savedMessage.isSuccess ? 'text-green-500' : 'text-red-500'}`}>{savedMessage.message}</div>
                </div>
            </div>
        </>
    );
}

export default PatientDetails;

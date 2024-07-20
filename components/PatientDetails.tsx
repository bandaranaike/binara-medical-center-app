import React, {useEffect} from "react";
import TextInput from "@/components/form/TextInput";
import axios from "@/lib/axios";

interface PatientDetailsProps {
    patientPhone: string,
    isNew: boolean,
}

const PatientDetails: React.FC<PatientDetailsProps> = ({patientPhone, isNew}) => {
    const [name, setName] = React.useState("");
    const [age, setAge] = React.useState("");
    const [telephone, setTelephone] = React.useState(patientPhone);
    const [email, setEmail] = React.useState("");
    const [address, setAddress] = React.useState("");
    const [birthday, setBirthday] = React.useState("");

    const [errors, setErrors] = React.useState({
        name: "",
        age: "",
        telephone: "",
        email: "",
        address: ""
    });

    useEffect(() => {
        setTelephone(patientPhone);
        if(!isNew){
            fetchUserData()
        }
    }, [patientPhone]);

    const apiUrl = process.env.BACKEND_API_URL || 'http://localhost/api/';

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

    const savePatientData = () => {
        if (!validateInputs()) {
            return;
        }

        axios.post(apiUrl + 'patients', {
            name,
            age,
            telephone,
            email,
            address,
            birthday
        }).then(createdResponse => {
            console.log('createdResponse', createdResponse);
        }).catch(error => {
            console.error('Error:', error);
        });
    };

    return (
        <div className={`border border-dashed ${isNew ? 'border-green-700' : 'border-gray-700'} p-6 rounded-lg grid grid-cols-2 gap-4`}>

            <div>
                <TextInput
                    name={"Telephone"}
                    value={telephone}
                    onChange={setTelephone}
                    error={errors.telephone}
                />
            </div>

            <div>
                <TextInput
                    name={'Name'}
                    value={name}
                    onChange={setName}
                    error={errors.name}
                />
            </div>

            <div>
                <TextInput
                    name={'Age'}
                    value={age}
                    onChange={setAge}
                    error={errors.age}
                />
            </div>

            <div>
                <TextInput
                    name={'Birthday'}
                    value={birthday}
                    onChange={setBirthday}
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

            <div className="">
                <button className={`py-2 px-4 ${isNew ? 'bg-green-600 border-green-700' : 'bg-gray-800 border-gray-700'} rounded border`} onClick={savePatientData}>
                    {isNew ? 'Create Profile' : 'Save Profile'}
                </button>
            </div>
        </div>
    );
}

export default PatientDetails;

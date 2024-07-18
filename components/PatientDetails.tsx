import React, { useEffect } from "react";
import TextInput from "@/components/form/TextInput";
import axios from "@/lib/axios";

interface PatientDetailsProps {
    telephone: string,
    isNew: boolean,
}

const PatientDetails: React.FC<PatientDetailsProps> = ({ telephone, isNew }) => {

    const [name, setName] = React.useState("");
    const [age, setAge] = React.useState("");
    const [phone, setPhone] = React.useState(telephone);
    const [email, setEmail] = React.useState("");
    const [address, setAddress] = React.useState("");
    const [birthday, setBirthday] = React.useState("");

    useEffect(() => {
        setPhone(telephone);
    }, [telephone]);

    const apiUrl = process.env.BACKEND_API_URL || 'http://localhost/api/';

    const savePatientData = (inputValue: any) => {
        console.log('inputValues', inputValue);
        axios.post(apiUrl + 'patients', {
            name,
            age,
            phone,
            email,
            address,
            birthday
        }).then(createdResponse => {
            console.log('createdResponse', createdResponse);
        }).catch(error => {
            console.error('Error:', error);
        });
    }

    return (
        <div className={`border border-dashed ${isNew ? 'border-green-700' : 'border-gray-700'} p-6 rounded-lg grid grid-cols-2 gap-4`}>

            <div>
                <TextInput name={"Telephone"} value={phone} onChange={setPhone}></TextInput>
            </div>

            <div>
                <TextInput name={'Name'} value={name} onChange={setName}></TextInput>
            </div>

            <div>
                <TextInput name={'Age'} value={age} onChange={setAge}></TextInput>
            </div>

            <div>
                <TextInput name={'Birthday'} value={birthday} onChange={setBirthday}></TextInput>
            </div>

            <div>
                <TextInput name={'Address'} value={address} onChange={setAddress}></TextInput>
            </div>

            <div>
                <TextInput name={'Email'} value={email} onChange={setEmail}></TextInput>
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

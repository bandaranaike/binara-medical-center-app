import React, {FormEvent, useState} from "react";
import TextInput from "@/components/form/TextInput";
import axios from "@/lib/axios";
import Select from "react-select";
import {LoggedUser, Option} from "@/types/interfaces";
import customStyles from "@/lib/customStyles";

interface LoginWindowProps {
    onUserHasLoggedIn: (loggedUser: LoggedUser) => void;
}

const RegisterWindow: React.FC<LoginWindowProps> = ({onUserHasLoggedIn}) => {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [role, setRole] = useState<Option | null>(null);
    const [registerError, setRegisterError] = useState<string[]>([]);

    const restrictPassword = false;

    const userRoleOptions = [
        {value: "patient", label: "Patient"},
        {value: "pharmacy", label: "Pharmacist"},
        {value: "doctor", label: "Doctor"},
        {value: "nurse", label: "Nurse"},
        {value: "reception", label: "Reception"}
    ];

    const validateForm = (): boolean => {
        const errors: string[] = []; // Initialize an array to collect errors

        if (!name) {
            errors.push("Name is required")
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            errors.push("Email is required.");
        } else if (!emailRegex.test(email)) {
            errors.push("Invalid email format.");
        }

        if (!password) {
            errors.push("Password is required.");
        } else {
            if (password.length < 5) {
                errors.push("Password must be at least 5 characters long.");
            }
            if (restrictPassword) {
                if (!/[A-Z]/.test(password)) {
                    errors.push("Password must contain at least one uppercase letter.");
                }
                if (!/[a-z]/.test(password)) {
                    errors.push("Password must contain at least one lowercase letter.");
                }
                if (!/[0-9]/.test(password)) {
                    errors.push("Password must contain at least one digit.");
                }
                if (!/[@$!%*?&#]/.test(password)) {
                    errors.push("Password must contain at least one special character (@, $, !, %, *, ?, &, or #).");
                }
            }
        }

        if (!role) {
            errors.push("Please select a user type.");
        } else if (!userRoleOptions.some(option => option.value === role.value)) {
            errors.push("Invalid user type selected.");
        }

        setRegisterError(errors);

        return errors.length === 0;
    };


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                axios.post('register', {
                    name,
                    email,
                    password,
                    role: role?.value,
                    password_confirmation: passwordConfirm
                }).then(response => {
                    onUserHasLoggedIn(response.data);
                }).catch(e => {
                    setRegisterError([e.response.data.message])
                });
            } catch (error) {
                console.error(error)
            }
        } else {
            console.error("Validation failed:", registerError);
        }
    };

    return (
        <div className="p-4 md:p-5">
            <form className="space-y-4" action="#">
                <div>
                    <TextInput name="Name" onChange={setName} value={name}></TextInput>
                </div>
                <div>
                    <TextInput name="Email" onChange={setEmail} value={email}></TextInput>
                </div>
                <div>
                    <TextInput name="Password" onChange={setPassword} value={password} type="password"></TextInput>
                </div>
                <div>
                    <TextInput name="Password confirm" onChange={setPasswordConfirm} value={passwordConfirm} type="password"></TextInput>
                </div>
                <div>
                    <div className="mb-2">User type :</div>
                    <Select
                        instanceId="UserTypeSelec"
                        placeholder="User type"
                        styles={customStyles}
                        name="Password"
                        onChange={(option: Option | null) => setRole(option)}
                        options={userRoleOptions}
                    />
                </div>
                <button onClick={handleSubmit}
                        className="w-full text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800">
                    Create user account
                </button>
                {registerError.length > 0 && (
                    <ul className="text-red-700">
                        {registerError.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                )}
            </form>
        </div>
    )
}

export default RegisterWindow;
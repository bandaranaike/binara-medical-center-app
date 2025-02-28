import React, {FormEvent, useState} from "react";
import TextInput from "@/components/form/TextInput";
import axios from "@/lib/axios";
import {LoggedUser} from "@/types/interfaces";
import CustomCheckbox from "@/components/form/CustomCheckbox";

interface LoginWindowProps {
    onUserHasLoggedIn: (loggedUser: LoggedUser) => void;
}

const LoginWindow: React.FC<LoginWindowProps> = ({onUserHasLoggedIn}) => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(true);
    const [loginError, setLoginError] = useState<string[]>([]);

    const validateForm = (): boolean => {
        const errors: string[] = []; // Initialize an array to collect errors

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            errors.push("Email is required.");
        } else if (!emailRegex.test(email)) {
            errors.push("Invalid email format.");
        }

        // Validate password strength
        if (!password) {
            errors.push("Password is required.");
        }

        setLoginError(errors)

        // Return true if no errors
        return errors.length === 0;
    };


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            try {
                axios.post('login', {email, password, remember}).then(loginResponse => {
                    onUserHasLoggedIn(loginResponse.data);
                }).catch(e => {
                    if (e.status == 401) {
                        setLoginError(['Email or password does not match.'])
                    } else {
                        setLoginError([e.message]);
                    }
                });
            } catch (error) {
                console.error(error)
            }
        }

    };

    return (
        <div className="p-4 md:p-5">
            <form className="space-y-4" action="#">
                <div>
                    <TextInput name="Email" onChange={setEmail} value={email}></TextInput>
                </div>
                <div>
                    <TextInput name="Password" onChange={setPassword} value={password} type="password"></TextInput>
                </div>
                <div className="">
                    <CustomCheckbox label="Remember me" setChecked={setRemember} checked={remember}/>
                </div>
                <button onClick={handleSubmit}
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Login
                    to your account
                </button>
                {loginError.length > 0 && (
                    <ul className="text-red-700">
                        {loginError.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                )}
            </form>
        </div>
    )
}

export default LoginWindow;
import React, {FormEvent, useState} from "react";
import TextInput from "@/components/form/TextInput";
import axios from "@/lib/axios";
import Cookies from "js-cookie";

interface LoginWindowProps {
    loginStatus: (status: boolean) => void;
}

const LoginWindow: React.FC<LoginWindowProps> = ({loginStatus}) => {

    const [email, setEmail] = useState("eranda@email.com");
    const [password, setPassword] = useState("9,$wCD:Kf,3YwEu");
    const [showError, setShowError] = useState<boolean>(false);

    const apiUrl = process.env.BACKEND_API_URL || 'http://localhost/api/';

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            setShowError(false)
            axios.post(apiUrl + 'login', {email, password}).then(loginResponse => {
                Cookies.set('API-TOKEN', loginResponse.data.token);
                loginStatus(true);
            }).catch(e => {
                console.log(e);
                setShowError(true)
            });
        } catch (error) {
            console.log(error)
            setShowError(true)
        }
    };

    return (
        <div id="authentication-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative p-4 w-full max-w-md max-h-full">
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Sign in to our platform</h3>
                    </div>
                    <div className="p-4 md:p-5">
                        <form className="space-y-4" action="#">
                            <div>
                                <TextInput name="Email" onChange={setEmail} value={email}></TextInput>
                            </div>
                            <div>
                                <TextInput name="Password" onChange={setPassword} value={password} type="password"></TextInput>
                            </div>
                            <div className="flex justify-between">
                                <a href="#" className="text-sm text-blue-700 hover:underline dark:text-blue-500">Lost Password?</a>
                            </div>
                            <button onClick={handleSubmit}
                                    className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Login
                                to your account
                            </button>
                            {showError && (<div className="text-red-600">Invalid username or password. Please try again</div>)}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginWindow;
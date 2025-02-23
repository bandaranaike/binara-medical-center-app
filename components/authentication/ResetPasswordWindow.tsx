"use client"
import React, {FormEvent, useState} from "react";
import TextInput from "@/components/form/TextInput";
import {useSearchParams, useParams, useRouter} from 'next/navigation';
import axios from "@/lib/axios";
import Loader from "@/components/form/Loader";

const ResetPasswordWindow: React.FC = () => {
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [passwordConfirmation, setPasswordConfirmation] = useState('');


    const router = useRouter();
    const params = useParams(); // Get token from URL path
    const searchParams = useSearchParams();
    const token = params?.token;
    const email = searchParams?.get("email"); // Extract email from URL

    const handleSubmit = async (e: FormEvent) => {

        e.preventDefault();

        if (!token) {
            setError("Invalid token.");
            setLoading(false);
            return;
        }

        if (password !== passwordConfirmation) {
            setError("Passwords do not match");
            return;
        }

        try {
            axios.post('reset-password', {token, email, password, password_confirmation: passwordConfirmation})
                .then((res) => {
                    setMessage(res.data.message);
                    setError(null);
                    router.push('/'); // Redirect to login page
                })
                .catch((err) => {
                    if (err.response.data?.message) setError(err.response.data.message);
                    else if (err.response.data) setError(err.response.data);
                })
                .finally(() => setLoading(false));
        } catch (err) {
            console.error("Reset Password Error:", err);
        }
    };

    return (
        <div className="p-4 md:p-5">
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <TextInput name="New Password" onChange={setPassword} value={password} type="password"/>
                </div>
                <div>
                    <TextInput name="Confirm Password" onChange={setPasswordConfirmation} value={passwordConfirmation} type="password"/>
                </div>
                <button type="submit"
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                    {loading ? 'Resetting...' : 'Reset Password'}
                </button>
                {message && <p className="text-green-700">{message}</p>}
                {error && <p className="text-red-700">{error}</p>}
                {loading && <Loader/>}
            </form>
        </div>
    );
};

export default ResetPasswordWindow;
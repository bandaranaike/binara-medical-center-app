import React, {FormEvent, useState} from "react";
import TextInput from "@/components/form/TextInput";
import axios from "@/lib/axios";

const ForgotPasswordWindow: React.FC = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post("forgot-password", {email});
            setMessage(response.data);
            setError(null);
        } catch (err: any) {
            if (err.response?.data?.message) setError(err.response.data.message);
            else if (err.response?.data) setError(err.response.data || "An error occurred");
        }
    };

    return (
        <div className="p-4 md:p-5">
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <TextInput name="Email" onChange={setEmail} value={email}/>
                </div>
                <button type="submit"
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                    Send Reset Link
                </button>
                {message && <p className="text-green-500">{message}</p>}
                {error && <p className="text-red-500">{error}</p>}
            </form>
        </div>
    );
};

export default ForgotPasswordWindow;

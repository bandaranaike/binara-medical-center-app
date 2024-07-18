import {useState, FormEvent, FocusEvent} from 'react';
import axios from '../lib/axios';

export default function LoginPage() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [emailExists, setEmailExists] = useState<boolean | null>(null);

    const apiUrl = process.env.BACKEND_API_URL || 'http://localhost/api/';

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const url = emailExists ? "login" : "register";
        try {
            const response = await axios.post(apiUrl + url, {email, password});
            // Handle successful login (e.g., redirect or store user data)
        } catch (error) {
            // Handle login error
        }
    };

    const handleEmailBlur = async (e: FocusEvent<HTMLInputElement>) => {
        try {
            const response = await axios.post(apiUrl + 'check-email', {email: e.target.value});
            setEmailExists(response.data.exists);
        } catch (error) {
            // Handle error
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
                placeholder="Email"
                required
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
            />
            {emailExists !== null && (
                <div>
                    {emailExists ? (
                        <span>Email exists. Please login.</span>
                    ) : (
                        <span>Email does not exist. Please register.</span>
                    )}
                </div>
            )}
            <button type="submit">{emailExists ? "Login" : "Register"}</button>
        </form>
    );
}

import {useState, FormEvent, FocusEvent} from 'react';
import axios from '../lib/axios';
import Cookies from 'js-cookie';

export default function LoginPage() {
    const [email, setEmail] = useState<string>('era@era.com');
    const [password, setPassword] = useState<string>('123654');
    const [emailExists, setEmailExists] = useState<boolean | null>(null);

    const apiUrl = process.env.BACKEND_API_URL || 'http://localhost/api/';

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const url = emailExists ? "login" : "login";
        try {
            await axios.get(apiUrl + 'sanctum/csrf-cookie');
            const token = Cookies.get('XSRF-TOKEN');

            const response = await axios.post(apiUrl + url, {email, password}, {
                headers: {
                    'X-XSRF-TOKEN': token
                },
                withCredentials: true
            });
            // Handle successful login (e.g., redirect or store user data)
        } catch (error) {
            // Handle login error
            console.error(error);
        }
    };

    const handleEmailBlur = async (e: FocusEvent<HTMLInputElement>) => {
        try {
            const response = await axios.post(apiUrl + 'check-email', {email: e.target.value});
            setEmailExists(response.data.exists);
        } catch (error) {
            // Handle error
            console.error(error);
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

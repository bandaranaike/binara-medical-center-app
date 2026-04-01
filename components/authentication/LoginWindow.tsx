import React, {FormEvent, useState} from "react";
import CustomCheckbox from "@/components/form/CustomCheckbox";
import Loader from "@/components/form/Loader";
import axios, {ensureCsrfCookie} from "@/lib/axios";
import {LoggedUser} from "@/types/interfaces";

interface LoginWindowProps {
    onUserHasLoggedIn: (loggedUser: LoggedUser) => void;
}

const LoginWindow: React.FC<LoginWindowProps> = ({onUserHasLoggedIn}) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(true);
    const [loginError, setLoginError] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = (): boolean => {
        const errors: string[] = [];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            errors.push("Email is required.");
        } else if (!emailRegex.test(email)) {
            errors.push("Invalid email format.");
        }

        if (!password) {
            errors.push("Password is required.");
        }

        setLoginError(errors);

        return errors.length === 0;
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await ensureCsrfCookie();
            const response = await axios.post("login", {email, password, remember});
            onUserHasLoggedIn(response.data);
        } catch (error: any) {
            const status = error?.response?.status;
            const message = error?.response?.data?.message;

            if (status === 401 || status === 422) {
                setLoginError(["Email or password does not match."]);
            } else {
                setLoginError([message || "Unable to sign in right now."]);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid w-full gap-8 overflow-hidden rounded-[2rem] border backdrop-blur-xl xl:grid-cols-[1.05fr_0.95fr]" style={{background: "var(--surface)", borderColor: "var(--border-subtle)", boxShadow: "var(--shadow-soft)"}}>
            <div className="relative hidden overflow-hidden xl:flex" style={{background: "linear-gradient(145deg, rgba(83,46,144,0.96), rgba(20,24,36,0.92))"}}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_28%)]"/>
                <div className="absolute -left-16 top-14 h-72 w-72 rounded-full bg-white/10 blur-3xl"/>
                <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl"/>
                <div className="relative flex h-full flex-col justify-between p-12 text-white">
                    <div className="space-y-5">
                        <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/80">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300"/>
                            Secure Staff Access
                        </div>
                        <div className="space-y-4">
                            <h1 className="max-w-md text-5xl font-semibold leading-tight tracking-[-0.04em]">
                                Binara Medical Center control hub
                            </h1>
                            <p className="max-w-lg text-base leading-7 text-white/72">
                                Sign in through the staff gateway to access scheduling, reception, pharmacy, and clinical workflows with a session managed securely by the backend.
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-4 text-sm text-white/80">
                        <div className="rounded-[1.6rem] border border-white/10 bg-white/8 p-5">
                            Sessions are validated on the server and are no longer stored as browser-readable tokens.
                        </div>
                        <div className="rounded-[1.6rem] border border-white/10 bg-white/8 p-5">
                            Only staff login is available here. Registration and password reset are intentionally removed.
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center p-6 sm:p-10 lg:p-12">
                <div className="w-full space-y-8">
                    <div className="space-y-4">
                        <div className="inline-flex rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.32em]" style={{background: "var(--accent-soft)", color: "var(--accent-strong)"}}>
                            Staff Login
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Welcome back</h2>
                            <p className="max-w-md text-sm leading-6" style={{color: "var(--muted)"}}>
                                Use your staff email and password to continue. This sign-in flow relies on a secure backend session instead of a frontend token.
                            </p>
                        </div>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="app-label" htmlFor="email">Email address</label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                className="app-input h-14 rounded-[1.2rem]"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="staff@binara.lk"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="app-label" htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                className="app-input h-14 rounded-[1.2rem]"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Enter your password"
                            />
                        </div>

                        <div className="rounded-[1.2rem] border p-4" style={{borderColor: "var(--border-subtle)", background: "var(--surface-soft)"}}>
                            <CustomCheckbox label="Keep me signed in on this device" setChecked={setRemember} checked={remember}/>
                        </div>

                        <button type="submit" disabled={isSubmitting} className="app-button-primary flex h-14 w-full items-center justify-center gap-3 rounded-[1.3rem] disabled:cursor-not-allowed disabled:opacity-70">
                            {isSubmitting ? <Loader size="h-5 w-5" color="fill-white"/> : null}
                            <span>{isSubmitting ? "Signing in..." : "Sign in"}</span>
                        </button>

                        {loginError.length > 0 && (
                            <ul className="space-y-1 rounded-[1.2rem] border px-4 py-3 text-sm" style={{borderColor: "rgba(244,63,94,0.3)", background: "rgba(244,63,94,0.1)", color: "#fda4af"}}>
                                {loginError.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        )}
                    </form>

                    <div className="grid gap-3 text-xs leading-5 sm:grid-cols-3" style={{color: "var(--muted)"}}>
                        <div className="rounded-[1.2rem] border p-4" style={{borderColor: "var(--border-subtle)", background: "var(--surface-soft)"}}>Session-backed authentication</div>
                        <div className="rounded-[1.2rem] border p-4" style={{borderColor: "var(--border-subtle)", background: "var(--surface-soft)"}}>Role-aware dashboard access</div>
                        <div className="rounded-[1.2rem] border p-4" style={{borderColor: "var(--border-subtle)", background: "var(--surface-soft)"}}>Audit-friendly server validation</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginWindow;

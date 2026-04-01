import axios from "axios";

const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "";
const backendRootUrl = backendApiUrl.replace(/\/api\/?$/, "");

const defaultHeaders = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "X-API-KEY": process.env.NEXT_PUBLIC_BINARA_API_KEY,
    "X-Requested-With": "XMLHttpRequest",
};

const axiosInstance = axios.create({
    baseURL: backendApiUrl,
    withCredentials: true,
    withXSRFToken: true,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
    headers: defaultHeaders,
});

const csrfClient = axios.create({
    baseURL: backendRootUrl,
    withCredentials: true,
    withXSRFToken: true,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
    headers: defaultHeaders,
});

let csrfPromise: Promise<void> | null = null;

export const ensureCsrfCookie = async (): Promise<void> => {
    if (!csrfPromise) {
        csrfPromise = csrfClient.get("/sanctum/csrf-cookie").then(() => undefined).finally(() => {
            csrfPromise = null;
        });
    }

    return csrfPromise;
};

export default axiosInstance;

import axios, {AxiosInstance} from "axios";

interface PrintItem {
    name: string;
    price: string;
}

export interface PrintRequest {
    bill_reference: string;
    payment_type: string;
    bill_id: number;
    customer_name: string;
    doctor_name: string;
    items: PrintItem[];
    total: string;
}

class PrintService {
    private axiosInstance: AxiosInstance;

    constructor(baseURL: string) {
        this.axiosInstance = axios.create({
            baseURL,
            timeout: 5000, // Adjust the timeout as needed
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    /**
     * Sends a print request to the Python app
     * @param printData - The data to send for printing
     * @returns A promise with the server response
     */
    async sendPrintRequest(printData: PrintRequest): Promise<void> {
        try {
            const response = await this.axiosInstance.post("/print", printData);
        } catch (error: any) {
            console.error("Error in print request:", error.response?.data || error.message);
            throw error;
        }
    }
}

// Export a singleton instance of PrintService
const printService = new PrintService(process.env.NEXT_PUBLIC_PRINTING_URL || "http://localhost:5000");

export default printService;

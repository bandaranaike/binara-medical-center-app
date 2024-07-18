import { NextApiRequest, NextApiResponse } from 'next';
import axios from '../../lib/axios';

export default async function loginHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).end(); // Method Not Allowed
    }

    try {
        const { email, password } = req.body;

        // CSRF token retrieval
        await axios.get('/sanctum/csrf-cookie');

        // Login request
        const response = await axios.post('/login', { email, password });

        res.status(200).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || 'Error');
    }
}

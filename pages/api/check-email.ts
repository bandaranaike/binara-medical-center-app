import { NextApiRequest, NextApiResponse } from 'next';
import axios from '../../lib/axios';

export default async function checkEmailHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).end(); // Method Not Allowed
    }

    try {
        const { email } = req.body;
        const response = await axios.post('/check-email', { email });
        res.status(200).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || 'Error');
    }
}

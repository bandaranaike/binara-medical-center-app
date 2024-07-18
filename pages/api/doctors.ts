import { NextApiRequest, NextApiResponse } from 'next';

// Mock data for demonstration purposes
let doctors = [
    { id: 1, name: 'Dr. Smith', hospital_id: 1, specialty_id: 1, telephone: '1234567890', email: 'dr.smith@example.com', age: 45, address: '123 Main St', timestamps: new Date() },
    // Add more mock data as needed
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method, body, query } = req;

    switch (method) {
        case 'GET':
            res.status(200).json(doctors);
            break;
        case 'POST':
            const newDoctor = { ...body, id: doctors.length + 1, timestamps: new Date() };
            doctors.push(newDoctor);
            res.status(201).json(newDoctor);
            break;
        case 'PUT':
            const idToUpdate = parseInt(query.id as string);
            doctors = doctors.map((doctor) => (doctor.id === idToUpdate ? { ...doctor, ...body } : doctor));
            res.status(200).json({ message: 'Doctor updated successfully' });
            break;
        case 'DELETE':
            const idToDelete = parseInt(query.id as string);
            doctors = doctors.filter((doctor) => doctor.id !== idToDelete);
            res.status(200).json({ message: 'Doctor deleted successfully' });
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}

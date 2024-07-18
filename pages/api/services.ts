import { NextApiRequest, NextApiResponse } from 'next';

// Mock data for demonstration purposes
let services = [
    { id: 1, name: 'Consultation', bill_price: 100, system_price: 80, timestamps: new Date() },
    // Add more mock data as needed
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method, body, query } = req;

    switch (method) {
        case 'GET':
            res.status(200).json(services);
            break;
        case 'POST':
            const newService = { ...body, id: services.length + 1, timestamps: new Date() };
            services.push(newService);
            res.status(201).json(newService);
            break;
        case 'PUT':
            const idToUpdate = parseInt(query.id as string);
            services = services.map((service) => (service.id === idToUpdate ? { ...service, ...body } : service));
            res.status(200).json({ message: 'Service updated successfully' });
            break;
        case 'DELETE':
            const idToDelete = parseInt(query.id as string);
            services = services.filter((service) => service.id !== idToDelete);
            res.status(200).json({ message: 'Service deleted successfully' });
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}

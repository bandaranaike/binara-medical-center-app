import React, {useState, useEffect} from "react";
import axios from "@/lib/axios";

interface Service {
    id: number;
    name: string;
    key: string;
    bill_price: number;
    system_price: number;
    is_separate_items: boolean;
    is_percentage: boolean;
}

const ServicesList: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);


    const fetchServices = async () => {
        try {
            const response = await axios.get<Service[]>("/admin/services");
            setServices(response.data);
        } catch (error) {
            console.error("Error fetching services:", error);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const [editingService, setEditingService] = useState<Service | null>(null);
    const [deletingServiceId, setDeletingServiceId] = useState<number | null>(
        null
    );

    const toggleBoolean = (id: number, field: keyof Service) => {
        setServices((prevServices) =>
            prevServices.map((service) =>
                service.id === id
                    ? {...service, [field]: !service[field]}
                    : service
            )
        );
    };

    const handleEdit = (service: Service) => {
        setEditingService(service);
    };

    const handleDelete = (id: number) => {
        setServices((prevServices) =>
            prevServices.filter((service) => service.id !== id)
        );
        setDeletingServiceId(null);
    };

    return (
        <div className="p-6 bg-gray-900 text-white rounded-lg">
            <h1 className="text-xl font-bold mb-4">Services List</h1>
            <table className="w-full table-auto rounded-lg border border-gray-700">
                <thead className="bg-gray-800">
                <tr>
                    <th className="p-3 border border-gray-700">Name</th>
                    <th className="p-3 border border-gray-700">Key</th>
                    <th className="p-3 border border-gray-700">Bill Price</th>
                    <th className="p-3 border border-gray-700">System Price</th>
                    <th className="p-3 border border-gray-700">Separate Items</th>
                    <th className="p-3 border border-gray-700">Percentage</th>
                    <th className="p-3 border border-gray-700">Actions</th>
                </tr>
                </thead>
                <tbody>
                {services.map((service) => (
                    <tr key={service.id} className="text-center bg-gray-800">
                        <td className="p-3 border border-gray-700">{service.name}</td>
                        <td className="p-3 border border-gray-700">{service.key}</td>
                        <td className="p-3 border border-gray-700">
                            {service.bill_price}
                        </td>
                        <td className="p-3 border border-gray-700">
                            {service.is_percentage
                                ? `${(service.system_price * 100).toFixed(0)}%`
                                : service.system_price}
                        </td>
                        <td className="p-3 border border-gray-700">
                            <input
                                type="checkbox"
                                checked={service.is_separate_items}
                                onChange={() => toggleBoolean(service.id, "is_separate_items")}
                                className="cursor-pointer"
                            />
                        </td>
                        <td className="p-3 border border-gray-700">
                            <input
                                type="checkbox"
                                checked={service.is_percentage}
                                onChange={() => toggleBoolean(service.id, "is_percentage")}
                                className="cursor-pointer"
                            />
                        </td>
                        <td className="p-3 border border-gray-700 space-x-2">
                            <button
                                onClick={() => handleEdit(service)}
                                className="px-3 py-1 bg-blue-500 rounded hover:bg-blue-400"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => setDeletingServiceId(service.id)}
                                className="px-3 py-1 bg-red-500 rounded hover:bg-red-400"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* Edit Modal */}
            {editingService && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-gray-800 p-6 rounded-lg space-y-4">
                        <h2 className="text-lg font-bold">Edit Service</h2>
                        <input
                            type="text"
                            value={editingService.name}
                            onChange={(e) =>
                                setEditingService({
                                    ...editingService,
                                    name: e.target.value,
                                })
                            }
                            placeholder="Name"
                            className="w-full p-2 rounded bg-gray-700 text-white"
                        />
                        <input
                            type="text"
                            value={editingService.key}
                            onChange={(e) =>
                                setEditingService({
                                    ...editingService,
                                    key: e.target.value,
                                })
                            }
                            placeholder="Key"
                            className="w-full p-2 rounded bg-gray-700 text-white"
                        />
                        <input
                            type="number"
                            value={editingService.bill_price}
                            onChange={(e) =>
                                setEditingService({
                                    ...editingService,
                                    bill_price: parseFloat(e.target.value),
                                })
                            }
                            placeholder="Bill Price"
                            className="w-full p-2 rounded bg-gray-700 text-white"
                        />
                        <input
                            type="number"
                            value={editingService.system_price}
                            onChange={(e) =>
                                setEditingService({
                                    ...editingService,
                                    system_price: parseFloat(e.target.value),
                                })
                            }
                            placeholder="System Price"
                            disabled={editingService.is_percentage}
                            className="w-full p-2 rounded bg-gray-700 text-white"
                        />
                        <div className="flex items-center space-x-2">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={editingService.is_separate_items}
                                    onChange={() =>
                                        setEditingService({
                                            ...editingService,
                                            is_separate_items: !editingService.is_separate_items,
                                        })
                                    }
                                    className="cursor-pointer"
                                />
                                Separate Items
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={editingService.is_percentage}
                                    onChange={() =>
                                        setEditingService({
                                            ...editingService,
                                            is_percentage: !editingService.is_percentage,
                                        })
                                    }
                                    className="cursor-pointer"
                                />
                                Percentage
                            </label>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => {
                                    setServices((prevServices) =>
                                        prevServices.map((s) =>
                                            s.id === editingService.id ? editingService : s
                                        )
                                    );
                                    setEditingService(null);
                                }}
                                className="px-4 py-2 bg-green-500 rounded hover:bg-green-400"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setEditingService(null)}
                                className="px-4 py-2 bg-gray-500 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingServiceId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-gray-800 p-6 rounded-lg space-y-4">
                        <h2 className="text-lg font-bold">Delete Service</h2>
                        <p>Are you sure you want to delete this service?</p>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handleDelete(deletingServiceId)}
                                className="px-4 py-2 bg-red-500 rounded hover:bg-red-400"
                            >
                                Yes, Delete
                            </button>
                            <button
                                onClick={() => setDeletingServiceId(null)}
                                className="px-4 py-2 bg-gray-500 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServicesList;

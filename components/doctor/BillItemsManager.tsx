import React, {useEffect, useState} from 'react';
import axios from "@/lib/axios";
import {DeleteIcon} from "@nextui-org/shared-icons";
import SearchableSelectOrCreate from "@/components/form/SearchableSelectOrCreate";

interface BillItem {
    id: number;
    service: { id: number; name: string };
    bill_amount: string;
    system_amount: string;
}

interface Option {
    label: string;
    value: string;
    extra?: string;
}

interface Props {
    billId: number;
    medicineTotal?: number;
}

const BillItemsManager: React.FC<Props> = ({billId, medicineTotal}) => {
    const [selectedService, setSelectedService] = useState<Option>();
    const [billItems, setBillItems] = useState<BillItem[]>([]);
    const [servicePrice, setServicePrice] = useState("");
    const [systemPrice, setSystemPrice] = useState("");
    const [resetTrigger, setResetTrigger] = useState(0);
    const [total, setTotal] = useState(0);
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
    const [error, setError] = useState("");

    // Fetch whenever billId or medicineTotal changes
    useEffect(() => {
        fetchBillItems();
    }, [billId, medicineTotal]);

    useEffect(() => {
        calculateTotal();
    }, [billItems]);

    const fetchBillItems = () => {
        axios
            .get(`bills/${billId}/bill-items`)
            .then(res => setBillItems(res.data))
            .catch(() => setBillItems([]))
    };

    const calculateTotal = () => {
        const total = billItems.reduce((acc, item) => {
            return acc + parseFloat(item.bill_amount) + parseFloat(item.system_amount);
        }, 0);
        setTotal(total);
    }

    const handleServiceChange = (option: Option) => {
        const [bill, system] = option.extra?.split('-') ?? ["", ""];
        setServicePrice(bill);
        setSystemPrice(system);
        setSelectedService(option);
    };

    const handleAdd = () => {
        setError("");
        if (!selectedService || !servicePrice) {
            setError("Please select a service and enter fee.");
            return;
        }

        const payload = {
            bill_id: billId,
            service_id: selectedService.value,
            service_name: selectedService.value === '-1' ? selectedService.label : null,
            bill_amount: servicePrice,
            system_amount: systemPrice,
        };

        axios
            .post("bill-items", payload)
            .then(res => {
                setBillItems(prev => [...prev, res.data]);
                setSelectedService(undefined);
                setServicePrice("");
                setSystemPrice("");
                setResetTrigger(prev => prev + 1);
            })
            .catch(err => {
                setError(err.response?.data?.message || "Error adding item.");
            });
    };

    const handleUpdateAmount = (
        itemId: number,
        value: string,
        key: 'bill_amount' | 'system_amount'
    ) => {
        setBillItems(prev =>
            prev.map(item => (item.id === itemId ? {...item, [key]: value} : item))
        );

        if (typingTimeout) clearTimeout(typingTimeout);
        const timeout = setTimeout(() => {
            axios.put(`bill-items/${itemId}`, {[key]: value}).catch(err =>
                console.error("Update failed", err)
            );
        }, 800);

        setTypingTimeout(timeout);
    };

    const handleDelete = (itemId: number) => {
        axios.delete(`bill-items/${itemId}`).then(() => {
            setBillItems(prev => prev.filter(item => item.id !== itemId));
        });
    };

    return (
        <div className="mt-4">
            <div className="grid grid-cols-5 gap-4 items-end mb-4">
                <div className="col-span-2">
                    <label className="block mb-2 text-left">Treatment:</label>
                    <SearchableSelectOrCreate
                        resetTrigger={resetTrigger}
                        apiUri="services"
                        onSelect={handleServiceChange}
                        onNotSelect={label => setSelectedService({label, value: "-1"})}
                        placeholder="Select treatment"
                        creatable
                    />
                </div>
                <div>
                    <label className="block mb-2 text-left">Fee:</label>
                    <input
                        type="text"
                        className="block w-full px-2 py-2 border border-gray-700 rounded bg-gray-800"
                        value={servicePrice}
                        onChange={e => setServicePrice(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block mb-2 text-left">Institution Fee:</label>
                    <input
                        type="text"
                        className="block w-full px-2 py-2 border border-gray-700 rounded bg-gray-800"
                        value={systemPrice}
                        onChange={e => setSystemPrice(e.target.value)}
                    />
                </div>
                <div>
                    <button
                        className="w-full py-2 bg-green-700 text-gray-200 rounded hover:bg-green-600"
                        onClick={handleAdd}
                    >
                        Add
                    </button>
                </div>
            </div>

            {error && <div className="text-red-500 mb-3">{error}</div>}
            <div className="relative overflow-x-auto sm:rounded-lg border border-gray-800">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="bg-gray-700">
                    <tr className="bg-gray-800">
                        <th className="px-4 py-2 text-left grow">Service</th>
                        <th className="px-4 py-2 text-left">Fee</th>
                        <th className="px-4 py-2 text-left">Institution Fee</th>
                        <th className="px-4 py-2 text-center">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {billItems.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center py-4 text-gray-400">
                                No items added yet
                            </td>
                        </tr>
                    ) : (
                        billItems.map(item => (
                            <tr key={item.id} className="border-t border-gray-800">
                                <td className="px-4 py-2 border-r border-gray-800">
                                    {item.service?.name || "Unnamed"}
                                </td>
                                <td className="p-1 border-r border-gray-800">
                                    <input
                                        type="text"
                                        className="w-28 block px-2 py-1 border border-gray-700 rounded bg-gray-800 focus:outline-none focus:border-blue-600"
                                        value={item.bill_amount}
                                        onChange={e =>
                                            handleUpdateAmount(item.id, e.target.value, 'bill_amount')
                                        }
                                    />
                                </td>
                                <td className="p-1 border-r border-gray-800">
                                    <input
                                        type="text"
                                        className="w-28 block px-2 py-1 border border-gray-700 rounded bg-gray-800 focus:outline-none focus:border-blue-600"
                                        value={item.system_amount}
                                        onChange={e =>
                                            handleUpdateAmount(item.id, e.target.value, 'system_amount')
                                        }
                                    />
                                </td>
                                <td className="px-4 py-2 text-center">
                                    <DeleteIcon
                                        className="mx-auto hover:text-red-500 cursor-pointer"
                                        onClick={() => handleDelete(item.id)}
                                    />
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
                <div className="p-4 border-t border-gray-800">
                    Total : {total ? total.toFixed(2) : 0.00}
                </div>
            </div>
        </div>
    );
};

export default BillItemsManager;

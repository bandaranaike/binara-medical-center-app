import React, {useEffect, useState} from "react";
import axios from "@/lib/axios";
import Loader from "@/components/form/Loader";

interface Booking {
    bill_amount: number;
    id: number;
    queue_number: number;
    patient_name: string;
    doctor_name: string;
    queue_date: string;
    bill_id: number | null; // Null indicates the bill is not yet created
}

const BookingList: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [showBooking, setShowBooking] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const handleShowBooking = (booking: Booking) => {
        setSelectedBooking(booking);
        setShowBooking(true);
    };

    const fetchQueues = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get("/bills/bookings");
            setBookings(response.data);
        } catch (err) {
            setError("Failed to load bookings. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleConvertBill = async (booking: Booking) => {
        if (booking.bill_id) {
            alert("Bill already created for this patient.");
            return;
        }

        try {
            setIsConverting(true);
            const response = await axios.patch("/bookings/convert-to-bill", {
                bill_id: booking.id,
            });

            if (response.status === 200) {
                // Update queue state with the newly created bill ID
                setBookings((prevQueues) =>
                    prevQueues.filter((q) =>
                        q.id !== booking.id
                    )
                );
                setSelectedBooking(null);
                setShowBooking(false);
                setIsConverting(false);
            }


        } catch (err) {
            alert("Failed to create bill. Please try again.");
        }
    };

    useEffect(() => {
        fetchQueues();
    }, []);

    return (
        <div className="rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Patient Bookings</h2>
            {loading ? (
                <p>Loading bookings...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : bookings.length > 0 ? (
                <div className="relative overflow-x-auto sm:rounded-lg border border-gray-800">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="font-bold">
                        <tr>
                            <th className="px-4 py-4 bg-gray-800">Booking Number</th>
                            <th className="px-4 py-4 bg-gray-800">Doctor Name</th>
                            <th className="px-4 py-4 bg-gray-800">Patient</th>
                            <th className="px-4 py-4 bg-gray-800">Amount</th>
                            <th className="px-4 py-4 bg-gray-800">Date</th>
                            <th className="px-4 py-4 bg-gray-800">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {bookings.map((queue, index) => (
                            <tr
                                key={queue.id}
                                className="border-t border-gray-800"
                            >
                                <td className="px-4 py-2 border-r border-gray-800">{queue.queue_number}</td>
                                <td className="px-4 py-2 border-r border-gray-800">{queue.doctor_name}</td>
                                <td className="px-4 py-2 border-r border-gray-800">
                                    {queue.patient_name}
                                </td>
                                <td className="px-4 py-2 border-r border-gray-800">{queue.bill_amount}</td>
                                <td className="px-4 py-2 border-r border-gray-800">{queue.queue_date}</td>
                                <td className="px-4 py-2">
                                    <button
                                        className="px-4 py-1 rounded bg-blue-800 text-white"
                                        onClick={() => handleShowBooking(queue)}
                                        disabled={!!queue.bill_id}
                                    >
                                        Create bill
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p>No bookings available.</p>
            )}

            {showBooking && (

                <div
                    className={`fixed inset-0 bg-opacity-60 bg-black flex justify-center items-center z-50 ${
                        showBooking ? "block" : "hidden"
                    }`}
                >
                    <div className="bg-gray-800 rounded-lg shadow-lg max-w-lg w-full pb-3">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Booking Details</h2>
                            <button
                                onClick={() => setShowBooking(false)}
                                className="text-gray-500 hover:text-gray-400"
                            > ✖
                            </button>
                        </div>

                        <div className="border roudned border-gray-800 p-4">

                            {showBooking && selectedBooking && (

                                <div className="border rounded border-gray-800">
                                    <p>
                                        <span className="font-semibold">Queue Number: </span>
                                        {selectedBooking.queue_number}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Patient Name: </span>
                                        {selectedBooking.patient_name}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Doctor Name: </span>
                                        {selectedBooking.doctor_name}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Amount: </span>
                                        {selectedBooking.bill_amount}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Date: </span>
                                        {selectedBooking.queue_date}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Bill Status: </span>
                                        {selectedBooking.bill_id ? "Created" : "Not Created"}
                                    </p>
                                    <div className="flex mt-4">
                                        <button className="px-4 py-1 rounded bg-blue-800 text-white px-3 py-2 mr-3"
                                                onClick={() => handleConvertBill(selectedBooking)}>
                                            Confirm the payment and create bill

                                        </button>
                                        <button className="px-4 py-1 rounded bg-gray-600 text-white px-3 py-2" onClick={() => setShowBooking(false)}>
                                            Cancel
                                        </button>
                                        {isConverting && (<div className="mx-3 mt-1"> <Loader/></div>)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>)}
        </div>
    );
};

export default BookingList;

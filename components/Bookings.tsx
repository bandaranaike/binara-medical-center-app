import React, {useEffect, useState} from "react";
import axios from "@/lib/axios";
import Loader from "@/components/form/Loader";
import DeleteConfirm from "@/components/popup/DeleteConfirm";

interface Booking {
    bill_amount: number;
    id: number;
    queue_number: number;
    patient_name: string;
    doctor_name: string;
    queue_date: string;
    bill_id: number | null; // Null indicates the bill is not yet created
}

const TAB_TODAY = "today";
const TAB_OLD = "old";

const BookingList: React.FC = () => {
    const [bookings, setBookings] = useState<{ [key: string]: Booking[] }>({[TAB_TODAY]: [], [TAB_OLD]: []});
    const [loading, setLoading] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"today" | "old">(TAB_TODAY);
    const [showBooking, setShowBooking] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const fetchBookingsByType = async (type: "today" | "old") => {
        setLoading(true);
        setError(null);
        try {
            const endpoint = type === TAB_TODAY ? "/bills/bookings" : "/bills/bookings/old";
            const response = await axios.get(endpoint);
            setBookings((prev) => ({...prev, [type]: response.data}));
        } catch {
            setError("Failed to load bookings. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleShowBooking = (booking: Booking) => {
        setSelectedBooking(booking);
        setShowBooking(true);
    };

    const handleConvertBill = async (booking: Booking) => {
        try {
            setIsConverting(true);
            const response = await axios.patch("/bookings/convert-to-bill", {
                bill_id: booking.id,
            });

            if (response.status === 200) {
                // Update queue state with the newly created bill ID
                setBookings((prevQueues) => ({
                    ...prevQueues,
                    [activeTab]: prevQueues[activeTab].filter((q) => q.id !== booking.id),
                }));
                setSelectedBooking(null);
                setShowBooking(false);
                setIsConverting(false);
            }


        } catch (err) {
            alert("Failed to create bill. Please try again.");
        }
    };

    useEffect(() => {
        fetchBookingsByType(TAB_TODAY);
    }, []);

    const handleTabChange = (type: "today" | "old") => {
        setActiveTab(type);
        if (bookings[type].length === 0) fetchBookingsByType(type);
    };

    const handleDeleteBooking = () => {
        setBookings((prevQueues) => ({
            ...prevQueues,
            [activeTab]: prevQueues[activeTab].filter((b) => b.id !== selectedBooking!.id),
        }));
    }

    const showDeleteConfirmation = (booking: Booking) => {
        setSelectedBooking(booking);
        setShowDeleteModal(true)
    };
    const BookingsTable: React.FC<{ bookings: Booking[]; isTodayTab: boolean }> = ({bookings, isTodayTab}) => (
        <div className="relative overflow-x-auto sm:rounded-lg border border-gray-800">
            <table className="w-full text-sm text-left text-gray-400">
                <thead className="font-bold">
                <tr className="bg-gray-800">
                    <th className="px-4 py-4">Booking Number</th>
                    <th className="px-4 py-4">Doctor Name</th>
                    <th className="px-4 py-4">Patient</th>
                    <th className="px-4 py-4">Amount</th>
                    <th className="px-4 py-4">Date</th>
                    <th className="px-4 py-4">Action</th>
                </tr>
                </thead>
                <tbody>
                {bookings.map((booking) => (
                    <tr key={booking.id} className="border-t border-gray-800">
                        <td className="px-4 py-2 border-r border-gray-800">{booking.queue_number}</td>
                        <td className="px-4 py-2 border-r border-gray-800">{booking.doctor_name ?? 'No doctor assigned'}</td>
                        <td className="px-4 py-2 border-r border-gray-800">{booking.patient_name}</td>
                        <td className="px-4 py-2 border-r border-gray-800">{booking.bill_amount}</td>
                        <td className="px-4 py-2 border-r border-gray-800">{booking.queue_date}</td>
                        <td className="px-4 py-2">
                            {isTodayTab && (
                                <button
                                    className="px-4 py-1 rounded bg-blue-800 text-white"
                                    onClick={() => handleShowBooking(booking)}
                                    disabled={!!booking.bill_id}
                                > Create Bill </button>
                            ) || (<button
                                className="px-4 py-1 rounded bg-red-800 text-white"
                                onClick={() => showDeleteConfirmation(booking)}
                                disabled={!!booking.bill_id}
                            > Delete </button>)}
                        </td>
                    </tr>
                ))}
                </tbody>

            </table>
        </div>
    );

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    return (
        <div className="rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Patient Bookings</h2>
            <div className="flex mb-6 border-b border-gray-700">
                <button
                    className={`px-4 py-2 ${
                        activeTab === TAB_TODAY ? "bg-transparent text-blue-500 border-b-2 border-blue-700" : "bg-transparent text-gray-400"
                    }`}
                    onClick={() => handleTabChange(TAB_TODAY)}
                >
                    Today&apos;s Bookings
                </button>
                <button
                    className={`px-4 py-2 ${
                        activeTab === TAB_OLD ? "bg-transparent text-blue-500 border-b-2 border-blue-700" : "bg-transparent text-gray-400"
                    }`}
                    onClick={() => handleTabChange(TAB_OLD)}
                >
                    Old Bookings
                </button>
            </div>
            {loading ? (
                <p>Loading bookings...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : bookings[activeTab].length > 0 ? (
                <BookingsTable bookings={bookings[activeTab]} isTodayTab={activeTab === TAB_TODAY}/>
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
                                        {selectedBooking.doctor_name ?? 'No doctor assigned.'}
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
                                        {isConverting && (<div className="mx-3 mt-1"><Loader/></div>)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>)}

            {showDeleteModal && (
                <DeleteConfirm
                    deleteApiUrl="bills"
                    onClose={() => setShowDeleteModal(false)}
                    onDeleteSuccess={() => handleDeleteBooking()}
                    deleteId={selectedBooking!.id}
                >Are you sure you want to delete this booking?</DeleteConfirm>
            )}
        </div>
    );
};

export default BookingList;

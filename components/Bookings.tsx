import React, {useEffect, useState} from "react";
import axios from "@/lib/axios";
import DeleteConfirm from "@/components/popup/DeleteConfirm";
import BookingsTable from "@/components/BookingsTable";
import {Booking} from "@/types/interfaces";
import ShowBillAndPrint from "@/components/popup/ShowBillAndPrint";

const TAB_TODAY = "today";
const TAB_OLD = "old";

const BookingList: React.FC = () => {
    const [bookings, setBookings] = useState<{ [key: string]: Booking[] }>({[TAB_TODAY]: [], [TAB_OLD]: []});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"today" | "old">(TAB_TODAY);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showBooking, setShowBooking] = useState(false);

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
            {loading ? (<p>Loading bookings...</p>) : error ? (<p className="text-red-500">{error}</p>) : bookings[activeTab].length > 0 ? (
                <BookingsTable bookings={bookings[activeTab]} isTodayTab={activeTab === TAB_TODAY} handleShowBooking={handleShowBooking}
                               showDeleteConfirmation={showDeleteConfirmation}/>
            ) : (<p>No bookings available.</p>)}

            {showBooking &&
                <ShowBillAndPrint
                    selectedBooking={selectedBooking}
                    onRemoveSelectedBooking={() => setSelectedBooking(null)}
                    onConverted={() => fetchBookingsByType(activeTab)}
                    status="doctor"
                    onCloseBooking={() => setShowBooking(false)}/>
            }

            {showDeleteModal && (
                <DeleteConfirm
                    deleteApiUrl="bills"
                    onClose={() => setShowDeleteModal(false)}
                    onDeleteSuccess={() => handleDeleteBooking()}
                    deleteId={selectedBooking!.uuid}
                >Are you sure you want to delete this medicine?</DeleteConfirm>
            )}
        </div>
    );
};

export default BookingList;

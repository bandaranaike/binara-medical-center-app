import React, {useEffect, useState} from "react";
import axios from "@/lib/axios";
import DeleteConfirm from "@/components/popup/DeleteConfirm";
import BookingsTable from "@/components/BookingsTable";
import {Booking} from "@/types/interfaces";
import ShowBillAndPrint from "@/components/popup/ShowBillAndPrint";

// Centralized Tab Definitions
const TABS = [
    {key: "today", label: "Today's Bookings", endpoint: "/bills/bookings/today"},
    {key: "future", label: "Future Bookings", endpoint: "/bills/bookings/future"},
    {key: "old", label: "Old Bookings", endpoint: "/bills/bookings/old"},
] as const;

type TabKey = typeof TABS[number]["key"];

const BookingList: React.FC = () => {
    const [bookings, setBookings] = useState<Record<TabKey, Booking[]>>({
        today: [],
        future: [],
        old: [],
    });

    const [activeTab, setActiveTab] = useState<TabKey>("today");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showBooking, setShowBooking] = useState(false);

    const fetchBookingsByType = async (tabKey: TabKey) => {
        const tab = TABS.find(t => t.key === tabKey);
        if (!tab) return;

        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(tab.endpoint);
            setBookings(prev => ({...prev, [tabKey]: response.data}));
        } catch {
            setError("Failed to load bookings. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookingsByType("today");
    }, []);

    const handleTabChange = (tabKey: TabKey) => {
        setActiveTab(tabKey);
        fetchBookingsByType(tabKey);
    };

    const handleShowBooking = (booking: Booking) => {
        setSelectedBooking(booking);
        setShowBooking(true);
    };

    const handleDeleteBooking = () => {
        setBookings(prev => ({
            ...prev,
            [activeTab]: prev[activeTab].filter(b => b.id !== selectedBooking!.id),
        }));
    };

    const showDeleteConfirmation = (booking: Booking) => {
        setSelectedBooking(booking);
        setShowDeleteModal(true);
    };

    return (
        <div className="rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Patient Bookings</h2>

            <div className="flex mb-6 border-b border-gray-700">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        className={`px-4 py-2 transition-colors ${
                            activeTab === tab.key
                                ? "text-blue-500 border-b-2 border-blue-700"
                                : "text-gray-400"
                        }`}
                        onClick={() => handleTabChange(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <p>Loading bookings...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : bookings[activeTab].length > 0 ? (
                <BookingsTable
                    bookings={bookings[activeTab]}
                    isTodayTab={activeTab === "today"}
                    handleShowBooking={handleShowBooking}
                    showDeleteConfirmation={showDeleteConfirmation}
                />
            ) : (
                <p>No bookings available.</p>
            )}

            {showBooking && (
                <ShowBillAndPrint
                    selectedBooking={selectedBooking}
                    onRemoveSelectedBooking={() => setSelectedBooking(null)}
                    onConverted={() => fetchBookingsByType(activeTab)}
                    status="doctor"
                    onCloseBooking={() => setShowBooking(false)}
                />
            )}

            {showDeleteModal && (
                <DeleteConfirm
                    deleteApiUrl="bills"
                    onClose={() => setShowDeleteModal(false)}
                    onDeleteSuccess={handleDeleteBooking}
                    deleteId={selectedBooking!.uuid}
                >
                    Are you sure you want to delete this booking?
                </DeleteConfirm>
            )}
        </div>
    );
};

export default BookingList;

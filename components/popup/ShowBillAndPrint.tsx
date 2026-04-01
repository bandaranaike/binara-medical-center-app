import React, {FC, useState} from "react";
import {Booking} from "@/types/interfaces";
import axios from "@/lib/axios";
import printService, {PrintRequest} from "@/lib/printService";
import Loader from "@/components/form/Loader";
import CustomCheckbox from "@/components/form/CustomCheckbox";


interface ShowBillAndPrintProps {
    selectedBooking: Booking | null
    onRemoveSelectedBooking: () => void
    onCloseBooking: () => void
    onConverted: (booking_id: number) => void
    status: string
}

const ShowBillAndPrint: FC<ShowBillAndPrintProps> = ({
                                                         selectedBooking,
                                                         onRemoveSelectedBooking,
                                                         onCloseBooking,
                                                         onConverted,
                                                         status
                                                     }) => {

    const [isConverting, setIsConverting] = useState(false);
    const [printingError, setPrintingError] = useState("");
    const [printBill, setPrintBill] = useState<boolean>(true)
    const handleConvertBill = async (booking: Booking) => {
        try {
            setPrintingError("");
            setIsConverting(true);
            const response = await axios.put(`/bills/${booking.id}/status`, {
                status: status
            });
            if (response.status === 200) {

                onConverted(booking.id)

                if (printBill) {
                    const data = response.data;
                    const printData: PrintRequest = {
                        bill_id: booking.id,
                        customer_name: data.patient_name,
                        doctor_name: data.doctor_name,
                        items: data.bill_items,
                        total: data.total,
                        bill_reference: data.bill_reference,
                        payment_type: data.payment_type
                    };
                    try {
                        await printService.sendPrintRequest(printData);
                        onRemoveSelectedBooking();
                        onCloseBooking();
                    } catch (e: any) {
                        setPrintingError(`Bill printing error: ${e.message}`)
                    }
                } else {
                    onRemoveSelectedBooking();
                    onCloseBooking();
                }
                setIsConverting(false);
            } else {
                setPrintingError("Bill creation was not successful")
                console.error(response)
            }

        } catch (err) {
            console.error("Failed to create bill. Please try again.");
        }
    };
    return <div>

        <div className={`fixed inset-0 bg-opacity-60 bg-black flex justify-center items-center z-50`}>
            <div className="w-full max-w-2xl rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] pb-3 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-4">
                    <h2 className="text-xl font-bold text-[var(--foreground)]">Appointment Details</h2>
                    <button
                        onClick={() => onCloseBooking()}
                        className="text-[var(--foreground-muted)] transition hover:text-[var(--foreground)]"
                    > ✖
                    </button>
                </div>

                <div className="p-4">


                    {selectedBooking && (

                        <div className="rounded-[0.9rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4 text-sm text-[var(--foreground)]">
                            <p className='pb-1'>
                                <span className="text-[var(--foreground-muted)]">Queue Number: </span>
                                <span className='font-semibold text-emerald-500'>{selectedBooking.queue_number}</span>
                            </p>
                            <p className='pb-1'>
                                <span className="text-[var(--foreground-muted)]">Patient Name: </span>
                                <span className='font-semibold text-emerald-500'>{selectedBooking.patient_name}</span>
                            </p>
                            <p className='pb-1'>
                                <span className="text-[var(--foreground-muted)]">Doctor Name: </span>
                                <span
                                    className='font-semibold text-emerald-500'>{selectedBooking.doctor_name ?? 'No doctor assigned.'}</span>
                            </p>
                            <p className='pb-1'>
                                <span className="text-[var(--foreground-muted)]">Appointment Type: </span>
                                <span className='font-semibold text-emerald-500'>{selectedBooking.appointment_type}</span>
                            </p>
                            <p className='pb-1'>
                                <span className="text-[var(--foreground-muted)]">Amount: </span>
                                <span className='font-semibold text-emerald-500'>
                                    {(Number(selectedBooking.bill_amount) + Number(selectedBooking.system_amount)).toFixed(2)}
                                </span>
                            </p>
                            <p className='pb-1'>
                                <span className="text-[var(--foreground-muted)]">Date: </span>
                                <span className='font-semibold text-emerald-500'>{selectedBooking.queue_date}</span>
                            </p>
                            <p className='pb-1'>
                                <span className="text-[var(--foreground-muted)]">Payment Type: </span>
                                <span className='font-semibold text-emerald-500'>{selectedBooking.payment_type}</span>
                            </p>
                            <p className='pb-1'>
                                <span className="text-[var(--foreground-muted)]">Payment Status: </span>
                                <span className='font-semibold text-emerald-500'>{selectedBooking.payment_status}</span>
                            </p>
                            <p className='pb-1'>
                                <span className="text-[var(--foreground-muted)]">Bill Status: </span>
                                <span
                                    className='font-semibold text-emerald-500'>{selectedBooking.bill_id ? "Created" : "Not Created"}</span>
                            </p>
                            {printingError && <div className="text-red-500 my-3">{printingError}</div>}
                            <div className="flex gap-3 mt-4 items-center justify-end">
                                {isConverting && (<div className="mx-3 mt-1"><Loader/></div>)}
                                <CustomCheckbox setChecked={setPrintBill} checked={printBill} label="Print bill"/>
                                <button
                                    className="app-button-primary px-3 py-2 text-sm"
                                    onClick={() => handleConvertBill(selectedBooking)}
                                >
                                    {selectedBooking.status == "done" ? "Print the bill" : (status == "done" ? (printBill ? "Mark as done and Print Bill" : "Mark as done") : "Confirm the payment and create bill")}
                                </button>
                                <button className="app-button-secondary px-3 py-2 text-sm"
                                        onClick={() => onCloseBooking()}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
}

export default ShowBillAndPrint;

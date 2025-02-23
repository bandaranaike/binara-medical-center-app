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

const ShowBillAndPrint: FC<ShowBillAndPrintProps> = ({selectedBooking, onRemoveSelectedBooking, onCloseBooking, onConverted, status}) => {

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
            <div className="bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full pb-3">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Appointment Details</h2>
                    <button
                        onClick={() => onCloseBooking()}
                        className="text-gray-500 hover:text-gray-400"
                    > ✖
                    </button>
                </div>

                <div className="border roudned border-gray-800 p-4">


                    {selectedBooking && (

                        <div className="border rounded border-gray-800">
                            <p className='pb-1'>
                                <span>Queue Number: </span>
                                <span className='text-green-500 font-semibold'>{selectedBooking.queue_number}</span>
                            </p>
                            <p className='pb-1'>
                                <span>Patient Name: </span>
                                <span className='text-green-500 font-semibold'>{selectedBooking.patient_name}</span>
                            </p>
                            <p className='pb-1'>
                                <span>Doctor Name: </span>
                                <span className='text-green-500 font-semibold'>{selectedBooking.doctor_name ?? 'No doctor assigned.'}</span>
                            </p>
                            <p className='pb-1'>
                                <span>Appointment Type: </span>
                                <span className='text-green-500 font-semibold'>{selectedBooking.appointment_type}</span>
                            </p>
                            <p className='pb-1'>
                                <span>Amount: </span>
                                <span className='text-green-500 font-semibold'>
                                    {(Number(selectedBooking.bill_amount) + Number(selectedBooking.system_amount)).toFixed(2)}
                                </span>
                            </p>
                            <p className='pb-1'>
                                <span>Date: </span>
                                <span className='text-green-500 font-semibold'>{selectedBooking.queue_date}</span>
                            </p>
                            <p className='pb-1'>
                                <span>Payment Type: </span>
                                <span className='text-green-500 font-semibold'>{selectedBooking.payment_type}</span>
                            </p>
                            <p className='pb-1'>
                                <span>Payment Status: </span>
                                <span className='text-green-500 font-semibold'>{selectedBooking.payment_status}</span>
                            </p>
                            <p className='pb-1'>
                                <span>Bill Status: </span>
                                <span className='text-green-500 font-semibold'>{selectedBooking.bill_id ? "Created" : "Not Created"}</span>
                            </p>
                            {printingError && <div className="text-red-500 my-3">{printingError}</div>}
                            <div className="flex gap-3 mt-4 items-center justify-end">
                                {isConverting && (<div className="mx-3 mt-1"><Loader/></div>)}
                                <CustomCheckbox setChecked={setPrintBill} checked={printBill} label="Print bill"/>
                                <button
                                    className="rounded bg-blue-800 text-white px-3 py-2"
                                    onClick={() => handleConvertBill(selectedBooking)}
                                >
                                    {selectedBooking.status == "done" ? "Print the bill" : (status == "done" ? "Mark as done" : "Confirm the payment and create bill")}
                                </button>
                                <button className="rounded bg-gray-600 text-white px-3 py-2" onClick={() => onCloseBooking()}>
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
import axios from "@/lib/axios";
import printService from "@/lib/printService";
import React, {useState} from "react";
import {format, subDays} from 'date-fns';

const ExportSummaryReport = () => {

    const [dateRange, setDateRange] = useState({
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
    });
    const generateReport = async () => {
        try {
            // Step 1: Get report data from Laravel backend
            const reportResponse = await axios.get('/reports/services-with-positive-system-amount', {
                params: {
                    start_date: dateRange.startDate,
                    end_date: dateRange.endDate,
                },
            });

            const reportData = reportResponse.data;

            // Step 2: Send data to the local Python printer app using printService
            try {
                await printService.sendPrintSummaryRequest(reportData);
            } catch (e: any) {
                console.error('Print error:', e);
                console.log(`Printing error: ${e.message}`);
            }
        } catch (error: any) {
            console.error('Fetch error:', error);
            console.log(`Error: ${error.response?.data?.detail || error.message}`);
        }
    };

    return (
        <div>
            <button onClick={generateReport}
                    className='px-4 py-2 bg-blue-100 rounded text-blue-700 hover:bg-blue-200 dark:bg-blue-700 dark:text-blue-100 dark:hover:bg-blue-800'>Export
            </button>
        </div>
    );
}


export default ExportSummaryReport;
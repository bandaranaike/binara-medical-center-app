import React, {useEffect, useState} from "react";
import axios from "@/lib/axios";
import TotalRevenue from "@/components/reports/TotalRevenue";
import RevenueByDoctor from "@/components/reports/RevenueByDoctor";
import BillSummary from "@/components/reports/BillSummary";
import DailyReportSummary from "@/components/reports/DailyReportSummary";
import {DateRangePicker, RangeValue, DateValue} from "@nextui-org/react";
import dayjs from "dayjs";

import {BillSummaryData, DailyReportSummaryData, RevenueByDoctorData, TotalRevenueData} from "@/types/report-interfaces";
import {backgroundColor} from "html2canvas/dist/types/css/property-descriptors/background-color";

interface DateRange {
    startDate: string | null;
    endDate: string | null;
}

const DaySummary = () => {
    const [billStatusSummary, setBillStatusSummary] = useState<BillSummaryData | undefined>();
    const [dailyReportSummary, setDailyReportSummary] = useState<DailyReportSummaryData | undefined>();
    const [revenueByDoctor, setRevenueByDoctor] = useState<RevenueByDoctorData[] | undefined>();
    const [totalRevenue, setTotalRevenue] = useState<TotalRevenueData | undefined>();
    const [startDate, setStartDate] = useState<string | null>();
    const [endDate, setEndDate] = useState<string | null>();

    let isDataLoaded = false;
    const fetchData = async () => {
        try {
            const response = await axios.get("reports", {data: {startDate, endDate}});
            const {
                billStatusSummary,
                dailyReportSummary,
                revenueByDoctor,
                totalRevenue,
            } = response.data;

            setBillStatusSummary(billStatusSummary);
            setDailyReportSummary(dailyReportSummary);
            setRevenueByDoctor(revenueByDoctor);
            setTotalRevenue(totalRevenue);
            isDataLoaded = true;
        } catch (error) {
            console.error("Failed to fetch reports data:", error);
        }
    };

    useEffect(() => {
        return () => {
            if (!isDataLoaded) fetchData();
        };
    }, [startDate, endDate]);

    // // Fetch data from the API on component mount
    // useEffect(() => {
    //     return () => {
    //         if (!isDataLoaded) fetchData();
    //     };
    // }, []); // Empty dependency array ensures this runs on component mount

    const handleDateChange = (value: RangeValue<DateValue> | null) => {
        const formattedStartDate = value?.start ? dayjs(value.start.toDate('Asia/Colombo')).format("YYYY-MM-DD") : null;
        const formattedEndDate = value?.end ? dayjs(value.end.toDate('Asia/Colombo')).format("YYYY-MM-DD") : null;
        setStartDate(formattedStartDate);
        setEndDate(formattedEndDate);
    };

    return (
        <div>
            <div className="flex justify-between">
                <div>
                    <h2 className="font-semibold text-xl">Day Summary Component</h2>
                    <p className="mb-8">
                        This dashboard provides a concise and visually appealing summary of the day&apos;s performance and
                        trends.
                    </p>
                </div>
                <div className="flex flex-col gap-4">
                    <DateRangePicker className="bg-transparent" onChange={handleDateChange}/>
                </div>
            </div>
            <div className="grid grid-cols-6 gap-3">
                <div className="col-span-4">
                    <DailyReportSummary data={dailyReportSummary}/>
                </div>
                <div className="col-span-2">
                    <TotalRevenue data={totalRevenue}/>
                </div>
            </div>
            <div className="grid grid-cols-6 gap-3">
                <div className="col-span-2 border border-gray-700 rounded-lg p-4">
                    <BillSummary data={billStatusSummary}/>
                </div>
                <div className="col-span-4 border border-gray-700 rounded-lg p-4">
                    <RevenueByDoctor data={revenueByDoctor}/>
                </div>
            </div>
        </div>
    );
};

export default DaySummary;
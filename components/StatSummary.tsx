import React, {useCallback , useEffect, useState} from "react";
import axios from "@/lib/axios";
import TotalRevenue from "@/components/reports/TotalRevenue";
import RevenueByDoctor from "@/components/reports/RevenueByDoctor";
import BillSummary from "@/components/reports/BillSummary";
import DailyReportSummary from "@/components/reports/DailyReportSummary";
import {DateRangePicker, DateValue, RangeValue} from "@nextui-org/react";
import dayjs from "dayjs";

import {BillSummaryData, DailyReportSummaryData, RevenueByDoctorData, TotalRevenueData} from "@/types/report-interfaces";
import debounce from "lodash.debounce";

const StatSummary = () => {
    const [billStatusSummary, setBillStatusSummary] = useState<BillSummaryData | undefined>();
    const [dailyReportSummary, setDailyReportSummary] = useState<DailyReportSummaryData | undefined>();
    const [revenueByDoctor, setRevenueByDoctor] = useState<RevenueByDoctorData[] | undefined>();
    const [totalRevenue, setTotalRevenue] = useState<TotalRevenueData | undefined>();
    const [startDate, setStartDate] = useState<string | null>();
    const [endDate, setEndDate] = useState<string | null>();

    const fetchData = useCallback(
        debounce(async (start: string | null = null, end: string | null = null) => {
            try {
                const response = await axios.get("reports", { params: { startDate: start, endDate: end } });
                const { billStatusSummary, dailyReportSummary, revenueByDoctor, totalRevenue } = response.data;

                setBillStatusSummary(billStatusSummary);
                setDailyReportSummary(dailyReportSummary);
                setRevenueByDoctor(revenueByDoctor);
                setTotalRevenue(totalRevenue);
            } catch (error) {
                console.error("Failed to fetch reports data:", error);
            }
        }, 300), // Adjust debounce delay as needed
        []
    );

    useEffect(() => {
        fetchData();
        return () => {
            fetchData.cancel();
        };
    }, [fetchData]);

    const handleDateChange = (value: RangeValue<DateValue> | null) => {
        const formattedStartDate = value?.start ? dayjs(value.start.toDate('Asia/Colombo')).format("YYYY-MM-DD") : null;
        const formattedEndDate = value?.end ? dayjs(value.end.toDate('Asia/Colombo')).format("YYYY-MM-DD") : null;
        setStartDate(formattedStartDate);
        setEndDate(formattedEndDate);
        fetchData(formattedStartDate, formattedEndDate);
    };

    return (
        <div>
            <div className="flex justify-between">
                <div>
                    <h2 className="font-semibold text-xl mb-3">Stat Summary
                        <div className="text-stone-500 text-sm">
                            For {(startDate && endDate) && <span>{startDate} - {endDate}</span> || "today"}
                        </div>
                    </h2>
                    <p className="mb-8">
                        This dashboard provides a concise and visually appealing summary of performance and trends for the selected date range
                    </p>
                </div>
                <div className="flex flex-col gap-4">
                    <DateRangePicker visibleMonths={2} className="bg-transparent" onChange={handleDateChange}/>
                </div>
            </div>
            <div className="grid grid-cols-6 gap-3">
                <div className="col-span-2">
                    <DailyReportSummary data={dailyReportSummary}/>
                </div>
                <div className="col-span-4">
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

export default StatSummary;
import {useEffect, useState} from "react";
import axios from "@/lib/axios";
import TotalRevenue from "@/components/reports/TotalRevenue";
import RevenueByDoctor from "@/components/reports/RevenueByDoctor";
import BillSummary from "@/components/reports/BillSummary";
import DailyReportSummary from "@/components/reports/DailyReportSummary";
import {BillSummaryData, DailyReportSummaryData, dailyReportSummaryProps, RevenueByDoctorData, TotalRevenueData, TotalRevenueProps} from "@/types/report-interfaces";


const DaySummary = () => {
    const [totalRevenue, setTotalRevenue] = useState<TotalRevenueData | undefined>();
    const [revenueByDoctor, setRevenueByDoctor] = useState<RevenueByDoctorData[] | undefined>();
    const [billStatusSummary, setBillStatusSummary] = useState<BillSummaryData | undefined>();
    const [dailyReportSummary, setDailyReportSummary] = useState<DailyReportSummaryData | undefined>();

    // Fetch data from the API on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("reports");
                const {
                    totalRevenue,
                    revenueByDoctor,
                    billStatusSummary,
                    dailyReportSummary,
                } = response.data;

                setTotalRevenue(totalRevenue);
                setRevenueByDoctor(revenueByDoctor);
                setBillStatusSummary(billStatusSummary);
                setDailyReportSummary(dailyReportSummary);
            } catch (error) {
                console.error("Failed to fetch reports data:", error);
            }
        };

        fetchData();
    }, []); // Empty dependency array ensures this runs on component mount

    return (
        <div>
            <h2 className="font-semibold text-xl">Day Summary Component</h2>
            <p className="mb-8">
                This dashboard provides a concise and visually appealing summary of the day&apos;s performance
                trends.
            </p>

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
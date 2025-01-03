import TotalRevenue from "@/components/reports/TotalRevenue";
import RevenueByDoctor from "@/components/reports/RevenueByDoctor";
import OutstandingBills from "@/components/reports/OutstandingBills";
import BillSummary from "@/components/reports/BillSummary";
import DailyReportSummary from "@/components/reports/DailyReportSummary";

const DaySummary = () => {
    return (
        <div>
            <h2 className="font-semibold text-xl">Day Summary Component</h2>
            <p className="mb-8">This dashboard provides a concise and visually appealing summary of the day&apos;s performance.
                trends</p>

            <div className="grid grid-cols-6 gap-3">
                <div className="col-span-4"><DailyReportSummary/></div>
                <div className="col-span-2"><TotalRevenue/></div>
            </div>
            <div className="grid grid-cols-6 gap-3">
                <div className="col-span-2 border border-gray-700 rounded-lg p-4"><BillSummary/></div>
                <div className="col-span-4 border border-gray-700 rounded-lg p-4"><RevenueByDoctor/></div>
            </div>
        </div>
    );
};

export default DaySummary;

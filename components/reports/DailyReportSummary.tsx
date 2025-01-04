import {dailyReportSummaryProps} from "@/types/report-interfaces";
import React from "react";
import Loader from "@/components/form/Loader";

const DailyReportSummary: React.FC<dailyReportSummaryProps> = ({data}) => {

    return (
        data && (<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="card p-4 text-center shadow-md border border-gray-700 rounded-lg">
                <h3 className="font-semibold">New Patients</h3>
                <p className="text-3xl font-bold text-blue-400">{data.newPatients}</p>
            </div>
            <div className="card p-4 text-center shadow-md border border-gray-700 rounded-lg">
                <h3 className="font-semibold">Updated Patients</h3>
                <p className="text-3xl font-bold text-green-400">{data.updatedPatients}</p>
            </div>
            <div className="card p-4 text-center shadow-md border border-gray-700 rounded-lg">
                <h3 className="font-semibold">Visited Doctors</h3>
                <p className="text-3xl font-bold text-yellow-400">{data.visitedDoctors}</p>
            </div>
        </div>) || <Loader/>
    );
};

export default DailyReportSummary;

import React, {useEffect, useState} from "react";
import axios from "@/lib/axios";

const DailyReportSummary: React.FC = () => {
    const [reportData, setReportData] = useState({
        newPatients: 0,
        updatedPatients: 0,
        visitedDoctors: 0,
    });

    useEffect(() => {
        axios.get("/reports/daily-report-summary").then((response) => {
            setReportData(response.data);
        });
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="card p-4 text-center shadow-md border border-gray-700 rounded-lg">
                <h3 className="font-semibold">New Patients</h3>
                <p className="text-3xl font-bold text-blue-400">{reportData.newPatients}</p>
            </div>
            <div className="card p-4 text-center shadow-md border border-gray-700 rounded-lg">
                <h3 className="font-semibold">Updated Patients</h3>
                <p className="text-3xl font-bold text-green-400">{reportData.updatedPatients}</p>
            </div>
            <div className="card p-4 text-center shadow-md border border-gray-700 rounded-lg">
                <h3 className="font-semibold">Visited Doctors</h3>
                <p className="text-3xl font-bold text-yellow-400">{reportData.visitedDoctors}</p>
            </div>
        </div>
    );
};

export default DailyReportSummary;

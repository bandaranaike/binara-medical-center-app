import React, {useEffect, useState} from "react";
import BaseChart from "./BaseChart";
import axios from "@/lib/axios";
import {ApexOptions} from "apexcharts";

const BillSummary: React.FC = () => {
    const [statusData, setStatusData] = useState<{ status: string; count: number }[]>([]);
    const [count, setCount] = useState<number>(0);

    useEffect(() => {
        axios.get("/reports/bill-status-summary").then((response) => {
            setStatusData(response.data.statuses);
            setCount(response.data.count);
        });
    }, []);

    // Extract labels and data for the chart
    const labels = statusData.map((item) => item.status);
    const series = statusData.map((item) => item.count);

    const chartOptions: ApexOptions = {
        chart: {
            type: "pie",
            background: "transparent", // Transparent background
        },
        theme: {
            palette: 'palate3'
        },
        labels: labels,
        colors: [
            "#F87171", // Red 400
            "#FACC15", // Yellow 400
            "#4ADE80", // Green 400
            "#60A5FA", // Blue 400
            "#818CF8", // Indigo 400
            "#A78BFA", // Purple 400
            "#F472B6", // Pink 400
            "#2DD4BF", // Teal 400
            "#22D3EE", // Cyan 400
            "#9CA3AF"  // Gray 400
        ],
        legend: {
            position: "bottom",
        },
        stroke: {
            width: 0, // Removes the borders between pie segments
        },
        responsive: [
            {
                breakpoint: 480,
                options: {
                    chart: {
                        width: 300,
                    },
                    legend: {
                        position: "bottom",
                    },
                },
            },
        ],
    };

    return (
        <div className="card">
            <h3 className="text-lg font-semibold">Bill Status Summary</h3>
            <p className="mb-4 text-gray-400">{count} bills</p>
            <BaseChart options={chartOptions} series={series} type="pie"/>
        </div>
    );
};

export default BillSummary;

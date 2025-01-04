import React from "react";
import BaseChart from "./BaseChart";
import {ApexOptions} from "apexcharts";
import Loader from "@/components/form/Loader";
import {BillSummaryProps} from "@/types/report-interfaces";

const BillSummary: React.FC<BillSummaryProps> = ({data}) => {

    let labels: string[] = [];
    let series: number[] = [];
    let chartOptions: ApexOptions = {};

    if (data) {
        // Extract labels and data for the chart
        labels = data.statusData.map((item) => item.status);
        series = data.statusData.map((item) => item.count);

        chartOptions = {
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
    }
    return (data && (
        <div className="card">
            <h3 className="text-lg font-semibold">Bill Status Summary</h3>
            <p className="mb-4 text-gray-400">{data.count} bills</p>
            <BaseChart options={chartOptions} series={series} type="pie"/>
        </div>
    )) || <Loader/>;
};

export default BillSummary;

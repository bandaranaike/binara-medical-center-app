import React from "react";
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), {ssr: false});

interface BaseChartProps {
    options: ApexCharts.ApexOptions;
    series: ApexAxisChartSeries | ApexNonAxisChartSeries;
    type: "line" | "bar" | "pie" | "donut" | "area" | "radar" | "scatter";
    height?: number;
    width?: number;
}

const defaultOptions: ApexCharts.ApexOptions = {
    grid: {row: {opacity: 0.5}},
    chart: {background: 'transparent'},
    theme: {mode: 'dark', palette: 'palette3'},
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
        "#9CA3AF",  // Gray 400
        "#F79D8A",
        "#F9C27B",
        "#D0E8B7",
        "#9DC8E8",
        "#72A6F1",
        "#5E81F4",
        "#8A63C1",
        "#B48EDC",
        "#D4B5F8",
        "#F4C7F8"
    ],
}


const BaseChart: React.FC<BaseChartProps> = ({options, series, type, height = 350, width = "100%"}) => {
    return <Chart options={{...options, ...defaultOptions,}} series={series} type={type} height={height} width={width}/>;
};

export default BaseChart;

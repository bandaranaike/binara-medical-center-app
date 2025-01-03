import React, {useEffect, useState} from "react";
import BaseChart from "./BaseChart";
import axios from "@/lib/axios";
import {ApexOptions} from "apexcharts";

const RevenueByDoctor: React.FC = () => {
    const [data, setData] = useState<{ doctorName: string; revenue: number }[]>([]);

    useEffect(() => {
        axios.get("/reports/revenue-by-doctor").then((response) => {
            setData(response.data);
        });
    }, []);

    const chartOptions: ApexOptions = {
        chart: {type: "bar"},
        xaxis: {categories: data.map((d) => d.doctorName)},
        plotOptions: {
            bar: {
                distributed: true, // Distributes colors to each bar
            },
        },
    };

    const chartSeries = [{name: "Revenue", data: data.map((d) => d.revenue)}];

    return <BaseChart options={chartOptions} series={chartSeries} type="bar"/>;
};

export default RevenueByDoctor;

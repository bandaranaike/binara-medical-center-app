import React, {useEffect, useState} from "react";
import BaseChart from "./BaseChart";
import axios from "@/lib/axios";
import {ApexOptions} from "apexcharts";
import Loader from "@/components/form/Loader";
import {RevenueByDoctorProps} from "@/types/report-interfaces";


const RevenueByDoctor: React.FC<RevenueByDoctorProps> = ({data}) => {

    let chartOptions: ApexOptions = {};
    let chartSeries: any = [];

    if (data) {
        chartOptions = {
            chart: {type: "bar"},
            xaxis: {categories: data.map((d) => d.doctorName)},
            plotOptions: {
                bar: {
                    distributed: true, // Distributes colors to each bar
                },
            },
        };

        chartSeries = [{name: "Revenue", data: data.map((d) => d.revenue)}];
    }

    return data && <BaseChart options={chartOptions} series={chartSeries} type="bar"/> || <Loader/>;
};

export default RevenueByDoctor;

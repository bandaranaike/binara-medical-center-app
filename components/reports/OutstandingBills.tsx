import React, {useEffect, useState} from "react";
import BaseChart from "./BaseChart";
import axios from "@/lib/axios";

const OutstandingBills: React.FC = () => {
    const [outstanding, setOutstanding] = useState<number>(0);
    const [finalized, setFinalized] = useState<number>(0);

    useEffect(() => {
        axios.get("/reports/outstanding-bills").then((response) => {
            setOutstanding(response.data.outstanding);
            setFinalized(response.data.finalized);
        });
    }, []);

    const chartOptions = {
        labels: ["Finalized", "Outstanding"],
    };

    const chartSeries = [finalized, outstanding];

    return <BaseChart options={chartOptions} series={chartSeries} type="pie"/>;
};

export default OutstandingBills;

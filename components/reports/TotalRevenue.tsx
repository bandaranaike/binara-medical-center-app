import React from "react";
import Loader from "@/components/form/Loader";
import {TotalRevenueProps} from "@/types/report-interfaces";

const TotalRevenue: React.FC<TotalRevenueProps> = ({data}) => {

    return (<div className="card border border-gray-700 rounded-lg shadow-md mb-4 p-4">
            {data && (
                <div className="flex gap-4 text-center">
                    <div className="flex-grow border-r border-gray-700">
                        <div className="font-semibold">Bill revenue</div>
                        <div className="text-pink-600 text-3xl font-bold"> {data.totalBillRevenue} LKR</div>
                    </div>
                    <div className="flex-grow border-r border-gray-700">
                        <div className="font-semibold">System revenue</div>
                        <div className="text-fuchsia-600 text-3xl font-bold">{data.totalSystemRevenue} LKR</div>
                    </div>
                    <div className="flex-grow ">
                        <div className="font-semibold">Total revenue</div>
                        <div className="text-cyan-600 text-3xl font-bold">{(Number(data.totalBillRevenue) + Number(data.totalSystemRevenue)).toFixed(2)} LKR</div>
                    </div>
                </div>
            ) || <Loader/>}
        </div>
    );
};

export default TotalRevenue;

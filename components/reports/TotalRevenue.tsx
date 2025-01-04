import React from "react";
import Loader from "@/components/form/Loader";
import {TotalRevenueProps} from "@/types/report-interfaces";

const TotalRevenue: React.FC<TotalRevenueProps> = ({data}) => {

    return (<div className="card border border-gray-700 rounded-lg shadow-md mb-4 p-4">
            {data && (
                <div className="flex text-center">
                    <div className="flex-grow border-r border-gray-700">
                        <div className="font-semibold">Total revenue</div>
                        <div className="text-pink-600 text-3xl font-bold"> {data.totalRevenue} LKR</div>
                    </div>
                    <div className="flex-grow">
                        <div className="font-semibold">System revenue</div>
                        <div className="text-cyan-600 text-3xl font-bold">{data.totalSystemRevenue} LKR</div>
                    </div>
                </div>
            ) || <Loader/>}
        </div>
    );
};

export default TotalRevenue;

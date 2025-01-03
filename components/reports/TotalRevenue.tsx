import React, {useEffect, useState} from "react";
import axios from "@/lib/axios";
import Loader from "@/components/form/Loader";

const TotalRevenue: React.FC = () => {
    const [totalRevenue, setTotalRevenue] = useState<number>(0);
    const [totalSystemRevenue, setTotalSystemRevenue] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        axios.get("/reports/total-revenue").then((response) => {
            console.log(response.data);
            setTotalRevenue(response.data.totalRevenue);
            setTotalSystemRevenue(response.data.totalSystemRevenue);
            setIsLoading(false);
        });
    }, []);

    return (
        <div className="card border border-gray-700 rounded-lg shadow-md mb-4 p-4">
            {isLoading && <Loader/> ||
                <div className="flex text-center">
                    <div className="flex-grow border-r border-gray-700">
                        <div className="font-semibold">Total revenue</div>
                        <div className="text-pink-600 text-3xl font-bold"> {totalRevenue} LKR</div>
                    </div>
                    <div className="flex-grow">
                        <div className="font-semibold">System revenue</div>
                        <div className="text-cyan-600 text-3xl font-bold">{totalSystemRevenue} LKR</div>
                    </div>
                </div>
            }
        </div>
    );
};

export default TotalRevenue;

"use client"
import React, {useCallback, useEffect, useState} from "react";
import axios from "@/lib/axios";
import Loader from "@/components/form/Loader";
import {tabs} from "@/app/dashboard/pharmacy-admin/tabs";
import AdminNav from "@/components/admin/AdminNav";
import Pagination from "@/components/table/Pagination";
import debounce from "lodash.debounce";

export interface DrugStockSaleData {
    id: number,
    drug_name: string,
    brand_name: string,
    stock_quantity: number,
    sale_quantity: number,
    unit_price: number,
    cost: number
    minimum_quantity: number
    expire_date: string
}

const PharmacyAdminPortal: React.FC = () => {

    const [loading, setLoading] = useState(false);
    const [drugStockSaleData, setDrugStockSaleData] = useState<DrugStockSaleData[]>([]);
    const [stockError, setStockError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchDrugStockSaleData()
    }, [currentPage]);

    const handlePageChange = (page: number) => {
        setLoading(true)
        setCurrentPage(page);
    };

    const fetchDrugStockSaleData = useCallback(debounce(async () => {
        setLoading(true);
        setStockError(null);
        try {
            const response = await axios.get(`/drugs/stock-sale-data?page=${currentPage}`);
            setDrugStockSaleData(response.data.data);
            setTotalPages(response.data.last_page);
        } catch (err) {
            setStockError("Failed to load drugs details. Please try again. " + err);
        } finally {
            setLoading(false);
        }
    }, 50), [currentPage]);

    return (
        <div>
            <AdminNav baseUrl="pharmacy-admin" tabs={tabs}/>
            <div className="relative overflow-x-auto rounded-lg border border-gray-800 mt-8">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="font-bold">
                    <tr className="bg-gray-800">
                        <th className="px-4 py-4 ">Drug</th>
                        <th className="px-4 py-4">Brand</th>
                        <th className="px-4 py-4">Stock quantity</th>
                        <th className="px-4 py-4">Sale quantity</th>
                        <th className="px-4 py-4">Unit price</th>
                        <th className="px-4 py-4">Cost</th>
                        <th className="px-4 py-4">Expire date</th>
                    </tr>
                    </thead>
                    <tbody>
                    {drugStockSaleData && drugStockSaleData.length > 0 && drugStockSaleData.map((item) => (
                        <tr key={`${item.id}-${item.brand_name}`} className="border-t border-gray-800">
                            <td className="px-4 py-2 border-r border-gray-800">{item.drug_name}</td>
                            <td className="px-4 py-2 border-r border-gray-800">{item.brand_name}</td>
                            <td className="px-4 py-2 border-r  border-gray-800">
                                {item.minimum_quantity >= item.stock_quantity && (<span><span
                                    className="text-red-500">{item.stock_quantity}</span><span
                                    className="text-xs text-gray-600">  (min {item.minimum_quantity})</span></span>) || item.stock_quantity}
                            </td>
                            <td className="px-4 py-2 border-r border-gray-800">{item.sale_quantity}</td>
                            <td className="px-4 py-2 border-r border-gray-800">{item.unit_price}</td>
                            <td className="px-4 py-2 border-r border-gray-800">{item.cost}</td>
                            <td className="px-4 py-2 border-r border-gray-800">{item.expire_date}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {totalPages > 1 &&
                    <div className="p-6 border-t border-gray-800">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                }

                <div>
                    {!loading && !stockError && drugStockSaleData.length === 0 &&
                        <div className="p-6 text-center text-gray-500">No drug stock sales data found</div>
                    }
                    {!loading && stockError &&
                        <div className="p-6 text-center text-red-500">{stockError}</div>
                    }
                    {loading && <div className="p-6 text-center"><Loader/></div>}
                </div>
            </div>

        </div>)
}

export default PharmacyAdminPortal;
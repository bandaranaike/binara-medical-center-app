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
        <div className="space-y-5">
            <AdminNav baseUrl="pharmacy-admin" tabs={tabs}/>
            <section
                className="overflow-hidden rounded-[var(--radius-md)] border"
                style={{borderColor: "var(--border-subtle)", background: "var(--surface-elevated)"}}
            >
                <div
                    className="border-b px-5 py-4"
                    style={{borderColor: "var(--border-subtle)", background: "color-mix(in srgb, var(--surface-soft) 72%, transparent)"}}
                >
                    <h2 className="text-lg font-semibold">Pharmacy Stock Summary</h2>
                    <p className="mt-1 text-sm" style={{color: "var(--muted)"}}>
                        Monitor stock movement, low inventory levels, and expiration dates across drug brands.
                    </p>
                </div>

                <div className="relative overflow-x-auto">
                    <table className="w-full text-left text-sm" style={{color: "var(--muted-strong)"}}>
                        <thead style={{color: "var(--muted)"}}>
                        <tr style={{background: "var(--surface-soft)", borderBottom: "1px solid var(--border-subtle)"}}>
                            <th className="px-4 py-4 font-semibold">Drug</th>
                            <th className="px-4 py-4 font-semibold">Brand</th>
                            <th className="px-4 py-4 font-semibold">Stock quantity</th>
                            <th className="px-4 py-4 font-semibold">Sale quantity</th>
                            <th className="px-4 py-4 font-semibold">Unit price</th>
                            <th className="px-4 py-4 font-semibold">Cost</th>
                            <th className="px-4 py-4 font-semibold">Expire date</th>
                        </tr>
                        </thead>
                        <tbody>
                        {drugStockSaleData && drugStockSaleData.length > 0 && drugStockSaleData.map((item, index) => (
                            <tr
                                key={`${item.id}-${item.brand_name}`}
                                style={{
                                    borderTop: "1px solid var(--border-subtle)",
                                    background: index % 2 === 0 ? "transparent" : "color-mix(in srgb, var(--surface-soft) 52%, transparent)",
                                }}
                            >
                                <td className="px-4 py-3" style={{borderRight: "1px solid var(--border-subtle)"}}>{item.drug_name}</td>
                                <td className="px-4 py-3" style={{borderRight: "1px solid var(--border-subtle)"}}>{item.brand_name}</td>
                                <td className="px-4 py-3" style={{borderRight: "1px solid var(--border-subtle)"}}>
                                    {item.minimum_quantity >= item.stock_quantity ? (
                                        <span>
                                            <span style={{color: "rgb(225, 29, 72)"}}>{item.stock_quantity}</span>
                                            <span className="ml-1 text-xs" style={{color: "var(--muted)"}}>
                                                (min {item.minimum_quantity})
                                            </span>
                                        </span>
                                    ) : item.stock_quantity}
                                </td>
                                <td className="px-4 py-3" style={{borderRight: "1px solid var(--border-subtle)"}}>{item.sale_quantity}</td>
                                <td className="px-4 py-3" style={{borderRight: "1px solid var(--border-subtle)"}}>{item.unit_price}</td>
                                <td className="px-4 py-3" style={{borderRight: "1px solid var(--border-subtle)"}}>{item.cost}</td>
                                <td className="px-4 py-3">{item.expire_date}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 &&
                    <div className="border-t p-6" style={{borderColor: "var(--border-subtle)"}}>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                }

                <div>
                    {!loading && !stockError && drugStockSaleData.length === 0 &&
                        <div className="p-6 text-center" style={{color: "var(--muted)"}}>No drug stock sales data found</div>
                    }
                    {!loading && stockError &&
                        <div className="p-6 text-center" style={{color: "rgb(225, 29, 72)"}}>{stockError}</div>
                    }
                    {loading && <div className="p-6 text-center"><Loader/></div>}
                </div>
            </section>

        </div>)
}

export default PharmacyAdminPortal;

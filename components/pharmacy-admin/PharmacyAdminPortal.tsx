import React, {useEffect, useState} from "react";
import axios from "@/lib/axios";
import Loader from "@/components/form/Loader";
import AdminTabs from "@/components/admin/AdminTabs";
import {AdminTab} from "@/types/admin";

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

    const tabs: AdminTab[] = [
        {
            id: "categories",
            fields: ["name"],
            filters: {
                options: [{label: "Name", value: "name"}],
            }
        },
        {
            id: "drugs",
            title: "Drugs Generic Names",
            fields: ["category", "name", "minimum_quantity"],
            dropdowns: {category: 'categories'},
            filters: {
                options: [
                    {label: "Category", value: 'category:name'},
                    {label: "Name", value: 'name'},
                ]
            }
            ,
            sort: {
                name: {
                    type: 'string',
                }
            }
        },
        {
            id: "brands",
            title: "Drug Brands",
            fields: ["drug", "name"],
            dropdowns: {drug: 'drugs'},
            filters: {
                options: [
                    {label: "Drug", value: 'drug:name'},
                    {label: "Name", value: 'name'},
                ]
            }
        },
        {
            id: "stocks",
            title: "Drug Brand Stocks",
            fields: ["brand", "supplier", "unit_price", "batch_number", "initial_quantity", "quantity", "expire_date", "cost"],
            dropdowns: {supplier: 'suppliers', brand: "brands"},
            filters: {
                options: [
                    {label: "Brand", value: 'brand:name'},
                    {label: "Batch number", value: 'batch_number'},
                    {label: "Supplier", value: 'supplier:name'},
                ]
            },
            types: {expire_date: "date"}
        },
        {
            id: "suppliers",
            fields: ["name", "address", "phone", "email"],
            filters: {
                options: [{label: "Name", value: "name"}],
            }
        },
        {
            id: "sales",
            fields: ["brand", "bill_id", "quantity", "total_price", "brand_id"],
            dropdowns: {brand: 'brands'},
            filters: {
                options: [
                    {label: "Brand", value: 'brand:name'},
                ]
            }
        },
        {id: "summary", fields: []},
    ];

    const [activeTab, setActiveTab] = useState<string>("");

    useEffect(() => {
        if (activeTab === "summary") {
            fetchDrugStockSaleData()
        }
    }, [activeTab]);

    const fetchDrugStockSaleData = async () => {

        setLoading(true);
        setStockError(null);
        try {
            const response = await axios.get("/drugs/stock-sale-data");
            setDrugStockSaleData(response.data);
        } catch (err) {
            setStockError("Failed to load drugs details. Please try again. " + err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <AdminTabs tabs={tabs} onSelectActiveTab={setActiveTab}></AdminTabs>
            {activeTab === "summary" && (
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
                    <div>
                        {!loading && !stockError && drugStockSaleData.length === 0 &&
                            <div className="p-6 text-center text-gray-500">No drug stock sales data found</div>
                        }
                        {!loading && stockError &&
                            <div className="p-6 text-center text-red-500">{stockError}</div>
                        }
                        {loading && <div className="p-6 text-center"><Loader/></div>}
                    </div>
                </div>)
            }
        </div>)
}

export default PharmacyAdminPortal;
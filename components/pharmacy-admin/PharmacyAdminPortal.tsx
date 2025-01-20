import React, {useEffect, useState} from "react";
import axios from "@/lib/axios";
import TableComponent from "@/components/TableComponent";

export interface DrugStockSaleData {
    id: number,
    drug_name: string,
    brand_name: string,
    stock_quantity: number,
    sale_quantity: number,
    unit_price: number,
    cost: number
    expire_date: string
}

const PharmacyAdminPortal: React.FC = () => {

    const [loading, setLoading] = useState(false);
    const [drugStockSaleData, setDrugStockSaleData] = useState<DrugStockSaleData[]>([]);
    const [stockError, setStockError] = useState<string | null>(null);

    const tabs: { id: string, fields: any }[] = [
        {id: "summary", fields: []},
        {id: "drugs", fields: ["name", "minimum_quantity", "category_id"]},
        {id: "sales", fields: ["brand_id", "quantity", "total_price"]},
    ];

    const [activeTab, setActiveTab] = useState<{ id: string, fields: [string] }>(tabs[0]);

    useEffect(() => {
        fetchDrugStockSaleData()
    }, []);

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

    console.log("Data", drugStockSaleData)

    const activeTabClass = "active dark:text-blue-500 border-fuchsia-500";
    const inactiveTabClass = "border-transparent hover:border-gray-300 hover:text-gray-300";

    return (
        <div>
            <div className="bg-gray-900 text-gray-400">
                <nav className="text-sm font-medium border-b border-gray-700">
                    <ul className="flex flex-wrap -mb-px">
                        {tabs.length > 0 && tabs.map((tab) => (
                            <li className="me-2" key={tab.id}>
                                <a
                                    href="#"
                                    onClick={() => setActiveTab(tab)}
                                    className={`inline-block p-4 border-b-2 rounded-t-lg first-letter:uppercase ${
                                        activeTab.id === tab.id ? activeTabClass : inactiveTabClass
                                    }`}
                                >{tab.id}</a>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="">{activeTab.id !== "summary" && activeTab.id !== "" && (<TableComponent apiUrl={activeTab.id} fields={activeTab.fields}/>)}</div>
            </div>
            {!loading && activeTab.id === "summary" && (
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
                            <tr key={item.id} className="border-t border-gray-800">
                                <td className="px-4 py-2 border-r border-gray-800">{item.drug_name}</td>
                                <td className="px-4 py-2 border-r border-gray-800">{item.brand_name}</td>
                                <td className="px-4 py-2 border-r  border-gray-800">{item.stock_quantity}</td>
                                <td className="px-4 py-2 border-r border-gray-800">{item.sale_quantity}</td>
                                <td className="px-4 py-2 border-r border-gray-800">{item.unit_price}</td>
                                <td className="px-4 py-2 border-r border-gray-800">{item.cost}</td>
                                <td className="px-4 py-2 border-r border-gray-800">{item.expire_date}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {
                        !stockError && drugStockSaleData.length === 0 && <div className="p-6 text-center text-gray-500">No drug stock sales data found</div>
                    }
                    {
                        stockError && <div className="p-6 text-center text-gray-500 text-red-500">{stockError}</div>
                    }
                </div>)
            }
        </div>)
}

export default PharmacyAdminPortal;
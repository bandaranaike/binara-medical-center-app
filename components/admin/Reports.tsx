import ServiceCostReport from "@/components/reports/ServiceCostReport";

const Reports = () => {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-semibold mb-4">Reports</h1>
            <ServiceCostReport/>
        </div>
    );
};

export default Reports;
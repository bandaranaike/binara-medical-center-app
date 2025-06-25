import React, { useEffect, useState } from "react";
import CustomCheckbox from "@/components/form/CustomCheckbox";
import SearchableSelect from "@/components/form/SearchableSelect";
import Loader from "@/components/form/Loader";
import axios from "@/lib/axios";
import { Option } from "@/types/interfaces";

interface OldBillContinueProps {
    userId?: number | string;
    onSelectReferedBillId: (billId: number) => void;
}

const OldBillContinue: React.FC<OldBillContinueProps> = ({ userId, onSelectReferedBillId }) => {
    const [checked, setChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [bills, setBills] = useState<Option[]>([]);
    const [selectedBill, setSelectedBill] = useState<Option>();

    useEffect(() => {
        if (checked && userId) {
            setLoading(true);
            axios
                .get(`/api/users/bills/latest`, { params: { user_id: userId } })
                .then((response) => {
                    const options: Option[] = (response.data || []).map((bill: any) => ({
                        value: bill.id.toString(),
                        label: bill.label || `Bill #${bill.id}`,
                    }));
                    setBills(options);
                })
                .catch(() => setBills([]))
                .finally(() => setLoading(false));
        } else {
            setBills([]);
            setSelectedBill(undefined);
        }
    }, [checked, userId]);

    const handleSelectBill = (option: Option | string | undefined) => {
        if (option && typeof option !== "string") {
            const opt = option as Option;
            setSelectedBill(opt);
            onSelectReferedBillId(Number(opt.value));
        }
    };

    return (
        <div className="my-4">
            <CustomCheckbox label="Continue from old bill" checked={checked} setChecked={setChecked} />
            {checked && (
                <div className="mt-2">
                    {loading ? (
                        <div className="my-2 text-center">
                            <Loader />
                        </div>
                    ) : (
                        <SearchableSelect
                            id="old_bill_select"
                            placeholder="Select Bill"
                            options={bills}
                            value={selectedBill}
                            onChange={(opt) => handleSelectBill(opt as Option)}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default OldBillContinue;

import React, {useEffect, useState} from "react";
import CustomCheckbox from "@/components/form/CustomCheckbox";
import SearchableSelect from "@/components/form/SearchableSelect";
import {Option} from "@/types/interfaces";

interface OldBillContinueProps {
    patientId?: number | string;
    disabled: boolean;
    onSelectReferredBillId: (billId: number) => void;
}

const OldBillContinue: React.FC<OldBillContinueProps> = ({patientId, onSelectReferredBillId, disabled}) => {
    const [checked, setChecked] = useState(false);
    const [selectedBill, setSelectedBill] = useState<Option>();

    useEffect(() => {
        setChecked(false);
    }, [patientId]);

    const handleSelectBill = (option: Option | string | undefined) => {
        if (option && typeof option !== "string") {
            const opt = option as Option;
            setSelectedBill(opt);
            onSelectReferredBillId(Number(opt.value));
        }
    };

    return (
        <div className="my-4 min-h-16 flex gap-4">
            <CustomCheckbox disabled={disabled} label="Continue from old bill? Reference" checked={checked}
                            setChecked={setChecked}/>
            {checked && (
                <div className="mt-2 grow">
                    {
                        <SearchableSelect
                            className="mb-0"
                            id="old_bill_select"
                            apiUri="user-bills"
                            extraParams={patientId ? {patient_id: patientId} : {}}
                            value={selectedBill}
                            onChange={(opt) => handleSelectBill(opt as Option)}
                        />
                    }
                </div>
            )}
        </div>
    );
};

export default OldBillContinue;

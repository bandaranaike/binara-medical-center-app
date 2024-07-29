import React from 'react';
import SearchableSelect from "@/components/form/SearchableSelect";
import TextInput from "@/components/form/TextInput";
import PatientDetails from "@/components/PatientDetails";
import {PatientData} from "@/types/interfaces";

const Channel = () => {
    const [billNumber, setBillNumber] = React.useState<number>(0);
    const [telephone, setTelephone] = React.useState("");
    const [isNewRecord, setIsNewRecord] = React.useState(true);
    const [doctor, setDoctor] = React.useState("");
    const [patientPhone, setPatientPhone] = React.useState("");

    const [channelingFee, setChannelingFee] = React.useState("");
    const [otherFee, setOtherFee] = React.useState("");

    const handleSelectChange = (selectedOption: any) => {
        setTelephone(selectedOption);
        setPatientPhone(selectedOption.label);
        setIsNewRecord(false);
    };

    const handleOnPatientCreate = (patientData: PatientData) => {
        const telephone = patientData.data.telephone;
        setPatientPhone(telephone);
    }

    const handleOnCreateOption = (selectedOption: any) => {
        setPatientPhone(selectedOption);
        setIsNewRecord(true);
    };

    const handleDoctorChangeOption = (selectedOption: any) => {
        setDoctor(selectedOption);
    };

    const saveAndPrint = () => {

    }

    return (
        <div className="bg-gray-900 text-white">
            <div className="flex justify-between items-center mb-6 pb-4">
                <span>{new Date().toDateString()}</span>
                <span className="text-lg">Bill No : <span className="font-bold">{billNumber}</span></span>
            </div>
            <div className="grid grid-cols-3 gap-8">
                <div className="">

                    <SearchableSelect
                        placeholder="Patient Telephone"
                        apiUri={'patients'}
                        value={telephone}
                        onChange={handleSelectChange}
                        onCreateOption={handleOnCreateOption}
                        id={'PatientTelephoneSelect'}
                    />

                    <SearchableSelect
                        placeholder="Doctor Name"
                        apiUri={'doctors'}
                        value={doctor}
                        onChange={handleDoctorChangeOption}
                        id={'DoctorNameSelect'}
                    />

                    <TextInput
                        name="Channeling"
                        value={channelingFee}
                        onChange={value => setChannelingFee(value)}
                    />

                    <TextInput
                        name="Others"
                        value={otherFee}
                        onChange={value => setOtherFee(value)}
                    />
                </div>
                <div className="p-8 pb-5 col-span-2">
                    <PatientDetails onPatientCreated={handleOnPatientCreate} patientPhone={patientPhone} isNew={isNewRecord}></PatientDetails>
                </div>
            </div>

            <div className="flex justify-between mt-4">
                <div></div>
                <button className="bg-gray-700 text-white px-5 py-2 rounded-md" onClick={saveAndPrint}>Send to Print</button>
            </div>
        </div>
    );
};

export default Channel;

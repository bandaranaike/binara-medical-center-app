import React from 'react';
import Select from 'react-select';
import SearchableSelect from "@/components/form/SearchableSelect";
import TextInput from "@/components/form/TextInput";
import PatientDetails from "@/components/PatientDetails";

const Channel = () => {
    const [billNumber, setBillNumber] = React.useState<number>(0);
    const [telephone, setTelephone] = React.useState("");
    const [isNewRecord, setIsNewRecord] = React.useState(false);

    const options = [
        {value: 'chocolate', label: 'Chocolate'},
        {value: 'strawberry', label: 'Strawberry'},
        {value: 'vanilla', label: 'Vanilla'}
    ];


    const handleSelectChange = (selectedOption: any) => {
        setTelephone(selectedOption);
    };
    const handleOnCreateOption = (selectedOption: any) => {
        setTelephone(selectedOption);
        setIsNewRecord(true);
    };

    return (
        <div className="bg-gray-900 text-white">
            <div className="flex justify-between items-center mb-6 pb-4">
                <span>{new Date().toDateString()}</span>
                <span className="text-lg">Bill No : <span className="font-bold">{billNumber}</span></span>
            </div>
            <div className="grid grid-cols-2 gap-8">
                <div className="">

                    <SearchableSelect
                        placeholder="Patient Telephone"
                        options={options}
                        apiUri={'patients'}
                        value={telephone}
                        onChange={handleSelectChange}
                        onCreateOption={handleOnCreateOption}
                        id={'DoctorNameSelect'}
                    />

                    <SearchableSelect
                        placeholder="Doctor Name"
                        apiUri={'doctors'}
                        options={options}
                        onChange={handleSelectChange}
                        id={'PatientTelephoneSelect'}
                    />

                    <TextInput
                        name="Channeling"
                        value=""
                        onChange={handleSelectChange}
                    />

                    <TextInput
                        name="Others"
                        value=""
                        onChange={handleSelectChange}
                    />
                </div>
                <div className="p-8">
                    <PatientDetails telephone={telephone} isNew={isNewRecord}></PatientDetails>
                </div>
            </div>

            <div className="flex justify-between mt-4">
                <button className="bg-gray-700 text-white px-5 py-2 rounded-md">Reset</button>
                <button className="bg-gray-700 text-white px-5 py-2 rounded-md">Send to Print</button>
            </div>
        </div>
    );
};

export default Channel;

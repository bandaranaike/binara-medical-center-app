import React, {useState, useEffect, useRef} from "react";
import axios from "@/lib/axios";
import {Patient, User} from "@/types/interfaces";

interface SearchablePatientSelectProps {
    onCreateNew: (searchedKey: string) => void;
    onPatientSelect: (selectedPatient: Patient) => void;
}

const SearchablePatientSelect: React.FC<SearchablePatientSelectProps> = ({onPatientSelect, onCreateNew}) => {
    const [query, setQuery] = useState("");
    const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (query.trim() === "") {
            setFilteredUsers([]);
            setError(null);
            return;
        }

        const fetchPatients = async () => {
            setLoading(true);
            setError(null);
            setFilteredPatients([])

            try {
                const response = await axios.get(`/patients/search`, {
                    params: {query},
                });
                if (response.status === 200) {
                    setShowSearch(true);
                    setFilteredUsers(response.data);
                } else {
                    setError("Failed to fetch patients");
                }
            } catch (err) {
                setError("An error occurred while searching for patients");
            } finally {
                setLoading(false);
            }
        };

        const debounceFetch = setTimeout(fetchPatients, 400); // Debounce API calls
        return () => clearTimeout(debounceFetch);
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSearch(false);
                setFilteredUsers([]); // Close the suggestions
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    const handleSelectPatient = (patient: Patient) => {
        setQuery(""); // Clear the search input
        setFilteredUsers([]); // Clear the suggestions
        onPatientSelect(patient); // Trigger the selection event
    };
    const handleSelectUser = (user: User) => {
        setQuery(""); // Clear the search input
        setFilteredUsers([]); // Clear the suggestions

        if (user.patients.length === 1) {
            onPatientSelect(user.patients[0]);
        } else if (user.patients.length > 1) {
            setFilteredPatients(user.patients)
        }

        // Trigger the selection event
    };

    const handleCreatePatient = () => {
        setFilteredUsers([]); // Clear the suggestions
        setShowSearch(false);
        onCreateNew(query)// Trigger the selection event
        setQuery(""); // Clear the search input

    };

    const selectPatientFromList = (patient: Patient) => {
        onPatientSelect(patient)
        setFilteredPatients([])
    };
    return (
        <div ref={containerRef} className="relative w-full max-w-3xl">
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Enter name or phone number"
                className="w-full p-2 border border-gray-700 bg-gray-800 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {loading && <div className="absolute mt-2 text-gray-500">Loading...</div>}
            {error && <div className="absolute mt-2 text-red-500">{error}</div>}
            {query && showSearch && (
                <ul className="absolute z-10 w-full mt-1 border border-gray-700 rounded bg-gray-800 shadow-lg max-h-72 overflow-y-auto">
                    {filteredUsers.length > 0 && filteredUsers.map((user) => (
                        <li
                            key={user.id}
                            className="p-2 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
                            onClick={() => handleSelectUser(user)}
                        >
                            <div className="font-semibold">{user.name}</div>
                            <div className="text-sm text-gray-400">{user.phone}</div>
                        </li>
                    ))}
                    <li key="-1" className="p-2 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0" onClick={() => handleCreatePatient()}>
                        Add new {/^-?\d+$/.test(query) ? 'number' : 'name'} <i>{query}</i>
                    </li>
                </ul>
            )}
            {filteredPatients && filteredPatients.length > 1 &&
                <div className="border border-gray-700 bg-gray-800 rounded-xl my-4 text-gray-400">
                    <div className="border-b border-gray-700 px-4 py-3">There are {filteredPatients.length} patients for this user</div>
                    {filteredPatients.map(patient =>
                        <div key={patient.id} className="border-b border-gray-700 px-4 py-2 flex justify-between last:border-b-0">
                            <div className="flex items-center">
                                <div className="mb-1 font-semibold mr-3">{patient.name}</div>
                                <div className="mb-1 text-sm flex gap-2 text-gray-500">
                                    <span>Age: {patient.age}</span>
                                    {patient.gender && <span>Gender: {patient.gender}</span>}
                                </div>
                            </div>
                            <button
                                onClick={() => selectPatientFromList(patient)}
                                className="bg-blue-800 text-white px-2 py-1 rounded-lg text-sm"
                            >
                                Select this patient
                            </button>
                        </div>
                    )}
                </div>}
        </div>
    );
};

export default SearchablePatientSelect;

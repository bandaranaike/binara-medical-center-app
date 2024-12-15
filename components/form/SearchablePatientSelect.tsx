import React, {useState, useEffect, useRef} from "react";
import axios from "@/lib/axios";
import {Patient} from "@/types/interfaces";

interface SearchablePatientSelectProps {
    onCreateNew: (searchedKey: string) => void;
    onPatientSelect: (selectedPatient: Patient) => void;
}

const SearchablePatientSelect: React.FC<SearchablePatientSelectProps> = ({onPatientSelect, onCreateNew}) => {
    const [query, setQuery] = useState("");
    const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (query.trim() === "") {
            setFilteredPatients([]);
            setError(null);
            return;
        }

        const fetchPatients = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(`/patients/search`, {
                    params: {query},
                });
                if (response.status === 200) {
                    setShowSearch(true);
                    setFilteredPatients(response.data);
                } else {
                    setError("Failed to fetch patients");
                }
            } catch (err) {
                setError("An error occurred while searching for patients");
            } finally {
                setLoading(false);
            }
        };

        const debounceFetch = setTimeout(fetchPatients, 600); // Debounce API calls
        return () => clearTimeout(debounceFetch);
    }, [query]);

    /**
     * Key Concepts in the Code
     * 1. Purpose of useRef
     *
     *     What it does: useRef allows you to create a persistent reference to a DOM element. In this case, we use it to track the main container of the component (containerRef).
     *     Why it's needed: We use this reference to determine if the user has clicked outside the component by comparing the click event's target with our container.
     *
     * 2. Event Listener
     *
     *     Adding the Listener: We add an event listener (mousedown) to the document so that we can listen for all clicks anywhere on the page.
     *     Purpose: The goal is to detect when a user clicks outside the dropdown so we can hide the suggestions.
     *
     * 3. Event Handler
     *
     *     handleClickOutside:
     *         This function checks if the click occurred outside the component by using the reference containerRef.
     *         If the event.target (the clicked element) is not inside the container, we clear the suggestions by calling setFilteredPatients([]).
     *
     * 4. Cleanup in useEffect
     *
     *     In React's useEffect, returning a function is a way to clean up resources when the component is unmounted or when the dependencies of the useEffect hook change.
     *
     * Why Use return in useEffect?
     *
     * The return statement inside a useEffect hook specifies a cleanup function. This function is executed in two scenarios:
     *
     *     When the Component Unmounts:
     *         For example, if the user navigates away or the component is removed from the DOM, the event listener should also be removed to prevent memory leaks or unwanted behavior.
     *     When the Dependencies Change:
     *         If the useEffect depends on variables (via the dependency array), React will re-run the effect when those variables change. Before running the new effect, React will first clean up the previous effect.
     *
     * In This Code:
     *
     * return () => {
     *   document.removeEventListener("mousedown", handleClickOutside);
     * };
     *
     *     Purpose: This ensures the event listener (mousedown) is removed when the component is unmounted or re-rendered.
     *     Why it's important:
     *         Without cleanup, the handleClickOutside function would remain attached to the document, which could cause memory leaks and incorrect behavior if the component is removed or re-rendered.
     *
     * How It All Works Together
     *
     *     When the Component Renders:
     *         useEffect runs and adds the mousedown event listener to the document.
     *         The event listener calls handleClickOutside when the user clicks anywhere on the page.
     *
     *     When the User Clicks Outside:
     *         handleClickOutside checks if the clicked element (event.target) is inside the containerRef.
     *         If not, it closes the dropdown by calling setFilteredPatients([]).
     *
     *     When the Component Unmounts:
     *         The return function in useEffect removes the event listener from document, cleaning up resources.
     *
     *     Re-Renders (if dependencies change):
     *         Before re-running the useEffect logic, React executes the cleanup function to remove the previous event listener and ensure no duplicates are added.
     *
     * Advantages of Cleanup
     *
     *     Prevents memory leaks.
     *     Ensures that only one instance of the event listener is active at any time.
     *     Keeps the component performant and predictable.
     */

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSearch(false);
                setFilteredPatients([]); // Close the suggestions
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
        setFilteredPatients([]); // Clear the suggestions
        onPatientSelect(patient); // Trigger the selection event
    };

    const handleCreatePatient = () => {
        setFilteredPatients([]); // Clear the suggestions
        setShowSearch(false);
        onCreateNew(query)// Trigger the selection event
        setQuery(""); // Clear the search input

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
                    {filteredPatients.length > 0 && filteredPatients.map((patient) => (
                        <li
                            key={patient.id}
                            className="p-2 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
                            onClick={() => handleSelectPatient(patient)}
                        >
                            <div className="font-semibold">{patient.name}</div>
                            <div className="text-sm text-gray-400">{patient.telephone}</div>
                        </li>
                    ))}
                    <li key="-1" className="p-2 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0" onClick={() => handleCreatePatient()}>
                        Add new {/^-?\d+$/.test(query) ? 'number' : 'name'} <i>{query}</i>
                    </li>
                </ul>
            )}
        </div>
    );
};

export default SearchablePatientSelect;

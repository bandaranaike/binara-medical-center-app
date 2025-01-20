import TableComponent from './TableComponent';

const fields = ['id', 'name', 'hospital_id', 'specialty_id', 'telephone', 'email', 'age', 'address', 'timestamps'];

export default function DoctorsTable() {
    const apiUrl = '/api/doctors';
    return <TableComponent apiUrl={apiUrl} fields={fields} />;
}

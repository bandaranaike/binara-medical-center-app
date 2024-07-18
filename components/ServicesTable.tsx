import TableComponent from './TableComponent';

const fields = ['id', 'name', 'bill_price', 'system_price', 'timestamps'];

export default function ServicesTable() {
    const apiUrl = '/api/services';
    return <TableComponent apiUrl={apiUrl} fields={fields} />;
}

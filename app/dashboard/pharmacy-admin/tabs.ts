import {AdminTab} from "@/types/admin";

export const tabs: AdminTab[] = [
    {
        id: "categories",
        fields: ["name"],
        filters: {
            options: [{label: "Name", value: "name"}],
        }
    },
    {
        id: "drugs",
        title: "Drugs Generic Names",
        fields: ["category", "name", "minimum_quantity"],
        dropdowns: {category: 'categories'},
        filters: {
            options: [
                {label: "Category", value: 'category:name'},
                {label: "Name", value: 'name'},
            ]
        },
        sort: {
            name: {type: "string"},
            minimum_quantity: {type: "number"},
        }
    },
    {
        id: "brands",
        title: "Drug Brands",
        fields: ["drug", "name"],
        dropdowns: {drug: 'drugs'},
        filters: {
            options: [
                {label: "Drug", value: 'drug:name'},
                {label: "Name", value: 'name'},
            ]
        }
    },
    {
        id: "stocks",
        title: "Drug Brand Stocks",
        fields: ["brand", "supplier", "unit_price", "batch_number", "initial_quantity", "quantity", "expire_date", "cost"],
        dropdowns: {supplier: 'suppliers', brand: "brands"},
        filters: {
            options: [
                {label: "Brand", value: 'brand:name'},
                {label: "Batch number", value: 'batch_number'},
                {label: "Supplier", value: 'supplier:name'},
            ]
        },
        types: {expire_date: "date"}
    },
    {
        id: "suppliers",
        fields: ["name", "address", "phone", "email"],
        filters: {
            options: [{label: "Name", value: "name"}],
        }
    },
    {
        id: "sales",
        fields: ["brand", "bill_id", "quantity", "total_price", "brand_id"],
        dropdowns: {brand: 'brands'},
        filters: {
            options: [
                {label: "Brand", value: 'brand:name'},
            ]
        }
    },
    {id: "summary", fields: []},
];
export type Sort = { type: string, direction?: string }

export interface AdminTab {
    id: string,
    title?: string,
    fields: string[]
    dropdowns?: any
    readonly?: boolean
    select?: any
    actions?: [AdminTabActions]
    filters?: {
        options: { value: string, label: string }[],
        types?: any
    },
    sort?: Record<string, { type: SortType }>;
    labels?: string[],
    types?: { [key: string]: string },
}


export interface AdminTabActions {
    key: string,
    callBack: (record: any) => Promise<any>
}
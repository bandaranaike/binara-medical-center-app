export interface dailyReportSummaryProps {
    data?: DailyReportSummaryData
}

export interface DailyReportSummaryData {
    newPatients: number;
    updatedPatients: number;
    visitedDoctors: number;
}

export interface TotalRevenueProps {
    data?: TotalRevenueData
}

export interface TotalRevenueData {
    totalRevenue: number
    totalSystemRevenue: number
    totalBillRevenue: number
}

export interface BillSummaryProps {
    data?: BillSummaryData
}

export interface BillSummaryData {
    statusData: { status: string; count: number }[];
    count: number;
}

export interface RevenueByDoctorProps {
    data?: RevenueByDoctorData []
}

export interface RevenueByDoctorData {
    doctorName: string;
    revenue: number;
}
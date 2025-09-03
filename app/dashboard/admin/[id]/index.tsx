import DoctorAvailabilityPanel from "@/components/admin/DoctorAvailabilityPanel";

export function renderDoctorAvailabilityPanel(
    doctorId: number | string,
) {
    return (
        <DoctorAvailabilityPanel doctorId={doctorId}/>
    );
}
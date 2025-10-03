import DoctorAvailabilityPanel from "@/components/admin/DoctorAvailabilityPanel";

export function renderDoctorAvailabilityPanel(
    doctorId: number | string,
    id: number | string,
) {
    return (
        <DoctorAvailabilityPanel doctorId={doctorId} id={id}/>
    );
}
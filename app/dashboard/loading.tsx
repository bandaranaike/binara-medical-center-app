import Loader from "@/components/form/Loader";

export default function Loading() {
    return (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-4">
            <Loader size="h-10 w-10" color="fill-fuchsia-600"/>
            <p className="text-sm" style={{color: "var(--muted)"}}>Loading workspace...</p>
        </div>
    );
}

import React from "react";
import {ArrowUpRight, HeartPulse} from "lucide-react";

const Welcome: React.FC = () => {
    return (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <section className="app-panel-elevated p-8">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em]" style={{background: "var(--accent-soft)", color: "var(--accent-strong)"}}>
                    <HeartPulse className="h-3.5 w-3.5"/>
                    Welcome
                </div>
                <h1 className="mt-5 max-w-2xl text-4xl font-semibold">Internal workspace for the Binara Medical Center team</h1>
                <p className="mt-4 max-w-2xl text-base leading-7" style={{color: "var(--muted)"}}>
                    This portal is intended for internal operations. Patients and public-facing workflows should continue through the external web portal.
                </p>
                <a
                    className="app-button-primary mt-8 inline-flex gap-2"
                    href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/dashboard`}
                >
                    Open Web Portal
                    <ArrowUpRight className="h-4 w-4"/>
                </a>
            </section>

            <aside className="app-panel p-8">
                <span className="app-label">Portal Notes</span>
                <div className="space-y-4 text-sm leading-6" style={{color: "var(--muted-strong)"}}>
                    <p>Clinical and billing views are optimized for staff use and may expose sensitive operational data.</p>
                    <p>The updated shell now supports light and dark themes without changing the underlying workflows.</p>
                    <p>Use the workspace navigation to move between reception, pharmacy, reporting, and administrative areas.</p>
                </div>
            </aside>
        </div>
    );
};

export default Welcome;

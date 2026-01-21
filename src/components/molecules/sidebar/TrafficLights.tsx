export function TrafficLights() {
    return (
        <div className="flex items-center gap-2 px-5 py-4 h-toolbar">
            <div className="w-3 h-3 rounded-full bg-[var(--traffic-close)] border border-black/10" />
            <div className="w-3 h-3 rounded-full bg-[var(--traffic-minimize)] border border-black/10" />
            <div className="w-3 h-3 rounded-full bg-[var(--traffic-maximize)] border border-black/10" />
        </div>
    );
}

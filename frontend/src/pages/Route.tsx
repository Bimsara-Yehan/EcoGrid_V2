import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import MapView from "../components/MapView";
import StopCard, { type Stop } from "../components/StopCard";
import StopDetails from "../components/StopDetails";
import { fetchStops } from "../services/stops";
import { useToast } from "../components/Toast";
import { createPickup } from "../services/pickups"; 

export default function RoutePage() {
  const toast = useToast();
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [details, setDetails] = useState<Stop | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(false);
  const asideRef = React.useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportH, setViewportH] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const date = new Date().toISOString().slice(0, 10);
        const s = await fetchStops(date);
        setStops(s);
      } catch (e: any) {
        toast.push("Failed to load stops");
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  // Track viewport height for virtualization
  useEffect(() => {
    const el = asideRef.current;
    if (!el) return;
    const measure = () => setViewportH(el.clientHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [asideRef]);

  const points = useMemo(
    () => stops.map(s => ({ id: s.id, coords: s.coords, label: s.title, fill: s.fill })),
    [stops]
  );

  function handleSelect(id: string) {
    setSelectedId(id);
    setDetails(stops.find(x => x.id === id) || null);
  }

  function handleAfterAction(id: string) {
    // Move focus to next stop and scroll it into view
    const idx = stops.findIndex(s => s.id === id);
    if (idx >= 0 && idx + 1 < stops.length) {
      const nextId = stops[idx + 1].id;
      setSelectedId(nextId);
      // Scroll into view by querying the next card (keyed by order)
      // Simple approach: scroll container to rough position
      if (asideRef.current) {
        const approxHeight = 120; // average card height
        asideRef.current.scrollTo({ top: Math.max(0, (idx + 1) * approxHeight - 60), behavior: "smooth" });
      }
    }
  }
  
  async function handleAction(id: string, action: "collected" | "missed" | "skipped") {
    try {
      await createPickup({ stopId: id, action });
      toast.push(`Marked ${action}`);
    } catch (e) {
      console.error(e);
      toast.push(`Failed to submit (${action})`);
    }
  }

  return (
    <Layout>
      {loading && <div className="mb-2 text-sm text-slate-500">Loading route…</div>}
      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <section>
          <MapView points={points} selectedId={selectedId} />
        </section>
        <aside
          ref={asideRef}
          className="lg:max-h-[85vh] lg:overflow-auto pr-2"
          onScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)}
        >
          {stops.length > 100 ? (
            (() => {
              const ITEM_H = 132; // approx StopCard height
              const overscan = 5;
              const start = Math.max(0, Math.floor(scrollTop / ITEM_H) - overscan);
              const visibleCount = Math.ceil((viewportH || ITEM_H) / ITEM_H) + overscan * 2;
              const end = Math.min(stops.length, start + visibleCount);
              const topPad = start * ITEM_H;
              const bottomPad = Math.max(0, (stops.length - end) * ITEM_H);
              const slice = stops.slice(start, end);
              return (
                <div className="grid gap-3">
                  <div style={{ height: topPad }} />
                  {slice.map(s => (
                    <StopCard key={s.id} stop={s} onSelect={handleSelect} onAfterAction={handleAfterAction} />
                  ))}
                  <div style={{ height: bottomPad }} />
                </div>
              );
            })()
          ) : (
            <div className="grid gap-3">
              {stops.map(s => (
                <StopCard key={s.id} stop={s} onSelect={handleSelect} onAfterAction={handleAfterAction} />
              ))}
            </div>
          )}
          {!stops.length && !loading && (
            <div className="text-sm text-slate-500">No stops for today.</div>
          )}
        </aside>

      </div>
      <StopDetails stop={details} onClose={() => setDetails(null)} />
    </Layout>
  );
}

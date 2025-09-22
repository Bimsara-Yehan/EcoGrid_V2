import React from "react";
import { logout } from "../services/auth";
import { useNavigate } from "react-router-dom";
import SchedulerLayout from "../components/scheduler/SchedulerLayout";
import SchedulerMap, { useFitDriver, useFitAll, useClearSelection } from "../components/scheduler/SchedulerMap";
import LayerToggles from "../components/scheduler/LayerToggles";
import { fetchDepots, fetchFacilities, fetchCustomersDue, fetchBins, fetchIncidents, fetchDrivers } from "../services/scheduler";
import DriverPanel from "../components/scheduler/DriverPanel";
import PlanningPanel, { type Plan } from "../components/scheduler/PlanningPanel";
import ScrollSection from "../components/scheduler/ScrollSection";
import IncidentsPanel from "../components/scheduler/IncidentsPanel";
import ConfirmModal from "../components/scheduler/ConfirmModal";
import { suggestPlan } from "../components/scheduler/planningUtils";
import { publishPlan as apiPublishPlan } from "../services/schedulerApi";


type Toggles = { customers: boolean; bins: boolean; incidents: boolean; facilities: boolean; depots: boolean; numbers: boolean };

export default function SchedulerPage() {
  const navigate = useNavigate();
  const [toggles, setToggles] = React.useState<Toggles>({ customers: true, bins: true, incidents: true, facilities: true, depots: true, numbers: false });
  const [depots, setDepots] = React.useState([] as Awaited<ReturnType<typeof fetchDepots>>);
  const [drivers, setDrivers] = React.useState([] as Awaited<ReturnType<typeof fetchDrivers>>);
  const [facilities, setFacilities] = React.useState([] as Awaited<ReturnType<typeof fetchFacilities>>);
  const [customers, setCustomers] = React.useState([] as Awaited<ReturnType<typeof fetchCustomersDue>>);
  const [bins, setBins] = React.useState([] as Awaited<ReturnType<typeof fetchBins>>);
  const [incidents, setIncidents] = React.useState([] as Awaited<ReturnType<typeof fetchIncidents>>);

  React.useEffect(() => {
    (async () => {
      const [d, f, c, b, i, drv] = await Promise.all([
        fetchDepots(),
        fetchFacilities(),
        fetchCustomersDue(),
        fetchBins(),
        fetchIncidents(),
        fetchDrivers(),
      ]);
      setDepots(d); setFacilities(f); setCustomers(c); setBins(b); setIncidents(i); setDrivers(drv);
    })();
  }, []);

  // IoT: refresh bins periodically (15s) to reflect latest fill levels and pickup candidates
  React.useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const b = await fetchBins();
        setBins(b);
      } catch (e) {
        // best-effort refresh; avoid noisy toasts
        // console.warn("Failed to refresh bins", e);
      }
    }, 15000);
    return () => clearInterval(intervalId);
  }, []);
  const [driverConfig, setDriverConfig] = React.useState<Record<string, { depotId?: string; windowStart?: string; windowEnd?: string; maxStops?: number }>>({});
  const [plan, setPlan] = React.useState<Plan>({});
  const [serviceDate, setServiceDate] = React.useState<string>(() => new Date().toISOString().slice(0, 10));
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [focusedDriverId, setFocusedDriverId] = React.useState<string | undefined>(undefined);
  const [hoveredStop, setHoveredStop] = React.useState<{ driverId: string; stopId: string } | null>(null);
  const [fitDriverSignal, setFitDriverSignal] = React.useState(0);
  const [fitAllSignal, setFitAllSignal] = React.useState(0);
  const [clearSignal, setClearSignal] = React.useState(0);
  const [showLegend, setShowLegend] = React.useState(false);

  // Searches
  const [driverSearch, setDriverSearch] = React.useState("");
  const [planningSearch, setPlanningSearch] = React.useState("");
  const [binsSearch, setBinsSearch] = React.useState("");
  const [binsCandidatesOnly, setBinsCandidatesOnly] = React.useState(false);
  const [binsSort, setBinsSort] = React.useState<"fill"|"updated">("fill");

  // Filtered lists for display
  const filteredDrivers = React.useMemo(() => {
    const q = driverSearch.trim().toLowerCase();
    if (!q) return drivers;
    return drivers.filter(d => d.name.toLowerCase().includes(q) || d.id.toLowerCase().includes(q));
  }, [drivers, driverSearch]);

  const planningDrivers = React.useMemo(() => {
    const q = planningSearch.trim().toLowerCase();
    if (!q) return drivers;
    return drivers.filter(d => {
      if (d.name.toLowerCase().includes(q) || d.id.toLowerCase().includes(q)) return true;
      const stops = plan[d.id] ?? [];
      return stops.some(s => s.name.toLowerCase().includes(q));
    });
  }, [drivers, planningSearch, plan]);

  const filteredBins = React.useMemo(() => {
    const q = binsSearch.trim().toLowerCase();
    let list = bins;
    if (binsCandidatesOnly) list = list.filter(b => b.needsPickup);
    if (q) list = list.filter(b => b.name.toLowerCase().includes(q));
    list = [...list].sort((a, b) => {
      if (binsSort === "fill") return (b.fillLevel||0) - (a.fillLevel||0);
      const ta = a.measuredAt ? new Date(a.measuredAt).getTime() : 0;
      const tb = b.measuredAt ? new Date(b.measuredAt).getTime() : 0;
      return tb - ta;
    });
    return list;
  }, [bins, binsSearch, binsCandidatesOnly, binsSort]);

  function runSuggestFromToolbar() {
    const depotById = Object.fromEntries(depots.map(d => [d.id, d]));
    const next = suggestPlan(planningDrivers, depots, driverConfig, customers, depotById);
    setPlan(next);
  }

  const toolbarLeft = (
    <div className="flex items-center gap-2">
      <label className="text-sm flex items-center gap-2">
        <span className="text-slate-700">Service date</span>
        <input type="date" className="border rounded-lg px-2 py-1.5" value={serviceDate} onChange={e => setServiceDate(e.target.value)} />
      </label>
    </div>
  );
  const toolbarRight = (
    <div className="flex items-center gap-2">
      <button className="text-sm px-2 py-1 rounded-full bg-slate-100" onClick={() => driversAnchor.current?.scrollIntoView({ behavior: "smooth" })}>Drivers {drivers.length}</button>
      <button className="text-sm px-2 py-1 rounded-full bg-slate-100" onClick={() => planningAnchor.current?.scrollIntoView({ behavior: "smooth" })}>Stops {Object.values(plan).reduce((n, arr) => n + (arr?.length || 0), 0)}</button>
      <button className="text-sm px-2 py-1 rounded-full bg-slate-100" onClick={() => incidentsAnchor.current?.scrollIntoView({ behavior: "smooth" })}>Incidents {incidents.length}</button>
      <button className="px-3 py-2 rounded-lg bg-slate-100" onClick={runSuggestFromToolbar}>Suggest routes</button>
      <div className="hidden lg:flex items-center gap-2">
        <button className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300" onClick={() => setClearSignal(s => s + 1)}>Clear</button>
        <button className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300" onClick={() => setFitDriverSignal(s => s + 1)}>Fit driver</button>
        <button className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300" onClick={() => setFitAllSignal(s => s + 1)}>Fit all</button>
        <button className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300" onClick={() => setShowLegend(v => !v)}>{showLegend ? "Hide legend" : "Legend"}</button>
      </div>
      <button className="px-3 py-2 rounded-lg bg-green-600 text-white font-semibold" onClick={() => setConfirmOpen(true)} disabled={!Object.values(plan).some(a => a.length)}>Publish</button>
      <button className="px-3 py-2 rounded-lg bg-slate-100" onClick={() => { logout(); navigate("/login", { replace: true }); }}>Logout</button>
    </div>
  );
  // KPI total across drivers for toolbar section
  const totalKpi = React.useMemo(() => {
    // replicate metrics: rough estimate from plan and depots
    const avgSpeedKmh = 25;
    const depotById = Object.fromEntries(depots.map(d => [d.id, d]));
    let stops = 0; let km = 0; let min = 0;
    for (const d of drivers) {
      const depId = (driverConfig[d.id]?.depotId || d.defaultDepotId) as string | undefined;
      const dep = depId ? depotById[depId] : undefined;
      const arr = plan[d.id] || [];
      stops += arr.length;
      let prev = dep?.coords;
      for (const s of arr) {
        if (prev) {
          // haversine inline
          const toRad = (x:number)=>x*Math.PI/180;
          const a = prev, b = s.coords; const R = 6371;
          const dLat = toRad(b[0]-a[0]); const dLon = toRad(b[1]-a[1]);
          const lat1 = toRad(a[0]); const lat2 = toRad(b[0]);
          const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
          km += 2*R*Math.asin(Math.min(1, Math.sqrt(h)));
        }
        prev = s.coords;
      }
    }
    min = Math.round((km/avgSpeedKmh)*60 + stops*3);
    return { stops, km: km.toFixed(1), min };
  }, [drivers, plan, driverConfig, depots]);

  const chips = (
    <div className="flex items-center justify-between gap-3">
      <LayerToggles state={toggles} onChange={setToggles} />
      <div className="text-sm text-slate-700">Total: <span className="font-medium">{totalKpi.stops}</span> stops · <span className="font-medium">{totalKpi.km}</span> km · <span className="font-medium">{totalKpi.min}</span> min</div>
    </div>
  );

  const driversAnchor = React.useRef<HTMLDivElement>(null);
  const planningAnchor = React.useRef<HTMLDivElement>(null);
  const incidentsAnchor = React.useRef<HTMLDivElement>(null);

  // hook up external control signals
  // note: these hooks don't render anything; they just react to state changes
  // they require access to map; we pass signals down to SchedulerMap as well

  return (
    <SchedulerLayout toolbarLeft={toolbarLeft} toolbarRight={toolbarRight} chips={chips}>
      {showLegend && (
        <div className="fixed z-[1100] right-4 top-[64px] bg-white border border-slate-200 shadow rounded-xl p-3 text-sm" role="dialog" aria-label="Driver color legend">
          <div className="font-semibold mb-2">Driver legend</div>
          <div className="grid gap-1">
            {drivers.map(d => (
              <div key={`lg-${d.id}`} className="flex items-center gap-2">
                <span className="inline-block w-3.5 h-3.5 rounded-full" style={{ background: d.color }} />
                <span>{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <section>
        <SchedulerMap
          depots={depots}
          facilities={facilities}
          customers={customers}
          bins={bins}
          incidents={incidents}
          show={toggles}
          plan={plan}
          drivers={drivers}
          driverDepotIdByDriverId={Object.fromEntries(drivers.map(d => [d.id, (driverConfig[d.id]?.depotId || d.defaultDepotId) as string | undefined]))}
          focusedDriverId={focusedDriverId}
          hoveredStopId={hoveredStop?.stopId}
          showFitControls={false}
          onMarkerClick={(driverId, binId) => {
            const currentDriver = focusedDriverId || drivers[0]?.id;
            if (!currentDriver) return;
            const bin = bins.find(b => b.id === binId);
            if (!bin) return;
            const next = { ...plan };
            const arr = next[currentDriver] ? [...next[currentDriver]] : [];
            arr.push({ id: `bin-${bin.id}`, name: `${bin.name} (${bin.fillLevel}%)`, coords: bin.coords } as any);
            next[currentDriver] = arr;
            setPlan(next);
          }}
          fitDriverSignal={fitDriverSignal}
          fitAllSignal={fitAllSignal}
          clearSelectionSignal={clearSignal}
        />
        {/* Bins panel moved under the map to utilize wide space */}
        <div className="mt-3">
          <ScrollSection title="Bins" count={filteredBins.length} maxHeight={260} search={binsSearch} onSearch={setBinsSearch} right={(
            <div className="flex items-center gap-2">
              <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={binsCandidatesOnly} onChange={e => setBinsCandidatesOnly(e.target.checked)} /> Candidates</label>
              <select className="border rounded-lg px-2 py-1 text-xs" value={binsSort} onChange={e => setBinsSort(e.target.value as any)}>
                <option value="fill">Fill%</option>
                <option value="updated">Updated</option>
              </select>
            </div>
          )}>
            <div className="grid gap-1">
              {filteredBins.map(b => (
                <div key={b.id} className="flex items-center justify-between border rounded-lg px-2 py-1.5">
                  <div>
                    <div className="font-medium text-sm">{b.name}</div>
                    <div className="text-xs text-slate-600">{b.fillLevel}% · {b.measuredAt ? new Date(b.measuredAt).toLocaleTimeString() : "—"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {b.needsPickup && <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700">Needs pickup</span>}
                    <button className="px-2 py-1 rounded bg-slate-100 text-xs" onClick={() => {
                      const currentDriver = focusedDriverId || drivers[0]?.id;
                      if (!currentDriver) return;
                      const currentStops = plan[currentDriver]?.length || 0;
                      const maxStops = (driverConfig[currentDriver]?.maxStops ?? drivers.find(d => d.id === currentDriver)?.maxStops ?? 40);
                      if (currentStops >= maxStops) { alert(`Max ${maxStops} stops reached for this driver`); return; }
                      const next = { ...plan };
                      const arr = next[currentDriver] ? [...next[currentDriver]] : [];
                      arr.push({ id: `bin-${b.id}`, name: `${b.name} (${b.fillLevel}%)`, coords: b.coords } as any);
                      next[currentDriver] = arr;
                      setPlan(next);
                    }}>Add</button>
                  </div>
                </div>
              ))}
              {!filteredBins.length && (
                <div className="text-sm text-slate-500">No bins.</div>
              )}
            </div>
          </ScrollSection>
        </div>
      </section>
      <aside className="grid gap-4">
        <ScrollSection title="Drivers" count={filteredDrivers.length} maxHeight={260} search={driverSearch} onSearch={setDriverSearch} anchorRef={driversAnchor}>
          <DriverPanel
            drivers={filteredDrivers}
            depots={depots}
            value={driverConfig}
            onChange={setDriverConfig}
            plan={plan}
            focusedDriverId={focusedDriverId}
            onFocusDriver={(id) => setFocusedDriverId(id)}
          />
        </ScrollSection>
        <ScrollSection title="Planning" maxHeight={260} search={planningSearch} onSearch={setPlanningSearch} anchorRef={planningAnchor}>
          <PlanningPanel
            drivers={planningDrivers}
            depots={depots}
            customers={customers}
            driverConfig={driverConfig}
            value={plan}
            onChange={setPlan}
            focusedDriverId={focusedDriverId}
            onFocusDriver={(id) => setFocusedDriverId(id)}
            onHoverStop={(driverId, stopId) => setHoveredStop({ driverId, stopId })}
            onLeaveStop={() => setHoveredStop(null)}
            onClickStop={(driverId, stopId, coords) => {
              setFocusedDriverId(driverId);
              // Centering handled by map's Fit buttons later; for now, just keep state
            }}
            serviceDate={serviceDate}
          />
        </ScrollSection>
        <ScrollSection title="Incidents" count={incidents.length} maxHeight={220} anchorRef={incidentsAnchor}>
          <IncidentsPanel incidents={incidents} />
        </ScrollSection>
      </aside>

      <ConfirmModal
        open={confirmOpen}
        date={serviceDate}
        drivers={planningDrivers.map(d => ({ id: d.id, name: d.name, stops: (plan[d.id] || []).length }))}
        onClose={() => setConfirmOpen(false)}
        onConfirm={async () => {
          setConfirmOpen(false);
          try {
            const selectedDrivers = planningDrivers.filter(d => (plan[d.id] || []).length > 0);
            if (selectedDrivers.length === 0) {
              alert("Nothing to publish: no drivers with stops.");
              return;
            }
            const payload = {
              planId: `plan-${serviceDate}`,
              planVersion: 1,
              date: serviceDate,
              drivers: selectedDrivers.map(d => ({
                driverUid: d.id, // TODO: map to real auth UID in prod
                stops: (plan[d.id] || []).map(s => {
                  const isBin = s.id.startsWith("bin-");
                  const binId = isBin ? s.id.replace("bin-", "") : undefined;
                  return isBin
                    ? ({ kind: "bin" as const, title: s.name, coords: s.coords, meta: { binId } })
                    : ({ kind: "household" as const, title: s.name, coords: s.coords });
                })
              }))
            };
            await apiPublishPlan(payload);
            alert("Published!");
          } catch (e: any) {
            console.error(e);
            alert("Publish failed");
          }
        }}
      />
    </SchedulerLayout>
  );
}



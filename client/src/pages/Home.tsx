import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ExternalLink, HeartHandshake, Landmark, PiggyBank, Plane, RefreshCcw, Sparkles, Users, WalletCards } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const toCurrency = (cents: number) => currency.format(cents / 100);
const toCents = (value: string) => Math.max(0, Math.round((Number(value) || 0) * 100));
const displayMoney = (cents: number) => (cents / 100).toFixed(2);
const categoryOrder = [
  "Photography, Services & Entertainment",
  "Attire, Beauty & Accessories",
  "Food & Beverage",
  "Flowers & Décor",
  "Stationery & Guest Keepsakes",
  "Cake & Desserts",
  "Closeout & Contingency",
];

type TrackerItem = {
  id: string;
  tracker: "wedding" | "honeymoon";
  majorCategory: string;
  label: string;
  plannedCents: number;
  spentCents: number;
  sortOrder: number;
  updatedAt: Date;
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#675e54]">{children}</label>;
}

function MoneyInput({ cents, onSave, ariaLabel }: { cents: number; onSave: (value: number) => void; ariaLabel: string }) {
  return (
    <div className="relative min-w-[108px]">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#675e54]">$</span>
      <Input aria-label={ariaLabel} defaultValue={displayMoney(cents)} key={`${ariaLabel}-${cents}`} min="0" step="0.01" type="number" className="h-9 border-[#dccca7] bg-[#fffaf0] pl-6 text-right font-medium shadow-none focus-visible:ring-[#9b7637]" onBlur={event => onSave(toCents(event.target.value))} />
    </div>
  );
}

export default function Home() {
  const plannerQuery = trpc.planner.get.useQuery(undefined, { refetchOnWindowFocus: false });
  const utils = trpc.useUtils();
  const updateSettings = trpc.planner.updateSettings.useMutation({ onSuccess: async () => { await utils.planner.get.invalidate(); toast.success("Plan inputs saved"); }, onError: () => toast.error("Could not save those inputs") });
  const updateItem = trpc.planner.updateItem.useMutation({ onSuccess: async () => utils.planner.get.invalidate(), onError: () => toast.error("Could not save that budget line") });
  const restoreWedding = trpc.planner.restoreWedding.useMutation({ onSuccess: async () => { await utils.planner.get.invalidate(); toast.success("Wedding tracker restored to the starting plan"); }, onError: () => toast.error("Could not restore the wedding tracker") });
  const restoreHoneymoon = trpc.planner.restoreHoneymoon.useMutation({ onSuccess: async () => { await utils.planner.get.invalidate(); toast.success("Honeymoon tracker restored to the starting plan"); }, onError: () => toast.error("Could not restore the honeymoon tracker") });

  const data = plannerQuery.data;
  const calculations = useMemo(() => {
    if (!data) return null;
    const weddingItems = data.items.filter(item => item.tracker === "wedding");
    const honeymoonItems = data.items.filter(item => item.tracker === "honeymoon");
    const weddingPlanned = weddingItems.reduce((total, item) => total + item.plannedCents, 0);
    const weddingSpent = weddingItems.reduce((total, item) => total + item.spentCents, 0);
    const honeymoonPlanned = honeymoonItems.reduce((total, item) => total + item.plannedCents, 0);
    const honeymoonSpent = honeymoonItems.reduce((total, item) => total + item.spentCents, 0);
    const rollup = categoryOrder.map(name => {
      const entries = weddingItems.filter(item => item.majorCategory === name);
      const planned = entries.reduce((total, item) => total + item.plannedCents, 0);
      const spent = entries.reduce((total, item) => total + item.spentCents, 0);
      return { name, planned, spent, remaining: planned - spent, share: weddingPlanned ? planned / weddingPlanned : 0 };
    });
    const weddingTotal = data.settings.venueCostPaidCents + weddingPlanned;
    const variance = data.settings.weddingBudgetCents - weddingTotal;
    const scenarios = [80, 100, 125, 150, 175].map(guests => ({ guests, wedding: weddingTotal / guests / 100, combined: (weddingTotal + data.settings.honeymoonBudgetCents) / guests / 100 }));
    return { weddingItems, honeymoonItems, weddingPlanned, weddingSpent, honeymoonPlanned, honeymoonSpent, rollup, weddingTotal, variance, scenarios };
  }, [data]);

  if (plannerQuery.isLoading || !data || !calculations) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f7f3ea]"><div className="rounded-2xl border border-[#e4d8bc] bg-white px-6 py-5 font-serif text-lg text-[#5a2435] shadow-sm">Opening your shared planner…</div></main>;
  }

  const { settings } = data;
  const { weddingItems, honeymoonItems, weddingPlanned, weddingSpent, honeymoonPlanned, honeymoonSpent, rollup, weddingTotal, variance, scenarios } = calculations;
  const perGuest = settings.guestCount ? weddingTotal / settings.guestCount : 0;
  const combinedPerGuest = settings.guestCount ? (weddingTotal + settings.honeymoonBudgetCents) / settings.guestCount : 0;
  const saveSettings = (key: keyof typeof settings, value: number | string) => updateSettings.mutate({ ...settings, [key]: value, venueName: "Cottonwood Barn" });
  const saveItem = (item: typeof data.items[number], key: "plannedCents" | "spentCents", value: number) => updateItem.mutate({ id: item.id, plannedCents: key === "plannedCents" ? value : item.plannedCents, spentCents: key === "spentCents" ? value : item.spentCents });

  return (
    <div className="min-h-screen bg-[#f7f3ea] text-[#302622]">
      <header className="border-b border-[#e5dbc6] bg-[#fffdf8] px-4 py-4 lg:px-8">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5a2435] text-[#f6dfa5]"><HeartHandshake size={20} /></div><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8b745b]">Shared celebration plan</p><h1 className="font-serif text-2xl font-bold tracking-tight text-[#5a2435]">Kyia + Keilen</h1></div></div>
          <Badge className="border border-[#cbb47a] bg-[#fbf2d7] px-3 py-1.5 text-[#725522] hover:bg-[#fbf2d7]"><Sparkles className="mr-1.5 h-3.5 w-3.5" />Private link planner</Badge>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 lg:grid-cols-[220px_1fr]">
        <aside className="border-b border-[#e5dbc6] bg-[#f1eadb] px-4 py-6 lg:min-h-[calc(100vh-73px)] lg:border-b-0 lg:border-r">
          <nav className="sticky top-5 flex gap-2 overflow-x-auto lg:flex-col"><a href="#overview" className="nav-link"><WalletCards size={16} />Overview</a><a href="#wedding" className="nav-link"><Landmark size={16} />Wedding plan</a><a href="#honeymoon" className="nav-link"><Plane size={16} />Honeymoon</a><a href="#scenarios" className="nav-link"><Users size={16} />Guest scenarios</a></nav>
          <div className="mt-8 hidden rounded-xl border border-[#d6c39a] bg-[#fff9e9] p-4 lg:block"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#80622b]">Venue</p><p className="mt-1 font-serif text-lg font-bold text-[#5a2435]">Cottonwood Barn</p><p className="mt-1 text-sm text-[#675e54]">Paris, Texas<br />July 11, 2027</p></div>
        </aside>

        <main className="min-w-0 space-y-7 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <section id="overview" className="scroll-mt-6">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="eyebrow">Wedding planner</p><h2 className="font-serif text-3xl font-bold text-[#5a2435]">Your plan at a glance</h2><p className="mt-1 text-sm text-[#675e54]">Every figure below is saved to your shared planner.</p></div><div className="rounded-lg border border-[#d9c69b] bg-[#fffaf0] px-3 py-2 text-sm text-[#5f513d]"><strong>{settings.guestCount}</strong> guests • {settings.venueCapacity} venue capacity</div></div>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Total wedding budget" value={toCurrency(settings.weddingBudgetCents)} detail="Confirmed planning limit" tone="burgundy" />
              <MetricCard label="Allocated after venue" value={toCurrency(weddingPlanned)} detail={`${toCurrency(settings.venueCostPaidCents)} venue paid`} tone="gold" />
              <MetricCard label="Wedding cost / guest" value={toCurrency(perGuest)} detail={`Based on ${settings.guestCount} guests`} tone="sage" />
              <MetricCard label="Wedding + honeymoon / guest" value={toCurrency(combinedPerGuest)} detail="Combined celebration view" tone="cream" />
            </section>
            <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${variance >= 0 ? "border-[#b8c9ad] bg-[#eaf1e5] text-[#365030]" : "border-[#e6bac0] bg-[#fff0f1] text-[#8a2633]"}`}><strong>{variance >= 0 ? "Within wedding budget." : "Budget attention needed."}</strong> Venue plus planned wedding lines total {toCurrency(weddingTotal)}. {variance >= 0 ? `${toCurrency(variance)} remains unallocated.` : `${toCurrency(Math.abs(variance))} is above the wedding budget.`}</div>
          </section>

          <section className="panel" aria-label="Wedding plan inputs"><div className="panel-heading"><div><p className="eyebrow">Inputs</p><h2 className="font-serif text-2xl font-bold text-[#5a2435]">Wedding plan details</h2></div><span className="text-xs text-[#675e54]">Edit and click outside a field to save.</span></div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div><FieldLabel>Wedding date</FieldLabel><Input key={settings.weddingDate} type="date" defaultValue={settings.weddingDate} className="mt-1.5 h-10 border-[#dccca7] bg-[#fffaf0]" onBlur={event => saveSettings("weddingDate", event.target.value)} /></div>
              <div><FieldLabel>Guest count</FieldLabel><Input key={`guest-${settings.guestCount}`} type="number" min="1" defaultValue={settings.guestCount} className="mt-1.5 h-10 border-[#dccca7] bg-[#fffaf0]" onBlur={event => saveSettings("guestCount", Number(event.target.value) || 1)} /></div>
              <div><FieldLabel>Venue capacity</FieldLabel><Input key={`capacity-${settings.venueCapacity}`} type="number" min="1" defaultValue={settings.venueCapacity} className="mt-1.5 h-10 border-[#dccca7] bg-[#fffaf0]" onBlur={event => saveSettings("venueCapacity", Number(event.target.value) || 1)} /></div>
              <div><FieldLabel>Wedding budget</FieldLabel><MoneyInput ariaLabel="Wedding budget" cents={settings.weddingBudgetCents} onSave={value => saveSettings("weddingBudgetCents", value)} /></div>
              <div><FieldLabel>Honeymoon budget</FieldLabel><MoneyInput ariaLabel="Honeymoon budget" cents={settings.honeymoonBudgetCents} onSave={value => saveSettings("honeymoonBudgetCents", value)} /></div>
              <div><FieldLabel>Cottonwood Barn venue cost paid</FieldLabel><MoneyInput ariaLabel="Cottonwood Barn venue cost paid" cents={settings.venueCostPaidCents} onSave={value => saveSettings("venueCostPaidCents", value)} /></div>
            </div>
          </section>

          <section id="wedding" className="scroll-mt-6 space-y-5"><div className="section-title-row"><div><p className="eyebrow">Wedding budget</p><h2 className="font-serif text-3xl font-bold text-[#5a2435]">Detailed wedding tracker</h2><p className="mt-1 text-sm text-[#675e54]">21 editable line items roll into seven major categories.</p></div><Button variant="outline" className="border-[#b28b46] bg-[#fffaf0] text-[#6e4b15] hover:bg-[#fbf2d7]" onClick={() => restoreWedding.mutate()} disabled={restoreWedding.isPending}><RefreshCcw className="mr-2 h-4 w-4" />Restore starting plan</Button></div>
            <TrackerTable items={weddingItems} onSave={saveItem} totalPlanned={weddingPlanned} totalSpent={weddingSpent} />
            <div className="panel overflow-hidden"><div className="panel-heading"><div><p className="eyebrow">Live rollup</p><h3 className="font-serif text-2xl font-bold text-[#5a2435]">Major categories</h3></div><p className="text-sm text-[#675e54]">Driven by the detailed tracker</p></div><div className="overflow-x-auto"><table className="budget-table min-w-[740px]"><thead><tr><th>Major category</th><th>Planned</th><th>Spent</th><th>Remaining</th><th>Share</th></tr></thead><tbody>{rollup.map(row => <tr key={row.name}><td className="font-semibold text-[#4b2632]">{row.name}</td><td>{toCurrency(row.planned)}</td><td>{toCurrency(row.spent)}</td><td>{toCurrency(row.remaining)}</td><td>{(row.share * 100).toFixed(1)}%</td></tr>)}</tbody><tfoot><tr><td>Total</td><td>{toCurrency(weddingPlanned)}</td><td>{toCurrency(weddingSpent)}</td><td>{toCurrency(weddingPlanned - weddingSpent)}</td><td>100.0%</td></tr></tfoot></table></div></div>
          </section>

          <section id="honeymoon" className="scroll-mt-6 space-y-5"><div className="section-title-row"><div><p className="eyebrow">Honeymoon budget</p><h2 className="font-serif text-3xl font-bold text-[#5a2435]">Plan the getaway</h2><p className="mt-1 text-sm text-[#675e54]">Track your six major honeymoon categories in the same shared plan.</p></div><Button variant="outline" className="border-[#819677] bg-[#f6fbf2] text-[#45603b] hover:bg-[#eaf1e5]" onClick={() => restoreHoneymoon.mutate()} disabled={restoreHoneymoon.isPending}><RefreshCcw className="mr-2 h-4 w-4" />Restore starting plan</Button></div>
            <div className="rounded-xl border border-[#d6ddcf] bg-[#f6fbf2] p-4 sm:flex sm:items-center sm:justify-between"><div><p className="font-serif text-lg font-bold text-[#45603b]">All-inclusive deal-search examples</p><p className="mt-1 text-sm text-[#50604d]">Begin searches with <strong>Dallas/DFW</strong> as your departure area, then compare total cost, flights, transfers, baggage rules, and cancellation terms.</p></div><div className="mt-3 flex flex-wrap gap-2 sm:mt-0"><a className="deal-link" href="https://www.greatvaluevacations.com/" target="_blank" rel="noreferrer">Great Value Vacations <ExternalLink size={14} /></a><a className="deal-link" href="https://www.vacationexpress.com/" target="_blank" rel="noreferrer">Vacation Express <ExternalLink size={14} /></a></div></div>
            <TrackerTable items={honeymoonItems} onSave={saveItem} totalPlanned={honeymoonPlanned} totalSpent={honeymoonSpent} isHoneymoon />
          </section>

          <section id="scenarios" className="panel scroll-mt-6"><div className="panel-heading"><div><p className="eyebrow">Guest analysis</p><h2 className="font-serif text-3xl font-bold text-[#5a2435]">Guest count vs. per-person cost</h2><p className="mt-1 text-sm text-[#675e54]">Wedding-only costs exclude the honeymoon. The combined series includes the honeymoon budget.</p></div></div><div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]"><div className="overflow-x-auto"><table className="budget-table min-w-[450px]"><thead><tr><th>Guest count</th><th>Wedding / guest</th><th>Wedding + honeymoon / guest</th></tr></thead><tbody>{scenarios.map(row => <tr className={row.guests === settings.guestCount ? "current-scenario" : ""} key={row.guests}><td>{row.guests}{row.guests === settings.guestCount && <span className="ml-2 text-xs font-bold text-[#6e4b15]">Current plan</span>}</td><td>{currency.format(row.wedding)}</td><td>{currency.format(row.combined)}</td></tr>)}</tbody></table></div><div className="h-[285px] min-w-0"><ResponsiveContainer width="100%" height="100%"><LineChart data={scenarios} margin={{ top: 10, right: 15, left: 10, bottom: 6 }}><CartesianGrid stroke="#e5dbc6" strokeDasharray="4 4" /><XAxis dataKey="guests" tickLine={false} axisLine={false} tick={{ fill: "#675e54", fontSize: 12 }} /><YAxis tickFormatter={value => `$${value}`} tickLine={false} axisLine={false} tick={{ fill: "#675e54", fontSize: 12 }} /><Tooltip formatter={(value: number) => currency.format(value)} labelFormatter={label => `${label} guests`} contentStyle={{ borderRadius: 12, borderColor: "#d8c7a3", backgroundColor: "#fffdf8" }} /><Line dataKey="wedding" name="Wedding only" stroke="#6e8a61" strokeWidth={3} dot={{ r: 4, fill: "#6e8a61" }} activeDot={{ r: 6 }} /><Line dataKey="combined" name="Wedding + honeymoon" stroke="#9b7637" strokeWidth={3} dot={{ r: 4, fill: "#9b7637" }} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer></div></div></section>

          <footer className="pb-3 text-center text-xs text-[#796f63]">A shared private-link planner for Kyia + Keilen. Changes save to the shared plan.</footer>
        </main>
      </div>
    </div>
  );
}

function MetricCard({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: "burgundy" | "gold" | "sage" | "cream" }) {
  return <article className={`metric-card metric-${tone}`}><p>{label}</p><strong>{value}</strong><span>{detail}</span></article>;
}

function TrackerTable({ items, onSave, totalPlanned, totalSpent, isHoneymoon = false }: { items: TrackerItem[]; onSave: (item: TrackerItem, key: "plannedCents" | "spentCents", value: number) => void; totalPlanned: number; totalSpent: number; isHoneymoon?: boolean }) {
  return <div className="panel overflow-hidden"><div className="overflow-x-auto"><table className="budget-table min-w-[790px]"><thead><tr>{!isHoneymoon && <th>Major category</th>}<th>{isHoneymoon ? "Honeymoon category" : "Specific sub-category"}</th><th>Planned allocation</th><th>Spent to date</th><th>Remaining</th></tr></thead><tbody>{items.map(item => <tr key={item.id}>{!isHoneymoon && <td className="text-sm font-semibold text-[#5b463b]">{item.majorCategory}</td>}<td className="font-semibold text-[#4b2632]">{item.label}</td><td><MoneyInput ariaLabel={`${item.label} planned allocation`} cents={item.plannedCents} onSave={value => onSave(item, "plannedCents", value)} /></td><td><MoneyInput ariaLabel={`${item.label} spent to date`} cents={item.spentCents} onSave={value => onSave(item, "spentCents", value)} /></td><td className="font-semibold">{toCurrency(item.plannedCents - item.spentCents)}</td></tr>)}</tbody><tfoot><tr><td colSpan={isHoneymoon ? 1 : 2}>Total</td><td>{toCurrency(totalPlanned)}</td><td>{toCurrency(totalSpent)}</td><td>{toCurrency(totalPlanned - totalSpent)}</td></tr></tfoot></table></div></div>;
}

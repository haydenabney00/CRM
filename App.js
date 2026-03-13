import React, { useState, useMemo, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const STAGES = ["Prospect", "Proposal", "LOI", "Under Contract", "Closed", "Lost"];
const INDUSTRIAL_SUBTYPES = ["Distribution", "Manufacturing", "Flex", "Cold Storage", "Data Center", "Light Industrial", "Heavy Industrial", "Truck Terminal", "Other"];
const LEAD_SOURCES = ["Email", "Letter/Mailer", "Referral", "Cold Call", "CoStar", "LoopNet", "LinkedIn", "Direct Owner Outreach", "Existing Client", "Other"];
const DEAL_TYPES = ["Sale", "Lease"];
const REP_TYPES = ["Seller/Landlord Rep", "Buyer/Tenant Rep", "Dual Rep"];
const LOSS_REASONS = ["Lost to Competitor", "Price Too High", "Client Went Internal", "Deal Fell Through", "Timing", "Other"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const LISTING_STATUSES = ["Active", "Under Contract", "Off Market", "Leased/Sold"];
const DEFAULT_SUBMARKETS = ["Northeast", "Northwest", "Southeast", "Southwest", "Central", "Airport/Industrial Corridor", "Port District", "Suburban", "Other"];
const NOTE_TYPES = ["General", "LOI Summary", "Deal Terms", "Landlord Requirements", "Tenant Requirements", "Legal", "Financial", "Other"];
const COMP_TYPES = ["Sale", "Lease"];
const COMP_SOURCES = ["CoStar", "LoopNet", "Public Record", "MLS", "Direct Knowledge", "News/Press", "Other Broker", "Other"];
const CONTACT_TYPES = ["Owner", "Tenant", "Investor", "Broker", "Attorney", "Lender", "Property Manager", "Other"];
const RELATIONSHIP_LEVELS = ["Cold", "Warm", "Active", "Key Relationship"];
const TASK_PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const RECURRENCE_OPTIONS = ["None", "Daily", "Weekly", "Bi-weekly", "Monthly", "Quarterly", "Annually"];
const EXPENSE_CATEGORIES = ["CoStar / Data", "LoopNet", "Marketing / Mailers", "E&O Insurance", "Dues / Memberships", "Transportation / Mileage", "Meals / Entertainment", "Office / Supplies", "Legal / Professional", "Other"];
const DEAL_TAG_SUGGESTIONS = ["Hot", "Off-Market", "Year-End Push", "Referral", "Repeat Client", "Portfolio", "Value-Add", "Distressed", "1031 Exchange", "New Construction", "Watch", "On Hold"];

const today = new Date().toISOString().split("T")[0];
const thisYear = new Date().getFullYear();
const thisMonth = new Date().getMonth();
const hour = new Date().getHours();
const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

const initialContacts = [
  { id: 1, name: "Bob Harrington", company: "Harrington Industrial LLC", type: "Owner", phone: "555-0101", email: "bob@harringtonind.com", submarket: "Northeast", properties: "42 Commerce Park, 100 Industrial Way", relationshipLevel: "Warm", lastContact: "2026-02-15", notes: "Owns 3 buildings NE submarket. May sell in 2027.", linkedDeals: [] },
  { id: 2, name: "Sarah Kim", company: "Metro Manufacturing", type: "Tenant", phone: "555-0188", email: "skim@metromfg.com", submarket: "Central", properties: "", relationshipLevel: "Active", lastContact: today, notes: "Current client on Gateway deal.", linkedDeals: [2] },
];
const initialTasks = [
  { id: 1, title: "Renew CoStar subscription", category: "Admin", priority: "High", dueDate: "2026-03-31", done: false, notes: "", linkedDealId: null },
  { id: 2, title: "Follow up with Bob Harrington re: NE portfolio", category: "Prospecting", priority: "Medium", dueDate: today, done: false, notes: "", linkedDealId: null },
];
const initialExpenses = [
  { id: 1, category: "CoStar / Data", description: "CoStar monthly subscription", amount: 650, date: "2026-03-01", notes: "" },
  { id: 2, category: "Marketing / Mailers", description: "Q1 NE owner mailer printing + postage", amount: 420, date: "2026-02-01", notes: "50 letters" },
];
const initialProperties = [
  { id: 1, name: "42 Commerce Park", address: "42 Commerce Park Dr", submarket: "Northeast", subtype: "Distribution", sqft: 85000, owner: "Harrington Industrial LLC", ownerContact: "Bob Harrington", yearBuilt: 2004, clearHeight: 32, dockDoors: 12, lastSalePrice: 0, notes: "Owner mentioned interest in selling 2027+.", tags: "Owner Prospect" },
];

const STAGE_COLORS = {
  Prospect:        { bg: "#0f1e35", text: "#60a5fa", border: "#1e3a5f", glow: "#3b82f620" },
  Proposal:        { bg: "#1a1500", text: "#fbbf24", border: "#2a2000", glow: "#f59e0b20" },
  LOI:             { bg: "#170e2a", text: "#a78bfa", border: "#2a1a4a", glow: "#8b5cf620" },
  "Under Contract":{ bg: "#1a0f00", text: "#fb923c", border: "#2a1800", glow: "#f9731620" },
  Closed:          { bg: "#0a1f14", text: "#34d399", border: "#0f2d1c", glow: "#10b98120" },
  Lost:            { bg: "#1a0808", text: "#f87171", border: "#2a0f0f", glow: "#ef444420" },
};

const initialDeals = [
  { id: 1, name: "Lakeside Distribution Center", client: "Apex Logistics", counterparty: "NorthStar Capital", stage: "Under Contract", dealType: "Sale", repType: "Seller/Landlord Rep", subtype: "Distribution", sqft: 85000, dealTotal: 2500000, commissionRate: 6, probability: 90, expectedClose: "2026-12-30", notes: "", broker: "Me", daysInStage: 8, activities: [], followUpDate: "", leadSource: "Referral", coBroker: "", splitPct: 100, won: null, lossReason: "", leaseTerm: 0, monthlyRent: 0, richNotes: [], submarket: "Northeast" },
  { id: 2, name: "Gateway Industrial Park Unit 4", client: "Metro Manufacturing", counterparty: "", stage: "Proposal", dealType: "Lease", repType: "Buyer/Tenant Rep", subtype: "Manufacturing", sqft: 32000, dealTotal: 0, commissionRate: 5, probability: 60, expectedClose: "2026-06-30", notes: "", broker: "Me", daysInStage: 14, activities: [], followUpDate: today, leadSource: "Cold Call", coBroker: "", splitPct: 100, won: null, lossReason: "", leaseTerm: 60, monthlyRent: 19200, richNotes: [], submarket: "Central" },
  { id: 3, name: "Clearfield Flex Space", client: "Clearfield Logistics", counterparty: "Wilkins Properties", stage: "Prospect", dealType: "Lease", repType: "Buyer/Tenant Rep", subtype: "Flex", sqft: 15000, dealTotal: 0, commissionRate: 5, probability: 40, expectedClose: "2026-09-30", notes: "", broker: "Me", daysInStage: 36, activities: [], followUpDate: "", leadSource: "Referral", coBroker: "Mike Davis", splitPct: 50, won: null, lossReason: "", leaseTerm: 36, monthlyRent: 11250, richNotes: [], submarket: "Southeast" },
];

const initialListings = [
  { id: 1, name: "Northgate Logistics Hub", address: "1200 Industrial Blvd", submarket: "Northeast", subtype: "Distribution", sqft: 120000, askingPrice: 0, monthlyRent: 72000, dealType: "Lease", status: "Active", listedDate: "2026-01-15", showings: [], marketingNotes: "", daysOnMarket: 54, askingPsfSale: 0, askingPsfLease: 0.60 },
  { id: 2, name: "Riverside Commerce Center", address: "450 River Rd", submarket: "Northwest", subtype: "Flex", sqft: 45000, askingPrice: 5400000, monthlyRent: 0, dealType: "Sale", status: "Active", listedDate: "2026-02-01", showings: [], marketingNotes: "", daysOnMarket: 37, askingPsfSale: 120, askingPsfLease: 0 },
];

const initialProspecting = [
  { id: 1, name: "Northeast Owner Mailer — Q1", type: "Letter/Mailer", submarket: "Northeast", targetCount: 50, sendDate: "2026-02-01", responses: 4, conversations: 2, convertedDeals: 0, notes: "Focused on owners 5+ years with no recent transaction", status: "Sent" },
];

const initialComps = [
  { id: 1, name: "Southpark Distribution Center", address: "800 Commerce Dr", submarket: "Southeast", subtype: "Distribution", sqft: 95000, compType: "Sale", salePrice: 11400000, monthlyRent: 0, leaseTerm: 0, psfSale: 120, psfLease: 0, closeDate: "2026-01-10", seller: "Patriot Properties", buyer: "Prologis", listingBroker: "CBRE", tenantBroker: "", source: "CoStar", notes: "", verified: true },
];

const fmt = (n) => "$" + Math.round(n || 0).toLocaleString();
const fmtSqft = (n) => n ? Number(n).toLocaleString() + " SF" : "—";
const pct = (n) => Number(n || 0).toFixed(1) + "%";


// ── Design Tokens ────────────────────────────────────────────────
const DS = {
  bg:        "#070e1a",
  surface:   "#0c1524",
  panel:     "#111d2e",
  panelHi:   "#162438",
  border:    "#1a2d45",
  borderHi:  "#243d5a",
  borderGlow:"#f59e0b22",
  text:      "#eef2f7",
  textSub:   "#8ba3be",
  textMute:  "#4a6080",
  textFaint: "#2a3f58",
  accent:    "#f59e0b",
  accentSoft:"#fbbf2422",
  accentDim: "#78350f",
  green:     "#10b981",
  greenSoft: "#10b98118",
  red:       "#ef4444",
  redSoft:   "#ef444418",
  blue:      "#3b82f6",
  blueSoft:  "#3b82f618",
  purple:    "#8b5cf6",
  purpleSoft:"#8b5cf618",
  r:   { xs: 4, sm: 7, md: 11, lg: 16, xl: 20, full: 999 },
  sp:  { xs: 4, sm: 8, md: 14, lg: 20, xl: 28, xxl: 40 },
  fs:  { xs: 10, sm: 11, md: 12, lg: 13, xl: 15, h3: 16, h2: 19, h1: 24 },
  fw:  { normal: 400, med: 500, semi: 600, bold: 700, black: 800 },
  shadow: {
    sm:  "0 1px 3px rgba(0,0,0,0.4)",
    md:  "0 4px 16px rgba(0,0,0,0.5)",
    lg:  "0 8px 32px rgba(0,0,0,0.6)",
    xl:  "0 20px 60px rgba(0,0,0,0.8)",
    glow:"0 0 20px rgba(245,158,11,0.15)",
  },
};

const globalIStyle = (extra = {}) => ({
  background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: DS.r.sm,
  color: DS.text, padding: "8px 11px", fontSize: DS.fs.lg, outline: "none",
  width: "100%", boxSizing: "border-box", ...extra,
});

// ── Toast Notification System ─────────────────────────────────────
let _toastSetter = null;
const toast = (msg, type = "success") => { if (_toastSetter) _toastSetter({ msg, type, id: Date.now() }); };

function ToastProvider() {
  const [t, setT] = useState(null);
  _toastSetter = setT;
  useEffect(() => { if (t) { const tid = setTimeout(() => setT(null), 2800); return () => clearTimeout(tid); } }, [t]);
  if (!t) return null;
  const colors = { success: DS.green, error: DS.red, info: DS.blue, warning: DS.accent };
  const color = colors[t.type] || DS.green;
  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 9999, background: "rgba(17,29,46,0.96)", backdropFilter: "blur(16px)", border: `1px solid ${color}33`, borderLeft: `3px solid ${color}`, borderRadius: DS.r.md, padding: "12px 18px", color: DS.text, fontSize: DS.fs.lg, fontWeight: DS.fw.semi, boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 16px ${color}18`, maxWidth: 320, animation: "fadeSlideIn 0.2s cubic-bezier(0.4,0,0.2,1)" }}>
      {t.msg}
    </div>
  );
}

// ── Global Search ──────────────────────────────────────────────────
function GlobalSearch({ deals, contacts, properties, comps, tasks, onNavigate, onClose }) {
  const [q, setQ] = useState("");
  const inputRef = useState(null);

  const results = useMemo(() => {
    if (!q.trim() || q.length < 2) return [];
    const lq = q.toLowerCase();
    const hits = [];
    deals.forEach(d => { if ((d.name+d.client+d.counterparty+d.submarket).toLowerCase().includes(lq)) hits.push({ type: "Deal", label: d.name, sub: `${d.stage} · ${d.client}`, tab: "pipeline", color: DS.accent }); });
    contacts.forEach(c => { if ((c.name+c.company+c.email).toLowerCase().includes(lq)) hits.push({ type: "Contact", label: c.name, sub: `${c.company} · ${c.type}`, tab: "contacts", color: DS.blue }); });
    properties.forEach(p => { if ((p.name+p.address+p.submarket+p.owner).toLowerCase().includes(lq)) hits.push({ type: "Property", label: p.name, sub: `${p.submarket} · ${p.subtype}`, tab: "properties", color: DS.purple }); });
    comps.forEach(c => { if ((c.name+c.address+c.submarket+c.buyer+c.seller).toLowerCase().includes(lq)) hits.push({ type: "Comp", label: c.name, sub: `${c.submarket} · ${c.compType}`, tab: "comps", color: DS.green }); });
    tasks.forEach(t => { if ((t.title+t.notes).toLowerCase().includes(lq)) hits.push({ type: "Task", label: t.title, sub: `${t.category} · ${t.priority}`, tab: "tasks", color: "#f97316" }); });
    return hits.slice(0, 12);
  }, [q, deals, contacts, properties, comps, tasks]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 9000, paddingTop: 80 }} onClick={onClose}>
      <div style={{ background: DS.panel, border: `1px solid ${DS.borderHi}`, borderRadius: DS.r.xl, width: 580, overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: `1px solid ${DS.border}` }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DS.textMute} strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search deals, contacts, properties, comps, tasks..." style={{ flex: 1, background: "none", border: "none", color: DS.text, fontSize: DS.fs.xl, outline: "none" }} onKeyDown={e => e.key === "Escape" && onClose()} />
          <kbd style={{ background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: 4, padding: "2px 7px", fontSize: DS.fs.xs, color: DS.textMute }}>ESC</kbd>
        </div>
        {q.length >= 2 && results.length === 0 && <div style={{ padding: "24px", textAlign: "center", color: DS.textMute, fontSize: DS.fs.md }}>No results for "{q}"</div>}
        {results.length > 0 && (
          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            {results.map((r, i) => (
              <div key={i} onClick={() => { onNavigate(r.tab); onClose(); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 18px", cursor: "pointer", borderBottom: `1px solid ${DS.border}` }}
                onMouseEnter={e => e.currentTarget.style.background = DS.surface}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <span style={{ background: r.color + "22", color: r.color, border: `1px solid ${r.color}33`, padding: "2px 8px", borderRadius: 20, fontSize: DS.fs.xs, fontWeight: DS.fw.bold, flexShrink: 0, minWidth: 52, textAlign: "center" }}>{r.type}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: DS.text, fontWeight: DS.fw.semi, fontSize: DS.fs.md, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.label}</div>
                  <div style={{ color: DS.textMute, fontSize: DS.fs.xs }}>{r.sub}</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={DS.textFaint} strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            ))}
          </div>
        )}
        {!q && <div style={{ padding: "16px 18px", color: DS.textMute, fontSize: DS.fs.sm }}>Type to search across all deals, contacts, properties, comps, and tasks.</div>}
      </div>
    </div>
  );
}

// ── Settings Modal ─────────────────────────────────────────────────
function SettingsModal({ onClose, gciGoal, setGciGoal }) {
  const [form, setForm] = useState({
    brokerName: localStorage.getItem("cre-broker-name") || "",
    brokerage: localStorage.getItem("cre-brokerage") || "SVN",
    licenseNum: localStorage.getItem("cre-license") || "",
    phone: localStorage.getItem("cre-phone") || "",
    email: localStorage.getItem("cre-email") || "",
    mgBrokerSplit: localStorage.getItem("cre-mg-split") || "80",
    defaultState: localStorage.getItem("cre-default-state") || "Indiana",
    gciGoal: String(gciGoal),
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const save = () => {
    localStorage.setItem("cre-broker-name", form.brokerName);
    localStorage.setItem("cre-brokerage", form.brokerage);
    localStorage.setItem("cre-license", form.licenseNum);
    localStorage.setItem("cre-phone", form.phone);
    localStorage.setItem("cre-email", form.email);
    localStorage.setItem("cre-mg-split", form.mgBrokerSplit);
    localStorage.setItem("cre-default-state", form.defaultState);
    setGciGoal(parseFloat(form.gciGoal) || 500000);
    toast("Settings saved");
    onClose();
  };
  const inp = globalIStyle();
  const lbl = t => <label style={{ color: DS.textSub, fontSize: DS.fs.xs, fontWeight: DS.fw.bold, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t}</label>;
  const section = t => <div style={{ color: DS.textMute, fontSize: DS.fs.xs, fontWeight: DS.fw.bold, letterSpacing: 1, marginBottom: 10, marginTop: 6, textTransform: "uppercase" }}>{t}</div>;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
      <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.xl, padding: DS.sp.xl, width: 520 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <div style={{ color: DS.text, fontSize: DS.fs.h2, fontWeight: DS.fw.black }}>Settings</div>
            <div style={{ color: DS.textMute, fontSize: DS.fs.sm, marginTop: 2 }}>Broker profile and preferences</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: DS.textMute, fontSize: 20, cursor: "pointer" }}></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {section("Broker Profile")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>{lbl("Your Name")}<input value={form.brokerName} onChange={e => set("brokerName", e.target.value)} placeholder="Hayden Abney" style={inp} /></div>
            <div>{lbl("Brokerage")}<input value={form.brokerage} onChange={e => set("brokerage", e.target.value)} placeholder="SVN Northern Commercial" style={inp} /></div>
            <div>{lbl("License Number")}<input value={form.licenseNum} onChange={e => set("licenseNum", e.target.value)} placeholder="RB25001852" style={inp} /></div>
            <div style={{ gridColumn: "span 2" }}>{lbl("Email")}<input value={form.email} onChange={e => set("email", e.target.value)} placeholder="hayden.abney@svnnc.com" style={inp} /></div>
            <div>{lbl("Default State (for map geocoding)")}<input value={form.defaultState} onChange={e => set("defaultState", e.target.value)} placeholder="Indiana" style={inp} /></div>
            <div>{lbl("Phone")}<input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="765.432.8166" style={inp} /></div>
          </div>
          {section("Commission & Goals")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>{lbl("Annual GCI Goal ($)")}<input type="number" value={form.gciGoal} onChange={e => set("gciGoal", e.target.value)} style={inp} /></div>
            <div>{lbl("Your Split w/ Managing Broker (%)")}<input type="number" value={form.mgBrokerSplit} onChange={e => set("mgBrokerSplit", e.target.value)} min="0" max="100" style={inp} /></div>
          </div>
          {section("Data")}
          <div style={{ background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: DS.r.md, padding: "12px 14px" }}>
            <div style={{ color: DS.textSub, fontSize: DS.fs.sm, marginBottom: 8 }}>All data is stored locally in your browser. Nothing is sent to any server.</div>
            <button onClick={() => { if (window.confirm("Clear ALL data and reset to demo data? This cannot be undone.")) { ["cre-industrial-v5","cre-listings-v1","cre-campaigns-v1","cre-comps-v1","cre-submarkets-v1","cre-contacts-v1","cre-tasks-v1","cre-expenses-v1","cre-properties-v1","cre-pipeline-goal"].forEach(k => localStorage.removeItem(k)); window.location.reload(); }}}
              style={{ background: "none", border: `1px solid ${DS.red}44`, color: DS.red, padding: "6px 14px", borderRadius: DS.r.sm, cursor: "pointer", fontSize: DS.fs.sm }}>
              Reset All Data
            </button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
          <button onClick={onClose} style={{ background: "none", border: `1px solid ${DS.border}`, color: DS.textSub, padding: "8px 18px", borderRadius: DS.r.sm, cursor: "pointer", fontSize: DS.fs.lg }}>Cancel</button>
          <button onClick={save} style={{ background: DS.accent, border: "none", color: "#0f1e2e", padding: "8px 22px", borderRadius: DS.r.sm, cursor: "pointer", fontSize: DS.fs.lg, fontWeight: DS.fw.black }}>Save Settings</button>
        </div>
      </div>
    </div>
  );
}

// ── Commission Waterfall Modal ────────────────────────────────
function CommissionWaterfallModal({ deal, onClose }) {
  const mgSplit = parseFloat(localStorage.getItem("cre-mg-split") || "80");
  const calc = calcDeal(deal);
  const gross = calc.grossCommission || 0;
  const coBrokeAmt = calc.isSplit ? gross * (1 - (parseFloat(deal.splitPct)||100)/100) : 0;
  const afterCoBroke = gross - coBrokeAmt;
  const referralPct = parseFloat(deal.referralPct || 0);
  const referralAmt = afterCoBroke * (referralPct / 100);
  const afterReferral = afterCoBroke - referralAmt;
  const mgBrokerAmt = afterReferral * ((100 - mgSplit) / 100);
  const yourNet = afterReferral * (mgSplit / 100);
  const taxRate = 0.32;
  const afterTax = yourNet * (1 - taxRate);
  const [localReferralPct, setLocalReferralPct] = React.useState(deal.referralPct || 0);
  const [localTaxRate, setLocalTaxRate] = React.useState(32);

  const recalc = (ref, tax) => {
    const r = parseFloat(ref) || 0;
    const t = parseFloat(tax) || 0;
    const refAmt = afterCoBroke * (r / 100);
    const afterRef = afterCoBroke - refAmt;
    const mgAmt = afterRef * ((100 - mgSplit) / 100);
    const net = afterRef * (mgSplit / 100);
    const netAfterTax = net * (1 - t / 100);
    return { refAmt, afterRef, mgAmt, net, netAfterTax };
  };

  const nums = recalc(localReferralPct, localTaxRate);

  const WaterfallRow = ({ label, amount, color, isSub, isTotal, sign = "-" }) => (
    <div style={{ display:"flex", alignItems:"center", gap:12, padding: isTotal ? "12px 16px" : "9px 16px", background: isTotal ? DS.accentSoft : isSub ? "transparent" : DS.panelHi, borderRadius: isTotal ? DS.r.md : 0, borderBottom: isTotal ? "none" : `1px solid ${DS.border}`, marginTop: isTotal ? 8 : 0 }}>
      <div style={{ flex:1, color: isSub ? DS.textMute : DS.textSub, fontSize: isSub ? DS.fs.xs : DS.fs.md, fontWeight: isTotal ? DS.fw.black : DS.fw.med, paddingLeft: isSub ? 16 : 0 }}>{label}</div>
      <div style={{ color: color || (isTotal ? DS.accent : DS.textSub), fontSize: isTotal ? DS.fs.h2 : DS.fs.lg, fontWeight: isTotal ? DS.fw.black : DS.fw.bold, fontFamily:"'DM Mono', monospace" }}>
        {sign === "-" && amount > 0 ? "−" : sign === "+" ? "+" : ""}{sign === "net" ? "" : ""}
        {amount < 0 ? "−" : ""}{Math.abs(Math.round(amount)).toLocaleString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
      </div>
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(3,8,18,0.88)", backdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1200 }}>
      <div style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:DS.r.xl, width:500, maxHeight:"90vh", overflowY:"auto", boxShadow:DS.shadow.xl }}>
        {/* Header */}
        <div style={{ padding:"20px 24px 16px", borderBottom:`1px solid ${DS.border}`, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ color:DS.text, fontWeight:DS.fw.black, fontSize:DS.fs.h2 }}>Commission Waterfall</div>
            <div style={{ color:DS.textMute, fontSize:DS.fs.sm, marginTop:3 }}>{deal.name}</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:DS.textMute, fontSize:20, cursor:"pointer", lineHeight:1 }}>×</button>
        </div>

        {/* Deal summary line */}
        <div style={{ padding:"12px 24px", background:DS.bg, display:"flex", gap:20, flexWrap:"wrap" }}>
          <div><div style={{ color:DS.textMute, fontSize:10, textTransform:"uppercase", letterSpacing:"0.6px" }}>Deal Value</div><div style={{ color:DS.text, fontWeight:DS.fw.bold, fontFamily:"'DM Mono', monospace" }}>${Math.round(calc.totalValue||0).toLocaleString()}</div></div>
          <div><div style={{ color:DS.textMute, fontSize:10, textTransform:"uppercase", letterSpacing:"0.6px" }}>Comm Rate</div><div style={{ color:DS.text, fontWeight:DS.fw.bold, fontFamily:"'DM Mono', monospace" }}>{deal.commissionRate||0}%</div></div>
          <div><div style={{ color:DS.textMute, fontSize:10, textTransform:"uppercase", letterSpacing:"0.6px" }}>Gross Comm</div><div style={{ color:DS.accent, fontWeight:DS.fw.bold, fontFamily:"'DM Mono', monospace" }}>${Math.round(gross).toLocaleString()}</div></div>
          <div><div style={{ color:DS.textMute, fontSize:10, textTransform:"uppercase", letterSpacing:"0.6px" }}>Stage</div><div style={{ color:DS.text, fontWeight:DS.fw.bold }}>{deal.stage}</div></div>
        </div>

        {/* Waterfall */}
        <div style={{ padding:"16px 0" }}>
          {/* Gross */}
          <div style={{ padding:"9px 16px", display:"flex", alignItems:"center", gap:12, borderBottom:`1px solid ${DS.border}` }}>
            <div style={{ flex:1, color:DS.text, fontSize:DS.fs.md, fontWeight:DS.fw.bold }}>Gross Commission</div>
            <div style={{ color:DS.text, fontSize:DS.fs.lg, fontWeight:DS.fw.black, fontFamily:"'DM Mono', monospace" }}>${Math.round(gross).toLocaleString()}</div>
          </div>

          {/* Co-broke */}
          {calc.isSplit && (
            <div style={{ padding:"9px 16px", display:"flex", alignItems:"center", gap:12, borderBottom:`1px solid ${DS.border}`, background:DS.redSoft }}>
              <div style={{ flex:1, paddingLeft:16 }}>
                <div style={{ color:DS.textSub, fontSize:DS.fs.md }}>Co-Broke to {deal.coBroker||"Co-Broker"}</div>
                <div style={{ color:DS.textMute, fontSize:DS.fs.xs }}>Other side's {100-(parseFloat(deal.splitPct)||100)}%</div>
              </div>
              <div style={{ color:DS.red, fontFamily:"'DM Mono', monospace", fontWeight:DS.fw.bold }}>−${Math.round(coBrokeAmt).toLocaleString()}</div>
            </div>
          )}

          {/* After co-broke */}
          <div style={{ padding:"9px 16px", display:"flex", alignItems:"center", gap:12, borderBottom:`1px solid ${DS.border}`, background:DS.panelHi }}>
            <div style={{ flex:1, color:DS.textSub, fontSize:DS.fs.md, fontWeight:DS.fw.semi }}>Your Gross Share</div>
            <div style={{ color:DS.textSub, fontFamily:"'DM Mono', monospace", fontWeight:DS.fw.bold }}>${Math.round(afterCoBroke).toLocaleString()}</div>
          </div>

          {/* Referral fee — editable */}
          <div style={{ padding:"9px 16px", borderBottom:`1px solid ${DS.border}`, background: nums.refAmt > 0 ? DS.redSoft : "transparent" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ flex:1, paddingLeft:16 }}>
                <div style={{ color:DS.textSub, fontSize:DS.fs.md }}>Referral Fee Out</div>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4 }}>
                  <input type="number" value={localReferralPct} onChange={e=>setLocalReferralPct(e.target.value)} min="0" max="50" style={{ width:52, background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:DS.r.sm, color:DS.text, padding:"3px 7px", fontSize:DS.fs.xs, outline:"none", textAlign:"center" }} />
                  <span style={{ color:DS.textMute, fontSize:DS.fs.xs }}>% of your gross share</span>
                </div>
              </div>
              <div style={{ color: nums.refAmt > 0 ? DS.red : DS.textFaint, fontFamily:"'DM Mono', monospace", fontWeight:DS.fw.bold }}>
                {nums.refAmt > 0 ? `−$${Math.round(nums.refAmt).toLocaleString()}` : "—"}
              </div>
            </div>
          </div>

          {/* After referral */}
          <div style={{ padding:"9px 16px", display:"flex", alignItems:"center", gap:12, borderBottom:`1px solid ${DS.border}`, background:DS.panelHi }}>
            <div style={{ flex:1, color:DS.textSub, fontSize:DS.fs.md, fontWeight:DS.fw.semi }}>After Referral</div>
            <div style={{ color:DS.textSub, fontFamily:"'DM Mono', monospace", fontWeight:DS.fw.bold }}>${Math.round(nums.afterRef).toLocaleString()}</div>
          </div>

          {/* Managing broker */}
          <div style={{ padding:"9px 16px", borderBottom:`1px solid ${DS.border}`, background:DS.redSoft }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ flex:1, paddingLeft:16 }}>
                <div style={{ color:DS.textSub, fontSize:DS.fs.md }}>Managing Broker Split</div>
                <div style={{ color:DS.textMute, fontSize:DS.fs.xs, marginTop:2 }}>They take {100-mgSplit}% · You keep {mgSplit}%</div>
              </div>
              <div style={{ color:DS.red, fontFamily:"'DM Mono', monospace", fontWeight:DS.fw.bold }}>−${Math.round(nums.mgAmt).toLocaleString()}</div>
            </div>
          </div>

          {/* Your net */}
          <div style={{ padding:"12px 16px", display:"flex", alignItems:"center", gap:12, borderBottom:`1px solid ${DS.border}`, background:`linear-gradient(90deg, ${DS.greenSoft}, transparent)` }}>
            <div style={{ flex:1, color:DS.green, fontSize:DS.fs.lg, fontWeight:DS.fw.black }}>Your Net Commission</div>
            <div style={{ color:DS.green, fontSize:DS.fs.h2, fontFamily:"'DM Mono', monospace", fontWeight:DS.fw.black }}>${Math.round(nums.net).toLocaleString()}</div>
          </div>

          {/* Tax — editable */}
          <div style={{ padding:"9px 16px", borderBottom:`1px solid ${DS.border}`, background:DS.redSoft }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ flex:1, paddingLeft:16 }}>
                <div style={{ color:DS.textSub, fontSize:DS.fs.md }}>Est. Tax</div>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4 }}>
                  <input type="number" value={localTaxRate} onChange={e=>setLocalTaxRate(e.target.value)} min="0" max="60" style={{ width:52, background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:DS.r.sm, color:DS.text, padding:"3px 7px", fontSize:DS.fs.xs, outline:"none", textAlign:"center" }} />
                  <span style={{ color:DS.textMute, fontSize:DS.fs.xs }}>% effective rate (est.)</span>
                </div>
              </div>
              <div style={{ color:DS.red, fontFamily:"'DM Mono', monospace", fontWeight:DS.fw.bold }}>−${Math.round(nums.net * localTaxRate/100).toLocaleString()}</div>
            </div>
          </div>

          {/* After tax — the number */}
          <div style={{ margin:"16px 16px 8px", background:`linear-gradient(135deg, ${DS.accent}18, ${DS.accent}08)`, border:`1px solid ${DS.accent}44`, borderRadius:DS.r.lg, padding:"16px 20px", display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ flex:1 }}>
              <div style={{ color:DS.accent, fontSize:DS.fs.xs, fontWeight:DS.fw.bold, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:4 }}>Take-Home Estimate</div>
              <div style={{ color:DS.textMute, fontSize:DS.fs.xs }}>After all deductions · Not tax advice</div>
            </div>
            <div style={{ color:DS.accent, fontSize:28, fontWeight:DS.fw.black, fontFamily:"'DM Mono', monospace", letterSpacing:"-1px" }}>${Math.round(nums.netAfterTax).toLocaleString()}</div>
          </div>

          {/* Waterfall bar visual */}
          <div style={{ padding:"0 16px 16px" }}>
            <div style={{ color:DS.textMute, fontSize:10, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:8, marginTop:4 }}>Visual Breakdown</div>
            {[
              { label:"Co-Broke", amt: coBrokeAmt, color: DS.red },
              { label:"Referral", amt: nums.refAmt, color: "#f97316" },
              { label:"Mgr Broker", amt: nums.mgAmt, color: DS.purple },
              { label:"Tax (est.)", amt: nums.net * localTaxRate/100, color: "#64748b" },
              { label:"Take-Home", amt: nums.netAfterTax, color: DS.green },
            ].filter(r => r.amt > 0).map(row => (
              <div key={row.label} style={{ marginBottom:6 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                  <span style={{ color:DS.textSub, fontSize:DS.fs.xs }}>{row.label}</span>
                  <span style={{ color:row.color, fontSize:DS.fs.xs, fontFamily:"'DM Mono', monospace" }}>${Math.round(row.amt).toLocaleString()}</span>
                </div>
                <div style={{ background:DS.border, borderRadius:DS.r.full, height:6, overflow:"hidden" }}>
                  <div style={{ width:`${Math.min(100,(row.amt/gross)*100)}%`, height:"100%", background:row.color, borderRadius:DS.r.full, transition:"width 0.4s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding:"0 16px 20px", display:"flex", justifyContent:"flex-end" }}>
          <button onClick={onClose} style={{ background:DS.accent, border:"none", color:"#0a0f1a", padding:"9px 24px", borderRadius:DS.r.sm, cursor:"pointer", fontSize:DS.fs.md, fontWeight:DS.fw.black }}>Done</button>
        </div>
      </div>
    </div>
  );
}

function calcDealHealth(d, daysInStage) {
  if (d.stage === "Closed" || d.stage === "Lost") return null;
  let score = 100;
  const issues = [];
  const stageMaxDays = { "Prospect": 45, "Proposal": 30, "LOI": 21, "Under Contract": 60 };
  const maxDays = stageMaxDays[d.stage] || 45;
  if (daysInStage > maxDays * 1.5) { score -= 35; issues.push("Stalled " + daysInStage + "d in " + d.stage); }
  else if (daysInStage > maxDays) { score -= 20; issues.push(daysInStage + "d in " + d.stage + " — getting long"); }
  if (d.followUpDate && d.followUpDate < today) { score -= 25; issues.push("Follow-up overdue"); }
  else if (!d.followUpDate) { score -= 10; issues.push("No follow-up date set"); }
  const activities = d.activities || [];
  const lastActivity = activities.length > 0 ? activities[0] : null;
  if (lastActivity) {
    const daysSinceActivity = Math.floor((new Date() - new Date(lastActivity.date)) / 86400000);
    if (daysSinceActivity > 21) { score -= 20; issues.push("No activity in " + daysSinceActivity + "d"); }
    else if (daysSinceActivity > 10) { score -= 8; issues.push("Last activity " + daysSinceActivity + "d ago"); }
  } else { score -= 15; issues.push("No activities logged"); }
  if (!d.expectedClose) { score -= 10; issues.push("No close date set"); }
  else {
    const daysToClose = Math.floor((new Date(d.expectedClose + "T00:00:00") - new Date()) / 86400000);
    if (daysToClose < 0) { score -= 15; issues.push("Past expected close date"); }
  }
  if ((d.documents || []).length === 0 && (d.stage === "LOI" || d.stage === "Under Contract")) {
    score -= 10; issues.push("No documents attached");
  }
  score = Math.max(0, Math.min(100, score));
  const label = score >= 75 ? "Healthy" : score >= 50 ? "At Risk" : "Critical";
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  return { score, label, color, issues };
}

function calcDeal(d) {
  const sqft = parseFloat(d.sqft) || 0;
  const dealTotal = parseFloat(d.dealTotal) || 0;
  const monthlyRent = parseFloat(d.monthlyRent) || 0;
  const leaseTerm = parseFloat(d.leaseTerm) || 0;
  const commissionRate = parseFloat(d.commissionRate) || 0;
  const probability = parseFloat(d.probability) || 0;
  const splitPct = parseFloat(d.splitPct) || 100;

  const totalValue = d.dealType === "Lease" ? monthlyRent * leaseTerm : dealTotal;
  const grossCommission = totalValue * (commissionRate / 100);
  const netCommission = grossCommission * (splitPct / 100);
  const pricePerSqft = sqft > 0 && totalValue > 0 ? totalValue / sqft : 0;
  const weighted = netCommission * (probability / 100);
  const isSplit = splitPct < 100 && d.coBroker;

  let daysInStage = parseInt(d.daysInStage) || 0;
  if (d.stageHistory && d.stageHistory.length > 0) {
    const lastEntry = d.stageHistory[d.stageHistory.length - 1];
    if (lastEntry && lastEntry.enteredDate) {
      daysInStage = Math.floor((new Date() - new Date(lastEntry.enteredDate + "T00:00:00")) / 86400000);
    }
  }

  const isAging = daysInStage > 30 && d.stage !== "Closed" && d.stage !== "Lost";
  const isDueToday = d.followUpDate === today;
  const isOverdue = d.followUpDate && d.followUpDate < today && d.stage !== "Closed" && d.stage !== "Lost";
  const health = calcDealHealth(d, daysInStage);

  let leaseExpiresDate = null;
  if (d.stage === "Closed" && d.dealType === "Lease" && d.expectedClose && d.leaseTerm) {
    const closeDate = new Date(d.expectedClose + "T00:00:00");
    closeDate.setMonth(closeDate.getMonth() + parseInt(d.leaseTerm));
    leaseExpiresDate = closeDate.toISOString().split("T")[0];
  }

  return { ...d, totalValue, grossCommission, netCommission, pricePerSqft, weighted, isSplit, isAging, isDueToday, isOverdue, sqft, daysInStage, health, leaseExpiresDate };
}

// ── Stage Badge ─────────────────────────────────────────────
function StageBadge({ stage }) {
  const c = STAGE_COLORS[stage] || { bg: DS.panel, text: DS.textSub, border: DS.border, glow: "transparent" };
  return (
    <span style={{
      background: c.bg,
      color: c.text,
      border: `1px solid ${c.border}`,
      padding: "3px 10px",
      borderRadius: DS.r.full,
      fontSize: DS.fs.xs,
      fontWeight: DS.fw.bold,
      whiteSpace: "nowrap",
      display: "inline-block",
      letterSpacing: "0.3px",
      boxShadow: `0 0 8px ${c.glow || "transparent"}`,
    }}>{stage}</span>
  );
}

// ── Stat Card ───────────────────────────────────────────────
function StatCard({ label, sub, value, accent, alert }) {
  const accentColor = accent || DS.blue;
  return (
    <div className="card-hover" style={{
      background: alert ? DS.redSoft : DS.panel,
      borderRadius: DS.r.lg,
      padding: "18px 20px",
      flex: 1,
      minWidth: 148,
      border: `1px solid ${alert ? DS.red + "44" : DS.border}`,
      borderLeft: `3px solid ${alert ? DS.red : accentColor}`,
      display: "flex",
      flexDirection: "column",
      gap: 10,
      cursor: "default",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at top right, ${accentColor}08, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ color: DS.textMute, fontSize: DS.fs.xs, fontWeight: DS.fw.bold, textTransform: "uppercase", letterSpacing: "0.8px" }}>{label}</div>
      <div style={{ color: alert ? DS.red : DS.text, fontSize: DS.fs.h2, fontWeight: DS.fw.black, letterSpacing: "-0.8px", lineHeight: 1, fontFamily: "'DM Mono', monospace" }}>{value}</div>
      {sub && <div style={{ color: DS.textMute, fontSize: DS.fs.xs, marginTop: -4 }}>{sub}</div>}
    </div>
  );
}

// ── Activity Log ────────────────────────────────────────────
function ActivityLog({ deal, onClose, onSave }) {
  const [text, setText] = useState("");
  const [type, setType] = useState("Call");
  const activities = deal.activities || [];
  const typeColors = { Call: "#3b82f6", Email: "#8b5cf6", Meeting: "#10b981", Note: "#f59e0b", "Follow-up": "#ec4899" };
  const addActivity = () => {
    if (!text.trim()) return;
    onSave({ ...deal, activities: [{ id: Date.now(), type, text: text.trim(), date: new Date().toISOString() }, ...activities] });
    setText("");
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(3,8,18,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: 16, padding: 26, width: 540, maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div><h2 style={{ color: "#f1f5f9", fontSize: 17, fontWeight: 800, margin: 0 }}>Activity Log</h2><div style={{ color: "#475569", fontSize: 12, marginTop: 2 }}>{deal.name}</div></div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 20, cursor: "pointer" }}></button>
        </div>
        <div style={{ background: "#070e1a", borderRadius: 10, padding: 12, border: `1px solid ${DS.border}` }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
            {Object.keys(typeColors).map(t => <button key={t} onClick={() => setType(t)} style={{ background: type === t ? typeColors[t] : DS.panel, color: type === t ? "#fff" : "#64748b", border: `1px solid ${type === t ? typeColors[t] : "#1e3048"}`, padding: "3px 11px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{t}</button>)}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && addActivity()} placeholder={`Log a ${type.toLowerCase()}...`} style={{ flex: 1, background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: 8, color: "#f1f5f9", padding: "8px 11px", fontSize: 13, outline: "none" }} />
            <button onClick={addActivity} style={{ background: "#f59e0b", border: "none", color: "#0f1e2e", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 800 }}>Log</button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", marginTop: 12, display: "flex", flexDirection: "column", gap: 7 }}>
          {activities.length === 0 && <div style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: "28px 0" }}>No activities yet.</div>}
          {activities.map(a => (
            <div key={a.id} style={{ background: "#070e1a", border: `1px solid ${DS.border}`, borderRadius: 9, padding: "10px 12px", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ background: typeColors[a.type] || "#64748b", color: "#fff", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>{a.type}</span>
              <div style={{ flex: 1 }}><div style={{ color: "#f1f5f9", fontSize: 13 }}>{a.text}</div><div style={{ color: "#475569", fontSize: 10, marginTop: 2 }}>{new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}</div></div>
              <button onClick={() => onSave({ ...deal, activities: activities.filter(x => x.id !== a.id) })} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 12 }}></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Rich Notes Modal ─────────────────────────────────────────
function RichNotesModal({ deal, onClose, onSave }) {
  const notes = deal.richNotes || [];
  const [text, setText] = useState("");
  const [noteType, setNoteType] = useState("General");
  const [title, setTitle] = useState("");
  const typeColors = { "General": "#64748b", "LOI Summary": "#3b82f6", "Deal Terms": "#f59e0b", "Landlord Requirements": "#8b5cf6", "Tenant Requirements": "#10b981", "Legal": "#ec4899", "Financial": "#f97316", "Other": "#94a3b8" };
  const addNote = () => {
    if (!text.trim()) return;
    const newNote = { id: Date.now(), type: noteType, title: title.trim() || noteType, content: text.trim(), date: new Date().toISOString() };
    onSave({ ...deal, richNotes: [newNote, ...notes] });
    setText(""); setTitle("");
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: 16, padding: 26, width: 620, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div><h2 style={{ color: "#f1f5f9", fontSize: 17, fontWeight: 800, margin: 0 }}>Deal Notes & Documents</h2><div style={{ color: "#475569", fontSize: 12, marginTop: 2 }}>{deal.name}</div></div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 20, cursor: "pointer" }}></button>
        </div>
        <div style={{ background: "#070e1a", borderRadius: 10, padding: 14, border: `1px solid ${DS.border}`, marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
            {NOTE_TYPES.map(t => <button key={t} onClick={() => setNoteType(t)} style={{ background: noteType === t ? (typeColors[t] || "#64748b") : DS.panel, color: noteType === t ? "#fff" : "#64748b", border: `1px solid ${noteType === t ? (typeColors[t] || "#64748b") : "#1e3048"}`, padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 600, cursor: "pointer" }}>{t}</button>)}
          </div>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (optional)" style={{ width: "100%", background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: 8, color: "#f1f5f9", padding: "7px 11px", fontSize: 13, outline: "none", marginBottom: 8, boxSizing: "border-box" }} />
          <textarea value={text} onChange={e => setText(e.target.value)} rows={4} placeholder={`Paste ${noteType} details here — LOI summaries, deal terms, landlord requirements, etc.`} style={{ width: "100%", background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: 8, color: "#f1f5f9", padding: "8px 11px", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", marginBottom: 8 }} />
          <button onClick={addNote} style={{ background: "#f59e0b", border: "none", color: "#0f1e2e", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 800 }}>Add Note</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
          {notes.length === 0 && <div style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: "28px 0" }}>No notes yet. Add LOI summaries, deal terms, requirements...</div>}
          {notes.map(n => (
            <div key={n.id} style={{ background: "#070e1a", border: `1px solid #1e3048`, borderLeft: `3px solid ${typeColors[n.type] || "#64748b"}`, borderRadius: 9, padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div>
                  <span style={{ background: typeColors[n.type] || "#64748b", color: "#fff", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{n.type}</span>
                  {n.title !== n.type && <span style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 600, marginLeft: 8 }}>{n.title}</span>}
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ color: "#475569", fontSize: 10 }}>{new Date(n.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  <button onClick={() => onSave({ ...deal, richNotes: notes.filter(x => x.id !== n.id) })} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 12 }}></button>
                </div>
              </div>
              <div style={{ color: "#cbd5e1", fontSize: 12, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{n.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Daily 3-Minute Sync Modal ────────────────────────────────
function DailySyncModal({ deals, tasks, contacts, onUpdateDeal, onUpdateTask, onUpdateContact, onClose }) {
  const enriched = useMemo(() => deals.map(calcDeal), [deals]);
  const now = new Date();

  // Build the queue — ordered by urgency type
  const queue = useMemo(() => {
    const items = [];
    // 1. Overdue follow-ups first
    enriched.filter(d => d.stage !== "Closed" && d.stage !== "Lost" && d.followUpDate && d.followUpDate <= today)
      .sort((a,b) => a.followUpDate.localeCompare(b.followUpDate))
      .forEach(d => items.push({ type: "followup", deal: d, id: `followup-${d.id}` }));
    // 2. Urgent tasks
    tasks.filter(t => !t.done && t.dueDate && t.dueDate <= today)
      .sort((a,b) => ["Urgent","High","Medium","Low"].indexOf(a.priority) - ["Urgent","High","Medium","Low"].indexOf(b.priority))
      .forEach(t => items.push({ type: "task", task: t, id: `task-${t.id}` }));
    // 3. Cold deals
    enriched.filter(d => d.isAging)
      .sort((a,b) => b.daysInStage - a.daysInStage)
      .slice(0, 5)
      .forEach(d => items.push({ type: "cold", deal: d, id: `cold-${d.id}` }));
    // 4. Contacts due for outreach
    contacts.filter(c => {
      if (!c.lastContact) return true;
      const days = Math.floor((now - new Date(c.lastContact+"T00:00:00")) / 86400000);
      return days >= ({ "Key Relationship":30, "Active":45, "Warm":60, "Cold":90 }[c.relationshipLevel] || 90);
    }).sort((a,b) => ["Key Relationship","Active","Warm","Cold"].indexOf(a.relationshipLevel) - ["Key Relationship","Active","Warm","Cold"].indexOf(b.relationshipLevel))
      .slice(0, 5)
      .forEach(c => items.push({ type: "contact", contact: c, id: `contact-${c.id}` }));
    return items;
  }, []);

  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState([]);
  const [snoozeDate, setSnoozeDate] = useState("");
  const [showSnooze, setShowSnooze] = useState(false);
  const [actionsLog, setActionsLog] = useState([]);

  const remaining = queue.filter(item => !done.includes(item.id));
  const current = remaining[0];
  const progress = queue.length > 0 ? Math.round((done.length / queue.length) * 100) : 100;

  const dismiss = (action) => {
    if (current) {
      setDone(d => [...d, current.id]);
      setActionsLog(l => [...l, { id: current.id, action }]);
      setShowSnooze(false);
      setSnoozeDate("");
    }
  };

  const handleFollowupLogged = (deal) => {
    const newDate = (() => { const d = new Date(); d.setDate(d.getDate()+3); return d.toISOString().split("T")[0]; })();
    onUpdateDeal({ ...deal, followUpDate: newDate, activities: [...(deal.activities||[]), { text: "Follow-up logged via daily sync", date: new Date().toISOString() }] });
    dismiss("logged");
  };
  const handleSnooze = (deal, days) => {
    const d = new Date(); d.setDate(d.getDate() + days);
    onUpdateDeal({ ...deal, followUpDate: d.toISOString().split("T")[0] });
    dismiss(`snoozed ${days}d`);
  };
  const handleContactSnoozeDeal = (deal, days) => {
    const d = new Date(); d.setDate(d.getDate() + days);
    onUpdateDeal({ ...deal, followUpDate: d.toISOString().split("T")[0] });
    dismiss(`snoozed ${days}d`);
  };
  const handleTaskDone = (task) => {
    onUpdateTask({ ...task, done: true });
    dismiss("completed");
  };
  const handleTaskSnooze = (task, days) => {
    const d = new Date(); d.setDate(d.getDate() + days);
    onUpdateTask({ ...task, dueDate: d.toISOString().split("T")[0] });
    dismiss(`snoozed ${days}d`);
  };
  const handleContactContacted = (contact) => {
    onUpdateContact({ ...contact, lastContact: today });
    dismiss("contacted");
  };

  const typeColors = { followup: DS.green, task: DS.accent, cold: DS.blue, contact: "#ec4899" };
  const typeLabels = { followup: "Follow-up Due", task: "Task Due", cold: "Deal Gone Cold", contact: "Contact Outreach" };

  if (queue.length === 0 || remaining.length === 0) {
    return (
      <div style={{ position:"fixed", inset:0, background:"rgba(3,8,18,0.95)", backdropFilter:"blur(16px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000 }}>
        <div style={{ background:DS.panel, border:`1px solid ${DS.green}44`, borderRadius:DS.r.xl, padding:"48px 52px", textAlign:"center", maxWidth:420, boxShadow:`${DS.shadow.xl}, 0 0 60px ${DS.green}15` }}>
          <div style={{ fontSize:56, marginBottom:16 }}>✓</div>
          <div style={{ color:DS.green, fontSize:DS.fs.h1, fontWeight:DS.fw.black, marginBottom:8 }}>You're all caught up</div>
          <div style={{ color:DS.textMute, fontSize:DS.fs.md, marginBottom:8 }}>
            {queue.length === 0 ? "Nothing urgent today — your pipeline is in good shape." : `${done.length} item${done.length !== 1 ? "s" : ""} cleared in today's sync.`}
          </div>
          <div style={{ color:DS.textFaint, fontSize:DS.fs.sm, marginBottom:28 }}>{now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>
          <button onClick={onClose} style={{ background:DS.green, border:"none", color:"#0a0f1a", padding:"11px 32px", borderRadius:DS.r.sm, cursor:"pointer", fontSize:DS.fs.md, fontWeight:DS.fw.black }}>Close</button>
        </div>
      </div>
    );
  }

  const item = current;
  const color = typeColors[item.type];

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(3,8,18,0.95)", backdropFilter:"blur(16px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000 }}>
      <div style={{ background:DS.panel, border:`1px solid ${color}33`, borderRadius:DS.r.xl, width:520, boxShadow:`${DS.shadow.xl}, 0 0 40px ${color}12` }}>

        {/* Progress bar */}
        <div style={{ height:4, background:DS.border, borderRadius:"16px 16px 0 0", overflow:"hidden" }}>
          <div style={{ width:`${progress}%`, height:"100%", background:color, borderRadius:"16px 16px 0 0", transition:"width 0.4s ease" }} />
        </div>

        {/* Header */}
        <div style={{ padding:"18px 24px 14px", borderBottom:`1px solid ${DS.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ background:color+"22", color, border:`1px solid ${color}44`, padding:"3px 12px", borderRadius:DS.r.full, fontSize:DS.fs.xs, fontWeight:DS.fw.black, letterSpacing:"0.5px", textTransform:"uppercase" }}>{typeLabels[item.type]}</span>
            <span style={{ color:DS.textMute, fontSize:DS.fs.xs }}>{remaining.length} left · {done.length} done</span>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:DS.textMute, fontSize:18, cursor:"pointer", padding:"0 4px" }}>×</button>
        </div>

        {/* Card content */}
        <div style={{ padding:"24px 28px" }}>

          {/* FOLLOW-UP */}
          {item.type === "followup" && (
            <div>
              <div style={{ color:DS.textFaint, fontSize:DS.fs.xs, fontWeight:DS.fw.bold, textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:8 }}>Deal needs your attention</div>
              <div style={{ color:DS.text, fontSize:DS.fs.h2, fontWeight:DS.fw.black, marginBottom:4 }}>{item.deal.name}</div>
              <div style={{ display:"flex", gap:12, marginBottom:16, flexWrap:"wrap" }}>
                <span style={{ color:DS.textMute, fontSize:DS.fs.sm }}>{item.deal.client}</span>
                <StageBadge stage={item.deal.stage} />
                <span style={{ color:item.deal.isOverdue ? DS.red : DS.accent, fontSize:DS.fs.sm, fontWeight:DS.fw.bold }}>
                  {item.deal.isOverdue ? `Overdue since ${new Date(item.deal.followUpDate+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}` : "Due today"}
                </span>
              </div>
              {item.deal.notes && <div style={{ background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:DS.r.sm, padding:"10px 12px", color:DS.textSub, fontSize:DS.fs.sm, marginBottom:16, fontStyle:"italic" }}>{item.deal.notes.substring(0,120)}</div>}
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                <button onClick={() => handleFollowupLogged(item.deal)} style={{ background:DS.green, border:"none", color:"#0a0f1a", padding:"9px 18px", borderRadius:DS.r.sm, cursor:"pointer", fontSize:DS.fs.md, fontWeight:DS.fw.black }}>✓ Logged Contact</button>
                <button onClick={() => handleSnooze(item.deal, 3)} style={{ background:DS.accentSoft, border:`1px solid ${DS.accent}44`, color:DS.accent, padding:"9px 14px", borderRadius:DS.r.sm, cursor:"pointer", fontSize:DS.fs.sm, fontWeight:DS.fw.bold }}>Snooze 3 days</button>
                <button onClick={() => handleSnooze(item.deal, 7)} style={{ background:DS.surface, border:`1px solid ${DS.border}`, color:DS.textSub, padding:"9px 14px", borderRadius:DS.r.sm, cursor:"pointer", fontSize:DS.fs.sm }}>Snooze 1 week</button>
                <button onClick={() => dismiss("skipped")} style={{ background:"none", border:`1px solid ${DS.border}`, color:DS.textFaint, padding:"9px 14px", borderRadius:DS.r.sm, cursor:"pointer", fontSize:DS.fs.sm }}>Skip</button>
              </div>
            </div>
          )}

          {/* TASK */}
          {item.type === "task" && (
            <div>
              <div style={{ color:DS.textFaint, fontSize:DS.fs.xs, fontWeight:DS.fw.bold, textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:8 }}>Task due</div>
              <div style={{ color:DS.text, fontSize:DS.fs.h2, fontWeight:DS.fw.black, marginBottom:4 }}>{item.task.title}</div>
              <div style={{ display:"flex", gap:12, marginBottom:16, flexWrap:"wrap" }}>
                <span style={{ background:{ "Urgent":"#dc262622","High":"#f9731622","Medium":"#f59e0b22","Low":"#47556922" }[item.task.priority]||DS.surface, color:{ "Urgent":DS.red,"High":"#f97316","Medium":DS.accent,"Low":DS.textMute }[item.task.priority]||DS.textMute, padding:"2px 10px", borderRadius:DS.r.full, fontSize:DS.fs.xs, fontWeight:DS.fw.bold }}>{item.task.priority}</span>
                <span style={{ color:DS.textMute, fontSize:DS.fs.sm }}>{item.task.category}</span>
                <span style={{ color:item.task.dueDate < today ? DS.red : DS.accent, fontSize:DS.fs.sm, fontWeight:DS.fw.bold }}>{item.task.dueDate < today ? `Overdue since ${new Date(item.task.dueDate+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}` : "Due today"}</span>
              </div>
              {item.task.notes && <div style={{ background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:DS.r.sm, padding:"10px 12px", color:DS.textSub, fontSize:DS.fs.sm, marginBottom:16, fontStyle:"italic" }}>{item.task.notes}</div>}
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                <button onClick={() => handleTaskDone(item.task)} style={{ background:DS.green, border:"none", color:"#0a0f1a", padding:"9px 18px", borderRadius:DS.r.sm, cursor:"pointer", fontSize:DS.fs.md, fontWeight:DS.fw.black }}>✓ Mark Done</button>
                <button onClick={() => handleTaskSnooze(item.task, 3)} style={{ background:DS.accentSoft, border:`1px solid ${DS.accent}44`, color:DS.accent, padding:"9px 14px", borderRadius:DS.r.sm, cursor:"pointer", fontSize:DS.fs.sm, fontWeight:DS.fw.bold }}>Snooze 3 days</button>
                <button onClick={() => handleTaskSnooze(item.task, 7)} style={{ background:DS.surface, border:`1px solid ${DS.border}`, color:DS.textSub, padding:"9px 14px", borderRadius:DS.r.sm, cursor:"pointer", fontSize:DS.fs.sm }}>Snooze 1 week</button>
                <button onClick={() => dismiss("skipped")} style={{ background:"none", border:`1px solid ${DS.border}`, color:DS.textFaint, padding:"9px 14px", borderRadius:DS.r.sm, cursor:"pointer", fontSize:DS.fs.sm }}>Skip</button>
              </div>
            </div>
          )}

          {/* COLD DEAL */}
          {item.type === "cold" && (
            <div>
              <div style={{ color:DS.textFaint, fontSize:DS.fs.xs, fontWeight:DS.fw.bold, textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:8 }}>Deal has gone cold</div>
              <div style={{ color:DS.text, fontSize:DS.fs.h2, fontWeight:DS.fw.black, marginBottom:4 }}>{item.deal.name}</div>
              <div style={{ display:"flex", gap:12, marginBottom:16, flexWrap:"wrap" }}>
                <span style={{ color:DS.textMute, fontSize:DS.fs.sm }}>{item.deal.client}</span>
                <StageBadge stage={item.deal.stage} />
                <span style={{ color:DS.red, fontSize:DS.fs.sm, fontWeight:DS.fw.bold }}>{item.deal.daysInStage} days in {item.deal.stage}</span>
              </div>
              {item.deal.health?.issues?.length > 0 && (
                <div style={{ background:DS.bg, border:`1px solid ${DS.red}33`, borderRadius:DS.r.sm, padding:"10px 12px", marginBottom:16 }}>
                  {item.deal.health.issues.map((iss,i) => <div key={i} style={{ color:DS.red, fontSize:DS.fs.sm, marginBottom:2 }}>· {iss}</div>)}
                </div>
              )}
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                <button onClick={() => { const d = new Date(); d.setDate(d.getDate()+3); onUpdateDeal({...item.deal, followUpDate: d.toISOString().split("T")[0]}); dismiss("follow-up set"); }} style={{ background:DS.blue, border:"none", color:"#fff", padding:"9px 18px", borderRadius:DS.r.sm, cursor:"pointer", fontSize:DS.fs.md, fontWeight:DS.fw.black }}>Set Follow-up</button>
                <button onClick={() => { onUpdateDeal({...item.deal, stage:"Lost", won:false, lossReason:"Deal went cold / no response"}); dismiss("marked lost"); }} style={{ background:DS.red+"22", border:`1px solid ${DS.red}44`, color:DS.red, padding:"9px 14px", borderRadius:DS.r.sm, cursor:"pointer", fontSize:DS.fs.sm, fontWeight:DS.fw.bold }}>Mark Lost</button>
                <button onClick={() => dismiss("skipped")} style={{ background:"none", border:`1px solid ${DS.border}`, color:DS.textFaint, padding:"9px 14px", borderRadius:DS.r.sm, cursor:"pointer", fontSize:DS.fs.sm }}>Skip</button>
              </div>
            </div>
          )}

          {/* CONTACT OUTREACH */}
          {item.type === "contact" && (
            <div>
              <div style={{ color:DS.textFaint, fontSize:DS.fs.xs, fontWeight:DS.fw.bold, textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:8 }}>Outreach overdue</div>
              <div style={{ color:DS.text, fontSize:DS.fs.h2, fontWeight:DS.fw.black, marginBottom:4 }}>{item.contact.name}</div>
              <div style={{ display:"flex", gap:12, marginBottom:16, flexWrap:"wrap" }}>
                <span style={{ color:DS.textMute, fontSize:DS.fs.sm }}>{item.contact.company}</span>
                <span style={{ background:"#ec489922", color:"#ec4899", padding:"2px 10px", borderRadius:DS.r.full, fontSize:DS.fs.xs, fontWeight:DS.fw.bold }}>{item.contact.relationshipLevel}</span>
                {item.contact.phone && <a href={`tel:${item.contact.phone}`} style={{ color:DS.blue, fontSize:DS.fs.sm, textDecoration:"none", fontWeight:DS.fw.bold }}>{item.contact.phone}</a>}
              </div>
              {item.contact.notes && <div style={{ background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:DS.r.sm, padding:"10px 12px", color:DS.textSub, fontSize:DS.fs.sm, marginBottom:16, fontStyle:"italic" }}>{item.contact.notes?.substring(0,100)}</div>}
              {item.contact.lastContact && <div style={{ color:DS.textMute, fontSize:DS.fs.xs, marginBottom:12 }}>Last contact: {new Date(item.contact.lastContact+"T00:00:00").toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</div>}
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                <button onClick={() => handleContactContacted(item.contact)} style={{ background:"#ec4899", border:"none", color:"#fff", padding:"9px 18px", borderRadius:DS.r.sm, cursor:"pointer", fontSize:DS.fs.md, fontWeight:DS.fw.black }}>✓ Contacted</button>
                <button onClick={() => dismiss("skipped")} style={{ background:"none", border:`1px solid ${DS.border}`, color:DS.textFaint, padding:"9px 14px", borderRadius:DS.r.sm, cursor:"pointer", fontSize:DS.fs.sm }}>Skip</button>
              </div>
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div style={{ padding:"14px 24px", borderTop:`1px solid ${DS.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", gap:4 }}>
            {queue.slice(0, Math.min(queue.length, 8)).map((item, i) => (
              <div key={item.id} style={{ width:8, height:8, borderRadius:"50%", background: done.includes(item.id) ? DS.green : i === 0 && !done.includes(item.id) ? typeColors[item.type] : DS.border, transition:"background 0.2s" }} />
            ))}
            {queue.length > 8 && <span style={{ color:DS.textFaint, fontSize:9, marginLeft:4 }}>+{queue.length-8}</span>}
          </div>
          <div style={{ color:DS.textFaint, fontSize:DS.fs.xs }}>{done.length} of {queue.length} cleared</div>
        </div>
      </div>
    </div>
  );
}

// ── Closing Checklist Modal ─────────────────────────────────────
const CLOSING_CHECKLIST_SALE = [
  { id:"commission_agreement", label:"Commission agreement signed", critical:true },
  { id:"title_ordered", label:"Title ordered / escrow opened", critical:true },
  { id:"earnest_money", label:"Earnest money received / confirmed", critical:true },
  { id:"inspection", label:"Inspection scheduled / completed", critical:false },
  { id:"lender_approval", label:"Buyer financing / lender approval confirmed", critical:false },
  { id:"contingencies_waived", label:"All contingencies waived", critical:false },
  { id:"closing_statement", label:"Closing statement reviewed", critical:true },
  { id:"commission_demand", label:"Commission demand / closing instructions sent", critical:true },
  { id:"commission_check", label:"Commission check received", critical:true },
];
const CLOSING_CHECKLIST_LEASE = [
  { id:"lease_executed", label:"Lease fully executed by both parties", critical:true },
  { id:"commission_agreement", label:"Commission agreement signed", critical:true },
  { id:"first_months_rent", label:"First month's rent / security deposit confirmed", critical:false },
  { id:"tenant_insurance", label:"Tenant insurance certificate received", critical:false },
  { id:"co_broker_commission", label:"Co-broker commission agreement (if applicable)", critical:false },
  { id:"keys_delivered", label:"Keys / access delivered to tenant", critical:false },
  { id:"commission_invoice", label:"Commission invoice submitted to landlord", critical:true },
  { id:"commission_received", label:"Commission payment received", critical:true },
];

function ClosingChecklistModal({ deal, onSave, onClose }) {
  const items = deal.dealType === "Lease" ? CLOSING_CHECKLIST_LEASE : CLOSING_CHECKLIST_SALE;
  const [checked, setChecked] = useState(deal.closingChecklist || {});
  const [note, setNote] = useState(deal.closingChecklistNote || "");

  const toggle = (id) => setChecked(c => ({ ...c, [id]: !c[id] }));
  const completedCount = items.filter(i => checked[i.id]).length;
  const criticalPending = items.filter(i => i.critical && !checked[i.id]);
  const pct = Math.round((completedCount / items.length) * 100);

  const handleSave = () => {
    onSave({ ...deal, closingChecklist: checked, closingChecklistNote: note });
    onClose();
  };

  const barColor = pct === 100 ? DS.green : pct >= 60 ? DS.accent : DS.blue;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(3,8,18,0.9)", backdropFilter:"blur(12px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1200 }}>
      <div style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:DS.r.xl, width:540, maxHeight:"88vh", display:"flex", flexDirection:"column", boxShadow:DS.shadow.xl }}>

        {/* Header */}
        <div style={{ padding:"18px 24px 14px", borderBottom:`1px solid ${DS.border}`, flexShrink:0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ color:DS.text, fontWeight:DS.fw.black, fontSize:DS.fs.h2 }}>Closing Checklist</div>
              <div style={{ color:DS.textMute, fontSize:DS.fs.sm, marginTop:2 }}>{deal.name} · {deal.dealType}</div>
            </div>
            <button onClick={onClose} style={{ background:"none", border:"none", color:DS.textMute, fontSize:20, cursor:"pointer" }}>×</button>
          </div>
          {/* Progress */}
          <div style={{ marginTop:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
              <span style={{ color:DS.textMute, fontSize:DS.fs.xs }}>{completedCount} of {items.length} complete</span>
              <span style={{ color:barColor, fontWeight:DS.fw.black, fontSize:DS.fs.sm }}>{pct}%</span>
            </div>
            <div style={{ background:DS.border, borderRadius:999, height:6, overflow:"hidden" }}>
              <div style={{ width:`${pct}%`, height:"100%", background:barColor, borderRadius:999, transition:"width 0.3s" }} />
            </div>
          </div>
          {criticalPending.length > 0 && (
            <div style={{ background:DS.red+"15", border:`1px solid ${DS.red}33`, borderRadius:DS.r.sm, padding:"8px 12px", marginTop:10, color:DS.red, fontSize:DS.fs.xs, fontWeight:DS.fw.bold }}>
              {criticalPending.length} critical item{criticalPending.length !== 1 ? "s" : ""} still pending
            </div>
          )}
        </div>

        {/* Checklist */}
        <div style={{ flex:1, overflowY:"auto", padding:"14px 24px" }}>
          {items.map(item => (
            <div key={item.id} onClick={() => toggle(item.id)} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 0", borderBottom:`1px solid ${DS.border}`, cursor:"pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = DS.panelHi}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ width:20, height:20, borderRadius:5, border:`2px solid ${checked[item.id] ? DS.green : item.critical ? DS.red+"66" : DS.border}`, background:checked[item.id] ? DS.green : "transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s" }}>
                {checked[item.id] && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#0a0f1a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span style={{ color:checked[item.id] ? DS.textMute : DS.text, fontSize:DS.fs.md, flex:1, textDecoration:checked[item.id] ? "line-through" : "none" }}>{item.label}</span>
              {item.critical && !checked[item.id] && <span style={{ background:DS.red+"22", color:DS.red, padding:"1px 7px", borderRadius:DS.r.full, fontSize:9, fontWeight:DS.fw.black, flexShrink:0 }}>critical</span>}
            </div>
          ))}
          <div style={{ marginTop:14 }}>
            <div style={{ color:DS.textMute, fontSize:DS.fs.xs, fontWeight:DS.fw.bold, marginBottom:5 }}>Notes</div>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Closing contact, escrow officer, title company, special instructions..." rows={3}
              style={{ background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:DS.r.sm, color:DS.text, padding:"8px 11px", fontSize:DS.fs.md, outline:"none", width:"100%", boxSizing:"border-box", resize:"none", lineHeight:1.5 }} />
          </div>
        </div>

        <div style={{ padding:"12px 24px", borderTop:`1px solid ${DS.border}`, display:"flex", gap:10, justifyContent:"flex-end", flexShrink:0 }}>
          <button onClick={onClose} style={{ background:"none", border:`1px solid ${DS.border}`, color:DS.textSub, padding:"9px 18px", borderRadius:DS.r.sm, cursor:"pointer", fontSize:DS.fs.md }}>Cancel</button>
          <button onClick={handleSave} style={{ background:DS.accent, border:"none", color:"#0a0f1a", padding:"9px 24px", borderRadius:DS.r.sm, cursor:"pointer", fontSize:DS.fs.md, fontWeight:DS.fw.black }}>Save Checklist</button>
        </div>
      </div>
    </div>
  );
}

// ── CSV Import Modal ────────────────────────────────────────────
function CSVImportModal({ onImport, onClose, submarketList }) {
  const [step, setStep] = useState("upload"); // upload → preview → confirm
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [importType, setImportType] = useState("deals");
  const [error, setError] = useState("");
  const [imported, setImported] = useState(0);

  const DEAL_FIELDS = ["name","client","counterparty","stage","dealType","repType","subtype","submarket","sqft","dealTotal","monthlyRent","leaseTerm","commissionRate","probability","expectedClose","followUpDate","leadSource","coBroker","splitPct","notes"];
  const CONTACT_FIELDS = ["name","company","contactType","phone","email","relationshipLevel","submarket","notes"];
  const fields = importType === "deals" ? DEAL_FIELDS : CONTACT_FIELDS;

  const parseCSV = (text) => {
    const lines = text.trim().split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return { error: "CSV must have a header row and at least one data row." };
    const headers = lines[0].split(",").map(h => h.replace(/"/g,"").trim());
    const rows = lines.slice(1).map(line => {
      const vals = [];
      let cur = ""; let inQ = false;
      for (let c of line) {
        if (c === '"') { inQ = !inQ; }
        else if (c === "," && !inQ) { vals.push(cur.trim()); cur = ""; }
        else cur += c;
      }
      vals.push(cur.trim());
      return Object.fromEntries(headers.map((h,i) => [h, vals[i] || ""]));
    });
    return { headers, rows };
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) { setError("Please upload a .csv file."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = parseCSV(ev.target.result);
      if (result.error) { setError(result.error); return; }
      setHeaders(result.headers);
      setRows(result.rows);
      // Auto-map headers that match field names
      const autoMap = {};
      fields.forEach(f => {
        const match = result.headers.find(h => h.toLowerCase().replace(/[^a-z]/g,"") === f.toLowerCase().replace(/[^a-z]/g,""));
        if (match) autoMap[f] = match;
      });
      setMapping(autoMap);
      setStep("map");
      setError("");
    };
    reader.readAsText(file);
  };

  const buildRecords = () => {
    return rows.slice(0, 200).map((row, i) => {
      if (importType === "deals") {
        const get = (f) => mapping[f] ? row[mapping[f]] || "" : "";
        const smList = submarketList || DEFAULT_SUBMARKETS;
        return {
          id: Date.now() + i,
          name: get("name") || `Imported Deal ${i+1}`,
          client: get("client"), counterparty: get("counterparty"),
          stage: STAGES.includes(get("stage")) ? get("stage") : "Prospect",
          dealType: ["Sale","Lease"].includes(get("dealType")) ? get("dealType") : "Sale",
          repType: get("repType") || "Seller/Landlord Rep",
          subtype: INDUSTRIAL_SUBTYPES.includes(get("subtype")) ? get("subtype") : "Distribution",
          submarket: smList.includes(get("submarket")) ? get("submarket") : (smList[0] || "Northeast"),
          sqft: parseFloat(get("sqft")) || 0,
          dealTotal: parseFloat(get("dealTotal")) || 0,
          monthlyRent: parseFloat(get("monthlyRent")) || 0,
          leaseTerm: parseFloat(get("leaseTerm")) || 0,
          commissionRate: parseFloat(get("commissionRate")) || 5,
          probability: parseFloat(get("probability")) || 25,
          expectedClose: get("expectedClose"), followUpDate: get("followUpDate"),
          leadSource: LEAD_SOURCES.includes(get("leadSource")) ? get("leadSource") : "Other",
          coBroker: get("coBroker"), splitPct: parseFloat(get("splitPct")) || 100,
          notes: get("notes"), broker:"Me", daysInStage:0, activities:[], richNotes:[], tags:[], documents:[],
          won:null, lossReason:"",
          stageHistory:[{ stage: STAGES.includes(get("stage")) ? get("stage") : "Prospect", enteredDate:today, note:"Imported from CSV" }]
        };
      } else {
        const get = (f) => mapping[f] ? row[mapping[f]] || "" : "";
        return {
          id: Date.now() + i,
          name: get("name") || `Contact ${i+1}`,
          company: get("company"), contactType: get("contactType") || "Other",
          phone: get("phone"), email: get("email"),
          relationshipLevel: ["Cold","Warm","Active","Key Relationship"].includes(get("relationshipLevel")) ? get("relationshipLevel") : "Cold",
          submarket: get("submarket"), notes: get("notes"),
          lastContact: "", activityLog: [], linkedDeals: []
        };
      }
    });
  };

  const handleImport = () => {
    const records = buildRecords();
    onImport(importType, records);
    setImported(records.length);
    setStep("done");
  };

  const iStyle = { background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:DS.r.sm, color:DS.text, padding:"6px 9px", fontSize:DS.fs.sm, outline:"none", width:"100%" };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(3,8,18,0.92)", backdropFilter:"blur(12px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1200 }}>
      <div style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:DS.r.xl, width:600, maxHeight:"88vh", display:"flex", flexDirection:"column", boxShadow:DS.shadow.xl }}>

        <div style={{ padding:"18px 24px 14px", borderBottom:`1px solid ${DS.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          <div>
            <div style={{ color:DS.text, fontWeight:DS.fw.black, fontSize:DS.fs.h2 }}>Import from CSV</div>
            <div style={{ color:DS.textMute, fontSize:DS.fs.sm, marginTop:2 }}>Import deals or contacts from a spreadsheet</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:DS.textMute, fontSize:20, cursor:"pointer" }}>×</button>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>

          {step === "upload" && (
            <div>
              <div style={{ marginBottom:16 }}>
                <div style={{ color:DS.textMute, fontSize:DS.fs.xs, fontWeight:DS.fw.bold, marginBottom:8 }}>Import type</div>
                <div style={{ display:"flex", gap:8 }}>
                  {["deals","contacts"].map(t => (
                    <button key={t} onClick={() => setImportType(t)} style={{ flex:1, padding:"10px", borderRadius:DS.r.sm, border:`1px solid ${importType===t ? DS.accent : DS.border}`, background:importType===t ? DS.accentSoft : DS.surface, color:importType===t ? DS.accent : DS.textMute, fontWeight:importType===t ? DS.fw.black : DS.fw.normal, cursor:"pointer", fontSize:DS.fs.md, textTransform:"capitalize" }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ background:DS.bg, border:`2px dashed ${DS.border}`, borderRadius:DS.r.lg, padding:"36px 24px", textAlign:"center", marginBottom:16 }}>
                <div style={{ color:DS.textMute, fontSize:DS.fs.lg, marginBottom:8 }}>Drop your CSV file or click to upload</div>
                <div style={{ color:DS.textFaint, fontSize:DS.fs.sm, marginBottom:16 }}>First row must be headers · Max 200 rows</div>
                <input type="file" accept=".csv" onChange={handleFile} style={{ display:"none" }} id="csv-upload" />
                <label htmlFor="csv-upload" style={{ background:DS.accent, border:"none", color:"#0a0f1a", padding:"10px 24px", borderRadius:DS.r.sm, cursor:"pointer", fontSize:DS.fs.md, fontWeight:DS.fw.black, display:"inline-block" }}>Choose File</label>
              </div>
              <div style={{ background:DS.surface, borderRadius:DS.r.md, padding:"12px 16px" }}>
                <div style={{ color:DS.textMute, fontSize:DS.fs.xs, fontWeight:DS.fw.bold, marginBottom:6 }}>Expected columns for {importType}</div>
                <div style={{ color:DS.textFaint, fontSize:DS.fs.xs, lineHeight:1.8, fontFamily:"'DM Mono', monospace" }}>
                  {fields.slice(0,8).join(", ")}{fields.length > 8 ? `, +${fields.length-8} more` : ""}
                </div>
              </div>
              {error && <div style={{ color:DS.red, fontSize:DS.fs.sm, marginTop:10, fontWeight:DS.fw.bold }}>{error}</div>}
            </div>
          )}

          {step === "map" && (
            <div>
              <div style={{ color:DS.textMute, fontSize:DS.fs.sm, marginBottom:14 }}>
                Found <span style={{ color:DS.text, fontWeight:DS.fw.bold }}>{rows.length} rows</span> with <span style={{ color:DS.text, fontWeight:DS.fw.bold }}>{headers.length} columns</span>. Map your CSV columns to app fields.
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {fields.map(f => (
                  <div key={f}>
                    <div style={{ color:DS.textMute, fontSize:DS.fs.xs, marginBottom:3 }}>{f}</div>
                    <select value={mapping[f]||""} onChange={e => setMapping(m => ({ ...m, [f]: e.target.value }))} style={iStyle}>
                      <option value="">— skip —</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              {/* Preview first 3 rows */}
              {rows.length > 0 && (
                <div style={{ marginTop:18 }}>
                  <div style={{ color:DS.textMute, fontSize:DS.fs.xs, fontWeight:DS.fw.bold, marginBottom:8 }}>Preview (first 3 rows)</div>
                  <div style={{ overflowX:"auto", background:DS.bg, borderRadius:DS.r.sm, border:`1px solid ${DS.border}` }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:DS.fs.xs }}>
                      <thead>
                        <tr>{headers.slice(0,6).map(h => <th key={h} style={{ padding:"6px 10px", color:DS.textMute, textAlign:"left", borderBottom:`1px solid ${DS.border}`, whiteSpace:"nowrap" }}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {rows.slice(0,3).map((r,i) => <tr key={i}>{headers.slice(0,6).map(h => <td key={h} style={{ padding:"6px 10px", color:DS.textSub, borderBottom:`1px solid ${DS.border}`, maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r[h]||"—"}</td>)}</tr>)}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "done" && (
            <div style={{ textAlign:"center", padding:"24px 0" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>✓</div>
              <div style={{ color:DS.green, fontSize:DS.fs.h2, fontWeight:DS.fw.black, marginBottom:8 }}>Import complete</div>
              <div style={{ color:DS.textMute, fontSize:DS.fs.md }}>{imported} {importType} imported successfully.</div>
            </div>
          )}
        </div>

        <div style={{ padding:"12px 24px", borderTop:`1px solid ${DS.border}`, display:"flex", gap:10, justifyContent:"flex-end", flexShrink:0 }}>
          {step === "upload" && <button onClick={onClose} style={{ background:"none", border:`1px solid ${DS.border}`, color:DS.textSub, padding:"9px 20px", borderRadius:DS.r.sm, cursor:"pointer", fontSize:DS.fs.md }}>Cancel</button>}
          {step === "map" && (
            <>
              <button onClick={() => setStep("upload")} style={{ background:"none", border:`1px solid ${DS.border}`, color:DS.textSub, padding:"9px 20px", borderRadius:DS.r.sm, cursor:"pointer", fontSize:DS.fs.md }}>Back</button>
              <button onClick={handleImport} style={{ background:DS.accent, border:"none", color:"#0a0f1a", padding:"9px 24px", borderRadius:DS.r.sm, cursor:"pointer", fontSize:DS.fs.md, fontWeight:DS.fw.black }}>
                Import {rows.length} {importType}
              </button>
            </>
          )}
          {step === "done" && <button onClick={onClose} style={{ background:DS.green, border:"none", color:"#0a0f1a", padding:"9px 24px", borderRadius:DS.r.sm, cursor:"pointer", fontSize:DS.fs.md, fontWeight:DS.fw.black }}>Done</button>}
        </div>
      </div>
    </div>
  );
}

// ── Win/Loss Modal ──────────────────────────────────────────
function WinLossModal({ deal, onSave, onClose }) {
  const [won, setWon] = useState(true);
  const [reason, setReason] = useState(LOSS_REASONS[0]);
  const [notes, setNotes] = useState("");
  const iStyle = { background: "#070e1a", border: `1px solid ${DS.border}`, borderRadius: 8, color: "#f1f5f9", padding: "8px 11px", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1001 }}>
      <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: 16, padding: 28, width: 440 }}>
        <h2 style={{ color: "#f1f5f9", fontSize: 17, fontWeight: 800, margin: "0 0 6px 0" }}>Close Out Deal</h2>
        <div style={{ color: "#475569", fontSize: 12, marginBottom: 20 }}>{deal.name}</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          <button onClick={() => setWon(true)} style={{ flex: 1, background: won ? "#15803d" : "#0f1e2e", border: `1px solid ${won ? "#15803d" : "#1e3048"}`, color: won ? "#fff" : "#64748b", padding: "12px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 800 }}> Won</button>
          <button onClick={() => setWon(false)} style={{ flex: 1, background: !won ? "#7f1d1d" : "#0f1e2e", border: `1px solid ${!won ? "#dc2626" : "#1e3048"}`, color: !won ? "#fca5a5" : "#64748b", padding: "12px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 800 }}> Lost</button>
        </div>
        {!won && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 5 }}>Why did we lose it?</label>
            <select value={reason} onChange={e => setReason(e.target.value)} style={iStyle}>{LOSS_REASONS.map(r => <option key={r}>{r}</option>)}</select>
          </div>
        )}
        <div style={{ marginBottom: 18 }}>
          <label style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 5 }}>Notes (optional)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} style={{ ...iStyle, resize: "vertical" }} placeholder="Any details worth capturing..." />
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "none", border: `1px solid ${DS.border}`, color: "#94a3b8", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Cancel</button>
          <button onClick={() => onSave({ ...deal, stage: won ? "Closed" : "Lost", won, lossReason: won ? "" : reason, notes: notes || deal.notes })} style={{ background: won ? "#15803d" : "#dc2626", border: "none", color: "#fff", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 800 }}>{won ? "Mark Won" : "Mark Lost"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Quick Add Modal ─────────────────────────────────────────
function QuickAdd({ onSave, onClose }) {
  const [form, setForm] = useState({ name: "", sqft: "", stage: "Prospect", dealType: "Sale" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const iStyle = { background: "#070e1a", border: `1px solid ${DS.border}`, borderRadius: 8, color: "#f1f5f9", padding: "9px 12px", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(3,8,18,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: 16, padding: 26, width: 400 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ color: "#f1f5f9", fontSize: 17, fontWeight: 800, margin: 0 }}>Quick Add Deal</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 20, cursor: "pointer" }}></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div><label style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>Property Name *</label><input autoFocus value={form.name} onChange={e => set("name", e.target.value)} onKeyDown={e => e.key === "Enter" && form.name && onSave(form)} placeholder="e.g. Lakeside Distribution Center" style={iStyle} /></div>
          <div><label style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>Square Footage</label><input type="number" value={form.sqft} onChange={e => set("sqft", e.target.value)} placeholder="e.g. 50000" style={iStyle} /></div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}><label style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>Stage</label><select value={form.stage} onChange={e => set("stage", e.target.value)} style={iStyle}>{STAGES.filter(s => s !== "Closed" && s !== "Lost").map(s => <option key={s}>{s}</option>)}</select></div>
            <div style={{ flex: 1 }}><label style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>Type</label><select value={form.dealType} onChange={e => set("dealType", e.target.value)} style={iStyle}>{DEAL_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "none", border: `1px solid ${DS.border}`, color: "#94a3b8", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Cancel</button>
          <button onClick={() => form.name && onSave(form)} style={{ background: "#f59e0b", border: "none", color: "#0f1e2e", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 800 }}>Add Deal →</button>
        </div>
      </div>
    </div>
  );
}

// ── Full Deal Modal ─────────────────────────────────────────
// ── Documents Modal ───────────────────────────────────────────
function DocumentsModal({ deal, onClose, onSave }) {
  const docs = deal.documents || [];
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [docType, setDocType] = useState("LOI");
  const docTypes = ["LOI", "Lease Abstract", "Purchase Agreement", "Inspection Report", "Title / Survey", "CoStar Report", "Appraisal", "Environmental", "Commission Agreement", "Correspondence", "Other"];
  const typeColors = { "LOI":"#f59e0b","Lease Abstract":"#10b981","Purchase Agreement":"#3b82f6","Inspection Report":"#f97316","Title / Survey":"#8b5cf6","CoStar Report":"#06b6d4","Appraisal":"#ec4899","Environmental":"#84cc16","Commission Agreement":"#34d399","Correspondence":"#94a3b8","Other":"#64748b" };

  const addDoc = () => {
    if (!name.trim()) return;
    const newDoc = { id: Date.now(), name: name.trim(), url: url.trim(), type: docType, addedDate: today };
    onSave({ ...deal, documents: [newDoc, ...docs] });
    setName(""); setUrl("");
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1100 }}>
      <div style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:16, padding:26, width:580, maxHeight:"85vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <div>
            <h2 style={{ color:"#f1f5f9", fontSize:16, fontWeight:800, margin:0 }}> Documents — {deal.name}</h2>
            <div style={{ color:"#475569", fontSize:11, marginTop:2 }}>Link LOIs, leases, reports, and any deal-related files</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#64748b", fontSize:20, cursor:"pointer" }}></button>
        </div>

        {/* Add new doc */}
        <div style={{ background:"#0f1e2e", border:`1px solid ${DS.border}`, borderRadius:10, padding:"14px 16px", marginBottom:16 }}>
          <div style={{ color:"#94a3b8", fontSize:11, fontWeight:700, marginBottom:10 }}>ADD DOCUMENT / LINK</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:9 }}>
            <div>
              <label style={{ color:"#64748b", fontSize:10, fontWeight:600, display:"block", marginBottom:3 }}>Document Name *</label>
              <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addDoc()} placeholder='e.g. "Executed LOI - Draft 2"' style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:7, color:"#f1f5f9", padding:"7px 10px", fontSize:12, outline:"none", width:"100%", boxSizing:"border-box" }}/>
            </div>
            <div>
              <label style={{ color:"#64748b", fontSize:10, fontWeight:600, display:"block", marginBottom:3 }}>Type</label>
              <select value={docType} onChange={e=>setDocType(e.target.value)} style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:7, color:"#f1f5f9", padding:"7px 10px", fontSize:12, outline:"none", width:"100%", boxSizing:"border-box" }}>
                {docTypes.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom:10 }}>
            <label style={{ color:"#64748b", fontSize:10, fontWeight:600, display:"block", marginBottom:3 }}>URL / Link (optional — Google Drive, Dropbox, DocuSign, etc.)</label>
            <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://drive.google.com/..." style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:7, color:"#f1f5f9", padding:"7px 10px", fontSize:12, outline:"none", width:"100%", boxSizing:"border-box" }}/>
          </div>
          <button onClick={addDoc} style={{ background:"#3b82f6", border:"none", color:"#fff", padding:"7px 18px", borderRadius:7, cursor:"pointer", fontSize:12, fontWeight:800 }}>+ Add Document</button>
          <div style={{ color:"#334155", fontSize:10, marginTop:8 }}> Paste any URL — Google Drive, Dropbox, DocuSign, CoStar, email, Notion, etc.</div>
        </div>

        {/* Document list */}
        {docs.length === 0 && <div style={{ color:"#475569", fontSize:13, textAlign:"center", padding:"24px 0" }}>No documents linked yet.</div>}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {docs.map(doc => (
            <div key={doc.id} style={{ background:"#0f1e2e", border:`1px solid ${DS.border}`, borderRadius:9, padding:"11px 14px", display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ background:"#1e3048", color: typeColors[doc.type]||"#64748b", border:`1px solid ${typeColors[doc.type]||"#1e3048"}33`, padding:"2px 8px", borderRadius:20, fontSize:10, fontWeight:700, whiteSpace:"nowrap", flexShrink:0 }}>{doc.type}</span>
              <div style={{ flex:1, minWidth:0 }}>
                {doc.url ? (
                  <a href={doc.url} target="_blank" rel="noreferrer" style={{ color:"#60a5fa", fontWeight:600, fontSize:13, textDecoration:"none", display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                     {doc.name}
                  </a>
                ) : (
                  <div style={{ color:"#f1f5f9", fontWeight:600, fontSize:13 }}> {doc.name}</div>
                )}
                <div style={{ color:"#334155", fontSize:10, marginTop:2 }}>Added {new Date(doc.addedDate+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</div>
              </div>
              <button onClick={()=>onSave({ ...deal, documents: docs.filter(d=>d.id!==doc.id) })} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:13, flexShrink:0 }}></button>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", justifyContent:"flex-end", marginTop:18 }}>
          <button onClick={onClose} style={{ background:"#1e3048", border:"none", color:"#94a3b8", padding:"8px 18px", borderRadius:8, cursor:"pointer", fontSize:13 }}>Done</button>
        </div>
      </div>
    </div>
  );
}

function DealModal({ deal, onSave, onClose, submarketList, comps = [] }) {
  const smList = submarketList || DEFAULT_SUBMARKETS;
  const [form, setForm] = useState(deal || {
    name: "", client: "", counterparty: "", stage: "Prospect", dealType: "Sale", repType: "Seller/Landlord Rep",
    subtype: "Distribution", sqft: "", dealTotal: "", monthlyRent: "", leaseTerm: "", commissionRate: "",
    probability: "", expectedClose: "", notes: "", broker: "Me", daysInStage: 0, activities: [],
    followUpDate: "", leadSource: "Referral", coBroker: "", splitPct: 100, won: null, lossReason: "",
    richNotes: [], submarket: "Northeast", tags: [], documents: []
  });
  const [showWaterfall, setShowWaterfall] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const calc = calcDeal(form);
  const iStyle = { background: "#070e1a", border: `1px solid ${DS.border}`, borderRadius: 8, color: "#f1f5f9", padding: "8px 11px", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" };
  const label = (txt) => <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 4 }}>{txt}</label>;
  const sectionHead = (txt) => <div style={{ color: "#475569", fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 8, marginTop: 4 }}>{txt}</div>;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(3,8,18,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: 16, padding: 26, width: 660, maxHeight: "93vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ color: "#f1f5f9", fontSize: 17, fontWeight: 800, margin: 0 }}>{deal?.id ? "Edit Deal" : "New Deal"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 20, cursor: "pointer" }}></button>
        </div>

        {sectionHead("DEAL INFO")}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginBottom: 14 }}>
          <div style={{ gridColumn: "span 2" }}>{label("Property Name")}<input value={form.name} onChange={e => set("name", e.target.value)} style={iStyle} /></div>
          <div>{label("Your Client")}<input value={form.client} onChange={e => set("client", e.target.value)} placeholder="Who you represent" style={iStyle} /></div>
          <div>{label("Counterparty (Buyer/Tenant)")}<input value={form.counterparty} onChange={e => set("counterparty", e.target.value)} placeholder="Other side of deal" style={iStyle} /></div>
          <div>{label("Stage")}<select value={form.stage} onChange={e => set("stage", e.target.value)} style={iStyle}>{STAGES.map(s => <option key={s}>{s}</option>)}</select></div>
          <div>{label("Deal Type")}<select value={form.dealType} onChange={e => set("dealType", e.target.value)} style={iStyle}>{DEAL_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
          <div>{label("Representation")}<select value={form.repType} onChange={e => set("repType", e.target.value)} style={iStyle}>{REP_TYPES.map(r => <option key={r}>{r}</option>)}</select></div>
          <div>{label("Industrial Subtype")}<select value={form.subtype} onChange={e => set("subtype", e.target.value)} style={iStyle}>{INDUSTRIAL_SUBTYPES.map(s => <option key={s}>{s}</option>)}</select></div>
          <div>{label("Submarket")}<select value={form.submarket || smList[0]} onChange={e => set("submarket", e.target.value)} style={iStyle}>{smList.map(s => <option key={s}>{s}</option>)}</select></div>
          <div>{label("Square Footage")}<input type="number" value={form.sqft} onChange={e => set("sqft", e.target.value)} placeholder="e.g. 50000" style={iStyle} /></div>
          <div>{label("Lead Source")}<select value={form.leadSource} onChange={e => set("leadSource", e.target.value)} style={iStyle}>{LEAD_SOURCES.map(s => <option key={s}>{s}</option>)}</select></div>
          <div>{label("Expected Close")}<input type="date" value={form.expectedClose} onChange={e => set("expectedClose", e.target.value)} style={iStyle} /></div>
          <div>{label("Follow-up Date")}<input type="date" value={form.followUpDate} onChange={e => set("followUpDate", e.target.value)} style={iStyle} /></div>
          <div>{label("Probability (%)")}<input type="number" value={form.probability} onChange={e => set("probability", e.target.value)} style={iStyle} /></div>
        </div>

        {sectionHead(form.dealType === "Lease" ? "LEASE DETAILS" : "SALE DETAILS")}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginBottom: 14 }}>
          {form.dealType === "Sale" ? (
            <div>{label("Sale Price ($)")}<input type="number" value={form.dealTotal} onChange={e => set("dealTotal", e.target.value)} style={iStyle} /></div>
          ) : (
            <>
              <div>{label("Monthly Rent ($)")}<input type="number" value={form.monthlyRent} onChange={e => set("monthlyRent", e.target.value)} style={iStyle} /></div>
              <div>{label("Lease Term (months)")}<input type="number" value={form.leaseTerm} onChange={e => set("leaseTerm", e.target.value)} style={iStyle} /></div>
            </>
          )}
          <div>{label("Commission Rate (%)")}<input type="number" value={form.commissionRate} onChange={e => set("commissionRate", e.target.value)} style={iStyle} /></div>
        </div>

        {sectionHead("CO-BROKER SPLIT")}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginBottom: 14 }}>
          <div>{label("Co-Broker Name")}<input value={form.coBroker} onChange={e => set("coBroker", e.target.value)} placeholder="Leave blank if sole broker" style={iStyle} /></div>
          <div>{label("Your Split (%)")}<input type="number" value={form.splitPct} onChange={e => set("splitPct", e.target.value)} min="0" max="100" style={iStyle} /></div>
        </div>

        {(calc.totalValue > 0 || calc.grossCommission > 0) && (
          <div style={{ background: "#070e1a", border: `1px solid ${DS.border}`, borderRadius: 10, padding: "12px 16px", marginBottom: 14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div style={{ display:"flex", gap: 20, flexWrap: "wrap" }}>
                <div><div style={{ color: "#64748b", fontSize: 10 }}>Total Value</div><div style={{ color: "#94a3b8", fontWeight: 800, fontSize: 15 }}>{fmt(calc.totalValue)}</div></div>
                {calc.sqft > 0 && <div><div style={{ color: "#64748b", fontSize: 10 }}>$/SF</div><div style={{ color: "#94a3b8", fontWeight: 800, fontSize: 15 }}>${(calc.totalValue / calc.sqft).toFixed(2)}</div></div>}
                <div><div style={{ color: "#64748b", fontSize: 10 }}>Gross Commission</div><div style={{ color: calc.isSplit ? "#64748b" : "#f59e0b", fontWeight: 800, fontSize: 15, textDecoration: calc.isSplit ? "line-through" : "none" }}>{fmt(calc.grossCommission)}</div></div>
                {calc.isSplit && <div><div style={{ color: "#64748b", fontSize: 10 }}>Your Net ({form.splitPct}%)</div><div style={{ color: "#f59e0b", fontWeight: 800, fontSize: 15 }}>{fmt(calc.netCommission)}</div></div>}
                <div><div style={{ color: "#64748b", fontSize: 10 }}>Weighted Value</div><div style={{ color: "#34d399", fontWeight: 800, fontSize: 15 }}>{fmt(calc.weighted)}</div></div>
              </div>
              <button onClick={() => setShowWaterfall(true)} style={{ background: DS.accentSoft, border: `1px solid ${DS.accent}44`, color: DS.accent, padding: "5px 12px", borderRadius: DS.r.sm, cursor: "pointer", fontSize: DS.fs.xs, fontWeight: DS.fw.bold, whiteSpace: "nowrap", flexShrink: 0 }}>Waterfall</button>
            </div>
          </div>
        )}
        {showWaterfall && <CommissionWaterfallModal deal={form} onClose={() => setShowWaterfall(false)} />}

        <div style={{ marginBottom: 14 }}>
          <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>Tags</label>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
            {(form.tags||[]).map(tag => (
              <span key={tag} style={{ background:"#1e3a5f", color:"#60a5fa", border:"1px solid #1e4a7f", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}
                onClick={()=>set("tags",(form.tags||[]).filter(t=>t!==tag))}>
                {tag} <span style={{ fontSize:10, opacity:0.7 }}></span>
              </span>
            ))}
            {(form.tags||[]).length === 0 && <span style={{ color:"#334155", fontSize:11 }}>No tags yet — click below to add</span>}
          </div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {DEAL_TAG_SUGGESTIONS.filter(s=>!(form.tags||[]).includes(s)).map(s=>(
              <button key={s} onClick={()=>set("tags",[...(form.tags||[]),s])} style={{ background:"#0f1e2e", border:`1px solid ${DS.border}`, color:"#64748b", padding:"3px 9px", borderRadius:20, fontSize:10, cursor:"pointer" }}>{s}</button>
            ))}
            <input placeholder="Custom tag..." onKeyDown={e=>{ if(e.key==="Enter"&&e.target.value.trim()&&!(form.tags||[]).includes(e.target.value.trim())){ set("tags",[...(form.tags||[]),e.target.value.trim()]); e.target.value=""; }}} style={{ background:"#0f1e2e", border:"1px dashed #1e3048", borderRadius:20, color:"#94a3b8", padding:"3px 10px", fontSize:10, outline:"none", width:100 }}/>
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 4 }}>Quick Notes</label>
          <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} style={{ ...iStyle, resize: "vertical" }} placeholder="Short notes. Use Notes button for detailed LOI, deal terms, requirements..." />
        </div>

        {(form.stageHistory||[]).length > 0 && (
          <div style={{ marginBottom: 18 }}>
            {sectionHead("STAGE HISTORY")}
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              {[...(form.stageHistory||[])].reverse().map((h, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 10px", background:"#0f1e2e", borderRadius:7, border:`1px solid ${DS.border}` }}>
                  <StageBadge stage={h.stage} />
                  <span style={{ color:"#475569", fontSize:10 }}>{h.enteredDate ? new Date(h.enteredDate+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—"}</span>
                  {h.note && <span style={{ color:"#334155", fontSize:10, fontStyle:"italic" }}>{h.note}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Comp Intelligence ── */}
        {(() => {
          const sm = form.submarket;
          const dt = form.dealType;
          const sqft = parseFloat(form.sqft) || 0;
          const relevantComps = comps
            .filter(c => c.submarket === sm && c.compType === dt)
            .sort((a,b) => new Date(b.closeDate||0) - new Date(a.closeDate||0))
            .slice(0, 4);
          if (relevantComps.length === 0) return null;
          const avgPsf = relevantComps.reduce((s,c) => s + (dt==="Sale" ? parseFloat(c.psfSale)||0 : parseFloat(c.psfLease)||0), 0) / relevantComps.length;
          const dealPsf = sqft > 0 ? (dt==="Sale" ? parseFloat(form.dealTotal)/sqft : parseFloat(form.monthlyRent)/sqft) : 0;
          return (
            <div style={{ marginBottom:18 }}>
              {sectionHead("COMP INTELLIGENCE — " + (sm||"").toUpperCase())}
              <div style={{ background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:DS.r.md, overflow:"hidden" }}>
                <div style={{ padding:"10px 14px", borderBottom:`1px solid ${DS.border}`, display:"flex", gap:20, flexWrap:"wrap", alignItems:"center" }}>
                  <div><span style={{ color:DS.textMute, fontSize:DS.fs.xs }}>Avg $/SF ({relevantComps.length} comps): </span><span style={{ color:DS.green, fontWeight:DS.fw.bold, fontFamily:"'DM Mono', monospace" }}>{avgPsf > 0 ? "$"+avgPsf.toFixed(2) : "—"}</span></div>
                  {dealPsf > 0 && avgPsf > 0 && (
                    <div><span style={{ color:DS.textMute, fontSize:DS.fs.xs }}>Your deal: </span>
                      <span style={{ color: dealPsf > avgPsf*1.05 ? DS.green : dealPsf < avgPsf*0.95 ? DS.red : DS.accent, fontWeight:DS.fw.bold, fontFamily:"'DM Mono', monospace" }}>
                        ${dealPsf.toFixed(2)} {dealPsf > avgPsf*1.05 ? "▲ above mkt" : dealPsf < avgPsf*0.95 ? "▼ below mkt" : "≈ at market"}
                      </span>
                    </div>
                  )}
                </div>
                {relevantComps.map((c, i) => (
                  <div key={c.id} style={{ display:"flex", gap:12, padding:"8px 14px", borderBottom: i < relevantComps.length-1 ? `1px solid ${DS.border}` : "none", alignItems:"center" }}>
                    <div style={{ flex:2, minWidth:0 }}>
                      <div style={{ color:DS.text, fontSize:DS.fs.sm, fontWeight:DS.fw.semi, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.name||"—"}</div>
                      <div style={{ color:DS.textMute, fontSize:10 }}>{c.sqft ? parseInt(c.sqft).toLocaleString()+" SF" : ""}{c.subtype ? " · "+c.subtype : ""}</div>
                    </div>
                    <div style={{ color:DS.accent, fontWeight:DS.fw.bold, fontSize:DS.fs.sm, fontFamily:"'DM Mono', monospace", flexShrink:0 }}>
                      {dt==="Sale" ? (c.psfSale > 0 ? "$"+parseFloat(c.psfSale).toFixed(2)+"/SF" : "—") : (c.psfLease > 0 ? "$"+parseFloat(c.psfLease).toFixed(3)+"/SF/mo" : "—")}
                    </div>
                    <div style={{ color:DS.textMute, fontSize:10, flexShrink:0 }}>{c.closeDate ? new Date(c.closeDate+"T00:00:00").toLocaleDateString("en-US",{month:"short",year:"numeric"}) : "—"}</div>
                    {c.verified && <span style={{ color:DS.green, fontSize:9, flexShrink:0, fontWeight:DS.fw.bold }}>verified</span>}
                    {c.notes && <div style={{ color:DS.textFaint, fontSize:10, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontStyle:"italic" }}>{c.notes}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "none", border: `1px solid ${DS.border}`, color: "#94a3b8", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Cancel</button>
          <button onClick={() => onSave(form)} style={{ background: "#f59e0b", border: "none", color: "#0f1e2e", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 800 }}>Save Deal</button>
        </div>
      </div>
    </div>
  );
}

// ── Listing Modal ─────────────────────────────────────────────
function ListingModal({ listing, onSave, onClose, submarketList }) {
  const smList = submarketList || DEFAULT_SUBMARKETS;
  const [form, setForm] = useState(listing || {
    name: "", address: "", submarket: (submarketList||DEFAULT_SUBMARKETS)[0]||"Northeast", subtype: "Distribution", sqft: "", askingPrice: "",
    monthlyRent: "", dealType: "Lease", status: "Active", listedDate: today, showings: [],
    marketingNotes: "", askingPsfSale: "", askingPsfLease: ""
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const [showingText, setShowingText] = useState("");
  const iStyle = { background: "#070e1a", border: `1px solid ${DS.border}`, borderRadius: 8, color: "#f1f5f9", padding: "8px 11px", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" };
  const label = (t) => <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 4 }}>{t}</label>;
  const addShowing = () => {
    if (!showingText.trim()) return;
    setForm(f => ({ ...f, showings: [...(f.showings||[]), { id: Date.now(), date: today, prospect: showingText.trim(), outcome: "" }] }));
    setShowingText("");
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: 16, padding: 26, width: 620, maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ color: "#f1f5f9", fontSize: 17, fontWeight: 800, margin: 0 }}>{listing?.id ? "Edit Listing" : "New Listing"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 20, cursor: "pointer" }}></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginBottom: 14 }}>
          <div style={{ gridColumn: "span 2" }}>{label("Property Name")}<input value={form.name} onChange={e => set("name", e.target.value)} style={iStyle} /></div>
          <div style={{ gridColumn: "span 2" }}>{label("Address")}<input value={form.address} onChange={e => set("address", e.target.value)} style={iStyle} /></div>
          <div>{label("Submarket")}<select value={form.submarket} onChange={e => set("submarket", e.target.value)} style={iStyle}>{smList.map(s => <option key={s}>{s}</option>)}</select></div>
          <div>{label("Subtype")}<select value={form.subtype} onChange={e => set("subtype", e.target.value)} style={iStyle}>{INDUSTRIAL_SUBTYPES.map(s => <option key={s}>{s}</option>)}</select></div>
          <div>{label("Square Footage")}<input type="number" value={form.sqft} onChange={e => set("sqft", e.target.value)} style={iStyle} /></div>
          <div>{label("Deal Type")}<select value={form.dealType} onChange={e => set("dealType", e.target.value)} style={iStyle}>{DEAL_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
          {form.dealType === "Sale" ? (
            <>
              <div>{label("Asking Price ($)")}<input type="number" value={form.askingPrice} onChange={e => set("askingPrice", e.target.value)} style={iStyle} /></div>
              <div>{label("Asking $/SF")}<input type="number" value={form.askingPsfSale} onChange={e => set("askingPsfSale", e.target.value)} style={iStyle} /></div>
            </>
          ) : (
            <>
              <div>{label("Monthly Rent ($)")}<input type="number" value={form.monthlyRent} onChange={e => set("monthlyRent", e.target.value)} style={iStyle} /></div>
              <div>{label("Asking $/SF/Month")}<input type="number" value={form.askingPsfLease} onChange={e => set("askingPsfLease", e.target.value)} style={iStyle} /></div>
            </>
          )}
          <div>{label("Status")}<select value={form.status} onChange={e => set("status", e.target.value)} style={iStyle}>{LISTING_STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
          <div>{label("Listed Date")}<input type="date" value={form.listedDate} onChange={e => set("listedDate", e.target.value)} style={iStyle} /></div>
        </div>
        <div style={{ marginBottom: 14 }}>{label("Marketing Notes")}<textarea value={form.marketingNotes} onChange={e => set("marketingNotes", e.target.value)} rows={2} style={{ ...iStyle, resize: "vertical" }} placeholder="CoStar status, LoopNet, sign, email campaigns..." /></div>
        <div style={{ marginBottom: 18 }}>
          <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Showing History ({(form.showings||[]).length})</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input value={showingText} onChange={e => setShowingText(e.target.value)} onKeyDown={e => e.key === "Enter" && addShowing()} placeholder="Prospect name / company" style={{ ...iStyle, flex: 1 }} />
            <button onClick={addShowing} style={{ background: "#3b82f6", border: "none", color: "#fff", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>+ Add</button>
          </div>
          {(form.showings||[]).map(s => (
            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#070e1a", borderRadius: 7, padding: "7px 10px", marginBottom: 5, border: `1px solid ${DS.border}` }}>
              <span style={{ color: "#f1f5f9", fontSize: 12 }}>{s.prospect}</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ color: "#475569", fontSize: 10 }}>{s.date}</span>
                <button onClick={() => setForm(f => ({ ...f, showings: f.showings.filter(x => x.id !== s.id) }))} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer" }}></button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "none", border: `1px solid ${DS.border}`, color: "#94a3b8", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Cancel</button>
          <button onClick={() => onSave(form)} style={{ background: "#10b981", border: "none", color: "#fff", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 800 }}>Save Listing</button>
        </div>
      </div>
    </div>
  );
}

// ── Prospecting Modal ─────────────────────────────────────────
function ProspectingModal({ campaign, onSave, onClose, submarketList }) {
  const smList = submarketList || DEFAULT_SUBMARKETS;
  const [form, setForm] = useState(campaign || {
    name: "", type: "Letter/Mailer", submarket: "Northeast", targetCount: "", sendDate: today,
    responses: "", conversations: "", convertedDeals: "", notes: "", status: "Draft"
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const iStyle = { background: "#070e1a", border: `1px solid ${DS.border}`, borderRadius: 8, color: "#f1f5f9", padding: "8px 11px", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" };
  const label = (t) => <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 4 }}>{t}</label>;
  const responseRate = form.targetCount > 0 ? ((parseFloat(form.responses)||0) / parseFloat(form.targetCount) * 100).toFixed(1) : null;
  const convRate = (parseFloat(form.responses)||0) > 0 ? ((parseFloat(form.conversations)||0) / (parseFloat(form.responses)||0) * 100).toFixed(1) : null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: 16, padding: 26, width: 560 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ color: "#f1f5f9", fontSize: 17, fontWeight: 800, margin: 0 }}>{campaign?.id ? "Edit Campaign" : "New Prospecting Campaign"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 20, cursor: "pointer" }}></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginBottom: 14 }}>
          <div style={{ gridColumn: "span 2" }}>{label("Campaign Name")}<input value={form.name} onChange={e => set("name", e.target.value)} placeholder='e.g. "Q1 Northeast Owner Mailer"' style={iStyle} /></div>
          <div>{label("Outreach Type")}<select value={form.type} onChange={e => set("type", e.target.value)} style={iStyle}>{LEAD_SOURCES.map(s => <option key={s}>{s}</option>)}</select></div>
          <div>{label("Submarket")}<select value={form.submarket} onChange={e => set("submarket", e.target.value)} style={iStyle}>{smList.map(s => <option key={s}>{s}</option>)}</select></div>
          <div>{label("Target Count (# sent)")}<input type="number" value={form.targetCount} onChange={e => set("targetCount", e.target.value)} style={iStyle} /></div>
          <div>{label("Send Date")}<input type="date" value={form.sendDate} onChange={e => set("sendDate", e.target.value)} style={iStyle} /></div>
          <div>{label("Responses / Inquiries")}<input type="number" value={form.responses} onChange={e => set("responses", e.target.value)} style={iStyle} /></div>
          <div>{label("Qualified Conversations")}<input type="number" value={form.conversations} onChange={e => set("conversations", e.target.value)} style={iStyle} /></div>
          <div>{label("Converted to Deals")}<input type="number" value={form.convertedDeals} onChange={e => set("convertedDeals", e.target.value)} style={iStyle} /></div>
          <div>{label("Status")}<select value={form.status} onChange={e => set("status", e.target.value)} style={iStyle}>{["Draft","Sent","In Progress","Complete"].map(s => <option key={s}>{s}</option>)}</select></div>
        </div>
        {responseRate && (
          <div style={{ background: "#070e1a", border: `1px solid ${DS.border}`, borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", gap: 20 }}>
            <div><div style={{ color: "#64748b", fontSize: 10 }}>Response Rate</div><div style={{ color: "#34d399", fontWeight: 800, fontSize: 16 }}>{responseRate}%</div></div>
            {convRate && <div><div style={{ color: "#64748b", fontSize: 10 }}>Response → Conversation</div><div style={{ color: "#f59e0b", fontWeight: 800, fontSize: 16 }}>{convRate}%</div></div>}
            <div><div style={{ color: "#64748b", fontSize: 10 }}>Deals Created</div><div style={{ color: "#60a5fa", fontWeight: 800, fontSize: 16 }}>{form.convertedDeals || 0}</div></div>
          </div>
        )}
        <div style={{ marginBottom: 18 }}>{label("Notes / Strategy")}<textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} style={{ ...iStyle, resize: "vertical" }} placeholder="Target criteria, message used, lessons learned..." /></div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "none", border: `1px solid ${DS.border}`, color: "#94a3b8", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Cancel</button>
          <button onClick={() => onSave(form)} style={{ background: "#8b5cf6", border: "none", color: "#fff", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 800 }}>Save Campaign</button>
        </div>
      </div>
    </div>
  );
}

// ── Listings Tab ─────────────────────────────────────────────
function ListingsTab({ listings, setListings, submarketList }) {
  const [modal, setModal] = useState(null);
  const statusColors = { "Active": { bg: "#0f2010", text: "#4ade80", border: "#14532d" }, "Under Contract": { bg: "#fff7ed", text: "#c2410c", border: "#fdba74" }, "Off Market": { bg: "#1e3048", text: "#64748b", border: "#1e3048" }, "Leased/Sold": { bg: "#f0fdf4", text: "#15803d", border: "#4ade80" } };
  const saveListing = (form) => {
    const d = { ...form, sqft: parseFloat(form.sqft)||0, askingPrice: parseFloat(form.askingPrice)||0, monthlyRent: parseFloat(form.monthlyRent)||0, askingPsfSale: parseFloat(form.askingPsfSale)||0, askingPsfLease: parseFloat(form.askingPsfLease)||0 };
    if (form.id) setListings(prev => prev.map(l => l.id === form.id ? d : l));
    else setListings(prev => [...prev, { ...d, id: Date.now(), daysOnMarket: 0 }]);
    setModal(null);
  };
  const activeSF = listings.filter(l => l.status === "Active").reduce((s,l) => s+(l.sqft||0), 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 16 }}>Active Listings</div>
          <div style={{ color: "#475569", fontSize: 11 }}>{listings.filter(l=>l.status==="Active").length} active · {activeSF.toLocaleString()} SF available</div>
        </div>
        <button onClick={() => setModal("new")} style={{ background: "#10b981", border: "none", color: "#fff", padding: "7px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 800 }}>+ Add Listing</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
        {listings.map(l => {
          const sc = statusColors[l.status] || statusColors["Active"];
          const dom = l.listedDate ? Math.floor((new Date() - new Date(l.listedDate)) / 86400000) : (l.daysOnMarket || 0);
          return (
            <div key={l.id} style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14 }}>{l.name}</div>
                  <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>{l.address} · {l.submarket}</div>
                </div>
                <span style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{l.status}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
                <div style={{ background: "#070e1a", borderRadius: 7, padding: "8px 10px", border: `1px solid ${DS.border}` }}>
                  <div style={{ color: "#475569", fontSize: 9, fontWeight: 700 }}>SIZE</div>
                  <div style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 700 }}>{l.sqft ? l.sqft.toLocaleString() : "—"} SF</div>
                </div>
                <div style={{ background: "#070e1a", borderRadius: 7, padding: "8px 10px", border: `1px solid ${DS.border}` }}>
                  <div style={{ color: "#475569", fontSize: 9, fontWeight: 700 }}>{l.dealType === "Sale" ? "ASKING" : "RENT/MO"}</div>
                  <div style={{ color: "#f59e0b", fontSize: 13, fontWeight: 700 }}>{l.dealType === "Sale" ? fmt(l.askingPrice) : fmt(l.monthlyRent)}</div>
                </div>
                <div style={{ background: dom > 90 ? "#2d1515" : "#0f1e2e", borderRadius: 7, padding: "8px 10px", border: `1px solid ${dom > 90 ? "#7f1d1d" : "#1e3048"}` }}>
                  <div style={{ color: "#475569", fontSize: 9, fontWeight: 700 }}>DOM</div>
                  <div style={{ color: dom > 90 ? "#fca5a5" : "#f1f5f9", fontSize: 13, fontWeight: 700 }}>{dom}d</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                <span style={{ background: "#1e3048", color: "#94a3b8", padding: "2px 8px", borderRadius: 20, fontSize: 10 }}>{l.subtype}</span>
                <span style={{ background: l.dealType === "Sale" ? "#1e3a5f" : "#1a2a1a", color: l.dealType === "Sale" ? "#60a5fa" : "#4ade80", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{l.dealType}</span>
                {(l.dealType === "Sale" ? l.askingPsfSale : l.askingPsfLease) > 0 && <span style={{ background: "#1e3048", color: "#f59e0b", padding: "2px 8px", borderRadius: 20, fontSize: 10 }}>${l.dealType === "Sale" ? l.askingPsfSale : l.askingPsfLease}/SF{l.dealType === "Lease" ? "/mo" : ""}</span>}
              </div>
              {(l.showings||[]).length > 0 && <div style={{ color: "#64748b", fontSize: 11, marginBottom: 8 }}> {l.showings.length} showing{l.showings.length !== 1 ? "s" : ""}</div>}
              {l.marketingNotes && <div style={{ color: "#475569", fontSize: 11, marginBottom: 10, fontStyle: "italic" }}>{l.marketingNotes}</div>}
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setModal(l)} style={{ flex: 1, background: "#1e3048", border: "none", color: "#94a3b8", padding: "6px", borderRadius: 7, cursor: "pointer", fontSize: 11 }}> Edit</button>
                <button onClick={() => { if (window.confirm("Delete listing?")) setListings(prev => prev.filter(x => x.id !== l.id)); }} style={{ background: "none", border: `1px solid ${DS.border}`, color: "#475569", padding: "6px 10px", borderRadius: 7, cursor: "pointer", fontSize: 11 }}></button>
              </div>
            </div>
          );
        })}
        {listings.length === 0 && <div style={{ color: "#475569", fontSize: 13, padding: "40px 0", textAlign: "center", gridColumn: "1/-1" }}>No listings yet. Add your first active listing.</div>}
      </div>
      {modal && <ListingModal listing={modal === "new" ? null : modal} onSave={saveListing} onClose={() => setModal(null)} submarketList={submarketList} />}
    </div>
  );
}

// ── Commission Forecast Tab ───────────────────────────────────
function ForecastTab({ deals }) {
  const enriched = useMemo(() => deals.map(calcDeal), [deals]);
  const now = new Date();
  const getMonthKey = (d) => {
    if (!d.expectedClose) return null;
    return d.expectedClose.substring(0, 7);
  };
  // Build next 6 months
  const months = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push({ key: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`, label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`, month: d.getMonth(), year: d.getFullYear() });
  }
  const forecastData = months.map(m => {
    const mDeals = enriched.filter(d => getMonthKey(d) === m.key && d.stage !== "Lost");
    const certain = mDeals.filter(d => d.probability >= 80 && d.stage !== "Closed");
    const probable = mDeals.filter(d => d.probability >= 50 && d.probability < 80);
    const speculative = mDeals.filter(d => d.probability < 50);
    const closed = mDeals.filter(d => d.stage === "Closed");
    const weightedTotal = mDeals.reduce((s,d) => s + d.weighted, 0);
    return { ...m, mDeals, certain, probable, speculative, closed, weightedTotal };
  });
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const nextMonthD = new Date(now.getFullYear(), now.getMonth()+1, 1);
  const nextMonthKey = `${nextMonthD.getFullYear()}-${String(nextMonthD.getMonth()+1).padStart(2,"0")}`;
  const qEnd = new Date(now.getFullYear(), now.getMonth() + (3 - now.getMonth() % 3), 0);
  const quarterTotal = enriched.filter(d => {
    if (!d.expectedClose || d.stage === "Lost") return false;
    const cd = new Date(d.expectedClose);
    return cd >= now && cd <= qEnd;
  }).reduce((s,d) => s + d.weighted, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 16 }}>Commission Forecast</div>
        <div style={{ color: "#475569", fontSize: 11 }}>Probability-weighted cash flow calendar · next 6 months</div>
      </div>
      {/* Summary cards */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {[
          { label: "This Month", value: fmt(forecastData[0]?.weightedTotal||0), sub: `${forecastData[0]?.mDeals.length||0} deals closing`, color: "#f59e0b" },
          { label: "Next Month", value: fmt(forecastData[1]?.weightedTotal||0), sub: `${forecastData[1]?.mDeals.length||0} deals closing`, color: "#60a5fa" },
          { label: "This Quarter", value: fmt(quarterTotal), sub: "Weighted pipeline", color: "#34d399" },
        ].map(c => (
          <div key={c.label} style={{ flex: 1, minWidth: 160, background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600 }}>{c.label}</div>
            <div style={{ color: c.color, fontSize: 22, fontWeight: 800, margin: "4px 0" }}>{c.value}</div>
            <div style={{ color: "#475569", fontSize: 10 }}>{c.sub}</div>
          </div>
        ))}
      </div>
      {/* Monthly breakdown */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {forecastData.map(m => (
          <div key={m.key} style={{ background: m.key === thisMonthKey ? "#1a2d42" : DS.panel, border: `1px solid ${m.key === thisMonthKey ? "#3b82f6" : "#1e3048"}`, borderRadius: 12, padding: "14px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: m.mDeals.length > 0 ? 12 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 14 }}>{m.label}</div>
                {m.key === thisMonthKey && <span style={{ background: "#3b82f6", color: "#fff", padding: "1px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>THIS MONTH</span>}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#f59e0b", fontWeight: 800, fontSize: 18 }}>{fmt(m.weightedTotal)}</div>
                <div style={{ color: "#475569", fontSize: 10 }}>weighted</div>
              </div>
            </div>
            {m.mDeals.length === 0 && <div style={{ color: "#334155", fontSize: 12 }}>No deals closing this month</div>}
            {m.mDeals.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {m.closed.map(d => (
                  <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0f2010", border: "1px solid #14532d", borderRadius: 8, padding: "8px 12px" }}>
                    <div><div style={{ color: "#4ade80", fontSize: 12, fontWeight: 600 }}> {d.name}</div><div style={{ color: "#16a34a", fontSize: 10 }}>{d.client} · Closed</div></div>
                    <div style={{ color: "#4ade80", fontWeight: 800, fontSize: 13 }}>{fmt(d.netCommission)}</div>
                  </div>
                ))}
                {m.certain.map(d => (
                  <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#070e1a", border: `1px solid ${DS.border}`, borderRadius: 8, padding: "8px 12px" }}>
                    <div><div style={{ color: "#f1f5f9", fontSize: 12, fontWeight: 600 }}>{d.name}</div><div style={{ color: "#64748b", fontSize: 10 }}>{d.client} · {d.stage} · {d.probability}% probability</div></div>
                    <div style={{ textAlign: "right" }}><div style={{ color: "#f59e0b", fontWeight: 700, fontSize: 13 }}>{fmt(d.weighted)}</div><div style={{ color: "#475569", fontSize: 10 }}>of {fmt(d.netCommission)}</div></div>
                  </div>
                ))}
                {m.probable.map(d => (
                  <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#070e1a", border: `1px solid ${DS.border}`, borderRadius: 8, padding: "8px 12px", opacity: 0.85 }}>
                    <div><div style={{ color: "#f1f5f9", fontSize: 12 }}>{d.name}</div><div style={{ color: "#64748b", fontSize: 10 }}>{d.client} · {d.stage} · {d.probability}% probability</div></div>
                    <div style={{ textAlign: "right" }}><div style={{ color: "#f59e0b", fontSize: 12 }}>{fmt(d.weighted)}</div><div style={{ color: "#475569", fontSize: 10 }}>of {fmt(d.netCommission)}</div></div>
                  </div>
                ))}
                {m.speculative.map(d => (
                  <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#070e1a", border: "1px dashed #1e3048", borderRadius: 8, padding: "8px 12px", opacity: 0.65 }}>
                    <div><div style={{ color: "#94a3b8", fontSize: 12 }}>{d.name}</div><div style={{ color: "#475569", fontSize: 10 }}>{d.client} · {d.stage} · {d.probability}% probability</div></div>
                    <div style={{ textAlign: "right" }}><div style={{ color: "#94a3b8", fontSize: 12 }}>{fmt(d.weighted)}</div><div style={{ color: "#475569", fontSize: 10 }}>of {fmt(d.netCommission)}</div></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: 10, padding: "10px 14px" }}>
        <div style={{ color: "#475569", fontSize: 11 }}> Solid borders = 50%+ probability · Dashed borders = speculative (&lt;50%) · Green = already closed</div>
      </div>
    </div>
  );
}

// ── Prospecting Tab ───────────────────────────────────────────
function ProspectingTab({ campaigns, setCampaigns, deals, submarketList }) {
  const smList = submarketList || DEFAULT_SUBMARKETS;
  const [modal, setModal] = useState(null);
  const saveCampaign = (form) => {
    const d = { ...form, targetCount: parseInt(form.targetCount)||0, responses: parseInt(form.responses)||0, conversations: parseInt(form.conversations)||0, convertedDeals: parseInt(form.convertedDeals)||0 };
    if (form.id) setCampaigns(prev => prev.map(c => c.id === form.id ? d : c));
    else setCampaigns(prev => [...prev, { ...d, id: Date.now() }]);
    setModal(null);
  };
  const totalSent = campaigns.reduce((s,c) => s + (c.targetCount||0), 0);
  const totalResp = campaigns.reduce((s,c) => s + (c.responses||0), 0);
  const totalConv = campaigns.reduce((s,c) => s + (c.conversations||0), 0);
  const totalDeals = campaigns.reduce((s,c) => s + (c.convertedDeals||0), 0);
  const overallRate = totalSent > 0 ? (totalResp / totalSent * 100).toFixed(1) : null;
  const statusColors = { "Draft": "#64748b", "Sent": "#3b82f6", "In Progress": "#f59e0b", "Complete": "#10b981" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 16 }}>Prospecting Tracker</div>
          <div style={{ color: "#475569", fontSize: 11 }}>Track outreach campaigns from send to signed deal</div>
        </div>
        <button onClick={() => setModal("new")} style={{ background: "#8b5cf6", border: "none", color: "#fff", padding: "7px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 800 }}>+ New Campaign</button>
      </div>
      {campaigns.length > 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { label: "Total Sent", value: totalSent.toLocaleString(), icon: "" },
            { label: "Responses", value: totalResp.toLocaleString() + (overallRate ? ` (${overallRate}%)` : ""), icon: "↩️" },
            { label: "Conversations", value: totalConv, icon: "" },
            { label: "Deals Created", value: totalDeals, icon: "" },
          ].map(c => (
            <div key={c.label} style={{ flex: 1, minWidth: 120, background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{c.icon}</div>
              <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 18 }}>{c.value}</div>
              <div style={{ color: "#475569", fontSize: 10, fontWeight: 600 }}>{c.label}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {campaigns.map(c => {
          const rRate = c.targetCount > 0 ? (c.responses / c.targetCount * 100).toFixed(1) : null;
          const cRate = c.responses > 0 ? (c.conversations / c.responses * 100).toFixed(1) : null;
          return (
            <div key={c.id} style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14 }}>{c.name}</div>
                    <span style={{ background: "#1e3048", color: statusColors[c.status] || "#64748b", border: `1px solid ${statusColors[c.status] || "#1e3048"}`, padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{c.status}</span>
                  </div>
                  <div style={{ color: "#64748b", fontSize: 11, marginTop: 3 }}>{c.type} · {c.submarket} · {new Date(c.sendDate+"T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setModal(c)} style={{ background: "none", border: `1px solid ${DS.border}`, color: "#64748b", padding: "5px 10px", borderRadius: 7, cursor: "pointer", fontSize: 11 }}></button>
                  <button onClick={() => { if (window.confirm("Delete?")) setCampaigns(prev => prev.filter(x => x.id !== c.id)); }} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer" }}></button>
                </div>
              </div>
              {/* Funnel */}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {[
                  { label: "Sent", value: c.targetCount, color: "#64748b" },
                  { label: "Responded", value: c.responses, color: "#3b82f6", rate: rRate },
                  { label: "Conversations", value: c.conversations, color: "#f59e0b", rate: cRate },
                  { label: "Deals", value: c.convertedDeals, color: "#10b981" },
                ].map((step, i) => (
                  <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {i > 0 && <div style={{ color: "#334155", fontSize: 14 }}>→</div>}
                    <div style={{ background: "#070e1a", border: `1px solid #1e3048`, borderRadius: 8, padding: "8px 12px", textAlign: "center", minWidth: 70 }}>
                      <div style={{ color: step.color, fontWeight: 800, fontSize: 16 }}>{step.value || 0}</div>
                      <div style={{ color: "#475569", fontSize: 9, fontWeight: 700 }}>{step.label}</div>
                      {step.rate && <div style={{ color: step.color, fontSize: 9, marginTop: 1 }}>{step.rate}%</div>}
                    </div>
                  </div>
                ))}
              </div>
              {c.notes && <div style={{ color: "#475569", fontSize: 11, marginTop: 10, fontStyle: "italic" }}>{c.notes}</div>}
            </div>
          );
        })}
        {campaigns.length === 0 && <div style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: "40px 0" }}>No campaigns yet. Track your letter campaigns, cold call blitzes, email sequences...</div>}
      </div>
      {modal && <ProspectingModal campaign={modal === "new" ? null : modal} onSave={saveCampaign} onClose={() => setModal(null)} submarketList={smList} />}
    </div>
  );
}

// ── Market Comps Tab ──────────────────────────────────────────
function MarketCompsTab({ comps, setComps, submarketList }) {
  const [modal, setModal] = useState(null);
  const [filterSm, setFilterSm] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [search, setSearch] = useState("");
  const [expandedComp, setExpandedComp] = useState(null);
  const iStyle = { background: "#070e1a", border: `1px solid ${DS.border}`, borderRadius: 8, color: "#f1f5f9", padding: "8px 11px", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" };
  const label = (t) => <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 4 }}>{t}</label>;

  const saveComp = (form) => {
    const d = { ...form, sqft: parseFloat(form.sqft)||0, salePrice: parseFloat(form.salePrice)||0, monthlyRent: parseFloat(form.monthlyRent)||0, leaseTerm: parseFloat(form.leaseTerm)||0, psfSale: parseFloat(form.psfSale)||0, psfLease: parseFloat(form.psfLease)||0 };
    if (!d.psfSale && d.sqft && d.salePrice) d.psfSale = parseFloat((d.salePrice / d.sqft).toFixed(2));
    if (!d.psfLease && d.sqft && d.monthlyRent) d.psfLease = parseFloat((d.monthlyRent / d.sqft).toFixed(4));
    if (form.id) setComps(prev => prev.map(c => c.id === form.id ? d : c));
    else setComps(prev => [...prev, { ...d, id: Date.now() }]);
    setModal(null);
  };

  const filtered = comps.filter(c => {
    if (filterSm !== "All" && c.submarket !== filterSm) return false;
    if (filterType !== "All" && c.compType !== filterType) return false;
    if (search && !`${c.name} ${c.address} ${c.seller} ${c.buyer} ${c.listingBroker} ${c.tenantBroker}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a,b) => (b.closeDate||"").localeCompare(a.closeDate||""));

  const avgPsfSale = (() => { const s = filtered.filter(c=>c.compType==="Sale"&&c.psfSale>0); return s.length ? (s.reduce((a,c)=>a+c.psfSale,0)/s.length).toFixed(2) : null; })();
  const avgPsfLease = (() => { const s = filtered.filter(c=>c.compType==="Lease"&&c.psfLease>0); return s.length ? (s.reduce((a,c)=>a+c.psfLease,0)/s.length).toFixed(4) : null; })();
  const totalSF = filtered.reduce((s,c)=>s+(c.sqft||0),0);

  // Analytics data
  const PIE_COLORS = [DS.blue, DS.green, DS.accent, DS.purple, "#f97316", "#ec4899", "#06b6d4", "#84cc16"];
  const subtypePie = Object.entries(
    filtered.reduce((acc,c) => { const k=c.subtype||"Other"; acc[k]=(acc[k]||0)+1; return acc; }, {})
  ).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);

  const smPie = Object.entries(
    filtered.reduce((acc,c) => { const k=c.submarket||"Other"; acc[k]=(acc[k]||0)+1; return acc; }, {})
  ).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);

  const typeSplit = [
    { name:"Sales", value: filtered.filter(c=>c.compType==="Sale").length },
    { name:"Leases", value: filtered.filter(c=>c.compType==="Lease").length },
  ].filter(d=>d.value>0);

  // PSF trend over time (by quarter)
  const psfTrend = (() => {
    const byQ = {};
    filtered.filter(c=>c.closeDate&&(c.psfSale>0||c.psfLease>0)).forEach(c=>{
      const d = new Date(c.closeDate+"T00:00:00");
      const q = `${d.getFullYear()} Q${Math.ceil((d.getMonth()+1)/3)}`;
      if(!byQ[q]) byQ[q]={q, saleSum:0, saleCount:0, leaseSum:0, leaseCount:0};
      if(c.compType==="Sale"&&c.psfSale>0){byQ[q].saleSum+=parseFloat(c.psfSale); byQ[q].saleCount++;}
      if(c.compType==="Lease"&&c.psfLease>0){byQ[q].leaseSum+=parseFloat(c.psfLease)*1000; byQ[q].leaseCount++;}
    });
    return Object.values(byQ).sort((a,b)=>a.q.localeCompare(b.q)).map(r=>({
      q: r.q,
      "Sale $/SF": r.saleCount > 0 ? parseFloat((r.saleSum/r.saleCount).toFixed(2)) : null,
      "Lease (×1000)": r.leaseCount > 0 ? parseFloat((r.leaseSum/r.leaseCount).toFixed(2)) : null,
    }));
  })();

  // Submarket avg PSF table
  const smStats = submarketList.map(sm => {
    const smComps = filtered.filter(c=>c.submarket===sm);
    const sales = smComps.filter(c=>c.compType==="Sale"&&c.psfSale>0);
    const leases = smComps.filter(c=>c.compType==="Lease"&&c.psfLease>0);
    return {
      sm, count: smComps.length,
      avgSale: sales.length ? (sales.reduce((s,c)=>s+parseFloat(c.psfSale),0)/sales.length).toFixed(2) : null,
      avgLease: leases.length ? (leases.reduce((s,c)=>s+parseFloat(c.psfLease),0)/leases.length).toFixed(4) : null,
      totalSF: smComps.reduce((s,c)=>s+(c.sqft||0),0),
    };
  }).filter(r=>r.count>0).sort((a,b)=>b.count-a.count);

  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showMap, setShowMap] = useState(false);

  function CompModal({ comp }) {
    const [form, setForm] = useState(comp || {
      name:"", address:"", submarket: submarketList[0]||"Northeast", subtype:"Distribution",
      sqft:"", compType:"Sale", salePrice:"", monthlyRent:"", leaseTerm:"", psfSale:"", psfLease:"",
      closeDate:today, seller:"", buyer:"", listingBroker:"", tenantBroker:"", source:"CoStar", notes:"", verified:false
    });
    const set = (k,v) => setForm(f=>({...f,[k]:v}));
    const isLease = form.compType === "Lease";
    const autoSf = form.sqft > 0;
    const autoPsfSale = autoSf && form.salePrice > 0 ? (form.salePrice/form.sqft).toFixed(2) : "";
    const autoPsfLease = autoSf && form.monthlyRent > 0 ? (form.monthlyRent/form.sqft).toFixed(4) : "";
    return (
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
        <div style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:16, padding:26, width:660, maxHeight:"92vh", overflowY:"auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <h2 style={{ color:"#f1f5f9", fontSize:17, fontWeight:800, margin:0 }}>{comp?.id ? "Edit Comp" : "Add Market Comp"}</h2>
            <button onClick={()=>setModal(null)} style={{ background:"none", border:"none", color:"#64748b", fontSize:20, cursor:"pointer" }}></button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:11, marginBottom:14 }}>
            <div style={{ gridColumn:"span 2" }}>{label("Property Name")}<input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Northgate Distribution Center" style={iStyle}/></div>
            <div style={{ gridColumn:"span 2" }}>{label("Address")}<input value={form.address} onChange={e=>set("address",e.target.value)} style={iStyle}/></div>
            <div>{label("Submarket")}<select value={form.submarket} onChange={e=>set("submarket",e.target.value)} style={iStyle}>{submarketList.map(s=><option key={s}>{s}</option>)}</select></div>
            <div>{label("Subtype")}<select value={form.subtype} onChange={e=>set("subtype",e.target.value)} style={iStyle}>{INDUSTRIAL_SUBTYPES.map(s=><option key={s}>{s}</option>)}</select></div>
            <div>{label("Comp Type")}<select value={form.compType} onChange={e=>set("compType",e.target.value)} style={iStyle}>{COMP_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
            <div>{label("Square Footage")}<input type="number" value={form.sqft} onChange={e=>set("sqft",e.target.value)} style={iStyle}/></div>
            <div>{label("Close / Execution Date")}<input type="date" value={form.closeDate} onChange={e=>set("closeDate",e.target.value)} style={iStyle}/></div>
            <div>{label("Data Source")}<select value={form.source} onChange={e=>set("source",e.target.value)} style={iStyle}>{COMP_SOURCES.map(s=><option key={s}>{s}</option>)}</select></div>
          </div>
          <div style={{ color:"#475569", fontSize:10, fontWeight:700, letterSpacing:1, marginBottom:8 }}>{isLease ? "LEASE DETAILS" : "SALE DETAILS"}</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:11, marginBottom:14 }}>
            {isLease ? <>
              <div>{label("Monthly Rent ($)")}<input type="number" value={form.monthlyRent} onChange={e=>set("monthlyRent",e.target.value)} style={iStyle}/></div>
              <div>{label("Lease Term (months)")}<input type="number" value={form.leaseTerm} onChange={e=>set("leaseTerm",e.target.value)} style={iStyle}/></div>
              <div>{label("$/SF/Month")} <input type="number" value={form.psfLease || autoPsfLease} onChange={e=>set("psfLease",e.target.value)} placeholder={autoPsfLease||"Auto-calc"} style={iStyle}/></div>
            </> : <>
              <div>{label("Sale Price ($)")}<input type="number" value={form.salePrice} onChange={e=>set("salePrice",e.target.value)} style={iStyle}/></div>
              <div>{label("$/SF")}<input type="number" value={form.psfSale || autoPsfSale} onChange={e=>set("psfSale",e.target.value)} placeholder={autoPsfSale||"Auto-calc"} style={iStyle}/></div>
            </>}
          </div>
          <div style={{ color:"#475569", fontSize:10, fontWeight:700, letterSpacing:1, marginBottom:8 }}>PARTIES & BROKERS</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:11, marginBottom:14 }}>
            <div>{label("Seller / Landlord")}<input value={form.seller} onChange={e=>set("seller",e.target.value)} style={iStyle}/></div>
            <div>{label("Buyer / Tenant")}<input value={form.buyer} onChange={e=>set("buyer",e.target.value)} style={iStyle}/></div>
            <div>{label("Listing Broker / Firm")}<input value={form.listingBroker} onChange={e=>set("listingBroker",e.target.value)} style={iStyle}/></div>
            <div>{label("Tenant/Buyer Broker")}<input value={form.tenantBroker} onChange={e=>set("tenantBroker",e.target.value)} style={iStyle}/></div>
          </div>
          <div style={{ marginBottom:14 }}>{label("Notes")}<textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={2} style={{...iStyle,resize:"vertical"}} placeholder="Conditions, concessions, unusual terms..."/></div>
          <div style={{ marginBottom:14 }}>
            <div style={{ color:"#64748b", fontSize:11, fontWeight:700, marginBottom:6 }}>MAP COORDINATES <span style={{ color:"#334155", fontWeight:400 }}>— optional, for map view</span></div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div>{label("Latitude")}<input type="number" step="any" value={form.lat||""} onChange={e=>set("lat",e.target.value)} placeholder="e.g. 39.9526" style={iStyle}/></div>
              <div>{label("Longitude")}<input type="number" step="any" value={form.lng||""} onChange={e=>set("lng",e.target.value)} placeholder="e.g. -75.1652" style={iStyle}/></div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
            <input type="checkbox" checked={form.verified} onChange={e=>set("verified",e.target.checked)} id="verified" style={{ accentColor:"#10b981" }}/>
            <label htmlFor="verified" style={{ color:"#94a3b8", fontSize:12 }}>Verified / Confirmed comp</label>
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <button onClick={()=>setModal(null)} style={{ background:"none", border:`1px solid ${DS.border}`, color:"#94a3b8", padding:"8px 16px", borderRadius:8, cursor:"pointer", fontSize:13 }}>Cancel</button>
            <button onClick={()=>saveComp(form)} style={{ background:"#34d399", border:"none", color:"#0f1e2e", padding:"8px 20px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:800 }}>Save Comp</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ color:DS.text, fontWeight:DS.fw.black, fontSize:DS.fs.h2, letterSpacing:"-0.3px" }}>Market Comps</div>
          <div style={{ color:DS.textMute, fontSize:DS.fs.sm, marginTop:2 }}>Track what's trading in your submarkets — sales, leases, brokers, pricing</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={()=>setShowAnalytics(a=>!a)} style={{ background: showAnalytics ? DS.blueSoft : DS.panel, border:`1px solid ${showAnalytics ? DS.blue+"55" : DS.border}`, color: showAnalytics ? DS.blue : DS.textSub, padding:"7px 14px", borderRadius:DS.r.sm, cursor:"pointer", fontSize:DS.fs.sm, fontWeight:DS.fw.semi }}>
            {showAnalytics ? "Hide Analytics" : "Analytics"}
          </button>
          <button onClick={()=>setShowMap(m=>!m)} style={{ background: showMap ? DS.greenSoft : DS.panel, border:`1px solid ${showMap ? DS.green+"55" : DS.border}`, color: showMap ? DS.green : DS.textSub, padding:"7px 14px", borderRadius:DS.r.sm, cursor:"pointer", fontSize:DS.fs.sm, fontWeight:DS.fw.semi }}>
            {showMap ? "Hide Map" : "🗺 Map View"}
          </button>
          <button onClick={()=>setModal("new")} style={{ background:DS.green, border:"none", color:"#0a0f1a", padding:"7px 16px", borderRadius:DS.r.sm, cursor:"pointer", fontSize:DS.fs.sm, fontWeight:DS.fw.black }}>+ Add Comp</button>
        </div>
      </div>

      {/* Summary stats */}
      {comps.length > 0 && <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
        {[
          { label:"Total Comps", value:comps.length, color:DS.blue, sub:`${filtered.length} shown` },
          { label:"SF Tracked", value: totalSF > 0 ? totalSF.toLocaleString()+" SF" : "—", color:DS.accent, sub:"in filtered view" },
          { label:"Avg Sale $/SF", value: avgPsfSale ? "$"+avgPsfSale : "—", color:DS.green, sub:"sales only" },
          { label:"Avg Lease $/SF/mo", value: avgPsfLease ? "$"+parseFloat(avgPsfLease).toFixed(3) : "—", color:DS.purple, sub:"leases only" },
        ].map(c=>(
          <div key={c.label} className="card-hover" style={{ flex:1, minWidth:130, background:DS.panel, border:`1px solid ${DS.border}`, borderLeft:`3px solid ${c.color}`, borderRadius:DS.r.md, padding:"13px 16px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, right:0, width:50, height:50, background:`radial-gradient(circle at top right, ${c.color}10, transparent 70%)` }} />
            <div style={{ color:c.color, fontWeight:DS.fw.black, fontSize:DS.fs.h2, fontFamily:"'DM Mono', monospace" }}>{c.value}</div>
            <div style={{ color:DS.textMute, fontSize:10, fontWeight:DS.fw.bold, textTransform:"uppercase", letterSpacing:"0.5px", marginTop:4 }}>{c.label}</div>
            {c.sub && <div style={{ color:DS.textFaint, fontSize:9, marginTop:2 }}>{c.sub}</div>}
          </div>
        ))}
      </div>}

      {/* Analytics panels */}
      {showAnalytics && comps.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {/* Row 1: Pie charts */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
            {/* Sales vs Leases */}
            <div style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:DS.r.lg, padding:"16px 20px" }}>
              <div style={{ color:DS.text, fontSize:DS.fs.md, fontWeight:DS.fw.bold, marginBottom:12 }}>Sales vs Leases</div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={typeSplit} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {typeSplit.map((_, i) => <Cell key={i} fill={[DS.blue, DS.green][i]} />)}
                  </Pie>
                  <Tooltip formatter={(v,n)=>[v+" comps",n]} contentStyle={{ background:DS.surface, border:`1px solid ${DS.border}`, borderRadius:DS.r.sm, color:DS.text, fontSize:11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
                {typeSplit.map((t,i) => (
                  <div key={t.name} style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:[DS.blue,DS.green][i] }} />
                    <span style={{ color:DS.textSub, fontSize:DS.fs.xs }}>{t.name} ({t.value})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* By Subtype */}
            <div style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:DS.r.lg, padding:"16px 20px" }}>
              <div style={{ color:DS.text, fontSize:DS.fs.md, fontWeight:DS.fw.bold, marginBottom:12 }}>By Subtype</div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={subtypePie} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                    {subtypePie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v,n)=>[v+" comps",n]} contentStyle={{ background:DS.surface, border:`1px solid ${DS.border}`, borderRadius:DS.r.sm, color:DS.text, fontSize:11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
                {subtypePie.slice(0,4).map((t,i) => (
                  <div key={t.name} style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span style={{ color:DS.textSub, fontSize:DS.fs.xs }}>{t.name} ({t.value})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* By Submarket */}
            <div style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:DS.r.lg, padding:"16px 20px" }}>
              <div style={{ color:DS.text, fontSize:DS.fs.md, fontWeight:DS.fw.bold, marginBottom:12 }}>By Submarket</div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={smPie} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                    {smPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[(i+3) % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v,n)=>[v+" comps",n]} contentStyle={{ background:DS.surface, border:`1px solid ${DS.border}`, borderRadius:DS.r.sm, color:DS.text, fontSize:11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
                {smPie.slice(0,4).map((t,i) => (
                  <div key={t.name} style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:PIE_COLORS[(i+3) % PIE_COLORS.length] }} />
                    <span style={{ color:DS.textSub, fontSize:DS.fs.xs }}>{t.name} ({t.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: PSF trend + submarket table */}
          <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:12 }}>
            {/* PSF trend chart */}
            {psfTrend.length > 1 && (
              <div style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:DS.r.lg, padding:"16px 20px" }}>
                <div style={{ color:DS.text, fontSize:DS.fs.md, fontWeight:DS.fw.bold, marginBottom:4 }}>$/SF Trend by Quarter</div>
                <div style={{ color:DS.textMute, fontSize:DS.fs.xs, marginBottom:12 }}>Sale $/SF · Lease $/SF/mo ×1000 for scale</div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={psfTrend} margin={{ top:4, right:16, left:0, bottom:4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={DS.border} />
                    <XAxis dataKey="q" tick={{ fill:DS.textMute, fontSize:9 }} />
                    <YAxis tick={{ fill:DS.textMute, fontSize:9 }} width={40} />
                    <Tooltip contentStyle={{ background:DS.surface, border:`1px solid ${DS.border}`, borderRadius:DS.r.sm, color:DS.text, fontSize:11 }} />
                    <Legend wrapperStyle={{ fontSize:11, color:DS.textSub }} />
                    <Line type="monotone" dataKey="Sale $/SF" stroke={DS.blue} strokeWidth={2} dot={{ fill:DS.blue, r:3 }} connectNulls />
                    <Line type="monotone" dataKey="Lease (×1000)" stroke={DS.green} strokeWidth={2} dot={{ fill:DS.green, r:3 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Submarket pricing table */}
            {smStats.length > 0 && (
              <div style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:DS.r.lg, padding:"16px 20px" }}>
                <div style={{ color:DS.text, fontSize:DS.fs.md, fontWeight:DS.fw.bold, marginBottom:12 }}>Submarket Pricing</div>
                <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 60px 60px 60px", gap:8, padding:"0 0 6px", borderBottom:`1px solid ${DS.border}` }}>
                    {["Submarket","Comps","Sale/SF","Lease"].map(h=><div key={h} style={{ color:DS.textMute, fontSize:9, fontWeight:DS.fw.bold, textTransform:"uppercase", letterSpacing:"0.5px" }}>{h}</div>)}
                  </div>
                  {smStats.map((r,i) => (
                    <div key={r.sm} style={{ display:"grid", gridTemplateColumns:"1fr 60px 60px 60px", gap:8, padding:"7px 0", borderBottom: i < smStats.length-1 ? `1px solid ${DS.border}` : "none", alignItems:"center" }}>
                      <div style={{ color:DS.text, fontSize:DS.fs.sm, fontWeight:DS.fw.semi, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.sm}</div>
                      <div style={{ color:DS.textSub, fontSize:DS.fs.sm, fontFamily:"'DM Mono', monospace" }}>{r.count}</div>
                      <div style={{ color:r.avgSale ? DS.green : DS.textFaint, fontSize:DS.fs.sm, fontFamily:"'DM Mono', monospace" }}>{r.avgSale ? "$"+r.avgSale : "—"}</div>
                      <div style={{ color:r.avgLease ? DS.blue : DS.textFaint, fontSize:DS.fs.sm, fontFamily:"'DM Mono', monospace" }}>{r.avgLease ? "$"+parseFloat(r.avgLease).toFixed(3) : "—"}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map View */}
      {showMap && (
        <div style={{ background: "#0d1826", border:`1px solid ${DS.border}`, borderRadius: DS.r.lg, padding: "16px 20px" }}>
          <div style={{ color: DS.text, fontWeight: DS.fw.bold, fontSize: DS.fs.md, marginBottom: 8 }}>
            Comp Locations Map <span style={{ color: DS.textFaint, fontSize: DS.fs.xs, fontWeight: DS.fw.normal }}>— addresses auto-located via OpenStreetMap</span>
          </div>
          <CompsLeafletMap comps={filtered} />
        </div>
      )}

      {/* Filters */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search property, buyer, seller, broker..." style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:8, color:"#f1f5f9", padding:"7px 11px", fontSize:12, outline:"none", flex:1, minWidth:200 }}/>
        <select value={filterSm} onChange={e=>setFilterSm(e.target.value)} style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:8, color:"#94a3b8", padding:"7px 11px", fontSize:12, outline:"none" }}>
          <option value="All">All Submarkets</option>
          {submarketList.map(s=><option key={s}>{s}</option>)}
        </select>
        <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:8, color:"#94a3b8", padding:"7px 11px", fontSize:12, outline:"none" }}>
          <option value="All">Sales + Leases</option>
          <option value="Sale">Sales Only</option>
          <option value="Lease">Leases Only</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background:DS.panel, borderRadius:DS.r.lg, border:`1px solid ${DS.border}`, overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", minWidth:900 }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${DS.border}`, background:"rgba(7,14,26,0.6)" }}>
              {["Property","Submarket","Type","Sq Ft","Price / Rent","$/SF","Close Date","Seller/LL","Buyer/Tenant","Listing Broker","Tenant Broker","Src",""].map(h=>(
                <th key={h} style={{ color:DS.textMute, fontSize:10, fontWeight:DS.fw.bold, textAlign:"left", padding:"10px 12px", whiteSpace:"nowrap", letterSpacing:"0.6px", textTransform:"uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c=>{
              const hasNotes = c.notes && c.notes.trim().length > 0;
              const isExpanded = expandedComp === c.id;
              return (
                <React.Fragment key={c.id}>
                  <tr
                    style={{ borderBottom: isExpanded ? "none" : `1px solid ${DS.border}`, cursor:"pointer", transition:"background 0.1s" }}
                    onClick={()=>setExpandedComp(isExpanded ? null : c.id)}
                    onMouseEnter={e=>e.currentTarget.style.background=DS.panelHi}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{ padding:"11px 12px", color:DS.text, fontWeight:DS.fw.semi, fontSize:DS.fs.md, maxWidth:180 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <div>
                          <div>{c.name||"—"}</div>
                          {c.address && <div style={{ color:DS.textMute, fontSize:10, marginTop:1 }}>{c.address}</div>}
                          {c.verified && <span style={{ background:DS.greenSoft, color:DS.green, border:`1px solid ${DS.green}33`, padding:"1px 7px", borderRadius:DS.r.full, fontSize:9, fontWeight:DS.fw.bold, display:"inline-block", marginTop:3 }}>verified</span>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:"11px 12px", color:DS.textSub, fontSize:DS.fs.sm }}>{c.submarket||"—"}</td>
                    <td style={{ padding:"11px 12px" }}>
                      <span style={{ background: c.compType==="Sale" ? DS.blueSoft : DS.greenSoft, color: c.compType==="Sale" ? DS.blue : DS.green, padding:"2px 9px", borderRadius:DS.r.full, fontSize:10, fontWeight:DS.fw.bold }}>{c.compType}</span>
                      {c.subtype && <div style={{ color:DS.textFaint, fontSize:9, marginTop:3 }}>{c.subtype}</div>}
                    </td>
                    <td style={{ padding:"11px 12px", color:DS.text, fontSize:DS.fs.md, fontFamily:"'DM Mono', monospace" }}>{c.sqft ? c.sqft.toLocaleString() : "—"}</td>
                    <td style={{ padding:"11px 12px", color:DS.accent, fontWeight:DS.fw.bold, fontSize:DS.fs.md, fontFamily:"'DM Mono', monospace" }}>
                      {c.compType==="Sale" ? (c.salePrice > 0 ? fmt(c.salePrice) : "—") : (c.monthlyRent > 0 ? fmt(c.monthlyRent)+"/mo" : "—")}
                      {c.compType==="Lease" && c.leaseTerm > 0 && <div style={{ color:DS.textMute, fontSize:9, fontFamily:"sans-serif" }}>{c.leaseTerm}mo term</div>}
                    </td>
                    <td style={{ padding:"11px 12px", color:DS.green, fontWeight:DS.fw.bold, fontSize:DS.fs.md, fontFamily:"'DM Mono', monospace" }}>
                      {c.compType==="Sale" ? (c.psfSale > 0 ? "$"+parseFloat(c.psfSale).toFixed(2)+"/SF" : "—") : (c.psfLease > 0 ? "$"+parseFloat(c.psfLease).toFixed(3)+"/SF/mo" : "—")}
                    </td>
                    <td style={{ padding:"11px 12px", color:DS.textSub, fontSize:DS.fs.sm }}>{c.closeDate ? new Date(c.closeDate+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—"}</td>
                    <td style={{ padding:"11px 12px", color:DS.textSub, fontSize:DS.fs.sm, maxWidth:120 }}><div style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.seller||"—"}</div></td>
                    <td style={{ padding:"11px 12px", color:DS.textSub, fontSize:DS.fs.sm, maxWidth:120 }}><div style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.buyer||"—"}</div></td>
                    <td style={{ padding:"11px 12px", color:DS.blue, fontSize:DS.fs.sm, maxWidth:130 }}><div style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.listingBroker||"—"}</div></td>
                    <td style={{ padding:"11px 12px", color:DS.purple, fontSize:DS.fs.sm, maxWidth:130 }}><div style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.tenantBroker||"—"}</div></td>
                    <td style={{ padding:"11px 12px", color:DS.textFaint, fontSize:10 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                        {c.source||"—"}
                        {hasNotes && <span style={{ width:6, height:6, borderRadius:"50%", background:DS.accent, display:"inline-block", flexShrink:0 }} title="Has notes" />}
                      </div>
                    </td>
                    <td style={{ padding:"11px 12px" }}>
                      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                        <button onClick={e=>{e.stopPropagation();setModal(c);}} style={{ background:DS.panelHi, border:`1px solid ${DS.border}`, color:DS.textSub, cursor:"pointer", fontSize:DS.fs.xs, padding:"3px 9px", borderRadius:DS.r.sm, fontWeight:DS.fw.semi }}>Edit</button>
                        <button onClick={e=>{e.stopPropagation(); setComps(prev=>prev.filter(x=>x.id!==c.id));}} style={{ background:"none", border:`1px solid ${DS.red}33`, color:DS.red, cursor:"pointer", fontSize:DS.fs.xs, padding:"3px 9px", borderRadius:DS.r.sm }}>Del</button>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr style={{ borderBottom:`1px solid ${DS.border}` }}>
                      <td colSpan={13} style={{ padding:"0 12px 14px 12px", background:DS.panelHi }}>
                        <div style={{ display:"flex", gap:24, flexWrap:"wrap", paddingTop:12 }}>
                          {hasNotes && (
                            <div style={{ flex:2, minWidth:280 }}>
                              <div style={{ color:DS.textMute, fontSize:10, fontWeight:DS.fw.bold, textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:6 }}>Notes</div>
                              <div style={{ color:DS.text, fontSize:DS.fs.md, lineHeight:1.7, background:DS.bg, borderRadius:DS.r.sm, padding:"10px 14px", border:`1px solid ${DS.border}`, whiteSpace:"pre-wrap" }}>{c.notes}</div>
                            </div>
                          )}
                          <div style={{ flex:1, minWidth:200 }}>
                            <div style={{ color:DS.textMute, fontSize:10, fontWeight:DS.fw.bold, textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:6 }}>Deal Summary</div>
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px 16px", fontSize:DS.fs.sm }}>
                              {c.seller && <div><span style={{ color:DS.textMute }}>Seller/LL: </span><span style={{ color:DS.text }}>{c.seller}</span></div>}
                              {c.buyer && <div><span style={{ color:DS.textMute }}>Buyer/Tenant: </span><span style={{ color:DS.text }}>{c.buyer}</span></div>}
                              {c.listingBroker && <div><span style={{ color:DS.textMute }}>Listing: </span><span style={{ color:DS.blue }}>{c.listingBroker}</span></div>}
                              {c.tenantBroker && <div><span style={{ color:DS.textMute }}>Tenant: </span><span style={{ color:DS.purple }}>{c.tenantBroker}</span></div>}
                              {c.sqft && <div><span style={{ color:DS.textMute }}>Size: </span><span style={{ color:DS.text, fontFamily:"'DM Mono', monospace" }}>{parseInt(c.sqft).toLocaleString()} SF</span></div>}
                              {c.closeDate && <div><span style={{ color:DS.textMute }}>Closed: </span><span style={{ color:DS.text }}>{new Date(c.closeDate+"T00:00:00").toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</span></div>}
                            </div>
                          </div>
                          {!hasNotes && (
                            <div style={{ flex:2, minWidth:200, display:"flex", alignItems:"center" }}>
                              <button onClick={e=>{e.stopPropagation();setModal(c);}} style={{ background:"none", border:`1px dashed ${DS.border}`, color:DS.textMute, padding:"8px 16px", borderRadius:DS.r.sm, cursor:"pointer", fontSize:DS.fs.sm }}>+ Add notes to this comp</button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
          {filtered.length > 0 && <tfoot>
            <tr style={{ borderTop:`1px solid ${DS.border}`, background:"rgba(7,14,26,0.4)" }}>
              <td colSpan={3} style={{ padding:"10px 12px", color:DS.textMute, fontSize:DS.fs.xs, fontWeight:DS.fw.bold, textTransform:"uppercase", letterSpacing:"0.5px" }}>{filtered.length} comp{filtered.length!==1?"s":""}</td>
              <td style={{ padding:"10px 12px", color:DS.text, fontWeight:DS.fw.black, fontSize:DS.fs.sm, fontFamily:"'DM Mono', monospace" }}>{totalSF.toLocaleString()} SF</td>
              <td colSpan={9}/>
            </tr>
          </tfoot>}
        </table>
        {filtered.length === 0 && <div style={{ color:DS.textMute, fontSize:DS.fs.lg, textAlign:"center", padding:"48px 0" }}>No comps yet. Add market transactions from CoStar, LoopNet, or broker intel.</div>}
      </div>
      {modal && <CompModal comp={modal==="new"?null:modal}/>}
    </div>
  );
}

// ── Submarket Tab ─────────────────────────────────────────────
function SubmarketTab({ deals, listings, comps, submarketList, setSubmarketList }) {
  const enriched = useMemo(() => deals.map(calcDeal), [deals]);
  const [newSm, setNewSm] = useState("");
  const [newSmLat, setNewSmLat] = useState("");
  const [newSmLng, setNewSmLng] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [showSmMap, setShowSmMap] = useState(false);

  const rows = submarketList.map(sm => {
    const smNameVal = typeof sm === "string" ? sm : sm.name;
    const smLatVal = typeof sm === "string" ? null : sm.lat;
    const smLngVal = typeof sm === "string" ? null : sm.lng;
    const smDeals = enriched.filter(d => d.submarket === smNameVal);
    const smListings = listings.filter(l => l.submarket === sm);
    const smComps = comps.filter(c => c.submarket === sm);
    const closed = smDeals.filter(d => d.stage === "Closed");
    const active = smDeals.filter(d => d.stage !== "Closed" && d.stage !== "Lost");
    const closedSales = closed.filter(d => d.dealType === "Sale" && d.sqft > 0 && d.totalValue > 0);
    const avgPsfSale = closedSales.length > 0 ? closedSales.reduce((s,d) => s + d.pricePerSqft, 0) / closedSales.length : null;
    const closedLeases = closed.filter(d => d.dealType === "Lease" && d.sqft > 0 && d.monthlyRent > 0);
    const avgPsfLease = closedLeases.length > 0 ? closedLeases.reduce((s,d) => s + ((parseFloat(d.monthlyRent)||0) / d.sqft), 0) / closedLeases.length : null;
    const totalSqft = [...active, ...closed].reduce((s,d) => s + (d.sqft||0), 0);
    const commissions = closed.reduce((s,d) => s + d.netCommission, 0);
    const activeSF = smListings.filter(l => l.status === "Active").reduce((s,l) => s+(l.sqft||0), 0);
    // Market comp averages
    const compSales = smComps.filter(c=>c.compType==="Sale"&&c.psfSale>0);
    const compLeases = smComps.filter(c=>c.compType==="Lease"&&c.psfLease>0);
    const mktAvgSale = compSales.length > 0 ? compSales.reduce((s,c)=>s+c.psfSale,0)/compSales.length : null;
    const mktAvgLease = compLeases.length > 0 ? compLeases.reduce((s,c)=>s+c.psfLease,0)/compLeases.length : null;
    return { sm: smNameVal, lat: smLatVal, lng: smLngVal, smDeals, closed, active, closedSales, avgPsfSale, closedLeases, avgPsfLease, totalSqft, commissions, activeSF, smListings, smComps, mktAvgSale, mktAvgLease };
  });

  const addSubmarket = () => {
    const name = newSm.trim();
    if (!name || submarketList.some(s => (typeof s === "string" ? s : s.name) === name)) return;
    const entry = { name, lat: newSmLat ? parseFloat(newSmLat) : null, lng: newSmLng ? parseFloat(newSmLng) : null };
    setSubmarketList(prev => [...prev, entry]);
    setNewSm(""); setNewSmLat(""); setNewSmLng("");
  };
  // Helper: normalize submarket entry (support old string format)
  const smName = (s) => typeof s === "string" ? s : s.name;
  const smLat = (s) => typeof s === "string" ? null : s.lat;
  const smLng = (s) => typeof s === "string" ? null : s.lng;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 16 }}>Submarket Intelligence</div>
          <div style={{ color: "#475569", fontSize: 11 }}>Your deal history, listings, and market comp data by geography</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={()=>setShowSmMap(m=>!m)} style={{ background: showSmMap ? DS.greenSoft : DS.panel, border:`1px solid ${showSmMap ? DS.green+"55" : DS.border}`, color: showSmMap ? DS.green : "#64748b", padding:"6px 13px", borderRadius:7, cursor:"pointer", fontSize:11, fontWeight: showSmMap?700:400 }}>
            {showSmMap ? "Hide Map" : "🗺 Map View"}
          </button>
          <button onClick={()=>setEditMode(e=>!e)} style={{ background: editMode?"#1e3048":DS.panel, border:`1px solid ${DS.border}`, color: editMode?"#f59e0b":"#64748b", padding:"6px 13px", borderRadius:7, cursor:"pointer", fontSize:11, fontWeight: editMode?700:400 }}>Edit Submarkets</button>
        </div>
      </div>

      {/* Submarket editor */}
      {editMode && (
        <div style={{ background:DS.panel, border:"1px solid #f59e0b", borderRadius:12, padding:"14px 18px" }}>
          <div style={{ color:"#f59e0b", fontWeight:700, fontSize:12, marginBottom:10 }}>Manage Your Submarkets</div>
          <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
            <input value={newSm} onChange={e=>setNewSm(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addSubmarket()} placeholder="Submarket name..." style={{ flex:2, minWidth:120, background:"#0f1e2e", border:`1px solid ${DS.border}`, borderRadius:8, color:"#f1f5f9", padding:"8px 11px", fontSize:13, outline:"none" }}/>
            <input type="number" step="any" value={newSmLat} onChange={e=>setNewSmLat(e.target.value)} placeholder="Latitude (optional)" style={{ flex:1, minWidth:100, background:"#0f1e2e", border:`1px solid ${DS.border}`, borderRadius:8, color:"#94a3b8", padding:"8px 11px", fontSize:12, outline:"none" }}/>
            <input type="number" step="any" value={newSmLng} onChange={e=>setNewSmLng(e.target.value)} placeholder="Longitude (optional)" style={{ flex:1, minWidth:100, background:"#0f1e2e", border:`1px solid ${DS.border}`, borderRadius:8, color:"#94a3b8", padding:"8px 11px", fontSize:12, outline:"none" }}/>
            <button onClick={addSubmarket} style={{ background:"#f59e0b", border:"none", color:"#0d1826", padding:"8px 16px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:800 }}>+ Add</button>
          </div>
          <div style={{ color:"#475569", fontSize:10, marginBottom:8 }}>💡 Tip: Right-click a location in Google Maps → copy coordinates → paste lat/lng above to place submarket on the map.</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {submarketList.map((sm, idx) => {
              const nm = typeof sm === "string" ? sm : sm.name;
              const hasCoords = typeof sm !== "string" && sm.lat && sm.lng;
              return (
                <div key={nm} style={{ display:"flex", alignItems:"center", gap:4, background:"#0f1e2e", border:`1px solid ${hasCoords ? DS.green+"44" : DS.border}`, borderRadius:20, padding:"4px 10px" }}>
                  {hasCoords && <span style={{ fontSize:9, color:DS.green }}>📍</span>}
                  <span style={{ color:"#f1f5f9", fontSize:12 }}>{nm}</span>
                  <button onClick={(e)=>{ e.stopPropagation(); setSubmarketList(prev=>prev.filter((_,i)=>i!==idx)); }} style={{ background:"none", border:"none", color:"#f87171", cursor:"pointer", fontSize:13, padding:"0 2px", lineHeight:1, fontWeight:700 }} title="Remove submarket">×</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submarket Map */}
      {showSmMap && (
        <div style={{ background:"#0d1826", border:`1px solid ${DS.border}`, borderRadius:12, padding:"16px 20px" }}>
          <div style={{ color:DS.text, fontWeight:DS.fw.bold, fontSize:DS.fs.md, marginBottom:8 }}>
            Submarket Map <span style={{ color:DS.textFaint, fontSize:DS.fs.xs, fontWeight:DS.fw.normal }}>— submarket names auto-located via OpenStreetMap</span>
          </div>
          <SubmarketLeafletMap rows={rows} submarketList={submarketList} />
        </div>
      )}

      {rows.length === 0 && <div style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: "40px 0" }}>No submarket data yet. Assign submarkets to your deals and listings.</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.sort((a,b) => (b.smDeals.length + b.smComps.length) - (a.smDeals.length + a.smComps.length)).map(r => (
          <div key={r.sm} style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 15, display:"flex", alignItems:"center", gap:6 }}>{r.sm}{r.lat&&r.lng&&<span style={{ fontSize:10, color:DS.green, fontWeight:400 }}>📍 mapped</span>}</div>
                <div style={{ color: "#475569", fontSize: 11 }}>{r.smDeals.length} deal{r.smDeals.length!==1?"s":""} · {r.smListings.length} listing{r.smListings.length!==1?"s":""} · {r.smComps.length} comp{r.smComps.length!==1?"s":""}</div>
              </div>
              {r.commissions > 0 && <div style={{ textAlign: "right" }}>
                <div style={{ color: "#f59e0b", fontWeight: 800, fontSize: 16 }}>{fmt(r.commissions)}</div>
                <div style={{ color: "#475569", fontSize: 10 }}>earned commissions</div>
              </div>}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { label: "Active Deals", value: r.active.length, color: "#3b82f6" },
                { label: "Closed Deals", value: r.closed.length, color: "#10b981" },
                { label: "Active Listings", value: r.smListings.filter(l=>l.status==="Active").length, color: "#8b5cf6" },
                { label: "Market Comps", value: r.smComps.length, color: "#34d399" },
                ...(r.totalSqft > 0 ? [{ label: "SF Tracked", value: r.totalSqft.toLocaleString(), color: "#f59e0b" }] : []),
                ...(r.avgPsfSale ? [{ label: "My Avg $/SF (Sale)", value: "$"+r.avgPsfSale.toFixed(2), color: "#60a5fa" }] : []),
                ...(r.mktAvgSale ? [{ label: "Mkt Avg $/SF (Sale)", value: "$"+r.mktAvgSale.toFixed(2), color: "#34d399" }] : []),
                ...(r.mktAvgLease ? [{ label: "Mkt Avg $/SF/mo", value: "$"+r.mktAvgLease.toFixed(3), color: "#a78bfa" }] : []),
                ...(r.activeSF > 0 ? [{ label: "Available SF", value: r.activeSF.toLocaleString()+" SF", color: "#f97316" }] : []),
              ].map(s => (
                <div key={s.label} style={{ background: "#070e1a", border: `1px solid ${DS.border}`, borderRadius: 8, padding: "10px 14px", minWidth: 110 }}>
                  <div style={{ color: s.color, fontWeight: 800, fontSize: 15 }}>{s.value}</div>
                  <div style={{ color: "#475569", fontSize: 10, fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {r.smComps.length > 0 && (
              <div style={{ marginTop:12 }}>
                <div style={{ color:"#334155", fontSize:10, fontWeight:700, marginBottom:6 }}>RECENT COMPS</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {r.smComps.slice(0,4).map(c=>(
                    <div key={c.id} style={{ background:"#0f1e2e", border:`1px solid ${DS.border}`, borderRadius:7, padding:"6px 10px" }}>
                      <div style={{ color:"#94a3b8", fontSize:11, fontWeight:600 }}>{c.name||c.address||"—"}</div>
                      <div style={{ color:"#475569", fontSize:9 }}>
                        {c.compType} · {c.sqft?c.sqft.toLocaleString()+" SF":""} · {c.compType==="Sale"&&c.psfSale>0?"$"+parseFloat(c.psfSale).toFixed(2)+"/SF":c.compType==="Lease"&&c.psfLease>0?"$"+parseFloat(c.psfLease).toFixed(3)+"/SF/mo":""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {r.smDeals.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ color: "#334155", fontSize: 10, fontWeight: 700, marginBottom: 6 }}>YOUR DEALS</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {r.smDeals.slice(0,5).map(d => (
                    <div key={d.id} style={{ background: "#070e1a", border: `1px solid ${DS.border}`, borderRadius: 7, padding: "5px 10px" }}>
                      <div style={{ color: "#94a3b8", fontSize: 11 }}>{d.name}</div>
                      <div style={{ color: "#475569", fontSize: 9 }}>{d.stage} · {d.dealType} · {d.sqft ? d.sqft.toLocaleString() + " SF" : "—"}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN APP ────────────────────────────────────────────────
// ── Contacts Tab ──────────────────────────────────────────────
// ── Closed Deal Follow-Up Modal ───────────────────────────────
function ClosedFollowUpModal({ deal, contacts, onAddTask, onUpdateContact, onClose }) {
  const matchedContact = contacts.find(c =>
    c.name?.toLowerCase() === deal.client?.toLowerCase() ||
    c.company?.toLowerCase() === deal.client?.toLowerCase()
  );
  const isSale = deal.dealType === "Sale";
  const isLease = deal.dealType === "Lease";
  const leaseTerm = parseInt(deal.leaseTerm) || 0;

  // Auto-suggest future follow-up date
  const suggestDate = (() => {
    const d = new Date();
    if (isLease && leaseTerm > 0) {
      // Suggest follow-up at 80% of lease term
      const renewalWindowMonths = Math.max(6, Math.round(leaseTerm * 0.8));
      d.setMonth(d.getMonth() + renewalWindowMonths);
    } else if (isSale) {
      d.setFullYear(d.getFullYear() + 3); // buyers/sellers often transact again in ~3 years
    } else {
      d.setFullYear(d.getFullYear() + 1);
    }
    return d.toISOString().split("T")[0];
  })();

  const [followUpDate, setFollowUpDate] = useState(suggestDate);
  const [followUpNote, setFollowUpNote] = useState(
    isLease && leaseTerm > 0
      ? `Lease renewal outreach — ${deal.client} at ${deal.name}`
      : `Post-close follow-up — ${deal.client}`
  );
  const [createTask, setCreateTask] = useState(true);
  const [upgradeContact, setUpgradeContact] = useState(!!matchedContact && matchedContact.relationshipLevel !== "Key Relationship");
  const [newRelLevel, setNewRelLevel] = useState("Active");

  const handleSave = () => {
    if (createTask && followUpDate) {
      onAddTask({
        id: Date.now(), title: followUpNote, category: "Prospecting", priority: "Medium",
        dueDate: followUpDate, done: false, notes: `Auto-created from deal close: ${deal.name}`, linkedDealId: deal.id,
        recurrence: "None"
      });
    }
    if (upgradeContact && matchedContact) {
      onUpdateContact({ ...matchedContact, relationshipLevel: newRelLevel, lastContact: today });
    }
    toast("Follow-up scheduled");
    onClose();
  };

  const iStyle = { background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: DS.r.sm, color: DS.text, padding: "8px 11px", fontSize: DS.fs.md, outline: "none", width: "100%", boxSizing: "border-box" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(3,8,18,0.92)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1300 }}>
      <div style={{ background: DS.panel, border: `1px solid ${DS.green}44`, borderRadius: DS.r.xl, width: 520, boxShadow: `${DS.shadow.xl}, 0 0 40px ${DS.green}15` }}>

        {/* Header — celebration */}
        <div style={{ background: `linear-gradient(135deg, ${DS.green}18, ${DS.green}08)`, borderBottom: `1px solid ${DS.green}33`, padding: "22px 28px 18px", borderRadius: `${DS.r.xl}px ${DS.r.xl}px 0 0` }}>
          <div style={{ color: DS.green, fontSize: DS.fs.h1, fontWeight: DS.fw.black, letterSpacing: "-0.5px" }}>Deal Closed!</div>
          <div style={{ color: DS.text, fontSize: DS.fs.lg, fontWeight: DS.fw.semi, marginTop: 4 }}>{deal.name}</div>
          <div style={{ display: "flex", gap: 14, marginTop: 10, flexWrap: "wrap" }}>
            <div><span style={{ color: DS.textMute, fontSize: DS.fs.xs }}>Client: </span><span style={{ color: DS.text, fontWeight: DS.fw.bold }}>{deal.client || "—"}</span></div>
            <div><span style={{ color: DS.textMute, fontSize: DS.fs.xs }}>Net Commission: </span><span style={{ color: DS.green, fontWeight: DS.fw.black, fontFamily: "'DM Mono', monospace" }}>{fmt(calcDeal(deal).netCommission)}</span></div>
            {isLease && leaseTerm > 0 && <div><span style={{ color: DS.textMute, fontSize: DS.fs.xs }}>Lease Term: </span><span style={{ color: DS.accent, fontWeight: DS.fw.bold }}>{leaseTerm}mo</span></div>}
          </div>
        </div>

        <div style={{ padding: "20px 28px", display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Future follow-up task */}
          <div style={{ background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: DS.r.md, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <input type="checkbox" id="createTask" checked={createTask} onChange={e => setCreateTask(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: DS.green, cursor: "pointer" }} />
              <label htmlFor="createTask" style={{ color: DS.text, fontSize: DS.fs.md, fontWeight: DS.fw.bold, cursor: "pointer" }}>
                Schedule future follow-up task
              </label>
            </div>
            {createTask && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div>
                  <div style={{ color: DS.textMute, fontSize: DS.fs.xs, marginBottom: 4 }}>Follow-up note</div>
                  <input value={followUpNote} onChange={e => setFollowUpNote(e.target.value)} style={iStyle} />
                </div>
                <div>
                  <div style={{ color: DS.textMute, fontSize: DS.fs.xs, marginBottom: 4 }}>
                    Date {isLease && leaseTerm > 0 ? `(suggested: ${Math.round(leaseTerm * 0.8)}mo out — renewal window)` : isSale ? "(suggested: 3 years — client may transact again)" : ""}
                  </div>
                  <input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} style={iStyle} />
                </div>
              </div>
            )}
          </div>

          {/* Contact upgrade */}
          {matchedContact && (
            <div style={{ background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: DS.r.md, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: upgradeContact ? 12 : 0 }}>
                <input type="checkbox" id="upgradeContact" checked={upgradeContact} onChange={e => setUpgradeContact(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: DS.accent, cursor: "pointer" }} />
                <label htmlFor="upgradeContact" style={{ color: DS.text, fontSize: DS.fs.md, fontWeight: DS.fw.bold, cursor: "pointer" }}>
                  Update {matchedContact.name}'s relationship level
                </label>
              </div>
              {upgradeContact && (
                <div>
                  <div style={{ color: DS.textMute, fontSize: DS.fs.xs, marginBottom: 6 }}>
                    Currently: <span style={{ color: DS.accent }}>{matchedContact.relationshipLevel}</span> → set to:
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["Warm", "Active", "Key Relationship"].map(lvl => (
                      <button key={lvl} onClick={() => setNewRelLevel(lvl)} style={{ flex: 1, padding: "6px 0", borderRadius: DS.r.sm, border: `1px solid ${newRelLevel === lvl ? DS.accent : DS.border}`, background: newRelLevel === lvl ? DS.accentSoft : DS.surface, color: newRelLevel === lvl ? DS.accent : DS.textMute, fontSize: DS.fs.xs, fontWeight: DS.fw.bold, cursor: "pointer" }}>
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ background: "none", border: `1px solid ${DS.border}`, color: DS.textSub, padding: "9px 18px", borderRadius: DS.r.sm, cursor: "pointer", fontSize: DS.fs.md }}>Skip</button>
            <button onClick={handleSave} style={{ background: DS.green, border: "none", color: "#0a0f1a", padding: "9px 24px", borderRadius: DS.r.sm, cursor: "pointer", fontSize: DS.fs.md, fontWeight: DS.fw.black }}>
              {createTask ? "Schedule & Done" : "Done"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Contact Activity Log Modal ─────────────────────────────────
function ContactActivityModal({ contact, onSave, onClose }) {
  const [log, setLog] = useState(contact.activityLog || []);
  const [type, setType] = useState("Call");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(today);
  const [outcome, setOutcome] = useState("");
  const actTypes = ["Call", "Email", "Meeting", "Text", "Showing", "Proposal Sent", "Other"];
  const outcomeOpts = ["Left voicemail", "Spoke — follow up needed", "Spoke — no action", "Meeting set", "Deal progressed", "Not interested", "No answer"];

  const addEntry = () => {
    if (!note.trim()) return;
    const entry = { id: Date.now(), type, note: note.trim(), date, outcome, addedAt: new Date().toISOString() };
    const newLog = [entry, ...log];
    setLog(newLog);
    onSave({ ...contact, activityLog: newLog, lastContact: date });
    setNote("");
    setOutcome("");
    setDate(today);
  };

  const typeColors = { "Call": DS.blue, "Email": DS.purple, "Meeting": DS.green, "Text": DS.accent, "Showing": "#f97316", "Proposal Sent": "#ec4899", "Other": DS.textMute };
  const iStyle = { background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: DS.r.sm, color: DS.text, padding: "7px 10px", fontSize: DS.fs.md, outline: "none", width: "100%", boxSizing: "border-box" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(3,8,18,0.88)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200 }}>
      <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.xl, width: 560, maxHeight: "88vh", display: "flex", flexDirection: "column", boxShadow: DS.shadow.xl }}>

        {/* Header */}
        <div style={{ padding: "18px 24px 14px", borderBottom: `1px solid ${DS.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
          <div>
            <div style={{ color: DS.text, fontWeight: DS.fw.black, fontSize: DS.fs.h2 }}>Activity Log</div>
            <div style={{ color: DS.textMute, fontSize: DS.fs.sm, marginTop: 2 }}>{contact.name} · {contact.company}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: DS.textMute, fontSize: 20, cursor: "pointer" }}>×</button>
        </div>

        {/* Add new entry */}
        <div style={{ padding: "14px 24px", borderBottom: `1px solid ${DS.border}`, flexShrink: 0, background: DS.panelHi }}>
          <div style={{ color: DS.textMute, fontSize: 10, fontWeight: DS.fw.bold, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 10 }}>Log New Activity</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <div>
              <div style={{ color: DS.textMute, fontSize: DS.fs.xs, marginBottom: 3 }}>Type</div>
              <select value={type} onChange={e => setType(e.target.value)} style={iStyle}>
                {actTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <div style={{ color: DS.textMute, fontSize: DS.fs.xs, marginBottom: 3 }}>Date</div>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={iStyle} />
            </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ color: DS.textMute, fontSize: DS.fs.xs, marginBottom: 3 }}>Notes *</div>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addEntry(); }}
              placeholder="What happened? What was discussed? Any next steps?" rows={2}
              style={{ ...iStyle, resize: "none", lineHeight: 1.5 }} />
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <select value={outcome} onChange={e => setOutcome(e.target.value)} style={{ ...iStyle, color: outcome ? DS.text : DS.textFaint }}>
                <option value="">Outcome (optional)</option>
                {outcomeOpts.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <button onClick={addEntry} style={{ background: DS.blue, border: "none", color: "#fff", padding: "8px 18px", borderRadius: DS.r.sm, cursor: "pointer", fontSize: DS.fs.md, fontWeight: DS.fw.black, flexShrink: 0, whiteSpace: "nowrap" }}>
              Log Activity
            </button>
          </div>
          <div style={{ color: DS.textFaint, fontSize: 9, marginTop: 6 }}>⌘↵ to save</div>
        </div>

        {/* Activity history */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 24px" }}>
          {log.length === 0 ? (
            <div style={{ color: DS.textFaint, fontSize: DS.fs.md, textAlign: "center", padding: "30px 0" }}>No activities logged yet — add your first above.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {log.map((e, i) => (
                <div key={e.id} style={{ display: "flex", gap: 12, padding: "11px 0", borderBottom: i < log.length - 1 ? `1px solid ${DS.border}` : "none" }}>
                  {/* Type dot + line */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, width: 28, flexShrink: 0 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: (typeColors[e.type] || DS.textMute) + "22", border: `1px solid ${(typeColors[e.type] || DS.textMute)}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: typeColors[e.type] || DS.textMute }} />
                    </div>
                    {i < log.length - 1 && <div style={{ width: 1, flex: 1, background: DS.border, minHeight: 8, marginTop: 3 }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ background: (typeColors[e.type] || DS.textMute) + "22", color: typeColors[e.type] || DS.textMute, padding: "1px 8px", borderRadius: DS.r.full, fontSize: DS.fs.xs, fontWeight: DS.fw.bold }}>{e.type}</span>
                      <span style={{ color: DS.textFaint, fontSize: DS.fs.xs }}>{e.date ? new Date(e.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</span>
                      {e.outcome && <span style={{ color: DS.textMute, fontSize: DS.fs.xs, fontStyle: "italic" }}>{e.outcome}</span>}
                    </div>
                    <div style={{ color: DS.text, fontSize: DS.fs.md, lineHeight: 1.6 }}>{e.note}</div>
                    <button onClick={() => { const nl = log.filter(x => x.id !== e.id); setLog(nl); onSave({ ...contact, activityLog: nl }); }}
                      style={{ background: "none", border: "none", color: DS.textFaint, fontSize: DS.fs.xs, cursor: "pointer", marginTop: 2, padding: 0 }}>
                      remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: "12px 24px", borderTop: `1px solid ${DS.border}`, display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
          <button onClick={onClose} style={{ background: DS.accent, border: "none", color: "#0a0f1a", padding: "9px 24px", borderRadius: DS.r.sm, cursor: "pointer", fontSize: DS.fs.md, fontWeight: DS.fw.black }}>Done</button>
        </div>
      </div>
    </div>
  );
}

// ── Pre-Meeting Contact Brief Modal ───────────────────────────
function ContactBriefModal({ contact, deals, onClose }) {
  const linkedDeals = deals.filter(d =>
    d.client?.toLowerCase().includes(contact.name?.toLowerCase()) ||
    d.counterparty?.toLowerCase().includes(contact.name?.toLowerCase()) ||
    (contact.linkedDeals||[]).includes(d.id)
  );
  const daysSince = contact.lastContact
    ? Math.floor((new Date() - new Date(contact.lastContact+"T00:00:00")) / 86400000)
    : null;
  const relColors = { "Cold":"#475569","Warm":DS.accent,"Active":DS.green,"Key Relationship":"#ec4899" };
  const relColor = relColors[contact.relationshipLevel] || DS.textMute;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(3,8,18,0.92)", backdropFilter:"blur(12px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1200 }}>
      <div style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:DS.r.xl, width:560, maxHeight:"90vh", overflowY:"auto", boxShadow:DS.shadow.xl }}>

        {/* Header */}
        <div style={{ background:`linear-gradient(135deg, ${DS.panelHi}, ${DS.panel})`, padding:"24px 28px 20px", borderBottom:`1px solid ${DS.border}`, position:"relative" }}>
          <button onClick={onClose} style={{ position:"absolute", top:16, right:20, background:"none", border:"none", color:DS.textMute, fontSize:20, cursor:"pointer" }}>×</button>
          <div style={{ display:"flex", alignItems:"flex-start", gap:16 }}>
            <div style={{ width:52, height:52, borderRadius:"50%", background:`linear-gradient(135deg, ${relColor}33, ${relColor}11)`, border:`2px solid ${relColor}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:DS.fw.black, color:relColor, flexShrink:0 }}>
              {(contact.name||"?")[0].toUpperCase()}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ color:DS.text, fontSize:DS.fs.h2, fontWeight:DS.fw.black, letterSpacing:"-0.3px" }}>{contact.name}</div>
              <div style={{ color:DS.textSub, fontSize:DS.fs.md, marginTop:2 }}>{contact.company}</div>
              <div style={{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap" }}>
                <span style={{ background:relColor+"22", color:relColor, border:`1px solid ${relColor}44`, padding:"2px 10px", borderRadius:DS.r.full, fontSize:DS.fs.xs, fontWeight:DS.fw.bold }}>{contact.relationshipLevel}</span>
                <span style={{ background:DS.panelHi, color:DS.textSub, padding:"2px 10px", borderRadius:DS.r.full, fontSize:DS.fs.xs }}>{contact.type}</span>
                {contact.submarket && <span style={{ background:DS.panelHi, color:DS.textSub, padding:"2px 10px", borderRadius:DS.r.full, fontSize:DS.fs.xs }}>{contact.submarket}</span>}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding:"20px 28px", display:"flex", flexDirection:"column", gap:20 }}>

          {/* Contact info */}
          <div>
            <div style={{ color:DS.textMute, fontSize:10, fontWeight:DS.fw.bold, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:10 }}>Contact Info</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {contact.phone && (
                <a href={`tel:${contact.phone}`} style={{ display:"flex", alignItems:"center", gap:8, background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:DS.r.sm, padding:"8px 12px", textDecoration:"none" }}>
                  <span style={{ color:DS.blue, fontSize:DS.fs.xs, fontWeight:DS.fw.bold, minWidth:32 }}>CALL</span>
                  <span style={{ color:DS.text, fontSize:DS.fs.sm }}>{contact.phone}</span>
                </a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} style={{ display:"flex", alignItems:"center", gap:8, background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:DS.r.sm, padding:"8px 12px", textDecoration:"none" }}>
                  <span style={{ color:DS.purple, fontSize:DS.fs.xs, fontWeight:DS.fw.bold, minWidth:32 }}>EMAIL</span>
                  <span style={{ color:DS.text, fontSize:DS.fs.sm, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{contact.email}</span>
                </a>
              )}
            </div>
          </div>

          {/* Last contact + relationship intel */}
          <div style={{ background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:DS.r.md, padding:"14px 16px" }}>
            <div style={{ color:DS.textMute, fontSize:10, fontWeight:DS.fw.bold, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:10 }}>Relationship Intel</div>
            <div style={{ display:"flex", gap:20, flexWrap:"wrap", marginBottom: contact.properties ? 12 : 0 }}>
              <div>
                <div style={{ color:DS.textMute, fontSize:DS.fs.xs }}>Last Contact</div>
                <div style={{ color: daysSince !== null && daysSince > 60 ? DS.red : daysSince !== null && daysSince > 30 ? DS.accent : DS.green, fontWeight:DS.fw.bold, fontSize:DS.fs.md, marginTop:2 }}>
                  {daysSince === null ? "Never recorded" : daysSince === 0 ? "Today" : `${daysSince} days ago`}
                </div>
              </div>
              <div>
                <div style={{ color:DS.textMute, fontSize:DS.fs.xs }}>Deals Together</div>
                <div style={{ color:DS.text, fontWeight:DS.fw.bold, fontSize:DS.fs.md, marginTop:2 }}>{linkedDeals.length}</div>
              </div>
              <div>
                <div style={{ color:DS.textMute, fontSize:DS.fs.xs }}>Relationship</div>
                <div style={{ color:relColor, fontWeight:DS.fw.bold, fontSize:DS.fs.md, marginTop:2 }}>{contact.relationshipLevel}</div>
              </div>
            </div>
            {contact.properties && (
              <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${DS.border}` }}>
                <div style={{ color:DS.textMute, fontSize:DS.fs.xs, marginBottom:4 }}>Properties / Holdings</div>
                <div style={{ color:DS.textSub, fontSize:DS.fs.sm, lineHeight:1.6 }}>{contact.properties}</div>
              </div>
            )}
          </div>

          {/* Notes */}
          {contact.notes && (
            <div>
              <div style={{ color:DS.textMute, fontSize:10, fontWeight:DS.fw.bold, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:8 }}>Notes</div>
              <div style={{ background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:DS.r.md, padding:"12px 16px", color:DS.text, fontSize:DS.fs.md, lineHeight:1.7, whiteSpace:"pre-wrap" }}>{contact.notes}</div>
            </div>
          )}

          {/* Active deals */}
          {linkedDeals.length > 0 && (
            <div>
              <div style={{ color:DS.textMute, fontSize:10, fontWeight:DS.fw.bold, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:8 }}>Active Deals</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {linkedDeals.map(d => {
                  const c = calcDeal(d);
                  return (
                    <div key={d.id} style={{ background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:DS.r.md, padding:"10px 14px", display:"flex", alignItems:"center", gap:12 }}>
                      <StageBadge stage={d.stage} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ color:DS.text, fontSize:DS.fs.sm, fontWeight:DS.fw.semi, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.name}</div>
                        <div style={{ color:DS.textMute, fontSize:10, marginTop:1 }}>{d.dealType} · {d.submarket}</div>
                      </div>
                      <div style={{ color:DS.accent, fontWeight:DS.fw.bold, fontSize:DS.fs.sm, fontFamily:"'DM Mono', monospace", flexShrink:0 }}>{fmt(c.netCommission)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Talking points */}
          {/* Activity history in brief */}
          {(contact.activityLog||[]).length > 0 && (
            <div>
              <div style={{ color:DS.textMute, fontSize:10, fontWeight:DS.fw.bold, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:8 }}>Recent Activity</div>
              <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                {(contact.activityLog||[]).slice(0,4).map((e,i,arr) => {
                  const typeColors = { "Call":DS.blue,"Email":DS.purple,"Meeting":DS.green,"Text":DS.accent,"Showing":"#f97316","Proposal Sent":"#ec4899","Other":DS.textMute };
                  return (
                    <div key={e.id} style={{ display:"flex", gap:10, padding:"9px 0", borderBottom: i<arr.length-1 ? `1px solid ${DS.border}` : "none" }}>
                      <span style={{ background:(typeColors[e.type]||DS.textMute)+"22", color:typeColors[e.type]||DS.textMute, padding:"2px 9px", borderRadius:DS.r.full, fontSize:DS.fs.xs, fontWeight:DS.fw.bold, flexShrink:0, alignSelf:"flex-start", marginTop:1 }}>{e.type}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ color:DS.text, fontSize:DS.fs.sm }}>{e.note}</div>
                        {e.outcome && <div style={{ color:DS.textMute, fontSize:DS.fs.xs, marginTop:2, fontStyle:"italic" }}>{e.outcome}</div>}
                      </div>
                      <div style={{ color:DS.textFaint, fontSize:DS.fs.xs, flexShrink:0 }}>{e.date ? new Date(e.date+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : ""}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ background:`linear-gradient(135deg, ${DS.accentSoft}, transparent)`, border:`1px solid ${DS.accent}33`, borderRadius:DS.r.md, padding:"14px 16px" }}>
            <div style={{ color:DS.accent, fontSize:DS.fs.xs, fontWeight:DS.fw.bold, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:10 }}>Pre-Meeting Checklist</div>
            {[
              daysSince !== null && daysSince > 60 ? `Re-establish contact — ${daysSince} days since last touch` : null,
              linkedDeals.length > 0 ? `Update on ${linkedDeals.filter(d=>d.stage!=="Closed"&&d.stage!=="Lost").length} active deal(s)` : null,
              contact.properties ? "Ask about current property plans / capital needs" : null,
              contact.relationshipLevel === "Warm" || contact.relationshipLevel === "Cold" ? "Opportunity to deepen relationship — find a reason to add value" : null,
              "Review their market — any new listings or comps in their submarket?",
            ].filter(Boolean).map((pt, i) => (
              <div key={i} style={{ display:"flex", gap:8, marginBottom:6, alignItems:"flex-start" }}>
                <div style={{ width:16, height:16, borderRadius:"50%", border:`1px solid ${DS.accent}55`, flexShrink:0, marginTop:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:DS.accent }} />
                </div>
                <div style={{ color:DS.textSub, fontSize:DS.fs.sm, lineHeight:1.5 }}>{pt}</div>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <button onClick={onClose} style={{ background:DS.accent, border:"none", color:"#0a0f1a", padding:"9px 24px", borderRadius:DS.r.sm, cursor:"pointer", fontSize:DS.fs.md, fontWeight:DS.fw.black }}>Done</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactsTab({ contacts, setContacts, deals, submarketList }) {
  const smList = submarketList || DEFAULT_SUBMARKETS;
  const [modal, setModal] = useState(null);
  const [briefContact, setBriefContact] = useState(null);
  const [activityContact, setActivityContact] = useState(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [activeView, setActiveView] = useState("all");
  const relColors = { "Cold":"#475569","Warm":"#f59e0b","Active":"#10b981","Key Relationship":"#ec4899" };
  const outreachThresholds = { "Key Relationship":30, "Active":45, "Warm":60, "Cold":90 };

  const daysSince = (d) => d ? Math.floor((new Date() - new Date(d+"T00:00:00")) / 86400000) : null;

  const isDueForOutreach = (c) => {
    const ds = daysSince(c.lastContact);
    if (ds === null) return true;
    return ds >= (outreachThresholds[c.relationshipLevel] || 90);
  };

  const outreachQueue = contacts.filter(isDueForOutreach).sort((a,b) => {
    const order = ["Key Relationship","Active","Warm","Cold"];
    return order.indexOf(a.relationshipLevel) - order.indexOf(b.relationshipLevel);
  });

  const markContacted = (id) => setContacts(prev => prev.map(c => c.id === id ? { ...c, lastContact: today } : c));

  const saveContact = (form) => {
    if (form.id) setContacts(prev => prev.map(c => c.id === form.id ? form : c));
    else setContacts(prev => [...prev, { ...form, id: Date.now(), linkedDeals: [] }]);
    setModal(null);
  };

  const filtered = contacts.filter(c => {
    if (filterType !== "All" && c.type !== filterType) return false;
    if (search && !`${c.name} ${c.company} ${c.submarket} ${c.email} ${c.phone}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function ContactModal({ contact }) {
    const [form, setForm] = useState(contact || { name:"", company:"", type:"Owner", phone:"", email:"", submarket:smList[0]||"Northeast", properties:"", relationshipLevel:"Warm", lastContact:today, notes:"" });
    const set = (k,v) => setForm(f=>({...f,[k]:v}));
    const iStyle = { background:"#0f1e2e", border:`1px solid ${DS.border}`, borderRadius:8, color:"#f1f5f9", padding:"8px 11px", fontSize:13, outline:"none", width:"100%", boxSizing:"border-box" };
    const lbl = (t) => <label style={{ color:"#94a3b8", fontSize:11, fontWeight:600, display:"block", marginBottom:4 }}>{t}</label>;
    return (
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
        <div style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:16, padding:26, width:580, maxHeight:"90vh", overflowY:"auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <h2 style={{ color:"#f1f5f9", fontSize:17, fontWeight:800, margin:0 }}>{contact?.id?"Edit Contact":"New Contact"}</h2>
            <button onClick={()=>setModal(null)} style={{ background:"none", border:"none", color:"#64748b", fontSize:20, cursor:"pointer" }}></button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:11, marginBottom:14 }}>
            <div style={{ gridColumn:"span 2" }}>{lbl("Full Name")}<input value={form.name} onChange={e=>set("name",e.target.value)} style={iStyle}/></div>
            <div>{lbl("Company")}<input value={form.company} onChange={e=>set("company",e.target.value)} style={iStyle}/></div>
            <div>{lbl("Contact Type")}<select value={form.type} onChange={e=>set("type",e.target.value)} style={iStyle}>{CONTACT_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
            <div>{lbl("Phone")}<input value={form.phone} onChange={e=>set("phone",e.target.value)} style={iStyle}/></div>
            <div>{lbl("Email")}<input value={form.email} onChange={e=>set("email",e.target.value)} style={iStyle}/></div>
            <div>{lbl("Submarket")}<select value={form.submarket} onChange={e=>set("submarket",e.target.value)} style={iStyle}>{smList.map(s=><option key={s}>{s}</option>)}</select></div>
            <div>{lbl("Relationship Level")}<select value={form.relationshipLevel} onChange={e=>set("relationshipLevel",e.target.value)} style={iStyle}>{RELATIONSHIP_LEVELS.map(r=><option key={r}>{r}</option>)}</select></div>
            <div>{lbl("Last Contact Date")}<input type="date" value={form.lastContact} onChange={e=>set("lastContact",e.target.value)} style={iStyle}/></div>
            <div style={{ gridColumn:"span 2" }}>{lbl("Properties / Buildings (optional)")}<input value={form.properties} onChange={e=>set("properties",e.target.value)} placeholder="42 Commerce Park, 100 Industrial Way" style={iStyle}/></div>
            <div style={{ gridColumn:"span 2" }}>{lbl("Notes")}<textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={3} style={{...iStyle,resize:"vertical"}} placeholder="Background, relationship history, opportunities..."/></div>
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <button onClick={()=>setModal(null)} style={{ background:"none", border:`1px solid ${DS.border}`, color:"#94a3b8", padding:"8px 16px", borderRadius:8, cursor:"pointer", fontSize:13 }}>Cancel</button>
            <button onClick={()=>saveContact(form)} style={{ background:"#ec4899", border:"none", color:"#fff", padding:"8px 20px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:800 }}>Save Contact</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ color:"#f1f5f9", fontWeight:800, fontSize:16 }}>Contact Database</div>
          <div style={{ color:"#475569", fontSize:11 }}>Owners, tenants, investors, brokers — your relationship intelligence
            {outreachQueue.length > 0 && <span style={{ color:"#ec4899", fontWeight:700, marginLeft:8 }}>· {outreachQueue.length} due for outreach</span>}
          </div>
        </div>
        <button onClick={()=>setModal("new")} style={{ background:"#ec4899", border:"none", color:"#fff", padding:"7px 16px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:800 }}>+ Add Contact</button>
      </div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        <div style={{ display:"flex", background:"#0f1e2e", borderRadius:8, border:`1px solid ${DS.border}`, padding:2 }}>
          <button onClick={()=>setActiveView("all")} style={{ background: activeView==="all"?"#1e3048":"none", border:"none", color: activeView==="all"?"#f1f5f9":"#64748b", padding:"5px 13px", borderRadius:6, cursor:"pointer", fontSize:11, fontWeight: activeView==="all"?700:400 }}>All Contacts ({contacts.length})</button>
          <button onClick={()=>setActiveView("outreach")} style={{ background: activeView==="outreach"?"#4a1a3a":"none", border:"none", color: activeView==="outreach"?"#ec4899":"#64748b", padding:"5px 13px", borderRadius:6, cursor:"pointer", fontSize:11, fontWeight: activeView==="outreach"?700:400 }}>
            Outreach Queue {outreachQueue.length > 0 && <span style={{ background:"#ec4899", color:"#fff", borderRadius:20, padding:"0px 5px", fontSize:9, fontWeight:800 }}>{outreachQueue.length}</span>}
          </button>
        </div>
        {activeView === "all" && <>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, company, email..." style={{ flex:1, minWidth:200, background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:8, color:"#f1f5f9", padding:"7px 11px", fontSize:12, outline:"none" }}/>
          <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:8, color:"#94a3b8", padding:"7px 11px", fontSize:12, outline:"none" }}>
            <option value="All">All Types</option>
            {CONTACT_TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
        </>}
      </div>

      {/* Outreach Queue view */}
      {activeView === "outreach" && (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ background:"#1a0a1a", border:"1px solid #4a1a3a", borderRadius:10, padding:"10px 14px", fontSize:11, color:"#ec4899" }}>
            These contacts are overdue for a touchpoint based on their relationship level. Key Relationships → 30 days · Active → 45 days · Warm → 60 days · Cold → 90 days.
          </div>
          {outreachQueue.length === 0 && <div style={{ color:"#475569", fontSize:13, textAlign:"center", padding:"40px 0" }}> All contacts have been recently touched. You're on top of your relationships.</div>}
          {outreachQueue.map(c => {
            const ds = daysSince(c.lastContact);
            const threshold = outreachThresholds[c.relationshipLevel] || 90;
            const overBy = ds !== null ? ds - threshold : null;
            return (
              <div key={c.id} style={{ background:DS.panel, border:`1px solid ${relColors[c.relationshipLevel]||"#1e3048"}44`, borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                    <span style={{ color:"#f1f5f9", fontWeight:700, fontSize:13 }}>{c.name}</span>
                    <span style={{ background:"#1e3048", color:relColors[c.relationshipLevel]||"#64748b", border:`1px solid ${relColors[c.relationshipLevel]||"#1e3048"}`, padding:"1px 7px", borderRadius:20, fontSize:9, fontWeight:700 }}>{c.relationshipLevel}</span>
                  </div>
                  <div style={{ color:"#64748b", fontSize:11 }}>{c.company} · {c.type} · {c.submarket}</div>
                  {c.notes && <div style={{ color:"#475569", fontSize:10, marginTop:4, fontStyle:"italic" }}>{c.notes.substring(0,80)}{c.notes.length>80?"...":""}</div>}
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ color: overBy > 30 ? "#fca5a5" : "#f59e0b", fontWeight:800, fontSize:14 }}>{ds === null ? "Never" : `${ds}d ago`}</div>
                  <div style={{ color:"#475569", fontSize:9 }}>{overBy !== null && overBy > 0 ? `${overBy}d overdue` : "due now"}</div>
                  <div style={{ display:"flex", gap:5, marginTop:6, justifyContent:"flex-end" }}>
                    {c.phone && <a href={`tel:${c.phone}`} style={{ background:"#1e3048", color:"#60a5fa", padding:"4px 9px", borderRadius:6, fontSize:10, textDecoration:"none" }}>Call</a>}
                    {c.email && <a href={`mailto:${c.email}`} style={{ background:"#1e3048", color:"#60a5fa", padding:"4px 9px", borderRadius:6, fontSize:10, textDecoration:"none" }}>Email</a>}
                    <button onClick={()=>markContacted(c.id)} style={{ background:"#10b981", border:"none", color:"#fff", padding:"4px 9px", borderRadius:6, fontSize:10, cursor:"pointer", fontWeight:700 }}>Mark Contacted</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* All contacts grid */}
      {activeView === "all" && <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:12 }}>
        {filtered.map(c => {
          const ds = daysSince(c.lastContact);
          const stale = ds !== null && ds > 30;
          const linkedD = deals.filter(d => (c.linkedDeals||[]).includes(d.id));
          return (
            <div key={c.id} style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:12, padding:"16px 18px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                <div>
                  <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:14 }}>{c.name}</div>
                  <div style={{ color:"#64748b", fontSize:11, marginTop:2 }}>{c.company}</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                  <span style={{ background:"#1e3048", color:relColors[c.relationshipLevel]||"#64748b", border:`1px solid ${relColors[c.relationshipLevel]||"#1e3048"}`, padding:"2px 8px", borderRadius:20, fontSize:10, fontWeight:700 }}>{c.relationshipLevel}</span>
                  <span style={{ background:"#0f1e2e", color:"#475569", padding:"2px 8px", borderRadius:20, fontSize:9 }}>{c.type}</span>
                </div>
              </div>
              <div style={{ display:"flex", gap:8, marginBottom:10, flexWrap:"wrap" }}>
                {c.phone && <a href={`tel:${c.phone}`} style={{ color:"#60a5fa", fontSize:11, textDecoration:"none" }}>{c.phone}</a>}
                {c.email && <a href={`mailto:${c.email}`} style={{ color:"#60a5fa", fontSize:11, textDecoration:"none" }}> {c.email}</a>}
              </div>
              <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
                {c.submarket && <span style={{ background:"#1e3048", color:"#94a3b8", padding:"2px 8px", borderRadius:20, fontSize:10 }}>{c.submarket}</span>}
                {ds !== null && <span style={{ background: stale?"#2d1515":"#0f1e2e", color: stale?"#fca5a5":"#475569", border:`1px solid ${stale?"#7f1d1d":"#1e3048"}`, padding:"2px 8px", borderRadius:20, fontSize:10 }}>{stale?"️ ":""}{ds === 0 ? "Today" : `${ds}d ago`}</span>}
              </div>
              {c.properties && <div style={{ color:"#475569", fontSize:11, marginBottom:8 }}>{c.properties}</div>}
              {c.notes && <div style={{ color:"#475569", fontSize:11, marginBottom:10, fontStyle:"italic", borderLeft:"2px solid #1e3048", paddingLeft:8 }}>{c.notes}</div>}
              {linkedD.length > 0 && <div style={{ marginBottom:10 }}><div style={{ color:"#334155", fontSize:9, fontWeight:700, marginBottom:4 }}>LINKED DEALS</div>{linkedD.map(d=><span key={d.id} style={{ background:"#1e3048", color:"#94a3b8", padding:"2px 8px", borderRadius:20, fontSize:10, marginRight:4 }}>{d.name}</span>)}</div>}
              {/* Recent activity preview */}
              {(c.activityLog||[]).length > 0 && (() => {
                const recent = (c.activityLog||[]).slice(0, 2);
                const typeColors = { "Call":DS.blue, "Email":DS.purple, "Meeting":DS.green, "Text":DS.accent, "Showing":"#f97316", "Proposal Sent":"#ec4899", "Other":DS.textMute };
                return (
                  <div style={{ marginBottom:10 }}>
                    <div style={{ color:"#334155", fontSize:9, fontWeight:700, marginBottom:5 }}>RECENT ACTIVITY</div>
                    {recent.map(e => (
                      <div key={e.id} style={{ display:"flex", gap:7, alignItems:"flex-start", marginBottom:4 }}>
                        <span style={{ background:(typeColors[e.type]||DS.textMute)+"22", color:typeColors[e.type]||DS.textMute, fontSize:9, padding:"1px 6px", borderRadius:20, fontWeight:700, flexShrink:0, marginTop:1 }}>{e.type}</span>
                        <span style={{ color:"#475569", fontSize:10, flex:1 }}>{e.note.substring(0,60)}{e.note.length>60?"...":""}</span>
                        <span style={{ color:"#334155", fontSize:9, flexShrink:0 }}>{e.date ? new Date(e.date+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"}) : ""}</span>
                      </div>
                    ))}
                    {(c.activityLog||[]).length > 2 && <div style={{ color:"#334155", fontSize:9 }}>+{(c.activityLog||[]).length - 2} more entries — click Log to view all</div>}
                  </div>
                );
              })()}
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={()=>setActivityContact(c)} style={{ background:DS.blueSoft, border:`1px solid ${DS.blue}44`, color:DS.blue, padding:"6px 10px", borderRadius:7, cursor:"pointer", fontSize:11, fontWeight:700 }}>Log</button>
                <button onClick={()=>setBriefContact(c)} style={{ background:DS.accentSoft, border:`1px solid ${DS.accent}44`, color:DS.accent, padding:"6px 10px", borderRadius:7, cursor:"pointer", fontSize:11, fontWeight:700 }}>Brief</button>
                <button onClick={()=>markContacted(c.id)} style={{ background:"#0a2a1a", border:"1px solid #16a34a", color:"#4ade80", padding:"6px 10px", borderRadius:7, cursor:"pointer", fontSize:11, fontWeight:700 }}>Contacted</button>
                <button onClick={()=>setModal(c)} style={{ flex:1, background:"#1e3048", border:"none", color:"#94a3b8", padding:"6px", borderRadius:7, cursor:"pointer", fontSize:11 }}>Edit</button>
                <button onClick={()=>{ if(window.confirm("Delete contact?")) setContacts(prev=>prev.filter(x=>x.id!==c.id)); }} style={{ background:"none", border:`1px solid ${DS.border}`, color:"#475569", padding:"6px 10px", borderRadius:7, cursor:"pointer", fontSize:11 }}></button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div style={{ color:"#475569", fontSize:13, textAlign:"center", padding:"40px 0", gridColumn:"1/-1" }}>No contacts yet. Add owners, tenants, brokers, and investors you work with.</div>}
      </div>}
      {modal && <ContactModal contact={modal==="new"?null:modal}/>}
      {briefContact && <ContactBriefModal contact={briefContact} deals={deals} onClose={()=>setBriefContact(null)} />}
      {activityContact && <ContactActivityModal contact={activityContact} onSave={updated => { setContacts(prev => prev.map(c => c.id === updated.id ? updated : c)); setActivityContact(updated); }} onClose={()=>setActivityContact(null)} />}
    </div>
  );
}

// ── Tasks Tab ─────────────────────────────────────────────────
function TasksTab({ tasks, setTasks, deals }) {
  const [modal, setModal] = useState(null);
  const [showDone, setShowDone] = useState(false);
  const [filterCat, setFilterCat] = useState("All");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const deleteTask = (id) => { setTasks(prev => prev.filter(x => x.id !== id)); setConfirmDeleteId(null); };
  const priorityColors = { "Low":"#475569","Medium":"#f59e0b","High":"#f97316","Urgent":"#dc2626" };
  const categories = ["Admin","Prospecting","Follow-up","Marketing","Legal","Financial","Other"];

  // Compute next due date for a recurring task after completion
  const nextDueDate = (dueDate, recurrence) => {
    if (!dueDate || !recurrence || recurrence === "None") return dueDate;
    const d = new Date(dueDate + "T00:00:00");
    switch (recurrence) {
      case "Daily":      d.setDate(d.getDate() + 1); break;
      case "Weekly":     d.setDate(d.getDate() + 7); break;
      case "Bi-weekly":  d.setDate(d.getDate() + 14); break;
      case "Monthly":    d.setMonth(d.getMonth() + 1); break;
      case "Quarterly":  d.setMonth(d.getMonth() + 3); break;
      case "Annually":   d.setFullYear(d.getFullYear() + 1); break;
      default: break;
    }
    return d.toISOString().split("T")[0];
  };

  const toggleDone = (id) => {
    setTasks(prev => prev.flatMap(t => {
      if (t.id !== id) return [t];
      // If recurring and not yet done — complete it and spawn next occurrence
      if (!t.done && t.recurrence && t.recurrence !== "None" && t.dueDate) {
        const next = { ...t, id: Date.now() + Math.random(), done: false, dueDate: nextDueDate(t.dueDate, t.recurrence) };
        return [{ ...t, done: true }, next];
      }
      return [{ ...t, done: !t.done }];
    }));
  };

  const saveTask = (form) => {
    if (form.id) setTasks(prev => prev.map(t => t.id === form.id ? form : t));
    else setTasks(prev => [...prev, { ...form, id: Date.now(), done: false }]);
    setModal(null);
  };

  const visible = tasks.filter(t => {
    if (!showDone && t.done) return false;
    if (filterCat !== "All" && t.category !== filterCat) return false;
    return true;
  }).sort((a,b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const po = ["Urgent","High","Medium","Low"];
    const pd = po.indexOf(a.priority) - po.indexOf(b.priority);
    if (pd !== 0) return pd;
    return (a.dueDate||"").localeCompare(b.dueDate||"");
  });

  const overdue = tasks.filter(t => !t.done && t.dueDate && t.dueDate < today).length;
  const dueToday = tasks.filter(t => !t.done && t.dueDate === today).length;
  const pending = tasks.filter(t => !t.done).length;
  const recurring = tasks.filter(t => !t.done && t.recurrence && t.recurrence !== "None").length;

  function TaskModal({ task }) {
    const [form, setForm] = useState(task || { title:"", category:"Admin", priority:"Medium", dueDate:today, notes:"", linkedDealId:null, done:false, recurrence:"None" });
    const set = (k,v) => setForm(f=>({...f,[k]:v}));
    const iStyle = { background:"#0f1e2e", border:`1px solid ${DS.border}`, borderRadius:8, color:"#f1f5f9", padding:"8px 11px", fontSize:13, outline:"none", width:"100%", boxSizing:"border-box" };
    const lbl = (t) => <label style={{ color:"#94a3b8", fontSize:11, fontWeight:600, display:"block", marginBottom:4 }}>{t}</label>;
    const isRecurring = form.recurrence && form.recurrence !== "None";
    return (
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
        <div style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:16, padding:26, width:500 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <h2 style={{ color:"#f1f5f9", fontSize:17, fontWeight:800, margin:0 }}>{task?.id?"Edit Task":"New Task"}</h2>
            <button onClick={()=>setModal(null)} style={{ background:"none", border:"none", color:"#64748b", fontSize:20, cursor:"pointer" }}></button>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {lbl("Task")}
            <input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="What needs to happen?" style={iStyle}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:11 }}>
              <div>{lbl("Category")}<select value={form.category} onChange={e=>set("category",e.target.value)} style={iStyle}>{categories.map(c=><option key={c}>{c}</option>)}</select></div>
              <div>{lbl("Priority")}<select value={form.priority} onChange={e=>set("priority",e.target.value)} style={iStyle}>{TASK_PRIORITIES.map(p=><option key={p}>{p}</option>)}</select></div>
              <div>{lbl("Due Date")}<input type="date" value={form.dueDate} onChange={e=>set("dueDate",e.target.value)} style={iStyle}/></div>
              <div>
                {lbl("Repeats")}
                <select value={form.recurrence||"None"} onChange={e=>set("recurrence",e.target.value)} style={{ ...iStyle, borderColor: isRecurring ? "#f59e0b" : "#1e3048", color: isRecurring ? "#f59e0b" : "#f1f5f9" }}>
                  {RECURRENCE_OPTIONS.map(r=><option key={r}>{r}</option>)}
                </select>
              </div>
              <div style={{ gridColumn:"span 2" }}>{lbl("Link to Deal (optional)")}<select value={form.linkedDealId||""} onChange={e=>set("linkedDealId",e.target.value?parseInt(e.target.value):null)} style={iStyle}><option value="">None</option>{deals.filter(d=>d.stage!=="Lost"&&d.stage!=="Closed").map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
            </div>
            {isRecurring && (
              <div style={{ background:"#1a2a0a", border:"1px solid #365314", borderRadius:8, padding:"9px 12px", fontSize:11, color:"#86efac" }}>
                 When you check this off, a new copy will auto-schedule {form.recurrence.toLowerCase()} starting {form.dueDate ? new Date(nextDueDate(form.dueDate, form.recurrence)+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "from the due date"}.
              </div>
            )}
            {lbl("Notes")}
            <textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={2} style={{...iStyle,resize:"vertical"}} placeholder="Details, context..."/>
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:18 }}>
            <button onClick={()=>setModal(null)} style={{ background:"none", border:`1px solid ${DS.border}`, color:"#94a3b8", padding:"8px 16px", borderRadius:8, cursor:"pointer", fontSize:13 }}>Cancel</button>
            <button onClick={()=>saveTask(form)} style={{ background:"#f97316", border:"none", color:"#fff", padding:"8px 20px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:800 }}>Save Task</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ color:"#f1f5f9", fontWeight:800, fontSize:16 }}>Task List</div>
          <div style={{ color:"#475569", fontSize:11 }}>
            {pending} pending
            {overdue > 0 && <span style={{ color:"#fca5a5", fontWeight:700 }}> · {overdue} overdue</span>}
            {dueToday > 0 && <span style={{ color:"#4ade80", fontWeight:700 }}> · {dueToday} due today</span>}
            {recurring > 0 && <span style={{ color:"#f59e0b" }}> ·  {recurring} recurring</span>}
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:7, color:"#94a3b8", padding:"6px 10px", fontSize:11, outline:"none" }}>
            <option value="All">All Categories</option>
            {categories.map(c=><option key={c}>{c}</option>)}
          </select>
          <button onClick={()=>setShowDone(s=>!s)} style={{ background:DS.panel, border:`1px solid ${DS.border}`, color:"#64748b", padding:"6px 12px", borderRadius:7, cursor:"pointer", fontSize:11 }}>{showDone?"Hide Done":"Show Done"}</button>
          <button onClick={()=>setModal("new")} style={{ background:"#f97316", border:"none", color:"#fff", padding:"7px 16px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:800 }}>+ Add Task</button>
        </div>
      </div>

      {/* Quick recurring task templates */}
      {tasks.length === 0 && (
        <div style={{ background:DS.panel, border:"1px dashed #1e3048", borderRadius:10, padding:"14px 16px" }}>
          <div style={{ color:"#475569", fontSize:11, marginBottom:10 }}>Quick-add common recurring tasks:</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {[
              { title:"Review pipeline", recurrence:"Weekly", category:"Admin", priority:"Medium" },
              { title:"CoStar prospecting session", recurrence:"Weekly", category:"Prospecting", priority:"Medium" },
              { title:"Update deal notes", recurrence:"Weekly", category:"Follow-up", priority:"Low" },
              { title:"Monthly client check-ins", recurrence:"Monthly", category:"Follow-up", priority:"High" },
              { title:"Review expenses", recurrence:"Monthly", category:"Admin", priority:"Low" },
            ].map(t=>(
              <button key={t.title} onClick={()=>saveTask({ ...t, id:null, dueDate:today, done:false, notes:"", linkedDealId:null })}
                style={{ background:"#0f1e2e", border:`1px solid ${DS.border}`, color:"#94a3b8", padding:"5px 11px", borderRadius:20, fontSize:11, cursor:"pointer" }}>
                {t.title} — {t.recurrence}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
        {visible.map(t => {
          const isOver = !t.done && t.dueDate && t.dueDate < today;
          const isDue = !t.done && t.dueDate === today;
          const isRecurring = t.recurrence && t.recurrence !== "None";
          const linkedDeal = t.linkedDealId ? deals.find(d=>d.id===t.linkedDealId) : null;
          return (
            <div key={t.id} style={{ background: t.done?"#0d1826":DS.panel, border:`1px solid ${isOver?"#7f1d1d":isDue?"#16a34a":isRecurring?"#78350f":"#1e3048"}`, borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"flex-start", gap:12, opacity: t.done ? 0.5 : 1 }}>
              <button onClick={()=>toggleDone(t.id)} style={{ background:"none", border:`2px solid ${t.done?"#10b981":"#1e3048"}`, borderRadius:"50%", width:20, height:20, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:2, color:"#10b981", fontSize:11 }}>{t.done?"":""}</button>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                  <span style={{ color: t.done?"#475569":"#f1f5f9", fontWeight:600, fontSize:13, textDecoration: t.done?"line-through":"none" }}>{t.title}</span>
                  <span style={{ background:"#1e3048", color: priorityColors[t.priority]||"#64748b", border:`1px solid ${priorityColors[t.priority]||"#1e3048"}`, padding:"1px 7px", borderRadius:20, fontSize:9, fontWeight:700 }}>{t.priority}</span>
                  <span style={{ background:"#0f1e2e", color:"#475569", padding:"1px 7px", borderRadius:20, fontSize:9 }}>{t.category}</span>
                  {isRecurring && <span style={{ background:"#292524", color:"#f59e0b", border:"1px solid #78350f", padding:"1px 7px", borderRadius:20, fontSize:9, fontWeight:700 }}> {t.recurrence}</span>}
                  {linkedDeal && <span style={{ background:"#1e3a5f", color:"#60a5fa", padding:"1px 7px", borderRadius:20, fontSize:9 }}> {linkedDeal.name}</span>}
                </div>
                {t.notes && <div style={{ color:"#475569", fontSize:11, marginTop:4 }}>{t.notes}</div>}
                <div style={{ display:"flex", gap:12, marginTop:4, flexWrap:"wrap" }}>
                  {t.dueDate && <span style={{ color: isOver?"#fca5a5":isDue?"#4ade80":"#475569", fontSize:10, fontWeight: (isOver||isDue)?700:400 }}>{isOver?"Overdue · ":isDue?"Due today · ":""}{new Date(t.dueDate+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span>}
                  {isRecurring && !t.done && t.dueDate && <span style={{ color:"#64748b", fontSize:10 }}>Next after done: {new Date(nextDueDate(t.dueDate,t.recurrence)+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span>}
                </div>
              </div>
              <div style={{ display:"flex", gap:4 }}>
                <button onClick={()=>setModal(t)} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer", fontSize:13 }}></button>
                {confirmDeleteId === t.id ? (
                  <span style={{ display:"flex", gap:4, alignItems:"center" }}>
                    <span style={{ color:"#94a3b8", fontSize:10 }}>Delete?</span>
                    <button onClick={()=>deleteTask(t.id)} style={{ background:"#dc2626", border:"none", color:"#fff", cursor:"pointer", fontSize:10, padding:"2px 7px", borderRadius:4, fontWeight:700 }}>Yes</button>
                    <button onClick={()=>setConfirmDeleteId(null)} style={{ background:"none", border:"1px solid #334155", color:"#64748b", cursor:"pointer", fontSize:10, padding:"2px 7px", borderRadius:4 }}>No</button>
                  </span>
                ) : (
                  <button onClick={()=>setConfirmDeleteId(t.id)} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:13 }}>🗑</button>
                )}
              </div>
            </div>
          );
        })}
        {visible.length === 0 && <div style={{ color:"#475569", fontSize:13, textAlign:"center", padding:"40px 0" }}>No tasks. Add reminders, follow-ups, and recurring to-dos here.</div>}
      </div>
      {modal && <TaskModal task={modal==="new"?null:modal}/>}
    </div>
  );
}

// ── Expense Tracker Tab ───────────────────────────────────────
function ExpenseTab({ expenses, setExpenses, closedYTD, gciGoal }) {
  const [modal, setModal] = useState(null);
  const [filterYear, setFilterYear] = useState(String(thisYear));

  const saveExpense = (form) => {
    const d = { ...form, amount: parseFloat(form.amount)||0 };
    if (form.id) setExpenses(prev => prev.map(e => e.id === form.id ? d : e));
    else setExpenses(prev => [...prev, { ...d, id: Date.now() }]);
    setModal(null);
  };

  const yearExpenses = expenses.filter(e => e.date?.startsWith(filterYear));
  const totalExpenses = yearExpenses.reduce((s,e)=>s+(e.amount||0),0);
  const netIncome = closedYTD - totalExpenses;
  const byCategory = EXPENSE_CATEGORIES.map(cat => ({
    cat, total: yearExpenses.filter(e=>e.category===cat).reduce((s,e)=>s+e.amount,0), count: yearExpenses.filter(e=>e.category===cat).length
  })).filter(c=>c.total>0).sort((a,b)=>b.total-a.total);

  const years = [...new Set(expenses.map(e=>e.date?.substring(0,4)).filter(Boolean))].sort().reverse();
  if (!years.includes(String(thisYear))) years.unshift(String(thisYear));

  function ExpenseModal({ expense }) {
    const [form, setForm] = useState(expense || { category: EXPENSE_CATEGORIES[0], description:"", amount:"", date:today, notes:"" });
    const set = (k,v) => setForm(f=>({...f,[k]:v}));
    const iStyle = { background:"#0f1e2e", border:`1px solid ${DS.border}`, borderRadius:8, color:"#f1f5f9", padding:"8px 11px", fontSize:13, outline:"none", width:"100%", boxSizing:"border-box" };
    const lbl = (t) => <label style={{ color:"#94a3b8", fontSize:11, fontWeight:600, display:"block", marginBottom:4 }}>{t}</label>;
    return (
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
        <div style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:16, padding:26, width:460 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <h2 style={{ color:"#f1f5f9", fontSize:17, fontWeight:800, margin:0 }}>{expense?.id?"Edit Expense":"Log Expense"}</h2>
            <button onClick={()=>setModal(null)} style={{ background:"none", border:"none", color:"#64748b", fontSize:20, cursor:"pointer" }}></button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:11, marginBottom:14 }}>
            <div style={{ gridColumn:"span 2" }}>{lbl("Category")}<select value={form.category} onChange={e=>set("category",e.target.value)} style={iStyle}>{EXPENSE_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
            <div style={{ gridColumn:"span 2" }}>{lbl("Description")}<input value={form.description} onChange={e=>set("description",e.target.value)} placeholder="What was this for?" style={iStyle}/></div>
            <div>{lbl("Amount ($)")}<input type="number" value={form.amount} onChange={e=>set("amount",e.target.value)} style={iStyle}/></div>
            <div>{lbl("Date")}<input type="date" value={form.date} onChange={e=>set("date",e.target.value)} style={iStyle}/></div>
            <div style={{ gridColumn:"span 2" }}>{lbl("Notes")}<textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={2} style={{...iStyle,resize:"vertical"}}/></div>
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <button onClick={()=>setModal(null)} style={{ background:"none", border:`1px solid ${DS.border}`, color:"#94a3b8", padding:"8px 16px", borderRadius:8, cursor:"pointer", fontSize:13 }}>Cancel</button>
            <button onClick={()=>saveExpense(form)} style={{ background:"#ef4444", border:"none", color:"#fff", padding:"8px 20px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:800 }}>Save</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ color:"#f1f5f9", fontWeight:800, fontSize:16 }}>Expense Tracker</div>
          <div style={{ color:"#475569", fontSize:11 }}>Track your business costs against commission income</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <select value={filterYear} onChange={e=>setFilterYear(e.target.value)} style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:7, color:"#94a3b8", padding:"6px 10px", fontSize:12, outline:"none" }}>
            {years.map(y=><option key={y}>{y}</option>)}
          </select>
          <button onClick={()=>setModal("new")} style={{ background:"#ef4444", border:"none", color:"#fff", padding:"7px 16px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:800 }}>+ Log Expense</button>
        </div>
      </div>
      {/* P&L Summary */}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
        {[
          { label:"Gross Commission (YTD)", value: fmt(closedYTD), color:"#10b981", sub:"closed deals" },
          { label:"Total Expenses", value: fmt(totalExpenses), color:"#ef4444", sub:`${yearExpenses.length} items` },
          { label:"Net Income", value: fmt(netIncome), color: netIncome >= 0 ? "#34d399":"#fca5a5", sub:"commission - expenses" },
          { label:"Expense Ratio", value: closedYTD > 0 ? (totalExpenses/closedYTD*100).toFixed(1)+"%" : "—", color:"#f59e0b", sub:"expenses / gross" },
        ].map(c=>(
          <div key={c.label} style={{ flex:1, minWidth:150, background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:12, padding:"14px 16px" }}>
            <div style={{ color:c.color, fontWeight:800, fontSize:20 }}>{c.value}</div>
            <div style={{ color:"#94a3b8", fontSize:11, fontWeight:600, marginTop:2 }}>{c.label}</div>
            <div style={{ color:"#475569", fontSize:10 }}>{c.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:12 }}>
        {/* By category */}
        <div style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:12, padding:"14px 18px" }}>
          <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:13, marginBottom:12 }}>By Category</div>
          {byCategory.length === 0 && <div style={{ color:"#475569", fontSize:12 }}>No expenses logged yet.</div>}
          {byCategory.map(c=>(
            <div key={c.cat} style={{ marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                <span style={{ color:"#94a3b8", fontSize:11 }}>{c.cat}</span>
                <span style={{ color:"#f59e0b", fontSize:11, fontWeight:700 }}>{fmt(c.total)}</span>
              </div>
              <div style={{ background:"#0f1e2e", borderRadius:999, height:4, overflow:"hidden" }}>
                <div style={{ width:`${totalExpenses>0?(c.total/totalExpenses*100):0}%`, height:"100%", background:"#ef4444", borderRadius:999 }}/>
              </div>
            </div>
          ))}
        </div>
        {/* Expense list */}
        <div style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:12, padding:"14px 18px", overflowY:"auto", maxHeight:400 }}>
          <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:13, marginBottom:12 }}>All Expenses — {filterYear}</div>
          {yearExpenses.length === 0 && <div style={{ color:"#475569", fontSize:12 }}>No expenses logged for {filterYear}.</div>}
          {yearExpenses.sort((a,b)=>b.date.localeCompare(a.date)).map(e=>(
            <div key={e.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`1px solid ${DS.border}`, padding:"9px 0" }}>
              <div>
                <div style={{ color:"#f1f5f9", fontSize:12, fontWeight:600 }}>{e.description||e.category}</div>
                <div style={{ color:"#475569", fontSize:10 }}>{e.category} · {new Date(e.date+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</div>
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <span style={{ color:"#ef4444", fontWeight:700, fontSize:13 }}>{fmt(e.amount)}</span>
                <button onClick={()=>setModal(e)} style={{ background:"none", border:"none", color:"#94a3b8", cursor:"pointer", fontSize:14, padding:"4px 8px" }}>✎</button>
                <button onClick={()=>{ if(window.confirm("Delete this expense?")) setExpenses(prev=>prev.filter(x=>x.id!==e.id)); }} style={{ background:"none", border:"none", color:"#ef4444", cursor:"pointer", fontSize:14, padding:"4px 8px", fontWeight:700 }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {modal && <ExpenseModal expense={modal==="new"?null:modal}/>}
    </div>
  );
}

function PropertyDBTab({ properties, setProperties, submarketList, contacts }) {
  const smList = submarketList || DEFAULT_SUBMARKETS;
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");

  const saveProperty = (form) => {
    const d = { ...form, sqft: parseFloat(form.sqft)||0, yearBuilt: parseInt(form.yearBuilt)||0, clearHeight: parseFloat(form.clearHeight)||0, dockDoors: parseInt(form.dockDoors)||0, lastSalePrice: parseFloat(form.lastSalePrice)||0 };
    if (form.id) setProperties(prev => prev.map(p => p.id === form.id ? d : p));
    else setProperties(prev => [...prev, { ...d, id: Date.now() }]);
    setModal(null);
  };

  const filtered = properties.filter(p =>
    !search || `${p.name} ${p.address} ${p.owner} ${p.ownerContact} ${p.submarket}`.toLowerCase().includes(search.toLowerCase())
  );

  function PropertyModal({ property }) {
    const [form, setForm] = useState(property || { name:"", address:"", submarket:smList[0]||"Northeast", subtype:"Distribution", sqft:"", owner:"", ownerContact:"", yearBuilt:"", clearHeight:"", dockDoors:"", lastSalePrice:"", notes:"", tags:"" });
    const set = (k,v) => setForm(f=>({...f,[k]:v}));
    const iStyle = { background:"#0f1e2e", border:`1px solid ${DS.border}`, borderRadius:8, color:"#f1f5f9", padding:"8px 11px", fontSize:13, outline:"none", width:"100%", boxSizing:"border-box" };
    const lbl = (t) => <label style={{ color:"#94a3b8", fontSize:11, fontWeight:600, display:"block", marginBottom:4 }}>{t}</label>;
    return (
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
        <div style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:16, padding:26, width:620, maxHeight:"90vh", overflowY:"auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <h2 style={{ color:"#f1f5f9", fontSize:17, fontWeight:800, margin:0 }}>{property?.id?"Edit Property":"Add Property"}</h2>
            <button onClick={()=>setModal(null)} style={{ background:"none", border:"none", color:"#64748b", fontSize:20, cursor:"pointer" }}></button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:11, marginBottom:14 }}>
            <div style={{ gridColumn:"span 2" }}>{lbl("Property Name")}<input value={form.name} onChange={e=>set("name",e.target.value)} style={iStyle}/></div>
            <div style={{ gridColumn:"span 2" }}>{lbl("Address")}<input value={form.address} onChange={e=>set("address",e.target.value)} style={iStyle}/></div>
            <div>{lbl("Submarket")}<select value={form.submarket} onChange={e=>set("submarket",e.target.value)} style={iStyle}>{smList.map(s=><option key={s}>{s}</option>)}</select></div>
            <div>{lbl("Subtype")}<select value={form.subtype} onChange={e=>set("subtype",e.target.value)} style={iStyle}>{INDUSTRIAL_SUBTYPES.map(s=><option key={s}>{s}</option>)}</select></div>
            <div>{lbl("Square Footage")}<input type="number" value={form.sqft} onChange={e=>set("sqft",e.target.value)} style={iStyle}/></div>
            <div>{lbl("Year Built")}<input type="number" value={form.yearBuilt} onChange={e=>set("yearBuilt",e.target.value)} style={iStyle}/></div>
            <div>{lbl("Clear Height (ft)")}<input type="number" value={form.clearHeight} onChange={e=>set("clearHeight",e.target.value)} style={iStyle}/></div>
            <div>{lbl("Dock Doors")}<input type="number" value={form.dockDoors} onChange={e=>set("dockDoors",e.target.value)} style={iStyle}/></div>
            <div>{lbl("Owner / Entity")}<input value={form.owner} onChange={e=>set("owner",e.target.value)} style={iStyle}/></div>
            <div>{lbl("Owner Contact Name")}<input value={form.ownerContact} onChange={e=>set("ownerContact",e.target.value)} style={iStyle}/></div>
            <div>{lbl("Last Sale Price ($)")}<input type="number" value={form.lastSalePrice} onChange={e=>set("lastSalePrice",e.target.value)} style={iStyle}/></div>
            <div>{lbl("Tags")}<input value={form.tags} onChange={e=>set("tags",e.target.value)} placeholder="Owner Prospect, Value-Add, etc." style={iStyle}/></div>
            <div style={{ gridColumn:"span 2" }}>{lbl("Notes")}<textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={3} style={{...iStyle,resize:"vertical"}} placeholder="Condition, ownership history, opportunities..."/></div>
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <button onClick={()=>setModal(null)} style={{ background:"none", border:`1px solid ${DS.border}`, color:"#94a3b8", padding:"8px 16px", borderRadius:8, cursor:"pointer", fontSize:13 }}>Cancel</button>
            <button onClick={()=>saveProperty(form)} style={{ background:"#6366f1", border:"none", color:"#fff", padding:"8px 20px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:800 }}>Save Property</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ color:"#f1f5f9", fontWeight:800, fontSize:16 }}>Property Database</div>
          <div style={{ color:"#475569", fontSize:11 }}>Buildings in your market — owners, specs, and opportunity notes</div>
        </div>
        <button onClick={()=>setModal("new")} style={{ background:"#6366f1", border:"none", color:"#fff", padding:"7px 16px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:800 }}>+ Add Property</button>
      </div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search property name, address, owner, submarket..." style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:8, color:"#f1f5f9", padding:"8px 12px", fontSize:12, outline:"none" }}/>
      <div style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:12, overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", minWidth:800 }}>
          <thead>
            <tr style={{ borderBottom:`2px solid ${DS.border}` }}>
              {["Property","Submarket","Subtype","Sq Ft","Yr Built","Clear Ht","Docks","Owner","Contact","Last Sale","Tags",""].map(h=>(
                <th key={h} style={{ color:"#64748b", fontSize:10, fontWeight:700, textAlign:"left", padding:"9px 10px", whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p=>(
              <tr key={p.id} style={{ borderBottom:`1px solid ${DS.border}` }}
                onMouseEnter={e=>e.currentTarget.style.background="#1a2d42"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{ padding:"10px", color:"#f1f5f9", fontWeight:600, fontSize:12 }}>
                  <div>{p.name}</div>
                  {p.address && <div style={{ color:"#475569", fontSize:10 }}>{p.address}</div>}
                </td>
                <td style={{ padding:"10px", color:"#94a3b8", fontSize:11 }}>{p.submarket||"—"}</td>
                <td style={{ padding:"10px", color:"#64748b", fontSize:11 }}>{p.subtype||"—"}</td>
                <td style={{ padding:"10px", color:"#cbd5e1", fontSize:12 }}>{p.sqft?p.sqft.toLocaleString():"—"}</td>
                <td style={{ padding:"10px", color:"#64748b", fontSize:11 }}>{p.yearBuilt||"—"}</td>
                <td style={{ padding:"10px", color:"#64748b", fontSize:11 }}>{p.clearHeight?p.clearHeight+"'":"—"}</td>
                <td style={{ padding:"10px", color:"#64748b", fontSize:11 }}>{p.dockDoors||"—"}</td>
                <td style={{ padding:"10px", color:"#94a3b8", fontSize:11 }}>{p.owner||"—"}</td>
                <td style={{ padding:"10px", color:"#60a5fa", fontSize:11 }}>{p.ownerContact||"—"}</td>
                <td style={{ padding:"10px", color:"#f59e0b", fontSize:11 }}>{p.lastSalePrice>0?fmt(p.lastSalePrice):"—"}</td>
                <td style={{ padding:"10px" }}>{p.tags&&p.tags.split(",").map(t=>t.trim()).filter(Boolean).map(t=><span key={t} style={{ background:"#1e3048", color:"#94a3b8", padding:"1px 6px", borderRadius:20, fontSize:9, marginRight:3 }}>{t}</span>)}</td>
                <td style={{ padding:"10px" }}>
                  <div style={{ display:"flex", gap:4 }}>
                    <button onClick={()=>setModal(p)} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer", fontSize:13 }}></button>
                    <button onClick={()=>{ if(window.confirm("Delete?")) setProperties(prev=>prev.filter(x=>x.id!==p.id)); }} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:13 }}></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ color:"#475569", fontSize:13, textAlign:"center", padding:"40px 0" }}>No properties yet. Track buildings in your market — specs, owners, and opportunities.</div>}
      </div>
      {modal && <PropertyModal property={modal==="new"?null:modal}/>}
    </div>
  );
}

// ── Deal Timeline Tab ─────────────────────────────────────────
function TimelineTab({ deals }) {
  const enriched = useMemo(()=>deals.map(calcDeal),[deals]);
  const now = new Date();
  // Show 6 months back + 6 months forward
  const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 7, 0);
  const totalDays = Math.floor((endDate - startDate) / 86400000);

  const months = [];
  for (let m = -1; m <= 6; m++) {
    const d = new Date(now.getFullYear(), now.getMonth() + m, 1);
    months.push({ label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`, start: new Date(now.getFullYear(), now.getMonth() + m, 1), end: new Date(now.getFullYear(), now.getMonth() + m + 1, 0) });
  }

  const active = enriched.filter(d => d.stage !== "Lost" && d.expectedClose);
  const todayPct = ((now - startDate) / (endDate - startDate)) * 100;

  const stageBar = { "Prospect":"#2563eb","Proposal":"#ca8a04","LOI":"#9333ea","Under Contract":"#c2410c","Closed":"#15803d" };

  const getBar = (d) => {
    const closeDate = new Date(d.expectedClose + "T00:00:00");
    if (closeDate < startDate || closeDate > endDate) return null;
    const pct = ((closeDate - startDate) / (endDate - startDate)) * 100;
    return { pct: Math.max(0, Math.min(100, pct)) };
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div>
        <div style={{ color:"#f1f5f9", fontWeight:800, fontSize:16 }}>Deal Timeline</div>
        <div style={{ color:"#475569", fontSize:11 }}>Visual close date calendar — see where your deals cluster</div>
      </div>
      <div style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:12, padding:"18px 20px", overflowX:"auto" }}>
        {/* Month headers */}
        <div style={{ display:"flex", position:"relative", marginBottom:8, marginLeft:200 }}>
          {months.map((m,i) => (
            <div key={i} style={{ flex:1, color:"#64748b", fontSize:10, fontWeight:700, borderLeft:`1px solid ${DS.border}`, paddingLeft:4, paddingBottom:4 }}>{m.label}</div>
          ))}
        </div>
        {/* Today line overlay - positioned relative to chart area */}
        <div style={{ position:"relative" }}>
          {/* Rows */}
          {active.length === 0 && <div style={{ color:"#475569", fontSize:12, textAlign:"center", padding:"30px 0" }}>No active deals with close dates set.</div>}
          {active.map(d => {
            const bar = getBar(d);
            const color = stageBar[d.stage] || "#475569";
            return (
              <div key={d.id} style={{ display:"flex", alignItems:"center", marginBottom:8, minHeight:32 }}>
                <div style={{ width:200, flexShrink:0, paddingRight:12 }}>
                  <div style={{ color:"#f1f5f9", fontSize:11, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{d.name}</div>
                  <div style={{ color:"#475569", fontSize:9 }}>{d.stage} · {d.sqft?d.sqft.toLocaleString()+" SF":""}</div>
                </div>
                <div style={{ flex:1, position:"relative", height:28, background:"#0f1e2e", borderRadius:6, overflow:"hidden" }}>
                  {/* Today marker */}
                  <div style={{ position:"absolute", left:`${todayPct}%`, top:0, bottom:0, width:2, background:"#f59e0b", zIndex:2, opacity:0.8 }}/>
                  {bar && (
                    <div style={{ position:"absolute", left:`${Math.max(0,bar.pct-1)}%`, top:"50%", transform:"translateY(-50%)", zIndex:3 }}>
                      <div style={{ width:12, height:12, borderRadius:"50%", background:color, border:"2px solid DS.panel", boxShadow:`0 0 0 3px ${color}33` }} title={`${d.name} — ${d.expectedClose}`}/>
                    </div>
                  )}
                  {!bar && (
                    <div style={{ position:"absolute", right:4, top:"50%", transform:"translateY(-50%)", color:"#334155", fontSize:9 }}>outside range</div>
                  )}
                </div>
                <div style={{ width:100, flexShrink:0, paddingLeft:10, color:"#f59e0b", fontSize:10, fontWeight:700 }}>{fmt(d.netCommission)}</div>
              </div>
            );
          })}
          {/* Month grid lines */}
          <div style={{ position:"absolute", top:0, bottom:0, left:200, right:100, pointerEvents:"none" }}>
            {months.map((m,i) => (
              <div key={i} style={{ position:"absolute", left:`${(i/months.length)*100}%`, top:0, bottom:0, borderLeft:`1px solid ${DS.border}` }}/>
            ))}
            <div style={{ position:"absolute", left:`${todayPct*((100)/(months.length))/100*100}%`, display:"none" }}/>
          </div>
        </div>
        {/* Legend */}
        <div style={{ display:"flex", gap:12, marginTop:14, flexWrap:"wrap", borderTop:`1px solid ${DS.border}`, paddingTop:12 }}>
          {Object.entries(stageBar).map(([stage,color])=>(
            <div key={stage} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:10, height:10, borderRadius:"50%", background:color }}/>
              <span style={{ color:"#64748b", fontSize:10 }}>{stage}</span>
            </div>
          ))}
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:2, height:14, background:"#f59e0b" }}/>
            <span style={{ color:"#f59e0b", fontSize:10, fontWeight:700 }}>Today</span>
          </div>
        </div>
      </div>
      {/* Monthly commission clusters */}
      <div style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:12, padding:"14px 18px" }}>
        <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:13, marginBottom:12 }}>Closing Clusters by Month</div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {months.slice(1, 7).map((m,i) => {
            const mDeals = enriched.filter(d => {
              if (!d.expectedClose || d.stage === "Lost") return false;
              const cd = new Date(d.expectedClose + "T00:00:00");
              return cd >= m.start && cd <= m.end;
            });
            const weighted = mDeals.reduce((s,d)=>s+d.weighted,0);
            return (
              <div key={i} style={{ flex:1, minWidth:120, background:"#0f1e2e", border:`1px solid ${DS.border}`, borderRadius:8, padding:"10px 12px" }}>
                <div style={{ color:"#94a3b8", fontSize:10, fontWeight:700, marginBottom:4 }}>{m.label}</div>
                <div style={{ color:"#f59e0b", fontWeight:800, fontSize:16 }}>{fmt(weighted)}</div>
                <div style={{ color:"#475569", fontSize:10 }}>{mDeals.length} deal{mDeals.length!==1?"s":""}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Deal Timeline Modal ─────────────────────────────────────────
function DealTimelineModal({ deal, onClose }) {
  const enriched = calcDeal(deal);
  // Build unified chronological event list
  const events = [];
  (deal.stageHistory || []).forEach(h => {
    events.push({ date: h.enteredDate + "T00:00:00", type: "stage", label: h.stage, note: h.note || "", icon: "" });
  });
  (deal.activities || []).forEach(a => {
    events.push({ date: a.date, type: "activity", label: a.type, note: a.text, icon: "" });
  });
  (deal.richNotes || []).forEach(n => {
    events.push({ date: n.date + "T00:00:00", type: "note", label: n.type, note: n.text?.substring(0,120) || "", icon: "" });
  });
  (deal.documents || []).forEach(doc => {
    events.push({ date: doc.addedDate + "T00:00:00", type: "document", label: doc.type, note: doc.name, icon: "", url: doc.url });
  });
  events.sort((a, b) => new Date(b.date) - new Date(a.date));

  const typeColors = { stage: "#f59e0b", activity: "#3b82f6", note: "#8b5cf6", document: "#10b981" };
  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}>
      <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: 16, padding: 26, width: 620, maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h2 style={{ color: "#f1f5f9", fontSize: 17, fontWeight: 800, margin: 0 }}> Deal Timeline</h2>
            <div style={{ color: "#475569", fontSize: 12, marginTop: 3 }}>{deal.name} · {deal.client}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 20, cursor: "pointer" }}></button>
        </div>

        {/* Deal summary bar */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20, background: "#070e1a", borderRadius: 10, padding: "12px 16px" }}>
          <div><div style={{ color: "#475569", fontSize: 9, fontWeight: 700 }}>STAGE</div><div style={{ marginTop: 3 }}><StageBadge stage={deal.stage} /></div></div>
          <div><div style={{ color: "#475569", fontSize: 9, fontWeight: 700 }}>VALUE</div><div style={{ color: "#f59e0b", fontWeight: 800, fontSize: 14, marginTop: 3 }}>{fmt(enriched.netCommission)}</div></div>
          <div><div style={{ color: "#475569", fontSize: 9, fontWeight: 700 }}>DAYS IN STAGE</div><div style={{ color: "#94a3b8", fontWeight: 700, fontSize: 14, marginTop: 3 }}>{enriched.daysInStage}d</div></div>
          <div><div style={{ color: "#475569", fontSize: 9, fontWeight: 700 }}>EVENTS</div><div style={{ color: "#94a3b8", fontWeight: 700, fontSize: 14, marginTop: 3 }}>{events.length}</div></div>
          {enriched.health && (
            <div><div style={{ color: "#475569", fontSize: 9, fontWeight: 700 }}>HEALTH</div>
              <div style={{ color: enriched.health.color, fontWeight: 800, fontSize: 13, marginTop: 3 }}>
                {enriched.health.score}/100 · {enriched.health.label}
              </div>
            </div>
          )}
        </div>

        {/* Health issues */}
        {enriched.health && enriched.health.issues.length > 0 && (
          <div style={{ background: enriched.health.score < 50 ? "#1a0a0a" : "#1a1400", border: `1px solid ${enriched.health.color}44`, borderRadius: 9, padding: "10px 14px", marginBottom: 16 }}>
            <div style={{ color: enriched.health.color, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Health Issues</div>
            {enriched.health.issues.map((issue, i) => <div key={i} style={{ color: "#94a3b8", fontSize: 11, marginBottom: 2 }}>· {issue}</div>)}
          </div>
        )}

        {/* Timeline */}
        {events.length === 0 && <div style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: "32px 0" }}>No events recorded yet. Activities, notes, documents, and stage changes will appear here.</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {events.map((e, i) => (
            <div key={i} style={{ display: "flex", gap: 0 }}>
              {/* Spine */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 14, flexShrink: 0 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: typeColors[e.type] + "22", border: `2px solid ${typeColors[e.type]}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{e.icon}</div>
                {i < events.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 20, background: "#1e3048", margin: "4px 0" }} />}
              </div>
              {/* Content */}
              <div style={{ flex: 1, paddingBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ background: typeColors[e.type] + "22", color: typeColors[e.type], border: `1px solid ${typeColors[e.type]}44`, padding: "1px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{e.type}</span>
                    <span style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 12 }}>{e.label}</span>
                  </div>
                  <span style={{ color: "#334155", fontSize: 10, flexShrink: 0, marginLeft: 8 }}>{formatDate(e.date)}</span>
                </div>
                {e.note && <div style={{ color: "#64748b", fontSize: 11, marginTop: 5, lineHeight: 1.5 }}>{e.note}</div>}
                {e.url && <a href={e.url} target="_blank" rel="noreferrer" style={{ color: "#60a5fa", fontSize: 11, marginTop: 4, display: "block" }}> Open link</a>}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
          <button onClick={onClose} style={{ background: "#1e3048", border: "none", color: "#94a3b8", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Intel / Analytics Pro Tab ────────────────────────────────────
function IntelTab({ deals, expenses, gciGoal }) {
  const now = new Date();
  const allEnriched = useMemo(() => deals.map(calcDeal), [deals]);
  const closed = allEnriched.filter(d => d.stage === "Closed");
  const lost = allEnriched.filter(d => d.stage === "Lost");
  const active = allEnriched.filter(d => d.stage !== "Closed" && d.stage !== "Lost");

  // ── Conversion funnel ──────────────────────────────
  const stageOrder = ["Prospect", "Proposal", "LOI", "Under Contract", "Closed"];
  const funnelCounts = stageOrder.map(s => deals.filter(d => d.stage === s || (s === "Closed" && d.won === true)).length);
  const totalEver = deals.length;

  // Stage velocity from stageHistory
  const stageVelocity = {};
  stageOrder.slice(0, -1).forEach(stage => {
    const times = [];
    deals.forEach(d => {
      if (!d.stageHistory || d.stageHistory.length < 2) return;
      const idx = d.stageHistory.findIndex(h => h.stage === stage);
      const nextIdx = d.stageHistory.findIndex((h, i) => i > idx && h.stage !== stage);
      if (idx >= 0 && nextIdx >= 0) {
        const days = Math.floor((new Date(d.stageHistory[nextIdx].enteredDate + "T00:00:00") - new Date(d.stageHistory[idx].enteredDate + "T00:00:00")) / 86400000);
        if (days >= 0) times.push(days);
      }
    });
    stageVelocity[stage] = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null;
  });

  // Loss analysis
  const lossReasonCounts = {};
  lost.forEach(d => {
    const r = d.lossReason || "Unknown";
    lossReasonCounts[r] = (lossReasonCounts[r] || 0) + 1;
  });
  const lossReasons = Object.entries(lossReasonCounts).sort((a, b) => b[1] - a[1]);

  // Win rate by lead source
  const sourceStats = {};
  deals.filter(d => d.stage === "Closed" || d.stage === "Lost").forEach(d => {
    const src = d.leadSource || "Unknown";
    if (!sourceStats[src]) sourceStats[src] = { won: 0, lost: 0 };
    if (d.stage === "Closed") sourceStats[src].won++;
    else sourceStats[src].lost++;
  });
  const sourceWinRates = Object.entries(sourceStats)
    .map(([src, s]) => ({ src, total: s.won + s.lost, won: s.won, rate: Math.round(s.won / (s.won + s.lost) * 100) }))
    .filter(x => x.total >= 1).sort((a, b) => b.rate - a.rate);

  // ── Cash flow projection ──────────────────────────
  const projection = [];
  for (let i = 0; i < 6; i++) {
    const projDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthKey = projDate.toISOString().substring(0, 7);
    const monthLabel = projDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    const closingDeals = allEnriched.filter(d => d.expectedClose?.startsWith(monthKey) && d.stage !== "Lost");
    const high = closingDeals.filter(d => d.probability >= 80).reduce((s, d) => s + d.netCommission, 0);
    const mid = closingDeals.filter(d => d.probability >= 50 && d.probability < 80).reduce((s, d) => s + d.weighted, 0);
    const low = closingDeals.filter(d => d.probability < 50).reduce((s, d) => s + d.weighted, 0);
    projection.push({ month: monthLabel, high, mid, low, total: high + mid + low, count: closingDeals.length });
  }

  // ── Goal decomposition ──────────────────────────────
  const closedYTD = closed.filter(d => d.expectedClose?.startsWith(String(now.getFullYear()))).reduce((s, d) => s + d.netCommission, 0);
  const remaining = Math.max(0, gciGoal - closedYTD);
  const avgDealSize = closed.length > 0 ? closed.reduce((s, d) => s + d.netCommission, 0) / closed.length : 42000;
  const overallWinRate = (closed.length + lost.length) > 0 ? closed.length / (closed.length + lost.length) : 0.5;
  const loiToCloseRate = deals.filter(d => d.stageHistory?.some(h => h.stage === "LOI")).length > 0
    ? closed.filter(d => d.stageHistory?.some(h => h.stage === "LOI")).length / deals.filter(d => d.stageHistory?.some(h => h.stage === "LOI")).length
    : 0.65;
  const proposalToLOI = 0.55;
  const dealsNeeded = avgDealSize > 0 ? Math.ceil(remaining / avgDealSize) : "—";
  const proposalsNeeded = typeof dealsNeeded === "number" ? Math.ceil(dealsNeeded / (loiToCloseRate * 1.3)) : "—";
  const prospectsNeeded = typeof proposalsNeeded === "number" ? Math.ceil(proposalsNeeded / proposalToLOI) : "—";

  const Card = ({ title, children, accent = "#1e3048" }) => (
    <div style={{ background: DS.panel, border: `1px solid ${accent}`, borderRadius: 12, padding: "18px 20px" }}>
      <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  );

  const pct = (n, t) => t > 0 ? Math.round(n / t * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Funnel + Velocity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card title="YOUR CONVERSION FUNNEL" accent="#1e3a5f">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {stageOrder.map((stage, i) => {
              const count = deals.filter(d => d.stage === stage).length + (stage === "Closed" ? closed.length - deals.filter(d => d.stage === "Closed").length : 0);
              const actualCount = stage === "Closed" ? closed.length : deals.filter(d => d.stage === stage).length;
              const barW = totalEver > 0 ? Math.max(8, (actualCount / totalEver) * 100) : 8;
              const convRate = i > 0 ? pct(actualCount, deals.filter(d => d.stage === stageOrder[i - 1]).length) : 100;
              const sc = STAGE_COLORS[stage] || { bg: DS.panel, text: DS.textSub, border: DS.border, glow: "transparent" };
              return (
                <div key={stage}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: sc.text, fontSize: 11, fontWeight: 600 }}>{stage}</span>
                    <div style={{ display: "flex", gap: 12 }}>
                      {stageVelocity[stage] !== null && stageVelocity[stage] !== undefined && (
                        <span style={{ color: "#475569", fontSize: 10 }}>avg {stageVelocity[stage]}d</span>
                      )}
                      <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700 }}>{actualCount}</span>
                    </div>
                  </div>
                  <div style={{ background: "#070e1a", borderRadius: 999, height: 8, overflow: "hidden" }}>
                    <div style={{ width: `${barW}%`, height: "100%", background: sc.text, borderRadius: 999, opacity: 0.8 }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${DS.border}`, display: "flex", gap: 16 }}>
            <div><div style={{ color: "#475569", fontSize: 9, fontWeight: 700 }}>WIN RATE</div><div style={{ color: "#10b981", fontWeight: 800, fontSize: 16 }}>{overallWinRate > 0 ? Math.round(overallWinRate * 100) : "—"}%</div></div>
            <div><div style={{ color: "#475569", fontSize: 9, fontWeight: 700 }}>CLOSED</div><div style={{ color: "#f59e0b", fontWeight: 800, fontSize: 16 }}>{closed.length}</div></div>
            <div><div style={{ color: "#475569", fontSize: 9, fontWeight: 700 }}>LOST</div><div style={{ color: "#ef4444", fontWeight: 800, fontSize: 16 }}>{lost.length}</div></div>
            <div><div style={{ color: "#475569", fontSize: 9, fontWeight: 700 }}>ACTIVE</div><div style={{ color: "#60a5fa", fontWeight: 800, fontSize: 16 }}>{active.length}</div></div>
          </div>
        </Card>

        <Card title="WHY DEALS ARE LOST" accent="#7f1d1d">
          {lossReasons.length === 0 && <div style={{ color: "#475569", fontSize: 12, paddingTop: 8 }}>No lost deals yet — great!</div>}
          {lossReasons.map(([reason, count]) => (
            <div key={reason} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "#94a3b8", fontSize: 11 }}>{reason}</span>
                <span style={{ color: "#fca5a5", fontSize: 11, fontWeight: 700 }}>{count} deal{count > 1 ? "s" : ""}</span>
              </div>
              <div style={{ background: "#070e1a", borderRadius: 999, height: 6 }}>
                <div style={{ width: `${pct(count, lost.length)}%`, height: "100%", background: "#ef4444", borderRadius: 999, opacity: 0.7 }} />
              </div>
            </div>
          ))}
          {sourceWinRates.length > 0 && (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${DS.border}` }}>
              <div style={{ color: "#475569", fontSize: 9, fontWeight: 700, marginBottom: 10 }}>WIN RATE BY LEAD SOURCE</div>
              {sourceWinRates.slice(0, 5).map(s => (
                <div key={s.src} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "center" }}>
                  <span style={{ color: "#64748b", fontSize: 10 }}>{s.src} ({s.total})</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 60, background: "#070e1a", borderRadius: 999, height: 5 }}>
                      <div style={{ width: `${s.rate}%`, height: "100%", background: s.rate >= 60 ? "#10b981" : s.rate >= 40 ? "#f59e0b" : "#ef4444", borderRadius: 999 }} />
                    </div>
                    <span style={{ color: s.rate >= 60 ? "#10b981" : s.rate >= 40 ? "#f59e0b" : "#ef4444", fontSize: 10, fontWeight: 700, minWidth: 28 }}>{s.rate}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Cash flow projection */}
      <Card title="6-MONTH CASH FLOW PROJECTION" accent="#1e3a5f">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10 }}>
          {projection.map(p => {
            const maxH = Math.max(...projection.map(x => x.total), 1);
            const barHigh = p.high / maxH * 100;
            const barMid = p.mid / maxH * 100;
            const barLow = p.low / maxH * 100;
            return (
              <div key={p.month} style={{ textAlign: "center" }}>
                <div style={{ height: 80, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: 1, marginBottom: 6 }}>
                  {p.low > 0 && <div style={{ width: "70%", background: "#3b82f644", border: "1px solid #3b82f6", borderRadius: 3, height: `${barLow}%`, minHeight: 3 }} />}
                  {p.mid > 0 && <div style={{ width: "70%", background: "#f59e0b44", border: "1px solid #f59e0b", borderRadius: 3, height: `${barMid}%`, minHeight: 3 }} />}
                  {p.high > 0 && <div style={{ width: "70%", background: "#10b98144", border: "1px solid #10b981", borderRadius: 3, height: `${barHigh}%`, minHeight: 3 }} />}
                  {p.total === 0 && <div style={{ color: "#1e3048", fontSize: 10 }}>—</div>}
                </div>
                <div style={{ color: "#f1f5f9", fontSize: 11, fontWeight: 700 }}>{p.total > 0 ? "$" + Math.round(p.total / 1000) + "k" : "—"}</div>
                <div style={{ color: "#475569", fontSize: 9 }}>{p.month}</div>
                <div style={{ color: "#334155", fontSize: 9 }}>{p.count} deal{p.count !== 1 ? "s" : ""}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 12, paddingTop: 10, borderTop: `1px solid ${DS.border}` }}>
          {[["#10b981", "80%+ probability"], ["#f59e0b", "50–79%"], ["#3b82f6", "< 50%"]].map(([c, l]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 10, height: 10, background: c + "44", border: `1px solid ${c}`, borderRadius: 2 }} />
              <span style={{ color: "#475569", fontSize: 10 }}>{l}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Goal decomposition */}
      <Card title="GOAL DECOMPOSITION — WHAT YOU NEED TO HIT YOUR NUMBER" accent="#78350f">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 14 }}>
              To earn the remaining <span style={{ color: "#f59e0b", fontWeight: 700 }}>{fmt(remaining)}</span> toward your {fmt(gciGoal)} goal:
            </div>
            {[
              { label: "Closed deals needed", value: dealsNeeded, color: "#10b981", sub: `at avg ${fmt(Math.round(avgDealSize))} per deal` },
              { label: "Active proposals needed", value: proposalsNeeded, color: "#f59e0b", sub: `at ${Math.round(loiToCloseRate * 100 * 1.3)}% proposal→close rate` },
              { label: "Prospects to work", value: prospectsNeeded, color: "#60a5fa", sub: `at ~55% prospect→proposal rate` },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${DS.border}` }}>
                <div>
                  <div style={{ color: "#94a3b8", fontSize: 12 }}>{item.label}</div>
                  <div style={{ color: "#475569", fontSize: 10 }}>{item.sub}</div>
                </div>
                <div style={{ color: item.color, fontWeight: 900, fontSize: 22 }}>{item.value}</div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, marginBottom: 10 }}>YOUR CURRENT PIPELINE COVERAGE</div>
            {["Prospect", "Proposal", "LOI", "Under Contract"].map(stage => {
              const stageDeals = active.filter(d => d.stage === stage);
              const needed = stage === "Prospect" ? prospectsNeeded : stage === "Proposal" ? proposalsNeeded : stage === "LOI" ? Math.ceil((typeof dealsNeeded === "number" ? dealsNeeded : 0) / (loiToCloseRate || 0.65)) : typeof dealsNeeded === "number" ? dealsNeeded : 0;
              const have = stageDeals.length;
              const covered = typeof needed === "number" && needed > 0 ? Math.min(100, Math.round(have / needed * 100)) : 100;
              const sc = STAGE_COLORS[stage] || {};
              return (
                <div key={stage} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: sc.text || "#94a3b8", fontSize: 11 }}>{stage}</span>
                    <span style={{ color: covered >= 100 ? "#10b981" : "#f59e0b", fontSize: 11, fontWeight: 700 }}>{have} / {needed}</span>
                  </div>
                  <div style={{ background: "#070e1a", borderRadius: 999, height: 7 }}>
                    <div style={{ width: `${covered}%`, height: "100%", background: covered >= 100 ? "#10b981" : covered >= 60 ? "#f59e0b" : "#ef4444", borderRadius: 999 }} />
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop: 12, color: "#334155", fontSize: 10, lineHeight: 1.6 }}>
              Rates based on {closed.length + lost.length > 0 ? "your actual history" : "industry averages"}.{" "}
              Avg deal: {fmt(Math.round(avgDealSize))} · Win rate: {Math.round(overallWinRate * 100)}%
            </div>
          </div>
        </div>
      </Card>

      {/* Deal health overview */}
      <Card title="DEAL HEALTH OVERVIEW" accent="#1e3048">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {active.length === 0 && <div style={{ color: "#475569", fontSize: 12 }}>No active deals to score.</div>}
          {active.sort((a, b) => (a.health?.score ?? 100) - (b.health?.score ?? 100)).map(d => (
            <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#070e1a", borderRadius: 9, border: `1px solid ${d.health?.color || "#1e3048"}33` }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: (d.health?.color || "#475569") + "22", border: `2px solid ${d.health?.color || "#475569"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: d.health?.color || "#475569", fontWeight: 900, fontSize: 13 }}>{d.health?.score ?? "—"}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 12 }}>{d.name}</span>
                  <StageBadge stage={d.stage} />
                  {d.health && <span style={{ color: d.health.color, fontSize: 10, fontWeight: 700 }}>{d.health.label}</span>}
                </div>
                {d.health?.issues?.length > 0 && (
                  <div style={{ color: "#475569", fontSize: 10, marginTop: 3 }}>{d.health.issues.slice(0, 2).join(" · ")}</div>
                )}
              </div>
              <div style={{ color: "#f59e0b", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{fmt(d.netCommission)}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Lease Expiration Radar ───────────────────────────────────────
function LeaseRadarTab({ deals, contacts, onNavigate }) {
  const now = new Date();
  const enriched = useMemo(() => deals.map(calcDeal), [deals]);

  // Tenant leases from closed deals with leaseTerm
  const tenantLeases = enriched.filter(d => d.leaseExpiresDate).map(d => {
    const daysUntilExpiry = Math.floor((new Date(d.leaseExpiresDate + "T00:00:00") - now) / 86400000);
    const urgency = daysUntilExpiry < 0 ? "expired" : daysUntilExpiry < 90 ? "critical" : daysUntilExpiry < 180 ? "urgent" : daysUntilExpiry < 365 ? "watch" : "monitor";
    const urgencyColor = { expired: "#ef4444", critical: "#f97316", urgent: "#f59e0b", watch: "#60a5fa", monitor: "#10b981" }[urgency];
    const urgencyLabel = { expired: "Expired", critical: "< 90 days", urgent: "< 6 months", watch: "< 1 year", monitor: "1+ year" }[urgency];
    return { ...d, daysUntilExpiry, urgency, urgencyColor, urgencyLabel };
  }).sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

  // Manual lease tracking from properties (tenants with known expiry)
  const propertiesWithExpiry = [];

  const urgencyCounts = { expired: 0, critical: 0, urgent: 0, watch: 0, monitor: 0 };
  tenantLeases.forEach(l => urgencyCounts[l.urgency]++);

  const UrgencyBand = ({ label, count, color }) => count > 0 ? (
    <div style={{ background: color + "11", border: `1px solid ${color}33`, borderRadius: 8, padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color, fontSize: 12, fontWeight: 600 }}>{label}</span>
      <span style={{ color, fontWeight: 800, fontSize: 16 }}>{count}</span>
    </div>
  ) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 16 }}>Lease Expiration Radar</div>
          <div style={{ color: "#475569", fontSize: 11, marginTop: 2 }}>
            Track when your tenants' leases expire — your best source of repeat business
          </div>
        </div>
      </div>

      {tenantLeases.length === 0 ? (
        <div style={{ background: DS.panel, border: "1px dashed #1e3048", borderRadius: 12, padding: "32px", textAlign: "center" }}>
          <div style={{ color: "#475569", fontSize: 14, marginBottom: 8 }}>No lease expirations tracked yet</div>
          <div style={{ color: "#334155", fontSize: 12 }}>When you close a Lease deal with an expected close date and lease term, expirations will automatically appear here.</div>
          <div style={{ color: "#334155", fontSize: 12, marginTop: 6 }}>Make sure your closed lease deals have: Expected Close Date + Lease Term (months).</div>
        </div>
      ) : (
        <>
          {/* Summary bands */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <UrgencyBand label="️ Expired — call immediately" count={urgencyCounts.expired} color="#ef4444" />
            <UrgencyBand label=" Critical — expiring within 90 days" count={urgencyCounts.critical} color="#f97316" />
            <UrgencyBand label=" Urgent — expiring within 6 months" count={urgencyCounts.urgent} color="#f59e0b" />
            <UrgencyBand label=" Watch — expiring within 1 year" count={urgencyCounts.watch} color="#60a5fa" />
            <UrgencyBand label=" Monitor — 1+ year remaining" count={urgencyCounts.monitor} color="#10b981" />
          </div>

          {/* Lease list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tenantLeases.map(d => (
              <div key={d.id} style={{ background: DS.panel, border: `1px solid ${d.urgencyColor}33`, borderRadius: 11, padding: "14px 18px", display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: 10, background: d.urgencyColor + "22", border: `2px solid ${d.urgencyColor}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ color: d.urgencyColor, fontWeight: 900, fontSize: 15, lineHeight: 1 }}>
                    {d.daysUntilExpiry < 0 ? "EXP" : d.daysUntilExpiry > 365 ? Math.round(d.daysUntilExpiry / 30) + "mo" : d.daysUntilExpiry + "d"}
                  </div>
                  <div style={{ color: d.urgencyColor + "99", fontSize: 8, fontWeight: 700 }}>{d.daysUntilExpiry < 0 ? "ago" : "left"}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 13 }}>{d.name}</span>
                    <span style={{ background: d.urgencyColor + "22", color: d.urgencyColor, border: `1px solid ${d.urgencyColor}44`, padding: "1px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{d.urgencyLabel}</span>
                  </div>
                  <div style={{ color: "#64748b", fontSize: 11 }}>Tenant: <span style={{ color: "#94a3b8" }}>{d.client}</span> · {d.submarket} · {d.sqft?.toLocaleString()} SF</div>
                  <div style={{ color: "#475569", fontSize: 10, marginTop: 3 }}>
                    Closed {d.expectedClose} · {d.leaseTerm} month term · Expires {d.leaseExpiresDate}
                    {d.monthlyRent > 0 && <span> · ${d.monthlyRent?.toLocaleString()}/mo</span>}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ color: d.urgencyColor, fontWeight: 900, fontSize: 18 }}>
                    {d.daysUntilExpiry < 0 ? "Now" : d.daysUntilExpiry < 30 ? `${d.daysUntilExpiry}d` : `${Math.round(d.daysUntilExpiry / 30)}mo`}
                  </div>
                  <div style={{ color: "#334155", fontSize: 9 }}>until expiry</div>
                  <div style={{ color: "#f59e0b", fontSize: 11, fontWeight: 700, marginTop: 4 }}>{fmt(d.netCommission)}</div>
                  <div style={{ color: "#334155", fontSize: 9 }}>orig. commission</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Morning Briefing / Home Tab ────────────────────────────────
function HomeBriefing({ deals, tasks, contacts, listings, gciGoal, closedYTD, totalWeighted, onNavigate, onStartSync }) {
  const enriched = useMemo(() => deals.map(calcDeal), [deals]);
  const now = new Date();

  // Follow-ups due today or overdue
  const followUpsDue = enriched.filter(d => d.stage !== "Closed" && d.stage !== "Lost" && d.followUpDate && d.followUpDate <= today).sort((a,b) => a.followUpDate.localeCompare(b.followUpDate));

  // Deals gone cold (30+ days in stage, not closed/lost)
  const goneCold = enriched.filter(d => d.isAging).sort((a,b) => b.daysInStage - a.daysInStage);

  // Tasks overdue or due today
  const urgentTasks = tasks.filter(t => !t.done && t.dueDate && t.dueDate <= today).sort((a,b) => {
    const po = ["Urgent","High","Medium","Low"]; return po.indexOf(a.priority) - po.indexOf(b.priority);
  });

  // Contacts due for outreach based on relationship level
  const outreachDue = contacts.filter(c => {
    if (!c.lastContact) return true;
    const days = Math.floor((now - new Date(c.lastContact + "T00:00:00")) / 86400000);
    const threshold = { "Key Relationship": 30, "Active": 45, "Warm": 60, "Cold": 90 }[c.relationshipLevel] || 90;
    return days >= threshold;
  }).sort((a,b) => {
    const order = ["Key Relationship","Active","Warm","Cold"];
    return order.indexOf(a.relationshipLevel) - order.indexOf(b.relationshipLevel);
  });

  // Lease expirations coming up
  const upcomingExpirations = enriched.filter(d => {
    if (!d.leaseExpiresDate) return false;
    const days = Math.floor((new Date(d.leaseExpiresDate + "T00:00:00") - now) / 86400000);
    return days <= 365;
  }).sort((a, b) => {
    const da = Math.floor((new Date(a.leaseExpiresDate + "T00:00:00") - now) / 86400000);
    const db = Math.floor((new Date(b.leaseExpiresDate + "T00:00:00") - now) / 86400000);
    return da - db;
  });

  // Listings with no showings > 30 days
  const staleListings = listings.filter(l => {
    if (l.status !== "Active") return false;
    const lastShowing = (l.showings||[]).slice(-1)[0];
    if (!lastShowing && l.listedDate) {
      return Math.floor((now - new Date(l.listedDate + "T00:00:00")) / 86400000) > 30;
    }
    if (lastShowing) return Math.floor((now - new Date(lastShowing+"T00:00:00")) / 86400000) > 30;
    return false;
  });

  // This month's pipeline
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const closingThisMonth = enriched.filter(d => d.expectedClose?.startsWith(thisMonthKey) && d.stage !== "Lost");
  const monthWeighted = closingThisMonth.reduce((s,d) => s + d.weighted, 0);

  const gciProgress = Math.min((closedYTD / gciGoal) * 100, 100);
  const urgentCount = followUpsDue.length + urgentTasks.length + goneCold.length + outreachDue.length;

  const SectionCard = ({ title, count, color, children, tabId, emptyMsg }) => (
    <div style={{ background:DS.panel, border:`1px solid ${count > 0 ? color+"33" : "#1e3048"}`, borderRadius:12, overflow:"hidden" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", borderBottom: count > 0 ? `1px solid ${color}22` : "none", cursor: tabId ? "pointer" : "default" }}
        onClick={tabId ? ()=>onNavigate(tabId) : undefined}>
        <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:13 }}>{title}</div>
        {count > 0 ? <span style={{ background:color+"22", color, border:`1px solid ${color}44`, padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:800 }}>{count}</span>
          : <span style={{ color:"#334155", fontSize:11 }}>Clear</span>}
      </div>
      {count > 0 ? <div style={{ padding:"10px 16px", display:"flex", flexDirection:"column", gap:6 }}>{children}</div>
        : <div style={{ padding:"10px 16px", color:"#334155", fontSize:11 }}>{emptyMsg}</div>}
    </div>
  );

  const ItemRow = ({ label, sub, badge, color="#94a3b8", badgeColor="#f59e0b" }) => (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 0", borderBottom:`1px solid ${DS.border}` }}>
      <div>
        <div style={{ color, fontSize:12, fontWeight:600 }}>{label}</div>
        {sub && <div style={{ color:"#475569", fontSize:10 }}>{sub}</div>}
      </div>
      {badge && <span style={{ color:badgeColor, fontSize:11, fontWeight:700, flexShrink:0 }}>{badge}</span>}
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Header greeting */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ color:"#f1f5f9", fontWeight:900, fontSize:22 }}>{greeting}</div>
          <div style={{ color:"#475569", fontSize:12, marginTop:2 }}>{now.toLocaleDateString("en-US",{ weekday:"long", month:"long", day:"numeric", year:"numeric" })}</div>
          {urgentCount > 0 && <div style={{ color:"#fca5a5", fontSize:12, marginTop:4, fontWeight:600 }}>️ {urgentCount} item{urgentCount!==1?"s":""} need your attention today</div>}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10, alignItems:"flex-end" }}>
          {/* 3-Minute Sync button */}
          <button onClick={onStartSync} style={{ background:`linear-gradient(135deg, ${DS.accent} 0%, #f97316 100%)`, border:"none", color:"#0a0f1a", padding:"11px 20px", borderRadius:DS.r.md, cursor:"pointer", fontSize:DS.fs.md, fontWeight:DS.fw.black, boxShadow:`0 4px 20px ${DS.accent}44`, display:"flex", alignItems:"center", gap:8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            3-Minute Sync {urgentCount > 0 && <span style={{ background:"rgba(0,0,0,0.25)", borderRadius:20, padding:"1px 7px", fontSize:10 }}>{urgentCount}</span>}
          </button>
          {/* GCI progress */}
          <div style={{ background:DS.panel, border:`1px solid ${DS.border}`, borderRadius:12, padding:"16px 24px", minWidth:260, boxShadow: DS.shadow.sm }}>
            <div style={{ color:"#94a3b8", fontSize:10, fontWeight:800, marginBottom:10, letterSpacing: "0.5px" }}>GCI GOAL PROGRESS — {now.getFullYear()}</div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems: "baseline", marginBottom: 10 }}>
              <span style={{ color:"#f59e0b", fontWeight:900, fontSize:22, fontFamily: "'DM Mono', monospace" }}>{fmt(closedYTD)}</span>
              <span style={{ color:"#475569", fontSize:13, fontWeight: 600 }}>of {fmt(gciGoal)}</span>
            </div>
            <div style={{ background:"#0f1e2e", borderRadius:999, height:10, overflow:"hidden", marginBottom: 10, border: `1px solid ${DS.border}` }}>
              <div style={{ width:`${gciProgress}%`, height:"100%", background: gciProgress >= 100 ? "#10b981" : gciProgress >= 75 ? "#f59e0b" : "#3b82f6", borderRadius:999, transition:"width 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }}/>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems: "center" }}>
              <span style={{ color:"#94a3b8", fontSize:11, fontWeight: 700 }}>{gciProgress.toFixed(1)}% COMPLETE</span>
              <span style={{ color:"#34d399", fontSize:11, fontWeight: 700 }}>WEIGHTED: {fmt(totalWeighted)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
        {[
          { label:"Closing This Month", value: fmt(monthWeighted), sub:`${closingThisMonth.length} deals · weighted`, color:"#f59e0b" },
          { label:"Follow-ups Due", value: followUpsDue.length, sub:"deals need contact", color: followUpsDue.length > 0 ? "#fca5a5" : "#4ade80", alert: followUpsDue.length > 0 },
          { label:"Urgent Tasks", value: urgentTasks.length, sub:"overdue or due today", color: urgentTasks.length > 0 ? "#fb923c" : "#4ade80", alert: urgentTasks.length > 0 },
          { label:"Contacts Due", value: outreachDue.length, sub:"overdue for outreach", color: outreachDue.length > 0 ? "#ec4899" : "#4ade80", alert: outreachDue.length > 0 },
          { label:"Stale Listings", value: staleListings.length, sub:"no showings 30+ days", color: staleListings.length > 0 ? "#f97316" : "#4ade80", alert: staleListings.length > 0 },
        ].map(s => (
          <div key={s.label} style={{ flex:1, minWidth:130, background: s.alert ? "#1a0a0a" : DS.panel, border:`1px solid ${s.alert ? "#7f1d1d" : "#1e3048"}`, borderRadius:10, padding:"11px 14px" }}>
            <div style={{ color:s.color, fontWeight:800, fontSize:20 }}>{s.value}</div>
            <div style={{ color:"#94a3b8", fontSize:10, fontWeight:600 }}>{s.label}</div>
            <div style={{ color:"#475569", fontSize:10 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Action sections */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <SectionCard title="Follow-ups Due" count={followUpsDue.length} color="#4ade80" tabId="pipeline" emptyMsg="No follow-ups due today — nice.">
          {followUpsDue.slice(0,5).map(d => (
            <ItemRow key={d.id} label={d.name} sub={`${d.client} · ${d.stage}`} badge={d.isOverdue ? "️ Overdue" : "Due today"} badgeColor={d.isOverdue?"#fca5a5":"#4ade80"}/>
          ))}
          {followUpsDue.length > 5 && <div style={{ color:"#475569", fontSize:10 }}>+{followUpsDue.length-5} more — go to Pipeline tab</div>}
        </SectionCard>

        <SectionCard title="Urgent Tasks" count={urgentTasks.length} color="#fb923c" tabId="tasks" emptyMsg="No urgent tasks — you're on top of it.">
          {urgentTasks.slice(0,5).map(t => (
            <ItemRow key={t.id} label={t.title} sub={`${t.category} · ${t.priority}`} badge={t.dueDate < today ? "️ Overdue" : "Due today"} badgeColor={t.dueDate < today?"#fca5a5":"#fb923c"}/>
          ))}
          {urgentTasks.length > 5 && <div style={{ color:"#475569", fontSize:10 }}>+{urgentTasks.length-5} more — go to Tasks tab</div>}
        </SectionCard>

        <SectionCard title="Deals Gone Cold" count={goneCold.length} color="#60a5fa" tabId="pipeline" emptyMsg="No deals are stagnating — pipeline is moving.">
          {goneCold.slice(0,5).map(d => (
            <ItemRow key={d.id} label={d.name} sub={`${d.stage} · ${d.client}`} badge={`${d.daysInStage}d in stage`} badgeColor="#60a5fa"/>
          ))}
          {goneCold.length > 5 && <div style={{ color:"#475569", fontSize:10 }}>+{goneCold.length-5} more</div>}
        </SectionCard>

        <SectionCard title="Contact Outreach Queue" count={outreachDue.length} color="#ec4899" tabId="contacts" emptyMsg="All contacts recently touched — great work.">
          {outreachDue.slice(0,5).map(c => {
            const days = c.lastContact ? Math.floor((now - new Date(c.lastContact+"T00:00:00")) / 86400000) : null;
            return <ItemRow key={c.id} label={c.name} sub={`${c.company} · ${c.relationshipLevel}`} badge={days !== null ? `${days}d since contact` : "Never contacted"} badgeColor="#ec4899"/>;
          })}
          {outreachDue.length > 5 && <div style={{ color:"#475569", fontSize:10 }}>+{outreachDue.length-5} more — go to Contacts tab</div>}
        </SectionCard>

        {staleListings.length > 0 && (
          <SectionCard title="Listings Needing Attention" count={staleListings.length} color="#f97316" tabId="listings" emptyMsg="">
            {staleListings.slice(0,4).map(l => (
              <ItemRow key={l.id} label={l.name} sub={`${l.submarket} · ${l.sqft?.toLocaleString()} SF`} badge="No showings 30d+" badgeColor="#f97316"/>
            ))}
          </SectionCard>
        )}

        {upcomingExpirations.length > 0 && (
          <SectionCard title="Lease Expirations — Next 12mo" count={upcomingExpirations.length} color="#ec4899" tabId="lease-radar" emptyMsg="">
            {upcomingExpirations.slice(0,4).map(d => {
              const days = Math.floor((new Date(d.leaseExpiresDate + "T00:00:00") - now) / 86400000);
              return <ItemRow key={d.id} label={d.name} sub={`${d.client} · ${d.submarket}`} badge={days < 0 ? "Expired" : days < 90 ? `${days}d left` : `${Math.round(days/30)}mo left`} badgeColor={days < 90 ? "#ef4444" : days < 180 ? "#f59e0b" : "#60a5fa"}/>;
            })}
          </SectionCard>
        )}

        {/* Closing this month detail */}
        {closingThisMonth.length > 0 && (
          <SectionCard title="Closing This Month" count={closingThisMonth.length} color="#f59e0b" tabId="pipeline" emptyMsg="">
            {closingThisMonth.map(d => (
              <ItemRow key={d.id} label={d.name} sub={`${d.stage} · ${d.probability}% probability`} badge={fmt(d.weighted)} badgeColor="#f59e0b"/>
            ))}
          </SectionCard>
        )}
      </div>
    </div>
  );
}


// ── Underwriting Tab ────────────────────────────────────────────

// ── Underwriting Tab (FIXED VERSION) ────────────────────────────────────────────
// ── INSTITUTIONAL-GRADE INVESTMENT ANALYSIS & DEAL MODELER (Cushman/CBRE/JLL Style) ────────────────────────────────────────────

// ── Underwriting Tab — Institutional Grade ────────────────────────────────────
// Real IRR (Newton-Raphson), Rent Roll driven, Sensitivity Tables, Lease-up modeling

function calcIRR(cashFlows) {
  // Newton-Raphson IRR calculation
  let rate = 0.1;
  for (let i = 0; i < 100; i++) {
    let npv = 0, dnpv = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      npv  += cashFlows[t] / Math.pow(1 + rate, t);
      dnpv -= t * cashFlows[t] / Math.pow(1 + rate, t + 1);
    }
    if (Math.abs(dnpv) < 1e-10) break;
    const newRate = rate - npv / dnpv;
    if (Math.abs(newRate - rate) < 1e-8) { rate = newRate; break; }
    rate = newRate;
  }
  return isFinite(rate) ? rate * 100 : null;
}

function calcAnnualDebtService(loanAmount, annualRate, amortYears, ioYears = 0) {
  if (loanAmount <= 0 || annualRate <= 0) return { payment: 0, io: 0 };
  const monthlyRate = annualRate / 100 / 12;
  const ioPayment = loanAmount * monthlyRate * 12;
  if (amortYears <= 0) return { payment: ioPayment, io: ioPayment };
  const n = amortYears * 12;
  const monthly = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
  return { payment: monthly * 12, io: ioPayment };
}

function buildProjection(uwData, projYears) {
  const sqft = parseFloat(uwData.sqft) || 1;
  const purchasePrice = parseFloat(uwData.purchasePrice) || 0;
  const closingCosts  = parseFloat(uwData.closingCosts)  || 0;
  const capReserves   = parseFloat(uwData.capReserves)   || 0;
  const totalCost     = purchasePrice + closingCosts + capReserves;

  // Financing
  const loanAmt    = parseFloat(uwData.loanAmount)   || 0;
  const loanRate   = parseFloat(uwData.loanRate)      || 0;
  const amortYrs   = parseInt(uwData.amortYears)      || 25;
  const ioYrs      = parseInt(uwData.ioYears)         || 0;
  const equity     = totalCost - loanAmt;
  const { payment: fullADS, io: ioADS } = calcAnnualDebtService(loanAmt, loanRate, amortYrs);

  // Rent Roll → Year 1 GPR
  const rentRoll = uwData.rentRoll || [];
  const vacancyRate   = parseFloat(uwData.vacancyRate)   || 5;
  const otherIncome   = parseFloat(uwData.otherIncome)   || 0;
  const rentGrowth    = parseFloat(uwData.rentGrowth)    || 2.5;
  const opexGrowth    = parseFloat(uwData.opexGrowth)    || 2.0;
  const exitCapRate   = parseFloat(uwData.exitCapRate)   || 7.0;
  const saleExpPct    = parseFloat(uwData.saleExpenses)  || 1.0;

  // Year 1 GPR from rent roll
  const leaseUpPeriod = parseInt(uwData.leaseUpPeriod) || 0; // months to stabilize vacant space
  const baseGPR = rentRoll.reduce((s, t) => {
    const sf = parseFloat(t.sqft) || 0;
    const rent = parseFloat(t.rentPerSqft) || 0;
    return s + sf * rent;
  }, 0);

  // Operating expenses
  const opex = {
    tax:        parseFloat(uwData.realEstateTax) || 0,
    insurance:  parseFloat(uwData.insurance)     || 0,
    utilities:  parseFloat(uwData.utilities)     || 0,
    repairs:    parseFloat(uwData.repairs)        || 0,
    management: parseFloat(uwData.management)    || 0,
    cam:        parseFloat(uwData.cam)            || 0,
    reserves:   parseFloat(uwData.reserves)      || 0,
    other:      parseFloat(uwData.otherOpex)     || 0,
  };
  const totalBaseOpex = Object.values(opex).reduce((s, v) => s + v, 0);

  // TI/LC (tenant improvements & leasing commissions)
  const tiLcPerSf = parseFloat(uwData.tiLcPerSf) || 0;
  const tiLcTotal = tiLcPerSf * sqft;

  const years = [];
  let remainingBalance = loanAmt;
  const cashFlows = [-equity]; // Year 0 = equity out

  for (let yr = 1; yr <= projYears; yr++) {
    const isIO = yr <= ioYrs;
    const ads = isIO ? ioADS : fullADS;

    // Grow rents
    const gpr = baseGPR * Math.pow(1 + rentGrowth / 100, yr - 1);

    // Lease-up adjustment: ramp vacancy down over leaseUpPeriod
    let effectiveVacancy = vacancyRate;
    if (leaseUpPeriod > 0 && yr === 1) {
      // Year 1: blended vacancy (assume full vacant first N months)
      const startVac = parseFloat(uwData.currentVacancy) || vacancyRate;
      effectiveVacancy = ((startVac * leaseUpPeriod / 12) + (vacancyRate * (1 - leaseUpPeriod / 12)));
    }

    const vacLoss = gpr * effectiveVacancy / 100;
    const egi = gpr + otherIncome - vacLoss;
    const yearOpex = totalBaseOpex * Math.pow(1 + opexGrowth / 100, yr - 1);
    const noi = egi - yearOpex;

    // Principal paydown (simplified)
    const yearInterest = isIO ? remainingBalance * (loanRate / 100) : remainingBalance * (loanRate / 100);
    const yearADS = ads;
    const yearPrincipal = isIO ? 0 : Math.max(0, yearADS - yearInterest);
    remainingBalance = Math.max(0, remainingBalance - yearPrincipal);

    const cf = noi - yearADS;
    cashFlows.push(cf);

    years.push({
      yr, gpr, vacLoss, effectiveVacancy, egi, yearOpex, noi,
      ads: yearADS, interest: yearInterest, principal: yearPrincipal,
      cf, remainingBalance, isIO,
      capRateOnCost: totalCost > 0 ? noi / totalCost * 100 : 0,
    });
  }

  // Exit
  const exitNOI = years[projYears - 1]?.noi || 0;
  const exitValue = exitNOI / (exitCapRate / 100);
  const saleExpenses = exitValue * saleExpPct / 100;
  const exitProceedsGross = exitValue - saleExpenses;
  const exitProceedsNet = exitProceedsGross - remainingBalance;

  cashFlows[cashFlows.length - 1] += exitProceedsNet; // Add exit proceeds to final year CF

  const cumulativeCF = years.reduce((s, y) => s + y.cf, 0);
  const totalReturn = cumulativeCF + exitProceedsNet;
  const equityMultiple = equity > 0 ? (equity + totalReturn) / equity : 0;
  const irr = calcIRR(cashFlows);

  // Year 1 metrics
  const y1 = years[0] || {};
  const capRate = purchasePrice > 0 ? (y1.noi || 0) / purchasePrice * 100 : 0;
  const capRateOnCost = totalCost > 0 ? (y1.noi || 0) / totalCost * 100 : 0;
  const dscr = fullADS > 0 ? (y1.noi || 0) / fullADS : 0;
  const coc = equity > 0 ? (y1.cf || 0) / equity * 100 : 0;
  const ltv = purchasePrice > 0 ? loanAmt / purchasePrice * 100 : 0;
  const ltc = totalCost > 0 ? loanAmt / totalCost * 100 : 0;

  return {
    years, cashFlows, equity, totalCost, loanAmt,
    capRate, capRateOnCost, dscr, coc, ltv, ltc,
    exitValue, exitProceedsNet, totalReturn, equityMultiple, irr,
    fullADS, ioADS, tiLcTotal,
    pricePerSqft: purchasePrice / sqft,
    rentPerSqft: baseGPR / sqft,
    y1,
  };
}

function buildSensitivityTable(uwData, projYears, rowField, colField, rowValues, colValues) {
  return rowValues.map(rv => ({
    rowVal: rv,
    cols: colValues.map(cv => {
      const modified = { ...uwData, [rowField]: rv, [colField]: cv };
      const r = buildProjection(modified, projYears);
      return { colVal: cv, irr: r.irr, coc: r.y1?.cf / r.equity * 100, em: r.equityMultiple };
    })
  }));
}

function UnderwritingTab() {
  const [uwData, setUwData] = useState({
    propertyName: "Industrial Distribution Center",
    propertyType: "Distribution",
    location: "Indianapolis, IN",
    sqft: 150000,
    yearBuilt: 2015,
    clearHeight: 32,
    dockDoors: 20,

    // Acquisition
    purchasePrice: 15000000,
    closingCosts: 300000,
    capReserves: 150000,
    tiLcPerSf: 0,

    // Rent Roll
    rentRoll: [
      { id: 1, tenant: "Tenant A", sqft: 75000, rentPerSqft: 6.50, leaseExpiry: "2028-12-31", creditRating: "Investment Grade", type: "Industrial" },
      { id: 2, tenant: "Tenant B", sqft: 50000, rentPerSqft: 7.00, leaseExpiry: "2027-06-30", creditRating: "Good", type: "Industrial" },
      { id: 3, tenant: "Vacant",   sqft: 25000, rentPerSqft: 0,    leaseExpiry: "",            creditRating: "—",                type: "Industrial" },
    ],

    // Income assumptions
    vacancyRate: 5,
    currentVacancy: 16.7, // % currently vacant (drives lease-up)
    leaseUpPeriod: 6, // months to reach stabilized occupancy
    otherIncome: 0,
    rentGrowth: 3.0,
    opexGrowth: 2.5,

    // Financing
    loanAmount: 10500000,
    loanRate: 6.75,
    amortYears: 25,
    ioYears: 0,

    // Operating Expenses
    realEstateTax: 165000,
    insurance: 52500,
    utilities: 22500,
    repairs: 52500,
    management: 0, // will be % of EGI
    managementPct: 4,
    cam: 15000,
    reserves: 37500,
    otherOpex: 18000,

    // Exit
    exitCapRate: 6.75,
    saleExpenses: 1.5,
    holdingPeriod: 5,
  });

  const set = (k, v) => setUwData(p => ({ ...p, [k]: v }));
  const [activeTab, setActiveTab] = useState("rentroll");
  const [projYears, setProjYears] = useState(5);
  const [sensMetric, setSensMetric] = useState("irr");
  const [showProposal, setShowProposal] = useState(false);

  // Compute management from %
  const computedUwData = useMemo(() => {
    const mgmtPct = parseFloat(uwData.managementPct) || 0;
    if (mgmtPct > 0) {
      const sqft = parseFloat(uwData.sqft) || 0;
      const gpr = uwData.rentRoll.reduce((s, t) => s + (parseFloat(t.sqft)||0) * (parseFloat(t.rentPerSqft)||0), 0);
      const vacLoss = gpr * (parseFloat(uwData.vacancyRate)||5) / 100;
      const egi = gpr + (parseFloat(uwData.otherIncome)||0) - vacLoss;
      return { ...uwData, management: egi * mgmtPct / 100 };
    }
    return uwData;
  }, [uwData]);

  const proj = useMemo(() => buildProjection(computedUwData, projYears), [computedUwData, projYears]);

  // Sensitivity: exit cap rate (rows) × rent growth (cols)
  const exitCapRates = [5.5, 6.0, 6.5, 7.0, 7.5, 8.0];
  const rentGrowths  = [1.0, 2.0, 3.0, 4.0, 5.0];
  const sensTable = useMemo(() =>
    buildSensitivityTable(computedUwData, projYears, "exitCapRate", "rentGrowth", exitCapRates, rentGrowths),
  [computedUwData, projYears]);

  // Rent roll helpers
  const addTenant = () => set("rentRoll", [...uwData.rentRoll, { id: Date.now(), tenant: "New Tenant", sqft: 10000, rentPerSqft: 6.50, leaseExpiry: "", creditRating: "Good", type: "Industrial" }]);
  const updateTenant = (id, field, val) => set("rentRoll", uwData.rentRoll.map(t => t.id === id ? { ...t, [field]: val } : t));
  const removeTenant = (id) => set("rentRoll", uwData.rentRoll.filter(t => t.id !== id));

  const totalLeasedSF = uwData.rentRoll.filter(t => (parseFloat(t.rentPerSqft)||0) > 0).reduce((s,t) => s + (parseFloat(t.sqft)||0), 0);
  const totalVacantSF = (parseFloat(uwData.sqft)||0) - totalLeasedSF;
  const occupancy = uwData.sqft > 0 ? totalLeasedSF / uwData.sqft * 100 : 0;
  const waltYears = (() => {
    const occupied = uwData.rentRoll.filter(t => t.leaseExpiry && (parseFloat(t.rentPerSqft)||0) > 0);
    if (!occupied.length) return 0;
    const now = new Date();
    const totalSF = occupied.reduce((s,t) => s + (parseFloat(t.sqft)||0), 0);
    const wt = occupied.reduce((s,t) => {
      const exp = new Date(t.leaseExpiry + "T00:00:00");
      const yrs = Math.max(0, (exp - now) / (365.25 * 86400000));
      return s + yrs * (parseFloat(t.sqft)||0);
    }, 0);
    return totalSF > 0 ? wt / totalSF : 0;
  })();

  const inp = (extra = {}) => ({
    background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: DS.r.sm,
    color: DS.text, padding: "8px 10px", fontSize: DS.fs.md, outline: "none",
    width: "100%", boxSizing: "border-box", ...extra
  });
  const lbl = (t) => <div style={{ color: DS.textMute, fontSize: DS.fs.xs, fontWeight: DS.fw.bold, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t}</div>;
  const metricCard = (label, value, color, sub) => (
    <div style={{ background: DS.panelHi, border: `1px solid ${DS.border}`, borderRadius: DS.r.md, padding: "14px 16px", flex: 1, minWidth: 120 }}>
      <div style={{ color: DS.textMute, fontSize: 10, fontWeight: DS.fw.bold, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6 }}>{label}</div>
      <div style={{ color: color || DS.accent, fontSize: DS.fs.h2, fontWeight: DS.fw.black, fontFamily: "'DM Mono', monospace", letterSpacing: "-0.5px" }}>{value}</div>
      {sub && <div style={{ color: DS.textFaint, fontSize: 10, marginTop: 4 }}>{sub}</div>}
    </div>
  );
  const sectionHead = (t) => (
    <div style={{ color: DS.textMute, fontSize: DS.fs.xs, fontWeight: DS.fw.black, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10, marginTop: 6, paddingBottom: 6, borderBottom: `1px solid ${DS.border}` }}>{t}</div>
  );

  const TABS = [
    { id: "rentroll", label: "Rent Roll" },
    { id: "income", label: "Income & Expenses" },
    { id: "financing", label: "Financing" },
    { id: "projection", label: "Cash Flow Projection" },
    { id: "sensitivity", label: "Sensitivity" },
    { id: "summary", label: "Returns Summary" },
  ];

  const irrColor = (irr) => !irr ? DS.textMute : irr >= 15 ? DS.green : irr >= 10 ? DS.accent : DS.red;
  const cocColor = (coc) => coc >= 8 ? DS.green : coc >= 5 ? DS.accent : DS.red;

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
        <div>
          <div style={{ color: DS.text, fontSize: DS.fs.h1, fontWeight: DS.fw.black, letterSpacing: "-0.5px" }}>Investment Underwriting</div>
          <div style={{ color: DS.textMute, fontSize: DS.fs.sm, marginTop: 3 }}>Institutional-grade analysis · Rent roll driven · Real IRR</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ color: DS.textMute, fontSize: DS.fs.xs }}>Projection:</div>
          {[3,5,7,10].map(y => (
            <button key={y} onClick={() => setProjYears(y)}
              style={{ background: projYears === y ? DS.accent : DS.panel, border: `1px solid ${projYears === y ? DS.accent : DS.border}`, color: projYears === y ? "#0a0f1a" : DS.textSub, padding: "4px 12px", borderRadius: DS.r.full, fontSize: DS.fs.xs, fontWeight: DS.fw.bold, cursor: "pointer" }}>
              {y}yr
            </button>
          ))}
          <button onClick={() => setShowProposal(true)}
            style={{ background: DS.blue, border: "none", color: "#fff", padding: "6px 16px", borderRadius: DS.r.sm, cursor: "pointer", fontSize: DS.fs.sm, fontWeight: DS.fw.black, marginLeft: 8 }}>
            📄 LOI / Proposal
          </button>
        </div>
      </div>

      {/* Property Summary Row */}
      <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.lg, padding: "14px 18px", marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 2, minWidth: 200 }}>
          <input value={uwData.propertyName} onChange={e => set("propertyName", e.target.value)}
            style={{ background: "none", border: "none", color: DS.text, fontSize: DS.fs.h2, fontWeight: DS.fw.black, outline: "none", width: "100%" }} />
          <div style={{ color: DS.textMute, fontSize: DS.fs.sm, marginTop: 2 }}>{uwData.location} · {uwData.yearBuilt ? `Built ${uwData.yearBuilt}` : ""} · {parseInt(uwData.sqft||0).toLocaleString()} SF</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {metricCard("Purchase Price", `$${(parseFloat(uwData.purchasePrice)||0).toLocaleString()}`, DS.text)}
          {metricCard("Price/SF", `$${proj.pricePerSqft.toFixed(2)}`, DS.textSub)}
          {metricCard("Occupancy", `${occupancy.toFixed(1)}%`, occupancy >= 90 ? DS.green : occupancy >= 75 ? DS.accent : DS.red, `WALT ${waltYears.toFixed(1)}yr`)}
          {metricCard("Y1 Cap Rate", `${proj.capRate.toFixed(2)}%`, proj.capRate >= 6 ? DS.green : proj.capRate >= 5 ? DS.accent : DS.red, `${proj.capRateOnCost.toFixed(2)}% on cost`)}
          {metricCard("IRR", proj.irr != null ? `${proj.irr.toFixed(1)}%` : "—", irrColor(proj.irr), `${projYears}yr hold`)}
          {metricCard("Equity Multiple", `${proj.equityMultiple.toFixed(2)}x`, proj.equityMultiple >= 2 ? DS.green : proj.equityMultiple >= 1.5 ? DS.accent : DS.red)}
        </div>
      </div>

      {/* Tab Nav */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: `1px solid ${DS.border}`, paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ background: "none", border: "none", borderBottom: activeTab === t.id ? `2px solid ${DS.accent}` : "2px solid transparent", color: activeTab === t.id ? DS.accent : DS.textMute, padding: "8px 16px", cursor: "pointer", fontSize: DS.fs.md, fontWeight: activeTab === t.id ? DS.fw.bold : DS.fw.normal, marginBottom: -1 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── RENT ROLL TAB ── */}
      {activeTab === "rentroll" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Property specs */}
          <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.lg, padding: "16px 18px" }}>
            {sectionHead("Property Information")}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
              <div>{lbl("Building SF")}<input type="number" value={uwData.sqft} onChange={e => set("sqft", e.target.value)} style={inp()} /></div>
              <div>{lbl("Property Type")}<input value={uwData.propertyType} onChange={e => set("propertyType", e.target.value)} style={inp()} /></div>
              <div>{lbl("Location")}<input value={uwData.location} onChange={e => set("location", e.target.value)} style={inp()} /></div>
              <div>{lbl("Year Built")}<input type="number" value={uwData.yearBuilt} onChange={e => set("yearBuilt", e.target.value)} style={inp()} /></div>
              <div>{lbl("Clear Height (ft)")}<input type="number" value={uwData.clearHeight} onChange={e => set("clearHeight", e.target.value)} style={inp()} /></div>
              <div>{lbl("Dock Doors")}<input type="number" value={uwData.dockDoors} onChange={e => set("dockDoors", e.target.value)} style={inp()} /></div>
            </div>
          </div>

          {/* Rent Roll */}
          <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.lg, padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              {sectionHead("Rent Roll")}
              <button onClick={addTenant} style={{ background: DS.accentSoft, border: `1px solid ${DS.accent}44`, color: DS.accent, padding: "5px 14px", borderRadius: DS.r.sm, cursor: "pointer", fontSize: DS.fs.xs, fontWeight: DS.fw.bold }}>+ Add Tenant</button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: DS.bg }}>
                    {["Tenant", "SF", "Rent/SF/Yr", "Ann. Rent", "Lease Expiry", "WALT", "Credit", "Type", ""].map(h => (
                      <th key={h} style={{ color: DS.textMute, fontSize: 10, fontWeight: DS.fw.bold, textAlign: "left", padding: "8px 10px", letterSpacing: "0.5px", textTransform: "uppercase", borderBottom: `1px solid ${DS.border}`, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {uwData.rentRoll.map(t => {
                    const sf = parseFloat(t.sqft) || 0;
                    const rpsf = parseFloat(t.rentPerSqft) || 0;
                    const annRent = sf * rpsf;
                    const isVacant = rpsf === 0;
                    const walt = t.leaseExpiry && !isVacant ? Math.max(0, (new Date(t.leaseExpiry+"T00:00:00") - new Date()) / (365.25 * 86400000)) : 0;
                    const creditColors = { "Investment Grade": DS.green, "Good": DS.blue, "Average": DS.accent, "Below Average": DS.red, "—": DS.textFaint };
                    return (
                      <tr key={t.id} style={{ borderBottom: `1px solid ${DS.border}`, background: isVacant ? DS.red + "08" : "transparent" }}>
                        <td style={{ padding: "8px 10px" }}>
                          <input value={t.tenant} onChange={e => updateTenant(t.id, "tenant", e.target.value)} style={{ ...inp({ width: 150 }) }} />
                        </td>
                        <td style={{ padding: "8px 10px" }}>
                          <input type="number" value={t.sqft} onChange={e => updateTenant(t.id, "sqft", e.target.value)} style={inp({ width: 90, textAlign: "right" })} />
                        </td>
                        <td style={{ padding: "8px 10px" }}>
                          <input type="number" value={t.rentPerSqft} step="0.25" onChange={e => updateTenant(t.id, "rentPerSqft", e.target.value)} style={inp({ width: 80, textAlign: "right", color: isVacant ? DS.textFaint : DS.text })} placeholder="0 = vacant" />
                        </td>
                        <td style={{ padding: "8px 10px", color: isVacant ? DS.red : DS.accent, fontWeight: DS.fw.bold, fontSize: DS.fs.md, fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap" }}>
                          {isVacant ? "VACANT" : `$${Math.round(annRent).toLocaleString()}`}
                        </td>
                        <td style={{ padding: "8px 10px" }}>
                          <input type="date" value={t.leaseExpiry} onChange={e => updateTenant(t.id, "leaseExpiry", e.target.value)} style={inp({ width: 130 })} disabled={isVacant} />
                        </td>
                        <td style={{ padding: "8px 10px", color: isVacant ? DS.textFaint : walt < 1 ? DS.red : walt < 2 ? DS.accent : DS.green, fontSize: DS.fs.sm, fontWeight: DS.fw.bold, fontFamily: "'DM Mono', monospace" }}>
                          {isVacant ? "—" : `${walt.toFixed(1)}yr`}
                        </td>
                        <td style={{ padding: "8px 10px" }}>
                          <select value={t.creditRating} onChange={e => updateTenant(t.id, "creditRating", e.target.value)}
                            style={{ ...inp({ width: 150, color: creditColors[t.creditRating] || DS.text }) }}>
                            {["Investment Grade", "Good", "Average", "Below Average", "—"].map(c => <option key={c}>{c}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: "8px 10px" }}>
                          <input value={t.type} onChange={e => updateTenant(t.id, "type", e.target.value)} style={inp({ width: 110 })} />
                        </td>
                        <td style={{ padding: "8px 10px" }}>
                          <button onClick={() => removeTenant(t.id)} style={{ background: "none", border: "none", color: DS.red, cursor: "pointer", fontSize: 14 }}>×</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: DS.bg, borderTop: `2px solid ${DS.border}` }}>
                    <td style={{ padding: "10px", color: DS.textSub, fontWeight: DS.fw.bold }}>TOTAL / WEIGHTED</td>
                    <td style={{ padding: "10px", color: DS.text, fontWeight: DS.fw.black, fontFamily: "'DM Mono', monospace" }}>
                      {uwData.rentRoll.reduce((s,t) => s+(parseFloat(t.sqft)||0), 0).toLocaleString()} SF
                    </td>
                    <td style={{ padding: "10px", color: DS.textSub, fontFamily: "'DM Mono', monospace" }}>
                      ${(uwData.rentRoll.reduce((s,t) => {const sf=parseFloat(t.sqft)||0; return s+(parseFloat(t.rentPerSqft)||0)*sf;},0) / Math.max(1, uwData.rentRoll.filter(t=>(parseFloat(t.rentPerSqft)||0)>0).reduce((s,t)=>s+(parseFloat(t.sqft)||0),0))).toFixed(2)} wtd avg
                    </td>
                    <td style={{ padding: "10px", color: DS.accent, fontWeight: DS.fw.black, fontFamily: "'DM Mono', monospace" }}>
                      ${Math.round(uwData.rentRoll.reduce((s,t) => s+(parseFloat(t.sqft)||0)*(parseFloat(t.rentPerSqft)||0),0)).toLocaleString()}
                    </td>
                    <td colSpan={3} style={{ padding: "10px", color: DS.textMute, fontSize: DS.fs.xs }}>
                      {occupancy.toFixed(1)}% occupied · WALT {waltYears.toFixed(1)} years
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Lease expiry bar chart */}
            <div style={{ marginTop: 16 }}>
              <div style={{ color: DS.textMute, fontSize: DS.fs.xs, fontWeight: DS.fw.bold, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 8 }}>Lease Expiry Schedule</div>
              <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 60 }}>
                {[...Array(7)].map((_, i) => {
                  const yr = new Date().getFullYear() + i;
                  const expSF = uwData.rentRoll.filter(t => t.leaseExpiry && new Date(t.leaseExpiry).getFullYear() === yr)
                    .reduce((s,t) => s+(parseFloat(t.sqft)||0), 0);
                  const pct = parseFloat(uwData.sqft) > 0 ? expSF / parseFloat(uwData.sqft) * 100 : 0;
                  const color = pct > 30 ? DS.red : pct > 15 ? DS.accent : DS.green;
                  return (
                    <div key={yr} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <div style={{ color: DS.textMute, fontSize: 9 }}>{pct > 0 ? `${pct.toFixed(0)}%` : ""}</div>
                      <div style={{ width: "100%", height: `${Math.max(4, pct * 0.6)}px`, background: pct > 0 ? color : DS.border, borderRadius: 3 }} />
                      <div style={{ color: DS.textFaint, fontSize: 9 }}>{yr}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Lease-Up Settings */}
          <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.lg, padding: "16px 18px" }}>
            {sectionHead("Lease-Up & Vacancy Assumptions")}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
              <div>{lbl("Stabilized Vacancy (%)")}<input type="number" value={uwData.vacancyRate} onChange={e => set("vacancyRate", e.target.value)} style={inp()} /></div>
              <div>{lbl("Current Vacancy (%)")}<input type="number" value={uwData.currentVacancy} onChange={e => set("currentVacancy", e.target.value)} style={inp()} /></div>
              <div>{lbl("Lease-Up Period (months)")}<input type="number" value={uwData.leaseUpPeriod} onChange={e => set("leaseUpPeriod", e.target.value)} style={inp()} /></div>
              <div>{lbl("TI / LC per SF ($)")}<input type="number" value={uwData.tiLcPerSf} onChange={e => set("tiLcPerSf", e.target.value)} style={inp()} /></div>
              <div>{lbl("Other Income ($/yr)")}<input type="number" value={uwData.otherIncome} onChange={e => set("otherIncome", e.target.value)} style={inp()} /></div>
            </div>
            {parseFloat(uwData.tiLcPerSf) > 0 && (
              <div style={{ marginTop: 10, background: DS.bg, borderRadius: DS.r.sm, padding: "8px 12px", color: DS.accent, fontSize: DS.fs.sm }}>
                Estimated TI/LC: <strong>${Math.round(proj.tiLcTotal).toLocaleString()}</strong> ({`$${uwData.tiLcPerSf}/SF × ${parseInt(uwData.sqft).toLocaleString()} SF`})
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── INCOME & EXPENSES TAB ── */}
      {activeTab === "income" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Income */}
            <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.lg, padding: "16px 18px" }}>
              {sectionHead("Income Assumptions")}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>{lbl("Rent Growth (%/yr)")}<input type="number" value={uwData.rentGrowth} step="0.25" onChange={e => set("rentGrowth", e.target.value)} style={inp()} /></div>
                <div>{lbl("Vacancy Rate (%)")}<input type="number" value={uwData.vacancyRate} step="0.5" onChange={e => set("vacancyRate", e.target.value)} style={inp()} /></div>
                <div>{lbl("Other Income ($/yr)")}<input type="number" value={uwData.otherIncome} onChange={e => set("otherIncome", e.target.value)} style={inp()} /></div>
              </div>

              {/* Year 1 Income Summary */}
              <div style={{ marginTop: 16, background: DS.bg, borderRadius: DS.r.sm, overflow: "hidden" }}>
                {[
                  { label: "Gross Potential Rent", value: proj.y1?.gpr, color: DS.text },
                  { label: `Vacancy Loss (${uwData.vacancyRate}%)`, value: -(proj.y1?.vacLoss || 0), color: DS.red },
                  { label: "Other Income", value: parseFloat(uwData.otherIncome)||0, color: DS.textSub },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderBottom: `1px solid ${DS.border}` }}>
                    <span style={{ color: DS.textSub, fontSize: DS.fs.sm }}>{row.label}</span>
                    <span style={{ color: row.color, fontFamily: "'DM Mono', monospace", fontWeight: DS.fw.bold }}>
                      {row.value >= 0 ? "$" : "−$"}{Math.round(Math.abs(row.value)).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: DS.panelHi }}>
                  <span style={{ color: DS.text, fontSize: DS.fs.md, fontWeight: DS.fw.black }}>Effective Gross Income</span>
                  <span style={{ color: DS.accent, fontFamily: "'DM Mono', monospace", fontWeight: DS.fw.black, fontSize: DS.fs.lg }}>${Math.round(proj.y1?.egi || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Expenses */}
            <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.lg, padding: "16px 18px" }}>
              {sectionHead("Operating Expenses (T-12 Annual)")}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  ["Real Estate Tax", "realEstateTax"],
                  ["Insurance", "insurance"],
                  ["Utilities", "utilities"],
                  ["Repairs & Maint.", "repairs"],
                  ["CAM / Landscaping", "cam"],
                  ["Reserves", "reserves"],
                  ["Other OpEx", "otherOpex"],
                ].map(([label, key]) => (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: DS.textSub, fontSize: DS.fs.sm, flex: 1 }}>{label}</span>
                    <input type="number" value={uwData[key]} onChange={e => set(key, e.target.value)}
                      style={{ ...inp({ width: 110, textAlign: "right" }) }} />
                  </div>
                ))}
                {/* Management as % */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: DS.textSub, fontSize: DS.fs.sm, flex: 1 }}>Property Mgmt</span>
                  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    <input type="number" value={uwData.managementPct} step="0.5" onChange={e => set("managementPct", e.target.value)}
                      style={{ ...inp({ width: 55, textAlign: "right" }) }} />
                    <span style={{ color: DS.textMute, fontSize: DS.fs.xs }}>% EGI</span>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 12, background: DS.bg, borderRadius: DS.r.sm, padding: "10px 12px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: DS.text, fontWeight: DS.fw.black }}>Total OpEx</span>
                <span style={{ color: DS.red, fontFamily: "'DM Mono', monospace", fontWeight: DS.fw.black }}>${Math.round(proj.y1?.yearOpex || 0).toLocaleString()}</span>
              </div>
              <div style={{ marginTop: 6, background: DS.greenSoft, border: `1px solid ${DS.green}33`, borderRadius: DS.r.sm, padding: "10px 12px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: DS.green, fontWeight: DS.fw.black }}>Year 1 NOI</span>
                <span style={{ color: DS.green, fontFamily: "'DM Mono', monospace", fontWeight: DS.fw.black, fontSize: DS.fs.lg }}>${Math.round(proj.y1?.noi || 0).toLocaleString()}</span>
              </div>
              <div style={{ marginTop: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 12px" }}>
                  <span style={{ color: DS.textMute, fontSize: DS.fs.xs }}>OpEx Ratio</span>
                  <span style={{ color: DS.textSub, fontSize: DS.fs.xs, fontFamily: "'DM Mono', monospace" }}>
                    {proj.y1?.egi > 0 ? `${((proj.y1.yearOpex / proj.y1.egi) * 100).toFixed(1)}%` : "—"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 12px" }}>
                  <span style={{ color: DS.textMute, fontSize: DS.fs.xs }}>OpEx Growth</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <input type="number" value={uwData.opexGrowth} step="0.25" onChange={e => set("opexGrowth", e.target.value)}
                      style={{ width: 50, background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: DS.r.sm, color: DS.text, padding: "2px 6px", fontSize: DS.fs.xs, outline: "none", textAlign: "right" }} />
                    <span style={{ color: DS.textFaint, fontSize: DS.fs.xs }}>%/yr</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Acquisition & Exit */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.lg, padding: "16px 18px" }}>
              {sectionHead("Acquisition Costs")}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>{lbl("Purchase Price ($)")}<input type="number" value={uwData.purchasePrice} onChange={e => set("purchasePrice", e.target.value)} style={inp()} /></div>
                <div>{lbl("Closing Costs ($)")}<input type="number" value={uwData.closingCosts} onChange={e => set("closingCosts", e.target.value)} style={inp()} /></div>
                <div>{lbl("Capital Reserves ($)")}<input type="number" value={uwData.capReserves} onChange={e => set("capReserves", e.target.value)} style={inp()} /></div>
              </div>
              <div style={{ marginTop: 12, background: DS.bg, borderRadius: DS.r.sm, padding: "10px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: DS.textSub }}>Total Acquisition Cost</span>
                  <span style={{ color: DS.text, fontFamily: "'DM Mono', monospace", fontWeight: DS.fw.black }}>${Math.round(proj.totalCost).toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ color: DS.textSub, fontSize: DS.fs.xs }}>Required Equity</span>
                  <span style={{ color: DS.accent, fontFamily: "'DM Mono', monospace" }}>${Math.round(proj.equity).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.lg, padding: "16px 18px" }}>
              {sectionHead("Exit Assumptions")}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>{lbl("Exit Cap Rate (%)")}<input type="number" value={uwData.exitCapRate} step="0.25" onChange={e => set("exitCapRate", e.target.value)} style={inp()} /></div>
                <div>{lbl("Sale Expenses (%)")}<input type="number" value={uwData.saleExpenses} step="0.25" onChange={e => set("saleExpenses", e.target.value)} style={inp()} /></div>
              </div>
              <div style={{ marginTop: 12, background: DS.bg, borderRadius: DS.r.sm, padding: "10px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: DS.textSub }}>Projected Exit Value</span>
                  <span style={{ color: DS.accent, fontFamily: "'DM Mono', monospace", fontWeight: DS.fw.black }}>${Math.round(proj.exitValue).toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ color: DS.textSub, fontSize: DS.fs.xs }}>Net Proceeds After Debt</span>
                  <span style={{ color: DS.green, fontFamily: "'DM Mono', monospace" }}>${Math.round(proj.exitProceedsNet).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FINANCING TAB ── */}
      {activeTab === "financing" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.lg, padding: "16px 18px" }}>
            {sectionHead("Loan Terms")}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>{lbl("Loan Amount ($)")}<input type="number" value={uwData.loanAmount} onChange={e => set("loanAmount", e.target.value)} style={inp()} /></div>
              <div>{lbl("Interest Rate (%)")}<input type="number" value={uwData.loanRate} step="0.125" onChange={e => set("loanRate", e.target.value)} style={inp()} /></div>
              <div>{lbl("Amortization (years)")}<input type="number" value={uwData.amortYears} onChange={e => set("amortYears", e.target.value)} style={inp()} /></div>
              <div>{lbl("Interest Only Period (years)")}<input type="number" value={uwData.ioYears} min="0" onChange={e => set("ioYears", e.target.value)} style={inp()} /></div>
            </div>
          </div>
          <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.lg, padding: "16px 18px" }}>
            {sectionHead("Financing Metrics")}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Loan Amount", value: `$${Math.round(proj.loanAmt).toLocaleString()}` },
                { label: "LTV", value: `${proj.ltv.toFixed(1)}%`, color: proj.ltv > 75 ? DS.red : DS.green },
                { label: "LTC", value: `${proj.ltc.toFixed(1)}%`, color: proj.ltc > 80 ? DS.red : DS.accent },
                { label: "Required Equity", value: `$${Math.round(proj.equity).toLocaleString()}`, color: DS.accent },
                { label: "Annual Debt Service (P&I)", value: `$${Math.round(proj.fullADS).toLocaleString()}`, color: DS.textSub },
                { label: "IO Annual Payment", value: proj.ioYears > 0 ? `$${Math.round(proj.ioADS).toLocaleString()}` : "N/A", color: DS.textMute },
                { label: "DSCR (Year 1)", value: proj.dscr.toFixed(2) + "x", color: proj.dscr >= 1.25 ? DS.green : proj.dscr >= 1.1 ? DS.accent : DS.red },
                { label: "Cash-on-Cash (Year 1)", value: `${proj.coc.toFixed(2)}%`, color: cocColor(proj.coc) },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: DS.bg, borderRadius: DS.r.sm }}>
                  <span style={{ color: DS.textSub, fontSize: DS.fs.sm }}>{row.label}</span>
                  <span style={{ color: row.color || DS.text, fontFamily: "'DM Mono', monospace", fontWeight: DS.fw.bold }}>{row.value}</span>
                </div>
              ))}
            </div>
            {proj.dscr < 1.25 && proj.dscr > 0 && (
              <div style={{ marginTop: 10, background: DS.red + "15", border: `1px solid ${DS.red}33`, borderRadius: DS.r.sm, padding: "8px 12px", color: DS.red, fontSize: DS.fs.xs, fontWeight: DS.fw.bold }}>
                ⚠ DSCR below 1.25x — most lenders require 1.20–1.30x minimum
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CASH FLOW PROJECTION TAB ── */}
      {activeTab === "projection" && (
        <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.lg, overflow: "hidden" }}>
          <div style={{ padding: "16px 18px", borderBottom: `1px solid ${DS.border}` }}>
            {sectionHead(`${projYears}-Year Cash Flow Projection`)}
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: DS.fs.sm }}>
              <thead>
                <tr style={{ background: DS.bg }}>
                  <th style={{ color: DS.textMute, fontSize: 10, fontWeight: DS.fw.bold, textAlign: "left", padding: "10px 14px", letterSpacing: "0.5px", textTransform: "uppercase", borderBottom: `1px solid ${DS.border}` }}>Metric</th>
                  {proj.years.map(y => (
                    <th key={y.yr} style={{ color: DS.textMute, fontSize: 10, fontWeight: DS.fw.bold, textAlign: "right", padding: "10px 14px", letterSpacing: "0.5px", textTransform: "uppercase", borderBottom: `1px solid ${DS.border}`, whiteSpace: "nowrap" }}>
                      Year {y.yr} {y.isIO ? <span style={{ color: DS.blue, fontSize: 8 }}>IO</span> : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Gross Potential Rent", key: "gpr", color: DS.text, fmt: v => `$${Math.round(v).toLocaleString()}` },
                  { label: "Vacancy Loss", key: "vacLoss", color: DS.red, fmt: v => `($${Math.round(v).toLocaleString()})` },
                  { label: "EGI", key: "egi", color: DS.accent, fmt: v => `$${Math.round(v).toLocaleString()}`, bold: true },
                  { label: "Operating Expenses", key: "yearOpex", color: DS.red, fmt: v => `($${Math.round(v).toLocaleString()})` },
                  { label: "NOI", key: "noi", color: DS.green, fmt: v => `$${Math.round(v).toLocaleString()}`, bold: true, borderTop: true },
                  { label: "Cap Rate (on cost)", key: "capRateOnCost", color: DS.textSub, fmt: v => `${v.toFixed(2)}%` },
                  { label: "Debt Service", key: "ads", color: DS.red, fmt: v => `($${Math.round(v).toLocaleString()})`, borderTop: true },
                  { label: "Cash Flow After Debt", key: "cf", color: null, fmt: v => `${v >= 0 ? "$" : "($"}${Math.round(Math.abs(v)).toLocaleString()}${v < 0 ? ")" : ""}`, bold: true, dynamic: true },
                ].map((row) => (
                  <tr key={row.label} style={{ borderBottom: `1px solid ${DS.border}`, borderTop: row.borderTop ? `2px solid ${DS.border}` : undefined }}>
                    <td style={{ padding: "9px 14px", color: DS.textSub, fontSize: DS.fs.sm, fontWeight: row.bold ? DS.fw.bold : DS.fw.normal, paddingLeft: row.bold ? 14 : 24 }}>{row.label}</td>
                    {proj.years.map(y => {
                      const val = y[row.key];
                      const color = row.dynamic ? (val >= 0 ? DS.green : DS.red) : row.color;
                      return (
                        <td key={y.yr} style={{ padding: "9px 14px", textAlign: "right", color: color || DS.textSub, fontFamily: "'DM Mono', monospace", fontWeight: row.bold ? DS.fw.black : DS.fw.normal, fontSize: DS.fs.sm }}>
                          {row.fmt(val)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Exit + Returns row */}
          <div style={{ padding: "16px 18px", borderTop: `2px solid ${DS.border}`, background: DS.bg, display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ color: DS.textMute, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 }}>Year {projYears} Exit Value</div>
              <div style={{ color: DS.accent, fontFamily: "'DM Mono', monospace", fontWeight: DS.fw.black, fontSize: DS.fs.h2 }}>${Math.round(proj.exitValue).toLocaleString()}</div>
              <div style={{ color: DS.textFaint, fontSize: DS.fs.xs }}>@ {uwData.exitCapRate}% exit cap · NOI ${Math.round(proj.years[projYears-1]?.noi||0).toLocaleString()}</div>
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <div style={{ color: DS.textMute, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 }}>Net Proceeds</div>
              <div style={{ color: DS.green, fontFamily: "'DM Mono', monospace", fontWeight: DS.fw.black, fontSize: DS.fs.h2 }}>${Math.round(proj.exitProceedsNet).toLocaleString()}</div>
              <div style={{ color: DS.textFaint, fontSize: DS.fs.xs }}>After debt payoff</div>
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <div style={{ color: DS.textMute, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 }}>IRR</div>
              <div style={{ color: irrColor(proj.irr), fontFamily: "'DM Mono', monospace", fontWeight: DS.fw.black, fontSize: DS.fs.h2 }}>
                {proj.irr != null ? `${proj.irr.toFixed(1)}%` : "—"}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <div style={{ color: DS.textMute, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 }}>Equity Multiple</div>
              <div style={{ color: proj.equityMultiple >= 2 ? DS.green : DS.accent, fontFamily: "'DM Mono', monospace", fontWeight: DS.fw.black, fontSize: DS.fs.h2 }}>{proj.equityMultiple.toFixed(2)}x</div>
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <div style={{ color: DS.textMute, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 }}>Cash-on-Cash Y1</div>
              <div style={{ color: cocColor(proj.coc), fontFamily: "'DM Mono', monospace", fontWeight: DS.fw.black, fontSize: DS.fs.h2 }}>{proj.coc.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      )}

      {/* ── SENSITIVITY TAB ── */}
      {activeTab === "sensitivity" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ color: DS.textMute, fontSize: DS.fs.sm }}>Show:</div>
            {[{id: "irr", label: "IRR"}, {id: "coc", label: "Cash-on-Cash Y1"}, {id: "em", label: "Equity Multiple"}].map(m => (
              <button key={m.id} onClick={() => setSensMetric(m.id)}
                style={{ background: sensMetric === m.id ? DS.accent : DS.panel, border: `1px solid ${sensMetric === m.id ? DS.accent : DS.border}`, color: sensMetric === m.id ? "#0a0f1a" : DS.textSub, padding: "5px 14px", borderRadius: DS.r.sm, cursor: "pointer", fontSize: DS.fs.sm, fontWeight: DS.fw.bold }}>
                {m.label}
              </button>
            ))}
          </div>

          {/* Sensitivity Table: exit cap rate vs rent growth */}
          <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.lg, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${DS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: DS.text, fontWeight: DS.fw.black, fontSize: DS.fs.lg }}>Sensitivity Analysis</div>
                <div style={{ color: DS.textMute, fontSize: DS.fs.xs, marginTop: 2 }}>Exit Cap Rate (rows) × Rent Growth % (columns) · {projYears}-yr hold</div>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: DS.bg }}>
                    <th style={{ padding: "10px 14px", color: DS.textMute, fontSize: 10, textAlign: "left", borderBottom: `1px solid ${DS.border}`, fontWeight: DS.fw.bold }}>
                      Exit Cap ↓ / Rent Growth →
                    </th>
                    {rentGrowths.map(rg => (
                      <th key={rg} style={{ padding: "10px 14px", color: Math.abs(rg - parseFloat(uwData.rentGrowth)) < 0.25 ? DS.accent : DS.textMute, fontSize: 10, textAlign: "center", borderBottom: `1px solid ${DS.border}`, fontWeight: DS.fw.bold, background: Math.abs(rg - parseFloat(uwData.rentGrowth)) < 0.25 ? DS.accentSoft : "transparent" }}>
                        {rg}%
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sensTable.map(row => {
                    const isBaseRow = Math.abs(row.rowVal - parseFloat(uwData.exitCapRate)) < 0.1;
                    return (
                      <tr key={row.rowVal} style={{ borderBottom: `1px solid ${DS.border}`, background: isBaseRow ? DS.accentSoft : "transparent" }}>
                        <td style={{ padding: "10px 14px", color: isBaseRow ? DS.accent : DS.textSub, fontWeight: isBaseRow ? DS.fw.black : DS.fw.normal, fontFamily: "'DM Mono', monospace", fontSize: DS.fs.sm }}>
                          {row.rowVal}%
                        </td>
                        {row.cols.map(cell => {
                          const val = cell[sensMetric];
                          const isBase = Math.abs(row.rowVal - parseFloat(uwData.exitCapRate)) < 0.1 && Math.abs(cell.colVal - parseFloat(uwData.rentGrowth)) < 0.25;
                          let color, bgColor;
                          if (sensMetric === "irr") {
                            color = val == null ? DS.textFaint : val >= 15 ? DS.green : val >= 12 ? "#86efac" : val >= 9 ? DS.accent : val >= 6 ? "#fbbf24" : DS.red;
                            bgColor = val == null ? "transparent" : val >= 15 ? DS.green + "20" : val >= 9 ? DS.accent + "15" : DS.red + "15";
                          } else if (sensMetric === "coc") {
                            color = val >= 8 ? DS.green : val >= 5 ? DS.accent : DS.red;
                            bgColor = val >= 8 ? DS.green + "18" : val >= 5 ? DS.accent + "12" : DS.red + "12";
                          } else {
                            color = val >= 2.5 ? DS.green : val >= 1.8 ? DS.accent : DS.red;
                            bgColor = val >= 2.5 ? DS.green + "18" : val >= 1.8 ? DS.accent + "12" : DS.red + "12";
                          }
                          return (
                            <td key={cell.colVal} style={{ padding: "10px 14px", textAlign: "center", color, background: isBase ? DS.accent + "30" : bgColor, fontFamily: "'DM Mono', monospace", fontWeight: isBase ? DS.fw.black : DS.fw.semi, fontSize: DS.fs.sm, border: isBase ? `1px solid ${DS.accent}` : undefined }}>
                              {val == null ? "—" : sensMetric === "irr" ? `${val.toFixed(1)}%` : sensMetric === "coc" ? `${val.toFixed(1)}%` : `${val.toFixed(2)}x`}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "10px 18px", borderTop: `1px solid ${DS.border}`, display: "flex", gap: 16 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <div style={{ width: 12, height: 12, background: DS.green + "40", border: `1px solid ${DS.green}`, borderRadius: 2 }} />
                <span style={{ color: DS.textMute, fontSize: DS.fs.xs }}>{sensMetric === "irr" ? "≥15% IRR" : sensMetric === "coc" ? "≥8% CoC" : "≥2.5x EM"}</span>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <div style={{ width: 12, height: 12, background: DS.accent + "30", border: `1px solid ${DS.accent}`, borderRadius: 2 }} />
                <span style={{ color: DS.textMute, fontSize: DS.fs.xs }}>Current assumption (highlighted)</span>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <div style={{ width: 12, height: 12, background: DS.red + "30", border: `1px solid ${DS.red}`, borderRadius: 2 }} />
                <span style={{ color: DS.textMute, fontSize: DS.fs.xs }}>{sensMetric === "irr" ? "<9% IRR" : sensMetric === "coc" ? "<5% CoC" : "<1.8x EM"}</span>
              </div>
            </div>
          </div>

          {/* DSCR sensitivity */}
          <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.lg, padding: "16px 18px" }}>
            <div style={{ color: DS.text, fontWeight: DS.fw.black, fontSize: DS.fs.lg, marginBottom: 12 }}>DSCR at Various Vacancy Rates</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[0, 5, 10, 15, 20, 25].map(vac => {
                const modData = { ...computedUwData, vacancyRate: vac };
                const r = buildProjection(modData, 1);
                const dscr = r.dscr;
                const color = dscr >= 1.25 ? DS.green : dscr >= 1.10 ? DS.accent : DS.red;
                const isCurrent = vac === parseFloat(uwData.vacancyRate);
                return (
                  <div key={vac} style={{ flex: 1, minWidth: 90, background: isCurrent ? DS.accentSoft : DS.bg, border: `1px solid ${isCurrent ? DS.accent : DS.border}`, borderRadius: DS.r.md, padding: "12px", textAlign: "center" }}>
                    <div style={{ color: DS.textMute, fontSize: 10 }}>{vac}% vac.</div>
                    <div style={{ color, fontFamily: "'DM Mono', monospace", fontWeight: DS.fw.black, fontSize: DS.fs.h2, marginTop: 4 }}>{dscr.toFixed(2)}x</div>
                    {dscr < 1.0 && <div style={{ color: DS.red, fontSize: 9, marginTop: 2 }}>NEGATIVE</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── RETURNS SUMMARY TAB ── */}
      {activeTab === "summary" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Key returns metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {[
              { label: "IRR", value: proj.irr != null ? `${proj.irr.toFixed(1)}%` : "N/A", color: irrColor(proj.irr), sub: `${projYears}-yr hold` },
              { label: "Equity Multiple", value: `${proj.equityMultiple.toFixed(2)}x`, color: proj.equityMultiple >= 2 ? DS.green : DS.accent, sub: `$${Math.round(proj.equity).toLocaleString()} → $${Math.round(proj.equity + proj.totalReturn).toLocaleString()}` },
              { label: "Cash-on-Cash Y1", value: `${proj.coc.toFixed(1)}%`, color: cocColor(proj.coc), sub: `$${Math.round(proj.y1?.cf||0).toLocaleString()}/yr` },
              { label: "Y1 Cap Rate", value: `${proj.capRate.toFixed(2)}%`, color: proj.capRate >= 6 ? DS.green : DS.accent, sub: `${proj.capRateOnCost.toFixed(2)}% on cost` },
              { label: "DSCR (Y1)", value: `${proj.dscr.toFixed(2)}x`, color: proj.dscr >= 1.25 ? DS.green : DS.red, sub: proj.dscr < 1.25 ? "⚠ Below 1.25x" : "Meets threshold" },
              { label: "LTV", value: `${proj.ltv.toFixed(1)}%`, color: proj.ltv > 75 ? DS.red : DS.green, sub: `$${Math.round(proj.loanAmt).toLocaleString()} loan` },
              { label: "Rent/SF (Y1)", value: `$${proj.rentPerSqft.toFixed(2)}`, color: DS.accent, sub: "Gross potential" },
              { label: "Price/SF", value: `$${proj.pricePerSqft.toFixed(2)}`, color: DS.textSub, sub: "Acquisition" },
            ].map(m => (
              <div key={m.label} style={{ background: DS.panelHi, border: `1px solid ${DS.border}`, borderRadius: DS.r.lg, padding: "16px 18px" }}>
                <div style={{ color: DS.textMute, fontSize: 10, fontWeight: DS.fw.bold, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6 }}>{m.label}</div>
                <div style={{ color: m.color, fontSize: DS.fs.h2, fontWeight: DS.fw.black, fontFamily: "'DM Mono', monospace" }}>{m.value}</div>
                <div style={{ color: DS.textFaint, fontSize: 10, marginTop: 4 }}>{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Sources & Uses */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.lg, padding: "16px 18px" }}>
              {sectionHead("Sources")}
              {[
                { label: "Senior Debt", value: proj.loanAmt, pct: proj.ltc, color: DS.blue },
                { label: "Equity", value: proj.equity, pct: 100 - proj.ltc, color: DS.accent },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ color: DS.textSub, fontSize: DS.fs.sm }}>{s.label}</span>
                      <span style={{ color: s.color, fontFamily: "'DM Mono', monospace", fontWeight: DS.fw.bold }}>${Math.round(s.value).toLocaleString()} ({s.pct.toFixed(1)}%)</span>
                    </div>
                    <div style={{ background: DS.border, borderRadius: 999, height: 6 }}>
                      <div style={{ width: `${Math.max(0, Math.min(100, s.pct))}%`, height: "100%", background: s.color, borderRadius: 999 }} />
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ borderTop: `1px solid ${DS.border}`, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: DS.text, fontWeight: DS.fw.black }}>Total</span>
                <span style={{ color: DS.text, fontFamily: "'DM Mono', monospace", fontWeight: DS.fw.black }}>${Math.round(proj.totalCost).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.lg, padding: "16px 18px" }}>
              {sectionHead("Uses")}
              {[
                { label: "Purchase Price", value: parseFloat(uwData.purchasePrice)||0, color: DS.text },
                { label: "Closing Costs", value: parseFloat(uwData.closingCosts)||0, color: DS.textSub },
                { label: "Capital Reserves", value: parseFloat(uwData.capReserves)||0, color: DS.textSub },
                { label: "TI / LC", value: proj.tiLcTotal, color: uwData.tiLcPerSf > 0 ? DS.accent : DS.textFaint },
              ].map(u => (
                <div key={u.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${DS.border}` }}>
                  <span style={{ color: DS.textSub, fontSize: DS.fs.sm }}>{u.label}</span>
                  <span style={{ color: u.color, fontFamily: "'DM Mono', monospace", fontWeight: DS.fw.semi }}>${Math.round(u.value).toLocaleString()}</span>
                </div>
              ))}
              <div style={{ paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: DS.text, fontWeight: DS.fw.black }}>Total Uses</span>
                <span style={{ color: DS.text, fontFamily: "'DM Mono', monospace", fontWeight: DS.fw.black }}>${Math.round(proj.totalCost + proj.tiLcTotal).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Investment thesis summary */}
          <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.lg, padding: "16px 18px" }}>
            {sectionHead("Quick Investment Thesis")}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { check: proj.capRate >= 5.5, pass: `Cap rate of ${proj.capRate.toFixed(2)}% is market competitive`, fail: `Cap rate of ${proj.capRate.toFixed(2)}% is below typical industrial market range` },
                { check: proj.dscr >= 1.25, pass: `DSCR of ${proj.dscr.toFixed(2)}x meets lender requirements`, fail: `DSCR of ${proj.dscr.toFixed(2)}x is below typical 1.25x lender requirement — may need more equity` },
                { check: proj.irr != null && proj.irr >= 12, pass: `IRR of ${proj.irr?.toFixed(1)}% exceeds typical 12% industrial hurdle`, fail: `IRR of ${proj.irr?.toFixed(1) || "N/A"}% is below typical 12% industrial return hurdle` },
                { check: proj.ltv <= 75, pass: `LTV of ${proj.ltv.toFixed(1)}% is within normal lender parameters`, fail: `LTV of ${proj.ltv.toFixed(1)}% is high — lenders typically cap at 65–75%` },
                { check: waltYears >= 3, pass: `WALT of ${waltYears.toFixed(1)} years provides meaningful lease stability`, fail: `WALT of ${waltYears.toFixed(1)} years is short — near-term re-leasing risk` },
                { check: occupancy >= 90, pass: `${occupancy.toFixed(0)}% occupancy provides stable income base`, fail: `${occupancy.toFixed(0)}% occupancy — lease-up risk, budget for vacancy carry costs` },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 10px", background: DS.bg, borderRadius: DS.r.sm, border: `1px solid ${DS.border}` }}>
                  <span style={{ color: item.check ? DS.green : DS.red, flexShrink: 0, marginTop: 1, fontSize: 14 }}>{item.check ? "✓" : "⚠"}</span>
                  <span style={{ color: item.check ? DS.textSub : DS.text, fontSize: DS.fs.sm }}>{item.check ? item.pass : item.fail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LOI / Proposal Generator Modal */}
      {showProposal && (
        <ProposalGeneratorModal
          uwData={uwData}
          proj={proj}
          waltYears={waltYears}
          occupancy={occupancy}
          projYears={projYears}
          onClose={() => setShowProposal(false)}
        />
      )}
    </div>
  );
}

// ── Proposal / LOI Generator Modal ─────────────────────────────────────────
function ProposalGeneratorModal({ uwData, proj, waltYears, occupancy, projYears, onClose }) {
  const [docType, setDocType] = useState("loi");
  const brokerName = localStorage.getItem("cre-broker-name") || "Broker";
  const brokerage  = localStorage.getItem("cre-brokerage")  || "SVN";
  const brokerEmail = localStorage.getItem("cre-email") || "";
  const brokerPhone = localStorage.getItem("cre-phone") || "";

  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const printDoc = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    const content = docType === "loi" ? generateLOI() : generateInvestmentMemo();
    win.document.write(content);
    win.document.close();
  };

  const generateLOI = () => `<!DOCTYPE html><html><head><meta charset='utf-8'><title>Letter of Intent — ${uwData.propertyName}</title>
  <style>body{font-family:'Times New Roman',serif;max-width:750px;margin:48px auto;color:#1a1a1a;line-height:1.6}
  h1{font-size:22px;text-align:center;border-bottom:2px solid #333;padding-bottom:10px;margin-bottom:24px}
  h2{font-size:14px;font-weight:bold;margin:20px 0 6px;text-transform:uppercase;letter-spacing:0.5px}
  .header-block{text-align:right;margin-bottom:32px;font-size:13px}
  .section{margin-bottom:18px}p{margin:6px 0;font-size:13px}
  .term-table{width:100%;border-collapse:collapse;margin:12px 0}
  .term-table td{padding:7px 12px;border:1px solid #ccc;font-size:13px}
  .term-table td:first-child{font-weight:bold;width:40%;background:#f5f5f5}
  .sig-block{margin-top:48px;display:flex;gap:80px}
  .sig-line{border-top:1px solid #333;padding-top:6px;font-size:12px;min-width:200px}
  @media print{button{display:none}}</style></head><body>
  <div class='header-block'>${today}<br/>${brokerage}<br/>${brokerName}${brokerEmail?'<br/>'+brokerEmail:''}${brokerPhone?'<br/>'+brokerPhone:''}</div>
  <h1>LETTER OF INTENT — ACQUISITION<br/>${uwData.propertyName}</h1>
  <div class='section'><p>This Letter of Intent ("LOI") is submitted on behalf of the Purchaser in connection with the proposed acquisition of the property described herein. This LOI is non-binding and subject to execution of a definitive Purchase and Sale Agreement.</p></div>
  <h2>Property</h2>
  <table class='term-table'>
    <tr><td>Property Name</td><td>${uwData.propertyName}</td></tr>
    <tr><td>Location</td><td>${uwData.location}</td></tr>
    <tr><td>Property Type</td><td>${uwData.propertyType}</td></tr>
    <tr><td>Building Size</td><td>${parseInt(uwData.sqft||0).toLocaleString()} SF</td></tr>
    <tr><td>Year Built</td><td>${uwData.yearBuilt || "—"}</td></tr>
    <tr><td>Clear Height</td><td>${uwData.clearHeight || "—"} feet</td></tr>
    <tr><td>Dock Doors</td><td>${uwData.dockDoors || "—"}</td></tr>
    <tr><td>Occupancy</td><td>${occupancy.toFixed(1)}% · WALT ${waltYears.toFixed(1)} years</td></tr>
  </table>
  <h2>Purchase Terms</h2>
  <table class='term-table'>
    <tr><td>Offered Purchase Price</td><td><strong>$${Math.round(parseFloat(uwData.purchasePrice)||0).toLocaleString()}</strong></td></tr>
    <tr><td>Price Per Square Foot</td><td>$${proj.pricePerSqft.toFixed(2)}/SF</td></tr>
    <tr><td>Year 1 NOI</td><td>$${Math.round(proj.y1?.noi||0).toLocaleString()}</td></tr>
    <tr><td>Going-In Cap Rate</td><td>${proj.capRate.toFixed(2)}%</td></tr>
    <tr><td>Earnest Money Deposit</td><td>$${Math.round((parseFloat(uwData.purchasePrice)||0)*0.01).toLocaleString()} (1% of purchase price)</td></tr>
    <tr><td>Due Diligence Period</td><td>30 days from contract execution</td></tr>
    <tr><td>Closing Period</td><td>30 days following expiration of due diligence</td></tr>
    <tr><td>Financing Contingency</td><td>${proj.loanAmt > 0 ? `Yes — Purchaser to arrange ${proj.ltv.toFixed(0)}% LTV financing` : "All cash — no financing contingency"}</td></tr>
  </table>
  <h2>Conditions</h2>
  <div class='section'><p>This LOI is subject to, among other things: (i) satisfactory completion of physical, environmental, and financial due diligence; (ii) review and approval of all leases, rent rolls, and operating statements; (iii) title review; and (iv) execution of a mutually acceptable Purchase and Sale Agreement.</p></div>
  <h2>Expiration</h2>
  <div class='section'><p>This offer shall expire if not accepted in writing within five (5) business days from the date hereof.</p></div>
  <div class='sig-block'>
    <div><div class='sig-line'>Purchaser Signature &amp; Date</div></div>
    <div><div class='sig-line'>Seller Signature &amp; Date</div></div>
  </div>
  <p style='margin-top:40px;font-size:11px;color:#666'>Prepared by: ${brokerName} · ${brokerage} · ${today} · This LOI is non-binding and for discussion purposes only.</p>
  <br/><button onclick='window.print()' style='background:#1a4f8a;color:#fff;border:none;padding:10px 24px;border-radius:6px;font-size:14px;cursor:pointer;font-weight:bold'>🖨 Print / Save as PDF</button>
  </body></html>`;

  const generateInvestmentMemo = () => `<!DOCTYPE html><html><head><meta charset='utf-8'><title>Investment Memo — ${uwData.propertyName}</title>
  <style>body{font-family:'Helvetica Neue',Arial,sans-serif;max-width:800px;margin:48px auto;color:#1a1a1a;line-height:1.6}
  h1{font-size:24px;font-weight:800;border-bottom:3px solid #1a4f8a;padding-bottom:10px;color:#1a4f8a}
  h2{font-size:14px;font-weight:700;margin:20px 0 8px;text-transform:uppercase;letter-spacing:1px;color:#1a4f8a;border-left:3px solid #1a4f8a;padding-left:8px}
  .metrics-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0}
  .metric-card{background:#f0f4f8;border-radius:6px;padding:12px;text-align:center}
  .metric-val{font-size:20px;font-weight:800;color:#1a4f8a;font-family:'Courier New',monospace}
  .metric-lbl{font-size:10px;color:#666;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-top:4px}
  table{width:100%;border-collapse:collapse;margin:10px 0}
  th{background:#1a4f8a;color:#fff;padding:8px 12px;text-align:left;font-size:12px}
  td{padding:7px 12px;border-bottom:1px solid #e0e0e0;font-size:12px}
  tr:nth-child(even) td{background:#f9f9f9}
  .footer{margin-top:40px;font-size:10px;color:#999;border-top:1px solid #ddd;padding-top:10px}
  @media print{button{display:none}}</style></head><body>
  <div style='display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px'>
    <h1>Investment Memo<br/>${uwData.propertyName}</h1>
    <div style='text-align:right;font-size:12px;color:#666'><strong>${brokerage}</strong><br/>${brokerName}<br/>${today}</div>
  </div>
  <div class='metrics-grid'>
    <div class='metric-card'><div class='metric-val'>$${(parseFloat(uwData.purchasePrice)/1000000).toFixed(2)}M</div><div class='metric-lbl'>Purchase Price</div></div>
    <div class='metric-card'><div class='metric-val'>${proj.capRate.toFixed(2)}%</div><div class='metric-lbl'>Going-In Cap Rate</div></div>
    <div class='metric-card'><div class='metric-val'>${proj.irr!=null?proj.irr.toFixed(1)+'%':'—'}</div><div class='metric-lbl'>${projYears||5}-Yr IRR</div></div>
    <div class='metric-card'><div class='metric-val'>${proj.equityMultiple.toFixed(2)}x</div><div class='metric-lbl'>Equity Multiple</div></div>
  </div>
  <h2>Property Overview</h2>
  <table>
    <tr><th>Attribute</th><th>Details</th><th>Attribute</th><th>Details</th></tr>
    <tr><td>Location</td><td>${uwData.location}</td><td>Type</td><td>${uwData.propertyType}</td></tr>
    <tr><td>Building Size</td><td>${parseInt(uwData.sqft||0).toLocaleString()} SF</td><td>Year Built</td><td>${uwData.yearBuilt||'—'}</td></tr>
    <tr><td>Clear Height</td><td>${uwData.clearHeight||'—'} ft</td><td>Dock Doors</td><td>${uwData.dockDoors||'—'}</td></tr>
    <tr><td>Occupancy</td><td>${occupancy.toFixed(1)}%</td><td>WALT</td><td>${waltYears.toFixed(1)} years</td></tr>
  </table>
  <h2>Rent Roll Summary</h2>
  <table>
    <tr><th>Tenant</th><th>SF</th><th>Rent/SF</th><th>Annual Rent</th><th>Lease Expiry</th><th>Credit</th></tr>
    ${uwData.rentRoll.map(t => `<tr><td>${t.tenant}</td><td>${parseInt(t.sqft||0).toLocaleString()}</td><td>${(parseFloat(t.rentPerSqft)||0)>0?'$'+(parseFloat(t.rentPerSqft)).toFixed(2):'VACANT'}</td><td>${(parseFloat(t.rentPerSqft)||0)>0?'$'+Math.round((parseFloat(t.sqft)||0)*(parseFloat(t.rentPerSqft)||0)).toLocaleString():'—'}</td><td>${t.leaseExpiry||'—'}</td><td>${t.creditRating}</td></tr>`).join('')}
  </table>
  <h2>Financial Highlights</h2>
  <table>
    <tr><th>Metric</th><th>Value</th><th>Metric</th><th>Value</th></tr>
    <tr><td>Year 1 GPR</td><td>$${Math.round(proj.y1?.gpr||0).toLocaleString()}</td><td>Year 1 NOI</td><td>$${Math.round(proj.y1?.noi||0).toLocaleString()}</td></tr>
    <tr><td>Year 1 EGI</td><td>$${Math.round(proj.y1?.egi||0).toLocaleString()}</td><td>Cash-on-Cash</td><td>${proj.coc.toFixed(2)}%</td></tr>
    <tr><td>Loan Amount</td><td>$${Math.round(proj.loanAmt).toLocaleString()}</td><td>LTV</td><td>${proj.ltv.toFixed(1)}%</td></tr>
    <tr><td>DSCR</td><td>${proj.dscr.toFixed(2)}x</td><td>Exit Value</td><td>$${Math.round(proj.exitValue).toLocaleString()}</td></tr>
    <tr><td>Total Equity</td><td>$${Math.round(proj.equity).toLocaleString()}</td><td>Net Proceeds</td><td>$${Math.round(proj.exitProceedsNet).toLocaleString()}</td></tr>
  </table>
  <div class='footer'>Prepared by ${brokerName} · ${brokerage} · ${today} · This memo is for informational purposes only and does not constitute an offer or commitment. All projections are estimates and subject to change. Past performance is not indicative of future results.</div>
  <br/><button onclick='window.print()' style='background:#1a4f8a;color:#fff;border:none;padding:10px 24px;border-radius:6px;font-size:14px;cursor:pointer;font-weight:bold'>🖨 Print / Save as PDF</button>
  </body></html>`;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
      <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.xl, width: 560, boxShadow: DS.shadow.xl }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${DS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: DS.text, fontWeight: DS.fw.black, fontSize: DS.fs.h2 }}>Generate Document</div>
            <div style={{ color: DS.textMute, fontSize: DS.fs.sm, marginTop: 2 }}>{uwData.propertyName}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: DS.textMute, fontSize: 20, cursor: "pointer" }}>×</button>
        </div>
        <div style={{ padding: "24px" }}>
          <div style={{ color: DS.textMute, fontSize: DS.fs.xs, fontWeight: DS.fw.bold, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>Document Type</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
            {[
              { id: "loi", label: "Letter of Intent", desc: "Acquisition LOI with deal terms for seller" },
              { id: "memo", label: "Investment Memo", desc: "Investor-facing summary with full financials" },
            ].map(d => (
              <div key={d.id} onClick={() => setDocType(d.id)} style={{ flex: 1, background: docType === d.id ? DS.accentSoft : DS.bg, border: `1px solid ${docType === d.id ? DS.accent : DS.border}`, borderRadius: DS.r.lg, padding: "14px 16px", cursor: "pointer" }}>
                <div style={{ color: docType === d.id ? DS.accent : DS.text, fontWeight: DS.fw.bold, fontSize: DS.fs.md, marginBottom: 4 }}>{d.label}</div>
                <div style={{ color: DS.textMute, fontSize: DS.fs.xs }}>{d.desc}</div>
              </div>
            ))}
          </div>

          {/* Quick preview summary */}
          <div style={{ background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: DS.r.md, padding: "12px 14px", marginBottom: 20 }}>
            <div style={{ color: DS.textMute, fontSize: DS.fs.xs, fontWeight: DS.fw.bold, marginBottom: 8, textTransform: "uppercase" }}>Will include</div>
            <div style={{ color: DS.textSub, fontSize: DS.fs.sm, lineHeight: 1.8 }}>
              {docType === "loi" ? "Property details · Purchase price ($" + Math.round(parseFloat(uwData.purchasePrice)||0).toLocaleString() + ") · Cap rate · Earnest money · Due diligence & closing timeline · Financing terms · Conditions" : "Rent roll · Full financials · " + (uwData.holdingPeriod||5) + "-yr projection · IRR · Equity multiple · DSCR · Sensitivity overview"}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, background: "none", border: `1px solid ${DS.border}`, color: DS.textSub, padding: "10px", borderRadius: DS.r.sm, cursor: "pointer", fontSize: DS.fs.md }}>Cancel</button>
            <button onClick={printDoc} style={{ flex: 2, background: DS.accent, border: "none", color: "#0a0f1a", padding: "10px", borderRadius: DS.r.sm, cursor: "pointer", fontSize: DS.fs.md, fontWeight: DS.fw.black }}>
              🖨 Generate & Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// ── BOV Tab ─────────────────────────────────────────────────────
function BOVTab({ comps, submarketList, brokerName, brokerage }) {
  const smList = (submarketList || DEFAULT_SUBMARKETS).map(s => typeof s === "string" ? s : s.name);
  const brokerPhone   = localStorage.getItem("cre-phone")   || "";
  const brokerEmail   = localStorage.getItem("cre-email")   || "";
  const brokerLicense = localStorage.getItem("cre-license") || "";
  const defaultState  = localStorage.getItem("cre-default-state") || "Indiana";

  // ── Shared styles ─────────────────────────────────────────────
  const iS   = { background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: DS.r.sm, color: DS.text, padding: "7px 10px", fontSize: DS.fs.md, outline: "none", width: "100%", boxSizing: "border-box" };
  const iSsm = { background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: DS.r.sm, color: DS.text, padding: "5px 8px", fontSize: 11, outline: "none", width: "100%", boxSizing: "border-box" };
  const lbl  = t => <label style={{ color: DS.textMute, fontSize: 10, fontWeight: DS.fw.bold, display: "block", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.4px" }}>{t}</label>;

  const SectionHeader = ({ title, color }) => (
    <div style={{ background: color || "#1a3a5c", color: "#fff", fontWeight: DS.fw.black, fontSize: DS.fs.sm, padding: "9px 16px", letterSpacing: "0.5px", textTransform: "uppercase" }}>{title}</div>
  );
  const Card = ({ children }) => (
    <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.lg, overflow: "hidden" }}>{children}</div>
  );
  const Body = ({ children }) => <div style={{ padding: "14px 16px" }}>{children}</div>;
  const Grid = ({ cols, children }) => <div style={{ display: "grid", gridTemplateColumns: cols || "1fr 1fr", gap: 10 }}>{children}</div>;
  const Field = ({ label, span, children }) => (
    <div style={{ gridColumn: span ? `span ${span}` : undefined }}>{lbl(label)}{children}</div>
  );
  const TextInput = ({ field, placeholder, type }) => (
    <input type={type || "text"} value={form[field] || ""} onChange={e => set(field, e.target.value)} placeholder={placeholder || ""} style={iS} />
  );
  const SelectInput = ({ field, options }) => (
    <select value={form[field] || ""} onChange={e => set(field, e.target.value)} style={iS}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );

  // ── Saved BOV list ────────────────────────────────────────────
  const [bovList, setBovList] = useState(() => {
    try { const s = localStorage.getItem("cre-bov-v1"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  useEffect(() => { localStorage.setItem("cre-bov-v1", JSON.stringify(bovList)); }, [bovList]);
  const [activeId,  setActiveId]  = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [activeSection, setActiveSection] = useState("Property ID");

  // ── Empty form — mirrors SVN template exactly ─────────────────
  const emptyComp  = () => ({ address: "", cityState: "", propType: "Industrial", sqft: "", landAC: "", yearBuilt: "", zoning: "", comparability: "Comparable", saleDate: "", salePrice: "", psfSale: "", capRate: "" });
  const emptyLease = () => ({ address: "", city: "", state: defaultState, units: "", leaseRate: "", leaseStart: "", leaseType: "NNN" });

  const emptyForm = () => ({
    id: Date.now() + Math.random(),
    // Header
    clientName: "", effectiveDate: today, portfolioSort: "",
    // Property ID (Page 1)
    streetAddress: "", city: "", state: defaultState, zip: "",
    propertyType: "Industrial", useType: "Owner-occupier", isForSale: "No",
    lastSaleDate: "", lastSalePrice: "", assessedValue: "",
    ownerName: "", buildingSF: "", propertyCondition: "Excellent",
    parcelNum: "", annualTaxes: "",
    // Market Characteristics (Page 1)
    marketConditions: "Stable", sales12mo: "", newConstruction: "Limited",
    marketVacancy: "", pricingTrend: "Stable", salesCompsRange: "",
    marketType: "Suburban", submarketCapRates: "", marketComments: "",
    // Site Characteristics (Page 1)
    zoning: "", siteAcres: "", lotLocation: "Corner",
    // Building Description (Page 1)
    numBuildings: "1", numStories: "1", numUnits: "",
    yearBuilt: "", overallCondition: "Excellent",
    constructionType: "Steel Frame", exteriorFinish: "Steel",
    airConditioned: "Yes", heated: "Yes", boiler: "N/A",
    // Operating Status (Page 1)
    occupancyPct: "100", majorTenant: "", secondaryTenant: "N/A", tenantType: "",
    // SWOT (Page 1)
    strengths: "", weaknesses: "", opportunities: "", threats: "", otherIssues: "", explainIssues: "",
    // Property vs Market (Page 1)
    assetQuality: "Above Average", neighborhoodLocation: "Above Average",
    neighborhoodTrends: "Stable", streetAppeal: "Average", visibility: "Average",
    // Scope (Page 1)
    scopeOfInspection: "",
    // Sales Comps (Page 2) — 3 comps
    saleComps: [emptyComp(), emptyComp(), emptyComp()],
    saleLowOverride: "", saleHighOverride: "", saleMedianOverride: "",
    saleComments: "Comparable sales utilized consist of similar industrial buildings within the submarket and surrounding area. Adjustments considered include building size, construction quality, age, and site utility.",
    // Lease Comps (Page 2)
    leaseComps: [emptyLease(), emptyLease(), emptyLease()],
    leaseComments: "Lease comparables reflect similar industrial properties within the submarket. Estimated market rent assumptions are based on current asking rates and recent executed leases.",
    // Income Analysis (Page 2)
    incomeBuildingSF: "", estMarketRent: "", estVacancyPct: "2",
    estPropExp: "0.50", estMgmtFeePct: "5", estCreditLossPct: "0",
    estReplReserve: "0.00", estLowCapRate: "7.25", estHighCapRate: "9.00",
    incomeComments: "Income assumptions are derived from current market rent levels for comparable properties, estimated vacancy factors, and standard operating expense ratios.",
    // Conclusion (Page 2)
    asIsValue: "", asIsPSF: "", lowerEndValue: "", upperEndValue: "",
    conclusionComments: "",
    submarket: smList[0] || "",
    createdDate: today,
  });

  const [form, setForm] = useState(emptyForm);
  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setSC = (i, k, v) => setForm(f => { const a = [...f.saleComps];  a[i] = { ...a[i], [k]: v }; return { ...f, saleComps: a }; });
  const setLC = (i, k, v) => setForm(f => { const a = [...f.leaseComps]; a[i] = { ...a[i], [k]: v }; return { ...f, leaseComps: a }; });

  // ── DB auto-fill ──────────────────────────────────────────────
  const dbSale  = comps.filter(c => c.submarket === form.submarket && c.compType === "Sale"  && parseFloat(c.psfSale)  > 0).sort((a,b) => (b.closeDate||"").localeCompare(a.closeDate||"")).slice(0,3);
  const dbLease = comps.filter(c => c.submarket === form.submarket && c.compType === "Lease" && parseFloat(c.psfLease) > 0).sort((a,b) => (b.closeDate||"").localeCompare(a.closeDate||"")).slice(0,3);

  const autoFillComps = () => {
    const sc = [0,1,2].map(i => {
      const c = dbSale[i];
      if (!c) return form.saleComps[i];
      return { address: c.address || c.name || "", cityState: `${c.city||""}${c.city&&c.state?", ":""}${c.state||defaultState}`, propType: c.subtype || "Industrial", sqft: c.sqft || "", landAC: "", yearBuilt: c.yearBuilt || "", zoning: "IBD", comparability: "Comparable", saleDate: c.closeDate || "", salePrice: c.salePrice || "", psfSale: c.psfSale || "", capRate: "" };
    });
    const lc = [0,1,2].map(i => {
      const c = dbLease[i];
      if (!c) return form.leaseComps[i];
      const annualPsf = (parseFloat(c.psfLease) * 12).toFixed(2);
      return { address: c.address || c.name || "", city: c.city || "", state: c.state || defaultState, units: c.sqft || "", leaseRate: annualPsf, leaseStart: c.closeDate || "", leaseType: "NNN" };
    });
    setForm(f => ({ ...f, saleComps: sc, leaseComps: lc, incomeBuildingSF: f.incomeBuildingSF || f.buildingSF }));
    toast(`⚡ Auto-filled ${dbSale.length} sale + ${dbLease.length} lease comps from ${form.submarket}`);
  };

  // ── Income calculations ───────────────────────────────────────
  const bSF      = parseFloat(form.incomeBuildingSF || form.buildingSF) || 0;
  const mktRent  = parseFloat(form.estMarketRent)    || 0;
  const vacPct   = parseFloat(form.estVacancyPct)    || 0;
  const propExp  = parseFloat(form.estPropExp)        || 0;
  const mgmtPct  = parseFloat(form.estMgmtFeePct)    || 0;
  const creditPct= parseFloat(form.estCreditLossPct) || 0;
  const replRes  = parseFloat(form.estReplReserve)   || 0;
  const lowCap   = parseFloat(form.estLowCapRate)    || 0;
  const highCap  = parseFloat(form.estHighCapRate)   || 0;

  const pgi       = bSF * mktRent;
  const lessVac   = pgi * (vacPct / 100);
  const lessCred  = 0; // credit loss applied to EGI below
  const egi       = pgi - lessVac;
  const lessProp  = bSF * propExp;
  const lessMgmt  = egi * (mgmtPct / 100);
  const lessCL    = egi * (creditPct / 100);
  const noi       = egi - lessProp - lessMgmt - lessCL;
  const lessRes   = bSF * replRes;
  const ncf       = noi - lessRes;
  const incLow    = highCap > 0 ? noi / (highCap / 100) : 0;
  const incHigh   = lowCap  > 0 ? noi / (lowCap  / 100) : 0;

  // ── Sale comp auto-calculations ───────────────────────────────
  const validSC   = form.saleComps.filter(c => parseFloat(c.psfSale) > 0);
  const avgPsf    = validSC.length > 0 ? validSC.reduce((s,c) => s + parseFloat(c.psfSale), 0) / validSC.length : 0;
  const subSF     = parseFloat(form.buildingSF) || 0;
  const autoLow   = avgPsf > 0 && subSF > 0 ? subSF * avgPsf * 0.88 : 0;
  const autoHigh  = avgPsf > 0 && subSF > 0 ? subSF * avgPsf * 1.08 : 0;
  const autoMed   = avgPsf > 0 && subSF > 0 ? subSF * avgPsf        : 0;
  const finalLow  = parseFloat(form.saleLowOverride)    || autoLow;
  const finalHigh = parseFloat(form.saleHighOverride)   || autoHigh;
  const finalMed  = parseFloat(form.saleMedianOverride) || autoMed;
  const finalAsIs = parseFloat(form.asIsValue)          || finalMed;

  const fD = v  => v > 0 ? "$" + Math.round(v).toLocaleString() : "—";
  const fP = v  => v > 0 ? "$" + parseFloat(v).toFixed(2)       : "—";
  const fPsf = v => subSF > 0 && v > 0 ? "$" + (v / subSF).toFixed(2) + "/SF" : "";

  // ── Save / open / delete ──────────────────────────────────────
  const saveBov = () => {
    const saved = { ...form, _low: finalLow, _high: finalHigh, _med: finalMed, _asIs: finalAsIs };
    setBovList(prev => prev.find(b => b.id === form.id) ? prev.map(b => b.id === form.id ? saved : b) : [...prev, saved]);
    toast("BOV saved ✓");
  };
  const deleteBov    = id => { setBovList(p => p.filter(b => b.id !== id)); if (activeId === id) { setActiveId(null); setForm(emptyForm()); } setConfirmDel(null); };
  const openNew      = () => { const f = emptyForm(); setForm(f); setActiveId(f.id); setActiveSection("Property ID"); };
  const openExisting = b  => { setForm(b); setActiveId(b.id); setActiveSection("Property ID"); };

  // ── Print / PDF — mirrors SVN format ─────────────────────────
  const printBOV = () => {
    const win = window.open("", "_blank");
    const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const scRows = [
      ["Street Address:",      form.streetAddress, ...form.saleComps.map(c => c.address)],
      ["City/State:",          `${form.city}, ${form.state}`, ...form.saleComps.map(c => c.cityState)],
      ["Property Type:",       "Industrial",       ...form.saleComps.map(c => c.propType || "Industrial")],
      ["Building Size (SF):",  form.buildingSF || "—", ...form.saleComps.map(c => c.sqft ? parseInt(c.sqft).toLocaleString() : "—")],
      ["Land Area (AC):",      form.siteAcres || "—", ...form.saleComps.map(c => c.landAC || "—")],
      ["Year Built:",          form.yearBuilt || "—", ...form.saleComps.map(c => c.yearBuilt || "—")],
      ["Zoning:",              form.zoning || "—",  ...form.saleComps.map(c => c.zoning || "—")],
      ["Comparability to Subject:", "Subject",     ...form.saleComps.map(c => c.comparability || "—")],
      ["Sale Date:",           "—",                ...form.saleComps.map(c => c.saleDate || "—")],
      ["Sales Price:",         "—",                ...form.saleComps.map(c => c.salePrice > 0 ? "$" + Math.round(c.salePrice).toLocaleString() : "—")],
      ["Sale Price/SF:",       "—",                ...form.saleComps.map(c => c.psfSale > 0 ? "$" + parseFloat(c.psfSale).toFixed(4) : "—")],
      ["Cap Rate %",           "—",                ...form.saleComps.map(c => c.capRate || "—")],
    ];
    const lcRows = [
      ["Street Address:", form.streetAddress,   ...form.leaseComps.map(c => c.address)],
      ["City:",           form.city || "—",     ...form.leaseComps.map(c => c.city || "—")],
      ["State:",          form.state || "—",    ...form.leaseComps.map(c => c.state || "—")],
      ["Units (SF/AC/#):",form.buildingSF||"0", ...form.leaseComps.map(c => c.units || "—")],
      ["Lease Rate ($/SF/Yr.):", "$0.00",       ...form.leaseComps.map(c => c.leaseRate ? "$" + parseFloat(c.leaseRate).toFixed(2) : "—")],
      ["Lease Start Date:","N/A",               ...form.leaseComps.map(c => c.leaseStart || "N/A")],
      ["Lease Term/Lease Type:", "N/A",         ...form.leaseComps.map(c => c.leaseType || "NNN")],
    ];
    const tRow = (cells, hl) => `<tr>${cells.map((v,i) => `<td class="${i===0?"lc":i===1?"subj":""}${hl?" hl":""}">${v||"—"}</td>`).join("")}</tr>`;
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>BPO — ${form.streetAddress}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;background:#fff;padding:28px 32px;font-size:11px;line-height:1.55}
      .phdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:10px;border-bottom:3px solid #f59e0b;margin-bottom:12px}
      .ptitle{font-size:14px;font-weight:900;color:#0f172a}.psub{font-size:10px;color:#64748b;margin-top:2px}
      .badge{background:#f59e0b;color:#0d1826;padding:6px 14px;border-radius:5px;font-weight:900;font-size:10px;text-align:center;line-height:1.6}
      .sh{background:#1a3a5c;color:#fff;font-weight:800;font-size:10px;text-align:center;padding:6px;letter-spacing:.5px;text-transform:uppercase;margin-top:12px}
      table{width:100%;border-collapse:collapse;font-size:10px;margin-top:0}
      th{background:#e8f0f8;color:#334155;font-weight:700;padding:5px 8px;text-align:center;border:1px solid #cbd5e1;font-size:9px;text-transform:uppercase}
      td{padding:4px 8px;border:1px solid #e2e8f0;color:#334155;vertical-align:top}
      .lc{background:#f8fafc;font-weight:600;color:#475569;width:24%}
      .subj{background:#fffde7;font-weight:600}
      .hl{background:#fef9c3;font-weight:700;color:#92400e;text-align:right;font-family:monospace}
      .num{text-align:right;font-family:monospace}
      .two{display:grid;grid-template-columns:1fr 1fr;gap:0}
      .swot td{padding:5px 8px;font-size:10px}
      .conc{background:#fffbeb;border:2px solid #f59e0b;border-radius:6px;padding:12px 16px;margin:10px 0}
      .crange{font-size:20px;font-weight:900;color:#1a3a5c;margin:4px 0}
      .csub{font-size:11px;color:#f59e0b;font-weight:700}
      .sig{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px;padding-top:10px;border-top:1px solid #e2e8f0}
      .sk{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.3px;color:#94a3b8}
      .sv{font-size:10px;font-weight:600;color:#1e293b;margin-top:1px}
      .disc{font-size:8px;color:#94a3b8;margin-top:10px;padding-top:8px;border-top:1px solid #e2e8f0;line-height:1.6}
      @media print{button{display:none!important}.pb{page-break-before:always}}
    </style></head><body>

    <div class="phdr">
      <div>
        <div class="ptitle">BROKER PRICE OPINION (BPO) — COMMERCIAL/INCOME PROPERTY</div>
        <div class="psub">Effective Date: ${form.effectiveDate} &nbsp;|&nbsp; Client: ${form.clientName||"—"} &nbsp;|&nbsp; Prepared by ${brokerName}, ${brokerage}</div>
      </div>
      <div class="badge">BROKER PRICE<br/>OPINION<br/><span style="font-size:9px;font-weight:400">${form.submarket||""}</span></div>
    </div>

    <div class="sh">PROPERTY IDENTIFICATION</div>
    <table><tbody>
      <tr><td class="lc">Street Address:</td><td>${form.streetAddress||"—"}</td><td class="lc">Property Type:</td><td>${form.propertyType}</td></tr>
      <tr><td class="lc">City:</td><td>${form.city||"—"}</td><td class="lc">Use Type:</td><td>${form.useType}</td></tr>
      <tr><td class="lc">State:</td><td>${form.state||"—"}</td><td class="lc">Is Property For Sale:</td><td>${form.isForSale}</td></tr>
      <tr><td class="lc">Zip Code:</td><td>${form.zip||"—"}</td><td class="lc">Last Recorded Sale Date:</td><td>${form.lastSaleDate||"—"}</td></tr>
      <tr><td class="lc">Borrower/Owner Name:</td><td>${form.ownerName||"—"}</td><td class="lc">Last Recorded Sale Price:</td><td>${form.lastSalePrice||"—"}</td></tr>
      <tr><td class="lc">Building Size (SF):</td><td>${form.buildingSF||"—"}</td><td class="lc">Assessed Value:</td><td>${form.assessedValue||"—"}</td></tr>
      <tr><td class="lc">Property Condition:</td><td>${form.propertyCondition}</td><td class="lc">Assessor Parcel #(s):</td><td>${form.parcelNum||"—"}</td></tr>
      <tr><td class="lc">Annual Property Taxes:</td><td colspan="3">${form.annualTaxes||"—"}</td></tr>
    </tbody></table>

    <div class="sh">MARKET CHARACTERISTICS</div>
    <table><tbody>
      <tr><td class="lc">Overall Market Conditions:</td><td>${form.marketConditions}</td><td class="lc">12 Mo Sales Volume:</td><td>${form.sales12mo||"—"}</td></tr>
      <tr><td class="lc">New Construction:</td><td>${form.newConstruction}</td><td class="lc">Market Vacancy Rate (%):</td><td>${form.marketVacancy||"—"}</td></tr>
      <tr><td class="lc">Pricing Trend:</td><td>${form.pricingTrend}</td><td class="lc">Sales Comps ($/SF Range):</td><td>${form.salesCompsRange||"—"}</td></tr>
      <tr><td class="lc">Market Type:</td><td>${form.marketType}</td><td class="lc">Submarket Cap Rates:</td><td>${form.submarketCapRates||"—"}</td></tr>
      ${form.marketComments?`<tr><td class="lc">Comments:</td><td colspan="3" style="font-style:italic">${form.marketComments}</td></tr>`:""}
    </tbody></table>

    <div class="sh">PROPERTY / SITE OVERVIEW</div>
    <table><tbody>
      <tr><th colspan="2">SITE CHARACTERISTICS</th><th colspan="2">BUILDING DESCRIPTION</th></tr>
      <tr><td class="lc">Property Type:</td><td>${form.propertyType}</td><td class="lc"># of Buildings:</td><td>${form.numBuildings}</td></tr>
      <tr><td class="lc">Zoning:</td><td>${form.zoning||"—"}</td><td class="lc">Building Size (SF):</td><td>${form.buildingSF||"—"}</td></tr>
      <tr><td class="lc">Site Size (Acres):</td><td>${form.siteAcres||"—"}</td><td class="lc"># of Stories:</td><td>${form.numStories}</td></tr>
      <tr><td class="lc">Lot Location:</td><td>${form.lotLocation}</td><td class="lc"># of Units:</td><td>${form.numUnits||"0"}</td></tr>
      <tr><td class="lc"></td><td></td><td class="lc">Year Built:</td><td>${form.yearBuilt||"—"}</td></tr>
      <tr><td class="lc"></td><td></td><td class="lc">Overall Condition:</td><td>${form.overallCondition}</td></tr>
      <tr><td class="lc"></td><td></td><td class="lc">Construction Type:</td><td>${form.constructionType}</td></tr>
      <tr><td class="lc"></td><td></td><td class="lc">Exterior Finish:</td><td>${form.exteriorFinish}</td></tr>
      <tr><td class="lc"></td><td></td><td class="lc">Air Conditioned:</td><td>${form.airConditioned}</td></tr>
      <tr><td class="lc">PROPERTY OPERATING STATUS</td><td></td><td class="lc">Heated:</td><td>${form.heated}</td></tr>
      <tr><td class="lc">Occupancy (%):</td><td>${form.occupancyPct}%</td><td class="lc">Boiler:</td><td>${form.boiler}</td></tr>
      <tr><td class="lc">Major Tenant(s):</td><td>${form.majorTenant||"—"}</td><td class="lc">Secondary Tenant(s):</td><td>${form.secondaryTenant||"N/A"}</td></tr>
    </tbody></table>

    <table class="swot" style="margin-top:4px"><tbody>
      <tr><th colspan="2">STRENGTHS / WEAKNESSES / OPPORTUNITIES / THREATS</th><th colspan="2">PROPERTY VS COMPETITIVE MARKET</th></tr>
      <tr><td class="lc">Strengths:</td><td>${form.strengths||"—"}</td><td class="lc">Asset Quality vs Market:</td><td>${form.assetQuality}</td></tr>
      <tr><td class="lc">Weaknesses:</td><td>${form.weaknesses||"—"}</td><td class="lc">Neighborhood Location:</td><td>${form.neighborhoodLocation}</td></tr>
      <tr><td class="lc">Opportunities:</td><td>${form.opportunities||"—"}</td><td class="lc">Neighborhood Price Trends:</td><td>${form.neighborhoodTrends}</td></tr>
      <tr><td class="lc">Threats:</td><td>${form.threats||"—"}</td><td class="lc">Street Appeal:</td><td>${form.streetAppeal}</td></tr>
      <tr><td class="lc">Other/Issues:</td><td colspan="3">${form.otherIssues||"—"}</td></tr>
    </tbody></table>

    <div class="pb"></div>

    <div class="phdr" style="margin-top:12px">
      <div>
        <div class="ptitle">BROKER PRICE OPINION (BPO) — COMMERCIAL/INCOME PROPERTY — PAGE 2</div>
        <div class="psub">Client: ${form.clientName||"—"} &nbsp;|&nbsp; Effective Date: ${form.effectiveDate}</div>
      </div>
      <div class="badge">PAGE 2</div>
    </div>

    <div class="sh">SALES COMPARISON ANALYSIS</div>
    <table>
      <thead><tr><th></th><th class="subj">Subject Property</th><th>Sale Comp #1</th><th>Sale Comp #2</th><th>Sale Comp #3</th></tr></thead>
      <tbody>
        ${scRows.map((r,i) => tRow(r, i===10)).join("")}
      </tbody>
    </table>
    <table style="margin-top:3px"><tbody>
      <tr><td class="lc">Low Price Indication:</td><td class="hl">${fD(finalLow)}</td><td class="lc">High Price Indication:</td><td class="hl">${fD(finalHigh)}</td></tr>
      <tr><td class="lc">Median Price:</td><td class="hl">${fD(finalMed)}</td><td colspan="2"></td></tr>
    </tbody></table>
    ${form.saleComments ? `<div style="margin:4px 0;padding:6px 8px;background:#f8fafc;border:1px solid #e2e8f0;font-size:10px;font-style:italic;color:#475569">${form.saleComments}</div>` : ""}

    <div class="sh">COMPARABLE PROPERTY LEASE RATES (Preferably in-place contract rates)</div>
    <table>
      <thead><tr><th></th><th class="subj">${form.streetAddress||"Subject"}</th><th>Lease Comp #1</th><th>Lease Comp #2</th><th>Lease Comp #3</th></tr></thead>
      <tbody>${lcRows.map(r => tRow(r, false)).join("")}</tbody>
    </table>
    ${form.leaseComments ? `<div style="margin:4px 0;padding:6px 8px;background:#f8fafc;border:1px solid #e2e8f0;font-size:10px;font-style:italic;color:#475569">${form.leaseComments}</div>` : ""}

    <div class="sh">INCOME ANALYSIS — BASED ON PRO FORMA INCOME</div>
    <table><tbody>
      <tr><td class="lc">Building Size (Rentable SF):</td><td class="num">${bSF>0?bSF.toLocaleString():"—"}</td><td class="lc">Potential Gross Income:</td><td class="num">$&nbsp;${Math.round(pgi).toLocaleString()}</td></tr>
      <tr><td class="lc">Est. Market Rent ($/SF/Yr.)</td><td class="num">${mktRent?"$"+mktRent.toFixed(2):"—"}</td><td class="lc">Less: Vacancy</td><td class="num">${lessVac>0?"("+Math.round(lessVac).toLocaleString()+")":"—"}</td></tr>
      <tr><td class="lc">Est. Market Vacancy (%):</td><td class="num">${vacPct}%</td><td class="lc">Less: Credit Loss</td><td class="num">${lessCL>0?"("+Math.round(lessCL).toLocaleString()+")":"0"}</td></tr>
      <tr><td class="lc">Est. Prop. Exp. ($/SF/Yr.):</td><td class="num">${fP(propExp)}</td><td class="lc" style="font-weight:800">Effective Gross Income:</td><td class="num hl">$&nbsp;${Math.round(egi).toLocaleString()}</td></tr>
      <tr><td class="lc">Est. Mgmt. Fee (% of EGI):</td><td class="num">${mgmtPct}%</td><td class="lc">Less: Property Expense</td><td class="num">${lessProp>0?"("+Math.round(lessProp).toLocaleString()+")":"—"}</td></tr>
      <tr><td class="lc">Est. Credit Loss (% of EGI):</td><td class="num">${creditPct}%</td><td class="lc">Less: Mgmt. Fee</td><td class="num">${lessMgmt>0?"("+Math.round(lessMgmt).toLocaleString()+")":"—"}</td></tr>
      <tr><td class="lc">Est. Repl. Reserve ($/SF):</td><td class="num">$${parseFloat(form.estReplReserve||0).toFixed(2)}</td><td class="lc" style="font-weight:800">Pro Forma NOI after vacancy</td><td class="num hl">$&nbsp;${Math.round(noi).toLocaleString()}</td></tr>
      <tr><td colspan="2"></td><td class="lc">Less: Reserves</td><td class="num">${lessRes>0?"("+Math.round(lessRes).toLocaleString()+")":"0"}</td></tr>
      <tr><td colspan="2"></td><td class="lc" style="font-weight:900;color:#1a3a5c">Pro Forma NCF:</td><td class="num hl" style="font-weight:900;color:#1a3a5c">$&nbsp;${Math.round(ncf).toLocaleString()}</td></tr>
    </tbody></table>
    <table style="margin-top:3px"><tbody>
      <tr><td class="lc">Low Price Indication:</td><td class="hl">${fD(incLow)}</td><td class="lc">Est. Low Cap Rate:</td><td>${lowCap}%</td></tr>
      <tr><td class="lc">High Price Indication:</td><td class="hl">${fD(incHigh)}</td><td class="lc">Est. High Cap Rate:</td><td>${highCap}%</td></tr>
    </tbody></table>
    ${form.incomeComments ? `<div style="margin:4px 0;padding:6px 8px;background:#f8fafc;border:1px solid #e2e8f0;font-size:10px;font-style:italic;color:#475569">${form.incomeComments}</div>` : ""}

    <div class="sh">ANALYSIS CONCLUSION — BROKER PRICE OPINION</div>
    <div class="conc">
      <div style="font-size:10px;color:#475569;margin-bottom:6px">Based on the above analysis, the estimated market value of the subject property is:</div>
      <div class="crange">${fD(finalLow)} – ${fD(finalHigh)}</div>
      <div class="csub">As-is Valuation Estimate: ${fD(finalAsIs)} ${fPsf(finalAsIs)}</div>
      <table style="margin-top:8px;border:none"><tbody>
        <tr style="border:none">
          <td style="border:none;padding:4px 8px 4px 0"><span style="font-size:8px;font-weight:700;text-transform:uppercase;color:#94a3b8;letter-spacing:.3px">Lower End Value</span><br/><span style="font-size:14px;font-weight:900;color:#1a3a5c">${fD(parseFloat(form.lowerEndValue)||finalLow)} ${fPsf(parseFloat(form.lowerEndValue)||finalLow)}</span></td>
          <td style="border:none;padding:4px 8px"><span style="font-size:8px;font-weight:700;text-transform:uppercase;color:#94a3b8;letter-spacing:.3px">Upper End Value</span><br/><span style="font-size:14px;font-weight:900;color:#1a3a5c">${fD(parseFloat(form.upperEndValue)||finalHigh)} ${fPsf(parseFloat(form.upperEndValue)||finalHigh)}</span></td>
        </tr>
      </tbody></table>
      ${form.conclusionComments ? `<div style="margin-top:8px;font-size:10px;color:#475569;font-style:italic">${form.conclusionComments}</div>` : ""}
    </div>

    <div class="sig">
      ${[["Broker(s) Name(s):", brokerName],["Broker Company:", brokerage],["License #:", brokerLicense||"—"],["Phone:", brokerPhone||"—"],["Email:", brokerEmail||"—"],["Date:", dateStr]].map(([k,v])=>`<div><div class="sk">${k}</div><div class="sv">${v}</div></div>`).join("")}
    </div>
    <div class="disc">This Broker Price Opinion is prepared by ${brokerName}, ${brokerage} for informational purposes only and does not constitute a certified appraisal or guarantee of value. All data is based on available market information as of ${dateStr}. Actual values may differ materially. This document is confidential and intended solely for the named recipient. All SVN® Offices Independently Owned and Operated.</div>
    <br/><button onclick="window.print()" style="background:#f59e0b;color:#0d1826;border:none;padding:9px 22px;border-radius:6px;font-size:12px;cursor:pointer;font-weight:900;margin-top:12px">🖨 Print / Save as PDF</button>
    </body></html>`);
    win.document.close();
  };

  // ── Comp grid row ─────────────────────────────────────────────
  const CompRow = ({ label, subjectVal, arr, field, onChange, type, isKey }) => (
    <tr style={{ borderBottom: `1px solid ${DS.border}`, background: isKey ? DS.accent + "08" : "transparent" }}>
      <td style={{ padding: "5px 10px", background: "#0a1424", color: isKey ? DS.accent : DS.textSub, fontSize: 11, fontWeight: 600, width: "22%", whiteSpace: "nowrap" }}>{label}</td>
      <td style={{ padding: "5px 8px", background: "#070e1a", color: DS.accent, fontSize: 11, width: "19%" }}>{subjectVal || "—"}</td>
      {[0, 1, 2].map(i => (
        <td key={i} style={{ padding: "3px 5px", width: "19%" }}>
          <input type={type || "text"} value={arr[i][field] || ""} onChange={e => onChange(i, field, e.target.value)}
            style={{ ...iSsm, ...(isKey ? { color: DS.accent, fontFamily: "'DM Mono', monospace" } : {}) }} />
        </td>
      ))}
    </tr>
  );

  const SECTIONS = ["Property ID", "Market", "Site & Building", "Sale Comps", "Lease Comps", "Income", "Conclusion"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: DS.text, fontWeight: DS.fw.black, fontSize: DS.fs.h2 }}>Broker Price Opinion</div>
          <div style={{ color: DS.textMute, fontSize: DS.fs.sm, marginTop: 2 }}>Full SVN BPO template · all sections · comps auto-filled from your database</div>
        </div>
        <button onClick={openNew} style={{ background: DS.accent, border: "none", color: "#0a0f1a", padding: "8px 18px", borderRadius: DS.r.sm, cursor: "pointer", fontSize: DS.fs.md, fontWeight: DS.fw.black }}>+ New BOV</button>
      </div>

      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        {/* Saved list */}
        <div style={{ width: 175, flexShrink: 0 }}>
          <div style={{ color: DS.textFaint, fontSize: 9, fontWeight: DS.fw.black, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 8 }}>Saved ({bovList.length})</div>
          {bovList.length === 0 && (
            <div style={{ background: DS.panel, border: `1px dashed ${DS.border}`, borderRadius: DS.r.md, padding: "16px 10px", textAlign: "center", color: DS.textFaint, fontSize: DS.fs.xs }}>No BOVs yet.<br />Click + New BOV</div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {bovList.map(b => (
              <div key={b.id} onClick={() => openExisting(b)}
                style={{ background: activeId === b.id ? DS.accentSoft : DS.panel, border: `1px solid ${activeId === b.id ? DS.accent : DS.border}`, borderRadius: DS.r.md, padding: "9px 11px", cursor: "pointer" }}
                onMouseEnter={e => { if (activeId !== b.id) e.currentTarget.style.background = DS.panelHi; }}
                onMouseLeave={e => { if (activeId !== b.id) e.currentTarget.style.background = DS.panel; }}>
                <div style={{ color: activeId === b.id ? DS.accent : DS.text, fontWeight: DS.fw.semi, fontSize: DS.fs.sm, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.streetAddress || "Untitled BOV"}</div>
                <div style={{ color: DS.textFaint, fontSize: 10, marginTop: 2 }}>{b.clientName || b.city || b.submarket}</div>
                {b._asIs > 0 && <div style={{ color: DS.accent, fontSize: DS.fs.sm, fontWeight: DS.fw.bold, marginTop: 2, fontFamily: "'DM Mono', monospace" }}>{fD(b._asIs)}</div>}
                <div style={{ color: DS.textFaint, fontSize: 9, marginTop: 2 }}>{b.createdDate}</div>
                {confirmDel === b.id ? (
                  <div style={{ display: "flex", gap: 4, marginTop: 5 }}>
                    <button onClick={e => { e.stopPropagation(); deleteBov(b.id); }} style={{ background: "#dc2626", border: "none", color: "#fff", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, cursor: "pointer" }}>Delete</button>
                    <button onClick={e => { e.stopPropagation(); setConfirmDel(null); }} style={{ background: "none", border: `1px solid ${DS.border}`, color: DS.textMute, padding: "2px 8px", borderRadius: 4, fontSize: 10, cursor: "pointer" }}>No</button>
                  </div>
                ) : (
                  <button onClick={e => { e.stopPropagation(); setConfirmDel(b.id); }} style={{ background: "none", border: "none", color: DS.textFaint, fontSize: 10, cursor: "pointer", marginTop: 4, padding: 0 }}>Delete</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        {activeId ? (
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Section nav */}
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {SECTIONS.map(s => (
                <button key={s} onClick={() => setActiveSection(s)} style={{ background: activeSection === s ? DS.accent : DS.panel, border: `1px solid ${activeSection === s ? DS.accent : DS.border}`, color: activeSection === s ? "#0a0f1a" : DS.textSub, padding: "6px 13px", borderRadius: DS.r.sm, cursor: "pointer", fontSize: DS.fs.sm, fontWeight: activeSection === s ? DS.fw.black : DS.fw.normal, whiteSpace: "nowrap" }}>{s}</button>
              ))}
            </div>

            {/* ── PAGE 1 — PROPERTY ID ── */}
            {activeSection === "Property ID" && (
              <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.lg, overflow: "hidden" }}>
                <SectionHeader title="BROKER PRICE OPINION — PROPERTY IDENTIFICATION" />
                <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    <div style={{ gridColumn: "span 2" }}>{lbl("Client Name")}<input value={form.clientName} onChange={e => set("clientName", e.target.value)} placeholder="Marty Cooper" style={iS} /></div>
                    <div>{lbl("Effective Date")}<input type="date" value={form.effectiveDate} onChange={e => set("effectiveDate", e.target.value)} style={iS} /></div>
                    <div style={{ gridColumn: "span 2" }}>{lbl("Street Address")}<input value={form.streetAddress} onChange={e => set("streetAddress", e.target.value)} placeholder="1556 Amy Ln" style={iS} /></div>
                    <div>{lbl("Borrower / Owner Name")}<input value={form.ownerName} onChange={e => set("ownerName", e.target.value)} placeholder="M & C Cooper Enterprises LLC" style={iS} /></div>
                    <div>{lbl("City")}<input value={form.city} onChange={e => set("city", e.target.value)} placeholder="Franklin" style={iS} /></div>
                    <div>{lbl("State")}<input value={form.state} onChange={e => set("state", e.target.value)} placeholder="Indiana" style={iS} /></div>
                    <div>{lbl("Zip Code")}<input value={form.zip} onChange={e => set("zip", e.target.value)} placeholder="46131" style={iS} /></div>
                    <div>{lbl("Property Type")}
                      <select value={form.propertyType} onChange={e => set("propertyType", e.target.value)} style={iS}>
                        {["Industrial","Office","Retail","Flex","Multifamily","Land","Other"].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>{lbl("Use Type")}
                      <select value={form.useType} onChange={e => set("useType", e.target.value)} style={iS}>
                        {["Owner-occupier","Investment","Owner-user","Vacant"].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>{lbl("Is Property For Sale")}
                      <select value={form.isForSale} onChange={e => set("isForSale", e.target.value)} style={iS}>
                        {["No","Yes","Under Contract"].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>{lbl("Building Size (SF)")}<input type="number" value={form.buildingSF} onChange={e => set("buildingSF", e.target.value)} placeholder="5400" style={iS} /></div>
                    <div>{lbl("Property Condition")}
                      <select value={form.propertyCondition} onChange={e => set("propertyCondition", e.target.value)} style={iS}>
                        {["Excellent","Good","Average","Fair","Poor"].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>{lbl("Assessor Parcel #(s)")}<input value={form.parcelNum} onChange={e => set("parcelNum", e.target.value)} placeholder="41-08-12-033-006.007-018" style={iS} /></div>
                    <div>{lbl("Annual Property Taxes")}<input value={form.annualTaxes} onChange={e => set("annualTaxes", e.target.value)} placeholder="$10,604.24" style={iS} /></div>
                    <div>{lbl("Last Recorded Sale Date")}<input type="date" value={form.lastSaleDate} onChange={e => set("lastSaleDate", e.target.value)} style={iS} /></div>
                    <div>{lbl("Last Recorded Sale Price")}<input value={form.lastSalePrice} onChange={e => set("lastSalePrice", e.target.value)} placeholder="Not Disclosed" style={iS} /></div>
                    <div>{lbl("Assessed Value")}<input value={form.assessedValue} onChange={e => set("assessedValue", e.target.value)} placeholder="388,600" style={iS} /></div>
                    <div>{lbl("Submarket")}
                      <select value={form.submarket} onChange={e => set("submarket", e.target.value)} style={iS}>
                        {smList.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── PAGE 1 — MARKET ── */}
            {activeSection === "Market" && (
              <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.lg, overflow: "hidden" }}>
                <SectionHeader title="MARKET CHARACTERISTICS" />
                <div style={{ padding: "14px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>{lbl("Overall Market Conditions")}
                    <select value={form.marketConditions} onChange={e => set("marketConditions", e.target.value)} style={iS}>
                      {["Stable","Improving","Declining","Distressed"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>{lbl("12 Mo Sales Volume")}<input value={form.sales12mo} onChange={e => set("sales12mo", e.target.value)} placeholder="$122M" style={iS} /></div>
                  <div>{lbl("New Construction")}
                    <select value={form.newConstruction} onChange={e => set("newConstruction", e.target.value)} style={iS}>
                      {["None","Limited","Moderate","Active","Oversupply"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>{lbl("Market Vacancy Rate (%)")}<input value={form.marketVacancy} onChange={e => set("marketVacancy", e.target.value)} placeholder="1.7%" style={iS} /></div>
                  <div>{lbl("Pricing Trend")}
                    <select value={form.pricingTrend} onChange={e => set("pricingTrend", e.target.value)} style={iS}>
                      {["Stable","Increasing","Decreasing","Volatile"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>{lbl("Sales Comps ($/SF Range)")}<input value={form.salesCompsRange} onChange={e => set("salesCompsRange", e.target.value)} placeholder="$47–$217" style={iS} /></div>
                  <div>{lbl("Market Type")}
                    <select value={form.marketType} onChange={e => set("marketType", e.target.value)} style={iS}>
                      {["Urban","Suburban","Rural","Secondary Market"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>{lbl("Submarket Cap Rates")}<input value={form.submarketCapRates} onChange={e => set("submarketCapRates", e.target.value)} placeholder="8.4%" style={iS} /></div>
                  <div style={{ gridColumn: "span 2" }}>{lbl("Comments")}<textarea value={form.marketComments} onChange={e => set("marketComments", e.target.value)} rows={3} style={{ ...iS, resize: "vertical", fontSize: 11 }} /></div>
                </div>
              </div>
            )}

            {/* ── PAGE 1 — SITE & BUILDING ── */}
            {activeSection === "Site & Building" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Site + Building side by side */}
                <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.lg, overflow: "hidden" }}>
                  <SectionHeader title="PROPERTY / SITE OVERVIEW" />
                  <div style={{ padding: "14px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <div style={{ color: DS.textFaint, fontSize: 10, fontWeight: DS.fw.black, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>Site Characteristics</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div>{lbl("Zoning")}<input value={form.zoning} onChange={e => set("zoning", e.target.value)} placeholder="Industrial (Hurricane Industrial Park)" style={iS} /></div>
                        <div>{lbl("Site Size (Acres)")}<input type="number" step="0.01" value={form.siteAcres} onChange={e => set("siteAcres", e.target.value)} placeholder="1.77" style={iS} /></div>
                        <div>{lbl("Lot Location")}
                          <select value={form.lotLocation} onChange={e => set("lotLocation", e.target.value)} style={iS}>
                            {["Corner","Interior","Cul-de-sac","Flag"].map(o => <option key={o}>{o}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div style={{ color: DS.textFaint, fontSize: 10, fontWeight: DS.fw.black, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>Building Description</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div>{lbl("# of Buildings")}<input type="number" value={form.numBuildings} onChange={e => set("numBuildings", e.target.value)} style={iS} /></div>
                        <div>{lbl("# of Stories")}<input type="number" value={form.numStories} onChange={e => set("numStories", e.target.value)} style={iS} /></div>
                        <div>{lbl("# of Units")}<input type="number" value={form.numUnits} onChange={e => set("numUnits", e.target.value)} placeholder="0" style={iS} /></div>
                        <div>{lbl("Year Built")}<input type="number" value={form.yearBuilt} onChange={e => set("yearBuilt", e.target.value)} placeholder="2017" style={iS} /></div>
                        <div style={{ gridColumn: "span 2" }}>{lbl("Overall Condition")}
                          <select value={form.overallCondition} onChange={e => set("overallCondition", e.target.value)} style={iS}>
                            {["Excellent","Good","Average","Fair","Poor"].map(o => <option key={o}>{o}</option>)}
                          </select>
                        </div>
                        <div style={{ gridColumn: "span 2" }}>{lbl("Construction Type")}
                          <select value={form.constructionType} onChange={e => set("constructionType", e.target.value)} style={iS}>
                            {["Steel Frame","Masonry","Concrete Tilt-Up","Wood Frame","Other"].map(o => <option key={o}>{o}</option>)}
                          </select>
                        </div>
                        <div style={{ gridColumn: "span 2" }}>{lbl("Exterior Finish")}
                          <select value={form.exteriorFinish} onChange={e => set("exteriorFinish", e.target.value)} style={iS}>
                            {["Steel","Brick","Concrete","Metal Panel","Stucco","Other"].map(o => <option key={o}>{o}</option>)}
                          </select>
                        </div>
                        <div>{lbl("Air Conditioned")}<select value={form.airConditioned} onChange={e => set("airConditioned", e.target.value)} style={iS}>{["Yes","Partial","No"].map(o=><option key={o}>{o}</option>)}</select></div>
                        <div>{lbl("Heated")}<select value={form.heated} onChange={e => set("heated", e.target.value)} style={iS}>{["Yes","Partial","No"].map(o=><option key={o}>{o}</option>)}</select></div>
                        <div style={{ gridColumn: "span 2" }}>{lbl("Boiler")}<input value={form.boiler} onChange={e => set("boiler", e.target.value)} placeholder="N/A" style={iS} /></div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Operating Status */}
                <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.lg, overflow: "hidden" }}>
                  <SectionHeader title="PROPERTY OPERATING STATUS" color="#1a3050" />
                  <div style={{ padding: "14px 16px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    <div>{lbl("Occupancy (%)")}<input type="number" value={form.occupancyPct} onChange={e => set("occupancyPct", e.target.value)} style={iS} /></div>
                    <div>{lbl("Major Tenant(s)")}<input value={form.majorTenant} onChange={e => set("majorTenant", e.target.value)} style={iS} /></div>
                    <div>{lbl("Secondary Tenant(s)")}<input value={form.secondaryTenant} onChange={e => set("secondaryTenant", e.target.value)} style={iS} /></div>
                    <div style={{ gridColumn: "span 3" }}>{lbl("Tenant Type(s)")}<input value={form.tenantType} onChange={e => set("tenantType", e.target.value)} style={iS} /></div>
                  </div>
                </div>
                {/* SWOT */}
                <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.lg, overflow: "hidden" }}>
                  <SectionHeader title="STRENGTHS / WEAKNESSES / OPPORTUNITIES / THREATS" color="#1c3a28" />
                  <div style={{ padding: "14px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[["strengths","Strengths","New construction; expansion potential..."],["weaknesses","Weaknesses","Small footprint; aging roof..."],["opportunities","Opportunities","Additional land; strong submarket demand..."],["threats","Threats","New competing supply; rising taxes..."]].map(([k,label,ph]) => (
                      <div key={k}>{lbl(label)}<textarea value={form[k]} onChange={e => set(k, e.target.value)} rows={3} placeholder={ph} style={{ ...iS, resize: "vertical", fontSize: 11 }} /></div>
                    ))}
                    <div style={{ gridColumn: "span 2" }}>{lbl("Other / Issues")}<textarea value={form.otherIssues} onChange={e => set("otherIssues", e.target.value)} rows={2} style={{ ...iS, resize: "vertical", fontSize: 11 }} /></div>
                    <div style={{ gridColumn: "span 2" }}>{lbl("Explain Issues (if applicable)")}<textarea value={form.explainIssues} onChange={e => set("explainIssues", e.target.value)} rows={2} style={{ ...iS, resize: "vertical", fontSize: 11 }} /></div>
                  </div>
                </div>
                {/* Property vs Market */}
                <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.lg, overflow: "hidden" }}>
                  <SectionHeader title="PROPERTY VS COMPETITIVE MARKET" color="#2d1a3a" />
                  <div style={{ padding: "14px 16px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    {[["assetQuality","Asset Quality vs Market"],["neighborhoodLocation","Neighborhood Location"],["neighborhoodTrends","Neighborhood Price Trends"],["streetAppeal","Street Appeal"],["visibility","Visibility"]].map(([k,label]) => (
                      <div key={k}>{lbl(label)}<select value={form[k]} onChange={e => set(k, e.target.value)} style={iS}>{["Above Average","Average","Below Average","Stable","Increasing","Decreasing"].map(o => <option key={o}>{o}</option>)}</select></div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── PAGE 2 — SALE COMPS ── */}
            {activeSection === "Sale Comps" && (
              <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.lg, overflow: "hidden" }}>
                <SectionHeader title="SALES COMPARISON ANALYSIS" />
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ color: DS.textMute, fontSize: DS.fs.xs }}>
                      {dbSale.length} sale comp{dbSale.length !== 1 ? "s" : ""} in DB for <strong style={{ color: DS.text }}>{form.submarket}</strong>
                    </div>
                    {dbSale.length > 0 && (
                      <button onClick={autoFillComps} style={{ background: DS.blue + "22", border: `1px solid ${DS.blue}44`, color: DS.blue, padding: "5px 14px", borderRadius: DS.r.sm, cursor: "pointer", fontSize: DS.fs.xs, fontWeight: DS.fw.bold }}>⚡ Auto-fill from DB</button>
                    )}
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${DS.border}` }}>
                          {["", "Subject Property", "Sale Comp #1", "Sale Comp #2", "Sale Comp #3"].map((h, i) => (
                            <th key={i} style={{ padding: "7px 10px", background: "#0a1424", color: i === 1 ? DS.accent : DS.textFaint, fontSize: 10, textAlign: "left", width: i === 0 ? "22%" : "19%" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <CompRow label="Street Address:"    subjectVal={form.streetAddress}  arr={form.saleComps} field="address"       onChange={setSC} />
                        <CompRow label="City/State:"        subjectVal={`${form.city}, ${form.state}`} arr={form.saleComps} field="cityState"    onChange={setSC} />
                        <CompRow label="Property Type:"     subjectVal="Industrial"          arr={form.saleComps} field="propType"      onChange={setSC} />
                        <CompRow label="Building Size (SF):"subjectVal={form.buildingSF}     arr={form.saleComps} field="sqft"          onChange={setSC} type="number" />
                        <CompRow label="Land Area (AC):"    subjectVal={form.siteAcres||"—"} arr={form.saleComps} field="landAC"        onChange={setSC} type="number" />
                        <CompRow label="Year Built:"        subjectVal={form.yearBuilt||"—"} arr={form.saleComps} field="yearBuilt"     onChange={setSC} type="number" />
                        <CompRow label="Zoning:"            subjectVal={form.zoning||"—"}   arr={form.saleComps} field="zoning"        onChange={setSC} />
                        <CompRow label="Comparability:"     subjectVal="Subject"             arr={form.saleComps} field="comparability" onChange={setSC} />
                        <CompRow label="Sale Date:"         subjectVal="—"                   arr={form.saleComps} field="saleDate"      onChange={setSC} type="date" />
                        <CompRow label="Sales Price:"       subjectVal="—"                   arr={form.saleComps} field="salePrice"     onChange={setSC} type="number" />
                        <CompRow label="Sale Price/SF:"     subjectVal={avgPsf > 0 ? "$" + avgPsf.toFixed(4) + " avg" : "—"} arr={form.saleComps} field="psfSale" onChange={setSC} type="number" isKey={true} />
                        <CompRow label="Cap Rate %"         subjectVal="—"                   arr={form.saleComps} field="capRate"       onChange={setSC} />
                      </tbody>
                    </table>
                  </div>
                  {/* Price indications */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 12 }}>
                    {[["Low Price Indication", "saleLowOverride", autoLow], ["High Price Indication", "saleHighOverride", autoHigh], ["Median Price", "saleMedianOverride", autoMed]].map(([label, k, auto]) => (
                      <div key={k} style={{ background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: DS.r.md, padding: "10px 12px" }}>
                        {lbl(label)}
                        <input type="number" value={form[k]} onChange={e => set(k, e.target.value)} placeholder={auto > 0 ? Math.round(auto).toString() : "—"} style={{ ...iS, color: DS.blue, fontFamily: "'DM Mono', monospace" }} />
                        {auto > 0 && !form[k] && <div style={{ color: DS.textFaint, fontSize: 9, marginTop: 3 }}>Auto: {fD(auto)}</div>}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 10 }}>{lbl("Comments")}<textarea value={form.saleComments} onChange={e => set("saleComments", e.target.value)} rows={3} style={{ ...iS, resize: "vertical", fontSize: 11, fontStyle: "italic", color: DS.textSub }} /></div>
                </div>
              </div>
            )}

            {/* ── PAGE 2 — LEASE COMPS ── */}
            {activeSection === "Lease Comps" && (
              <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.lg, overflow: "hidden" }}>
                <SectionHeader title="COMPARABLE PROPERTY LEASE RATES (Preferably in-place contract rates)" />
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
                      <thead>
                        <tr>
                          {["", form.streetAddress || "Subject", "Lease Comp #1", "Lease Comp #2", "Lease Comp #3"].map((h, i) => (
                            <th key={i} style={{ padding: "7px 10px", background: "#0a1424", color: i === 1 ? DS.accent : DS.textFaint, fontSize: 10, textAlign: "left", width: i === 0 ? "22%" : "19%" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["Street Address:", "address",   form.streetAddress, null],
                          ["City:",          "city",       form.city || "—",   null],
                          ["State:",         "state",      form.state || "—",  null],
                          ["Units (SF/AC/#):","units",     form.buildingSF || "0", "number"],
                          ["Lease Rate ($/SF/Yr.):","leaseRate","$0.00","number"],
                          ["Lease Start Date:", "leaseStart","N/A","date"],
                          ["Lease Term/Lease Type:","leaseType","N/A", null],
                        ].map(([label, field, subj, type]) => (
                          <tr key={field} style={{ borderBottom: `1px solid ${DS.border}` }}>
                            <td style={{ padding: "5px 10px", background: "#0a1424", color: DS.textSub, fontSize: 11, fontWeight: 600, width: "22%" }}>{label}</td>
                            <td style={{ padding: "5px 8px", background: "#070e1a", color: DS.accent, fontSize: 11, width: "19%" }}>{subj || "—"}</td>
                            {[0, 1, 2].map(i => (
                              <td key={i} style={{ padding: "3px 5px", width: "19%" }}>
                                <input type={type || "text"} value={form.leaseComps[i][field] || ""} onChange={e => setLC(i, field, e.target.value)} style={iSsm} />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ marginTop: 10 }}>{lbl("Comments")}<textarea value={form.leaseComments} onChange={e => set("leaseComments", e.target.value)} rows={3} style={{ ...iS, resize: "vertical", fontSize: 11, fontStyle: "italic", color: DS.textSub }} /></div>
                </div>
              </div>
            )}

            {/* ── PAGE 2 — INCOME ANALYSIS ── */}
            {activeSection === "Income" && (
              <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.lg, overflow: "hidden" }}>
                <SectionHeader title="INCOME ANALYSIS — BASED ON PRO FORMA INCOME" />
                <div style={{ padding: "14px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {/* Inputs */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, alignContent: "start" }}>
                    <div style={{ gridColumn: "span 2" }}>{lbl("Building Size (Rentable SF)")}<input type="number" value={form.incomeBuildingSF || form.buildingSF} onChange={e => set("incomeBuildingSF", e.target.value)} style={iS} /></div>
                    <div>{lbl("Est. Market Rent ($/SF/Yr.)")}<input type="number" step="0.01" value={form.estMarketRent} onChange={e => set("estMarketRent", e.target.value)} placeholder="15.00" style={iS} /></div>
                    <div>{lbl("Est. Market Vacancy (%)")}<input type="number" step="0.1" value={form.estVacancyPct} onChange={e => set("estVacancyPct", e.target.value)} style={iS} /></div>
                    <div>{lbl("Est. Prop. Exp. ($/SF/Yr.)")}<input type="number" step="0.01" value={form.estPropExp} onChange={e => set("estPropExp", e.target.value)} style={iS} /></div>
                    <div>{lbl("Est. Mgmt. Fee (% of EGI)")}<input type="number" step="0.1" value={form.estMgmtFeePct} onChange={e => set("estMgmtFeePct", e.target.value)} style={iS} /></div>
                    <div>{lbl("Est. Credit Loss (% of EGI)")}<input type="number" step="0.1" value={form.estCreditLossPct} onChange={e => set("estCreditLossPct", e.target.value)} style={iS} /></div>
                    <div>{lbl("Est. Repl. Reserve ($/SF)")}<input type="number" step="0.01" value={form.estReplReserve} onChange={e => set("estReplReserve", e.target.value)} style={iS} /></div>
                    <div>{lbl("Est. Low Cap Rate %")}<input type="number" step="0.25" value={form.estLowCapRate} onChange={e => set("estLowCapRate", e.target.value)} style={iS} /></div>
                    <div>{lbl("Est. High Cap Rate %")}<input type="number" step="0.25" value={form.estHighCapRate} onChange={e => set("estHighCapRate", e.target.value)} style={iS} /></div>
                  </div>
                  {/* Live pro forma output */}
                  <div style={{ background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: DS.r.md, overflow: "hidden" }}>
                    {[
                      ["Potential Gross Income",   pgi,      false, true],
                      ["Less: Vacancy",            -lessVac, false, false],
                      ["Less: Credit Loss",        -lessCL,  false, false],
                      ["Effective Gross Income",   egi,      true,  true],
                      ["Less: Property Expense",   -lessProp,false, false],
                      ["Less: Mgmt. Fee",          -lessMgmt,false, false],
                      ["Pro Forma NOI after vacancy", noi,   true,  true],
                      ["Less: Reserves",           -lessRes, false, false],
                      ["Pro Forma NCF:",           ncf,      true,  true],
                    ].map(([label, val, bold, pos]) => (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 12px", borderBottom: `1px solid ${DS.border}`, background: bold ? DS.accent + "0d" : "transparent" }}>
                        <span style={{ color: bold ? DS.text : DS.textSub, fontSize: 11, fontWeight: bold ? DS.fw.bold : 400 }}>{label}</span>
                        <span style={{ color: bold ? DS.accent : val < 0 ? "#f87171" : DS.textSub, fontSize: 11, fontFamily: "'DM Mono', monospace", fontWeight: bold ? DS.fw.bold : 400 }}>
                          {val !== 0 ? (val < 0 ? "(" : "") + "$\u00a0" + Math.round(Math.abs(val)).toLocaleString() + (val < 0 ? ")" : "") : "$\u00a00"}
                        </span>
                      </div>
                    ))}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: `2px solid ${DS.border}` }}>
                      {[["Low Price\n(High Cap)", incLow, lowCap], ["High Price\n(Low Cap)", incHigh, highCap]].map(([label, val, cap]) => (
                        <div key={label} style={{ padding: "8px 12px", borderRight: `1px solid ${DS.border}` }}>
                          <div style={{ color: DS.textFaint, fontSize: 9, textTransform: "uppercase", fontWeight: DS.fw.bold, marginBottom: 2 }}>{label.split("\n")[0]}<br />{label.split("\n")[1]}</div>
                          <div style={{ color: DS.blue, fontSize: 14, fontWeight: DS.fw.black, fontFamily: "'DM Mono', monospace" }}>{fD(val)}</div>
                          <div style={{ color: DS.textFaint, fontSize: 10 }}>@ {cap}% cap</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ padding: "0 16px 14px" }}>{lbl("Comments")}<textarea value={form.incomeComments} onChange={e => set("incomeComments", e.target.value)} rows={2} style={{ ...iS, resize: "vertical", fontSize: 11, fontStyle: "italic", color: DS.textSub }} /></div>
              </div>
            )}

            {/* ── PAGE 2 — CONCLUSION ── */}
            {activeSection === "Conclusion" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.lg, overflow: "hidden" }}>
                  <SectionHeader title="ANALYSIS CONCLUSION — BROKER PRICE OPINION" color="#7c2d12" />
                  <div style={{ padding: "14px 16px" }}>
                    {/* Value summary banner */}
                    <div style={{ background: "linear-gradient(135deg,#0a1424,#0f1e0f)", border: `2px solid ${DS.accent}44`, borderRadius: DS.r.md, padding: "16px 20px", textAlign: "center", marginBottom: 14 }}>
                      <div style={{ color: DS.textMute, fontSize: DS.fs.xs, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Estimated Market Value Range</div>
                      <div style={{ color: DS.accent, fontSize: 28, fontWeight: DS.fw.black, fontFamily: "'DM Mono', monospace" }}>{fD(finalLow)} – {fD(finalHigh)}</div>
                      <div style={{ color: DS.text, fontWeight: DS.fw.bold, marginTop: 6 }}>
                        As-is Estimate: <span style={{ color: DS.accent }}>{fD(finalAsIs)}</span>
                        {subSF > 0 && <span style={{ color: DS.textMute, fontSize: DS.fs.sm }}> · {fPsf(finalAsIs)}</span>}
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
                      {[["Low Price Indication", "saleLowOverride", finalLow, DS.blue], ["High Price Indication", "saleHighOverride", finalHigh, DS.blue], ["Median / As-is", "asIsValue", finalAsIs, DS.accent], ["Lower End", "lowerEndValue", finalLow, DS.green]].map(([label, k, auto, color]) => (
                        <div key={k} style={{ background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: DS.r.md, padding: "10px 12px" }}>
                          {lbl(label)}
                          <input type="number" value={form[k]} onChange={e => set(k, e.target.value)} placeholder={Math.round(auto).toString()}
                            style={{ ...iS, color, fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: DS.fw.black }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ marginBottom: 10 }}>{lbl("Conclusion Comments")}<textarea value={form.conclusionComments} onChange={e => set("conclusionComments", e.target.value)} rows={4} style={{ ...iS, resize: "vertical", fontSize: 11, color: DS.textSub }} placeholder="Based on the above analysis, the estimated market value of the subject property is..." /></div>
                  </div>
                </div>
                {/* Broker info */}
                <div style={{ background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.lg, overflow: "hidden" }}>
                  <SectionHeader title="BROKER INFORMATION" color="#1e293b" />
                  <div style={{ padding: "14px 16px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                    {[["Broker Name", brokerName], ["Company", brokerage], ["Phone", brokerPhone], ["Email", brokerEmail], ["License #", brokerLicense]].map(([label, val]) => (
                      <div key={label}>
                        <div style={{ color: DS.textFaint, fontSize: 9, fontWeight: DS.fw.black, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 3 }}>{label}</div>
                        <div style={{ color: val ? DS.text : DS.textFaint, fontSize: DS.fs.md, fontWeight: DS.fw.semi }}>
                          {val || <span style={{ fontSize: 10 }}>Not set — update in ⚙ Settings</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={saveBov} style={{ background: DS.accent, border: "none", color: "#0a0f1a", padding: "10px 24px", borderRadius: DS.r.sm, cursor: "pointer", fontSize: DS.fs.md, fontWeight: DS.fw.black }}>Save BOV</button>
              <button onClick={printBOV} style={{ background: DS.panel, border: `1px solid ${DS.border}`, color: DS.text, padding: "10px 20px", borderRadius: DS.r.sm, cursor: "pointer", fontSize: DS.fs.md, fontWeight: DS.fw.semi }}>🖨 Print / Export PDF</button>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: DS.panel, border: `1px dashed ${DS.border}`, borderRadius: DS.r.lg, minHeight: 340 }}>
            <div style={{ textAlign: "center", color: DS.textFaint }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <div style={{ fontSize: DS.fs.md, fontWeight: DS.fw.semi, color: DS.textSub }}>Select a saved BOV or create a new one</div>
              <div style={{ fontSize: DS.fs.sm, marginTop: 4, color: DS.textFaint }}>Full SVN BPO format · Property ID → Market → Site → Comps → Income → Conclusion</div>
              <button onClick={openNew} style={{ marginTop: 16, background: DS.accent, border: "none", color: "#0a0f1a", padding: "9px 20px", borderRadius: DS.r.sm, cursor: "pointer", fontSize: DS.fs.md, fontWeight: DS.fw.black }}>+ New BOV</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Leaflet Map Hook ───────────────────────────────────────────
function useLeaflet() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (window.L) { setLoaded(true); return; }
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    s.onload = () => setLoaded(true);
    document.head.appendChild(s);
  }, []);
  return loaded;
}

// ── Auto-geocode hook using Nominatim ─────────────────────────
function useGeocode(items, getAddress) {
  const [coords, setCoords] = useState({});
  const defaultState = localStorage.getItem("cre-default-state") || "Indiana";
  useEffect(() => {
    items.forEach(item => {
      const rawAddr = getAddress(item);
      if (!rawAddr) return;
      const key = item.id || item.sm || rawAddr;
      if (coords[key]) return;
      // Append default state to bias results geographically
      const addr = rawAddr.toLowerCase().includes(defaultState.toLowerCase())
        ? rawAddr
        : `${rawAddr}, ${defaultState}`;
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addr)}&format=json&limit=1&countrycodes=us`;
      fetch(url, { headers: { 'Accept-Language': 'en', 'User-Agent': 'CRE-CRM/1.0' } })
        .then(r => r.json())
        .then(data => {
          if (data && data[0]) {
            setCoords(prev => ({ ...prev, [key]: { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } }));
          }
        })
        .catch(() => {});
    });
  }, [items.map(i => getAddress(i)).join(',')]);
  return coords;
}

// ── Leaflet Map Component (comps) ──────────────────────────────
function CompsLeafletMap({ comps }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const leafletLoaded = useLeaflet();

  // Use manually set coords OR auto-geocode from address
  const compsNeedingGeocode = comps.filter(c => !c.lat && !c.lng && (c.address || c.name));
  const geocoded = useGeocode(compsNeedingGeocode, c => c.address || c.name || '');

  const resolvedComps = comps.map(c => {
    const key = c.id || c.address || c.name;
    const manualCoords = c.lat && c.lng ? { lat: parseFloat(c.lat), lng: parseFloat(c.lng) } : null;
    const autoCoords = geocoded[key] || null;
    return { ...c, _lat: (manualCoords || autoCoords)?.lat, _lng: (manualCoords || autoCoords)?.lng };
  });

  const mappable = resolvedComps.filter(c => c._lat && c._lng);

  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mappable.length === 0) return;
    const L = window.L;
    if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    const center = [mappable.reduce((s,c)=>s+c._lat,0)/mappable.length, mappable.reduce((s,c)=>s+c._lng,0)/mappable.length];
    const map = L.map(mapRef.current, { center, zoom: 11 });
    mapInstanceRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
    const saleIcon = L.divIcon({ className:'', html:`<div style="width:13px;height:13px;background:#3b82f6;border:2px solid #fff;border-radius:50%;box-shadow:0 0 6px #3b82f688"></div>`, iconSize:[13,13], iconAnchor:[6,6] });
    const leaseIcon = L.divIcon({ className:'', html:`<div style="width:13px;height:13px;background:#10b981;border:2px solid #fff;border-radius:50%;box-shadow:0 0 6px #10b98188"></div>`, iconSize:[13,13], iconAnchor:[6,6] });
    mappable.forEach(c => {
      const icon = c.compType === 'Sale' ? saleIcon : leaseIcon;
      const psf = c.compType === 'Sale' ? (c.psfSale > 0 ? `$${parseFloat(c.psfSale).toFixed(2)}/SF` : '—') : (c.psfLease > 0 ? `$${parseFloat(c.psfLease).toFixed(3)}/SF/mo` : '—');
      const popup = `<strong style="color:#f1f5f9">${c.name || c.address || '—'}</strong><br/><span style="color:#94a3b8">${c.submarket||''} · ${c.subtype||''}</span><br/><span style="color:${c.compType==='Sale'?'#60a5fa':'#34d399'};font-weight:700">${c.compType}</span> ${c.sqft?parseInt(c.sqft).toLocaleString()+' SF':''}<br/><strong style="color:#f59e0b">${psf}</strong>${c.closeDate?`<br/><span style="color:#64748b">${new Date(c.closeDate+'T00:00:00').toLocaleDateString('en-US',{month:'short',year:'numeric'})}</span>`:''}`;
      L.marker([c._lat, c._lng], { icon }).addTo(map).bindPopup(popup);
    });
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, [leafletLoaded, JSON.stringify(mappable.map(c=>[c._lat,c._lng,c.id]))]);

  if (!leafletLoaded) return <div style={{ height:380, display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b', fontSize:13 }}>Loading map...</div>;

  const geocodingCount = compsNeedingGeocode.length - Object.keys(geocoded).length;

  return (
    <div>
      {geocodingCount > 0 && <div style={{ color: DS.accent, fontSize: DS.fs.xs, marginBottom: 6 }}>⏳ Auto-locating {geocodingCount} comp address{geocodingCount !== 1 ? 'es' : ''} on map...</div>}
      {mappable.length === 0 && !geocodingCount
        ? <div style={{ height:100, display:'flex', alignItems:'center', justifyContent:'center', color:DS.textFaint, fontSize:DS.fs.sm, background:DS.bg, borderRadius:DS.r.md, border:`1px dashed ${DS.border}` }}>No comps with addresses found. Add an address to each comp to place it on the map.</div>
        : <div ref={mapRef} style={{ height: 400, borderRadius: 12, overflow:'hidden' }} />
      }
      <div style={{ display:'flex', gap:16, marginTop:8, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}><div style={{ width:10, height:10, borderRadius:'50%', background:'#3b82f6' }}/><span style={{ color:'#94a3b8', fontSize:11 }}>Sale ({mappable.filter(c=>c.compType==='Sale').length})</span></div>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}><div style={{ width:10, height:10, borderRadius:'50%', background:'#10b981' }}/><span style={{ color:'#94a3b8', fontSize:11 }}>Lease ({mappable.filter(c=>c.compType==='Lease').length})</span></div>
        <span style={{ color:'#475569', fontSize:10 }}>Addresses auto-located via OpenStreetMap · {mappable.length} of {comps.length} comps mapped</span>
      </div>
    </div>
  );
}

// ── Leaflet Map Component (submarkets) ─────────────────────────
function SubmarketLeafletMap({ rows }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const leafletLoaded = useLeaflet();
  const COLORS = ['#f59e0b','#3b82f6','#10b981','#8b5cf6','#f97316','#ec4899','#06b6d4','#84cc16','#f43f5e','#a78bfa'];

  // Auto-geocode submarkets that have no coords using their name as search query
  const rowsNeedingGeocode = rows.filter(r => !r.lat && !r.lng);
  const geocoded = useGeocode(rowsNeedingGeocode.map(r=>({id:r.sm, sm:r.sm})), r => r.sm);

  const resolvedRows = rows.map(r => {
    const manual = r.lat && r.lng ? { lat: r.lat, lng: r.lng } : null;
    const auto = geocoded[r.sm] || null;
    return { ...r, _lat: (manual || auto)?.lat, _lng: (manual || auto)?.lng };
  });
  const mappable = resolvedRows.filter(r => r._lat && r._lng);

  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mappable.length === 0) return;
    const L = window.L;
    if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    const center = [mappable.reduce((s,r)=>s+r._lat,0)/mappable.length, mappable.reduce((s,r)=>s+r._lng,0)/mappable.length];
    const map = L.map(mapRef.current, { center, zoom: 10 });
    mapInstanceRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
    mappable.forEach((r, i) => {
      const color = COLORS[i % COLORS.length];
      const pipeline = r.active.reduce((s,d)=>s+(d.totalValue||0),0);
      const size = Math.max(20, Math.min(44, 14 + r.smDeals.length * 5));
      const icon = L.divIcon({ className:'', html:`<div style="width:${size}px;height:${size}px;background:${color};border:3px solid #fff;border-radius:50%;box-shadow:0 0 12px ${color}88;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:${size>28?11:9}px">${r.smDeals.length||''}</div>`, iconSize:[size,size], iconAnchor:[size/2,size/2] });
      const popup = `<strong style="color:#f1f5f9;font-size:13px">${r.sm}</strong><br/><span style="color:#94a3b8">${r.smDeals.length} deals · ${r.smListings?r.smListings.length:0} listings · ${r.smComps.length} comps</span>${pipeline>0?`<br/><strong style="color:#f59e0b">$${Math.round(pipeline/1000)}K pipeline</strong>`:''}${r.commissions>0?`<br/><span style="color:#34d399">$${Math.round(r.commissions/1000)}K earned</span>`:''}`;
      L.marker([r._lat, r._lng], { icon }).addTo(map).bindPopup(popup);
    });
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, [leafletLoaded, JSON.stringify(mappable.map(r=>[r._lat,r._lng,r.sm]))]);

  if (!leafletLoaded) return <div style={{ height:360, display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b' }}>Loading map...</div>;

  const geocodingCount = rowsNeedingGeocode.length - Object.keys(geocoded).length;

  return (
    <div>
      {geocodingCount > 0 && <div style={{ color: DS.accent, fontSize: DS.fs.xs, marginBottom: 6 }}>⏳ Auto-locating {geocodingCount} submarket{geocodingCount!==1?'s':''}...</div>}
      {mappable.length === 0 && !geocodingCount
        ? <div style={{ height:100, display:'flex', alignItems:'center', justifyContent:'center', color:DS.textFaint, fontSize:DS.fs.sm, background:DS.bg, borderRadius:DS.r.md, border:`1px dashed ${DS.border}` }}>Enter submarket names that match real places (e.g. "Franklin, Indiana") to auto-locate them.</div>
        : <div ref={mapRef} style={{ height: 360, borderRadius: 12, overflow:'hidden' }} />
      }
      <div style={{ color:'#475569', fontSize:10, marginTop:6 }}>Bubble size = # of deals · Auto-located via OpenStreetMap · {mappable.length}/{rows.length} submarkets mapped</div>
    </div>
  );
}


export default function PipelineDashboard() {
  const [deals, setDeals] = useState(() => {
    try { const s = localStorage.getItem("cre-industrial-v5"); return s ? JSON.parse(s) : initialDeals; } catch { return initialDeals; }
  });
  const [listings, setListings] = useState(() => {
    try { const s = localStorage.getItem("cre-listings-v1"); return s ? JSON.parse(s) : initialListings; } catch { return initialListings; }
  });
  const [campaigns, setCampaigns] = useState(() => {
    try { const s = localStorage.getItem("cre-campaigns-v1"); return s ? JSON.parse(s) : initialProspecting; } catch { return initialProspecting; }
  });
  const [comps, setComps] = useState(() => {
    try { const s = localStorage.getItem("cre-comps-v1"); return s ? JSON.parse(s) : initialComps; } catch { return initialComps; }
  });
  const [submarketList, setSubmarketList] = useState(() => {
    try { const s = localStorage.getItem("cre-submarkets-v1"); return s ? JSON.parse(s) : DEFAULT_SUBMARKETS; } catch { return DEFAULT_SUBMARKETS; }
  });
  const [contacts, setContacts] = useState(() => {
    try { const s = localStorage.getItem("cre-contacts-v1"); return s ? JSON.parse(s) : initialContacts; } catch { return initialContacts; }
  });
  const [tasks, setTasks] = useState(() => {
    try { const s = localStorage.getItem("cre-tasks-v1"); return s ? JSON.parse(s) : initialTasks; } catch { return initialTasks; }
  });
  const [expenses, setExpenses] = useState(() => {
    try { const s = localStorage.getItem("cre-expenses-v1"); return s ? JSON.parse(s) : initialExpenses; } catch { return initialExpenses; }
  });
  const [properties, setProperties] = useState(() => {
    try { const s = localStorage.getItem("cre-properties-v1"); return s ? JSON.parse(s) : initialProperties; } catch { return initialProperties; }
  });
  const [gciGoal, setGciGoal] = useState(() => {
    try { const s = localStorage.getItem("cre-pipeline-goal"); return s ? parseFloat(s) : 500000; } catch { return 500000; }
  });

  useEffect(() => { localStorage.setItem("cre-industrial-v5", JSON.stringify(deals)); }, [deals]);
  useEffect(() => { localStorage.setItem("cre-listings-v1", JSON.stringify(listings)); }, [listings]);
  useEffect(() => { localStorage.setItem("cre-campaigns-v1", JSON.stringify(campaigns)); }, [campaigns]);
  useEffect(() => { localStorage.setItem("cre-comps-v1", JSON.stringify(comps)); }, [comps]);
  useEffect(() => { localStorage.setItem("cre-submarkets-v1", JSON.stringify(submarketList)); }, [submarketList]);
  useEffect(() => { localStorage.setItem("cre-contacts-v1", JSON.stringify(contacts)); }, [contacts]);
  useEffect(() => { localStorage.setItem("cre-tasks-v1", JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem("cre-expenses-v1", JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem("cre-properties-v1", JSON.stringify(properties)); }, [properties]);
  useEffect(() => { localStorage.setItem("cre-pipeline-goal", String(gciGoal)); }, [gciGoal]);

  const [activeTab, setActiveTab] = useState("home");
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setShowSearch(s => !s); }
      if (e.key === "Escape") { setShowSearch(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  const [modal, setModal] = useState(null);
  const [quickAdd, setQuickAdd] = useState(false);
  const [activityDeal, setActivityDeal] = useState(null);
  const [richNotesDeal, setRichNotesDeal] = useState(null);
  const [documentsDeal, setDocumentsDeal] = useState(null);
  const [timelineDeal, setTimelineDeal] = useState(null);
  const [winLossDeal, setWinLossDeal] = useState(null);
  const [closedFollowUp, setClosedFollowUp] = useState(null);
  const [inlineEdit, setInlineEdit] = useState(null);
  const [showDailySync, setShowDailySync] = useState(false);
  const [checklistDeal, setChecklistDeal] = useState(null);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [filters, setFilters] = useState({ search: "", stages: [], subtypes: [], dealTypes: [], leadSources: [], dateFrom: "", dateTo: "" });
  const [sortKey, setSortKey] = useState("expectedClose");
  const [sortDir, setSortDir] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const enriched = useMemo(() => deals.map(calcDeal), [deals]);
  const activeEnriched = enriched.filter(d => d.stage !== "Lost");
  const agingDeals = activeEnriched.filter(d => d.isAging);
  const dueTodayDeals = activeEnriched.filter(d => d.isDueToday || d.isOverdue);

  const filtered = useMemo(() => enriched.filter(d => {
    if (filters.search && !`${d.name} ${d.client} ${d.counterparty} ${d.notes} ${d.leadSource} ${d.subtype}`.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.stages.length && !filters.stages.includes(d.stage)) return false;
    if (filters.subtypes.length && !filters.subtypes.includes(d.subtype)) return false;
    if (filters.dealTypes.length && !filters.dealTypes.includes(d.dealType)) return false;
    if (filters.leadSources.length && !filters.leadSources.includes(d.leadSource)) return false;
    if (filters.dateFrom && d.expectedClose < filters.dateFrom) return false;
    if (filters.dateTo && d.expectedClose > filters.dateTo) return false;
    return true;
  }).sort((a, b) => {
    let av = a[sortKey] ?? "", bv = b[sortKey] ?? "";
    if (typeof av === "string") { av = av.toLowerCase(); bv = bv.toLowerCase(); }
    return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  }), [enriched, filters, sortKey, sortDir]);

  const totalPipeline = activeEnriched.reduce((s, d) => s + d.totalValue, 0);
  const totalWeighted = activeEnriched.reduce((s, d) => s + d.weighted, 0);
  const totalSqft = activeEnriched.reduce((s, d) => s + (d.sqft || 0), 0);
  const closedDeals = enriched.filter(d => d.stage === "Closed");
  const lostDeals = enriched.filter(d => d.stage === "Lost");
  const closedYTD = closedDeals.filter(d => d.expectedClose?.startsWith(String(thisYear))).reduce((s, d) => s + d.netCommission, 0);
  const activeCount = activeEnriched.filter(d => d.stage !== "Closed").length;
  const gciProgress = Math.min((closedYTD / gciGoal) * 100, 100);
  const winRate = (closedDeals.length + lostDeals.length) > 0 ? Math.round(closedDeals.length / (closedDeals.length + lostDeals.length) * 100) : null;
  const lossBreakdown = LOSS_REASONS.map(r => ({ reason: r, count: lostDeals.filter(d => d.lossReason === r).length })).filter(x => x.count > 0);
  const monthlyData = MONTHS.map((month, i) => {
    const ms = String(thisYear) + "-" + String(i + 1).padStart(2, "0");
    const msLY = String(thisYear - 1) + "-" + String(i + 1).padStart(2, "0");
    return {
      month,
      commission: closedDeals.filter(d => d.expectedClose?.startsWith(ms)).reduce((s, d) => s + d.netCommission, 0),
      lastYear: closedDeals.filter(d => d.expectedClose?.startsWith(msLY)).reduce((s, d) => s + d.netCommission, 0),
      goal: gciGoal / 12
    };
  });
  const stageChartData = STAGES.filter(s => s !== "Lost").map(stage => ({
    stage, "Deals": enriched.filter(d => d.stage === stage).length,
    "Value": enriched.filter(d => d.stage === stage).reduce((s, d) => s + d.totalValue, 0),
  }));
  const sourceData = LEAD_SOURCES.map(src => ({
    source: src, deals: enriched.filter(d => d.leadSource === src).length,
    commission: enriched.filter(d => d.leadSource === src && d.stage === "Closed").reduce((s, d) => s + d.netCommission, 0),
  })).filter(s => s.deals > 0).sort((a,b) => b.deals - a.deals);
  const lastYearClosed = closedDeals.filter(d => d.expectedClose?.startsWith(String(thisYear - 1))).reduce((s,d) => s + d.netCommission, 0);
  const lastYearDeals = closedDeals.filter(d => d.expectedClose?.startsWith(String(thisYear - 1))).length;
  const thisYearDeals = closedDeals.filter(d => d.expectedClose?.startsWith(String(thisYear))).length;
  const yoyCommPct = lastYearClosed > 0 ? ((closedYTD - lastYearClosed) / lastYearClosed * 100) : null;
  const yoyDealsPct = lastYearDeals > 0 ? ((thisYearDeals - lastYearDeals) / lastYearDeals * 100) : null;

  const saveModal = (form) => {
    const existing = deals.find(x => x.id === form.id);
    // Auto-track stage history when stage changes
    let stageHistory = form.stageHistory || [];
    if (!existing) {
      // New deal — initialize history with current stage
      stageHistory = [{ stage: form.stage || "Prospect", enteredDate: today, note: "Deal created" }];
    } else if (existing.stage !== form.stage) {
      // Stage changed — append new entry
      stageHistory = [...(existing.stageHistory || [{ stage: existing.stage, enteredDate: today }]),
        { stage: form.stage, enteredDate: today, note: `Moved from ${existing.stage}` }];
    }
    const d = { ...form, dealTotal: parseFloat(form.dealTotal) || 0, monthlyRent: parseFloat(form.monthlyRent) || 0, leaseTerm: parseFloat(form.leaseTerm) || 0, sqft: parseFloat(form.sqft) || 0, commissionRate: parseFloat(form.commissionRate) || 0, probability: parseFloat(form.probability) || 0, daysInStage: parseInt(form.daysInStage) || 0, splitPct: parseFloat(form.splitPct) || 100, activities: form.activities || [], richNotes: form.richNotes || [], tags: form.tags || [], documents: form.documents || [], stageHistory };
    if (form.id) setDeals(prev => prev.map(x => x.id === form.id ? d : x));
    else setDeals(prev => [...prev, { ...d, id: Date.now() }]);
    setModal(null);
  };
  const saveQuickAdd = (form) => {
    const d = { name: form.name, client: "", counterparty: "", stage: form.stage || "Prospect", dealType: form.dealType || "Sale", repType: "Seller/Landlord Rep", subtype: "Distribution", sqft: parseFloat(form.sqft) || 0, dealTotal: 0, monthlyRent: 0, leaseTerm: 0, commissionRate: 5, probability: 25, expectedClose: "", notes: "", broker: "Me", daysInStage: 0, activities: [], followUpDate: "", leadSource: "Other", coBroker: "", splitPct: 100, won: null, lossReason: "", id: Date.now(), richNotes: [], submarket: "Northeast", tags: [], documents: [], stageHistory: [{ stage: form.stage || "Prospect", enteredDate: today, note: "Deal created (quick add)" }] };
    toast("Deal added");
    setDeals(prev => [...prev, d]);
    setQuickAdd(false);
  };
  const saveActivity = (updated) => { toast("Activity logged"); setDeals(prev => prev.map(d => d.id === updated.id ? updated : d)); setActivityDeal(updated); };
  const saveRichNotes = (updated) => { toast("Note saved"); setDeals(prev => prev.map(d => d.id === updated.id ? updated : d)); setRichNotesDeal(updated); };
  const saveDocuments = (updated) => { toast("Documents saved"); setDeals(prev => prev.map(d => d.id === updated.id ? updated : d)); setDocumentsDeal(updated); };
  const saveWinLoss = (updated) => { toast(updated.stage === "Closed" ? "Deal marked won!" : "Deal marked lost", updated.stage === "Closed" ? "success" : "info");
    const existing = deals.find(x => x.id === updated.id);
    const newStage = updated.won ? "Closed" : "Lost";
    const stageHistory = [...(existing?.stageHistory || [{ stage: existing?.stage || "Unknown", enteredDate: today }]),
      { stage: newStage, enteredDate: today, note: updated.won ? "Deal closed/won" : `Lost: ${updated.lossReason||""}` }];
    const saved = { ...updated, stageHistory };
    setDeals(prev => prev.map(d => d.id === updated.id ? saved : d));
    setWinLossDeal(null);
    if (updated.won) setTimeout(() => setClosedFollowUp({ deal: saved, wasWon: true }), 300);
  };
  const deleteDeal = (id) => { if (window.confirm("Delete this deal?")) { setDeals(prev => prev.filter(d => d.id !== id)); toast("Deal deleted", "error"); } };
  const sortBy = (key) => { if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortKey(key); setSortDir("asc"); } };
  const toggleFilter = (key, val) => setFilters(f => ({ ...f, [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val] }));

  const saveInlineField = (dealId, field, value) => {
    let update = { [field]: value };
    if (field === "stage") {
      const d = deals.find(x => x.id === dealId);
      if (d && d.stage !== value) {
        update.stageHistory = [...(d.stageHistory || []), { stage: value, enteredDate: today, note: "Updated inline" }];
        const stageProbMap = { "Prospect": 20, "Proposal": 45, "LOI": 65, "Under Contract": 85, "Closed": 100, "Lost": 0 };
        if (stageProbMap[value] !== undefined && !d.probability) update.probability = stageProbMap[value];
      }
    }
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, ...update } : d));
    setInlineEdit(null);
    toast("Updated");
  };

  const saveChecklist = (updated) => {
    setDeals(prev => prev.map(d => d.id === updated.id ? updated : d));
    toast("Checklist saved");
  };

  const handleCSVImport = (type, records) => {
    if (type === "deals") {
      setDeals(prev => [...prev, ...records]);
      toast(`${records.length} deals imported`);
    } else {
      setContacts(prev => [...prev, ...records]);
      toast(`${records.length} contacts imported`);
    }
  };

  const printReport = () => {
    const win = window.open("", "_blank");
    const activeDeals = enriched.filter(d => d.stage !== "Lost");
    const closedD = enriched.filter(d => d.stage === "Closed");
    const lostD = enriched.filter(d => d.stage === "Lost");
    const wr = (closedD.length + lostD.length) > 0 ? Math.round(closedD.length / (closedD.length + lostD.length) * 100) : null;
    const stageRows = STAGES.filter(s=>s!=="Lost").map(s => {
      const sd = enriched.filter(d=>d.stage===s);
      return `<tr><td>${s}</td><td>${sd.length}</td><td>$${Math.round(sd.reduce((a,d)=>a+d.totalValue,0)).toLocaleString()}</td><td>$${Math.round(sd.reduce((a,d)=>a+d.netCommission,0)).toLocaleString()}</td><td>$${Math.round(sd.reduce((a,d)=>a+d.weighted,0)).toLocaleString()}</td></tr>`;
    }).join("");
    const dealRows = activeDeals.map(d => `
      <tr>
        <td><strong>${d.name}</strong><br/><span style="color:#64748b;font-size:11px">${(d.tags||[]).join(", ")||""}</span></td>
        <td>${d.client||"—"}</td>
        <td>${d.stage}</td>
        <td>${d.dealType}</td>
        <td>${d.submarket||"—"}</td>
        <td>${d.sqft?d.sqft.toLocaleString():"—"}</td>
        <td>$${Math.round(d.totalValue).toLocaleString()}</td>
        <td>$${Math.round(d.netCommission).toLocaleString()}</td>
        <td>${d.probability}%</td>
        <td>$${Math.round(d.weighted).toLocaleString()}</td>
        <td>${d.expectedClose||"—"}</td>
        <td>${d.daysInStage}d</td>
      </tr>`).join("");
    const dateStr = new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
    win.document.write(`<!DOCTYPE html><html><head><title>Industrial Pipeline Report</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: 'Helvetica Neue', Arial, sans-serif; color:#1e293b; background:#fff; padding:32px; font-size:13px; }
      .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; padding-bottom:20px; border-bottom:3px solid #f59e0b; }
      .logo { background:#f59e0b; color:#0d1826; padding:10px 16px; border-radius:8px; font-weight:900; font-size:14px; letter-spacing:0.5px; }
      .title { font-size:26px; font-weight:900; color:#0f172a; margin-bottom:3px; }
      .subtitle { color:#64748b; font-size:12px; }
      .kpi-row { display:flex; gap:12px; margin-bottom:24px; }
      .kpi { flex:1; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:14px 16px; }
      .kpi-label { font-size:10px; color:#94a3b8; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px; }
      .kpi-value { font-size:22px; font-weight:900; color:#0f172a; }
      .kpi-sub { font-size:10px; color:#94a3b8; margin-top:2px; }
      .section-title { font-size:13px; font-weight:800; color:#0f172a; border-left:3px solid #f59e0b; padding-left:10px; margin:22px 0 12px; text-transform:uppercase; letter-spacing:0.5px; }
      table { width:100%; border-collapse:collapse; font-size:11px; }
      th { background:#f1f5f9; color:#475569; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; padding:8px 10px; text-align:left; border-bottom:2px solid #e2e8f0; }
      td { padding:8px 10px; border-bottom:1px solid #f1f5f9; color:#334155; vertical-align:top; }
      tr:hover td { background:#fafafa; }
      .badge { display:inline-block; padding:2px 8px; border-radius:20px; font-size:9px; font-weight:700; }
      .tag { background:#eff6ff; color:#3b82f6; border:1px solid #bfdbfe; }
      .footer { margin-top:32px; padding-top:16px; border-top:1px solid #e2e8f0; color:#94a3b8; font-size:10px; display:flex; justify-content:space-between; }
      @media print { body { padding:20px; } button { display:none; } }
    </style></head><body>
    <div class="header">
      <div>
        <div class="title">Industrial CRE Pipeline</div>
        <div class="subtitle">${dateStr}</div>
      </div>
      <div class="logo">INDUSTRIAL<br/>PIPELINE</div>
    </div>

    <div class="kpi-row">
      <div class="kpi"><div class="kpi-label">Total Pipeline</div><div class="kpi-value">$${Math.round(totalPipeline).toLocaleString()}</div><div class="kpi-sub">${activeDeals.filter(d=>d.stage!=="Closed").length} active deals</div></div>
      <div class="kpi"><div class="kpi-label">Weighted Pipeline</div><div class="kpi-value">$${Math.round(totalWeighted).toLocaleString()}</div><div class="kpi-sub">Probability-adjusted</div></div>
      <div class="kpi"><div class="kpi-label">Closed YTD</div><div class="kpi-value">$${Math.round(closedYTD).toLocaleString()}</div><div class="kpi-sub">${closedD.length} deals closed</div></div>
      <div class="kpi"><div class="kpi-label">GCI Goal Progress</div><div class="kpi-value">${gciProgress.toFixed(1)}%</div><div class="kpi-sub">of $${Math.round(gciGoal).toLocaleString()}</div></div>
      <div class="kpi"><div class="kpi-label">Win Rate</div><div class="kpi-value">${wr !== null ? wr+"%" : "N/A"}</div><div class="kpi-sub">${closedD.length}W / ${lostD.length}L</div></div>
    </div>

    <div class="section-title">Pipeline by Stage</div>
    <table><thead><tr><th>Stage</th><th>Deals</th><th>Total Value</th><th>Net Commission</th><th>Weighted</th></tr></thead>
    <tbody>${stageRows}</tbody></table>

    <div class="section-title">Active Deals</div>
    <table><thead><tr><th>Property</th><th>Client</th><th>Stage</th><th>Type</th><th>Submarket</th><th>Sq Ft</th><th>Value</th><th>Net Comm</th><th>Prob</th><th>Weighted</th><th>Close Date</th><th>Days</th></tr></thead>
    <tbody>${dealRows}</tbody></table>

    <div class="footer">
      <span>Industrial Pipeline CRE Tracker · Confidential</span>
      <span>Generated ${dateStr}</span>
    </div>
    <br/><button onclick="window.print()" style="background:#f59e0b;border:none;padding:10px 24px;border-radius:8px;font-weight:800;font-size:14px;cursor:pointer;">️ Print / Save as PDF</button>
    </body></html>`);
    win.document.close();
  };

  const exportCSV = () => {
    const h = ["Property","Client","Counterparty","Stage","Deal Type","Rep Type","Subtype","Submarket","Sq Ft","Total Value","$/SF","Comm Rate","Net Commission","Probability","Weighted","Lead Source","Co-Broker","Split%","Follow-up","Close Date","Days in Stage","Won/Lost","Loss Reason","Notes"];
    const r = filtered.map(d => [d.name,d.client,d.counterparty,d.stage,d.dealType,d.repType,d.subtype,d.submarket||"",d.sqft,d.totalValue,(d.pricePerSqft||0).toFixed(2),d.commissionRate+"%",d.netCommission.toFixed(0),d.probability+"%",d.weighted.toFixed(0),d.leadSource,d.coBroker,d.splitPct+"%",d.followUpDate,d.expectedClose,d.daysInStage,d.won===true?"Won":d.won===false?"Lost":"",d.lossReason,d.notes]);
    const csv = [h,...r].map(row=>row.map(c=>`"${c}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv); a.download="industrial-pipeline.csv"; a.click();
  };

  const iStyle = { background: "#070e1a", border: `1px solid ${DS.border}`, borderRadius: 8, color: "#f1f5f9", padding: "7px 11px", fontSize: 12, outline: "none", width: "100%", boxSizing: "border-box" };
  const fbtn = (active) => ({ background: active ? DS.accent : DS.panel, color: active ? "#0a0f1a" : DS.textSub, border: `1px solid ${active ? DS.accent : DS.border}`, padding: "4px 12px", borderRadius: DS.r.full, fontSize: DS.fs.xs, fontWeight: DS.fw.bold, cursor: "pointer", transition: "all 0.12s" });
  const th = (col) => ({ color: DS.textMute, fontSize: 10, fontWeight: DS.fw.bold, textAlign: "left", padding: "9px 12px", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap", letterSpacing: "0.6px", textTransform: "uppercase", background: sortKey === col ? DS.panelHi : "transparent", transition: "background 0.12s" });
  const td = { padding: "11px 12px", color: DS.textSub, fontSize: DS.fs.md, borderBottom: `1px solid ${DS.border}` };

  const pendingTasks = tasks.filter(t=>!t.done).length;
  const overdueTasks = tasks.filter(t=>!t.done&&t.dueDate&&t.dueDate<today).length;

  // Home tab urgency counts
  const followUpsDue = enriched.filter(d => d.stage !== "Closed" && d.stage !== "Lost" && d.followUpDate && d.followUpDate <= today).length;
  const urgentTasksCount = tasks.filter(t => !t.done && t.dueDate && t.dueDate <= today).length;
  const goneColdCount = enriched.filter(d => d.isAging).length;
  const outreachDueCount = contacts.filter(c => {
    if (!c.lastContact) return true;
    const days = Math.floor((new Date() - new Date(c.lastContact+"T00:00:00")) / 86400000);
    const threshold = { "Key Relationship":30, "Active":45, "Warm":60, "Cold":90 }[c.relationshipLevel] || 90;
    return days >= threshold;
  }).length;

  const criticalLeases = enriched.filter(d => {
    if (!d.leaseExpiresDate) return false;
    const days = Math.floor((new Date(d.leaseExpiresDate + "T00:00:00") - new Date()) / 86400000);
    return days <= 180;
  }).length;

  const brokerName = localStorage.getItem("cre-broker-name") || "Broker";
  const brokerage = localStorage.getItem("cre-brokerage") || "SVN";

  const NAV_GROUPS = [
    { label: "Overview", items: [
      { id: "home", label: "Home", badge: (followUpsDue.length + urgentTasksCount + goneColdCount + outreachDueCount + criticalLeases) || 0 },
      { id: "pipeline", label: "Pipeline" },
      { id: "analytics", label: "Analytics" },
      { id: "intel", label: "Intel" },
      { id: "underwriting", label: "Underwriting" },
    ]},
    { label: "Transactions", items: [
      { id: "listings", label: "Listings", badge: listings.filter(l=>l.status==="Active").length },
      { id: "bov", label: "BOV" },
      { id: "forecast", label: "Forecast" },
      { id: "timeline", label: "Timeline" },
      { id: "comps", label: "Market Comps", badge: comps.length },
      { id: "lease-radar", label: "Lease Radar" },
    ]},
    { label: "Relationships", items: [
      { id: "contacts", label: "Contacts", badge: contacts.length },
      { id: "properties", label: "Properties", badge: properties.length },
      { id: "prospecting", label: "Prospecting", badge: campaigns.length },
      { id: "submarkets", label: "Submarkets" },
    ]},
    { label: "Operations", items: [
      { id: "tasks", label: "Tasks", badge: overdueTasks > 0 ? overdueTasks : pendingTasks },
      { id: "expenses", label: "Expenses" },
    ]},
  ];

  const activeLabel = NAV_GROUPS.flatMap(g => g.items).find(i => i.id === activeTab)?.label || "";

  const NavItem = ({ item }) => {
    const isActive = activeTab === item.id;
    return (
      <button onClick={() => setActiveTab(item.id)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: sidebarCollapsed ? "center" : "space-between", gap: 8, padding: sidebarCollapsed ? "9px 4px" : "8px 16px 8px 18px", background: isActive ? `linear-gradient(90deg, ${DS.accent}14, transparent)` : "none", border: "none", borderLeft: isActive ? `2px solid ${DS.accent}` : "2px solid transparent", color: isActive ? DS.accent : DS.textMute, cursor: "pointer", fontSize: DS.fs.md, fontWeight: isActive ? DS.fw.semi : DS.fw.normal, transition: "all 0.12s", whiteSpace: "nowrap", overflow: "hidden" }}
        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = DS.textSub; e.currentTarget.style.background = DS.panelHi; }}}
        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = DS.textMute; e.currentTarget.style.background = "none"; }}}>
        {!sidebarCollapsed && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>}
        {!sidebarCollapsed && item.badge > 0 && <span style={{ background: isActive ? DS.accent : DS.borderHi, color: isActive ? DS.bg : DS.textSub, borderRadius: 20, fontSize: 9, padding: "1px 6px", fontWeight: DS.fw.black, flexShrink: 0 }}>{item.badge}</span>}
        {sidebarCollapsed && item.badge > 0 && <span style={{ position: "absolute", top: 4, right: 4, background: DS.accent, color: DS.bg, borderRadius: "50%", width: 8, height: 8, fontSize: 0 }} />}
      </button>
    );
  };

  return (
    <div className="noise-bg" style={{ background: DS.bg, minHeight: "100vh", fontFamily: "'DM Sans', system-ui, sans-serif", color: DS.text, display: "flex", flexDirection: "column", backgroundImage: "radial-gradient(ellipse 80% 50% at 20% -10%, #0f2040 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 110%, #0a1f30 0%, transparent 60%)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
        .leaflet-container { border-radius: 12px; }
        .leaflet-popup-content-wrapper { background: #0d1826; border: 1px solid #1e3a5f; border-radius: 8px; color: #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
        .leaflet-popup-tip { background: #0d1826; }
        .leaflet-popup-content { margin: 10px 14px; font-size: 12px; line-height: 1.5; }
        .leaflet-control-zoom a { background: #0d1826 !important; color: #f1f5f9 !important; border-color: #1e3a5f !important; }
        .leaflet-tile-pane { filter: brightness(0.85) saturate(0.7) hue-rotate(10deg); }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { font-size: 14px; }
        body { font-family: 'DM Sans', system-ui, sans-serif !important; background: #070e1a; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1a2d45; border-radius: 999px; }
        ::-webkit-scrollbar-thumb:hover { background: #243d5a; }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        button:focus-visible { outline: 2px solid ${DS.accent}; outline-offset: 2px; }
        input:focus, select:focus, textarea:focus { border-color: ${DS.accent}66 !important; box-shadow: 0 0 0 3px ${DS.accent}12 !important; outline: none; }
        input, select, textarea, button { font-family: 'DM Sans', system-ui, sans-serif; }
        .tab-content { animation: fadeIn 0.18s ease; }
        .card-hover { transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s; }
        .card-hover:hover { border-color: ${DS.borderHi} !important; box-shadow: 0 4px 20px rgba(0,0,0,0.4); transform: translateY(-1px); }
        .nav-item-active { position: relative; }
        .nav-item-active::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 3px; height: 60%; background: ${DS.accent}; border-radius: 0 3px 3px 0; }
        /* Noise texture overlay */
        .noise-bg::after { content: ''; position: fixed; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E"); pointer-events: none; z-index: 9998; opacity: 0.4; }
        .mono { font-family: 'DM Mono', monospace; }
        .badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; letter-spacing: 0.3px; }
        .glow-accent { box-shadow: 0 0 16px rgba(245,158,11,0.2); }
      `}</style>

      {/* ── Top bar ── */}
      <div style={{ background: "rgba(11,21,36,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: `1px solid ${DS.border}`, padding: "0 20px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, zIndex: 100, position: "sticky", top: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setSidebarCollapsed(c => !c)} style={{ background: "none", border: "none", color: DS.textMute, cursor: "pointer", padding: 4, display: "flex", alignItems: "center", borderRadius: 6 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ background: `linear-gradient(135deg, ${DS.accent} 0%, #f97316 100%)`, borderRadius: DS.r.sm, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: DS.fw.black, fontSize: 10, color: "#0a0f1a", letterSpacing: "1px", boxShadow: "0 2px 8px rgba(245,158,11,0.4)", fontFamily: "'DM Mono', monospace" }}>IND</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: DS.fw.black, color: DS.text, letterSpacing: "-0.3px" }}>Industrial Pipeline</div>
              <div style={{ fontSize: 10, color: DS.textMute }}>{brokerage}</div>
            </div>
          </div>
          <div style={{ width: 1, height: 24, background: DS.border, marginLeft: 4 }} />
          <div style={{ color: DS.textMute, fontSize: DS.fs.sm, fontWeight: DS.fw.semi }}>{activeLabel}</div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Status pills */}
          {dueTodayDeals.length > 0 && <div onClick={() => setActiveTab("pipeline")} style={{ background: DS.green + "18", border: `1px solid ${DS.green}44`, borderRadius: 20, padding: "3px 10px", fontSize: DS.fs.xs, color: DS.green, fontWeight: DS.fw.bold, cursor: "pointer" }}>{dueTodayDeals.length} follow-up{dueTodayDeals.length > 1 ? "s" : ""} due</div>}
          {agingDeals.length > 0 && <div onClick={() => setActiveTab("pipeline")} style={{ background: DS.red + "18", border: `1px solid ${DS.red}44`, borderRadius: 20, padding: "3px 10px", fontSize: DS.fs.xs, color: DS.red, fontWeight: DS.fw.bold, cursor: "pointer" }}>{agingDeals.length} gone cold</div>}
          {overdueTasks > 0 && <div onClick={() => setActiveTab("tasks")} style={{ background: DS.accent + "18", border: `1px solid ${DS.accent}44`, borderRadius: 20, padding: "3px 10px", fontSize: DS.fs.xs, color: DS.accent, fontWeight: DS.fw.bold, cursor: "pointer" }}>{overdueTasks} overdue task{overdueTasks > 1 ? "s" : ""}</div>}

          {/* Search */}
          <button onClick={() => setShowSearch(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: DS.panel, border: `1px solid ${DS.border}`, borderRadius: DS.r.md, padding: "6px 12px", color: DS.textMute, fontSize: DS.fs.sm, cursor: "pointer" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Search
            <kbd style={{ background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: 3, padding: "1px 5px", fontSize: 9, color: DS.textFaint }}>⌘K</kbd>
          </button>

          {/* Pipeline actions */}
          {activeTab === "pipeline" && <>
            <button onClick={() => setShowFilters(f => !f)} style={{ background: showFilters ? DS.borderHi : DS.panel, border: `1px solid ${DS.border}`, color: showFilters ? DS.text : DS.textSub, padding: "6px 12px", borderRadius: DS.r.sm, cursor: "pointer", fontSize: DS.fs.sm, fontWeight: showFilters ? DS.fw.semi : DS.fw.normal }}>Filters</button>
            <button onClick={printReport} style={{ background: DS.panel, border: `1px solid ${DS.border}`, color: DS.textSub, padding: "6px 12px", borderRadius: DS.r.sm, cursor: "pointer", fontSize: DS.fs.sm }}>PDF Report</button>
            <button onClick={exportCSV} style={{ background: DS.panel, border: `1px solid ${DS.border}`, color: DS.textSub, padding: "6px 12px", borderRadius: DS.r.sm, cursor: "pointer", fontSize: DS.fs.sm }}>Export CSV</button>
            <button onClick={() => setShowCSVImport(true)} style={{ background: DS.panel, border: `1px solid ${DS.border}`, color: DS.textSub, padding: "6px 12px", borderRadius: DS.r.sm, cursor: "pointer", fontSize: DS.fs.sm }}>Import CSV</button>
            <button onClick={() => setQuickAdd(true)} style={{ background: DS.panel, border: `1px solid ${DS.accent}`, color: DS.accent, padding: "6px 12px", borderRadius: DS.r.sm, cursor: "pointer", fontSize: DS.fs.sm, fontWeight: DS.fw.bold }}>Quick Add</button>
            <button onClick={() => setModal("new")} style={{ background: DS.accent, border: "none", color: "#0a0f1a", padding: "6px 14px", borderRadius: DS.r.sm, cursor: "pointer", fontSize: DS.fs.sm, fontWeight: DS.fw.black }}>+ New Deal</button>
          </>}

          {/* Settings */}
          <button onClick={() => setShowSettings(true)} style={{ background: "none", border: `1px solid ${DS.border}`, color: DS.textMute, width: 32, height: 32, borderRadius: DS.r.sm, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>

          {/* Profile */}
          <div style={{ display: "flex", alignItems: "center", gap: 9, background: DS.panelHi, border: `1px solid ${DS.borderHi}`, borderRadius: DS.r.full, padding: "5px 12px 5px 5px", cursor: "default" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg, ${DS.accent}, #f97316)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: DS.fw.black, color: "#0a0f1a", boxShadow: "0 2px 6px rgba(245,158,11,0.3)", flexShrink: 0 }}>{brokerName.charAt(0).toUpperCase()}</div>
            <span style={{ color: DS.textSub, fontSize: DS.fs.sm, fontWeight: DS.fw.semi, letterSpacing: "-0.1px" }}>{brokerName}</span>
          </div>
        </div>
      </div>

      {/* ── Body: sidebar + content ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Sidebar ── */}
        <div style={{ width: sidebarCollapsed ? 48 : 210, flexShrink: 0, background: DS.surface, borderRight: `1px solid ${DS.border}`, display: "flex", flexDirection: "column", transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)", overflowY: "auto", overflowX: "hidden", boxShadow: "2px 0 20px rgba(0,0,0,0.3)" }}>
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.label} style={{ padding: sidebarCollapsed ? "10px 0" : "14px 0 6px", borderBottom: gi < NAV_GROUPS.length - 1 ? `1px solid ${DS.border}` : "none" }}>
              {!sidebarCollapsed && <div style={{ color: DS.textFaint, fontSize: 9, fontWeight: DS.fw.black, letterSpacing: "1.2px", textTransform: "uppercase", padding: "0 16px 8px", opacity: 0.7 }}>{group.label}</div>}
              {group.items.map(item => <NavItem key={item.id} item={item} />)}
            </div>
          ))}

          {/* Sidebar footer */}
          {!sidebarCollapsed && (
            <div style={{ marginTop: "auto", padding: "14px 16px", borderTop: `1px solid ${DS.border}`, background: `linear-gradient(to top, ${DS.bg}, transparent)` }}>
              <div style={{ color: DS.textFaint, fontSize: DS.fs.xs, lineHeight: 1.7 }}>
                <div style={{ fontWeight: DS.fw.bold, color: DS.textSub, marginBottom: 1, fontSize: DS.fs.sm }}>{brokerName}</div>
                <div style={{ color: DS.textMute }}>{brokerage}</div>
                <div style={{ marginTop: 6, color: DS.textFaint, fontSize: 10 }}>{thisYear} · All data local</div>
              </div>
            </div>
          )}
        </div>

        {/* ── Main content ── */}
        <div className="tab-content" style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 18 }}>

          {activeTab === "home" && <HomeBriefing deals={deals} tasks={tasks} contacts={contacts} listings={listings} gciGoal={gciGoal} closedYTD={closedYTD} totalWeighted={totalWeighted} onNavigate={setActiveTab} onStartSync={() => setShowDailySync(true)} />}
          {activeTab === "bov" && <BOVTab comps={comps} submarketList={submarketList} brokerName={brokerName} brokerage={brokerage} />}
          {activeTab === "listings" && <ListingsTab listings={listings} setListings={setListings} submarketList={submarketList} />}
          {activeTab === "forecast" && <ForecastTab deals={deals} />}
          {activeTab === "prospecting" && <ProspectingTab campaigns={campaigns} setCampaigns={setCampaigns} deals={deals} submarketList={submarketList} />}
          {activeTab === "comps" && <MarketCompsTab comps={comps} setComps={setComps} submarketList={submarketList} />}
          {activeTab === "submarkets" && <SubmarketTab deals={deals} listings={listings} comps={comps} submarketList={submarketList} setSubmarketList={setSubmarketList} />}
          {activeTab === "contacts" && <ContactsTab contacts={contacts} setContacts={setContacts} deals={deals} submarketList={submarketList} />}
          {activeTab === "tasks" && <TasksTab tasks={tasks} setTasks={setTasks} deals={deals} />}
          {activeTab === "expenses" && <ExpenseTab expenses={expenses} setExpenses={setExpenses} closedYTD={closedYTD} gciGoal={gciGoal} />}
          {activeTab === "properties" && <PropertyDBTab properties={properties} setProperties={setProperties} submarketList={submarketList} contacts={contacts} />}
          {activeTab === "timeline" && <TimelineTab deals={deals} />}
          {activeTab === "intel" && <IntelTab deals={deals} expenses={expenses} gciGoal={gciGoal} />}
          {activeTab === "lease-radar" && <LeaseRadarTab deals={deals} contacts={contacts} onNavigate={setActiveTab} />}

          {/* ── UNDERWRITING TAB ── */}
          {activeTab === "underwriting" && <UnderwritingTab />}

          {/* ── PIPELINE + ANALYTICS TABS ── */}
          {(activeTab === "pipeline" || activeTab === "analytics") && <>
            {/* ── Morning Briefing ── */}
            <div style={{ background: `linear-gradient(135deg, ${DS.panel} 0%, #0d1e30 100%)`, borderRadius: DS.r.lg, padding: "18px 22px", border: `1px solid ${DS.border}`, boxShadow: DS.shadow.md }}>
              <div style={{ color: DS.accent, fontSize: DS.fs.lg, fontWeight: DS.fw.black, marginBottom: 12, letterSpacing: "-0.2px" }}>{greeting} — Here's your day</div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {dueTodayDeals.length > 0 ? (
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ color: DS.green, fontSize: DS.fs.xs, fontWeight: DS.fw.bold, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Follow-ups due</div>
                    {dueTodayDeals.slice(0,3).map(d => (
                      <div key={d.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: DS.bg, borderRadius: DS.r.sm, padding: "7px 10px", marginBottom: 5, border: `1px solid ${DS.border}` }}>
                        <div><div style={{ color: DS.text, fontSize: DS.fs.md, fontWeight: DS.fw.semi }}>{d.name}</div><div style={{ color: DS.textMute, fontSize: DS.fs.xs }}>{d.client} {d.isOverdue ? "· Overdue" : ""}</div></div>
                        <button onClick={() => setActivityDeal(d)} style={{ background: DS.green, border: "none", color: "#fff", padding: "4px 10px", borderRadius: DS.r.sm, cursor: "pointer", fontSize: DS.fs.xs, fontWeight: DS.fw.bold }}>Log</button>
                      </div>
                    ))}
                  </div>
                ) : <div style={{ flex: 1, minWidth: 200, color: DS.textMute, fontSize: DS.fs.md }}>No follow-ups due today</div>}
                {agingDeals.length > 0 ? (
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ color: DS.red, fontSize: DS.fs.xs, fontWeight: DS.fw.bold, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Gone cold</div>
                    {agingDeals.slice(0,3).map(d => (
                      <div key={d.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: DS.bg, borderRadius: DS.r.sm, padding: "7px 10px", marginBottom: 5, border: `1px solid ${DS.border}` }}>
                        <div><div style={{ color: DS.text, fontSize: DS.fs.md, fontWeight: DS.fw.semi }}>{d.name}</div><div style={{ color: DS.textMute, fontSize: DS.fs.xs }}>{d.daysInStage} days in {d.stage}</div></div>
                        <button onClick={() => setModal(d)} style={{ background: DS.red + "22", border: `1px solid ${DS.red}44`, color: DS.red, padding: "4px 10px", borderRadius: DS.r.sm, cursor: "pointer", fontSize: DS.fs.xs, fontWeight: DS.fw.bold }}>Edit</button>
                      </div>
                    ))}
                  </div>
                ) : <div style={{ flex: 1, minWidth: 200, color: DS.textMute, fontSize: DS.fs.md }}>No stalled deals</div>}
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ color: DS.textSub, fontSize: DS.fs.xs, fontWeight: DS.fw.bold, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Goal Pace</div>
                  <div style={{ background: DS.bg, borderRadius: DS.r.sm, padding: "10px 12px", border: `1px solid ${DS.border}` }}>
                    <div style={{ color: DS.text, fontSize: 18, fontWeight: DS.fw.black }}>{gciProgress.toFixed(1)}%</div>
                    <div style={{ color: DS.textMute, fontSize: DS.fs.xs, marginBottom: 6 }}>{fmt(closedYTD)} of {fmt(gciGoal)}</div>
                    <div style={{ background: DS.border, borderRadius: 999, height: 5, overflow: "hidden" }}>
                      <div style={{ width: `${gciProgress}%`, height: "100%", borderRadius: 999, background: gciProgress >= 75 ? DS.green : gciProgress >= 40 ? DS.accent : DS.blue }} />
                    </div>
                    <div style={{ color: DS.textMute, fontSize: DS.fs.xs, marginTop: 4 }}>Month {thisMonth + 1} of 12 · {winRate !== null ? `${winRate}% win rate` : "No closed deals yet"}</div>
                  </div>
                </div>
              </div>
            </div>

          {/* Stat Cards */}
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            <StatCard label="Total Pipeline" sub="Active deal value" value={fmt(totalPipeline)} accent={DS.blue} />
            <StatCard label="Weighted Pipeline" sub="Prob-adjusted" value={fmt(totalWeighted)} accent={DS.purple} />
            <StatCard label="Closed YTD" sub="Net commissions" value={fmt(closedYTD)} accent={DS.green} />
            <StatCard label="SF in Pipeline" sub="Active sqft" value={totalSqft > 0 ? totalSqft.toLocaleString() + " SF" : "0 SF"} accent={DS.accent} />
            <StatCard label="Win Rate" sub="Closed vs. lost" value={winRate !== null ? winRate + "%" : "—"} accent="#ec4899" />
            <StatCard label="Follow-ups Due" sub="Today & overdue" value={dueTodayDeals.length} accent={DS.green} alert={dueTodayDeals.length > 0} />
            <StatCard label="Aging Deals" sub="30+ days stale" value={agingDeals.length} accent={DS.red} alert={agingDeals.length > 0} />
            <StatCard label="Active Listings" sub="Currently marketed" value={listings.filter(l=>l.status==="Active").length} accent={DS.green} />
          </div>

          {/* GCI Goal */}
          <div style={{ background: DS.panel, borderRadius: DS.r.lg, padding: "16px 20px", border: `1px solid ${DS.border}`, borderLeft: `3px solid ${DS.accent}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div><div style={{ color: DS.text, fontWeight: DS.fw.black, fontSize: DS.fs.xl, letterSpacing: "-0.3px" }}>Annual GCI Goal</div><div style={{ color: DS.textMute, fontSize: DS.fs.xs, marginTop: 2 }}>Net closed commissions vs. target</div></div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: DS.textMute, fontSize: DS.fs.sm }}>Goal: $</span>
                <input type="number" value={gciGoal} onChange={e => setGciGoal(parseFloat(e.target.value) || 0)} style={{ background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: DS.r.sm, color: DS.accent, padding: "5px 9px", fontSize: DS.fs.md, fontWeight: DS.fw.bold, width: 100, outline: "none" }} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, background: DS.bg, borderRadius: 999, height: 8, overflow: "hidden", border: `1px solid ${DS.border}` }}>
                <div style={{ width: `${gciProgress}%`, height: "100%", borderRadius: 999, background: gciProgress >= 100 ? DS.green : gciProgress >= 50 ? DS.accent : DS.blue, transition: "width 0.4s ease" }} />
              </div>
              <div style={{ color: DS.text, fontWeight: DS.fw.black, fontSize: DS.fs.md, minWidth: 100, textAlign: "right" }}>{fmt(closedYTD)} <span style={{ color: DS.textMute, fontWeight: DS.fw.normal }}>/ {fmt(gciGoal)}</span></div>
              <div style={{ color: DS.accent, fontWeight: DS.fw.black, minWidth: 40, fontSize: DS.fs.md }}>{gciProgress.toFixed(1)}%</div>
            </div>
          </div>

          {activeTab === "analytics" && <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: DS.panel, borderRadius: DS.r.lg, padding: "16px 18px", border: `1px solid ${DS.border}` }}>
                <div style={{ color: DS.text, fontWeight: DS.fw.black, fontSize: DS.fs.lg, marginBottom: 2 }}>Pipeline by Stage</div>
                <div style={{ color: DS.textMute, fontSize: DS.fs.xs, marginBottom: 12 }}>Deal count and total value</div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={stageChartData} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke={DS.border} vertical={false} />
                    <XAxis dataKey="stage" tick={{ fill: DS.textMute, fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="l" tick={{ fill: DS.textMute, fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="r" orientation="right" tick={{ fill: DS.textMute, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000000 ? (v/1000000).toFixed(1)+"M" : v >= 1000 ? (v/1000).toFixed(0)+"k" : v} />
                    <Tooltip contentStyle={{ background: DS.surface, border: `1px solid ${DS.border}`, borderRadius: 8, color: DS.text, fontSize: 12 }} formatter={(val, name) => name === "Value" ? [fmt(val), name] : [val, name]} />
                    <Legend wrapperStyle={{ color: DS.textSub, fontSize: 10 }} />
                    <Bar yAxisId="l" dataKey="Deals" fill={DS.blue} radius={[3,3,0,0]} />
                    <Bar yAxisId="r" dataKey="Value" fill={DS.accent} radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: DS.panel, borderRadius: DS.r.lg, padding: "16px 18px", border: `1px solid ${DS.border}` }}>
                <div style={{ color: DS.text, fontWeight: DS.fw.black, fontSize: DS.fs.lg, marginBottom: 2 }}>Monthly Commissions</div>
                <div style={{ color: DS.textMute, fontSize: DS.fs.xs, marginBottom: 12 }}>Closed vs. monthly target ({thisYear})</div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={monthlyData} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke={DS.border} vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: DS.textMute, fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: DS.textMute, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => "$"+(v>=1000?(v/1000).toFixed(0)+"k":v)} />
                    <Tooltip contentStyle={{ background: DS.surface, border: `1px solid ${DS.border}`, borderRadius: 8, color: DS.text, fontSize: 12 }} formatter={v => [fmt(v)]} />
                    <Legend wrapperStyle={{ color: DS.textSub, fontSize: 10 }} />
                    <Bar dataKey="commission" name="Closed" fill={DS.green} radius={[3,3,0,0]} />
                    <Bar dataKey="goal" name="Target" fill={DS.border} radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {sourceData.length > 0 && (
                <div style={{ background: DS.panel, borderRadius: DS.r.lg, padding: "16px 18px", border: `1px solid ${DS.border}` }}>
                  <div style={{ color: DS.text, fontWeight: DS.fw.black, fontSize: DS.fs.lg, marginBottom: 2 }}>Lead Source Performance</div>
                  <div style={{ color: DS.textMute, fontSize: DS.fs.xs, marginBottom: 12 }}>Which sources drive your business</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {sourceData.map(s => (
                      <div key={s.source} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: DS.bg, borderRadius: DS.r.sm, padding: "8px 12px", border: `1px solid ${DS.border}` }}>
                        <div style={{ color: DS.text, fontSize: DS.fs.md, fontWeight: DS.fw.semi }}>{s.source}</div>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <span style={{ color: DS.textSub, fontSize: DS.fs.sm }}>{s.deals} deal{s.deals !== 1 ? "s" : ""}</span>
                          {s.commission > 0 && <span style={{ color: DS.green, fontSize: DS.fs.sm, fontWeight: DS.fw.bold }}>{fmt(s.commission)}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ background: DS.panel, borderRadius: DS.r.lg, padding: "16px 18px", border: `1px solid ${DS.border}` }}>
                <div style={{ color: DS.text, fontWeight: DS.fw.black, fontSize: DS.fs.lg, marginBottom: 2 }}>Win / Loss Tracker</div>
                <div style={{ color: DS.textMute, fontSize: DS.fs.xs, marginBottom: 12 }}>Conversion rate & why deals die</div>
                {closedDeals.length === 0 && lostDeals.length === 0 ? (
                  <div style={{ color: DS.textMute, fontSize: DS.fs.md, textAlign: "center", padding: "20px 0" }}>No closed or lost deals yet.<br/>Mark deals won or lost to track your conversion rate.</div>
                ) : (
                  <>
                    <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                      <div style={{ flex: 1, background: DS.green + "11", border: `1px solid ${DS.green}33`, borderRadius: DS.r.md, padding: "10px 14px", textAlign: "center" }}>
                        <div style={{ color: DS.green, fontSize: 20, fontWeight: DS.fw.black }}>{closedDeals.length}</div>
                        <div style={{ color: DS.green, fontSize: DS.fs.xs, fontWeight: DS.fw.bold }}>WON</div>
                      </div>
                      <div style={{ flex: 1, background: DS.red + "11", border: `1px solid ${DS.red}33`, borderRadius: DS.r.md, padding: "10px 14px", textAlign: "center" }}>
                        <div style={{ color: DS.red, fontSize: 20, fontWeight: DS.fw.black }}>{lostDeals.length}</div>
                        <div style={{ color: DS.red, fontSize: DS.fs.xs, fontWeight: DS.fw.bold }}>LOST</div>
                      </div>
                      <div style={{ flex: 1, background: DS.accent + "11", border: `1px solid ${DS.accent}33`, borderRadius: DS.r.md, padding: "10px 14px", textAlign: "center" }}>
                        <div style={{ color: DS.accent, fontSize: 20, fontWeight: DS.fw.black }}>{winRate !== null ? winRate + "%" : "—"}</div>
                        <div style={{ color: DS.accent, fontSize: DS.fs.xs, fontWeight: DS.fw.bold }}>WIN RATE</div>
                      </div>
                    </div>
                    {lossBreakdown.length > 0 && (
                      <div>
                        <div style={{ color: DS.textMute, fontSize: DS.fs.xs, fontWeight: DS.fw.bold, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Why we lose</div>
                        {lossBreakdown.map(l => (
                          <div key={l.reason} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${DS.border}` }}>
                            <span style={{ color: DS.textSub, fontSize: DS.fs.sm }}>{l.reason}</span>
                            <span style={{ color: DS.red, fontSize: DS.fs.sm, fontWeight: DS.fw.bold }}>{l.count}x</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Year-over-Year comparison */}
            <div style={{ background: DS.panel, borderRadius: DS.r.lg, padding: "16px 18px", border: `1px solid ${DS.border}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                <div>
                  <div style={{ color: DS.text, fontWeight: DS.fw.black, fontSize: DS.fs.lg, marginBottom: 2 }}>Year-over-Year</div>
                  <div style={{ color: DS.textMute, fontSize: DS.fs.xs }}>{thisYear} vs {thisYear - 1} — net commissions by month</div>
                </div>
                <div style={{ display:"flex", gap:16 }}>
                  {yoyCommPct !== null && (
                    <div style={{ textAlign:"right" }}>
                      <div style={{ color: yoyCommPct >= 0 ? DS.green : DS.red, fontWeight: DS.fw.black, fontSize: DS.fs.lg }}>
                        {yoyCommPct >= 0 ? "+" : ""}{yoyCommPct.toFixed(1)}%
                      </div>
                      <div style={{ color: DS.textFaint, fontSize: DS.fs.xs }}>GCI vs last year</div>
                    </div>
                  )}
                  {yoyDealsPct !== null && (
                    <div style={{ textAlign:"right" }}>
                      <div style={{ color: yoyDealsPct >= 0 ? DS.green : DS.red, fontWeight: DS.fw.black, fontSize: DS.fs.lg }}>
                        {yoyDealsPct >= 0 ? "+" : ""}{yoyDealsPct.toFixed(0)}%
                      </div>
                      <div style={{ color: DS.textFaint, fontSize: DS.fs.xs }}>deal count</div>
                    </div>
                  )}
                </div>
              </div>
              {/* Summary row */}
              <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
                {[
                  { label: `${thisYear} GCI`, value: fmt(closedYTD), color: DS.green },
                  { label: `${thisYear - 1} GCI`, value: fmt(lastYearClosed), color: DS.textMute },
                  { label: `${thisYear} Deals`, value: thisYearDeals, color: DS.blue },
                  { label: `${thisYear - 1} Deals`, value: lastYearDeals, color: DS.textMute },
                ].map(s => (
                  <div key={s.label} style={{ background: DS.bg, border:`1px solid ${DS.border}`, borderRadius: DS.r.sm, padding:"9px 14px", flex:1, minWidth:100 }}>
                    <div style={{ color: s.color, fontWeight: DS.fw.black, fontSize: DS.fs.lg }}>{s.value}</div>
                    <div style={{ color: DS.textFaint, fontSize: DS.fs.xs }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={monthlyData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke={DS.border} vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: DS.textMute, fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: DS.textMute, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => "$"+(v>=1000?(v/1000).toFixed(0)+"k":v)} />
                  <Tooltip contentStyle={{ background: DS.surface, border: `1px solid ${DS.border}`, borderRadius: 8, color: DS.text, fontSize: 12 }} formatter={v => [fmt(v)]} />
                  <Legend wrapperStyle={{ color: DS.textSub, fontSize: 10 }} />
                  <Bar dataKey="commission" name={String(thisYear)} fill={DS.green} radius={[3,3,0,0]} />
                  <Bar dataKey="lastYear" name={String(thisYear - 1)} fill={DS.border} radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              {lastYearClosed === 0 && <div style={{ color: DS.textFaint, fontSize: DS.fs.xs, textAlign:"center", marginTop:6 }}>No {thisYear - 1} data yet — close deals with a {thisYear - 1} close date to populate last year's bars.</div>}
            </div>
          </>}

          {/* Stage Summary */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {STAGES.map(stage => {
              const c = STAGE_COLORS[stage];
              const sd = enriched.filter(d => d.stage === stage);
              const sqft = sd.reduce((s,d) => s + (d.sqft||0), 0);
              return (
                <div key={stage} className="card-hover" style={{ flex: 1, minWidth: 100, background: c.bg, border: `1px solid ${c.border}`, borderRadius: DS.r.md, padding: "12px 14px", position: "relative", overflow: "hidden", boxShadow: `0 0 12px ${c.glow || "transparent"}` }}>
                  <div style={{ position: "absolute", top: 0, right: 0, width: 40, height: 40, borderRadius: "0 0 0 40px", background: c.text + "10", pointerEvents: "none" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.text, boxShadow: `0 0 6px ${c.text}` }} />
                    <span style={{ color: c.text, fontSize: DS.fs.xs, fontWeight: DS.fw.bold, letterSpacing: "0.3px" }}>{stage}</span>
                  </div>
                  <div style={{ color: DS.text, fontWeight: DS.fw.black, fontSize: DS.fs.h2, letterSpacing: "-0.5px", fontFamily: "'DM Mono', monospace" }}>{sd.length}</div>
                  <div style={{ color: DS.textSub, fontSize: DS.fs.xs, marginTop: 2 }}>{fmt(sd.reduce((s,d)=>s+d.totalValue,0))}</div>
                  {sqft > 0 && <div style={{ color: DS.textFaint, fontSize: 10, marginTop: 1 }}>{sqft.toLocaleString()} SF</div>}
                </div>
              );
            })}
          </div>

          {/* Filters */}
          {showFilters && activeTab === "pipeline" && (
            <div style={{ background: DS.panel, borderRadius: DS.r.lg, padding: "14px 18px", border: `1px solid ${DS.border}` }}>
              <div style={{ color: DS.text, fontWeight: DS.fw.black, fontSize: DS.fs.lg, marginBottom: 12 }}>Filters</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div><label style={{ color: DS.textMute, fontSize: DS.fs.xs, fontWeight: DS.fw.bold, display: "block", marginBottom: 3 }}>Search</label><input placeholder="Property, client, source..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} style={globalIStyle()} /></div>
                <div><label style={{ color: DS.textMute, fontSize: DS.fs.xs, fontWeight: DS.fw.bold, display: "block", marginBottom: 3 }}>Close From</label><input type="date" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} style={globalIStyle()} /></div>
                <div><label style={{ color: DS.textMute, fontSize: DS.fs.xs, fontWeight: DS.fw.bold, display: "block", marginBottom: 3 }}>Close To</label><input type="date" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} style={globalIStyle()} /></div>
              </div>
              <div style={{ marginBottom: 7 }}><label style={{ color: DS.textMute, fontSize: DS.fs.xs, fontWeight: DS.fw.bold, display: "block", marginBottom: 4 }}>Stages</label><div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{STAGES.map(s => <button key={s} onClick={() => toggleFilter("stages", s)} style={fbtn(filters.stages.includes(s))}>{s}</button>)}</div></div>
              <div style={{ marginBottom: 7 }}><label style={{ color: DS.textMute, fontSize: DS.fs.xs, fontWeight: DS.fw.bold, display: "block", marginBottom: 4 }}>Subtypes</label><div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{INDUSTRIAL_SUBTYPES.map(s => <button key={s} onClick={() => toggleFilter("subtypes", s)} style={fbtn(filters.subtypes.includes(s))}>{s}</button>)}</div></div>
              <div style={{ marginBottom: 7 }}><label style={{ color: DS.textMute, fontSize: DS.fs.xs, fontWeight: DS.fw.bold, display: "block", marginBottom: 4 }}>Deal Type</label><div style={{ display: "flex", gap: 5 }}>{DEAL_TYPES.map(t => <button key={t} onClick={() => toggleFilter("dealTypes", t)} style={fbtn(filters.dealTypes.includes(t))}>{t}</button>)}</div></div>
              <div><label style={{ color: DS.textMute, fontSize: DS.fs.xs, fontWeight: DS.fw.bold, display: "block", marginBottom: 4 }}>Lead Sources</label><div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{LEAD_SOURCES.map(s => <button key={s} onClick={() => toggleFilter("leadSources", s)} style={fbtn(filters.leadSources.includes(s))}>{s}</button>)}</div></div>
            </div>
          )}

          {/* Deal Table */}
          {activeTab === "pipeline" && (
            <div style={{ background: DS.panel, borderRadius: DS.r.lg, border: `1px solid ${DS.border}`, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1200 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${DS.border}` }}>
                    {[["stage","Stage"],["name","Property"],["client","Client"],["counterparty","Counterparty"],["dealType","Type"],["repType","Rep"],["subtype","Subtype"],["submarket","Submarket"],["sqft","Sq Ft"],["totalValue","Value"],["pricePerSqft","$/SF"],["netCommission","Net Comm"],["probability","Prob"],["weighted","Weighted"],["leadSource","Source"],["followUpDate","Follow-up"],["expectedClose","Close"],["daysInStage","Days"]].map(([key, label]) => (
                      <th key={key} style={th(key)} onClick={() => sortBy(key)}>{label}{sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}</th>
                    ))}
                    <th style={{ ...th(""), cursor: "default" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(d => (
                    <tr key={d.id}
                      style={{ borderBottom: `1px solid ${DS.border}`, background: d.stage === "Lost" ? DS.red + "08" : d.isAging ? DS.red + "0c" : d.isDueToday ? DS.green + "06" : "transparent" }}
                      onMouseEnter={e => e.currentTarget.style.background = DS.borderHi + "33"}
                      onMouseLeave={e => e.currentTarget.style.background = d.stage === "Lost" ? DS.red + "08" : d.isAging ? DS.red + "0c" : d.isDueToday ? DS.green + "06" : "transparent"}>
                      <td style={td}>
                        {inlineEdit?.id === d.id && inlineEdit?.field === "stage" ? (
                          <select autoFocus defaultValue={d.stage}
                            onChange={e => saveInlineField(d.id, "stage", e.target.value)}
                            onBlur={() => setInlineEdit(null)}
                            style={{ background: DS.bg, border: `1px solid ${DS.accent}`, borderRadius: DS.r.sm, color: DS.text, padding: "3px 6px", fontSize: DS.fs.xs, outline: "none", cursor: "pointer" }}>
                            {STAGES.map(s => <option key={s}>{s}</option>)}
                          </select>
                        ) : (
                          <div onClick={() => setInlineEdit({ id: d.id, field: "stage" })} style={{ cursor: "pointer" }} title="Click to change stage">
                            <StageBadge stage={d.stage} />
                          </div>
                        )}
                      </td>
                      <td style={{ ...td, color: DS.text, fontWeight: DS.fw.semi, maxWidth: 180 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                          <span style={{ fontSize: DS.fs.md }}>{d.name || "—"}</span>
                          {d.activities?.length > 0 && <span style={{ background: DS.border, color: DS.textMute, fontSize: 9, padding: "1px 5px", borderRadius: 8, fontWeight: DS.fw.semi }}>{d.activities.length}</span>}
                          {(d.richNotes||[]).length > 0 && <span style={{ background: DS.blue + "22", color: DS.blue, fontSize: 9, padding: "1px 5px", borderRadius: 8, fontWeight: DS.fw.semi }}>{d.richNotes.length} note{d.richNotes.length > 1 ? "s" : ""}</span>}
                          {(d.documents||[]).length > 0 && <span style={{ background: DS.green + "22", color: DS.green, fontSize: 9, padding: "1px 5px", borderRadius: 8, fontWeight: DS.fw.semi }}>{d.documents.length} doc{d.documents.length > 1 ? "s" : ""}</span>}
                          {d.health && <span style={{ background: d.health.color + "22", color: d.health.color, border: `1px solid ${d.health.color}44`, fontSize: 9, padding: "1px 6px", borderRadius: 8, fontWeight: DS.fw.bold }}>{d.health.score}</span>}
                          {d.isSplit && <span style={{ background: DS.purple + "22", color: DS.purple, fontSize: 9, padding: "1px 5px", borderRadius: 8, fontWeight: DS.fw.semi }}>split</span>}
                        </div>
                        {(d.tags||[]).length > 0 && (
                          <div style={{ display:"flex", gap:3, flexWrap:"wrap", marginTop:3 }}>
                            {(d.tags||[]).slice(0,3).map(tag=><span key={tag} style={{ background: DS.blue + "22", color: DS.blue, fontSize: 8, padding:"1px 5px", borderRadius:20, fontWeight: DS.fw.semi }}>{tag}</span>)}
                            {(d.tags||[]).length > 3 && <span style={{ color: DS.textFaint, fontSize:8 }}>+{d.tags.length-3}</span>}
                          </div>
                        )}
                      </td>
                      <td style={td}>{d.client || "—"}</td>
                      <td style={{ ...td, color: DS.textSub }}>{d.counterparty || "—"}</td>
                      <td style={td}><span style={{ background: d.dealType === "Sale" ? DS.blue + "22" : DS.green + "22", color: d.dealType === "Sale" ? DS.blue : DS.green, padding: "1px 7px", borderRadius: 10, fontSize: 10, fontWeight: DS.fw.bold }}>{d.dealType}</span></td>
                      <td style={{ ...td, color: DS.textMute, fontSize: DS.fs.xs }}>{d.repType?.replace(" Rep","") || "—"}</td>
                      <td style={{ ...td, color: DS.textSub, fontSize: DS.fs.sm }}>{d.subtype || "—"}</td>
                      <td style={{ ...td, color: DS.textMute, fontSize: DS.fs.sm }}>{d.submarket || "—"}</td>
                      <td style={td}>{d.sqft > 0 ? d.sqft.toLocaleString() : "—"}</td>
                      <td style={td}>{d.totalValue > 0 ? fmt(d.totalValue) : "—"}</td>
                      <td style={{ ...td, color: DS.textMute, fontSize: DS.fs.xs }}>{d.pricePerSqft > 0 ? "$" + d.pricePerSqft.toFixed(2) : "—"}</td>
                      <td style={{ ...td, color: DS.accent, fontWeight: DS.fw.bold }}>
                        {fmt(d.netCommission)}
                        {d.isSplit && <div style={{ color: DS.textMute, fontSize: 9 }}>{d.splitPct}% split</div>}
                      </td>
                      <td style={td}>
                        {inlineEdit?.id === d.id && inlineEdit?.field === "probability" ? (
                          <input autoFocus type="number" min="0" max="100" defaultValue={d.probability}
                            onBlur={e => saveInlineField(d.id, "probability", parseInt(e.target.value)||0)}
                            onKeyDown={e => { if (e.key === "Enter") saveInlineField(d.id, "probability", parseInt(e.target.value)||0); if (e.key === "Escape") setInlineEdit(null); }}
                            style={{ width: 46, background: DS.bg, border: `1px solid ${DS.accent}`, borderRadius: DS.r.sm, color: DS.text, padding: "3px 6px", fontSize: DS.fs.xs, outline: "none", textAlign: "center" }} />
                        ) : (
                          <span onClick={() => setInlineEdit({ id: d.id, field: "probability" })} style={{ cursor: "pointer", color: d.probability >= 75 ? DS.green : d.probability >= 50 ? DS.accent : DS.textSub, fontWeight: DS.fw.semi }} title="Click to edit probability">
                            {pct(d.probability)}
                          </span>
                        )}
                      </td>
                      <td style={{ ...td, color: DS.green, fontWeight: DS.fw.semi }}>{fmt(d.weighted)}</td>
                      <td style={{ ...td, color: DS.textMute, fontSize: DS.fs.xs }}>{d.leadSource || "—"}</td>
                      <td style={td}>
                        {inlineEdit?.id === d.id && inlineEdit?.field === "followUpDate" ? (
                          <input autoFocus type="date" defaultValue={d.followUpDate}
                            onBlur={e => saveInlineField(d.id, "followUpDate", e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") saveInlineField(d.id, "followUpDate", e.target.value); if (e.key === "Escape") setInlineEdit(null); }}
                            style={{ background: DS.bg, border: `1px solid ${DS.accent}`, borderRadius: DS.r.sm, color: DS.text, padding: "3px 6px", fontSize: DS.fs.xs, outline: "none" }} />
                        ) : (
                          <span onClick={() => setInlineEdit({ id: d.id, field: "followUpDate" })} style={{ cursor: "pointer", color: d.isOverdue ? DS.red : d.isDueToday ? DS.green : d.followUpDate ? DS.textMute : DS.textFaint, fontWeight: d.isDueToday || d.isOverdue ? DS.fw.bold : DS.fw.normal }} title="Click to set follow-up date">
                            {d.followUpDate ? `${d.isOverdue ? "⚠ " : d.isDueToday ? "● " : ""}${new Date(d.followUpDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : "set date"}
                          </span>
                        )}
                      </td>
                      <td style={td}>{d.expectedClose ? new Date(d.expectedClose + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</td>
                      <td style={td}><span style={{ background: d.daysInStage > 30 && d.stage !== "Closed" && d.stage !== "Lost" ? DS.red + "22" : DS.green + "11", color: d.daysInStage > 30 && d.stage !== "Closed" && d.stage !== "Lost" ? DS.red : DS.green, padding: "1px 6px", borderRadius: 9, fontSize: 10, fontWeight: DS.fw.bold }}>{d.daysInStage}d</span></td>
                      <td style={td}>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {d.stage !== "Closed" && d.stage !== "Lost" && <button onClick={() => setWinLossDeal(d)} title="Close Out" style={{ background: DS.green + "22", border: `1px solid ${DS.green}33`, color: DS.green, cursor: "pointer", fontSize: DS.fs.xs, fontWeight: DS.fw.bold, padding: "2px 7px", borderRadius: 4 }}>Close</button>}
                          {(d.stage === "Under Contract" || d.stage === "LOI") && (
                            <button onClick={() => setChecklistDeal(d)} title="Closing Checklist" style={{ background: DS.accent+"22", border: `1px solid ${DS.accent}44`, color: DS.accent, cursor: "pointer", fontSize: DS.fs.xs, fontWeight: DS.fw.bold, padding: "2px 7px", borderRadius: 4 }}>
                              {(() => { const items = d.dealType === "Lease" ? CLOSING_CHECKLIST_LEASE : CLOSING_CHECKLIST_SALE; const done = items.filter(i => (d.closingChecklist||{})[i.id]).length; return done > 0 ? `✓ ${done}/${items.length}` : "Checklist"; })()}
                            </button>
                          )}
                          <button onClick={() => setRichNotesDeal(d)} title="Rich Notes" style={{ background: DS.border, border: "none", color: DS.textSub, cursor: "pointer", fontSize: DS.fs.xs, padding: "2px 7px", borderRadius: 4 }}>Notes</button>
                          <button onClick={() => setDocumentsDeal(d)} title="Documents" style={{ background: (d.documents||[]).length > 0 ? DS.green + "22" : DS.border, border: "none", color: (d.documents||[]).length > 0 ? DS.green : DS.textSub, cursor: "pointer", fontSize: DS.fs.xs, padding: "2px 7px", borderRadius: 4 }}>Docs</button>
                          <button onClick={() => setActivityDeal(d)} title="Activity Log" style={{ background: DS.border, border: "none", color: DS.textSub, cursor: "pointer", fontSize: DS.fs.xs, padding: "2px 7px", borderRadius: 4 }}>Log</button>
                          <button onClick={() => setTimelineDeal(d)} title="Deal Timeline" style={{ background: DS.purple + "22", border: "none", color: DS.purple, cursor: "pointer", fontSize: DS.fs.xs, padding: "2px 7px", borderRadius: 4 }}>Timeline</button>
                          <button onClick={() => { const clone = { ...d, id: Date.now(), name: d.name + " (copy)", stageHistory: [], won: null, lossReason: "" }; setDeals(prev => [...prev, clone]); toast("Deal duplicated"); }} title="Duplicate" style={{ background: DS.border, border: "none", color: DS.textSub, cursor: "pointer", fontSize: DS.fs.xs, padding: "2px 7px", borderRadius: 4 }}>Dupe</button>
                          <button onClick={() => setModal(d)} title="Edit" style={{ background: DS.border, border: "none", color: DS.textSub, cursor: "pointer", fontSize: DS.fs.xs, padding: "2px 7px", borderRadius: 4 }}>Edit</button>
                          <button onClick={() => { if(window.confirm("Delete this deal?")) { setDeals(prev => prev.filter(x => x.id !== d.id)); toast("Deal deleted", "error"); }}} title="Delete" style={{ background: "none", border: "none", color: DS.textFaint, cursor: "pointer", fontSize: DS.fs.xs, padding: "2px 7px", borderRadius: 4 }}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: `2px solid ${DS.border}`, background: DS.surface }}>
                    <td colSpan={8} style={{ padding: "10px", color: DS.textMute, fontSize: DS.fs.sm }}>Showing {filtered.length} deal{filtered.length !== 1 ? "s" : ""} · {filtered.reduce((s,d)=>s+(d.sqft||0),0).toLocaleString()} SF</td>
                    <td style={{ padding: "10px", color: DS.text, fontWeight: DS.fw.black }}>{filtered.reduce((s,d)=>s+(d.sqft||0),0).toLocaleString()}</td>
                    <td style={{ padding: "10px", color: DS.text, fontWeight: DS.fw.black }}>{fmt(filtered.reduce((s,d)=>s+d.totalValue,0))}</td>
                    <td />
                    <td style={{ padding: "10px", color: DS.accent, fontWeight: DS.fw.black }}>{fmt(filtered.reduce((s,d)=>s+d.netCommission,0))}</td>
                    <td />
                    <td style={{ padding: "10px", color: DS.green, fontWeight: DS.fw.black }}>{fmt(filtered.reduce((s,d)=>s+d.weighted,0))}</td>
                    <td colSpan={5} style={{ padding: "10px", color: DS.text, fontWeight: DS.fw.black, textAlign: "right", fontSize: DS.fs.md }}>Total Pipeline: {fmt(filtered.reduce((s,d)=>s+d.totalValue,0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </>}

        </div>
      </div>

      {/* Global modals */}
      {showSearch && <GlobalSearch deals={deals} contacts={contacts} properties={properties} comps={comps} tasks={tasks} onNavigate={setActiveTab} onClose={() => setShowSearch(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} gciGoal={gciGoal} setGciGoal={setGciGoal} />}
      {quickAdd && <QuickAdd onSave={saveQuickAdd} onClose={() => setQuickAdd(false)} />}
      {modal && <DealModal deal={modal === "new" ? null : modal} onSave={saveModal} onClose={() => setModal(null)} submarketList={submarketList} comps={comps} />}
      {activityDeal && <ActivityLog deal={activityDeal} onClose={() => setActivityDeal(null)} onSave={saveActivity} />}
      {richNotesDeal && <RichNotesModal deal={richNotesDeal} onClose={() => setRichNotesDeal(null)} onSave={saveRichNotes} />}
      {documentsDeal && <DocumentsModal deal={documentsDeal} onClose={() => setDocumentsDeal(null)} onSave={saveDocuments} />}
      {timelineDeal && <DealTimelineModal deal={timelineDeal} onClose={() => setTimelineDeal(null)} />}
      {winLossDeal && <WinLossModal deal={winLossDeal} onSave={saveWinLoss} onClose={() => setWinLossDeal(null)} />}
      {closedFollowUp && (
        <ClosedFollowUpModal
          deal={closedFollowUp.deal}
          contacts={contacts}
          onAddTask={task => setTasks(prev => [...prev, task])}
          onUpdateContact={updated => setContacts(prev => prev.map(c => c.id === updated.id ? updated : c))}
          onClose={() => setClosedFollowUp(null)}
        />
      )}
      {showDailySync && (
        <DailySyncModal
          deals={deals}
          tasks={tasks}
          contacts={contacts}
          onUpdateDeal={updated => setDeals(prev => prev.map(d => d.id === updated.id ? updated : d))}
          onUpdateTask={updated => setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))}
          onUpdateContact={updated => setContacts(prev => prev.map(c => c.id === updated.id ? updated : c))}
          onClose={() => setShowDailySync(false)}
        />
      )}
      {checklistDeal && (
        <ClosingChecklistModal
          deal={checklistDeal}
          onSave={saveChecklist}
          onClose={() => setChecklistDeal(null)}
        />
      )}
      {showCSVImport && (
        <CSVImportModal
          onImport={handleCSVImport}
          onClose={() => setShowCSVImport(false)}
          submarketList={submarketList}
        />
      )}
      <ToastProvider />
    </div>
  );
}

import { useState, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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
const DEAL_TAG_SUGGESTIONS = ["Hot 🔥", "Off-Market", "Year-End Push", "Referral", "Repeat Client", "Portfolio", "Value-Add", "Distressed", "1031 Exchange", "New Construction", "Watch", "On Hold"];

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
  Prospect:       { bg: "#e8f4fd", text: "#2563eb", border: "#93c5fd" },
  Proposal:       { bg: "#fef9c3", text: "#ca8a04", border: "#fde047" },
  LOI:            { bg: "#fdf4ff", text: "#9333ea", border: "#e9d5ff" },
  "Under Contract":{ bg: "#fff7ed", text: "#c2410c", border: "#fdba74" },
  Closed:         { bg: "#f0fdf4", text: "#15803d", border: "#4ade80" },
  Lost:           { bg: "#fef2f2", text: "#dc2626", border: "#fca5a5" },
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
  const c = STAGE_COLORS[stage] || { bg: "#f3f4f6", text: "#374151", border: "#d1d5db" };
  return <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", display: "inline-block" }}>{stage}</span>;
}

// ── Stat Card ───────────────────────────────────────────────
function StatCard({ label, sub, value, icon, accent, alert }) {
  return (
    <div style={{ background: alert ? "#2d1515" : "#162032", borderRadius: 12, padding: "16px 18px", flex: 1, minWidth: 140, border: `1px solid ${alert ? "#7f1d1d" : "#1e3048"}`, display: "flex", flexDirection: "column", gap: 7 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 500 }}>{label}</div>
          <div style={{ color: "#475569", fontSize: 10, marginTop: 1 }}>{sub}</div>
        </div>
        <div style={{ background: accent, borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{icon}</div>
      </div>
      <div style={{ color: alert ? "#fca5a5" : "#f1f5f9", fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px" }}>{value}</div>
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
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#162032", border: "1px solid #1e3048", borderRadius: 16, padding: 26, width: 540, maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div><h2 style={{ color: "#f1f5f9", fontSize: 17, fontWeight: 800, margin: 0 }}>Activity Log</h2><div style={{ color: "#475569", fontSize: 12, marginTop: 2 }}>{deal.name}</div></div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ background: "#0f1e2e", borderRadius: 10, padding: 12, border: "1px solid #1e3048" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
            {Object.keys(typeColors).map(t => <button key={t} onClick={() => setType(t)} style={{ background: type === t ? typeColors[t] : "#162032", color: type === t ? "#fff" : "#64748b", border: `1px solid ${type === t ? typeColors[t] : "#1e3048"}`, padding: "3px 11px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{t}</button>)}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && addActivity()} placeholder={`Log a ${type.toLowerCase()}...`} style={{ flex: 1, background: "#162032", border: "1px solid #1e3048", borderRadius: 8, color: "#f1f5f9", padding: "8px 11px", fontSize: 13, outline: "none" }} />
            <button onClick={addActivity} style={{ background: "#f59e0b", border: "none", color: "#0f1e2e", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 800 }}>Log</button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", marginTop: 12, display: "flex", flexDirection: "column", gap: 7 }}>
          {activities.length === 0 && <div style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: "28px 0" }}>No activities yet.</div>}
          {activities.map(a => (
            <div key={a.id} style={{ background: "#0f1e2e", border: "1px solid #1e3048", borderRadius: 9, padding: "10px 12px", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ background: typeColors[a.type] || "#64748b", color: "#fff", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>{a.type}</span>
              <div style={{ flex: 1 }}><div style={{ color: "#f1f5f9", fontSize: 13 }}>{a.text}</div><div style={{ color: "#475569", fontSize: 10, marginTop: 2 }}>{new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}</div></div>
              <button onClick={() => onSave({ ...deal, activities: activities.filter(x => x.id !== a.id) })} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 12 }}>🗑️</button>
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
      <div style={{ background: "#162032", border: "1px solid #1e3048", borderRadius: 16, padding: 26, width: 620, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div><h2 style={{ color: "#f1f5f9", fontSize: 17, fontWeight: 800, margin: 0 }}>📎 Deal Notes & Documents</h2><div style={{ color: "#475569", fontSize: 12, marginTop: 2 }}>{deal.name}</div></div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ background: "#0f1e2e", borderRadius: 10, padding: 14, border: "1px solid #1e3048", marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
            {NOTE_TYPES.map(t => <button key={t} onClick={() => setNoteType(t)} style={{ background: noteType === t ? (typeColors[t] || "#64748b") : "#162032", color: noteType === t ? "#fff" : "#64748b", border: `1px solid ${noteType === t ? (typeColors[t] || "#64748b") : "#1e3048"}`, padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 600, cursor: "pointer" }}>{t}</button>)}
          </div>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (optional)" style={{ width: "100%", background: "#162032", border: "1px solid #1e3048", borderRadius: 8, color: "#f1f5f9", padding: "7px 11px", fontSize: 13, outline: "none", marginBottom: 8, boxSizing: "border-box" }} />
          <textarea value={text} onChange={e => setText(e.target.value)} rows={4} placeholder={`Paste ${noteType} details here — LOI summaries, deal terms, landlord requirements, etc.`} style={{ width: "100%", background: "#162032", border: "1px solid #1e3048", borderRadius: 8, color: "#f1f5f9", padding: "8px 11px", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", marginBottom: 8 }} />
          <button onClick={addNote} style={{ background: "#f59e0b", border: "none", color: "#0f1e2e", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 800 }}>Add Note</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
          {notes.length === 0 && <div style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: "28px 0" }}>No notes yet. Add LOI summaries, deal terms, requirements...</div>}
          {notes.map(n => (
            <div key={n.id} style={{ background: "#0f1e2e", border: `1px solid #1e3048`, borderLeft: `3px solid ${typeColors[n.type] || "#64748b"}`, borderRadius: 9, padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div>
                  <span style={{ background: typeColors[n.type] || "#64748b", color: "#fff", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{n.type}</span>
                  {n.title !== n.type && <span style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 600, marginLeft: 8 }}>{n.title}</span>}
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ color: "#475569", fontSize: 10 }}>{new Date(n.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  <button onClick={() => onSave({ ...deal, richNotes: notes.filter(x => x.id !== n.id) })} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 12 }}>🗑️</button>
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

// ── Win/Loss Modal ──────────────────────────────────────────
function WinLossModal({ deal, onSave, onClose }) {
  const [won, setWon] = useState(true);
  const [reason, setReason] = useState(LOSS_REASONS[0]);
  const [notes, setNotes] = useState("");
  const iStyle = { background: "#0f1e2e", border: "1px solid #1e3048", borderRadius: 8, color: "#f1f5f9", padding: "8px 11px", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1001 }}>
      <div style={{ background: "#162032", border: "1px solid #1e3048", borderRadius: 16, padding: 28, width: 440 }}>
        <h2 style={{ color: "#f1f5f9", fontSize: 17, fontWeight: 800, margin: "0 0 6px 0" }}>Close Out Deal</h2>
        <div style={{ color: "#475569", fontSize: 12, marginBottom: 20 }}>{deal.name}</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          <button onClick={() => setWon(true)} style={{ flex: 1, background: won ? "#15803d" : "#0f1e2e", border: `1px solid ${won ? "#15803d" : "#1e3048"}`, color: won ? "#fff" : "#64748b", padding: "12px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 800 }}>🏆 Won</button>
          <button onClick={() => setWon(false)} style={{ flex: 1, background: !won ? "#7f1d1d" : "#0f1e2e", border: `1px solid ${!won ? "#dc2626" : "#1e3048"}`, color: !won ? "#fca5a5" : "#64748b", padding: "12px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 800 }}>❌ Lost</button>
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
          <button onClick={onClose} style={{ background: "none", border: "1px solid #1e3048", color: "#94a3b8", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Cancel</button>
          <button onClick={() => onSave({ ...deal, stage: won ? "Closed" : "Lost", won, lossReason: won ? "" : reason, notes: notes || deal.notes })} style={{ background: won ? "#15803d" : "#dc2626", border: "none", color: "#fff", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 800 }}>{won ? "Mark Won ✓" : "Mark Lost"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Quick Add Modal ─────────────────────────────────────────
function QuickAdd({ onSave, onClose }) {
  const [form, setForm] = useState({ name: "", sqft: "", stage: "Prospect", dealType: "Sale" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const iStyle = { background: "#0f1e2e", border: "1px solid #1e3048", borderRadius: 8, color: "#f1f5f9", padding: "9px 12px", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#162032", border: "1px solid #1e3048", borderRadius: 16, padding: 26, width: 400 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ color: "#f1f5f9", fontSize: 17, fontWeight: 800, margin: 0 }}>⚡ Quick Add Deal</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 20, cursor: "pointer" }}>✕</button>
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
          <button onClick={onClose} style={{ background: "none", border: "1px solid #1e3048", color: "#94a3b8", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Cancel</button>
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
      <div style={{ background:"#162032", border:"1px solid #1e3048", borderRadius:16, padding:26, width:580, maxHeight:"85vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <div>
            <h2 style={{ color:"#f1f5f9", fontSize:16, fontWeight:800, margin:0 }}>📁 Documents — {deal.name}</h2>
            <div style={{ color:"#475569", fontSize:11, marginTop:2 }}>Link LOIs, leases, reports, and any deal-related files</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#64748b", fontSize:20, cursor:"pointer" }}>✕</button>
        </div>

        {/* Add new doc */}
        <div style={{ background:"#0f1e2e", border:"1px solid #1e3048", borderRadius:10, padding:"14px 16px", marginBottom:16 }}>
          <div style={{ color:"#94a3b8", fontSize:11, fontWeight:700, marginBottom:10 }}>ADD DOCUMENT / LINK</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:9 }}>
            <div>
              <label style={{ color:"#64748b", fontSize:10, fontWeight:600, display:"block", marginBottom:3 }}>Document Name *</label>
              <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addDoc()} placeholder='e.g. "Executed LOI - Draft 2"' style={{ background:"#162032", border:"1px solid #1e3048", borderRadius:7, color:"#f1f5f9", padding:"7px 10px", fontSize:12, outline:"none", width:"100%", boxSizing:"border-box" }}/>
            </div>
            <div>
              <label style={{ color:"#64748b", fontSize:10, fontWeight:600, display:"block", marginBottom:3 }}>Type</label>
              <select value={docType} onChange={e=>setDocType(e.target.value)} style={{ background:"#162032", border:"1px solid #1e3048", borderRadius:7, color:"#f1f5f9", padding:"7px 10px", fontSize:12, outline:"none", width:"100%", boxSizing:"border-box" }}>
                {docTypes.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom:10 }}>
            <label style={{ color:"#64748b", fontSize:10, fontWeight:600, display:"block", marginBottom:3 }}>URL / Link (optional — Google Drive, Dropbox, DocuSign, etc.)</label>
            <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://drive.google.com/..." style={{ background:"#162032", border:"1px solid #1e3048", borderRadius:7, color:"#f1f5f9", padding:"7px 10px", fontSize:12, outline:"none", width:"100%", boxSizing:"border-box" }}/>
          </div>
          <button onClick={addDoc} style={{ background:"#3b82f6", border:"none", color:"#fff", padding:"7px 18px", borderRadius:7, cursor:"pointer", fontSize:12, fontWeight:800 }}>+ Add Document</button>
          <div style={{ color:"#334155", fontSize:10, marginTop:8 }}>💡 Paste any URL — Google Drive, Dropbox, DocuSign, CoStar, email, Notion, etc.</div>
        </div>

        {/* Document list */}
        {docs.length === 0 && <div style={{ color:"#475569", fontSize:13, textAlign:"center", padding:"24px 0" }}>No documents linked yet.</div>}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {docs.map(doc => (
            <div key={doc.id} style={{ background:"#0f1e2e", border:"1px solid #1e3048", borderRadius:9, padding:"11px 14px", display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ background:"#1e3048", color: typeColors[doc.type]||"#64748b", border:`1px solid ${typeColors[doc.type]||"#1e3048"}33`, padding:"2px 8px", borderRadius:20, fontSize:10, fontWeight:700, whiteSpace:"nowrap", flexShrink:0 }}>{doc.type}</span>
              <div style={{ flex:1, minWidth:0 }}>
                {doc.url ? (
                  <a href={doc.url} target="_blank" rel="noreferrer" style={{ color:"#60a5fa", fontWeight:600, fontSize:13, textDecoration:"none", display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    🔗 {doc.name}
                  </a>
                ) : (
                  <div style={{ color:"#f1f5f9", fontWeight:600, fontSize:13 }}>📄 {doc.name}</div>
                )}
                <div style={{ color:"#334155", fontSize:10, marginTop:2 }}>Added {new Date(doc.addedDate+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</div>
              </div>
              <button onClick={()=>onSave({ ...deal, documents: docs.filter(d=>d.id!==doc.id) })} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:13, flexShrink:0 }}>🗑️</button>
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

function DealModal({ deal, onSave, onClose, submarketList }) {
  const smList = submarketList || DEFAULT_SUBMARKETS;
  const [form, setForm] = useState(deal || {
    name: "", client: "", counterparty: "", stage: "Prospect", dealType: "Sale", repType: "Seller/Landlord Rep",
    subtype: "Distribution", sqft: "", dealTotal: "", monthlyRent: "", leaseTerm: "", commissionRate: "",
    probability: "", expectedClose: "", notes: "", broker: "Me", daysInStage: 0, activities: [],
    followUpDate: "", leadSource: "Referral", coBroker: "", splitPct: 100, won: null, lossReason: "",
    richNotes: [], submarket: "Northeast", tags: [], documents: []
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const calc = calcDeal(form);
  const iStyle = { background: "#0f1e2e", border: "1px solid #1e3048", borderRadius: 8, color: "#f1f5f9", padding: "8px 11px", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" };
  const label = (txt) => <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 4 }}>{txt}</label>;
  const sectionHead = (txt) => <div style={{ color: "#475569", fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 8, marginTop: 4 }}>{txt}</div>;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#162032", border: "1px solid #1e3048", borderRadius: 16, padding: 26, width: 660, maxHeight: "93vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ color: "#f1f5f9", fontSize: 17, fontWeight: 800, margin: 0 }}>{deal?.id ? "Edit Deal" : "New Deal"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 20, cursor: "pointer" }}>✕</button>
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
          <div style={{ background: "#0f1e2e", border: "1px solid #1e3048", borderRadius: 10, padding: "12px 16px", marginBottom: 14, display: "flex", gap: 20, flexWrap: "wrap" }}>
            <div><div style={{ color: "#64748b", fontSize: 10 }}>Total Value</div><div style={{ color: "#94a3b8", fontWeight: 800, fontSize: 15 }}>{fmt(calc.totalValue)}</div></div>
            {calc.sqft > 0 && <div><div style={{ color: "#64748b", fontSize: 10 }}>$/SF</div><div style={{ color: "#94a3b8", fontWeight: 800, fontSize: 15 }}>${(calc.totalValue / calc.sqft).toFixed(2)}</div></div>}
            <div><div style={{ color: "#64748b", fontSize: 10 }}>Gross Commission</div><div style={{ color: calc.isSplit ? "#64748b" : "#f59e0b", fontWeight: 800, fontSize: 15, textDecoration: calc.isSplit ? "line-through" : "none" }}>{fmt(calc.grossCommission)}</div></div>
            {calc.isSplit && <div><div style={{ color: "#64748b", fontSize: 10 }}>Your Net ({form.splitPct}%)</div><div style={{ color: "#f59e0b", fontWeight: 800, fontSize: 15 }}>{fmt(calc.netCommission)}</div></div>}
            <div><div style={{ color: "#64748b", fontSize: 10 }}>Weighted Value</div><div style={{ color: "#34d399", fontWeight: 800, fontSize: 15 }}>{fmt(calc.weighted)}</div></div>
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>Tags</label>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
            {(form.tags||[]).map(tag => (
              <span key={tag} style={{ background:"#1e3a5f", color:"#60a5fa", border:"1px solid #1e4a7f", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}
                onClick={()=>set("tags",(form.tags||[]).filter(t=>t!==tag))}>
                {tag} <span style={{ fontSize:10, opacity:0.7 }}>✕</span>
              </span>
            ))}
            {(form.tags||[]).length === 0 && <span style={{ color:"#334155", fontSize:11 }}>No tags yet — click below to add</span>}
          </div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {DEAL_TAG_SUGGESTIONS.filter(s=>!(form.tags||[]).includes(s)).map(s=>(
              <button key={s} onClick={()=>set("tags",[...(form.tags||[]),s])} style={{ background:"#0f1e2e", border:"1px solid #1e3048", color:"#64748b", padding:"3px 9px", borderRadius:20, fontSize:10, cursor:"pointer" }}>{s}</button>
            ))}
            <input placeholder="Custom tag..." onKeyDown={e=>{ if(e.key==="Enter"&&e.target.value.trim()&&!(form.tags||[]).includes(e.target.value.trim())){ set("tags",[...(form.tags||[]),e.target.value.trim()]); e.target.value=""; }}} style={{ background:"#0f1e2e", border:"1px dashed #1e3048", borderRadius:20, color:"#94a3b8", padding:"3px 10px", fontSize:10, outline:"none", width:100 }}/>
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 4 }}>Quick Notes</label>
          <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} style={{ ...iStyle, resize: "vertical" }} placeholder="Short notes. Use 📎 Notes button for detailed LOI, deal terms, requirements..." />
        </div>

        {(form.stageHistory||[]).length > 0 && (
          <div style={{ marginBottom: 18 }}>
            {sectionHead("STAGE HISTORY")}
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              {[...(form.stageHistory||[])].reverse().map((h, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 10px", background:"#0f1e2e", borderRadius:7, border:"1px solid #1e3048" }}>
                  <StageBadge stage={h.stage} />
                  <span style={{ color:"#475569", fontSize:10 }}>{h.enteredDate ? new Date(h.enteredDate+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—"}</span>
                  {h.note && <span style={{ color:"#334155", fontSize:10, fontStyle:"italic" }}>{h.note}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "none", border: "1px solid #1e3048", color: "#94a3b8", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Cancel</button>
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
  const iStyle = { background: "#0f1e2e", border: "1px solid #1e3048", borderRadius: 8, color: "#f1f5f9", padding: "8px 11px", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" };
  const label = (t) => <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 4 }}>{t}</label>;
  const addShowing = () => {
    if (!showingText.trim()) return;
    setForm(f => ({ ...f, showings: [...(f.showings||[]), { id: Date.now(), date: today, prospect: showingText.trim(), outcome: "" }] }));
    setShowingText("");
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#162032", border: "1px solid #1e3048", borderRadius: 16, padding: 26, width: 620, maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ color: "#f1f5f9", fontSize: 17, fontWeight: 800, margin: 0 }}>{listing?.id ? "Edit Listing" : "New Listing"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 20, cursor: "pointer" }}>✕</button>
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
            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0f1e2e", borderRadius: 7, padding: "7px 10px", marginBottom: 5, border: "1px solid #1e3048" }}>
              <span style={{ color: "#f1f5f9", fontSize: 12 }}>{s.prospect}</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ color: "#475569", fontSize: 10 }}>{s.date}</span>
                <button onClick={() => setForm(f => ({ ...f, showings: f.showings.filter(x => x.id !== s.id) }))} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer" }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "none", border: "1px solid #1e3048", color: "#94a3b8", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Cancel</button>
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
  const iStyle = { background: "#0f1e2e", border: "1px solid #1e3048", borderRadius: 8, color: "#f1f5f9", padding: "8px 11px", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" };
  const label = (t) => <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 4 }}>{t}</label>;
  const responseRate = form.targetCount > 0 ? ((parseFloat(form.responses)||0) / parseFloat(form.targetCount) * 100).toFixed(1) : null;
  const convRate = (parseFloat(form.responses)||0) > 0 ? ((parseFloat(form.conversations)||0) / (parseFloat(form.responses)||0) * 100).toFixed(1) : null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#162032", border: "1px solid #1e3048", borderRadius: 16, padding: 26, width: 560 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ color: "#f1f5f9", fontSize: 17, fontWeight: 800, margin: 0 }}>{campaign?.id ? "Edit Campaign" : "New Prospecting Campaign"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 20, cursor: "pointer" }}>✕</button>
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
          <div style={{ background: "#0f1e2e", border: "1px solid #1e3048", borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", gap: 20 }}>
            <div><div style={{ color: "#64748b", fontSize: 10 }}>Response Rate</div><div style={{ color: "#34d399", fontWeight: 800, fontSize: 16 }}>{responseRate}%</div></div>
            {convRate && <div><div style={{ color: "#64748b", fontSize: 10 }}>Response → Conversation</div><div style={{ color: "#f59e0b", fontWeight: 800, fontSize: 16 }}>{convRate}%</div></div>}
            <div><div style={{ color: "#64748b", fontSize: 10 }}>Deals Created</div><div style={{ color: "#60a5fa", fontWeight: 800, fontSize: 16 }}>{form.convertedDeals || 0}</div></div>
          </div>
        )}
        <div style={{ marginBottom: 18 }}>{label("Notes / Strategy")}<textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} style={{ ...iStyle, resize: "vertical" }} placeholder="Target criteria, message used, lessons learned..." /></div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "none", border: "1px solid #1e3048", color: "#94a3b8", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Cancel</button>
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
            <div key={l.id} style={{ background: "#162032", border: "1px solid #1e3048", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14 }}>{l.name}</div>
                  <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>{l.address} · {l.submarket}</div>
                </div>
                <span style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{l.status}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
                <div style={{ background: "#0f1e2e", borderRadius: 7, padding: "8px 10px", border: "1px solid #1e3048" }}>
                  <div style={{ color: "#475569", fontSize: 9, fontWeight: 700 }}>SIZE</div>
                  <div style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 700 }}>{l.sqft ? l.sqft.toLocaleString() : "—"} SF</div>
                </div>
                <div style={{ background: "#0f1e2e", borderRadius: 7, padding: "8px 10px", border: "1px solid #1e3048" }}>
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
              {(l.showings||[]).length > 0 && <div style={{ color: "#64748b", fontSize: 11, marginBottom: 8 }}>👁 {l.showings.length} showing{l.showings.length !== 1 ? "s" : ""}</div>}
              {l.marketingNotes && <div style={{ color: "#475569", fontSize: 11, marginBottom: 10, fontStyle: "italic" }}>{l.marketingNotes}</div>}
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setModal(l)} style={{ flex: 1, background: "#1e3048", border: "none", color: "#94a3b8", padding: "6px", borderRadius: 7, cursor: "pointer", fontSize: 11 }}>✏️ Edit</button>
                <button onClick={() => { if (window.confirm("Delete listing?")) setListings(prev => prev.filter(x => x.id !== l.id)); }} style={{ background: "none", border: "1px solid #1e3048", color: "#475569", padding: "6px 10px", borderRadius: 7, cursor: "pointer", fontSize: 11 }}>🗑️</button>
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
          <div key={c.label} style={{ flex: 1, minWidth: 160, background: "#162032", border: "1px solid #1e3048", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600 }}>{c.label}</div>
            <div style={{ color: c.color, fontSize: 22, fontWeight: 800, margin: "4px 0" }}>{c.value}</div>
            <div style={{ color: "#475569", fontSize: 10 }}>{c.sub}</div>
          </div>
        ))}
      </div>
      {/* Monthly breakdown */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {forecastData.map(m => (
          <div key={m.key} style={{ background: m.key === thisMonthKey ? "#1a2d42" : "#162032", border: `1px solid ${m.key === thisMonthKey ? "#3b82f6" : "#1e3048"}`, borderRadius: 12, padding: "14px 18px" }}>
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
                    <div><div style={{ color: "#4ade80", fontSize: 12, fontWeight: 600 }}>✅ {d.name}</div><div style={{ color: "#16a34a", fontSize: 10 }}>{d.client} · Closed</div></div>
                    <div style={{ color: "#4ade80", fontWeight: 800, fontSize: 13 }}>{fmt(d.netCommission)}</div>
                  </div>
                ))}
                {m.certain.map(d => (
                  <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0f1e2e", border: "1px solid #1e3048", borderRadius: 8, padding: "8px 12px" }}>
                    <div><div style={{ color: "#f1f5f9", fontSize: 12, fontWeight: 600 }}>{d.name}</div><div style={{ color: "#64748b", fontSize: 10 }}>{d.client} · {d.stage} · {d.probability}% probability</div></div>
                    <div style={{ textAlign: "right" }}><div style={{ color: "#f59e0b", fontWeight: 700, fontSize: 13 }}>{fmt(d.weighted)}</div><div style={{ color: "#475569", fontSize: 10 }}>of {fmt(d.netCommission)}</div></div>
                  </div>
                ))}
                {m.probable.map(d => (
                  <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0f1e2e", border: "1px solid #1e3048", borderRadius: 8, padding: "8px 12px", opacity: 0.85 }}>
                    <div><div style={{ color: "#f1f5f9", fontSize: 12 }}>{d.name}</div><div style={{ color: "#64748b", fontSize: 10 }}>{d.client} · {d.stage} · {d.probability}% probability</div></div>
                    <div style={{ textAlign: "right" }}><div style={{ color: "#f59e0b", fontSize: 12 }}>{fmt(d.weighted)}</div><div style={{ color: "#475569", fontSize: 10 }}>of {fmt(d.netCommission)}</div></div>
                  </div>
                ))}
                {m.speculative.map(d => (
                  <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0f1e2e", border: "1px dashed #1e3048", borderRadius: 8, padding: "8px 12px", opacity: 0.65 }}>
                    <div><div style={{ color: "#94a3b8", fontSize: 12 }}>{d.name}</div><div style={{ color: "#475569", fontSize: 10 }}>{d.client} · {d.stage} · {d.probability}% probability</div></div>
                    <div style={{ textAlign: "right" }}><div style={{ color: "#94a3b8", fontSize: 12 }}>{fmt(d.weighted)}</div><div style={{ color: "#475569", fontSize: 10 }}>of {fmt(d.netCommission)}</div></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ background: "#162032", border: "1px solid #1e3048", borderRadius: 10, padding: "10px 14px" }}>
        <div style={{ color: "#475569", fontSize: 11 }}>💡 Solid borders = 50%+ probability · Dashed borders = speculative (&lt;50%) · Green = already closed</div>
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
            { label: "Total Sent", value: totalSent.toLocaleString(), icon: "📬" },
            { label: "Responses", value: totalResp.toLocaleString() + (overallRate ? ` (${overallRate}%)` : ""), icon: "↩️" },
            { label: "Conversations", value: totalConv, icon: "💬" },
            { label: "Deals Created", value: totalDeals, icon: "🤝" },
          ].map(c => (
            <div key={c.label} style={{ flex: 1, minWidth: 120, background: "#162032", border: "1px solid #1e3048", borderRadius: 10, padding: "12px 14px" }}>
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
            <div key={c.id} style={{ background: "#162032", border: "1px solid #1e3048", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14 }}>{c.name}</div>
                    <span style={{ background: "#1e3048", color: statusColors[c.status] || "#64748b", border: `1px solid ${statusColors[c.status] || "#1e3048"}`, padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{c.status}</span>
                  </div>
                  <div style={{ color: "#64748b", fontSize: 11, marginTop: 3 }}>{c.type} · {c.submarket} · {new Date(c.sendDate+"T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setModal(c)} style={{ background: "none", border: "1px solid #1e3048", color: "#64748b", padding: "5px 10px", borderRadius: 7, cursor: "pointer", fontSize: 11 }}>✏️</button>
                  <button onClick={() => { if (window.confirm("Delete?")) setCampaigns(prev => prev.filter(x => x.id !== c.id)); }} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer" }}>🗑️</button>
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
                    <div style={{ background: "#0f1e2e", border: `1px solid #1e3048`, borderRadius: 8, padding: "8px 12px", textAlign: "center", minWidth: 70 }}>
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
  const iStyle = { background: "#0f1e2e", border: "1px solid #1e3048", borderRadius: 8, color: "#f1f5f9", padding: "8px 11px", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" };
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
        <div style={{ background:"#162032", border:"1px solid #1e3048", borderRadius:16, padding:26, width:660, maxHeight:"92vh", overflowY:"auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <h2 style={{ color:"#f1f5f9", fontSize:17, fontWeight:800, margin:0 }}>{comp?.id ? "Edit Comp" : "Add Market Comp"}</h2>
            <button onClick={()=>setModal(null)} style={{ background:"none", border:"none", color:"#64748b", fontSize:20, cursor:"pointer" }}>✕</button>
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
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
            <input type="checkbox" checked={form.verified} onChange={e=>set("verified",e.target.checked)} id="verified" style={{ accentColor:"#10b981" }}/>
            <label htmlFor="verified" style={{ color:"#94a3b8", fontSize:12 }}>Verified / Confirmed comp</label>
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <button onClick={()=>setModal(null)} style={{ background:"none", border:"1px solid #1e3048", color:"#94a3b8", padding:"8px 16px", borderRadius:8, cursor:"pointer", fontSize:13 }}>Cancel</button>
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
          <div style={{ color:"#f1f5f9", fontWeight:800, fontSize:16 }}>Market Comps</div>
          <div style={{ color:"#475569", fontSize:11 }}>Track what's trading in your submarkets — sales, leases, brokers, and pricing</div>
        </div>
        <button onClick={()=>setModal("new")} style={{ background:"#34d399", border:"none", color:"#0f1e2e", padding:"7px 16px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:800 }}>+ Add Comp</button>
      </div>

      {/* Summary stats */}
      {comps.length > 0 && <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
        {[
          { label:"Total Comps", value:comps.length, color:"#60a5fa" },
          { label:"SF Tracked", value: totalSF > 0 ? totalSF.toLocaleString()+" SF" : "—", color:"#f59e0b" },
          { label:"Avg Sale $/SF", value: avgPsfSale ? "$"+avgPsfSale : "—", color:"#34d399" },
          { label:"Avg Lease $/SF/mo", value: avgPsfLease ? "$"+parseFloat(avgPsfLease).toFixed(3) : "—", color:"#8b5cf6" },
        ].map(c=>(
          <div key={c.label} style={{ flex:1, minWidth:130, background:"#162032", border:"1px solid #1e3048", borderRadius:10, padding:"12px 14px" }}>
            <div style={{ color:c.color, fontWeight:800, fontSize:18 }}>{c.value}</div>
            <div style={{ color:"#475569", fontSize:10, fontWeight:600 }}>{c.label}</div>
          </div>
        ))}
      </div>}

      {/* Filters */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search property, buyer, seller, broker..." style={{ background:"#162032", border:"1px solid #1e3048", borderRadius:8, color:"#f1f5f9", padding:"7px 11px", fontSize:12, outline:"none", flex:1, minWidth:200 }}/>
        <select value={filterSm} onChange={e=>setFilterSm(e.target.value)} style={{ background:"#162032", border:"1px solid #1e3048", borderRadius:8, color:"#94a3b8", padding:"7px 11px", fontSize:12, outline:"none" }}>
          <option value="All">All Submarkets</option>
          {submarketList.map(s=><option key={s}>{s}</option>)}
        </select>
        <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{ background:"#162032", border:"1px solid #1e3048", borderRadius:8, color:"#94a3b8", padding:"7px 11px", fontSize:12, outline:"none" }}>
          <option value="All">Sales + Leases</option>
          <option value="Sale">Sales Only</option>
          <option value="Lease">Leases Only</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background:"#162032", borderRadius:12, border:"1px solid #1e3048", overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", minWidth:900 }}>
          <thead>
            <tr style={{ borderBottom:"2px solid #1e3048" }}>
              {["Property","Submarket","Type","Sq Ft","Price / Rent","$/SF","Close Date","Seller/LL","Buyer/Tenant","Listing Broker","Tenant Broker","Source",""].map(h=>(
                <th key={h} style={{ color:"#64748b", fontSize:10, fontWeight:700, textAlign:"left", padding:"9px 10px", whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c=>(
              <tr key={c.id} style={{ borderBottom:"1px solid #1e3048" }}
                onMouseEnter={e=>e.currentTarget.style.background="#1a2d42"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{ padding:"10px", color:"#f1f5f9", fontWeight:600, fontSize:12, maxWidth:160 }}>
                  <div>{c.name||"—"}</div>
                  {c.address && <div style={{ color:"#475569", fontSize:10 }}>{c.address}</div>}
                  {c.verified && <span style={{ background:"#0f2010", color:"#4ade80", border:"1px solid #14532d", padding:"1px 6px", borderRadius:20, fontSize:9, fontWeight:700 }}>✓ verified</span>}
                </td>
                <td style={{ padding:"10px", color:"#94a3b8", fontSize:11 }}>{c.submarket||"—"}</td>
                <td style={{ padding:"10px" }}>
                  <span style={{ background: c.compType==="Sale" ? "#1e3a5f":"#1a2a1a", color: c.compType==="Sale" ? "#60a5fa":"#4ade80", padding:"2px 8px", borderRadius:10, fontSize:10, fontWeight:700 }}>{c.compType}</span>
                  <div style={{ color:"#334155", fontSize:9, marginTop:2 }}>{c.subtype}</div>
                </td>
                <td style={{ padding:"10px", color:"#cbd5e1", fontSize:12 }}>{c.sqft ? c.sqft.toLocaleString() : "—"}</td>
                <td style={{ padding:"10px", color:"#f59e0b", fontWeight:700, fontSize:12 }}>
                  {c.compType==="Sale" ? (c.salePrice > 0 ? fmt(c.salePrice) : "—") : (c.monthlyRent > 0 ? fmt(c.monthlyRent)+"/mo" : "—")}
                  {c.compType==="Lease" && c.leaseTerm > 0 && <div style={{ color:"#475569", fontSize:9 }}>{c.leaseTerm}mo term</div>}
                </td>
                <td style={{ padding:"10px", color:"#34d399", fontWeight:700, fontSize:12 }}>
                  {c.compType==="Sale" ? (c.psfSale > 0 ? "$"+parseFloat(c.psfSale).toFixed(2)+"/SF" : "—") : (c.psfLease > 0 ? "$"+parseFloat(c.psfLease).toFixed(3)+"/SF/mo" : "—")}
                </td>
                <td style={{ padding:"10px", color:"#64748b", fontSize:11 }}>{c.closeDate ? new Date(c.closeDate+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—"}</td>
                <td style={{ padding:"10px", color:"#94a3b8", fontSize:11 }}>{c.seller||"—"}</td>
                <td style={{ padding:"10px", color:"#94a3b8", fontSize:11 }}>{c.buyer||"—"}</td>
                <td style={{ padding:"10px", color:"#60a5fa", fontSize:11 }}>{c.listingBroker||"—"}</td>
                <td style={{ padding:"10px", color:"#8b5cf6", fontSize:11 }}>{c.tenantBroker||"—"}</td>
                <td style={{ padding:"10px", color:"#475569", fontSize:10 }}>{c.source||"—"}</td>
                <td style={{ padding:"10px" }}>
                  <div style={{ display:"flex", gap:4 }}>
                    <button onClick={()=>setModal(c)} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer", fontSize:13 }}>✏️</button>
                    <button onClick={()=>{ if(window.confirm("Delete comp?")) setComps(prev=>prev.filter(x=>x.id!==c.id)); }} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer", fontSize:13 }}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          {filtered.length > 0 && <tfoot>
            <tr style={{ borderTop:"2px solid #1e3048", background:"#0f1e2e" }}>
              <td colSpan={3} style={{ padding:"10px", color:"#475569", fontSize:11 }}>{filtered.length} comp{filtered.length!==1?"s":""}</td>
              <td style={{ padding:"10px", color:"#f1f5f9", fontWeight:800, fontSize:11 }}>{totalSF.toLocaleString()} SF</td>
              <td colSpan={9}/>
            </tr>
          </tfoot>}
        </table>
        {filtered.length === 0 && <div style={{ color:"#475569", fontSize:13, textAlign:"center", padding:"40px 0" }}>No comps yet. Start adding market transactions you see in CoStar, LoopNet, or from other brokers.</div>}
      </div>
      {modal && <CompModal comp={modal==="new"?null:modal}/>}
    </div>
  );
}

// ── Submarket Tab ─────────────────────────────────────────────
function SubmarketTab({ deals, listings, comps, submarketList, setSubmarketList }) {
  const enriched = useMemo(() => deals.map(calcDeal), [deals]);
  const [newSm, setNewSm] = useState("");
  const [editMode, setEditMode] = useState(false);

  const rows = submarketList.map(sm => {
    const smDeals = enriched.filter(d => d.submarket === sm);
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
    return { sm, smDeals, closed, active, closedSales, avgPsfSale, closedLeases, avgPsfLease, totalSqft, commissions, activeSF, smListings, smComps, mktAvgSale, mktAvgLease };
  });

  const addSubmarket = () => {
    const name = newSm.trim();
    if (!name || submarketList.includes(name)) return;
    setSubmarketList(prev => [...prev, name]);
    setNewSm("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 16 }}>Submarket Intelligence</div>
          <div style={{ color: "#475569", fontSize: 11 }}>Your deal history, listings, and market comp data by geography</div>
        </div>
        <button onClick={()=>setEditMode(e=>!e)} style={{ background: editMode?"#1e3048":"#162032", border:"1px solid #1e3048", color: editMode?"#f59e0b":"#64748b", padding:"6px 13px", borderRadius:7, cursor:"pointer", fontSize:11, fontWeight: editMode?700:400 }}>⚙️ Edit Submarkets</button>
      </div>

      {/* Submarket editor */}
      {editMode && (
        <div style={{ background:"#162032", border:"1px solid #f59e0b", borderRadius:12, padding:"14px 18px" }}>
          <div style={{ color:"#f59e0b", fontWeight:700, fontSize:12, marginBottom:10 }}>Manage Your Submarkets</div>
          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            <input value={newSm} onChange={e=>setNewSm(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addSubmarket()} placeholder="Add new submarket name..." style={{ flex:1, background:"#0f1e2e", border:"1px solid #1e3048", borderRadius:8, color:"#f1f5f9", padding:"8px 11px", fontSize:13, outline:"none" }}/>
            <button onClick={addSubmarket} style={{ background:"#f59e0b", border:"none", color:"#0d1826", padding:"8px 16px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:800 }}>+ Add</button>
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {submarketList.map(sm => (
              <div key={sm} style={{ display:"flex", alignItems:"center", gap:4, background:"#0f1e2e", border:"1px solid #1e3048", borderRadius:20, padding:"4px 10px" }}>
                <span style={{ color:"#f1f5f9", fontSize:12 }}>{sm}</span>
                <button onClick={()=>{ if(window.confirm(`Remove "${sm}"? This won't delete deals or listings assigned to it.`)) setSubmarketList(prev=>prev.filter(s=>s!==sm)); }} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:11, padding:0, lineHeight:1 }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {rows.length === 0 && <div style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: "40px 0" }}>No submarket data yet. Assign submarkets to your deals and listings.</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.sort((a,b) => (b.smDeals.length + b.smComps.length) - (a.smDeals.length + a.smComps.length)).map(r => (
          <div key={r.sm} style={{ background: "#162032", border: "1px solid #1e3048", borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 15 }}>{r.sm}</div>
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
                <div key={s.label} style={{ background: "#0f1e2e", border: "1px solid #1e3048", borderRadius: 8, padding: "10px 14px", minWidth: 110 }}>
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
                    <div key={c.id} style={{ background:"#0f1e2e", border:"1px solid #1e3048", borderRadius:7, padding:"6px 10px" }}>
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
                    <div key={d.id} style={{ background: "#0f1e2e", border: "1px solid #1e3048", borderRadius: 7, padding: "5px 10px" }}>
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
function ContactsTab({ contacts, setContacts, deals, submarketList }) {
  const smList = submarketList || DEFAULT_SUBMARKETS;
  const [modal, setModal] = useState(null);
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
    const iStyle = { background:"#0f1e2e", border:"1px solid #1e3048", borderRadius:8, color:"#f1f5f9", padding:"8px 11px", fontSize:13, outline:"none", width:"100%", boxSizing:"border-box" };
    const lbl = (t) => <label style={{ color:"#94a3b8", fontSize:11, fontWeight:600, display:"block", marginBottom:4 }}>{t}</label>;
    return (
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
        <div style={{ background:"#162032", border:"1px solid #1e3048", borderRadius:16, padding:26, width:580, maxHeight:"90vh", overflowY:"auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <h2 style={{ color:"#f1f5f9", fontSize:17, fontWeight:800, margin:0 }}>{contact?.id?"Edit Contact":"New Contact"}</h2>
            <button onClick={()=>setModal(null)} style={{ background:"none", border:"none", color:"#64748b", fontSize:20, cursor:"pointer" }}>✕</button>
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
            <button onClick={()=>setModal(null)} style={{ background:"none", border:"1px solid #1e3048", color:"#94a3b8", padding:"8px 16px", borderRadius:8, cursor:"pointer", fontSize:13 }}>Cancel</button>
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
        <div style={{ display:"flex", background:"#0f1e2e", borderRadius:8, border:"1px solid #1e3048", padding:2 }}>
          <button onClick={()=>setActiveView("all")} style={{ background: activeView==="all"?"#1e3048":"none", border:"none", color: activeView==="all"?"#f1f5f9":"#64748b", padding:"5px 13px", borderRadius:6, cursor:"pointer", fontSize:11, fontWeight: activeView==="all"?700:400 }}>All Contacts ({contacts.length})</button>
          <button onClick={()=>setActiveView("outreach")} style={{ background: activeView==="outreach"?"#4a1a3a":"none", border:"none", color: activeView==="outreach"?"#ec4899":"#64748b", padding:"5px 13px", borderRadius:6, cursor:"pointer", fontSize:11, fontWeight: activeView==="outreach"?700:400 }}>
            📞 Outreach Queue {outreachQueue.length > 0 && <span style={{ background:"#ec4899", color:"#fff", borderRadius:20, padding:"0px 5px", fontSize:9, fontWeight:800 }}>{outreachQueue.length}</span>}
          </button>
        </div>
        {activeView === "all" && <>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, company, email..." style={{ flex:1, minWidth:200, background:"#162032", border:"1px solid #1e3048", borderRadius:8, color:"#f1f5f9", padding:"7px 11px", fontSize:12, outline:"none" }}/>
          <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{ background:"#162032", border:"1px solid #1e3048", borderRadius:8, color:"#94a3b8", padding:"7px 11px", fontSize:12, outline:"none" }}>
            <option value="All">All Types</option>
            {CONTACT_TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
        </>}
      </div>

      {/* Outreach Queue view */}
      {activeView === "outreach" && (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ background:"#1a0a1a", border:"1px solid #4a1a3a", borderRadius:10, padding:"10px 14px", fontSize:11, color:"#ec4899" }}>
            📞 These contacts are overdue for a touchpoint based on their relationship level. Key Relationships → 30 days · Active → 45 days · Warm → 60 days · Cold → 90 days.
          </div>
          {outreachQueue.length === 0 && <div style={{ color:"#475569", fontSize:13, textAlign:"center", padding:"40px 0" }}>🎉 All contacts have been recently touched. You're on top of your relationships.</div>}
          {outreachQueue.map(c => {
            const ds = daysSince(c.lastContact);
            const threshold = outreachThresholds[c.relationshipLevel] || 90;
            const overBy = ds !== null ? ds - threshold : null;
            return (
              <div key={c.id} style={{ background:"#162032", border:`1px solid ${relColors[c.relationshipLevel]||"#1e3048"}44`, borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"center", gap:14 }}>
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
                    {c.phone && <a href={`tel:${c.phone}`} style={{ background:"#1e3048", color:"#60a5fa", padding:"4px 9px", borderRadius:6, fontSize:10, textDecoration:"none" }}>📞 Call</a>}
                    {c.email && <a href={`mailto:${c.email}`} style={{ background:"#1e3048", color:"#60a5fa", padding:"4px 9px", borderRadius:6, fontSize:10, textDecoration:"none" }}>✉️ Email</a>}
                    <button onClick={()=>markContacted(c.id)} style={{ background:"#10b981", border:"none", color:"#fff", padding:"4px 9px", borderRadius:6, fontSize:10, cursor:"pointer", fontWeight:700 }}>✓ Mark Contacted</button>
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
            <div key={c.id} style={{ background:"#162032", border:"1px solid #1e3048", borderRadius:12, padding:"16px 18px" }}>
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
                {c.phone && <a href={`tel:${c.phone}`} style={{ color:"#60a5fa", fontSize:11, textDecoration:"none" }}>📞 {c.phone}</a>}
                {c.email && <a href={`mailto:${c.email}`} style={{ color:"#60a5fa", fontSize:11, textDecoration:"none" }}>✉️ {c.email}</a>}
              </div>
              <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
                {c.submarket && <span style={{ background:"#1e3048", color:"#94a3b8", padding:"2px 8px", borderRadius:20, fontSize:10 }}>{c.submarket}</span>}
                {ds !== null && <span style={{ background: stale?"#2d1515":"#0f1e2e", color: stale?"#fca5a5":"#475569", border:`1px solid ${stale?"#7f1d1d":"#1e3048"}`, padding:"2px 8px", borderRadius:20, fontSize:10 }}>{stale?"⚠️ ":""}{ds === 0 ? "Today" : `${ds}d ago`}</span>}
              </div>
              {c.properties && <div style={{ color:"#475569", fontSize:11, marginBottom:8 }}>🏢 {c.properties}</div>}
              {c.notes && <div style={{ color:"#475569", fontSize:11, marginBottom:10, fontStyle:"italic", borderLeft:"2px solid #1e3048", paddingLeft:8 }}>{c.notes}</div>}
              {linkedD.length > 0 && <div style={{ marginBottom:10 }}><div style={{ color:"#334155", fontSize:9, fontWeight:700, marginBottom:4 }}>LINKED DEALS</div>{linkedD.map(d=><span key={d.id} style={{ background:"#1e3048", color:"#94a3b8", padding:"2px 8px", borderRadius:20, fontSize:10, marginRight:4 }}>{d.name}</span>)}</div>}
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={()=>markContacted(c.id)} style={{ background:"#0a2a1a", border:"1px solid #16a34a", color:"#4ade80", padding:"6px 10px", borderRadius:7, cursor:"pointer", fontSize:11, fontWeight:700 }}>✓ Contacted</button>
                <button onClick={()=>setModal(c)} style={{ flex:1, background:"#1e3048", border:"none", color:"#94a3b8", padding:"6px", borderRadius:7, cursor:"pointer", fontSize:11 }}>✏️ Edit</button>
                <button onClick={()=>{ if(window.confirm("Delete contact?")) setContacts(prev=>prev.filter(x=>x.id!==c.id)); }} style={{ background:"none", border:"1px solid #1e3048", color:"#475569", padding:"6px 10px", borderRadius:7, cursor:"pointer", fontSize:11 }}>🗑️</button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div style={{ color:"#475569", fontSize:13, textAlign:"center", padding:"40px 0", gridColumn:"1/-1" }}>No contacts yet. Add owners, tenants, brokers, and investors you work with.</div>}
      </div>}
      {modal && <ContactModal contact={modal==="new"?null:modal}/>}
    </div>
  );
}

// ── Tasks Tab ─────────────────────────────────────────────────
function TasksTab({ tasks, setTasks, deals }) {
  const [modal, setModal] = useState(null);
  const [showDone, setShowDone] = useState(false);
  const [filterCat, setFilterCat] = useState("All");
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
    const iStyle = { background:"#0f1e2e", border:"1px solid #1e3048", borderRadius:8, color:"#f1f5f9", padding:"8px 11px", fontSize:13, outline:"none", width:"100%", boxSizing:"border-box" };
    const lbl = (t) => <label style={{ color:"#94a3b8", fontSize:11, fontWeight:600, display:"block", marginBottom:4 }}>{t}</label>;
    const isRecurring = form.recurrence && form.recurrence !== "None";
    return (
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
        <div style={{ background:"#162032", border:"1px solid #1e3048", borderRadius:16, padding:26, width:500 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <h2 style={{ color:"#f1f5f9", fontSize:17, fontWeight:800, margin:0 }}>{task?.id?"Edit Task":"New Task"}</h2>
            <button onClick={()=>setModal(null)} style={{ background:"none", border:"none", color:"#64748b", fontSize:20, cursor:"pointer" }}>✕</button>
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
                🔁 When you check this off, a new copy will auto-schedule {form.recurrence.toLowerCase()} starting {form.dueDate ? new Date(nextDueDate(form.dueDate, form.recurrence)+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "from the due date"}.
              </div>
            )}
            {lbl("Notes")}
            <textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={2} style={{...iStyle,resize:"vertical"}} placeholder="Details, context..."/>
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:18 }}>
            <button onClick={()=>setModal(null)} style={{ background:"none", border:"1px solid #1e3048", color:"#94a3b8", padding:"8px 16px", borderRadius:8, cursor:"pointer", fontSize:13 }}>Cancel</button>
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
            {recurring > 0 && <span style={{ color:"#f59e0b" }}> · 🔁 {recurring} recurring</span>}
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{ background:"#162032", border:"1px solid #1e3048", borderRadius:7, color:"#94a3b8", padding:"6px 10px", fontSize:11, outline:"none" }}>
            <option value="All">All Categories</option>
            {categories.map(c=><option key={c}>{c}</option>)}
          </select>
          <button onClick={()=>setShowDone(s=>!s)} style={{ background:"#162032", border:"1px solid #1e3048", color:"#64748b", padding:"6px 12px", borderRadius:7, cursor:"pointer", fontSize:11 }}>{showDone?"Hide Done":"Show Done"}</button>
          <button onClick={()=>setModal("new")} style={{ background:"#f97316", border:"none", color:"#fff", padding:"7px 16px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:800 }}>+ Add Task</button>
        </div>
      </div>

      {/* Quick recurring task templates */}
      {tasks.length === 0 && (
        <div style={{ background:"#162032", border:"1px dashed #1e3048", borderRadius:10, padding:"14px 16px" }}>
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
                style={{ background:"#0f1e2e", border:"1px solid #1e3048", color:"#94a3b8", padding:"5px 11px", borderRadius:20, fontSize:11, cursor:"pointer" }}>
                🔁 {t.title} ({t.recurrence})
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
            <div key={t.id} style={{ background: t.done?"#0d1826":"#162032", border:`1px solid ${isOver?"#7f1d1d":isDue?"#16a34a":isRecurring?"#78350f":"#1e3048"}`, borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"flex-start", gap:12, opacity: t.done ? 0.5 : 1 }}>
              <button onClick={()=>toggleDone(t.id)} style={{ background:"none", border:`2px solid ${t.done?"#10b981":"#1e3048"}`, borderRadius:"50%", width:20, height:20, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:2, color:"#10b981", fontSize:11 }}>{t.done?"✓":""}</button>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                  <span style={{ color: t.done?"#475569":"#f1f5f9", fontWeight:600, fontSize:13, textDecoration: t.done?"line-through":"none" }}>{t.title}</span>
                  <span style={{ background:"#1e3048", color: priorityColors[t.priority]||"#64748b", border:`1px solid ${priorityColors[t.priority]||"#1e3048"}`, padding:"1px 7px", borderRadius:20, fontSize:9, fontWeight:700 }}>{t.priority}</span>
                  <span style={{ background:"#0f1e2e", color:"#475569", padding:"1px 7px", borderRadius:20, fontSize:9 }}>{t.category}</span>
                  {isRecurring && <span style={{ background:"#292524", color:"#f59e0b", border:"1px solid #78350f", padding:"1px 7px", borderRadius:20, fontSize:9, fontWeight:700 }}>🔁 {t.recurrence}</span>}
                  {linkedDeal && <span style={{ background:"#1e3a5f", color:"#60a5fa", padding:"1px 7px", borderRadius:20, fontSize:9 }}>📈 {linkedDeal.name}</span>}
                </div>
                {t.notes && <div style={{ color:"#475569", fontSize:11, marginTop:4 }}>{t.notes}</div>}
                <div style={{ display:"flex", gap:12, marginTop:4, flexWrap:"wrap" }}>
                  {t.dueDate && <span style={{ color: isOver?"#fca5a5":isDue?"#4ade80":"#475569", fontSize:10, fontWeight: (isOver||isDue)?700:400 }}>{isOver?"⚠️ Overdue · ":isDue?"📅 Due today · ":""}{new Date(t.dueDate+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span>}
                  {isRecurring && !t.done && t.dueDate && <span style={{ color:"#64748b", fontSize:10 }}>Next after done: {new Date(nextDueDate(t.dueDate,t.recurrence)+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span>}
                </div>
              </div>
              <div style={{ display:"flex", gap:4 }}>
                <button onClick={()=>setModal(t)} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer", fontSize:13 }}>✏️</button>
                <button onClick={()=>{ if(window.confirm("Delete task?")) setTasks(prev=>prev.filter(x=>x.id!==t.id)); }} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:13 }}>🗑️</button>
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
    const iStyle = { background:"#0f1e2e", border:"1px solid #1e3048", borderRadius:8, color:"#f1f5f9", padding:"8px 11px", fontSize:13, outline:"none", width:"100%", boxSizing:"border-box" };
    const lbl = (t) => <label style={{ color:"#94a3b8", fontSize:11, fontWeight:600, display:"block", marginBottom:4 }}>{t}</label>;
    return (
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
        <div style={{ background:"#162032", border:"1px solid #1e3048", borderRadius:16, padding:26, width:460 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <h2 style={{ color:"#f1f5f9", fontSize:17, fontWeight:800, margin:0 }}>{expense?.id?"Edit Expense":"Log Expense"}</h2>
            <button onClick={()=>setModal(null)} style={{ background:"none", border:"none", color:"#64748b", fontSize:20, cursor:"pointer" }}>✕</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:11, marginBottom:14 }}>
            <div style={{ gridColumn:"span 2" }}>{lbl("Category")}<select value={form.category} onChange={e=>set("category",e.target.value)} style={iStyle}>{EXPENSE_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
            <div style={{ gridColumn:"span 2" }}>{lbl("Description")}<input value={form.description} onChange={e=>set("description",e.target.value)} placeholder="What was this for?" style={iStyle}/></div>
            <div>{lbl("Amount ($)")}<input type="number" value={form.amount} onChange={e=>set("amount",e.target.value)} style={iStyle}/></div>
            <div>{lbl("Date")}<input type="date" value={form.date} onChange={e=>set("date",e.target.value)} style={iStyle}/></div>
            <div style={{ gridColumn:"span 2" }}>{lbl("Notes")}<textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={2} style={{...iStyle,resize:"vertical"}}/></div>
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <button onClick={()=>setModal(null)} style={{ background:"none", border:"1px solid #1e3048", color:"#94a3b8", padding:"8px 16px", borderRadius:8, cursor:"pointer", fontSize:13 }}>Cancel</button>
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
          <select value={filterYear} onChange={e=>setFilterYear(e.target.value)} style={{ background:"#162032", border:"1px solid #1e3048", borderRadius:7, color:"#94a3b8", padding:"6px 10px", fontSize:12, outline:"none" }}>
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
          <div key={c.label} style={{ flex:1, minWidth:150, background:"#162032", border:"1px solid #1e3048", borderRadius:12, padding:"14px 16px" }}>
            <div style={{ color:c.color, fontWeight:800, fontSize:20 }}>{c.value}</div>
            <div style={{ color:"#94a3b8", fontSize:11, fontWeight:600, marginTop:2 }}>{c.label}</div>
            <div style={{ color:"#475569", fontSize:10 }}>{c.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:12 }}>
        {/* By category */}
        <div style={{ background:"#162032", border:"1px solid #1e3048", borderRadius:12, padding:"14px 18px" }}>
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
        <div style={{ background:"#162032", border:"1px solid #1e3048", borderRadius:12, padding:"14px 18px", overflowY:"auto", maxHeight:400 }}>
          <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:13, marginBottom:12 }}>All Expenses — {filterYear}</div>
          {yearExpenses.length === 0 && <div style={{ color:"#475569", fontSize:12 }}>No expenses logged for {filterYear}.</div>}
          {yearExpenses.sort((a,b)=>b.date.localeCompare(a.date)).map(e=>(
            <div key={e.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid #1e3048", padding:"9px 0" }}>
              <div>
                <div style={{ color:"#f1f5f9", fontSize:12, fontWeight:600 }}>{e.description||e.category}</div>
                <div style={{ color:"#475569", fontSize:10 }}>{e.category} · {new Date(e.date+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</div>
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <span style={{ color:"#ef4444", fontWeight:700, fontSize:13 }}>{fmt(e.amount)}</span>
                <button onClick={()=>setModal(e)} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:12 }}>✏️</button>
                <button onClick={()=>{ if(window.confirm("Delete?")) setExpenses(prev=>prev.filter(x=>x.id!==e.id)); }} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:12 }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {modal && <ExpenseModal expense={modal==="new"?null:modal}/>}
    </div>
  );
}

// ── Property Database Tab ─────────────────────────────────────
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
    const iStyle = { background:"#0f1e2e", border:"1px solid #1e3048", borderRadius:8, color:"#f1f5f9", padding:"8px 11px", fontSize:13, outline:"none", width:"100%", boxSizing:"border-box" };
    const lbl = (t) => <label style={{ color:"#94a3b8", fontSize:11, fontWeight:600, display:"block", marginBottom:4 }}>{t}</label>;
    return (
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
        <div style={{ background:"#162032", border:"1px solid #1e3048", borderRadius:16, padding:26, width:620, maxHeight:"90vh", overflowY:"auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <h2 style={{ color:"#f1f5f9", fontSize:17, fontWeight:800, margin:0 }}>{property?.id?"Edit Property":"Add Property"}</h2>
            <button onClick={()=>setModal(null)} style={{ background:"none", border:"none", color:"#64748b", fontSize:20, cursor:"pointer" }}>✕</button>
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
            <button onClick={()=>setModal(null)} style={{ background:"none", border:"1px solid #1e3048", color:"#94a3b8", padding:"8px 16px", borderRadius:8, cursor:"pointer", fontSize:13 }}>Cancel</button>
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
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search property name, address, owner, submarket..." style={{ background:"#162032", border:"1px solid #1e3048", borderRadius:8, color:"#f1f5f9", padding:"8px 12px", fontSize:12, outline:"none" }}/>
      <div style={{ background:"#162032", border:"1px solid #1e3048", borderRadius:12, overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", minWidth:800 }}>
          <thead>
            <tr style={{ borderBottom:"2px solid #1e3048" }}>
              {["Property","Submarket","Subtype","Sq Ft","Yr Built","Clear Ht","Docks","Owner","Contact","Last Sale","Tags",""].map(h=>(
                <th key={h} style={{ color:"#64748b", fontSize:10, fontWeight:700, textAlign:"left", padding:"9px 10px", whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p=>(
              <tr key={p.id} style={{ borderBottom:"1px solid #1e3048" }}
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
                    <button onClick={()=>setModal(p)} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer", fontSize:13 }}>✏️</button>
                    <button onClick={()=>{ if(window.confirm("Delete?")) setProperties(prev=>prev.filter(x=>x.id!==p.id)); }} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:13 }}>🗑️</button>
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
      <div style={{ background:"#162032", border:"1px solid #1e3048", borderRadius:12, padding:"18px 20px", overflowX:"auto" }}>
        {/* Month headers */}
        <div style={{ display:"flex", position:"relative", marginBottom:8, marginLeft:200 }}>
          {months.map((m,i) => (
            <div key={i} style={{ flex:1, color:"#64748b", fontSize:10, fontWeight:700, borderLeft:"1px solid #1e3048", paddingLeft:4, paddingBottom:4 }}>{m.label}</div>
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
                      <div style={{ width:12, height:12, borderRadius:"50%", background:color, border:"2px solid #162032", boxShadow:`0 0 0 3px ${color}33` }} title={`${d.name} — ${d.expectedClose}`}/>
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
              <div key={i} style={{ position:"absolute", left:`${(i/months.length)*100}%`, top:0, bottom:0, borderLeft:"1px solid #1e3048" }}/>
            ))}
            <div style={{ position:"absolute", left:`${todayPct*((100)/(months.length))/100*100}%`, display:"none" }}/>
          </div>
        </div>
        {/* Legend */}
        <div style={{ display:"flex", gap:12, marginTop:14, flexWrap:"wrap", borderTop:"1px solid #1e3048", paddingTop:12 }}>
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
      <div style={{ background:"#162032", border:"1px solid #1e3048", borderRadius:12, padding:"14px 18px" }}>
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
              <div key={i} style={{ flex:1, minWidth:120, background:"#0f1e2e", border:"1px solid #1e3048", borderRadius:8, padding:"10px 12px" }}>
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
    events.push({ date: h.enteredDate + "T00:00:00", type: "stage", label: h.stage, note: h.note || "", icon: "🔄" });
  });
  (deal.activities || []).forEach(a => {
    events.push({ date: a.date, type: "activity", label: a.type, note: a.text, icon: "📋" });
  });
  (deal.richNotes || []).forEach(n => {
    events.push({ date: n.date + "T00:00:00", type: "note", label: n.type, note: n.text?.substring(0,120) || "", icon: "📎" });
  });
  (deal.documents || []).forEach(doc => {
    events.push({ date: doc.addedDate + "T00:00:00", type: "document", label: doc.type, note: doc.name, icon: "📁", url: doc.url });
  });
  events.sort((a, b) => new Date(b.date) - new Date(a.date));

  const typeColors = { stage: "#f59e0b", activity: "#3b82f6", note: "#8b5cf6", document: "#10b981" };
  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}>
      <div style={{ background: "#162032", border: "1px solid #1e3048", borderRadius: 16, padding: 26, width: 620, maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h2 style={{ color: "#f1f5f9", fontSize: 17, fontWeight: 800, margin: 0 }}>🕐 Deal Timeline</h2>
            <div style={{ color: "#475569", fontSize: 12, marginTop: 3 }}>{deal.name} · {deal.client}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        {/* Deal summary bar */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20, background: "#0f1e2e", borderRadius: 10, padding: "12px 16px" }}>
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
            <div style={{ color: enriched.health.color, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>⚠️ Health Issues</div>
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
                {e.url && <a href={e.url} target="_blank" rel="noreferrer" style={{ color: "#60a5fa", fontSize: 11, marginTop: 4, display: "block" }}>🔗 Open link</a>}
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
    <div style={{ background: "#162032", border: `1px solid ${accent}`, borderRadius: 12, padding: "18px 20px" }}>
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
              const sc = STAGE_COLORS[stage] || { bg: "#1e3048", text: "#94a3b8", border: "#1e3048" };
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
                  <div style={{ background: "#0f1e2e", borderRadius: 999, height: 8, overflow: "hidden" }}>
                    <div style={{ width: `${barW}%`, height: "100%", background: sc.text, borderRadius: 999, opacity: 0.8 }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #1e3048", display: "flex", gap: 16 }}>
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
              <div style={{ background: "#0f1e2e", borderRadius: 999, height: 6 }}>
                <div style={{ width: `${pct(count, lost.length)}%`, height: "100%", background: "#ef4444", borderRadius: 999, opacity: 0.7 }} />
              </div>
            </div>
          ))}
          {sourceWinRates.length > 0 && (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #1e3048" }}>
              <div style={{ color: "#475569", fontSize: 9, fontWeight: 700, marginBottom: 10 }}>WIN RATE BY LEAD SOURCE</div>
              {sourceWinRates.slice(0, 5).map(s => (
                <div key={s.src} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "center" }}>
                  <span style={{ color: "#64748b", fontSize: 10 }}>{s.src} ({s.total})</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 60, background: "#0f1e2e", borderRadius: 999, height: 5 }}>
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
        <div style={{ display: "flex", gap: 16, marginTop: 12, paddingTop: 10, borderTop: "1px solid #1e3048" }}>
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
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1e3048" }}>
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
                  <div style={{ background: "#0f1e2e", borderRadius: 999, height: 7 }}>
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
            <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#0f1e2e", borderRadius: 9, border: `1px solid ${d.health?.color || "#1e3048"}33` }}>
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
        <div style={{ background: "#162032", border: "1px dashed #1e3048", borderRadius: 12, padding: "32px", textAlign: "center" }}>
          <div style={{ color: "#475569", fontSize: 14, marginBottom: 8 }}>No lease expirations tracked yet</div>
          <div style={{ color: "#334155", fontSize: 12 }}>When you close a Lease deal with an expected close date and lease term, expirations will automatically appear here.</div>
          <div style={{ color: "#334155", fontSize: 12, marginTop: 6 }}>Make sure your closed lease deals have: Expected Close Date + Lease Term (months).</div>
        </div>
      ) : (
        <>
          {/* Summary bands */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <UrgencyBand label="⚠️ Expired — call immediately" count={urgencyCounts.expired} color="#ef4444" />
            <UrgencyBand label="🔴 Critical — expiring within 90 days" count={urgencyCounts.critical} color="#f97316" />
            <UrgencyBand label="🟡 Urgent — expiring within 6 months" count={urgencyCounts.urgent} color="#f59e0b" />
            <UrgencyBand label="🔵 Watch — expiring within 1 year" count={urgencyCounts.watch} color="#60a5fa" />
            <UrgencyBand label="🟢 Monitor — 1+ year remaining" count={urgencyCounts.monitor} color="#10b981" />
          </div>

          {/* Lease list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tenantLeases.map(d => (
              <div key={d.id} style={{ background: "#162032", border: `1px solid ${d.urgencyColor}33`, borderRadius: 11, padding: "14px 18px", display: "flex", gap: 16, alignItems: "center" }}>
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
function HomeBriefing({ deals, tasks, contacts, listings, gciGoal, closedYTD, totalWeighted, onNavigate }) {
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
    <div style={{ background:"#162032", border:`1px solid ${count > 0 ? color+"33" : "#1e3048"}`, borderRadius:12, overflow:"hidden" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", borderBottom: count > 0 ? `1px solid ${color}22` : "none", cursor: tabId ? "pointer" : "default" }}
        onClick={tabId ? ()=>onNavigate(tabId) : undefined}>
        <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:13 }}>{title}</div>
        {count > 0 ? <span style={{ background:color+"22", color, border:`1px solid ${color}44`, padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:800 }}>{count}</span>
          : <span style={{ color:"#334155", fontSize:11 }}>✓ Clear</span>}
      </div>
      {count > 0 ? <div style={{ padding:"10px 16px", display:"flex", flexDirection:"column", gap:6 }}>{children}</div>
        : <div style={{ padding:"10px 16px", color:"#334155", fontSize:11 }}>{emptyMsg}</div>}
    </div>
  );

  const ItemRow = ({ label, sub, badge, color="#94a3b8", badgeColor="#f59e0b" }) => (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 0", borderBottom:"1px solid #1e3048" }}>
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
          <div style={{ color:"#f1f5f9", fontWeight:900, fontSize:22 }}>{greeting} 👋</div>
          <div style={{ color:"#475569", fontSize:12, marginTop:2 }}>{now.toLocaleDateString("en-US",{ weekday:"long", month:"long", day:"numeric", year:"numeric" })}</div>
          {urgentCount > 0 && <div style={{ color:"#fca5a5", fontSize:12, marginTop:4, fontWeight:600 }}>⚠️ {urgentCount} item{urgentCount!==1?"s":""} need your attention today</div>}
        </div>
        {/* GCI progress */}
        <div style={{ background:"#162032", border:"1px solid #1e3048", borderRadius:12, padding:"14px 20px", minWidth:220 }}>
          <div style={{ color:"#94a3b8", fontSize:10, fontWeight:700, marginBottom:6 }}>GCI GOAL PROGRESS — {now.getFullYear()}</div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ color:"#f59e0b", fontWeight:800, fontSize:18 }}>{fmt(closedYTD)}</span>
            <span style={{ color:"#475569", fontSize:12 }}>of {fmt(gciGoal)}</span>
          </div>
          <div style={{ background:"#0f1e2e", borderRadius:999, height:8, overflow:"hidden" }}>
            <div style={{ width:`${gciProgress}%`, height:"100%", background: gciProgress >= 100 ? "#10b981" : gciProgress >= 75 ? "#f59e0b" : "#3b82f6", borderRadius:999, transition:"width 0.3s" }}/>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
            <span style={{ color:"#475569", fontSize:10 }}>{gciProgress.toFixed(1)}% complete</span>
            <span style={{ color:"#34d399", fontSize:10 }}>Weighted: {fmt(totalWeighted)}</span>
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
          <div key={s.label} style={{ flex:1, minWidth:130, background: s.alert ? "#1a0a0a" : "#162032", border:`1px solid ${s.alert ? "#7f1d1d" : "#1e3048"}`, borderRadius:10, padding:"11px 14px" }}>
            <div style={{ color:s.color, fontWeight:800, fontSize:20 }}>{s.value}</div>
            <div style={{ color:"#94a3b8", fontSize:10, fontWeight:600 }}>{s.label}</div>
            <div style={{ color:"#475569", fontSize:10 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Action sections */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <SectionCard title="📅 Follow-ups Due" count={followUpsDue.length} color="#4ade80" tabId="pipeline" emptyMsg="No follow-ups due today — nice.">
          {followUpsDue.slice(0,5).map(d => (
            <ItemRow key={d.id} label={d.name} sub={`${d.client} · ${d.stage}`} badge={d.isOverdue ? "⚠️ Overdue" : "Due today"} badgeColor={d.isOverdue?"#fca5a5":"#4ade80"}/>
          ))}
          {followUpsDue.length > 5 && <div style={{ color:"#475569", fontSize:10 }}>+{followUpsDue.length-5} more — go to Pipeline tab</div>}
        </SectionCard>

        <SectionCard title="✅ Urgent Tasks" count={urgentTasks.length} color="#fb923c" tabId="tasks" emptyMsg="No urgent tasks — you're on top of it.">
          {urgentTasks.slice(0,5).map(t => (
            <ItemRow key={t.id} label={t.title} sub={`${t.category} · ${t.priority}`} badge={t.dueDate < today ? "⚠️ Overdue" : "Due today"} badgeColor={t.dueDate < today?"#fca5a5":"#fb923c"}/>
          ))}
          {urgentTasks.length > 5 && <div style={{ color:"#475569", fontSize:10 }}>+{urgentTasks.length-5} more — go to Tasks tab</div>}
        </SectionCard>

        <SectionCard title="🧊 Deals Gone Cold" count={goneCold.length} color="#60a5fa" tabId="pipeline" emptyMsg="No deals are stagnating — pipeline is moving.">
          {goneCold.slice(0,5).map(d => (
            <ItemRow key={d.id} label={d.name} sub={`${d.stage} · ${d.client}`} badge={`${d.daysInStage}d in stage`} badgeColor="#60a5fa"/>
          ))}
          {goneCold.length > 5 && <div style={{ color:"#475569", fontSize:10 }}>+{goneCold.length-5} more</div>}
        </SectionCard>

        <SectionCard title="📞 Contact Outreach Queue" count={outreachDue.length} color="#ec4899" tabId="contacts" emptyMsg="All contacts recently touched — great work.">
          {outreachDue.slice(0,5).map(c => {
            const days = c.lastContact ? Math.floor((now - new Date(c.lastContact+"T00:00:00")) / 86400000) : null;
            return <ItemRow key={c.id} label={c.name} sub={`${c.company} · ${c.relationshipLevel}`} badge={days !== null ? `${days}d since contact` : "Never contacted"} badgeColor="#ec4899"/>;
          })}
          {outreachDue.length > 5 && <div style={{ color:"#475569", fontSize:10 }}>+{outreachDue.length-5} more — go to Contacts tab</div>}
        </SectionCard>

        {staleListings.length > 0 && (
          <SectionCard title="🏢 Listings Needing Attention" count={staleListings.length} color="#f97316" tabId="listings" emptyMsg="">
            {staleListings.slice(0,4).map(l => (
              <ItemRow key={l.id} label={l.name} sub={`${l.submarket} · ${l.sqft?.toLocaleString()} SF`} badge="No showings 30d+" badgeColor="#f97316"/>
            ))}
          </SectionCard>
        )}

        {upcomingExpirations.length > 0 && (
          <SectionCard title="📡 Lease Expirations (Next 12mo)" count={upcomingExpirations.length} color="#ec4899" tabId="lease-radar" emptyMsg="">
            {upcomingExpirations.slice(0,4).map(d => {
              const days = Math.floor((new Date(d.leaseExpiresDate + "T00:00:00") - now) / 86400000);
              return <ItemRow key={d.id} label={d.name} sub={`${d.client} · ${d.submarket}`} badge={days < 0 ? "Expired" : days < 90 ? `${days}d left` : `${Math.round(days/30)}mo left`} badgeColor={days < 90 ? "#ef4444" : days < 180 ? "#f59e0b" : "#60a5fa"}/>;
            })}
          </SectionCard>
        )}

        {/* Closing this month detail */}
        {closingThisMonth.length > 0 && (
          <SectionCard title="💰 Closing This Month" count={closingThisMonth.length} color="#f59e0b" tabId="pipeline" emptyMsg="">
            {closingThisMonth.map(d => (
              <ItemRow key={d.id} label={d.name} sub={`${d.stage} · ${d.probability}% probability`} badge={fmt(d.weighted)} badgeColor="#f59e0b"/>
            ))}
          </SectionCard>
        )}
      </div>
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
  const [modal, setModal] = useState(null);
  const [quickAdd, setQuickAdd] = useState(false);
  const [activityDeal, setActivityDeal] = useState(null);
  const [richNotesDeal, setRichNotesDeal] = useState(null);
  const [documentsDeal, setDocumentsDeal] = useState(null);
  const [timelineDeal, setTimelineDeal] = useState(null);
  const [winLossDeal, setWinLossDeal] = useState(null);
  const [filters, setFilters] = useState({ search: "", stages: [], subtypes: [], dealTypes: [], leadSources: [], dateFrom: "", dateTo: "" });
  const [sortKey, setSortKey] = useState("expectedClose");
  const [sortDir, setSortDir] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);

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
    return { month, commission: closedDeals.filter(d => d.expectedClose?.startsWith(ms)).reduce((s, d) => s + d.netCommission, 0), goal: gciGoal / 12 };
  });
  const stageChartData = STAGES.filter(s => s !== "Lost").map(stage => ({
    stage, "Deals": enriched.filter(d => d.stage === stage).length,
    "Value": enriched.filter(d => d.stage === stage).reduce((s, d) => s + d.totalValue, 0),
  }));
  const sourceData = LEAD_SOURCES.map(src => ({
    source: src, deals: enriched.filter(d => d.leadSource === src).length,
    commission: enriched.filter(d => d.leadSource === src && d.stage === "Closed").reduce((s, d) => s + d.netCommission, 0),
  })).filter(s => s.deals > 0).sort((a,b) => b.deals - a.deals);

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
    setDeals(prev => [...prev, d]);
    setQuickAdd(false);
  };
  const saveActivity = (updated) => { setDeals(prev => prev.map(d => d.id === updated.id ? updated : d)); setActivityDeal(updated); };
  const saveRichNotes = (updated) => { setDeals(prev => prev.map(d => d.id === updated.id ? updated : d)); setRichNotesDeal(updated); };
  const saveDocuments = (updated) => { setDeals(prev => prev.map(d => d.id === updated.id ? updated : d)); setDocumentsDeal(updated); };
  const saveWinLoss = (updated) => {
    const existing = deals.find(x => x.id === updated.id);
    const newStage = updated.won ? "Closed" : "Lost";
    const stageHistory = [...(existing?.stageHistory || [{ stage: existing?.stage || "Unknown", enteredDate: today }]),
      { stage: newStage, enteredDate: today, note: updated.won ? "Deal closed/won" : `Lost: ${updated.lossReason||""}` }];
    setDeals(prev => prev.map(d => d.id === updated.id ? { ...updated, stageHistory } : d));
    setWinLossDeal(null);
  };
  const deleteDeal = (id) => { if (window.confirm("Delete this deal?")) setDeals(prev => prev.filter(d => d.id !== id)); };
  const sortBy = (key) => { if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortKey(key); setSortDir("asc"); } };
  const toggleFilter = (key, val) => setFilters(f => ({ ...f, [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val] }));

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
    <br/><button onclick="window.print()" style="background:#f59e0b;border:none;padding:10px 24px;border-radius:8px;font-weight:800;font-size:14px;cursor:pointer;">🖨️ Print / Save as PDF</button>
    </body></html>`);
    win.document.close();
  };

  const exportCSV = () => {
    const h = ["Property","Client","Counterparty","Stage","Deal Type","Rep Type","Subtype","Submarket","Sq Ft","Total Value","$/SF","Comm Rate","Net Commission","Probability","Weighted","Lead Source","Co-Broker","Split%","Follow-up","Close Date","Days in Stage","Won/Lost","Loss Reason","Notes"];
    const r = filtered.map(d => [d.name,d.client,d.counterparty,d.stage,d.dealType,d.repType,d.subtype,d.submarket||"",d.sqft,d.totalValue,(d.pricePerSqft||0).toFixed(2),d.commissionRate+"%",d.netCommission.toFixed(0),d.probability+"%",d.weighted.toFixed(0),d.leadSource,d.coBroker,d.splitPct+"%",d.followUpDate,d.expectedClose,d.daysInStage,d.won===true?"Won":d.won===false?"Lost":"",d.lossReason,d.notes]);
    const csv = [h,...r].map(row=>row.map(c=>`"${c}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv); a.download="industrial-pipeline.csv"; a.click();
  };

  const iStyle = { background: "#0f1e2e", border: "1px solid #1e3048", borderRadius: 8, color: "#f1f5f9", padding: "7px 11px", fontSize: 12, outline: "none", width: "100%", boxSizing: "border-box" };
  const fbtn = (active) => ({ background: active ? "#f59e0b" : "#0f1e2e", color: active ? "#0f1e2e" : "#94a3b8", border: `1px solid ${active ? "#f59e0b" : "#1e3048"}`, padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer" });
  const th = (col) => ({ color: "#64748b", fontSize: 10, fontWeight: 700, textAlign: "left", padding: "9px 10px", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap", background: sortKey === col ? "#1a2d42" : "transparent" });
  const td = { padding: "11px 10px", color: "#cbd5e1", fontSize: 12, borderBottom: "1px solid #1e3048" };

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

  const tabs = [
    { id: "home", label: "Home", icon: "🏠", badge: (followUpsDue.length + urgentTasksCount + goneColdCount + outreachDueCount + criticalLeases) || 0 },
    { id: "pipeline", label: "Pipeline", icon: "📈" },
    { id: "analytics", label: "Analytics", icon: "📊" },
    { id: "listings", label: "Listings", icon: "🏢", badge: listings.filter(l=>l.status==="Active").length },
    { id: "forecast", label: "Forecast", icon: "💰" },
    { id: "timeline", label: "Timeline", icon: "📅" },
    { id: "prospecting", label: "Prospecting", icon: "📬", badge: campaigns.length },
    { id: "comps", label: "Market Comps", icon: "🔍", badge: comps.length },
    { id: "submarkets", label: "Submarkets", icon: "🗺️" },
    { id: "contacts", label: "Contacts", icon: "👥", badge: contacts.length },
    { id: "properties", label: "Properties", icon: "🏭", badge: properties.length },
    { id: "tasks", label: "Tasks", icon: "✅", badge: overdueTasks > 0 ? overdueTasks : pendingTasks },
    { id: "expenses", label: "Expenses", icon: "💸" },
    { id: "intel", label: "Intel", icon: "🧠" },
    { id: "lease-radar", label: "Lease Radar", icon: "📡" },
  ];

  return (
    <div style={{ background: "#0d1826", minHeight: "100vh", fontFamily: "system-ui, sans-serif", color: "#f1f5f9" }}>

      {/* ── Header ── */}
      <div style={{ background: "#0f1e2e", borderBottom: "1px solid #1e3048", padding: "13px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{ background: "#f59e0b", borderRadius: 9, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 11, color: "#0d1826" }}>IND</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#f1f5f9" }}>Industrial Pipeline</div>
            <div style={{ fontSize: 10, color: "#475569" }}>CRE Deal Tracking · {thisYear}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
          {dueTodayDeals.length > 0 && <div style={{ background: "#0f2010", border: "1px solid #16a34a", borderRadius: 7, padding: "5px 11px", fontSize: 11, color: "#4ade80", fontWeight: 700 }}>📅 {dueTodayDeals.length} follow-up{dueTodayDeals.length > 1 ? "s" : ""} due</div>}
          {agingDeals.length > 0 && <div style={{ background: "#2d1515", border: "1px solid #dc2626", borderRadius: 7, padding: "5px 11px", fontSize: 11, color: "#fca5a5", fontWeight: 700 }}>⚠️ {agingDeals.length} gone cold</div>}
          {overdueTasks > 0 && <div onClick={()=>setActiveTab("tasks")} style={{ background: "#2d1a0a", border: "1px solid #c2410c", borderRadius: 7, padding: "5px 11px", fontSize: 11, color: "#fb923c", fontWeight: 700, cursor:"pointer" }}>🔔 {overdueTasks} overdue task{overdueTasks>1?"s":""}</div>}
          {activeTab === "pipeline" && <>
            <button onClick={() => setShowFilters(f => !f)} style={{ background: showFilters ? "#1e3048" : "#162032", border: "1px solid #1e3048", color: "#94a3b8", padding: "6px 13px", borderRadius: 7, cursor: "pointer", fontSize: 11 }}>⚡ Filters</button>
            <button onClick={printReport} style={{ background: "#162032", border: "1px solid #1e3048", color: "#94a3b8", padding: "6px 13px", borderRadius: 7, cursor: "pointer", fontSize: 11 }}>🖨️ PDF</button>
            <button onClick={exportCSV} style={{ background: "#162032", border: "1px solid #1e3048", color: "#94a3b8", padding: "6px 13px", borderRadius: 7, cursor: "pointer", fontSize: 11 }}>↓ CSV</button>
            <button onClick={() => setQuickAdd(true)} style={{ background: "#162032", border: "1px solid #f59e0b", color: "#f59e0b", padding: "6px 13px", borderRadius: 7, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>⚡ Quick Add</button>
            <button onClick={() => setModal("new")} style={{ background: "#f59e0b", border: "none", color: "#0f1e2e", padding: "6px 14px", borderRadius: 7, cursor: "pointer", fontSize: 11, fontWeight: 800 }}>+ Full Deal</button>
          </>}
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div style={{ background: "#0f1e2e", borderBottom: "1px solid #1e3048", padding: "0 22px", display: "flex", gap: 2, overflowX: "auto" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ background: "none", border: "none", borderBottom: activeTab === t.id ? "2px solid #f59e0b" : "2px solid transparent", color: activeTab === t.id ? "#f59e0b" : "#64748b", padding: "11px 16px", fontSize: 12, fontWeight: activeTab === t.id ? 800 : 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
            {t.icon} {t.label}
            {t.badge > 0 && <span style={{ background: activeTab === t.id ? "#f59e0b" : "#1e3048", color: activeTab === t.id ? "#0d1826" : "#64748b", borderRadius: 20, fontSize: 9, padding: "1px 6px", fontWeight: 800 }}>{t.badge}</span>}
          </button>
        ))}
      </div>

      <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── LISTINGS TAB ── */}
        {activeTab === "home" && <HomeBriefing deals={deals} tasks={tasks} contacts={contacts} listings={listings} gciGoal={gciGoal} closedYTD={closedYTD} totalWeighted={totalWeighted} onNavigate={setActiveTab} />}
        {activeTab === "listings" && <ListingsTab listings={listings} setListings={setListings} submarketList={submarketList} />}

        {/* ── FORECAST TAB ── */}
        {activeTab === "forecast" && <ForecastTab deals={deals} />}

        {/* ── PROSPECTING TAB ── */}
        {activeTab === "prospecting" && <ProspectingTab campaigns={campaigns} setCampaigns={setCampaigns} deals={deals} submarketList={submarketList} />}

        {/* ── COMPS TAB ── */}
        {activeTab === "comps" && <MarketCompsTab comps={comps} setComps={setComps} submarketList={submarketList} />}

        {/* ── SUBMARKETS TAB ── */}
        {activeTab === "submarkets" && <SubmarketTab deals={deals} listings={listings} comps={comps} submarketList={submarketList} setSubmarketList={setSubmarketList} />}

        {/* ── CONTACTS TAB ── */}
        {activeTab === "contacts" && <ContactsTab contacts={contacts} setContacts={setContacts} deals={deals} submarketList={submarketList} />}

        {/* ── TASKS TAB ── */}
        {activeTab === "tasks" && <TasksTab tasks={tasks} setTasks={setTasks} deals={deals} />}

        {/* ── EXPENSES TAB ── */}
        {activeTab === "expenses" && <ExpenseTab expenses={expenses} setExpenses={setExpenses} closedYTD={closedYTD} gciGoal={gciGoal} />}

        {/* ── PROPERTIES TAB ── */}
        {activeTab === "properties" && <PropertyDBTab properties={properties} setProperties={setProperties} submarketList={submarketList} contacts={contacts} />}

        {/* ── TIMELINE TAB ── */}
        {activeTab === "timeline" && <TimelineTab deals={deals} />}
        {activeTab === "intel" && <IntelTab deals={deals} expenses={expenses} gciGoal={gciGoal} />}
        {activeTab === "lease-radar" && <LeaseRadarTab deals={deals} contacts={contacts} onNavigate={setActiveTab} />}

        {/* ── PIPELINE + ANALYTICS TABS ── */}
        {(activeTab === "pipeline" || activeTab === "analytics") && <>
          {/* ── Morning Briefing ── */}
          <div style={{ background: "linear-gradient(135deg, #162032 0%, #1a2a40 100%)", borderRadius: 14, padding: "18px 22px", border: "1px solid #1e3048" }}>
            <div style={{ color: "#f59e0b", fontSize: 13, fontWeight: 800, marginBottom: 12 }}>☀️ {greeting} — Here's your day</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {dueTodayDeals.length > 0 ? (
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ color: "#4ade80", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>📅 FOLLOW-UPS DUE</div>
                  {dueTodayDeals.slice(0,3).map(d => (
                    <div key={d.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0f2010", borderRadius: 7, padding: "7px 10px", marginBottom: 5, border: "1px solid #14532d" }}>
                      <div><div style={{ color: "#f1f5f9", fontSize: 12, fontWeight: 600 }}>{d.name}</div><div style={{ color: "#64748b", fontSize: 10 }}>{d.client} {d.isOverdue ? "· ⚠️ Overdue" : ""}</div></div>
                      <button onClick={() => setActivityDeal(d)} style={{ background: "#16a34a", border: "none", color: "#fff", padding: "4px 10px", borderRadius: 5, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Log</button>
                    </div>
                  ))}
                </div>
              ) : <div style={{ flex: 1, minWidth: 200, color: "#475569", fontSize: 12 }}>✅ No follow-ups due today</div>}

              {agingDeals.length > 0 ? (
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ color: "#fca5a5", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>⚠️ GONE COLD</div>
                  {agingDeals.slice(0,3).map(d => (
                    <div key={d.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#1a0f0f", borderRadius: 7, padding: "7px 10px", marginBottom: 5, border: "1px solid #3d1515" }}>
                      <div><div style={{ color: "#f1f5f9", fontSize: 12, fontWeight: 600 }}>{d.name}</div><div style={{ color: "#64748b", fontSize: 10 }}>{d.daysInStage} days in {d.stage}</div></div>
                      <button onClick={() => setModal(d)} style={{ background: "#7f1d1d", border: "none", color: "#fca5a5", padding: "4px 10px", borderRadius: 5, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Edit</button>
                    </div>
                  ))}
                </div>
              ) : <div style={{ flex: 1, minWidth: 200, color: "#475569", fontSize: 12 }}>✅ No deals gone cold</div>}

              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>📊 GOAL PACE</div>
                <div style={{ background: "#0f1e2e", borderRadius: 7, padding: "10px 12px", border: "1px solid #1e3048" }}>
                  <div style={{ color: "#f1f5f9", fontSize: 18, fontWeight: 800 }}>{gciProgress.toFixed(1)}%</div>
                  <div style={{ color: "#64748b", fontSize: 10, marginBottom: 6 }}>{fmt(closedYTD)} of {fmt(gciGoal)}</div>
                  <div style={{ background: "#1e3048", borderRadius: 999, height: 6, overflow: "hidden" }}>
                    <div style={{ width: `${gciProgress}%`, height: "100%", borderRadius: 999, background: gciProgress >= 75 ? "#10b981" : gciProgress >= 40 ? "#f59e0b" : "#3b82f6" }} />
                  </div>
                  <div style={{ color: "#475569", fontSize: 10, marginTop: 5 }}>Month {thisMonth + 1} of 12 · {winRate !== null ? `${winRate}% win rate` : "No closed deals yet"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Stat Cards ── */}
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            <StatCard label="Total Pipeline" sub="Active deal value" value={fmt(totalPipeline)} icon="📈" accent="#3b82f6" />
            <StatCard label="Weighted Pipeline" sub="Prob-adjusted" value={fmt(totalWeighted)} icon="💲" accent="#8b5cf6" />
            <StatCard label="Closed YTD" sub="Net commissions" value={fmt(closedYTD)} icon="✅" accent="#10b981" />
            <StatCard label="SF in Pipeline" sub="Active sqft" value={totalSqft > 0 ? totalSqft.toLocaleString() + " SF" : "0 SF"} icon="📐" accent="#f59e0b" />
            <StatCard label="Win Rate" sub="Closed vs. lost" value={winRate !== null ? winRate + "%" : "—"} icon="🏆" accent="#ec4899" />
            <StatCard label="Follow-ups Due" sub="Today & overdue" value={dueTodayDeals.length} icon="📅" accent="#16a34a" alert={dueTodayDeals.length > 0} />
            <StatCard label="Aging Deals" sub="30+ days stale" value={agingDeals.length} icon="⚠️" accent="#dc2626" alert={agingDeals.length > 0} />
            <StatCard label="Active Listings" sub="Currently marketed" value={listings.filter(l=>l.status==="Active").length} icon="🏢" accent="#10b981" />
          </div>

          {/* ── GCI Goal ── */}
          <div style={{ background: "#162032", borderRadius: 12, padding: "14px 18px", border: "1px solid #1e3048" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div><div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 13 }}>Annual GCI Goal</div><div style={{ color: "#475569", fontSize: 10 }}>Net closed commissions vs. target</div></div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#64748b", fontSize: 11 }}>Goal: $</span>
                <input type="number" value={gciGoal} onChange={e => setGciGoal(parseFloat(e.target.value) || 0)} style={{ background: "#0f1e2e", border: "1px solid #1e3048", borderRadius: 7, color: "#f59e0b", padding: "5px 9px", fontSize: 12, fontWeight: 700, width: 100, outline: "none" }} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, background: "#0f1e2e", borderRadius: 999, height: 9, overflow: "hidden", border: "1px solid #1e3048" }}>
                <div style={{ width: `${gciProgress}%`, height: "100%", borderRadius: 999, background: gciProgress >= 100 ? "#10b981" : gciProgress >= 50 ? "#f59e0b" : "#3b82f6", transition: "width 0.4s ease" }} />
              </div>
              <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 12, minWidth: 100, textAlign: "right" }}>{fmt(closedYTD)} <span style={{ color: "#475569", fontWeight: 400 }}>/ {fmt(gciGoal)}</span></div>
              <div style={{ color: "#f59e0b", fontWeight: 800, minWidth: 40, fontSize: 12 }}>{gciProgress.toFixed(1)}%</div>
            </div>
          </div>

          {activeTab === "analytics" && <>
            {/* ── Charts ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: "#162032", borderRadius: 12, padding: "16px 18px", border: "1px solid #1e3048" }}>
                <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 13, marginBottom: 2 }}>Pipeline by Stage</div>
                <div style={{ color: "#475569", fontSize: 10, marginBottom: 12 }}>Deal count and total value</div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={stageChartData} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e3048" vertical={false} />
                    <XAxis dataKey="stage" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="l" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="r" orientation="right" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000000 ? (v/1000000).toFixed(1)+"M" : v >= 1000 ? (v/1000).toFixed(0)+"k" : v} />
                    <Tooltip contentStyle={{ background: "#0f1e2e", border: "1px solid #1e3048", borderRadius: 8, color: "#f1f5f9", fontSize: 12 }} formatter={(val, name) => name === "Value" ? [fmt(val), name] : [val, name]} />
                    <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 10 }} />
                    <Bar yAxisId="l" dataKey="Deals" fill="#3b82f6" radius={[3,3,0,0]} />
                    <Bar yAxisId="r" dataKey="Value" fill="#f59e0b" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: "#162032", borderRadius: 12, padding: "16px 18px", border: "1px solid #1e3048" }}>
                <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 13, marginBottom: 2 }}>Monthly Commissions</div>
                <div style={{ color: "#475569", fontSize: 10, marginBottom: 12 }}>Closed vs. monthly target ({thisYear})</div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={monthlyData} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e3048" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => "$"+(v>=1000?(v/1000).toFixed(0)+"k":v)} />
                    <Tooltip contentStyle={{ background: "#0f1e2e", border: "1px solid #1e3048", borderRadius: 8, color: "#f1f5f9", fontSize: 12 }} formatter={v => [fmt(v)]} />
                    <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 10 }} />
                    <Bar dataKey="commission" name="Closed" fill="#10b981" radius={[3,3,0,0]} />
                    <Bar dataKey="goal" name="Target" fill="#1e3048" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Lead Source + Win/Loss ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {sourceData.length > 0 && (
                <div style={{ background: "#162032", borderRadius: 12, padding: "16px 18px", border: "1px solid #1e3048" }}>
                  <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 13, marginBottom: 2 }}>Lead Source Performance</div>
                  <div style={{ color: "#475569", fontSize: 10, marginBottom: 12 }}>Which sources drive your business</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {sourceData.map(s => (
                      <div key={s.source} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0f1e2e", borderRadius: 7, padding: "8px 12px", border: "1px solid #1e3048" }}>
                        <div style={{ color: "#f1f5f9", fontSize: 12, fontWeight: 600 }}>{s.source}</div>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <span style={{ color: "#94a3b8", fontSize: 11 }}>{s.deals} deal{s.deals !== 1 ? "s" : ""}</span>
                          {s.commission > 0 && <span style={{ color: "#10b981", fontSize: 11, fontWeight: 700 }}>{fmt(s.commission)}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ background: "#162032", borderRadius: 12, padding: "16px 18px", border: "1px solid #1e3048" }}>
                <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 13, marginBottom: 2 }}>Win / Loss Tracker</div>
                <div style={{ color: "#475569", fontSize: 10, marginBottom: 12 }}>Conversion rate & why deals die</div>
                {closedDeals.length === 0 && lostDeals.length === 0 ? (
                  <div style={{ color: "#475569", fontSize: 12, textAlign: "center", padding: "20px 0" }}>No closed or lost deals yet.<br/>Mark deals won or lost to track your conversion rate.</div>
                ) : (
                  <>
                    <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                      <div style={{ flex: 1, background: "#0f2010", border: "1px solid #14532d", borderRadius: 8, padding: "10px 14px", textAlign: "center" }}>
                        <div style={{ color: "#4ade80", fontSize: 20, fontWeight: 800 }}>{closedDeals.length}</div>
                        <div style={{ color: "#16a34a", fontSize: 10, fontWeight: 700 }}>WON</div>
                      </div>
                      <div style={{ flex: 1, background: "#1a0f0f", border: "1px solid #3d1515", borderRadius: 8, padding: "10px 14px", textAlign: "center" }}>
                        <div style={{ color: "#fca5a5", fontSize: 20, fontWeight: 800 }}>{lostDeals.length}</div>
                        <div style={{ color: "#dc2626", fontSize: 10, fontWeight: 700 }}>LOST</div>
                      </div>
                      <div style={{ flex: 1, background: "#0f1e2e", border: "1px solid #1e3048", borderRadius: 8, padding: "10px 14px", textAlign: "center" }}>
                        <div style={{ color: "#f59e0b", fontSize: 20, fontWeight: 800 }}>{winRate !== null ? winRate + "%" : "—"}</div>
                        <div style={{ color: "#ca8a04", fontSize: 10, fontWeight: 700 }}>WIN RATE</div>
                      </div>
                    </div>
                    {lossBreakdown.length > 0 && (
                      <div>
                        <div style={{ color: "#475569", fontSize: 10, fontWeight: 700, marginBottom: 6 }}>WHY WE LOSE</div>
                        {lossBreakdown.map(l => (
                          <div key={l.reason} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #1e3048" }}>
                            <span style={{ color: "#94a3b8", fontSize: 11 }}>{l.reason}</span>
                            <span style={{ color: "#fca5a5", fontSize: 11, fontWeight: 700 }}>{l.count}x</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </>}

          {/* ── Stage Summary ── */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {STAGES.map(stage => {
              const c = STAGE_COLORS[stage];
              const sd = enriched.filter(d => d.stage === stage);
              const sqft = sd.reduce((s,d) => s + (d.sqft||0), 0);
              return (
                <div key={stage} style={{ flex: 1, minWidth: 100, background: "#162032", border: "1px solid #1e3048", borderRadius: 10, padding: "10px 13px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.text }} />
                    <span style={{ color: "#94a3b8", fontSize: 10, fontWeight: 600 }}>{stage}</span>
                  </div>
                  <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 17 }}>{sd.length}</div>
                  <div style={{ color: "#475569", fontSize: 10, marginTop: 1 }}>{fmt(sd.reduce((s,d)=>s+d.totalValue,0))}</div>
                  {sqft > 0 && <div style={{ color: "#334155", fontSize: 10 }}>{sqft.toLocaleString()} SF</div>}
                </div>
              );
            })}
          </div>

          {/* ── Filters ── */}
          {showFilters && activeTab === "pipeline" && (
            <div style={{ background: "#162032", borderRadius: 12, padding: "14px 18px", border: "1px solid #1e3048" }}>
              <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 13, marginBottom: 12 }}>Filters</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div><label style={{ color: "#64748b", fontSize: 10, fontWeight: 600, display: "block", marginBottom: 3 }}>Search</label><input placeholder="Property, client, source..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} style={iStyle} /></div>
                <div><label style={{ color: "#64748b", fontSize: 10, fontWeight: 600, display: "block", marginBottom: 3 }}>Close From</label><input type="date" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} style={iStyle} /></div>
                <div><label style={{ color: "#64748b", fontSize: 10, fontWeight: 600, display: "block", marginBottom: 3 }}>Close To</label><input type="date" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} style={iStyle} /></div>
              </div>
              <div style={{ marginBottom: 7 }}><label style={{ color: "#64748b", fontSize: 10, fontWeight: 600, display: "block", marginBottom: 4 }}>Stages</label><div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{STAGES.map(s => <button key={s} onClick={() => toggleFilter("stages", s)} style={fbtn(filters.stages.includes(s))}>{s}</button>)}</div></div>
              <div style={{ marginBottom: 7 }}><label style={{ color: "#64748b", fontSize: 10, fontWeight: 600, display: "block", marginBottom: 4 }}>Subtypes</label><div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{INDUSTRIAL_SUBTYPES.map(s => <button key={s} onClick={() => toggleFilter("subtypes", s)} style={fbtn(filters.subtypes.includes(s))}>{s}</button>)}</div></div>
              <div style={{ marginBottom: 7 }}><label style={{ color: "#64748b", fontSize: 10, fontWeight: 600, display: "block", marginBottom: 4 }}>Deal Type</label><div style={{ display: "flex", gap: 5 }}>{DEAL_TYPES.map(t => <button key={t} onClick={() => toggleFilter("dealTypes", t)} style={fbtn(filters.dealTypes.includes(t))}>{t}</button>)}</div></div>
              <div><label style={{ color: "#64748b", fontSize: 10, fontWeight: 600, display: "block", marginBottom: 4 }}>Lead Sources</label><div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{LEAD_SOURCES.map(s => <button key={s} onClick={() => toggleFilter("leadSources", s)} style={fbtn(filters.leadSources.includes(s))}>{s}</button>)}</div></div>
            </div>
          )}

          {/* ── Deal Table (pipeline only) ── */}
          {activeTab === "pipeline" && (
            <div style={{ background: "#162032", borderRadius: 12, border: "1px solid #1e3048", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1200 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #1e3048" }}>
                    {[["stage","Stage"],["name","Property"],["client","Client"],["counterparty","Counterparty"],["dealType","Type"],["repType","Rep"],["subtype","Subtype"],["submarket","Submarket"],["sqft","Sq Ft"],["totalValue","Value"],["pricePerSqft","$/SF"],["netCommission","Net Comm"],["probability","Prob"],["weighted","Weighted"],["leadSource","Source"],["followUpDate","Follow-up"],["expectedClose","Close"],["daysInStage","Days"]].map(([key, label]) => (
                      <th key={key} style={th(key)} onClick={() => sortBy(key)}>{label}{sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}</th>
                    ))}
                    <th style={{ ...th(""), cursor: "default" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(d => (
                    <tr key={d.id}
                      style={{ borderBottom: "1px solid #1e3048", background: d.stage === "Lost" ? "rgba(127,29,29,0.08)" : d.isAging ? "rgba(127,29,29,0.12)" : d.isDueToday ? "rgba(22,163,74,0.06)" : "transparent" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#1a2d42"}
                      onMouseLeave={e => e.currentTarget.style.background = d.stage === "Lost" ? "rgba(127,29,29,0.08)" : d.isAging ? "rgba(127,29,29,0.12)" : d.isDueToday ? "rgba(22,163,74,0.06)" : "transparent"}>
                      <td style={td}><StageBadge stage={d.stage} /></td>
                      <td style={{ ...td, color: "#f1f5f9", fontWeight: 600, maxWidth: 180 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 12 }}>{d.name || "—"}</span>
                          {d.activities?.length > 0 && <span style={{ background: "#1e3048", color: "#64748b", fontSize: 9, padding: "1px 5px", borderRadius: 8, fontWeight: 600 }}>{d.activities.length}</span>}
                          {(d.richNotes||[]).length > 0 && <span style={{ background: "#1e2a40", color: "#60a5fa", fontSize: 9, padding: "1px 5px", borderRadius: 8, fontWeight: 600 }}>📎{d.richNotes.length}</span>}
                          {(d.documents||[]).length > 0 && <span style={{ background: "#1a2a1a", color: "#4ade80", fontSize: 9, padding: "1px 5px", borderRadius: 8, fontWeight: 600 }}>📁{d.documents.length}</span>}
                          {d.health && <span style={{ background: d.health.color + "22", color: d.health.color, border: `1px solid ${d.health.color}44`, fontSize: 9, padding: "1px 6px", borderRadius: 8, fontWeight: 700 }}>{d.health.score}</span>}
                          {d.isSplit && <span style={{ background: "#312e81", color: "#a5b4fc", fontSize: 9, padding: "1px 5px", borderRadius: 8, fontWeight: 600 }}>split</span>}
                        </div>
                        {(d.tags||[]).length > 0 && (
                          <div style={{ display:"flex", gap:3, flexWrap:"wrap", marginTop:3 }}>
                            {(d.tags||[]).slice(0,3).map(tag=><span key={tag} style={{ background:"#1e3a5f", color:"#93c5fd", fontSize:8, padding:"1px 5px", borderRadius:20, fontWeight:600 }}>{tag}</span>)}
                            {(d.tags||[]).length > 3 && <span style={{ color:"#334155", fontSize:8 }}>+{d.tags.length-3}</span>}
                          </div>
                        )}
                      </td>
                      <td style={td}>{d.client || "—"}</td>
                      <td style={{ ...td, color: "#94a3b8" }}>{d.counterparty || "—"}</td>
                      <td style={td}><span style={{ background: d.dealType === "Sale" ? "#1e3a5f" : "#1a2a1a", color: d.dealType === "Sale" ? "#60a5fa" : "#4ade80", padding: "1px 7px", borderRadius: 10, fontSize: 10, fontWeight: 700 }}>{d.dealType}</span></td>
                      <td style={{ ...td, color: "#64748b", fontSize: 10 }}>{d.repType?.replace(" Rep","") || "—"}</td>
                      <td style={{ ...td, color: "#94a3b8", fontSize: 11 }}>{d.subtype || "—"}</td>
                      <td style={{ ...td, color: "#64748b", fontSize: 11 }}>{d.submarket || "—"}</td>
                      <td style={td}>{d.sqft > 0 ? d.sqft.toLocaleString() : "—"}</td>
                      <td style={td}>{d.totalValue > 0 ? fmt(d.totalValue) : "—"}</td>
                      <td style={{ ...td, color: "#64748b", fontSize: 11 }}>{d.pricePerSqft > 0 ? "$" + d.pricePerSqft.toFixed(2) : "—"}</td>
                      <td style={{ ...td, color: "#f59e0b", fontWeight: 700 }}>
                        {fmt(d.netCommission)}
                        {d.isSplit && <div style={{ color: "#475569", fontSize: 9 }}>{d.splitPct}% split</div>}
                      </td>
                      <td style={td}>{pct(d.probability)}</td>
                      <td style={{ ...td, color: "#34d399", fontWeight: 600 }}>{fmt(d.weighted)}</td>
                      <td style={{ ...td, color: "#64748b", fontSize: 10 }}>{d.leadSource || "—"}</td>
                      <td style={td}>
                        {d.followUpDate ? <span style={{ color: d.isOverdue ? "#fca5a5" : d.isDueToday ? "#4ade80" : "#64748b", fontSize: 11, fontWeight: d.isDueToday || d.isOverdue ? 700 : 400 }}>{d.isOverdue ? "⚠️ " : d.isDueToday ? "📅 " : ""}{new Date(d.followUpDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span> : <span style={{ color: "#334155" }}>—</span>}
                      </td>
                      <td style={td}>{d.expectedClose ? new Date(d.expectedClose + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</td>
                      <td style={td}><span style={{ background: d.daysInStage > 30 && d.stage !== "Closed" && d.stage !== "Lost" ? "#7f1d1d" : "#0f2010", color: d.daysInStage > 30 && d.stage !== "Closed" && d.stage !== "Lost" ? "#fca5a5" : "#4ade80", padding: "1px 6px", borderRadius: 9, fontSize: 10, fontWeight: 700 }}>{d.daysInStage}d</span></td>
                      <td style={td}>
                        <div style={{ display: "flex", gap: 2 }}>
                          {d.stage !== "Closed" && d.stage !== "Lost" && <button onClick={() => setWinLossDeal(d)} title="Close Out" style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 13 }}>🏆</button>}
                          <button onClick={() => setRichNotesDeal(d)} title="Rich Notes" style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 13 }}>📎</button>
                          <button onClick={() => setDocumentsDeal(d)} title="Documents" style={{ background: "none", border: "none", color: (d.documents||[]).length > 0 ? "#4ade80" : "#64748b", cursor: "pointer", fontSize: 13 }}>📁</button>
                          <button onClick={() => setActivityDeal(d)} title="Activity Log" style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 13 }}>📋</button>
                          <button onClick={() => setTimelineDeal(d)} title="Deal Timeline" style={{ background: "none", border: "none", color: "#8b5cf6", cursor: "pointer", fontSize: 13 }}>🕐</button>
                          <button onClick={() => setModal(d)} title="Edit" style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 13 }}>✏️</button>
                          <button onClick={() => deleteDeal(d.id)} title="Delete" style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 13 }}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: "2px solid #1e3048", background: "#0f1e2e" }}>
                    <td colSpan={8} style={{ padding: "10px", color: "#475569", fontSize: 11 }}>Showing {filtered.length} deal{filtered.length !== 1 ? "s" : ""} · {filtered.reduce((s,d)=>s+(d.sqft||0),0).toLocaleString()} SF</td>
                    <td style={{ padding: "10px", color: "#f1f5f9", fontWeight: 800 }}>{filtered.reduce((s,d)=>s+(d.sqft||0),0).toLocaleString()}</td>
                    <td style={{ padding: "10px", color: "#f1f5f9", fontWeight: 800 }}>{fmt(filtered.reduce((s,d)=>s+d.totalValue,0))}</td>
                    <td />
                    <td style={{ padding: "10px", color: "#f59e0b", fontWeight: 800 }}>{fmt(filtered.reduce((s,d)=>s+d.netCommission,0))}</td>
                    <td />
                    <td style={{ padding: "10px", color: "#34d399", fontWeight: 800 }}>{fmt(filtered.reduce((s,d)=>s+d.weighted,0))}</td>
                    <td colSpan={5} style={{ padding: "10px", color: "#f1f5f9", fontWeight: 800, textAlign: "right", fontSize: 12 }}>Total Pipeline: {fmt(filtered.reduce((s,d)=>s+d.totalValue,0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </>}
      </div>

      {quickAdd && <QuickAdd onSave={saveQuickAdd} onClose={() => setQuickAdd(false)} />}
      {modal && <DealModal deal={modal === "new" ? null : modal} onSave={saveModal} onClose={() => setModal(null)} submarketList={submarketList} />}
      {activityDeal && <ActivityLog deal={activityDeal} onClose={() => setActivityDeal(null)} onSave={saveActivity} />}
      {richNotesDeal && <RichNotesModal deal={richNotesDeal} onClose={() => setRichNotesDeal(null)} onSave={saveRichNotes} />}
      {documentsDeal && <DocumentsModal deal={documentsDeal} onClose={() => setDocumentsDeal(null)} onSave={saveDocuments} />}
      {timelineDeal && <DealTimelineModal deal={timelineDeal} onClose={() => setTimelineDeal(null)} />}
      {winLossDeal && <WinLossModal deal={winLossDeal} onSave={saveWinLoss} onClose={() => setWinLossDeal(null)} />}
    </div>
  );
}
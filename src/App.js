import { useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { C, fmt } from "./lib/theme";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import LoginScreen from "./components/LoginScreen";
import { useOrders, useCustomers, useInventory, useStaff, useTodayAttendance } from "./lib/hooks";

const STAGES = ["new_order", "production", "qc_check", "ready", "delivered"];
const STAGE_LABEL = { new_order: "New Orders", production: "In Production", qc_check: "QC Check", ready: "Ready", delivered: "Delivered" };
const STAGE_COLOR = { new_order: C.blue, production: C.purple, qc_check: C.orange, ready: C.green, delivered: C.muted };

// ── Shared UI ──────────────────────────────────────────────────────
const pill = (label, color) => (
  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: color + "22", color, border: `1px solid ${color}44`, fontWeight: 600, letterSpacing: 0.5 }}>
    {label}
  </span>
);

const Card = ({ children, style = {} }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, ...style }}>{children}</div>
);

const StatCard = ({ label, value, sub, color = C.gold, icon }) => (
  <Card style={{ flex: 1, minWidth: 140 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 700, color, fontFamily: "Georgia,serif" }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{sub}</div>}
      </div>
      {icon && <div style={{ fontSize: 22 }}>{icon}</div>}
    </div>
  </Card>
);

const SectionHeader = ({ icon, title, sub }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text, fontFamily: "Georgia,serif" }}>{title}</h2>
        {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  </div>
);

const Loading = ({ label = "Loading…" }) => (
  <div style={{ padding: "40px 0", textAlign: "center", color: C.muted, fontSize: 13 }}>{label}</div>
);

const ErrorBanner = ({ error }) => !error ? null : (
  <div style={{ background: "#7c1d1d22", border: `1px solid ${C.red}44`, borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 12, color: C.red }}>
    {error.message || "Something went wrong talking to the database."}
  </div>
);

// ── Pages ──────────────────────────────────────────────────────────

function Dashboard({ orders, ordersLoading, customers, staff }) {
  const active = orders.filter(o => o.stage !== "delivered").length;
  const inProd = orders.filter(o => o.stage === "production").length;
  const overdue = orders.filter(o => o.days > 7 && o.stage !== "delivered").length;
  const ready = orders.filter(o => o.stage === "ready").length;
  const revenue = orders.reduce((s, o) => s + o.amount, 0);
  const activeTailors = staff.filter(s => s.role === "Tailor" && s.status === "present").length;

  // Revenue by week, computed from real order dates instead of canned demo data.
  const byWeek = {};
  orders.forEach(o => {
    const d = new Date(Date.now() - o.days * 86400000);
    const wk = `${d.getMonth() + 1}/${Math.ceil(d.getDate() / 7)}`;
    byWeek[wk] = (byWeek[wk] || 0) + o.amount;
  });
  const revenueTrend = Object.entries(byWeek).map(([date, rev]) => ({ date, rev }));

  if (ordersLoading) return <Loading />;

  return (
    <div>
      <div style={{ background: "linear-gradient(135deg,#1a1060 0%,#0e0f40 60%,#0e0f11 100%)", borderRadius: 16, padding: "24px 20px", marginBottom: 20, border: `1px solid #2a2860` }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: C.gold, textTransform: "uppercase", marginBottom: 6 }}>Fashion Suite · Live Overview</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4, fontFamily: "Georgia,serif" }}>Rhobes Production Centre</div>
        <div style={{ fontSize: 13, color: "#aaa", marginBottom: 20 }}>Real-time order pipeline · {active} active orders</div>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
          {[["Active Orders", active, "#fff"], ["In Production", inProd, "#fff"], ["Overdue", overdue, C.red], ["Ready", ready, C.green]].map(([l, v, c]) => (
            <div key={l}>
              <div style={{ fontSize: 28, fontWeight: 800, color: c, fontFamily: "Georgia,serif" }}>{v}</div>
              <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <StatCard label="Total Orders" value={orders.length} sub="All statuses" icon="✂️" color={C.purple} />
        <StatCard label="Revenue (Period)" value={fmt(revenue)} sub="Fashion orders" icon="💰" color={C.green} />
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <StatCard label="Total Customers" value={customers.length} sub="In CRM" icon="👥" color={C.blue} />
        <StatCard label="Active Tailors" value={activeTailors} sub="On workload" icon="🧵" color={C.orange} />
      </div>

      {revenueTrend.length > 0 && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 16 }}>Revenue Trend</div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={revenueTrend}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={v => fmt(v)} contentStyle={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="rev" stroke={C.gold} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Production Board — Today</div>
        </div>
        <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
          {["new_order", "production", "ready"].map(stage => (
            <div key={stage} style={{ minWidth: 160, flex: 1 }}>
              <div style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: STAGE_COLOR[stage], marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: STAGE_COLOR[stage], display: "inline-block" }} />
                {STAGE_LABEL[stage]}
                <span style={{ background: STAGE_COLOR[stage] + "22", color: STAGE_COLOR[stage], borderRadius: 20, padding: "0 6px", fontSize: 10 }}>
                  {orders.filter(o => o.stage === stage).length}
                </span>
              </div>
              {orders.filter(o => o.stage === stage).map(o => (
                <div key={o.dbId} style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10, marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{o.client}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{o.garment}</div>
                  <div style={{ fontSize: 11, color: o.tailor ? C.muted : "#f87171", marginTop: 4 }}>{o.tailor || "Unassigned"}</div>
                  <div style={{ fontSize: 10, color: o.days > 7 ? C.red : C.muted, marginTop: 4, textAlign: "right" }}>{o.days}d</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Orders({ orders, loading, error, addOrder, advanceStage, staff, assignTailor }) {
  const tailors = staff.filter(s => s.role === "Tailor");
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newOrder, setNewOrder] = useState({ client: "", garment: "", amount: "" });

  const filtered = filter === "all" ? orders : orders.filter(o => o.stage === filter);

  const submitOrder = async () => {
    if (!newOrder.client || !newOrder.garment) return;
    setSaving(true);
    try {
      await addOrder(newOrder);
      setNewOrder({ client: "", garment: "", amount: "" });
      setShowAdd(false);
    } catch (e) {
      alert("Couldn't save that order: " + e.message);
    }
    setSaving(false);
  };

  const advance = async (o) => {
    const idx = STAGES.indexOf(o.stage);
    const next = STAGES[Math.min(idx + 1, STAGES.length - 1)];
    try { await advanceStage(o.dbId, next); }
    catch (e) { alert("Couldn't update that order: " + e.message); }
  };

  const handleAssign = async (o, tailorId) => {
    try { await assignTailor(o.dbId, tailorId || null); }
    catch (e) { alert("Couldn't assign a tailor: " + e.message); }
  };

  return (
    <div>
      <SectionHeader icon="✂️" title="Orders" sub="All fashion orders" />
      <ErrorBanner error={error} />

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["all", ...STAGES].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${filter === s ? C.gold : C.border}`,
              background: filter === s ? C.goldBg : "transparent", color: filter === s ? C.gold : C.muted, fontSize: 12, cursor: "pointer" }}>
            {s === "all" ? "All" : STAGE_LABEL[s]}
          </button>
        ))}
        <button onClick={() => setShowAdd(true)}
          style={{ marginLeft: "auto", padding: "6px 16px", borderRadius: 20, border: "none",
            background: C.gold, color: "#000", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>
          + New Order
        </button>
      </div>

      {showAdd && (
        <Card style={{ marginBottom: 16, border: `1px solid ${C.gold}44` }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 12 }}>New Order</div>
          {[["Client name", "client"], ["Garment type", "garment"], ["Amount (₦)", "amount"]].map(([ph, k]) => (
            <input key={k} placeholder={ph} value={newOrder[k]}
              onChange={e => setNewOrder({ ...newOrder, [k]: e.target.value })}
              style={{ display: "block", width: "100%", marginBottom: 8, padding: "8px 12px", borderRadius: 8,
                border: `1px solid ${C.border}`, background: C.surfaceAlt, color: C.text, fontSize: 13, boxSizing: "border-box" }} />
          ))}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={submitOrder} disabled={saving} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: C.gold, color: "#000", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>
              {saving ? "Saving…" : "Add"}
            </button>
            <button onClick={() => setShowAdd(false)} style={{ padding: "8px 20px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 13, cursor: "pointer" }}>Cancel</button>
          </div>
        </Card>
      )}

      {loading ? <Loading /> : filtered.length === 0 ? (
        <div style={{ padding: "30px 0", textAlign: "center", color: C.muted, fontSize: 13 }}>No orders yet — add the first one above.</div>
      ) : filtered.map(o => (
        <Card key={o.dbId} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{o.client}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{o.garment} · {o.id}</div>
              <select value={o.tailorId || ""} onChange={e => handleAssign(o, e.target.value)}
                style={{ marginTop: 6, fontSize: 11, padding: "4px 8px", borderRadius: 6,
                  border: `1px solid ${C.border}`, background: C.surfaceAlt,
                  color: o.tailor ? C.muted : C.red, cursor: "pointer" }}>
                <option value="">⚠ Unassigned</option>
                {tailors.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div style={{ textAlign: "right" }}>
              {pill(STAGE_LABEL[o.stage], STAGE_COLOR[o.stage])}
              <div style={{ fontSize: 13, color: C.gold, fontWeight: 700, marginTop: 6 }}>{fmt(o.amount)}</div>
              <div style={{ fontSize: 11, color: o.days > 7 ? C.red : C.muted, marginTop: 2 }}>{o.days}d elapsed</div>
            </div>
          </div>
          {o.stage !== "delivered" && (
            <button onClick={() => advance(o)}
              style={{ marginTop: 10, padding: "5px 14px", borderRadius: 8, border: `1px solid ${C.gold}44`,
                background: C.goldBg, color: C.gold, fontSize: 11, cursor: "pointer" }}>
              Advance Stage →
            </button>
          )}
        </Card>
      ))}
    </div>
  );
}

function ProductionBoard({ orders, loading }) {
  if (loading) return <Loading />;
  return (
    <div>
      <SectionHeader icon="⚙️" title="Production Board" sub="Kanban view by stage" />
      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
        {STAGES.map(stage => (
          <div key={stage} style={{ minWidth: 180, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: STAGE_COLOR[stage], display: "inline-block" }} />
              <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: STAGE_COLOR[stage], fontWeight: 700 }}>{STAGE_LABEL[stage]}</span>
              <span style={{ background: STAGE_COLOR[stage] + "22", color: STAGE_COLOR[stage], borderRadius: 20, padding: "1px 7px", fontSize: 10, marginLeft: "auto" }}>
                {orders.filter(o => o.stage === stage).length}
              </span>
            </div>
            {orders.filter(o => o.stage === stage).map(o => (
              <Card key={o.dbId} style={{ marginBottom: 8, borderLeft: `3px solid ${STAGE_COLOR[stage]}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{o.client}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{o.garment}</div>
                <div style={{ fontSize: 11, marginTop: 6, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: o.tailor ? C.muted : C.red }}>{o.tailor || "Unassigned"}</span>
                  <span style={{ color: o.days > 7 ? C.red : C.muted }}>{o.days}d</span>
                </div>
              </Card>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Inventory({ inventory, loading, error, addItem }) {
  const [cat, setCat] = useState("All Categories");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ sku: "", name: "", category: "Fabrics", qty: "", unit: "yards", minQty: "", cost: "", vendor: "" });
  const cats = ["All Categories", "Fabrics", "Lining", "Accessories", "Hardware", "Ready-to-Wear"];
  const lowStock = inventory.filter(i => i.qty <= i.minQty);
  const filtered = inventory
    .filter(i => cat === "All Categories" || i.category === cat)
    .filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase()));

  const submit = async () => {
    if (!form.sku || !form.name) return;
    setSaving(true);
    try { await addItem(form); setShowAdd(false); setForm({ sku: "", name: "", category: "Fabrics", qty: "", unit: "yards", minQty: "", cost: "", vendor: "" }); }
    catch (e) { alert("Couldn't save that item: " + e.message); }
    setSaving(false);
  };

  return (
    <div>
      <SectionHeader icon="📦" title="Materials & Inventory" sub="Fabrics, trimmings and ready-to-wear stock" />
      <ErrorBanner error={error} />

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button onClick={() => setShowAdd(true)} style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: C.gold, color: "#000", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>+ Add Material</button>
      </div>

      {showAdd && (
        <Card style={{ marginBottom: 16, border: `1px solid ${C.gold}44` }}>
          {[["SKU", "sku"], ["Name", "name"], ["Qty", "qty"], ["Unit", "unit"], ["Min Qty", "minQty"], ["Cost (₦)", "cost"], ["Vendor", "vendor"]].map(([ph, k]) => (
            <input key={k} placeholder={ph} value={form[k]}
              onChange={e => setForm({ ...form, [k]: e.target.value })}
              style={{ display: "block", width: "100%", marginBottom: 8, padding: "8px 12px", borderRadius: 8,
                border: `1px solid ${C.border}`, background: C.surfaceAlt, color: C.text, fontSize: 13, boxSizing: "border-box" }} />
          ))}
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
            style={{ display: "block", width: "100%", marginBottom: 8, padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surfaceAlt, color: C.text, fontSize: 13 }}>
            {cats.slice(1).map(c => <option key={c}>{c}</option>)}
          </select>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={submit} disabled={saving} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: C.gold, color: "#000", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>
              {saving ? "Saving…" : "Add"}
            </button>
            <button onClick={() => setShowAdd(false)} style={{ padding: "8px 20px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 13, cursor: "pointer" }}>Cancel</button>
          </div>
        </Card>
      )}

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <StatCard label="Raw Materials" value={inventory.length} icon="✂️" color={C.gold} />
        <StatCard label="Low Stock" value={lowStock.length} icon="⚠️" color={C.orange} />
      </div>

      {lowStock.length > 0 && (
        <div style={{ background: "#7c3d0011", border: `1px solid ${C.orange}44`, borderRadius: 10, padding: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: C.orange, fontWeight: 600, marginBottom: 4 }}>⚠ {lowStock.length} items running low or out of stock</div>
          <div style={{ fontSize: 12, color: C.muted }}>{lowStock.map(i => i.name).join(" · ")}</div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input placeholder="Search name, SKU..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surfaceAlt, color: C.text, fontSize: 13 }} />
        <select value={cat} onChange={e => setCat(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.gold}`, background: C.surfaceAlt, color: C.text, fontSize: 13 }}>
          {cats.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {loading ? <Loading /> : (
        <>
          <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, padding: "4px 0 8px", borderBottom: `1px solid ${C.border}`, marginBottom: 8, display: "flex", gap: 8 }}>
            <span style={{ flex: 1 }}>Material</span><span style={{ width: 60, textAlign: "right" }}>Qty</span><span style={{ width: 80, textAlign: "right" }}>Value</span>
          </div>
          {filtered.map(item => {
            const isLow = item.qty <= item.minQty;
            return (
              <div key={item.dbId} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0", borderBottom: `1px solid ${C.border}22` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: isLow ? C.orange : C.text, fontWeight: 500 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                    {item.id} · <span style={{ background: C.surfaceAlt, padding: "1px 6px", borderRadius: 4 }}>{item.category}</span>
                  </div>
                </div>
                <div style={{ width: 60, textAlign: "right", fontSize: 13, color: isLow ? C.orange : C.text, fontWeight: 600 }}>
                  {item.qty} <span style={{ fontSize: 10, color: C.muted }}>{item.unit}</span>
                </div>
                <div style={{ width: 80, textAlign: "right", fontSize: 12, color: C.muted }}>{fmt(item.qty * item.cost)}</div>
              </div>
            );
          })}
          <div style={{ padding: "12px 0", borderTop: `1px solid ${C.border}`, marginTop: 8, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: C.muted }}>Total Inventory Value</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.gold }}>{fmt(inventory.reduce((s, i) => s + i.qty * i.cost, 0))}</span>
          </div>
        </>
      )}
    </div>
  );
}

function CRM({ customers, loading, error }) {
  const [tab, setTab] = useState("customers");
  const tiers = { VIP: C.gold, Premium: C.purple, Regular: C.blue };

  return (
    <div>
      <SectionHeader icon="👥" title="CRM Overview" sub="Manage customer relationships, loyalty, and analytics" />
      <ErrorBanner error={error} />

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <StatCard label="Total Customers" value={customers.length} icon="👥" color={C.blue} />
        <StatCard label="VIP & Premium" value={customers.filter(c => c.tier !== "Regular").length} icon="👑" color={C.gold} />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[["customers", "Customers"], ["analytics", "Analytics"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{ padding: "7px 16px", borderRadius: 8, border: `1px solid ${tab === k ? C.gold : C.border}`,
              background: tab === k ? C.goldBg : "transparent", color: tab === k ? C.gold : C.muted, fontSize: 12, cursor: "pointer" }}>
            {l}
          </button>
        ))}
      </div>

      {loading ? <Loading /> : tab === "customers" && customers.map(c => (
        <Card key={c.id} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.goldBg, border: `1px solid ${C.gold}44`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: C.gold, flexShrink: 0 }}>
                {c.name.split(" ").pop()[0]}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{c.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{c.email || "—"}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{c.phone || "—"}</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              {pill(c.tier, tiers[c.tier])}
              <div style={{ fontSize: 13, color: C.gold, fontWeight: 700, marginTop: 6 }}>{fmt(c.spent)}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{c.orders} orders</div>
            </div>
          </div>
        </Card>
      ))}

      {!loading && tab === "analytics" && (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 14 }}>Revenue by Customer Tier</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={[
                { tier: "VIP", rev: customers.filter(c => c.tier === "VIP").reduce((s, c) => s + c.spent, 0) },
                { tier: "Premium", rev: customers.filter(c => c.tier === "Premium").reduce((s, c) => s + c.spent, 0) },
                { tier: "Regular", rev: customers.filter(c => c.tier === "Regular").reduce((s, c) => s + c.spent, 0) },
              ]}>
                <XAxis dataKey="tier" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={v => fmt(v)} contentStyle={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="rev" fill={C.gold} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>Top by Spend</div>
          {[...customers].sort((a, b) => b.spent - a.spent).slice(0, 3).map((c, i) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${C.border}22` }}>
              <span style={{ fontSize: 16 }}>{"🥇🥈🥉"[i]}</span>
              <span style={{ flex: 1, fontSize: 13, color: C.text }}>{c.name}</span>
              <span style={{ fontSize: 13, color: C.gold, fontWeight: 700 }}>{fmt(c.spent)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Accounting({ orders, loading }) {
  const revenue = orders.reduce((s, o) => s + o.amount, 0);
  // Expenses/accounting are still a placeholder — real tax-compliant
  // bookkeeping (invoices, VAT, reconciled expenses) is Phase 7.
  const expenses = 0;
  const profit = revenue - expenses;

  if (loading) return <Loading />;
  return (
    <div>
      <SectionHeader icon="💰" title="Accounting & Finance" sub="Revenue is live; full bookkeeping lands in Phase 7" />
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <StatCard label="Total Revenue" value={fmt(revenue)} sub="From real orders" color={C.green} />
        <StatCard label="Outstanding" value={fmt(orders.filter(o => o.stage !== "delivered").reduce((s, o) => s + o.amount * 0.5, 0))} sub="Est. pending balance" color={C.orange} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>Recent Orders</div>
      {orders.slice(0, 5).map(o => (
        <div key={o.dbId} style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}22`, gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: C.text }}>{o.client}</div>
            <div style={{ fontSize: 11, color: C.muted }}>{o.garment}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.gold }}>{fmt(o.amount)}</div>
            {pill(o.stage === "delivered" ? "Paid" : "Pending", o.stage === "delivered" ? C.green : C.orange)}
          </div>
        </div>
      ))}
    </div>
  );
}

function Payroll({ staff, loading }) {
  const tailorsAndStaff = staff.filter(s => s.salary || s.pieceRate);
  const grossSalaried = staff.reduce((s, st) => s + (st.salary || 0), 0);

  if (loading) return <Loading />;
  return (
    <div>
      <SectionHeader icon="💵" title="Payroll Management" sub="Staff list is live from the database" />
      <div style={{ background: C.goldBg, border: `1px solid ${C.gold}44`, borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 12, color: C.gold }}>
        Deduction figures below are a rough placeholder. The real NTA 2025-compliant
        engine — piece-rate + salary in one run, correct PAYE bands, pension, NHF —
        is Phase 5 of the build.
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <StatCard label="Total Staff" value={staff.length} icon="👤" color={C.blue} />
        <StatCard label="Salaried Gross" value={fmt(grossSalaried)} icon="💰" color={C.green} />
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>Staff</div>
      {tailorsAndStaff.map(s => (
        <Card key={s.id} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{s.name}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{s.role}{s.pieceRate ? ` · ${fmt(s.pieceRate)}/piece` : ""}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.gold }}>{s.salary ? fmt(s.salary) : "—"}</div>
              {s.salary && <div style={{ fontSize: 11, color: C.muted }}>/ month</div>}
            </div>
          </div>
        </Card>
      ))}
      {tailorsAndStaff.length === 0 && <div style={{ padding: "20px 0", textAlign: "center", color: C.muted, fontSize: 13 }}>No staff with pay set up yet — add pay_type/salary/piece_rate on their profile.</div>}
    </div>
  );
}

function Attendance({ staff, loading, attendanceRows, clockIn }) {
  const present = staff.filter(s => s.status === "present").length;
  const absent = staff.filter(s => s.status === "absent").length;

  if (loading) return <Loading />;
  return (
    <div>
      <SectionHeader icon="🕐" title="Attendance Management" sub="Track staff attendance" />
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <StatCard label="Total Staff" value={staff.length} icon="👥" color={C.blue} />
        <StatCard label="Present Today" value={present} icon="✅" color={C.green} />
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <StatCard label="Absent Today" value={absent} icon="❌" color={C.red} />
      </div>

      {staff.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 14 }}>Staff Status</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={[{ name: "Present", value: present }, { name: "Absent", value: absent }]}
                dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3}>
                <Cell fill={C.green} /><Cell fill={C.red} />
              </Pie>
              <Tooltip contentStyle={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      )}

      {staff.map(s => (
        <Card key={s.id} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{s.name}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{s.role}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {pill(s.status === "present" ? "Present" : "Absent", s.status === "present" ? C.green : C.red)}
              {s.status !== "present" && (
                <button onClick={() => clockIn(s.id)} style={{ padding: "4px 10px", borderRadius: 8, border: `1px solid ${C.gold}44`, background: C.goldBg, color: C.gold, fontSize: 11, cursor: "pointer" }}>
                  Mark Present
                </button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function Analytics({ orders, staff, loading }) {
  const revenue = orders.reduce((s, o) => s + o.amount, 0);
  const stageBreakdown = STAGES.map(s => ({ stage: STAGE_LABEL[s], count: orders.filter(o => o.stage === s).length }));
  const deliveredCount = orders.filter(o => o.stage === "delivered").length;
  const activeTailorCount = staff.filter(s => s.role === "Tailor").length;

  // Real, data-derived flags instead of canned "AI insight" copy.
  const insights = [];
  const overdue = orders.filter(o => o.days > 7 && o.stage !== "delivered");
  if (overdue.length > 0) insights.push({ icon: "⚠️", color: C.orange, text: `${overdue.length} order${overdue.length > 1 ? "s are" : " is"} past 7 days and still not delivered — check the Production Board for bottlenecks.` });
  const unassigned = orders.filter(o => !o.tailor && o.stage !== "delivered");
  if (unassigned.length > 0) insights.push({ icon: "🧵", color: C.blue, text: `${unassigned.length} order${unassigned.length > 1 ? "s have" : " has"} no tailor assigned yet.` });
  if (orders.length > 0 && deliveredCount / orders.length < 0.3) insights.push({ icon: "📈", color: C.green, text: `Only ${Math.round((deliveredCount / orders.length) * 100)}% of orders are delivered — most of the pipeline is still in progress.` });

  if (loading) return <Loading />;
  return (
    <div>
      <SectionHeader icon="📊" title="Analytics" sub="Revenue, production and performance insights" />
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <StatCard label="Period Revenue" value={fmt(revenue)} color={C.green} />
        <StatCard label="Total Orders" value={orders.length} color={C.purple} />
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <StatCard label="Active Orders" value={orders.filter(o => o.stage !== "delivered").length} color={C.blue} />
        <StatCard label="Delivered" value={deliveredCount} color={C.muted} />
      </div>

      {insights.length > 0 && (
        <Card style={{ marginBottom: 16, border: `1px solid ${C.gold}33` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.gold, marginBottom: 12 }}>Flags</div>
          {insights.map((ins, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: i < insights.length - 1 ? `1px solid ${C.border}22` : "none" }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{ins.icon}</span>
              <span style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{ins.text}</span>
            </div>
          ))}
        </Card>
      )}

      {orders.length > 0 && (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 14 }}>Production Pipeline</div>
          {stageBreakdown.map(s => (
            <div key={s.stage} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: C.muted, width: 100, flexShrink: 0 }}>{s.stage}</span>
              <div style={{ flex: 1, height: 6, background: C.surfaceAlt, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${(s.count / orders.length) * 100}%`, height: "100%", background: C.gold, borderRadius: 3 }} />
              </div>
              <span style={{ fontSize: 12, color: C.text, width: 20, textAlign: "right" }}>{s.count}</span>
            </div>
          ))}
        </Card>
      )}
      <div style={{ fontSize: 11, color: C.muted, marginTop: 12 }}>{activeTailorCount} tailor{activeTailorCount !== 1 ? "s" : ""} on record.</div>
    </div>
  );
}

// ── Nav config ─────────────────────────────────────────────────────
const NAV = [
  { key: "dashboard", label: "Dashboard", icon: "⊞" },
  { key: "orders", label: "Orders", icon: "✂️" },
  { key: "production", label: "Production Board", icon: "⚙️" },
  { key: "inventory", label: "Inventory", icon: "📦" },
  { key: "crm", label: "CRM", icon: "👥" },
  { key: "accounting", label: "Accounting", icon: "💰" },
  { key: "payroll", label: "Payroll", icon: "💵" },
  { key: "attendance", label: "Attendance", icon: "🕐" },
  { key: "analytics", label: "Analytics", icon: "📊" },
];

function AppShell() {
  const { profile, signOut } = useAuth();
  const [page, setPage] = useState("dashboard");
  const [menuOpen, setMenu] = useState(false);

  const ordersState = useOrders();
  const customersState = useCustomers();
  const inventoryState = useInventory();
  const staffState = useStaff();
  const attendanceState = useTodayAttendance();

  // staff_summary (staffState) computes today's present/absent from the
  // attendance table itself, so after writing an attendance row we need to
  // refresh staffState too, not just the attendance hook, or the status
  // pill on this page won't update until the next full reload.
  const handleClockIn = async (staffId, status) => {
    await attendanceState.clockIn(staffId, status);
    await staffState.refresh();
  };

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const navigate = (key) => { setPage(key); setMenu(false); };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text,
      fontFamily: "'Segoe UI','Helvetica Neue',sans-serif", maxWidth: 480, margin: "0 auto", position: "relative" }}>

      <div style={{ position: "sticky", top: 0, zIndex: 50, background: C.bg,
        borderBottom: `1px solid ${C.border}`, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {page === "dashboard" ? (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{greeting}, Rhobes 👋</div>
            <div style={{ fontSize: 11, color: C.muted }}>{dateStr}</div>
          </div>
        ) : (
          <button onClick={() => setPage("dashboard")} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 18 }}>←</button>
        )}
        <button onClick={() => setMenu(!menuOpen)}
          style={{ width: 40, height: 40, borderRadius: 10, background: C.surfaceAlt, border: `1px solid ${C.border}`, cursor: "pointer", fontSize: 16, color: C.text }}>☰</button>
      </div>

      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex" }}>
          <div style={{ width: 260, background: C.surface, height: "100%", borderRight: `1px solid ${C.border}`, padding: "20px 0", display: "flex", flexDirection: "column", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 16px 20px", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: C.goldBg, border: `1px solid ${C.gold}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: C.gold }}>R</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Rhobes</div>
                <div style={{ fontSize: 11, color: C.muted }}>rhobes</div>
              </div>
              <button onClick={() => setMenu(false)} style={{ marginLeft: "auto", background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>
            <div style={{ padding: "12px 0", flex: 1 }}>
              {NAV.map(n => (
                <button key={n.key} onClick={() => navigate(n.key)}
                  style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 16px",
                    background: page === n.key ? C.goldBg : "transparent", border: "none",
                    color: page === n.key ? C.gold : C.muted, fontSize: 14, cursor: "pointer", textAlign: "left",
                    borderLeft: page === n.key ? `3px solid ${C.gold}` : "3px solid transparent" }}>
                  <span style={{ fontSize: 16 }}>{n.icon}</span>{n.label}
                </button>
              ))}
            </div>
            <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.purple + "44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: C.purple }}>
                  {(profile?.full_name || "?")[0]}
                </div>
                <div>
                  <div style={{ fontSize: 13, color: C.text }}>{profile?.full_name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{profile?.role}</div>
                </div>
                <button onClick={signOut} style={{ marginLeft: "auto", background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 11, textDecoration: "underline" }}>Sign out</button>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.6)" }} onClick={() => setMenu(false)} />
        </div>
      )}

      <div style={{ padding: "20px 16px 40px" }}>
        {page === "dashboard" && <Dashboard orders={ordersState.orders} ordersLoading={ordersState.loading} customers={customersState.customers} staff={staffState.staff} />}
        {page === "orders" && <Orders orders={ordersState.orders} loading={ordersState.loading} error={ordersState.error} addOrder={ordersState.addOrder} advanceStage={ordersState.advanceStage} staff={staffState.staff} assignTailor={ordersState.assignTailor} />}
        {page === "production" && <ProductionBoard orders={ordersState.orders} loading={ordersState.loading} />}
        {page === "inventory" && <Inventory inventory={inventoryState.inventory} loading={inventoryState.loading} error={inventoryState.error} addItem={inventoryState.addItem} />}
        {page === "crm" && <CRM customers={customersState.customers} loading={customersState.loading} error={customersState.error} />}
        {page === "accounting" && <Accounting orders={ordersState.orders} loading={ordersState.loading} />}
        {page === "payroll" && <Payroll staff={staffState.staff} loading={staffState.loading} />}
        {page === "attendance" && <Attendance staff={staffState.staff} loading={staffState.loading} attendanceRows={attendanceState.rows} clockIn={handleClockIn} />}
        {page === "analytics" && <Analytics orders={ordersState.orders} staff={staffState.staff} loading={ordersState.loading} />}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480, background: C.surface, borderTop: `1px solid ${C.border}`,
        display: "flex", justifyContent: "space-around", padding: "8px 0", zIndex: 40 }}>
        {NAV.slice(0, 5).map(n => (
          <button key={n.key} onClick={() => navigate(n.key)}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 8px" }}>
            <span style={{ fontSize: 18 }}>{n.icon}</span>
            <span style={{ fontSize: 9, color: page === n.key ? C.gold : C.muted, letterSpacing: 0.5, textTransform: "uppercase" }}>{n.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Gate() {
  const { session, profile, loadingProfile, signOut } = useAuth();

  if (session === undefined) {
    return <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>Loading…</div>;
  }
  if (!session) return <LoginScreen />;
  if (loadingProfile) {
    return <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>Loading…</div>;
  }
  if (!profile) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: C.text, padding: 20, textAlign: "center" }}>
        <div>
          <div style={{ marginBottom: 12 }}>You're signed in, but there's no profile row for this account yet.</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Run the seed insert at the bottom of supabase/schema.sql with your email to make yourself the owner.</div>
          <button onClick={signOut} style={{ padding: "8px 20px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 13, cursor: "pointer" }}>Sign out</button>
        </div>
      </div>
    );
  }
  if (profile.role === "tailor") {
    // Phase 4 builds the real Tailor Portal. For now, tailors can sign in
    // but don't get the owner's full nav.
    return (
      <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: C.text, padding: 20, textAlign: "center" }}>
        <div>
          <div style={{ fontSize: 16, marginBottom: 8 }}>Welcome, {profile.full_name}</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>The Tailor Portal is being built next — for now, check in with the owner for your assignments.</div>
          <button onClick={signOut} style={{ padding: "8px 20px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 13, cursor: "pointer" }}>Sign out</button>
        </div>
      </div>
    );
  }
  return <AppShell />;
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}

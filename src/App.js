import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// ── Colour tokens ──────────────────────────────────────────────────
const C = {
  bg: "#0e0f11",
  surface: "#16181c",
  surfaceAlt: "#1c1f24",
  border: "#252830",
  gold: "#c9a84c",
  goldDim: "#a07830",
  goldBg: "rgba(201,168,76,0.10)",
  text: "#e8e2d4",
  muted: "#6b7280",
  green: "#34d399",
  red: "#f87171",
  blue: "#60a5fa",
  purple: "#a78bfa",
  orange: "#fb923c",
};

// ── Seed data ──────────────────────────────────────────────────────
const ORDERS_DATA = [
  { id:"ORD-001", client:"Mr. Tolu Ogundimu",    garment:"Senator & Native Wear", tailor:null,              stage:"new_order",    days:9,  amount:185000, due:"2026-06-16" },
  { id:"ORD-002", client:"Mr. Babatunde Oladele", garment:"Agbada Set",            tailor:null,              stage:"new_order",    days:15, amount:320000, due:"2026-06-22" },
  { id:"ORD-003", client:"Mr. Chidi Nwachukwu",   garment:"Bespoke Suit",          tailor:"Chukwudi Okonkwo",stage:"production",   days:5,  amount:420000, due:"2026-06-12" },
  { id:"ORD-004", client:"Dr. Taiwo Adesanya",    garment:"Bespoke Suit",          tailor:"Gbenga Adewale",  stage:"production",   days:4,  amount:450000, due:"2026-06-11" },
  { id:"ORD-005", client:"Mr. Emeka Obi",         garment:"3-Piece Suit",          tailor:"Chukwudi Okonkwo",stage:"qc_check",     days:2,  amount:510000, due:"2026-06-09" },
  { id:"ORD-006", client:"Chief Adeyemi Lagos",   garment:"Grand Boubou",          tailor:"Gbenga Adewale",  stage:"ready",        days:0,  amount:280000, due:"2026-06-07" },
  { id:"ORD-007", client:"Mr. Kunle Fashola",     garment:"Corporate Suit",        tailor:"Chukwudi Okonkwo",stage:"delivered",    days:-2, amount:390000, due:"2026-06-05" },
  { id:"ORD-008", client:"Dr. Seun Kuti",         garment:"Wedding Suit",          tailor:"Gbenga Adewale",  stage:"delivered",    days:-3, amount:480000, due:"2026-06-04" },
];

const INVENTORY = [
  { id:"FAB-001", name:"Navy Wool (Holland & Sherry)", category:"Fabrics",     qty:28, unit:"yards", minQty:5,  cost:12000, vendor:"Holland & Sherry" },
  { id:"FAB-002", name:"Charcoal Worsted Wool",        category:"Fabrics",     qty:18, unit:"yards", minQty:5,  cost:11500, vendor:"Dormeuil" },
  { id:"FAB-003", name:"Grey Herringbone Tweed",       category:"Fabrics",     qty:12, unit:"yards", minQty:5,  cost:9800,  vendor:"Abraham Moon" },
  { id:"FAB-004", name:"Black Luxury Wool Crepe",      category:"Fabrics",     qty:24, unit:"yards", minQty:5,  cost:13000, vendor:"Dormeuil" },
  { id:"FAB-005", name:"Brown Tweed (British)",        category:"Fabrics",     qty:9,  unit:"yards", minQty:5,  cost:10200, vendor:"Abraham Moon" },
  { id:"FAB-006", name:"Champagne Crepe Mix",          category:"Fabrics",     qty:6,  unit:"yards", minQty:5,  cost:8500,  vendor:"Local Supplier" },
  { id:"LIN-001", name:"Burgundy Acetate Lining",      category:"Lining",      qty:3,  unit:"metres",minQty:5,  cost:2200,  vendor:"Fabric World" },
  { id:"LIN-002", name:"Navy Silk Lining",             category:"Lining",      qty:15, unit:"metres",minQty:5,  cost:3800,  vendor:"Fabric World" },
  { id:"ACC-001", name:"Suit Shoulder Pads — Slim",    category:"Accessories", qty:4,  unit:"pairs", minQty:10, cost:850,   vendor:"Tailor Supplies NG" },
  { id:"ACC-002", name:"Horn Buttons — Dark Brown",    category:"Accessories", qty:45, unit:"pcs",   minQty:20, cost:120,   vendor:"Tailor Supplies NG" },
  { id:"HRD-001", name:"Invisible Zip 22cm",           category:"Hardware",    qty:30, unit:"pcs",   minQty:10, cost:350,   vendor:"Haberdashery Lagos" },
];

const CUSTOMERS = [
  { id:"CUS-001", name:"Mr. Tolu Ogundimu",     email:"tolu@email.com",     phone:"+234 801 234 5678", orders:3, spent:1185000, tier:"VIP",     joined:"2023-01" },
  { id:"CUS-002", name:"Mr. Chidi Nwachukwu",   email:"chidi@email.com",    phone:"+234 802 345 6789", orders:2, spent:870000,  tier:"Premium", joined:"2024-03" },
  { id:"CUS-003", name:"Dr. Taiwo Adesanya",    email:"taiwo@email.com",    phone:"+234 803 456 7890", orders:4, spent:1820000, tier:"VIP",     joined:"2022-06" },
  { id:"CUS-004", name:"Chief Adeyemi Lagos",   email:"chief@email.com",    phone:"+234 804 567 8901", orders:6, spent:2400000, tier:"VIP",     joined:"2021-11" },
  { id:"CUS-005", name:"Mr. Babatunde Oladele", email:"babatunde@email.com",phone:"+234 805 678 9012", orders:1, spent:320000,  tier:"Regular", joined:"2026-04" },
  { id:"CUS-006", name:"Mr. Emeka Obi",         email:"emeka@email.com",    phone:"+44 7911 123456",   orders:2, spent:930000,  tier:"Premium", joined:"2023-08" },
  { id:"CUS-007", name:"Mr. Kunle Fashola",     email:"kunle@email.com",    phone:"+234 807 890 1234", orders:3, spent:1170000, tier:"Premium", joined:"2022-12" },
  { id:"CUS-008", name:"Dr. Seun Kuti",         email:"seun@email.com",     phone:"+1 212 555 0101",   orders:1, spent:480000,  tier:"Regular", joined:"2025-11" },
];

const STAFF = [
  { id:"STF-001", name:"Chukwudi Okonkwo", role:"Senior Tailor",   salary:180000, status:"present", activeOrders:2 },
  { id:"STF-002", name:"Gbenga Adewale",   role:"Senior Tailor",   salary:175000, status:"present", activeOrders:2 },
  { id:"STF-003", name:"Amaka Eze",        role:"Junior Tailor",   salary:95000,  status:"absent",  activeOrders:0 },
  { id:"STF-004", name:"Tunde Lawal",      role:"Cutter",          salary:110000, status:"absent",  activeOrders:0 },
  { id:"STF-005", name:"Chisom Okafor",    role:"Finishing Tailor",salary:90000,  status:"absent",  activeOrders:0 },
];

const REVENUE_TREND = [
  { date:"May 9",  rev:180000 },{ date:"May 16", rev:320000 },{ date:"May 23", rev:290000 },
  { date:"May 30", rev:450000 },{ date:"Jun 6",  rev:720000 },{ date:"Jun 7",  rev:390000 },
];

const STAGES = ["new_order","production","qc_check","ready","delivered"];
const STAGE_LABEL = { new_order:"New Orders", production:"In Production", qc_check:"QC Check", ready:"Ready", delivered:"Delivered" };
const STAGE_COLOR = { new_order:C.blue, production:C.purple, qc_check:C.orange, ready:C.green, delivered:C.muted };

// ── Helpers ────────────────────────────────────────────────────────
const fmt = n => "₦" + Number(n).toLocaleString();
const pill = (label, color) => (
  <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:color+"22", color, border:`1px solid ${color}44`, fontWeight:600, letterSpacing:0.5 }}>
    {label}
  </span>
);

// ── Shared UI ──────────────────────────────────────────────────────
const Card = ({ children, style={} }) => (
  <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:16, ...style }}>{children}</div>
);

const StatCard = ({ label, value, sub, color=C.gold, icon }) => (
  <Card style={{ flex:1, minWidth:140 }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
      <div>
        <div style={{ fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>{label}</div>
        <div style={{ fontSize:24, fontWeight:700, color, fontFamily:"Georgia,serif" }}>{value}</div>
        {sub && <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>{sub}</div>}
      </div>
      {icon && <div style={{ fontSize:22 }}>{icon}</div>}
    </div>
  </Card>
);

const SectionHeader = ({ icon, title, sub }) => (
  <div style={{ marginBottom:20 }}>
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <span style={{ fontSize:20 }}>{icon}</span>
      <div>
        <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:C.text, fontFamily:"Georgia,serif" }}>{title}</h2>
        {sub && <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{sub}</div>}
      </div>
    </div>
  </div>
);

// ── Pages ──────────────────────────────────────────────────────────

function Dashboard() {
  const active   = ORDERS_DATA.filter(o => !["delivered"].includes(o.stage)).length;
  const inProd   = ORDERS_DATA.filter(o => o.stage==="production").length;
  const overdue  = ORDERS_DATA.filter(o => o.days > 7 && o.stage !== "delivered").length;
  const ready    = ORDERS_DATA.filter(o => o.stage==="ready").length;
  const revenue  = ORDERS_DATA.reduce((s,o)=>s+o.amount,0);

  return (
    <div>
      {/* Hero banner */}
      <div style={{ background:"linear-gradient(135deg,#1a1060 0%,#0e0f40 60%,#0e0f11 100%)", borderRadius:16, padding:"24px 20px", marginBottom:20, border:`1px solid #2a2860` }}>
        <div style={{ fontSize:10, letterSpacing:3, color:C.gold, textTransform:"uppercase", marginBottom:6 }}>Fashion Suite · Live Overview</div>
        <div style={{ fontSize:20, fontWeight:700, color:"#fff", marginBottom:4, fontFamily:"Georgia,serif" }}>Rhobes Production Centre</div>
        <div style={{ fontSize:13, color:"#aaa", marginBottom:20 }}>Real-time order pipeline · {active} active orders</div>
        <div style={{ display:"flex", gap:28 }}>
          {[["Active Orders",active,"#fff"],["In Production",inProd,"#fff"],["Overdue",overdue,C.red],["Ready",ready,C.green]].map(([l,v,c])=>(
            <div key={l}>
              <div style={{ fontSize:28, fontWeight:800, color:c, fontFamily:"Georgia,serif" }}>{v}</div>
              <div style={{ fontSize:10, color:"#888", textTransform:"uppercase", letterSpacing:1 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:"flex", gap:12, marginBottom:16, flexWrap:"wrap" }}>
        <StatCard label="Orders This Month" value="14" sub="All statuses" icon="✂️" color={C.purple} />
        <StatCard label="Revenue (Period)"  value={fmt(revenue)} sub="Fashion orders" icon="💰" color={C.green} />
      </div>
      <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
        <StatCard label="Total Customers" value={CUSTOMERS.length} sub="In CRM" icon="👥" color={C.blue} />
        <StatCard label="Active Tailors"  value="2" sub="On workload" icon="🧵" color={C.orange} />
      </div>

      {/* Revenue chart */}
      <Card style={{ marginBottom:20 }}>
        <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:16 }}>Revenue Trend</div>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={REVENUE_TREND}>
            <XAxis dataKey="date" tick={{ fontSize:10, fill:C.muted }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip formatter={v=>fmt(v)} contentStyle={{ background:C.surfaceAlt, border:`1px solid ${C.border}`, borderRadius:8, fontSize:12 }} />
            <Line type="monotone" dataKey="rev" stroke={C.gold} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Production board preview */}
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.text }}>Production Board — Today</div>
        </div>
        <div style={{ display:"flex", gap:10, overflowX:"auto" }}>
          {["new_order","production","ready"].map(stage => (
            <div key={stage} style={{ minWidth:160, flex:1 }}>
              <div style={{ fontSize:10, letterSpacing:1, textTransform:"uppercase", color:STAGE_COLOR[stage], marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ width:6,height:6,borderRadius:"50%",background:STAGE_COLOR[stage],display:"inline-block" }} />
                {STAGE_LABEL[stage]}
                <span style={{ background:STAGE_COLOR[stage]+"22", color:STAGE_COLOR[stage], borderRadius:20, padding:"0 6px", fontSize:10 }}>
                  {ORDERS_DATA.filter(o=>o.stage===stage).length}
                </span>
              </div>
              {ORDERS_DATA.filter(o=>o.stage===stage).map(o=>(
                <div key={o.id} style={{ background:C.surfaceAlt, border:`1px solid ${C.border}`, borderRadius:8, padding:10, marginBottom:8 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:C.text }}>{o.client}</div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{o.garment}</div>
                  <div style={{ fontSize:11, color:o.tailor?C.muted:"#f87171", marginTop:4 }}>{o.tailor||"Unassigned"}</div>
                  <div style={{ fontSize:10, color:o.days>7?C.red:C.muted, marginTop:4, textAlign:"right" }}>{o.days}d</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Orders({ orders, setOrders }) {
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [newOrder, setNewOrder] = useState({ client:"", garment:"", amount:"" });

  const filtered = filter==="all" ? orders : orders.filter(o=>o.stage===filter);

  const addOrder = () => {
    if (!newOrder.client || !newOrder.garment) return;
    setOrders([...orders, {
      id:`ORD-00${orders.length+1}`, client:newOrder.client, garment:newOrder.garment,
      tailor:null, stage:"new_order", days:0, amount:parseInt(newOrder.amount)||0, due:"TBD"
    }]);
    setNewOrder({ client:"", garment:"", amount:"" });
    setShowAdd(false);
  };

  const advance = (id) => {
    setOrders(orders.map(o => {
      if (o.id!==id) return o;
      const idx = STAGES.indexOf(o.stage);
      return { ...o, stage: STAGES[Math.min(idx+1, STAGES.length-1)] };
    }));
  };

  return (
    <div>
      <SectionHeader icon="✂️" title="Orders" sub="All fashion orders" />

      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        {["all",...STAGES].map(s=>(
          <button key={s} onClick={()=>setFilter(s)}
            style={{ padding:"6px 14px", borderRadius:20, border:`1px solid ${filter===s?C.gold:C.border}`,
              background:filter===s?C.goldBg:"transparent", color:filter===s?C.gold:C.muted, fontSize:12, cursor:"pointer" }}>
            {s==="all"?"All":STAGE_LABEL[s]}
          </button>
        ))}
        <button onClick={()=>setShowAdd(true)}
          style={{ marginLeft:"auto", padding:"6px 16px", borderRadius:20, border:"none",
            background:C.gold, color:"#000", fontSize:12, cursor:"pointer", fontWeight:700 }}>
          + New Order
        </button>
      </div>

      {showAdd && (
        <Card style={{ marginBottom:16, border:`1px solid ${C.gold}44` }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:12 }}>New Order</div>
          {[["Client name","client"],["Garment type","garment"],["Amount (₦)","amount"]].map(([ph,k])=>(
            <input key={k} placeholder={ph} value={newOrder[k]}
              onChange={e=>setNewOrder({...newOrder,[k]:e.target.value})}
              style={{ display:"block", width:"100%", marginBottom:8, padding:"8px 12px", borderRadius:8,
                border:`1px solid ${C.border}`, background:C.surfaceAlt, color:C.text, fontSize:13, boxSizing:"border-box" }} />
          ))}
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={addOrder} style={{ padding:"8px 20px", borderRadius:8, border:"none", background:C.gold, color:"#000", fontSize:13, cursor:"pointer", fontWeight:700 }}>Add</button>
            <button onClick={()=>setShowAdd(false)} style={{ padding:"8px 20px", borderRadius:8, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, fontSize:13, cursor:"pointer" }}>Cancel</button>
          </div>
        </Card>
      )}

      {filtered.map(o=>(
        <Card key={o.id} style={{ marginBottom:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{o.client}</div>
              <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{o.garment} · {o.id}</div>
              <div style={{ fontSize:12, color:o.tailor?C.muted:C.red, marginTop:4 }}>
                {o.tailor?"👤 "+o.tailor:"⚠ Unassigned"}
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              {pill(STAGE_LABEL[o.stage], STAGE_COLOR[o.stage])}
              <div style={{ fontSize:13, color:C.gold, fontWeight:700, marginTop:6 }}>{fmt(o.amount)}</div>
              <div style={{ fontSize:11, color:o.days>7?C.red:C.muted, marginTop:2 }}>{o.days}d elapsed</div>
            </div>
          </div>
          {o.stage !== "delivered" && (
            <button onClick={()=>advance(o.id)}
              style={{ marginTop:10, padding:"5px 14px", borderRadius:8, border:`1px solid ${C.gold}44`,
                background:C.goldBg, color:C.gold, fontSize:11, cursor:"pointer" }}>
              Advance Stage →
            </button>
          )}
        </Card>
      ))}
    </div>
  );
}

function ProductionBoard({ orders }) {
  return (
    <div>
      <SectionHeader icon="⚙️" title="Production Board" sub="Kanban view by stage" />
      <div style={{ display:"flex", gap:12, overflowX:"auto", paddingBottom:8 }}>
        {STAGES.map(stage=>(
          <div key={stage} style={{ minWidth:180, flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
              <span style={{ width:8,height:8,borderRadius:"50%",background:STAGE_COLOR[stage],display:"inline-block" }} />
              <span style={{ fontSize:11, textTransform:"uppercase", letterSpacing:1, color:STAGE_COLOR[stage], fontWeight:700 }}>{STAGE_LABEL[stage]}</span>
              <span style={{ background:STAGE_COLOR[stage]+"22", color:STAGE_COLOR[stage], borderRadius:20, padding:"1px 7px", fontSize:10, marginLeft:"auto" }}>
                {orders.filter(o=>o.stage===stage).length}
              </span>
            </div>
            {orders.filter(o=>o.stage===stage).map(o=>(
              <Card key={o.id} style={{ marginBottom:8, borderLeft:`3px solid ${STAGE_COLOR[stage]}` }}>
                <div style={{ fontSize:12, fontWeight:700, color:C.text }}>{o.client}</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{o.garment}</div>
                <div style={{ fontSize:11, marginTop:6, display:"flex", justifyContent:"space-between" }}>
                  <span style={{ color:o.tailor?C.muted:C.red }}>{o.tailor||"Unassigned"}</span>
                  <span style={{ color:o.days>7?C.red:C.muted }}>{o.days}d</span>
                </div>
              </Card>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Inventory() {
  const [cat, setCat] = useState("All Categories");
  const [search, setSearch] = useState("");
  const cats = ["All Categories","Fabrics","Lining","Accessories","Hardware"];
  const lowStock = INVENTORY.filter(i=>i.qty<=i.minQty);
  const filtered = INVENTORY
    .filter(i=>cat==="All Categories"||i.category===cat)
    .filter(i=>i.name.toLowerCase().includes(search.toLowerCase())||i.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <SectionHeader icon="📦" title="Materials & Inventory" sub="Fabrics, trimmings and ready-to-wear stock" />

      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        <button style={{ padding:"8px 18px", borderRadius:8, border:"none", background:C.gold, color:"#000", fontSize:12, cursor:"pointer", fontWeight:700 }}>+ Add Material</button>
        <button style={{ padding:"8px 18px", borderRadius:8, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, fontSize:12, cursor:"pointer" }}>↑ Import</button>
        <button style={{ padding:"8px 18px", borderRadius:8, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, fontSize:12, cursor:"pointer" }}>↓ Export</button>
      </div>

      <div style={{ display:"flex", gap:12, marginBottom:16, flexWrap:"wrap" }}>
        <StatCard label="Raw Materials" value={INVENTORY.length} icon="✂️" color={C.gold} />
        <StatCard label="Low Stock"     value={lowStock.length} icon="⚠️" color={C.orange} />
      </div>

      {lowStock.length>0 && (
        <div style={{ background:"#7c3d0011", border:`1px solid ${C.orange}44`, borderRadius:10, padding:12, marginBottom:16 }}>
          <div style={{ fontSize:12, color:C.orange, fontWeight:600, marginBottom:4 }}>⚠ {lowStock.length} items running low or out of stock</div>
          <div style={{ fontSize:12, color:C.muted }}>{lowStock.map(i=>i.name).join(" · ")}</div>
        </div>
      )}

      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        <input placeholder="Search name, SKU..." value={search} onChange={e=>setSearch(e.target.value)}
          style={{ flex:1, padding:"8px 12px", borderRadius:8, border:`1px solid ${C.border}`, background:C.surfaceAlt, color:C.text, fontSize:13 }} />
        <select value={cat} onChange={e=>setCat(e.target.value)}
          style={{ padding:"8px 12px", borderRadius:8, border:`1px solid ${C.gold}`, background:C.surfaceAlt, color:C.text, fontSize:13 }}>
          {cats.map(c=><option key={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:1, padding:"4px 0 8px", borderBottom:`1px solid ${C.border}`, marginBottom:8, display:"flex", gap:8 }}>
        <span style={{ flex:1 }}>Material</span><span style={{ width:60, textAlign:"right" }}>Qty</span><span style={{ width:80, textAlign:"right" }}>Value</span>
      </div>

      {filtered.map(item=>{
        const isLow = item.qty <= item.minQty;
        return (
          <div key={item.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 0", borderBottom:`1px solid ${C.border}22` }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, color:isLow?C.orange:C.text, fontWeight:500 }}>{item.name}</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>
                {item.id} · <span style={{ background:C.surfaceAlt, padding:"1px 6px", borderRadius:4 }}>{item.category}</span>
              </div>
            </div>
            <div style={{ width:60, textAlign:"right", fontSize:13, color:isLow?C.orange:C.text, fontWeight:600 }}>
              {item.qty} <span style={{ fontSize:10, color:C.muted }}>{item.unit}</span>
            </div>
            <div style={{ width:80, textAlign:"right", fontSize:12, color:C.muted }}>
              {fmt(item.qty*item.cost)}
            </div>
          </div>
        );
      })}

      <div style={{ padding:"12px 0", borderTop:`1px solid ${C.border}`, marginTop:8, display:"flex", justifyContent:"space-between" }}>
        <span style={{ fontSize:13, color:C.muted }}>Total Inventory Value</span>
        <span style={{ fontSize:14, fontWeight:700, color:C.gold }}>{fmt(INVENTORY.reduce((s,i)=>s+i.qty*i.cost,0))}</span>
      </div>
    </div>
  );
}

function CRM() {
  const [tab, setTab] = useState("customers");
  const tiers = { VIP: C.gold, Premium: C.purple, Regular: C.blue };

  return (
    <div>
      <SectionHeader icon="👥" title="CRM Overview" sub="Manage customer relationships, loyalty, and analytics" />

      <div style={{ display:"flex", gap:12, marginBottom:16, flexWrap:"wrap" }}>
        <StatCard label="Total Customers" value={CUSTOMERS.length} icon="👥" color={C.blue} />
        <StatCard label="VIP & Premium"   value={CUSTOMERS.filter(c=>c.tier!=="Regular").length} icon="👑" color={C.gold} />
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {[["customers","Customers"],["analytics","Analytics"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)}
            style={{ padding:"7px 16px", borderRadius:8, border:`1px solid ${tab===k?C.gold:C.border}`,
              background:tab===k?C.goldBg:"transparent", color:tab===k?C.gold:C.muted, fontSize:12, cursor:"pointer" }}>
            {l}
          </button>
        ))}
      </div>

      {tab==="customers" && CUSTOMERS.map(c=>(
        <Card key={c.id} style={{ marginBottom:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:C.goldBg, border:`1px solid ${C.gold}44`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:C.gold, flexShrink:0 }}>
                {c.name.split(" ").pop()[0]}
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{c.name}</div>
                <div style={{ fontSize:11, color:C.muted }}>{c.email}</div>
                <div style={{ fontSize:11, color:C.muted }}>{c.phone}</div>
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              {pill(c.tier, tiers[c.tier])}
              <div style={{ fontSize:13, color:C.gold, fontWeight:700, marginTop:6 }}>{fmt(c.spent)}</div>
              <div style={{ fontSize:11, color:C.muted }}>{c.orders} orders</div>
            </div>
          </div>
        </Card>
      ))}

      {tab==="analytics" && (
        <div>
          <Card style={{ marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:14 }}>Revenue by Customer Tier</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={[
                { tier:"VIP",     rev:CUSTOMERS.filter(c=>c.tier==="VIP").reduce((s,c)=>s+c.spent,0) },
                { tier:"Premium", rev:CUSTOMERS.filter(c=>c.tier==="Premium").reduce((s,c)=>s+c.spent,0) },
                { tier:"Regular", rev:CUSTOMERS.filter(c=>c.tier==="Regular").reduce((s,c)=>s+c.spent,0) },
              ]}>
                <XAxis dataKey="tier" tick={{ fontSize:11, fill:C.muted }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={v=>fmt(v)} contentStyle={{ background:C.surfaceAlt, border:`1px solid ${C.border}`, borderRadius:8, fontSize:12 }} />
                <Bar dataKey="rev" fill={C.gold} radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:10 }}>Top by Spend</div>
          {[...CUSTOMERS].sort((a,b)=>b.spent-a.spent).slice(0,3).map((c,i)=>(
            <div key={c.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:`1px solid ${C.border}22` }}>
              <span style={{ fontSize:16 }}>{"🥇🥈🥉"[i]}</span>
              <span style={{ flex:1, fontSize:13, color:C.text }}>{c.name}</span>
              <span style={{ fontSize:13, color:C.gold, fontWeight:700 }}>{fmt(c.spent)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Accounting() {
  const revenue = ORDERS_DATA.reduce((s,o)=>s+o.amount,0);
  const expenses = 820000;
  const profit = revenue - expenses;
  const monthData = [
    { m:"Jan", rev:1200000, exp:600000 },{ m:"Feb", rev:980000, exp:550000 },
    { m:"Mar", rev:1450000, exp:720000 },{ m:"Apr", rev:1100000, exp:610000 },
    { m:"May", rev:1760000, exp:790000 },{ m:"Jun", rev:revenue,  exp:expenses },
  ];

  return (
    <div>
      <SectionHeader icon="💰" title="Accounting & Finance" sub="Complete financial management and reporting" />

      <div style={{ display:"flex", gap:12, marginBottom:16, flexWrap:"wrap" }}>
        <StatCard label="Total Revenue" value={fmt(revenue)} sub="+429% vs last period" color={C.green} />
        <StatCard label="Gross Profit"  value={fmt(profit)}  sub={`Margin: ${Math.round(profit/revenue*100)}%`} color={C.blue} />
      </div>
      <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
        <StatCard label="Net Profit"  value={fmt(profit-180000)} sub="After payroll" color={C.purple} />
        <StatCard label="Outstanding" value={fmt(ORDERS_DATA.filter(o=>o.stage!=="delivered").reduce((s,o)=>s+o.amount*0.5,0))} sub="Pending invoices" color={C.orange} />
      </div>

      <Card style={{ marginBottom:20 }}>
        <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:16 }}>Revenue vs Expenses — Last 6 Months</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthData} barGap={4}>
            <XAxis dataKey="m" tick={{ fontSize:10, fill:C.muted }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip formatter={v=>fmt(v)} contentStyle={{ background:C.surfaceAlt, border:`1px solid ${C.border}`, borderRadius:8, fontSize:12 }} />
            <Bar dataKey="rev" name="Revenue" fill={C.green}  radius={[4,4,0,0]} />
            <Bar dataKey="exp" name="Expenses" fill={C.red}   radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:10 }}>Recent Invoices</div>
      {ORDERS_DATA.slice(0,5).map(o=>(
        <div key={o.id} style={{ display:"flex", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${C.border}22`, gap:8 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, color:C.text }}>{o.client}</div>
            <div style={{ fontSize:11, color:C.muted }}>{o.garment}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.gold }}>{fmt(o.amount)}</div>
            {pill(o.stage==="delivered"?"Paid":"Pending", o.stage==="delivered"?C.green:C.orange)}
          </div>
        </div>
      ))}
    </div>
  );
}

function Payroll() {
  const gross = STAFF.reduce((s,st)=>s+st.salary,0);
  const paye  = Math.round(gross*0.12);
  const nhf   = Math.round(gross*0.025);
  const net   = gross - paye - nhf;

  return (
    <div>
      <SectionHeader icon="💵" title="Payroll Management" sub="Configure payroll settings and manage staff compensation" />

      <div style={{ display:"flex", gap:12, marginBottom:16, flexWrap:"wrap" }}>
        <StatCard label="Total Staff"   value={STAFF.length}  icon="👤" color={C.blue} />
        <StatCard label="Gross Payroll" value={fmt(gross)}    icon="💰" color={C.green} />
      </div>
      <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
        <StatCard label="Deductions" value={fmt(paye+nhf)} sub="PAYE + NHF" icon="📉" color={C.red} />
        <StatCard label="Net Payroll" value={fmt(net)}     icon="✅" color={C.purple} />
      </div>

      <Card style={{ marginBottom:16 }}>
        <div style={{ fontSize:12, color:C.muted, marginBottom:12, textTransform:"uppercase", letterSpacing:1 }}>Deduction Breakdown</div>
        {[["PAYE (12%)", paye, C.orange],["NHF (2.5%)", nhf, C.blue],["Net Pay", net, C.green]].map(([l,v,c])=>(
          <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.border}22` }}>
            <span style={{ fontSize:13, color:C.muted }}>{l}</span>
            <span style={{ fontSize:13, fontWeight:700, color:c }}>{fmt(v)}</span>
          </div>
        ))}
      </Card>

      <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:10 }}>Staff Salaries</div>
      {STAFF.map(s=>(
        <Card key={s.id} style={{ marginBottom:8 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{s.name}</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{s.role}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:14, fontWeight:700, color:C.gold }}>{fmt(s.salary)}</div>
              <div style={{ fontSize:11, color:C.muted }}>/ month</div>
            </div>
          </div>
        </Card>
      ))}

      <button style={{ width:"100%", marginTop:12, padding:"12px", borderRadius:10, border:"none",
        background:C.gold, color:"#000", fontSize:14, cursor:"pointer", fontWeight:700 }}>
        Generate Payroll →
      </button>
    </div>
  );
}

function Attendance() {
  const present = STAFF.filter(s=>s.status==="present").length;
  const absent  = STAFF.filter(s=>s.status==="absent").length;

  return (
    <div>
      <SectionHeader icon="🕐" title="Attendance Management" sub="Track staff attendance" />

      <div style={{ display:"flex", gap:12, marginBottom:16, flexWrap:"wrap" }}>
        <StatCard label="Total Staff"    value={STAFF.length} icon="👥" color={C.blue} />
        <StatCard label="Present Today"  value={present}      icon="✅" color={C.green} />
      </div>
      <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
        <StatCard label="Absent Today" value={absent}  icon="❌" color={C.red} />
        <StatCard label="Late Today"   value="0"       icon="⏰" color={C.orange} />
      </div>

      <Card style={{ marginBottom:16 }}>
        <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:14 }}>Staff Status</div>
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={[{name:"Present",value:present},{name:"Absent",value:absent}]}
              dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3}>
              <Cell fill={C.green} /><Cell fill={C.red} />
            </Pie>
            <Tooltip contentStyle={{ background:C.surfaceAlt, border:`1px solid ${C.border}`, borderRadius:8, fontSize:12 }} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display:"flex", justifyContent:"center", gap:20 }}>
          {[["Present",C.green,present],["Absent",C.red,absent]].map(([l,c,v])=>(
            <div key={l} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ width:8,height:8,borderRadius:"50%",background:c,display:"inline-block" }} />
              <span style={{ fontSize:12, color:C.muted }}>{l}: <strong style={{ color:C.text }}>{v}</strong></span>
            </div>
          ))}
        </div>
      </Card>

      {STAFF.map(s=>(
        <Card key={s.id} style={{ marginBottom:8 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{s.name}</div>
              <div style={{ fontSize:11, color:C.muted }}>{s.role}</div>
            </div>
            {pill(s.status==="present"?"Present":"Absent", s.status==="present"?C.green:C.red)}
          </div>
        </Card>
      ))}
    </div>
  );
}

function Analytics({ orders }) {
  const revenue = orders.reduce((s,o)=>s+o.amount,0);
  const stageBreakdown = STAGES.map(s=>({ stage:STAGE_LABEL[s], count:orders.filter(o=>o.stage===s).length }));

  return (
    <div>
      <SectionHeader icon="📊" title="Analytics" sub="Revenue, production and performance insights" />

      <div style={{ display:"flex", gap:12, marginBottom:16, flexWrap:"wrap" }}>
        <StatCard label="Period Revenue"  value={fmt(revenue)}     sub="+429% vs last period" color={C.green} />
        <StatCard label="Total Orders"    value={orders.length}    sub="+1200% vs last period" color={C.purple} />
      </div>
      <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
        <StatCard label="Active Orders" value={orders.filter(o=>o.stage!=="delivered").length} color={C.blue} />
        <StatCard label="Delivered"     value={orders.filter(o=>o.stage==="delivered").length} color={C.muted} />
      </div>

      {/* AI Insights */}
      <Card style={{ marginBottom:16, border:`1px solid ${C.gold}33` }}>
        <div style={{ fontSize:13, fontWeight:700, color:C.gold, marginBottom:12 }}>✨ AI Insights</div>
        {[
          { icon:"📈", color:C.green,  text:"Revenue up 429% vs previous period. Growth momentum is strong — consider capacity planning." },
          { icon:"⚠️", color:C.orange, text:"Only 25% of orders delivered — remaining in pipeline. Check stage bottlenecks in the Production tab." },
          { icon:"🧵", color:C.blue,   text:"2 active tailors handling all orders. Consider bringing in additional capacity for peak season." },
        ].map((ins,i)=>(
          <div key={i} style={{ display:"flex", gap:10, padding:"10px 0", borderBottom:i<2?`1px solid ${C.border}22`:"none" }}>
            <span style={{ fontSize:18, flexShrink:0 }}>{ins.icon}</span>
            <span style={{ fontSize:12, color:C.muted, lineHeight:1.6 }}>{ins.text}</span>
          </div>
        ))}
      </Card>

      <Card style={{ marginBottom:16 }}>
        <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:14 }}>Revenue Trend</div>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={REVENUE_TREND}>
            <XAxis dataKey="date" tick={{ fontSize:10, fill:C.muted }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip formatter={v=>fmt(v)} contentStyle={{ background:C.surfaceAlt, border:`1px solid ${C.border}`, borderRadius:8, fontSize:12 }} />
            <Line type="monotone" dataKey="rev" stroke={C.gold} strokeWidth={2.5} dot={{ fill:C.gold, r:3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:14 }}>Production Pipeline</div>
        {stageBreakdown.map(s=>(
          <div key={s.stage} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <span style={{ fontSize:12, color:C.muted, width:100, flexShrink:0 }}>{s.stage}</span>
            <div style={{ flex:1, height:6, background:C.surfaceAlt, borderRadius:3, overflow:"hidden" }}>
              <div style={{ width:`${(s.count/orders.length)*100}%`, height:"100%", background:C.gold, borderRadius:3 }} />
            </div>
            <span style={{ fontSize:12, color:C.text, width:20, textAlign:"right" }}>{s.count}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── Nav config ─────────────────────────────────────────────────────
const NAV = [
  { key:"dashboard",   label:"Dashboard",        icon:"⊞"  },
  { key:"orders",      label:"Orders",            icon:"✂️"  },
  { key:"production",  label:"Production Board",  icon:"⚙️"  },
  { key:"inventory",   label:"Inventory",         icon:"📦"  },
  { key:"crm",         label:"CRM",               icon:"👥"  },
  { key:"accounting",  label:"Accounting",        icon:"💰"  },
  { key:"payroll",     label:"Payroll",           icon:"💵"  },
  { key:"attendance",  label:"Attendance",        icon:"🕐"  },
  { key:"analytics",   label:"Analytics",         icon:"📊"  },
];

// ── Root ───────────────────────────────────────────────────────────
export default function RhobesSuite() {
  const [page, setPage]     = useState("dashboard");
  const [menuOpen, setMenu] = useState(false);
  const [orders, setOrders] = useState(ORDERS_DATA);

  const now = new Date();
  const greeting = now.getHours()<12?"Good morning":now.getHours()<17?"Good afternoon":"Good evening";
  const dateStr = now.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"});

  const navigate = (key) => { setPage(key); setMenu(false); };

  return (
    <div style={{ background:C.bg, minHeight:"100vh", color:C.text,
      fontFamily:"'Segoe UI','Helvetica Neue',sans-serif", maxWidth:480, margin:"0 auto", position:"relative" }}>

      {/* Top bar */}
      <div style={{ position:"sticky", top:0, zIndex:50, background:C.bg,
        borderBottom:`1px solid ${C.border}`, padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        {page==="dashboard" ? (
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:C.text }}>{greeting}, Rhobes 👋</div>
            <div style={{ fontSize:11, color:C.muted }}>{dateStr}</div>
          </div>
        ) : (
          <button onClick={()=>setPage("dashboard")}
            style={{ background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:18 }}>←</button>
        )}
        <button onClick={()=>setMenu(!menuOpen)}
          style={{ width:40, height:40, borderRadius:10, background:C.surfaceAlt,
            border:`1px solid ${C.border}`, cursor:"pointer", fontSize:16, color:C.text }}>☰</button>
      </div>

      {/* Slide-out menu */}
      {menuOpen && (
        <div style={{ position:"fixed", inset:0, zIndex:100, display:"flex" }}>
          <div style={{ width:260, background:C.surface, height:"100%", borderRight:`1px solid ${C.border}`,
            padding:"20px 0", display:"flex", flexDirection:"column", overflowY:"auto" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"0 16px 20px", borderBottom:`1px solid ${C.border}` }}>
              <div style={{ width:40, height:40, borderRadius:10, background:C.goldBg, border:`1px solid ${C.gold}44`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:800, color:C.gold }}>R</div>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:C.text }}>Rhobes</div>
                <div style={{ fontSize:11, color:C.muted }}>rhobes</div>
              </div>
              <button onClick={()=>setMenu(false)}
                style={{ marginLeft:"auto", background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:18 }}>✕</button>
            </div>
            <div style={{ padding:"12px 0", flex:1 }}>
              {NAV.map(n=>(
                <button key={n.key} onClick={()=>navigate(n.key)}
                  style={{ display:"flex", alignItems:"center", gap:12, width:"100%", padding:"12px 16px",
                    background:page===n.key?C.goldBg:"transparent", border:"none",
                    color:page===n.key?C.gold:C.muted, fontSize:14, cursor:"pointer", textAlign:"left",
                    borderLeft:page===n.key?`3px solid ${C.gold}`:"3px solid transparent" }}>
                  <span style={{ fontSize:16 }}>{n.icon}</span>{n.label}
                </button>
              ))}
            </div>
            <div style={{ padding:"12px 16px", borderTop:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:C.purple+"44",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:C.purple }}>I</div>
                <div>
                  <div style={{ fontSize:13, color:C.text }}>Ife Adebiyi</div>
                  <div style={{ fontSize:11, color:C.muted }}>Owner</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ flex:1, background:"rgba(0,0,0,0.6)" }} onClick={()=>setMenu(false)} />
        </div>
      )}

      {/* Page content */}
      <div style={{ padding:"20px 16px 40px" }}>
        {page==="dashboard"  && <Dashboard />}
        {page==="orders"     && <Orders orders={orders} setOrders={setOrders} />}
        {page==="production" && <ProductionBoard orders={orders} />}
        {page==="inventory"  && <Inventory />}
        {page==="crm"        && <CRM />}
        {page==="accounting" && <Accounting />}
        {page==="payroll"    && <Payroll />}
        {page==="attendance" && <Attendance />}
        {page==="analytics"  && <Analytics orders={orders} />}
      </div>

      {/* Bottom nav */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"100%", maxWidth:480, background:C.surface, borderTop:`1px solid ${C.border}`,
        display:"flex", justifyContent:"space-around", padding:"8px 0", zIndex:40 }}>
        {NAV.slice(0,5).map(n=>(
          <button key={n.key} onClick={()=>navigate(n.key)}
            style={{ background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column",
              alignItems:"center", gap:2, padding:"4px 8px" }}>
            <span style={{ fontSize:18 }}>{n.icon}</span>
            <span style={{ fontSize:9, color:page===n.key?C.gold:C.muted, letterSpacing:0.5, textTransform:"uppercase" }}>
              {n.label.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
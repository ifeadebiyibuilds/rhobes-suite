import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";

// ── shared shape helpers ──────────────────────────────────────────
// These translate DB rows into the exact prop shapes the existing page
// components already expect, so the UI code barely has to change.

function mapOrder(row) {
  const created = new Date(row.created_at);
  const days = Math.max(0, Math.floor((Date.now() - created.getTime()) / 86400000));
  return {
    id: row.order_no,
    dbId: row.id,
    client: row.customers?.name || "Unknown",
    garment: row.garment,
    tailor: row.profiles?.full_name || null,
    tailorId: row.tailor_id,
    stage: row.stage,
    days,
    amount: Number(row.amount),
    due: row.due_date || "TBD",
  };
}

// ── ORDERS ─────────────────────────────────────────────────────────
export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, customers(name), profiles!orders_tailor_id_fkey(full_name)")
      .order("created_at", { ascending: false });
    if (error) setError(error);
    else { setOrders(data.map(mapOrder)); setError(null); }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Simple v1: find-or-create the customer by name typed in the New Order
  // form. Once the CRM page gets a real "pick existing customer" selector
  // (part of the CRM rewrite), this can call with a customerId directly.
  const addOrder = useCallback(async ({ client, garment, amount, orderType = "bespoke" }) => {
    const { data: existing } = await supabase
      .from("customers").select("id").ilike("name", client).maybeSingle();
    let customerId = existing?.id;
    if (!customerId) {
      const { data: created, error: custErr } = await supabase
        .from("customers").insert({ name: client }).select("id").single();
      if (custErr) throw custErr;
      customerId = created.id;
    }
    const { error: orderErr } = await supabase.from("orders").insert({
      customer_id: customerId, garment, amount: Number(amount) || 0, order_type: orderType,
    });
    if (orderErr) throw orderErr;
    await refresh();
  }, [refresh]);

  const advanceStage = useCallback(async (dbId, nextStage) => {
    const { error } = await supabase.from("orders").update({ stage: nextStage }).eq("id", dbId);
    if (error) throw error;
    await refresh();
  }, [refresh]);

  const assignTailor = useCallback(async (dbId, tailorId) => {
    const { error } = await supabase.from("orders").update({ tailor_id: tailorId }).eq("id", dbId);
    if (error) throw error;
    await refresh();
  }, [refresh]);

  return { orders, loading, error, refresh, addOrder, advanceStage, assignTailor };
}

// ── CUSTOMERS ──────────────────────────────────────────────────────
export function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("customer_summary")
      .select("*")
      .order("total_spent", { ascending: false });
    if (error) setError(error);
    else {
      setCustomers(data.map(c => ({
        id: c.id, name: c.name, email: c.email, phone: c.phone,
        orders: Number(c.order_count), spent: Number(c.total_spent),
        tier: c.tier, joined: c.created_at?.slice(0, 7),
      })));
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { customers, loading, error, refresh };
}

// ── INVENTORY ──────────────────────────────────────────────────────
export function useInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("inventory").select("*").order("name");
    if (error) setError(error);
    else {
      setInventory(data.map(i => ({
        id: i.sku, dbId: i.id, name: i.name, category: i.category,
        qty: Number(i.qty), unit: i.unit, minQty: Number(i.min_qty),
        cost: Number(i.cost), vendor: i.vendor,
      })));
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addItem = useCallback(async (item) => {
    const { error } = await supabase.from("inventory").insert({
      sku: item.sku, name: item.name, category: item.category,
      qty: Number(item.qty) || 0, unit: item.unit || "pcs",
      min_qty: Number(item.minQty) || 0, cost: Number(item.cost) || 0, vendor: item.vendor,
    });
    if (error) throw error;
    await refresh();
  }, [refresh]);

  return { inventory, loading, error, refresh, addItem };
}

// ── STAFF (tailors + staff, from profiles) ───────────────────────────
export function useStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("staff_summary").select("*").order("full_name");
    if (error) setError(error);
    else {
      setStaff(data.map(s => ({
        id: s.id, name: s.full_name, role: s.pay_type === "piece_rate" ? "Tailor" : "Staff",
        salary: s.salary ? Number(s.salary) : null,
        pieceRate: s.piece_rate ? Number(s.piece_rate) : null,
        status: s.today_status, activeOrders: Number(s.active_orders),
      })));
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { staff, loading, error, refresh };
}

// ── ATTENDANCE (today) ────────────────────────────────────────────
export function useTodayAttendance() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from("attendance")
      .select("*, profiles(full_name)")
      .eq("work_date", today);
    setRows(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const clockIn = useCallback(async (staffId, status = "present") => {
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.from("attendance").upsert({
      staff_id: staffId, work_date: today, status, clock_in: new Date().toISOString(),
    }, { onConflict: "staff_id,work_date" });
    if (error) throw error;
    await refresh();
  }, [refresh]);

  return { rows, loading, refresh, clockIn };
}

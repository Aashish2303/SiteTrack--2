import React, { useState } from 'react';
import { Card, Badge, PBar, Btn, Lbl, Inp, Sel } from './UI';
import { today, uid, fmtD, fmtN, fmtINR } from '../utils';
import { UNITS, canSeeFinance } from '../constants';

export function MaterialOrders({ user, projects, orders, setOrders, vendorDB, showToast }: any) {
  const known = [...new Set([...(vendorDB || []).map((v: any) => v.company)])];
  const em = { vendor: known[0] || "", projectId: projects[0]?.id || "", material: "", date: today(), poNumber: "", orderedQty: 0, unit: "MT", rate: 0, billStatus: "Pending", payStatus: "Pending", remarks: "", deliveries: [] };
  const [form, setForm] = useState(em);
  const [open, setOpen] = useState(false);
  const [delForm, setDelForm] = useState<any>({});
  
  const showMoney = canSeeFinance(user.role);
  const s = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.material || !form.orderedQty) return showToast("Enter material & quantity", "error");
    setOrders((d: any) => [{ ...form, id: uid(), orderedQty: +form.orderedQty, rate: +form.rate, projectId: +form.projectId, deliveries: [], createdAt: Date.now() }, ...d]);
    setForm(em);
    setOpen(false);
    showToast("Order created!");
  };

  const addDelivery = (oid: number) => {
    const d = delForm[oid] || {};
    if (!d.qty) return showToast("Enter delivery qty", "error");
    setOrders((os: any) => os.map((o: any) => {
      if (o.id !== oid) return o;
      const recd = (o.deliveries || []).reduce((a: any, x: any) => a + x.qty, 0) + (+d.qty);
      const newDels = [...(o.deliveries || []), { id: uid(), date: d.date || today(), qty: +d.qty, dcNumber: d.dcNumber || "" }];
      const complete = recd >= o.orderedQty;
      return { ...o, deliveries: newDels, billStatus: complete ? "Complete" : "Partial" };
    }));
    setDelForm((f: any) => ({ ...f, [oid]: {} }));
    showToast("Delivery recorded!");
  };

  const setDF = (oid: number, k: string, v: any) => setDelForm((f: any) => ({ ...f, [oid]: { ...(f[oid] || {}), [k]: v } }));

  return (
    <div className="fadeIn">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div><div style={{ fontSize: 26, fontWeight: 800 }}>Material Orders & Deliveries</div><div style={{ color: "var(--t2)", fontSize: 13, marginTop: 3 }}>Track partial deliveries against single PO · Ordered vs Received vs Pending</div></div>
        <Btn onClick={() => setOpen(!open)} icon={open ? "ti-x" : "ti-plus"}>{open ? "Close" : "New Order"}</Btn>
      </div>

      {open && (
        <Card style={{ borderColor: "var(--acc)", marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>New Purchase Order</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <div><Lbl>Vendor</Lbl><Sel value={form.vendor} onChange={(e: any) => s("vendor", e.target.value)}>{known.length === 0 && <option value="">Add vendors first</option>}{known.map((v: any) => <option key={v}>{v}</option>)}</Sel></div>
            <div><Lbl>Project</Lbl><Sel value={form.projectId} onChange={(e: any) => s("projectId", +e.target.value)}>{projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}</Sel></div>
            <div><Lbl>PO Number</Lbl><Inp value={form.poNumber} onChange={(e: any) => s("poNumber", e.target.value)} /></div>
            <div><Lbl>Material</Lbl><Inp value={form.material} onChange={(e: any) => s("material", e.target.value)} placeholder="e.g. Steel TMT Fe500" /></div>
            <div><Lbl>Ordered Qty</Lbl><Inp type="number" value={form.orderedQty} onChange={(e: any) => s("orderedQty", e.target.value)} /></div>
            <div><Lbl>Unit</Lbl><Inp list="units" value={form.unit} onChange={(e: any) => s("unit", e.target.value)} placeholder="Type or select..." />
              <datalist id="units">{UNITS.map(u => <option key={u} value={u} />)}</datalist>
            </div>
            {showMoney && <div><Lbl>Rate ₹</Lbl><Inp type="number" value={form.rate} onChange={(e: any) => s("rate", e.target.value)} /></div>}
            <div><Lbl>Payment Status</Lbl><Sel value={form.payStatus} onChange={(e: any) => s("payStatus", e.target.value)}><option>Pending</option><option>Partial</option><option>Paid</option></Sel></div>
            <div><Lbl>Remarks</Lbl><Inp value={form.remarks} onChange={(e: any) => s("remarks", e.target.value)} /></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <Btn onClick={save} icon="ti-device-floppy">Create Order</Btn>
            <Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {orders.length === 0 && <Card><div style={{ textAlign: "center", padding: 30, color: "var(--t3)" }}><i className="ti ti-truck-delivery" style={{ fontSize: 40, display: "block", marginBottom: 10 }} />No orders yet</div></Card>}
        {orders.map((o: any) => {
          const recd = (o.deliveries || []).reduce((a: any, d: any) => a + d.qty, 0);
          const pending = o.orderedQty - recd;
          const pct = o.orderedQty > 0 ? Math.round(recd / o.orderedQty * 100) : 0;
          const c = pct >= 100 ? "#10b981" : pct >= 50 ? "#fbbf24" : "#fb923c";
          const p = projects.find((x: any) => x.id === o.projectId);
          const df = delForm[o.id] || {};
          return (
            <Card key={o.id} style={{ borderLeft: "4px solid " + c }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: 16 }}>{o.material}</span>
                    <Badge text={o.billStatus} color={o.billStatus === "Complete" ? "#10b981" : "#fbbf24"} />
                    <Badge text={"Pay: " + o.payStatus} color={o.payStatus === "Paid" ? "#10b981" : o.payStatus === "Partial" ? "#fbbf24" : "#ef4444"} />
                  </div>
                  <div style={{ fontSize: 12, color: "var(--t3)" }}>{o.vendor} · {p?.name?.split(" - ")[0] || "-"} · {o.poNumber || "No PO"} · {fmtD(o.date)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: c }}>{pct}%</div>
                  <div style={{ fontSize: 10, color: "var(--t3)", fontWeight: 700 }}>RECEIVED</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 14 }}>
                <div style={{ background: "var(--s2)", borderRadius: 8, padding: "10px 12px" }}><div style={{ fontSize: 9, color: "var(--t3)", fontWeight: 700 }}>ORDERED</div><div style={{ fontWeight: 800, fontSize: 16 }}>{fmtN(o.orderedQty)} {o.unit}</div></div>
                <div style={{ background: "var(--s2)", borderRadius: 8, padding: "10px 12px" }}><div style={{ fontSize: 9, color: "var(--t3)", fontWeight: 700 }}>RECEIVED</div><div style={{ fontWeight: 800, fontSize: 16, color: "#10b981" }}>{fmtN(recd)} {o.unit}</div></div>
                <div style={{ background: "var(--s2)", borderRadius: 8, padding: "10px 12px" }}><div style={{ fontSize: 9, color: "var(--t3)", fontWeight: 700 }}>PENDING</div><div style={{ fontWeight: 800, fontSize: 16, color: pending > 0 ? "#ef4444" : "#10b981" }}>{fmtN(pending)} {o.unit}</div></div>
                {showMoney && <div style={{ background: "var(--s2)", borderRadius: 8, padding: "10px 12px" }}><div style={{ fontSize: 9, color: "var(--t3)", fontWeight: 700 }}>PO VALUE</div><div style={{ fontWeight: 800, fontSize: 16, color: "#fb923c" }}>{fmtINR(o.orderedQty * o.rate)}</div></div>}
              </div>

              <div style={{ marginBottom: 12 }}><PBar pct={pct} h={8} color={c} /></div>

              {(o.deliveries || []).length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t3)", marginBottom: 8 }}>DELIVERY HISTORY ({o.deliveries.length})</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {o.deliveries.map((d: any, di: number) => (
                      <div key={di} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 12px", background: "var(--s2)", borderRadius: 8, fontSize: 12 }}>
                        <i className="ti ti-truck" style={{ color: "#10b981" }} /><span style={{ fontWeight: 700 }}>Delivery {di + 1}</span>
                        <span style={{ color: "#10b981", fontWeight: 700 }}>{fmtN(d.qty)} {o.unit}</span>
                        <span style={{ color: "var(--t3)" }}>{fmtD(d.date)}</span>{d.dcNumber && <span style={{ color: "var(--t3)" }}>DC: {d.dcNumber}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pending > 0 && (
                <div style={{ display: "flex", gap: 10, alignItems: "end", padding: 12, background: "var(--s2)", borderRadius: 8, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 100 }}><Lbl>Delivery Qty</Lbl><Inp type="number" value={df.qty || ""} onChange={(e: any) => setDF(o.id, "qty", e.target.value)} placeholder={"Max " + pending} /></div>
                  <div style={{ flex: 1, minWidth: 100 }}><Lbl>Date</Lbl><Inp type="date" value={df.date || today()} onChange={(e: any) => setDF(o.id, "date", e.target.value)} /></div>
                  <div style={{ flex: 1, minWidth: 100 }}><Lbl>DC Number</Lbl><Inp value={df.dcNumber || ""} onChange={(e: any) => setDF(o.id, "dcNumber", e.target.value)} /></div>
                  <Btn sm variant="success" onClick={() => addDelivery(o.id)} icon="ti-plus">Record Delivery</Btn>
                </div>
              )}
              {pending <= 0 && <div style={{ padding: "8px 14px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8, color: "#10b981", fontSize: 12, fontWeight: 700, textAlign: "center" }}>✓ Order fully delivered</div>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

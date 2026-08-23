import React, { useState } from 'react';
import { Card, Badge, PBar, Btn, Lbl, Inp, Sel, TH, TD } from './UI';
import { uid, fmtN, fmtINR } from '../utils';
import { UNITS } from '../constants';

export function BOQView({ user, projects, boq, setBoq, showToast }: any) {
  const [selP, setSelP] = useState(0);
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [addExtra, setAddExtra] = useState(false);
  const [extraForm, setExtraForm] = useState({ item: "", unit: "Cum", boqQty: 0, rate: 0 });
  
  const filtered = selP ? projects.filter((p: any) => p.id === selP) : projects;
  const canEdit = user.role === "qms" || user.role === "md" || user.role === "admin";

  const saveEdit = (id: number) => {
    setBoq((b: any) => b.map((it: any) => it.id === id ? { ...it, ...editData, boqQty: +editData.boqQty, rate: +editData.rate } : it));
    setEditId(null);
    showToast("BOQ item updated!");
  };

  const saveExtra = () => {
    if (!extraForm.item || !selP) return showToast("Select project and enter item", "error");
    setBoq((b: any) => [...b, { id: uid(), projectId: +selP, ...extraForm, boqQty: +extraForm.boqQty, rate: +extraForm.rate, cumDone: 0, isExtra: true }]);
    setExtraForm({ item: "", unit: "Cum", boqQty: 0, rate: 0 });
    setAddExtra(false);
    showToast("Extra item added!");
  };

  return (
    <div className="fadeIn">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div><div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>BOQ Tracker</div><div style={{ color: "var(--t2)", fontSize: 13, marginTop: 3, display: "flex", alignItems: "center", gap: 6 }}><i className="ti ti-bolt" style={{ color: "#10b981" }} />Live from DPR · Editable · Extra Items supported</div></div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Sel value={selP} onChange={(e: any) => setSelP(+e.target.value)}>
            <option value={0}>All Projects</option>
            {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Sel>
          {canEdit && selP > 0 && <Btn sm variant="warn" icon="ti-plus" onClick={() => setAddExtra(!addExtra)}>Add Extra Item</Btn>}
        </div>
      </div>

      {addExtra && canEdit && selP > 0 && (
        <Card style={{ borderColor: "#fbbf24", marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#fbbf24", marginBottom: 12 }}><i className="ti ti-star" /> Add Extra Item (not in original BOQ — client variation)</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14 }}>
            <div><Lbl>Item Description</Lbl><Inp value={extraForm.item} onChange={(e: any) => setExtraForm({ ...extraForm, item: e.target.value })} placeholder="e.g. Extra - Granite Flooring" /></div>
            <div><Lbl>Unit</Lbl><Sel value={extraForm.unit} onChange={(e: any) => setExtraForm({ ...extraForm, unit: e.target.value })}>{UNITS.map(u => <option key={u}>{u}</option>)}</Sel></div>
            <div><Lbl>Quantity</Lbl><Inp type="number" value={extraForm.boqQty} onChange={(e: any) => setExtraForm({ ...extraForm, boqQty: e.target.value })} /></div>
            <div><Lbl>Rate (₹)</Lbl><Inp type="number" value={extraForm.rate} onChange={(e: any) => setExtraForm({ ...extraForm, rate: e.target.value })} /></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <Btn variant="warn" icon="ti-plus" onClick={saveExtra}>Add Extra Item</Btn>
            <Btn variant="ghost" onClick={() => setAddExtra(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      {filtered.map((p: any) => {
        const items = boq.filter((b: any) => b.projectId === p.id && !b.isExtra);
        const extraItems = boq.filter((b: any) => b.projectId === p.id && b.isExtra);
        if (!items.length && !extraItems.length) return null;
        
        const totalV = items.reduce((s: any, i: any) => s + i.boqQty * i.rate, 0);
        const doneV = items.reduce((s: any, i: any) => s + i.cumDone * i.rate, 0);
        const ov = items.length ? Math.round(items.reduce((s: any, i: any) => s + i.cumDone, 0) / items.reduce((s: any, i: any) => s + i.boqQty, 0) * 100) : 0;
        const c = ov >= 80 ? "#10b981" : ov >= 50 ? "#fbbf24" : "#fb923c";
        
        const renderRow = (it: any) => {
          const pct = it.boqQty > 0 ? Math.round(it.cumDone / it.boqQty * 100) : 0;
          const bal = it.boqQty - it.cumDone;
          const c2 = pct >= 100 ? "#10b981" : pct >= 60 ? "#fbbf24" : "#ef4444";
          const isEditing = editId === it.id;
          
          return (
            <tr key={it.id} style={{ background: it.isExtra ? "rgba(251,191,36,0.04)" : "inherit" }}>
              {isEditing ? (
                <>
                  <td style={{ padding: "8px 13px", borderBottom: "1px solid var(--br)" }}><input value={editData.item || it.item} onChange={e => setEditData({ ...editData, item: e.target.value })} style={{ background: "var(--s2)", border: "1px solid var(--acc)", borderRadius: 6, padding: "6px 10px", fontSize: 12, width: "100%", color: "var(--t1)" }} /></td>
                  <td style={{ padding: "8px 13px", borderBottom: "1px solid var(--br)" }}><Sel value={editData.unit || it.unit} onChange={(e: any) => setEditData({ ...editData, unit: e.target.value })}>{UNITS.map(u => <option key={u}>{u}</option>)}</Sel></td>
                  <td style={{ padding: "8px 13px", borderBottom: "1px solid var(--br)" }}><input type="number" value={editData.boqQty !== undefined ? editData.boqQty : it.boqQty} onChange={e => setEditData({ ...editData, boqQty: e.target.value })} style={{ background: "var(--s2)", border: "1px solid var(--acc)", borderRadius: 6, padding: "6px 10px", fontSize: 12, width: "80px", color: "var(--t1)" }} /></td>
                  <TD mono bold color="#10b981">{fmtN(it.cumDone)}</TD>
                  <TD mono bold color={bal > 0 ? "#ef4444" : "var(--t3)"}>{fmtN(bal)}</TD>
                  <td style={{ padding: "8px 13px", borderBottom: "1px solid var(--br)" }}><input type="number" value={editData.rate !== undefined ? editData.rate : it.rate} onChange={e => setEditData({ ...editData, rate: e.target.value })} style={{ background: "var(--s2)", border: "1px solid var(--acc)", borderRadius: 6, padding: "6px 10px", fontSize: 12, width: "100px", color: "var(--t1)" }} /></td>
                  <TD mono bold color="#fb923c">{fmtINR((editData.rate || it.rate) * (editData.boqQty || it.boqQty))}</TD>
                  <td style={{ padding: "8px 13px", borderBottom: "1px solid var(--br)" }}><div style={{ display: "flex", gap: 6 }}><Btn sm variant="success" onClick={() => saveEdit(it.id)} icon="ti-check" /><Btn sm variant="ghost" onClick={() => setEditId(null)} icon="ti-x" /></div></td>
                </>
              ) : (
                <>
                  <TD bold>{it.isExtra ? <span style={{ color: "#fbbf24" }}>⭐ {it.item}</span> : it.item}</TD>
                  <TD color="var(--t2)">{it.unit}</TD>
                  <TD mono>{fmtN(it.boqQty)}</TD>
                  <TD mono bold color="#10b981">{fmtN(it.cumDone)}</TD>
                  <TD mono bold color={bal > 0 ? "#ef4444" : "var(--t3)"}>{fmtN(bal)}</TD>
                  <TD mono>{fmtINR(it.rate)}</TD>
                  <TD mono bold color="#fb923c">{fmtINR(it.cumDone * it.rate)}</TD>
                  <td style={{ padding: "11px 13px", borderBottom: "1px solid var(--br)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 80 }}><PBar pct={pct} color={c2} /></div>
                      <span style={{ fontWeight: 700, color: c2, fontSize: 12, minWidth: 36 }}>{pct}%</span>
                      {canEdit && <button onClick={() => { setEditId(it.id); setEditData({ item: it.item, unit: it.unit, boqQty: it.boqQty, rate: it.rate }); }} style={{ background: "transparent", border: "none", color: "var(--t3)", cursor: "pointer", padding: "2px 6px" }}><i className="ti ti-edit" style={{ fontSize: 12 }} /></button>}
                    </div>
                  </td>
                </>
              )}
            </tr>
          );
        };
        
        return (
          <Card key={p.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
              <div><div style={{ fontWeight: 800, fontSize: 16 }}>{p.name}</div><div style={{ fontSize: 12, color: "var(--t3)" }}>{p.location} · {items.length} BOQ items{extraItems.length ? ` · ${extraItems.length} extra` : ""}</div></div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ textAlign: "right" }}><div style={{ fontSize: 10, color: "var(--t3)", fontWeight: 700 }}>DONE / TOTAL</div><div style={{ fontWeight: 700, fontSize: 13, color: "#fb923c" }}>{fmtINR(doneV)} / {fmtINR(totalV)}</div></div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 140 }}><PBar pct={ov} h={10} color={c} /></div><div style={{ fontWeight: 900, fontSize: 22, color: c }}>{ov}%</div></div>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["Work Item", "Unit", "BOQ Qty", "Completed", "Balance", "Rate", "Done Value", "Progress & Edit"].map(h => <TH key={h} c={h} />)}</tr></thead>
                <tbody>
                  {items.map(renderRow)}
                  {extraItems.length > 0 && <tr><td colSpan={8} style={{ padding: "8px 13px", background: "rgba(251,191,36,0.08)", fontSize: 11, fontWeight: 700, color: "#fbbf24", letterSpacing: "0.05em" }}>⭐ EXTRA ITEMS (Client Variations — not in original BOQ)</td></tr>}
                  {extraItems.map(renderRow)}
                </tbody>
              </table>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

import React, { useState } from 'react';
import { Card, Badge, PBar, Btn, Lbl, Inp, Sel, TH, TD } from './UI';
import { today, uid, fmtD } from '../utils';
import { SUBCONS, ENGINEERS, INCHARGES, WORK_STATUSES, WORK_CATEGORIES } from '../constants';

export function DPRView({ user, projects, dpr, setDpr, boq, setBoq, showToast }: any) {
  const em = { date: today(), projectId: projects[0]?.id || "", boqId: "", description: "", location: "", category: WORK_CATEGORIES[0], pct: 0, qtyDone: 0, subcon: SUBCONS[0], engineer: user.role === "engineer" ? user.name : ENGINEERS[0], incharge: INCHARGES[0], reason: "", workStatus: "Completed", carryForward: false };
  const [form, setForm] = useState(em);
  const [open, setOpen] = useState(false);

  const s = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const canAdd = user.role === "engineer" || user.role === "qms";
  const projectBoq = boq.filter((b: any) => b.projectId === Number(form.projectId));

  const save = () => {
    if (!form.boqId) return showToast("Select a BOQ item", "error");
    const pct = Number(form.pct), qtyDone = Number(form.qtyDone);
    const item = boq.find((b: any) => b.id === Number(form.boqId));
    setDpr((d: any) => [{ ...form, id: uid(), pct, qtyDone, projectId: +form.projectId, boqId: +form.boqId, createdAt: Date.now() }, ...d]);
    if (item && qtyDone > 0) setBoq((b: any) => b.map((it: any) => it.id === Number(form.boqId) ? { ...it, cumDone: Math.min(it.boqQty, it.cumDone + qtyDone) } : it));
    setForm(em);
    setOpen(false);
    showToast(`DPR saved! "${item?.item}" BOQ updated.`);
  };

  return (
    <div className="fadeIn">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div><div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>Daily Progress Report</div><div style={{ color: "var(--t2)", fontSize: 13, marginTop: 3, display: "flex", alignItems: "center", gap: 6 }}><i className="ti ti-bolt" style={{ color: "#10b981" }} />Saving auto-updates BOQ · Supports carry-forward tracking</div></div>
        {canAdd && <Btn variant="success" onClick={() => setOpen(!open)} icon={open ? "ti-x" : "ti-plus"}>{open ? "Close" : "Add Progress"}</Btn>}
      </div>

      {open && (
        <Card style={{ borderColor: "#10b981" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <div><Lbl>Date</Lbl><Inp type="date" value={form.date} onChange={(e: any) => s("date", e.target.value)} /></div>
            <div><Lbl>Project</Lbl><Sel value={form.projectId} onChange={(e: any) => { s("projectId", +e.target.value); s("boqId", ""); }}>{projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}</Sel></div>
            <div><Lbl>BOQ Item (auto-updates)</Lbl><Sel value={form.boqId} onChange={(e: any) => { const it = boq.find((b: any) => b.id === +e.target.value); s("boqId", +e.target.value); if (it) s("description", it.item); }}>
              <option value="">-- Select BOQ item --</option>
              {projectBoq.filter((b: any) => !b.isExtra).map((b: any) => <option key={b.id} value={b.id}>{b.item} ({b.cumDone}/{b.boqQty} done)</option>)}
              {projectBoq.filter((b: any) => b.isExtra).length > 0 && <optgroup label="── Extra Items ──">{projectBoq.filter((b: any) => b.isExtra).map((b: any) => <option key={b.id} value={b.id}>⭐ {b.item} ({b.cumDone}/{b.boqQty} done)</option>)}</optgroup>}
            </Sel></div>
            <div><Lbl>Qty Done Today</Lbl><Inp type="number" value={form.qtyDone} onChange={(e: any) => s("qtyDone", e.target.value)} /></div>
            <div><Lbl>Location</Lbl><Inp value={form.location} onChange={(e: any) => s("location", e.target.value)} /></div>
            <div><Lbl>Category of Work</Lbl><Sel value={form.category} onChange={(e: any) => s("category", e.target.value)}>{WORK_CATEGORIES.map(c => <option key={c}>{c}</option>)}</Sel></div>
            <div><Lbl>Work Status</Lbl><Sel value={form.workStatus} onChange={(e: any) => s("workStatus", e.target.value)}>{WORK_STATUSES.map(x => <option key={x}>{x}</option>)}</Sel></div>
            <div style={{ gridColumn: "span 3" }}><Lbl>% Work Done: <span style={{ color: "#10b981", fontWeight: 800 }}>{form.pct}%</span></Lbl><input type="range" min={0} max={100} step={5} value={form.pct} onChange={e => s("pct", e.target.value)} style={{ width: "100%", accentColor: "#10b981", marginTop: 6, height: 6 }} /></div>
            <div><Lbl>Subcontractor</Lbl><Sel value={form.subcon} onChange={(e: any) => s("subcon", e.target.value)}>{SUBCONS.map(x => <option key={x}>{x}</option>)}</Sel></div>
            <div><Lbl>Site Engineer</Lbl><Sel value={form.engineer} onChange={(e: any) => s("engineer", e.target.value)}>{ENGINEERS.map(x => <option key={x}>{x}</option>)}</Sel></div>
            <div><Lbl>Reason / Carry Forward note</Lbl><Inp value={form.reason} onChange={(e: any) => s("reason", e.target.value)} placeholder="If delayed/not completed..." /></div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 20 }}>
              <input type="checkbox" id="cfd" checked={form.carryForward} onChange={(e: any) => s("carryForward", e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--acc)" }} />
              <label htmlFor="cfd" style={{ fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><i className="ti ti-arrow-forward-up" style={{ color: "#fbbf24" }} />Mark as Carry Forward</label>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Btn variant="success" onClick={save} icon="ti-device-floppy">Save & Update BOQ</Btn>
            <Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
            <thead><tr>{["#", "Date", "Project", "Description", "Category", "% Done", "Qty Done", "Status", "CF", "Engineer", "Reason"].map(h => <TH key={h} c={h} />)}</tr></thead>
            <tbody>
              {dpr.length === 0 && <tr><td colSpan={11} style={{ textAlign: "center", padding: 40, color: "var(--t3)" }}>No DPR entries yet</td></tr>}
              {dpr.map((r: any, i: number) => {
                const p = projects.find((x: any) => x.id === r.projectId);
                const c = r.pct >= 80 ? "#10b981" : r.pct >= 50 ? "#fbbf24" : "#ef4444";
                const isCF = r.carryForward;
                return (
                  <tr key={r.id} style={{ background: isCF ? "rgba(251,191,36,0.04)" : "inherit" }}>
                    <TD mono color="var(--t3)">{String(i + 1).padStart(2, "0")}</TD><TD>{fmtD(r.date)}</TD><TD bold>{p?.name || "-"}</TD><TD>{r.description}</TD>
                    <TD>{r.category ? <Badge text={r.category} color="#3b82f6" /> : "—"}</TD>
                    <td style={{ padding: "11px 13px", borderBottom: "1px solid var(--br)" }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 70 }}><PBar pct={r.pct} color={c} /></div><span style={{ fontWeight: 700, color: c, fontSize: 12 }}>{r.pct}%</span></div></td>
                    <TD bold mono>{r.qtyDone}</TD>
                    <TD><Badge text={r.workStatus || "—"} color={r.workStatus === "Completed" ? "#10b981" : r.workStatus === "Delayed - Carry Forward" ? "#fbbf24" : "var(--t3)"} /></TD>
                    <TD>{isCF ? <Badge text="CARRY FWD" color="#fbbf24" icon="ti-arrow-forward-up" /> : "—"}</TD>
                    <TD>{r.engineer}</TD><TD color="var(--t3)">{r.reason || "—"}</TD>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

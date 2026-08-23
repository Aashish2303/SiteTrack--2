import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Card, Badge, Btn, Lbl, Inp, Sel, TH, TD } from './UI';
import { today, uid, fmtD } from '../utils';
import { SUBCONS, ENGINEERS, INCHARGES, WORK_STATUSES } from '../constants';

export function DWRView({ user, projects, dwr, setDwr, showToast }: any) {
  const em = { date: today(), projectId: projects[0]?.id || "", description: "", location: "", quantity: "", subcon: SUBCONS[0], engineer: user.role === "engineer" ? user.name : ENGINEERS[0], incharge: INCHARGES[0], remarks: "", workStatus: "Completed", carryForward: false };
  const [form, setForm] = useState(em);
  const [open, setOpen] = useState(false);

  const s = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const canAdd = user.role === "engineer" || user.role === "qms";

  const save = () => {
    if (!form.description || !form.location) return showToast("Fill Description & Location", "error");
    setDwr((d: any) => [{ ...form, id: uid(), projectId: +form.projectId, createdAt: Date.now() }, ...d]);
    setForm(em);
    setOpen(false);
    showToast("DWR saved!");
  };

  const exportXLS = () => {
    const ws = XLSX.utils.json_to_sheet(dwr.map((r: any, i: number) => ({
      "#": i + 1,
      Date: r.date,
      Project: projects.find((p: any) => p.id === r.projectId)?.name || "-",
      Description: r.description,
      Location: r.location,
      Quantity: r.quantity,
      Subcontractor: r.subcon,
      Engineer: r.engineer,
      Incharge: r.incharge,
      "Work Status": r.workStatus || "",
      "Carry Forward": r.carryForward ? "Yes" : "No",
      Remarks: r.remarks
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DWR");
    XLSX.writeFile(wb, "DWR.xlsx");
  };

  const exportPDF = () => {
    const html = `<!DOCTYPE html><html><head><title>DWR</title><style>body{font-family:Arial;padding:20px}h1{color:#fb923c}table{width:100%;border-collapse:collapse;font-size:11px}th{background:#fb923c;color:#fff;padding:6px}td{padding:5px;border:1px solid #ddd}</style></head><body><h1>Daily Work Report</h1><p>Date: ${new Date().toLocaleDateString("en-IN")}</p><table><thead><tr><th>#</th><th>Date</th><th>Project</th><th>Description</th><th>Location</th><th>Qty</th><th>Status</th><th>CF</th><th>Engineer</th></tr></thead><tbody>${dwr.map((r: any, i: number) => `<tr><td>${i + 1}</td><td>${r.date}</td><td>${projects.find((p: any) => p.id === r.projectId)?.name || "-"}</td><td>${r.description}</td><td>${r.location}</td><td>${r.quantity}</td><td>${r.workStatus || "-"}</td><td>${r.carryForward ? "✓" : "-"}</td><td>${r.engineer}</td></tr>`).join("")}</tbody></table></body></html>`;
    const w = window.open("", "_blank");
    w?.document.write(html);
    w?.document.close();
    setTimeout(() => w?.print(), 300);
  };

  return (
    <div className="fadeIn">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div><div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>Daily Work Report</div><div style={{ color: "var(--t2)", fontSize: 13, marginTop: 3 }}>Plan work · Track status · Mark carry-forward</div></div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" icon="ti-file-spreadsheet" sm onClick={exportXLS}>Excel</Btn>
          <Btn variant="ghost" icon="ti-file-type-pdf" sm onClick={exportPDF}>PDF</Btn>
          {canAdd && <Btn onClick={() => setOpen(!open)} icon={open ? "ti-x" : "ti-plus"}>{open ? "Close" : "Add Work"}</Btn>}
        </div>
      </div>

      {open && (
        <Card style={{ borderColor: "var(--acc)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <div><Lbl>Date</Lbl><Inp type="date" value={form.date} onChange={(e: any) => s("date", e.target.value)} /></div>
            <div><Lbl>Project</Lbl><Sel value={form.projectId} onChange={(e: any) => s("projectId", +e.target.value)}>{projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}</Sel></div>
            <div><Lbl>Description of Work</Lbl><Inp value={form.description} onChange={(e: any) => s("description", e.target.value)} placeholder="e.g. RCC Column Casting" /></div>
            <div><Lbl>Location on Site</Lbl><Inp value={form.location} onChange={(e: any) => s("location", e.target.value)} placeholder="e.g. 3rd Floor, Grid A" /></div>
            <div><Lbl>Quantity</Lbl><Inp value={form.quantity} onChange={(e: any) => s("quantity", e.target.value)} placeholder="e.g. 45 Cum" /></div>
            <div><Lbl>Subcontractor</Lbl><Inp list="subcons" value={form.subcon} onChange={(e: any) => s("subcon", e.target.value)} placeholder="Type or select..." />
              <datalist id="subcons">{SUBCONS.map(x => <option key={x} value={x} />)}</datalist>
            </div>
            <div><Lbl>Site Engineer</Lbl><Sel value={form.engineer} onChange={(e: any) => s("engineer", e.target.value)} disabled={user.role === 'engineer'}>{ENGINEERS.map(x => <option key={x}>{x}</option>)}</Sel></div>
            <div><Lbl>Site Incharge</Lbl><Sel value={form.incharge} onChange={(e: any) => s("incharge", e.target.value)}>{INCHARGES.map(x => <option key={x}>{x}</option>)}</Sel></div>
            <div><Lbl>Work Status</Lbl><Sel value={form.workStatus} onChange={(e: any) => s("workStatus", e.target.value)}>{WORK_STATUSES.map(x => <option key={x}>{x}</option>)}</Sel></div>
            <div><Lbl>Remarks</Lbl><Inp value={form.remarks} onChange={(e: any) => s("remarks", e.target.value)} /></div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 20 }}>
              <input type="checkbox" id="cf" checked={form.carryForward} onChange={(e: any) => s("carryForward", e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--acc)" }} />
              <label htmlFor="cf" style={{ fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><i className="ti ti-arrow-forward-up" style={{ color: "#fbbf24" }} />Mark as Carry Forward</label>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Btn onClick={save} icon="ti-device-floppy">Save</Btn>
            <Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead><tr>{["#", "Date", "Project", "Description", "Location", "Qty", "Status", "CF", "Engineer", "Remarks"].map(h => <TH key={h} c={h} />)}</tr></thead>
            <tbody>
              {dwr.length === 0 && <tr><td colSpan={10} style={{ textAlign: "center", padding: 40, color: "var(--t3)" }}>No entries yet</td></tr>}
              {dwr.map((r: any, i: number) => {
                const p = projects.find((x: any) => x.id === r.projectId);
                const isCF = r.carryForward;
                return (
                  <tr key={r.id} style={{ background: isCF ? "rgba(251,146,60,0.05)" : "inherit" }}>
                    <TD mono color="var(--t3)">{String(i + 1).padStart(2, "0")}</TD>
                    <TD><span style={{ background: "var(--s2)", padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600 }}>{fmtD(r.date)}</span></TD>
                    <TD bold>{p?.name || "-"}</TD><TD>{r.description}</TD><TD>{r.location}</TD><TD bold color="#fb923c">{r.quantity}</TD>
                    <TD><Badge text={r.workStatus || "—"} color={r.workStatus === "Completed" ? "#10b981" : r.workStatus === "Delayed - Carry Forward" ? "#fbbf24" : "var(--t3)"} /></TD>
                    <TD>{isCF ? <Badge text="CARRY FWD" color="#fbbf24" icon="ti-arrow-forward-up" /> : "—"}</TD>
                    <TD>{r.engineer}</TD><TD color="var(--t3)">{r.remarks || "—"}</TD>
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

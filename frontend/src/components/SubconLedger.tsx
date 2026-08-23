import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Card, Badge, Btn, Lbl, Inp, Sel, TH, TD } from './UI';
import { today, uid, fmtD, fmtINR } from '../utils';
import { SUBCONS } from '../constants';

export function SubconLedger({ user, projects, subconLedger, setSubconLedger, showToast }: any) {
  const em = { subcon: SUBCONS[0], projectId: projects[0]?.id || "", date: today(), type: "Work Order", description: "", amount: 0, paid: 0, woNumber: "", remarks: "" };
  const [form, setForm] = useState(em);
  const [open, setOpen] = useState(false);

  const s = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const canAdd = user.role === "md" || user.role === "qms" || user.role === "admin" || user.role === "accounts";

  const save = () => {
    if (!form.description) return showToast("Enter description", "error");
    setSubconLedger((d: any) => [{ ...form, id: uid(), amount: +form.amount, paid: +form.paid, projectId: +form.projectId, createdAt: Date.now() }, ...d]);
    setForm(em);
    setOpen(false);
    showToast("Entry saved!");
  };

  const allSubcons = [...new Set([...SUBCONS, ...subconLedger.map((l: any) => l.subcon)])];
  const summary = allSubcons.filter(sc => subconLedger.some((l: any) => l.subcon === sc)).map(sc => {
    const entries = subconLedger.filter((l: any) => l.subcon === sc);
    return { subcon: sc, total: entries.reduce((s: any, l: any) => s + l.amount, 0), paid: entries.reduce((s: any, l: any) => s + l.paid, 0), entries };
  });

  const exportXLS = () => {
    const ws = XLSX.utils.json_to_sheet(subconLedger.map((l: any, i: number) => ({ "#": i + 1, Date: l.date, Subcontractor: l.subcon, Project: projects.find((p: any) => p.id === l.projectId)?.name || "-", Type: l.type, "WO/PO No": l.woNumber, Description: l.description, "Total Amount": l.amount, "Paid": l.paid, "Balance": l.amount - l.paid, Remarks: l.remarks })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Subcon Ledger");
    XLSX.writeFile(wb, "Subcontractor_Ledger.xlsx");
    showToast("Subcontractor ledger downloaded!");
  };

  return (
    <div className="fadeIn">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div><div style={{ fontSize: 26, fontWeight: 800 }}>Subcontractor Ledger</div><div style={{ color: "var(--t2)", fontSize: 13, marginTop: 3 }}>Work Orders · Payments · Outstanding balances</div></div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" sm icon="ti-file-spreadsheet" onClick={exportXLS}>Export</Btn>
          {canAdd && <Btn onClick={() => setOpen(!open)} icon={open ? "ti-x" : "ti-plus"}>{open ? "Close" : "Add Entry"}</Btn>}
        </div>
      </div>

      {open && canAdd && (
        <Card style={{ borderColor: "var(--acc)", marginBottom: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <div><Lbl>Subcontractor</Lbl><Sel value={form.subcon} onChange={(e: any) => s("subcon", e.target.value)}>{allSubcons.map(sc => <option key={sc as string}>{sc as string}</option>)}</Sel></div>
            <div><Lbl>Project</Lbl><Sel value={form.projectId} onChange={(e: any) => s("projectId", +e.target.value)}>{projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}</Sel></div>
            <div><Lbl>Date</Lbl><Inp type="date" value={form.date} onChange={(e: any) => s("date", e.target.value)} /></div>
            <div><Lbl>Type</Lbl><Sel value={form.type} onChange={(e: any) => s("type", e.target.value)}>{["Work Order", "Running Bill", "Final Bill", "Advance", "Retention Release", "Deduction"].map(t => <option key={t}>{t}</option>)}</Sel></div>
            <div><Lbl>WO / PO Number</Lbl><Inp value={form.woNumber} onChange={(e: any) => s("woNumber", e.target.value)} placeholder="e.g. WO-2025-004" /></div>
            <div><Lbl>Description</Lbl><Inp value={form.description} onChange={(e: any) => s("description", e.target.value)} placeholder="Work description" /></div>
            <div><Lbl>Total Amount (₹)</Lbl><Inp type="number" value={form.amount} onChange={(e: any) => s("amount", e.target.value)} icon="ti-currency-rupee" /></div>
            <div><Lbl>Amount Paid (₹)</Lbl><Inp type="number" value={form.paid} onChange={(e: any) => s("paid", e.target.value)} icon="ti-currency-rupee" /></div>
            <div><Lbl>Remarks</Lbl><Inp value={form.remarks} onChange={(e: any) => s("remarks", e.target.value)} /></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <Btn onClick={save} icon="ti-device-floppy">Save Entry</Btn>
            <Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14, marginBottom: 22 }}>
        {summary.map((sc: any) => {
          const bal = sc.total - sc.paid;
          const pct = sc.total > 0 ? (sc.paid / sc.total * 100) : 0;
          const c = pct >= 100 ? "#10b981" : pct >= 50 ? "#fbbf24" : "#ef4444";
          return (
            <Card key={sc.subcon} style={{ position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 3, background: c }} />
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 3 }}>{sc.subcon}</div>
              <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 12 }}>{sc.entries.length} entries</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                <div><div style={{ fontSize: 9, color: "var(--t3)", fontWeight: 700, letterSpacing: "0.06em" }}>TOTAL WO</div><div style={{ fontWeight: 800, fontSize: 14 }}>{fmtINR(sc.total)}</div></div>
                <div><div style={{ fontSize: 9, color: "var(--t3)", fontWeight: 700, letterSpacing: "0.06em" }}>PAID</div><div style={{ fontWeight: 800, fontSize: 14, color: "#10b981" }}>{fmtINR(sc.paid)}</div></div>
                <div><div style={{ fontSize: 9, color: "var(--t3)", fontWeight: 700, letterSpacing: "0.06em" }}>BALANCE</div><div style={{ fontWeight: 800, fontSize: 14, color: bal > 0 ? "#ef4444" : "#10b981" }}>{fmtINR(bal)}</div></div>
              </div>
              <div style={{ background: "var(--s3)", borderRadius: 6, height: 6, overflow: "hidden" }}><div style={{ width: Math.min(pct, 100) + "%", height: "100%", background: `linear-gradient(90deg, ${c}99, ${c})`, borderRadius: 6 }} /></div>
              <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 4, textAlign: "right" }}>{Math.round(pct)}% paid</div>
            </Card>
          );
        })}
      </div>

      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead><tr>{["Date", "Subcontractor", "Project", "Type", "WO/PO No", "Description", "Total", "Paid", "Balance", "Remarks"].map(h => <TH key={h} c={h} />)}</tr></thead>
            <tbody>
              {subconLedger.length === 0 && <tr><td colSpan={10} style={{ textAlign: "center", padding: 40, color: "var(--t3)" }}>No entries yet</td></tr>}
              {subconLedger.map((l: any, i: number) => {
                const bal = l.amount - l.paid;
                const p = projects.find((x: any) => x.id === l.projectId);
                return (
                  <tr key={l.id} style={{ background: i % 2 === 0 ? "var(--s1)" : "var(--s2)" }}>
                    <TD><span style={{ background: "var(--s2)", padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600 }}>{fmtD(l.date)}</span></TD>
                    <TD bold>{l.subcon}</TD>
                    <TD>{p?.name?.split(" - ")[0] || "-"}</TD>
                    <TD><Badge text={l.type} color={l.type === "Work Order" ? "#3b82f6" : l.type === "Advance" ? "#fbbf24" : "#10b981"} /></TD>
                    <TD mono color="var(--t3)">{l.woNumber || "—"}</TD>
                    <TD>{l.description}</TD>
                    <TD bold mono color="#fb923c">{fmtINR(l.amount)}</TD>
                    <TD bold mono color="#10b981">{fmtINR(l.paid)}</TD>
                    <TD bold mono color={bal > 0 ? "#ef4444" : "#10b981"}>{fmtINR(bal)}</TD>
                    <TD color="var(--t3)">{l.remarks || "—"}</TD>
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

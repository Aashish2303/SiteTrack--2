import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Card, Badge, Btn, Lbl, Inp, Sel, TH, TD } from './UI';
import { today, uid, fmtD, fmtINR } from '../utils';

export function VendorLedger({ user, projects, vendorLedger, setVendorLedger, vendorDB, showToast }: any) {
  const ET = ["Purchase", "Advance", "Return", "Debit Note", "Credit Note"];
  const known = [...new Set([...(vendorDB || []).map((v: any) => v.company), ...vendorLedger.map((l: any) => l.vendor)])];
  const em = { vendor: known[0] || "", projectId: projects[0]?.id || "", date: today(), type: "Purchase", description: "", poNumber: "", amount: 0, invoiceAmount: 0, paid: 0, remarks: "" };
  const [form, setForm] = useState(em);
  const [open, setOpen] = useState(false);

  const s = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  
  const save = () => {
    if (!form.description) return showToast("Enter description", "error");
    setVendorLedger((d: any) => [{ ...form, id: uid(), amount: +form.amount, invoiceAmount: +form.invoiceAmount, paid: +form.paid, projectId: +form.projectId, createdAt: Date.now() }, ...d]);
    setForm(em);
    setOpen(false);
    showToast("Vendor entry saved!");
  };

  const allV = [...new Set(vendorLedger.map((l: any) => l.vendor))];
  const summary = allV.map(v => {
    const e = vendorLedger.filter((l: any) => l.vendor === v);
    return { vendor: v, total: e.reduce((s: any, l: any) => s + l.amount, 0), inv: e.reduce((s: any, l: any) => s + (l.invoiceAmount || 0), 0), paid: e.reduce((s: any, l: any) => s + l.paid, 0), entries: e };
  });

  const exportXLS = () => {
    const ws = XLSX.utils.json_to_sheet(vendorLedger.map((l: any, i: number) => ({ "#": i + 1, Date: l.date, Vendor: l.vendor, Project: projects.find((p: any) => p.id === l.projectId)?.name || "-", Type: l.type, "PO No": l.poNumber, Description: l.description, "PO Amount": l.amount, "Invoice": l.invoiceAmount || 0, Paid: l.paid, Balance: l.amount - l.paid, Remarks: l.remarks })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vendor Ledger");
    XLSX.writeFile(wb, "Material_Vendor_Ledger.xlsx");
    showToast("Exported!");
  };

  return (
    <div className="fadeIn">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div><div style={{ fontSize: 26, fontWeight: 800 }}>Material Vendor Ledger</div><div style={{ color: "var(--t2)", fontSize: 13, marginTop: 3 }}>Purchases · Invoices · Payments · Outstanding to suppliers</div></div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" sm icon="ti-file-spreadsheet" onClick={exportXLS}>Export</Btn>
          <Btn onClick={() => setOpen(!open)} icon={open ? "ti-x" : "ti-plus"}>{open ? "Close" : "Add Entry"}</Btn>
        </div>
      </div>

      {open && (
        <Card style={{ borderColor: "var(--acc)", marginBottom: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <div><Lbl>Vendor</Lbl><Sel value={form.vendor} onChange={(e: any) => s("vendor", e.target.value)}>{known.length === 0 && <option value="">Add vendors in Directory</option>}{known.map((v: any) => <option key={v}>{v}</option>)}</Sel></div>
            <div><Lbl>Project</Lbl><Sel value={form.projectId} onChange={(e: any) => s("projectId", +e.target.value)}>{projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}</Sel></div>
            <div><Lbl>Date</Lbl><Inp type="date" value={form.date} onChange={(e: any) => s("date", e.target.value)} /></div>
            <div><Lbl>Type</Lbl><Sel value={form.type} onChange={(e: any) => s("type", e.target.value)}>{ET.map(t => <option key={t}>{t}</option>)}</Sel></div>
            <div><Lbl>PO Number</Lbl><Inp value={form.poNumber} onChange={(e: any) => s("poNumber", e.target.value)} /></div>
            <div><Lbl>Description</Lbl><Inp value={form.description} onChange={(e: any) => s("description", e.target.value)} /></div>
            <div><Lbl>PO Amount ₹</Lbl><Inp type="number" value={form.amount} onChange={(e: any) => s("amount", e.target.value)} /></div>
            <div><Lbl>Invoice Amount ₹</Lbl><Inp type="number" value={form.invoiceAmount} onChange={(e: any) => s("invoiceAmount", e.target.value)} /></div>
            <div><Lbl>Paid ₹</Lbl><Inp type="number" value={form.paid} onChange={(e: any) => s("paid", e.target.value)} /></div>
            <div style={{ gridColumn: "span 3" }}><Lbl>Remarks</Lbl><Inp value={form.remarks} onChange={(e: any) => s("remarks", e.target.value)} /></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <Btn onClick={save} icon="ti-device-floppy">Save</Btn>
            <Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14, marginBottom: 22 }}>
        {summary.map((v: any) => {
          const bal = v.total - v.paid;
          const pct = v.total > 0 ? v.paid / v.total * 100 : 0;
          const c = pct >= 100 ? "#10b981" : pct >= 50 ? "#fbbf24" : "#ef4444";
          return (
            <Card key={v.vendor} style={{ position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 3, background: c }} />
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 3 }}>{v.vendor}</div>
              <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 12 }}>{v.entries.length} entries</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                <div><div style={{ fontSize: 9, color: "var(--t3)", fontWeight: 700 }}>PO VAL</div><div style={{ fontWeight: 800, fontSize: 12 }}>{fmtINR(v.total)}</div></div>
                <div><div style={{ fontSize: 9, color: "var(--t3)", fontWeight: 700 }}>INVOICE</div><div style={{ fontWeight: 800, fontSize: 12, color: "#a78bfa" }}>{fmtINR(v.inv)}</div></div>
                <div><div style={{ fontSize: 9, color: "var(--t3)", fontWeight: 700 }}>PAID</div><div style={{ fontWeight: 800, fontSize: 12, color: "#10b981" }}>{fmtINR(v.paid)}</div></div>
                <div><div style={{ fontSize: 9, color: "var(--t3)", fontWeight: 700 }}>BAL</div><div style={{ fontWeight: 800, fontSize: 12, color: bal > 0 ? "#ef4444" : "#10b981" }}>{fmtINR(bal)}</div></div>
              </div>
              <div style={{ background: "var(--s3)", borderRadius: 6, height: 6, overflow: "hidden" }}><div style={{ width: Math.min(pct, 100) + "%", height: "100%", background: "linear-gradient(90deg," + c + "99," + c + ")" }} /></div>
            </Card>
          );
        })}
      </div>

      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
            <thead><tr>{["Date", "Vendor", "Project", "Type", "PO No", "Description", "PO Amt", "Invoice", "Paid", "Balance", "Remarks"].map(h => <TH key={h} c={h} />)}</tr></thead>
            <tbody>
              {vendorLedger.length === 0 && <tr><td colSpan={11} style={{ textAlign: "center", padding: 40, color: "var(--t3)" }}>No entries yet</td></tr>}
              {vendorLedger.map((l: any, i: number) => {
                const bal = l.amount - l.paid;
                const p = projects.find((x: any) => x.id === l.projectId);
                const diff = l.invoiceAmount && l.invoiceAmount !== l.amount;
                return (
                  <tr key={l.id} style={{ background: i % 2 === 0 ? "var(--s1)" : "var(--s2)" }}>
                    <TD><span style={{ background: "var(--s2)", padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600 }}>{fmtD(l.date)}</span></TD>
                    <TD bold>{l.vendor}</TD><TD>{p?.name?.split(" - ")[0] || "-"}</TD>
                    <TD><Badge text={l.type} color={l.type === "Purchase" ? "#3b82f6" : l.type === "Advance" ? "#fbbf24" : "#10b981"} /></TD>
                    <TD mono color="var(--t3)">{l.poNumber || "—"}</TD><TD>{l.description}</TD>
                    <TD bold mono color="#fb923c">{fmtINR(l.amount)}</TD>
                    <TD bold mono color={diff ? "#a78bfa" : "var(--t3)"}>{l.invoiceAmount ? fmtINR(l.invoiceAmount) : "—"}</TD>
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

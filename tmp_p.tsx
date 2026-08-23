import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Card, Badge, PBar, Btn, Lbl, Inp } from './UI';
import { today, uid, fmtD, fmtINR } from '../utils';

export function ProjectsView({ user, projects, setProjects, boq, setBoq, showToast }: any) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", client: "", startDate: today(), budget: 0 });
  const [rows, setRows] = useState<any[]>([]);
  const [fn, setFN] = useState("");
  const fRef = useRef<any>(null);

  const canAdd = user.role === "qms" || user.role === "sales" || user.role === "admin" || user.role === "md";

  const handleFile = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setFN(file.name);
    const r = new FileReader();
    r.onload = ev => {
      try {
        const wb = XLSX.read(ev.target?.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { defval: "" });
        const rws = data.map((d: any) => {
          const k = Object.keys(d);
          const fk = (...ps: string[]) => k.find(x => ps.some(p => x.toLowerCase().includes(p)));
          return {
            item: String(d[fk("item", "description", "work") || k[0]] || "").trim(),
            unit: String(d[fk("unit") || ""] || "Cum").trim(),
            boqQty: parseFloat(d[fk("qty", "quantity") || ""]) || 0,
            rate: parseFloat(d[fk("rate", "price") || ""]) || 0,
            isExtra: false
          };
        }).filter(x => x.item && x.boqQty > 0);
        
        if (!rws.length) {
          showToast("No valid rows", "error");
          return;
        }
        setRows(rws);
        showToast(rws.length + " BOQ items loaded!");
      } catch {
        showToast("Could not read file", "error");
      }
    };
    r.readAsArrayBuffer(file);
  };

  const save = () => {
    if (!form.name) return showToast("Project name required", "error");
    if (!rows.length) return showToast("Upload BOQ Excel first", "error");
    const id = uid();
    setProjects((p: any) => [...p, { id, ...form, budget: +form.budget, createdBy: user.role, status: "Active", createdAt: Date.now() }]);
    setBoq((b: any) => [...b, ...rows.map(r => ({ id: uid(), projectId: id, ...r, cumDone: 0 }))]);
    setForm({ name: "", location: "", client: "", startDate: today(), budget: 0 });
    setRows([]);
    setFN("");
    setOpen(false);
    showToast("Project created with " + rows.length + " BOQ items!");
  };

  const dlTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { Item: "Earthwork Excavation", Unit: "Cum", Qty: 500, Rate: 280 },
      { Item: "RCC Slab", Unit: "Cum", Qty: 85, Rate: 7800 },
      { Item: "Brickwork", Unit: "Sqm", Qty: 800, Rate: 850 }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BOQ");
    XLSX.writeFile(wb, "BOQ_Template.xlsx");
  };

  return (
    <div className="fadeIn">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>Projects</div><div style={{ color: "var(--t2)", fontSize: 13, marginTop: 3 }}>Manage construction sites and BOQs</div></div>
        {canAdd && <Btn onClick={() => setOpen(!open)} icon={open ? "ti-x" : "ti-plus"}>{open ? "Close" : "New Project"}</Btn>}
      </div>

      {open && canAdd && (
        <Card style={{ borderColor: "var(--acc)", marginBottom: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div><Lbl>Project Name</Lbl><Inp value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Tower D" /></div>
            <div><Lbl>Location</Lbl><Inp value={form.location} onChange={(e: any) => setForm({ ...form, location: e.target.value })} /></div>
            <div><Lbl>Client</Lbl><Inp value={form.client} onChange={(e: any) => setForm({ ...form, client: e.target.value })} /></div>
            <div><Lbl>Start Date</Lbl><Inp type="date" value={form.startDate} onChange={(e: any) => setForm({ ...form, startDate: e.target.value })} /></div>
            <div><Lbl>Budget (₹)</Lbl><Inp type="number" value={form.budget} onChange={(e: any) => setForm({ ...form, budget: e.target.value })} /></div>
          </div>
          <div style={{ background: "var(--s2)", border: "2px dashed var(--br2)", borderRadius: 12, padding: 20, textAlign: "center", marginBottom: 14 }}>
            <i className="ti ti-file-spreadsheet" style={{ fontSize: 36, color: "#10b981", marginBottom: 8, display: "block" }} />
            <div style={{ fontWeight: 700, marginBottom: 5 }}>Upload BOQ Excel</div>
            <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 12 }}>Columns: Item, Unit, Qty, Rate</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Btn variant="success" icon="ti-upload" sm onClick={() => fRef.current.click()}>Choose File</Btn>
              <Btn variant="ghost" sm icon="ti-download" onClick={dlTemplate}>Template</Btn>
            </div>
            <input ref={fRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} style={{ display: "none" }} />
            {fn && <div style={{ marginTop: 10, fontSize: 12, color: "#6ee7b7" }}><i className="ti ti-circle-check" /> {fn} · {rows.length} items</div>}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={save} icon="ti-plus" disabled={!form.name || !rows.length}>Create Project</Btn>
            <Btn variant="ghost" onClick={() => { setOpen(false); setRows([]); setFN(""); }}>Cancel</Btn>
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {projects.map((p: any) => {
          const items = boq.filter((b: any) => b.projectId === p.id && !b.isExtra);
          const pct = items.length ? Math.round(items.reduce((s: any, i: any) => s + i.cumDone, 0) / items.reduce((s: any, i: any) => s + i.boqQty, 0) * 100) : 0;
          const c = pct >= 80 ? "#10b981" : pct >= 50 ? "#fbbf24" : "#fb923c";
          return (
            <div key={p.id} style={{ background: "var(--s1)", border: "1px solid var(--br)", borderRadius: 14, padding: 18, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 3, background: c }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: c + "22", display: "flex", alignItems: "center", justifyContent: "center" }}><i className="ti ti-building-skyscraper" style={{ fontSize: 20, color: c }} /></div>
                <Badge text={p.status} color="#10b981" />
              </div>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 3 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 10 }}>{p.client} · {p.location} · {fmtD(p.startDate)}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 12 }}>
                <span style={{ color: "var(--t3)" }}>Progress</span><span style={{ fontWeight: 700, color: c }}>{pct}%</span>
              </div>
              <PBar pct={pct} color={c} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--br)" }}>
                <div><div style={{ fontSize: 9, color: "var(--t3)", fontWeight: 700 }}>BOQ ITEMS</div><div style={{ fontWeight: 700, fontSize: 16 }}>{items.length}</div></div>
                <div><div style={{ fontSize: 9, color: "var(--t3)", fontWeight: 700 }}>EXTRA ITEMS</div><div style={{ fontWeight: 700, fontSize: 16, color: "#fbbf24" }}>{boq.filter((b: any) => b.projectId === p.id && b.isExtra).length}</div></div>
                <div><div style={{ fontSize: 9, color: "var(--t3)", fontWeight: 700 }}>BUDGET</div><div style={{ fontWeight: 700, fontSize: 12, color: "#fb923c" }}>{fmtINR(p.budget)}</div></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

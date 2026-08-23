import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Card, Badge, PBar, Btn, Lbl, Inp, Sel, TH, TD } from './UI';
import { today, uid, fmtD, fmtINR } from '../utils';
import { SUBCONS, INCHARGES, TRADES, SKILL_TYPES, canSeeFinance } from '../constants';

export function LabourView({ user, projects, labour, setLabour, showToast }: any) {
  const nowTime = () => { const d = new Date(); return d.toTimeString().slice(0, 5); };
  const emptyCat = () => ({ trade: TRADES[0], skill: "Skilled", male: 0, female: 0, wage: 0 });
  const em = { date: today(), projectId: projects[0]?.id || "", subcon: SUBCONS[0], incharge: INCHARGES[0], shift: "Day", inTime: "08:00", outTime: "17:00", remarks: "", cats: [emptyCat()] };
  const [form, setForm] = useState(em);
  const [open, setOpen] = useState(false);
  const [selDate, setSelDate] = useState(today());
  const [selP, setSelP] = useState(0);
  const [editId, setEditId] = useState<number | null>(null);

  const s = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const showMoney = canSeeFinance(user.role);

  const addCat = () => setForm(f => ({ ...f, cats: [...f.cats, emptyCat()] }));
  const removeCat = (i: number) => setForm(f => ({ ...f, cats: f.cats.filter((_, idx) => idx !== i) }));
  const updateCat = (i: number, k: string, v: any) => setForm(f => ({ ...f, cats: f.cats.map((c, idx) => idx === i ? { ...c, [k]: v } : c) }));
  
  const calcHours = (inT: string, outT: string) => {
    if (!inT || !outT) return 0;
    const [ih, im] = inT.split(":").map(Number);
    const [oh, om] = outT.split(":").map(Number);
    let mins = (oh * 60 + om) - (ih * 60 + im);
    if (mins < 0) mins += 1440;
    return Math.round(mins / 60 * 10) / 10;
  };

  const save = () => {
    const valid = form.cats.filter(c => (+c.male || 0) + (+c.female || 0) > 0);
    if (!valid.length) return showToast("Add at least one category with workers", "error");
    const hours = calcHours(form.inTime, form.outTime);
    const cats = valid.map(c => ({ ...c, male: +c.male || 0, female: +c.female || 0, maleWage: +c.maleWage || 0, femaleWage: +c.femaleWage || 0, count: (+c.male || 0) + (+c.female || 0), cost: ((+c.male || 0) * (+c.maleWage || 0)) + ((+c.female || 0) * (+c.femaleWage || 0)) }));
    const totalCount = cats.reduce((a, c) => a + c.count, 0);
    const totalCost = cats.reduce((a, c) => a + c.cost, 0);
    const entry = { ...form, cats, hours, count: totalCount, cost: totalCost, projectId: +form.projectId };
    
    if (editId) {
      setLabour((l: any) => l.map((x: any) => x.id === editId ? { ...x, ...entry } : x));
      showToast("Entry updated!");
    } else {
      setLabour((l: any) => [{ ...entry, id: uid(), createdAt: Date.now() }, ...l]);
      showToast(`Saved! ${totalCount} workers, ${hours}hrs`);
    }
    setForm(em);
    setOpen(false);
    setEditId(null);
  };

  const editEntry = (l: any) => {
    setForm({
      date: l.date, projectId: l.projectId, subcon: l.subcon, incharge: l.incharge, shift: l.shift,
      inTime: l.inTime || "08:00", outTime: l.outTime || "17:00", remarks: l.remarks || "",
      cats: l.cats && l.cats.length ? l.cats.map((c: any) => ({ ...c })) : [{ trade: l.trade || TRADES[0], skill: "Skilled", male: l.count || 0, female: 0, wage: 0 }]
    });
    setEditId(l.id);
    setOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filtered = labour.filter((l: any) => (!selDate || l.date === selDate) && (!selP || l.projectId === +selP));
  const totalWorkers = filtered.reduce((s: any, l: any) => s + (l.count || 0), 0);
  const totalMale = filtered.reduce((s: any, l: any) => s + (l.cats ? l.cats.reduce((a: any, c: any) => a + (c.male || 0), 0) : 0), 0);
  const totalFemale = filtered.reduce((s: any, l: any) => s + (l.cats ? l.cats.reduce((a: any, c: any) => a + (c.female || 0), 0) : 0), 0);
  const totalCost = filtered.reduce((s: any, l: any) => s + (l.cost || 0), 0);
  const tradeMap: Record<string, number> = {};
  filtered.forEach((l: any) => { (l.cats || [{ trade: l.trade, count: l.count }]).forEach((c: any) => { tradeMap[c.trade] = (tradeMap[c.trade] || 0) + (c.count || 0); }); });
  const liveHours = calcHours(form.inTime, form.outTime);

  const exportXLS = () => {
    const rows: any[] = [];
    labour.forEach((l: any) => {
      const p = projects.find((x: any) => x.id === l.projectId);
      (l.cats || [{ trade: l.trade, skill: "-", male: l.count, female: 0, count: l.count, wage: 0, cost: 0 }]).forEach((c: any) => {
        rows.push({ Date: l.date, Project: p?.name || "-", Subcon: l.subcon, Trade: c.trade, Skill: c.skill || "-", Male: c.male || 0, Female: c.female || 0, Total: c.count, "In": l.inTime || "-", "Out": l.outTime || "-", "Hours": l.hours || 0, "Wage": showMoney ? (c.wage || 0) : "***", "Cost": showMoney ? (c.cost || 0) : "***", Shift: l.shift, Remarks: l.remarks });
      });
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Labour");
    XLSX.writeFile(wb, "Labour_Report.xlsx");
    showToast("Exported!");
  };

  return (
    <div className="fadeIn">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div><div style={{ fontSize: 26, fontWeight: 800 }}>Labour Tracker</div><div style={{ color: "var(--t2)", fontSize: 13, marginTop: 3 }}>Multi-category · In/Out time · M/F · Wages · Editable</div></div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" sm icon="ti-file-spreadsheet" onClick={exportXLS}>Export</Btn>
          <Btn onClick={() => { setEditId(null); setForm(em); setOpen(!open); }} icon={open ? "ti-x" : "ti-plus"}>{open ? "Close" : "Add Entry"}</Btn>
        </div>
      </div>

      {open && (
        <Card style={{ borderColor: "var(--acc)", marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}><i className="ti ti-users" style={{ color: "#a78bfa" }} />{editId ? "Edit" : "New"} Labour Entry{editId && <Badge text="EDITING" color="#fbbf24" />}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div><Lbl>Date</Lbl><Inp type="date" value={form.date} onChange={(e: any) => s("date", e.target.value)} /></div>
            <div><Lbl>Project</Lbl><Sel value={form.projectId} onChange={(e: any) => s("projectId", +e.target.value)}>{projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}</Sel></div>
            <div><Lbl>Subcontractor</Lbl><Sel value={form.subcon} onChange={(e: any) => s("subcon", e.target.value)}>{SUBCONS.map(x => <option key={x}>{x}</option>)}</Sel></div>
            <div><Lbl>Site Incharge</Lbl><Sel value={form.incharge} onChange={(e: any) => s("incharge", e.target.value)}>{INCHARGES.map(x => <option key={x}>{x}</option>)}</Sel></div>
            <div><Lbl>Shift</Lbl><Sel value={form.shift} onChange={(e: any) => s("shift", e.target.value)}><option>Day</option><option>Night</option><option>Day & Night</option></Sel></div>
            <div style={{ gridColumn: "span 3" }}><Lbl>Remarks</Lbl><Inp value={form.remarks} onChange={(e: any) => s("remarks", e.target.value)} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 16, padding: 14, background: "var(--s2)", borderRadius: 10, border: "1px solid var(--br)" }}>
            <div><Lbl>In Time</Lbl><div style={{ display: "flex", gap: 6 }}><Inp type="time" value={form.inTime} onChange={(e: any) => s("inTime", e.target.value)} /><button onClick={() => s("inTime", nowTime())} style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8, padding: "0 10px", color: "#10b981", cursor: "pointer", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>Now</button></div></div>
            <div><Lbl>Out Time</Lbl><div style={{ display: "flex", gap: 6 }}><Inp type="time" value={form.outTime} onChange={(e: any) => s("outTime", e.target.value)} /><button onClick={() => s("outTime", nowTime())} style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8, padding: "0 10px", color: "#10b981", cursor: "pointer", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>Now</button></div></div>
            <div><Lbl>Working Hours (auto)</Lbl><div style={{ background: "var(--s1)", border: "1px solid var(--br)", borderRadius: 10, padding: "11px 14px", fontSize: 18, fontWeight: 800, color: "#fb923c" }}>{liveHours} hrs</div></div>
          </div>
          <div style={{ background: "var(--s2)", borderRadius: 10, padding: 14, marginBottom: 14, border: "1px solid var(--br)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t3)" }}><i className="ti ti-list-check" style={{ marginRight: 6, color: "#a78bfa" }} />LABOUR CATEGORIES ({form.cats.length})</div>
              <button onClick={addCat} style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.3)", borderRadius: 8, padding: "6px 12px", color: "#a78bfa", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>+ Add Category</button>
            </div>
            {form.cats.map((c, i) => {
              const cnt = (+c.male || 0) + (+c.female || 0);
              const cost = cnt * (+c.wage || 0);
              return (
                <div key={i} style={{ background: "var(--s1)", border: "1px solid var(--br)", borderRadius: 9, padding: 12, marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><span style={{ fontSize: 11, fontWeight: 700, color: "var(--t3)" }}>Category {i + 1}{cnt > 0 ? ` — ${cnt} workers` : ""}{showMoney && cost > 0 ? ` · ${fmtINR(cost)}` : ""}</span>{form.cats.length > 1 && <button onClick={() => removeCat(i)} style={{ background: "rgba(239,68,68,0.12)", border: "none", borderRadius: 6, padding: "3px 8px", color: "#ef4444", cursor: "pointer", fontSize: 12 }}>✕</button>}</div>
                  <div style={{ display: "grid", gridTemplateColumns: showMoney ? "1.5fr 1.2fr 0.9fr 0.9fr 1.2fr" : "1.5fr 1.2fr 1fr 1fr", gap: 10 }}>
                    <div><Lbl>Trade</Lbl><Sel value={c.trade} onChange={(e: any) => updateCat(i, "trade", e.target.value)}>{TRADES.map(t => <option key={t}>{t}</option>)}</Sel></div>
                    <div><Lbl>Skill</Lbl><Sel value={c.skill} onChange={(e: any) => updateCat(i, "skill", e.target.value)}>{SKILL_TYPES.map(t => <option key={t}>{t}</option>)}</Sel></div>
                    <div><Lbl>Male</Lbl><Inp type="number" value={c.male} onChange={(e: any) => updateCat(i, "male", e.target.value)} /></div>
                    <div><Lbl>Female</Lbl><Inp type="number" value={c.female} onChange={(e: any) => updateCat(i, "female", e.target.value)} /></div>
                    {showMoney && <div><Lbl>Male Wage ₹</Lbl><Inp type="number" value={c.maleWage} onChange={(e: any) => updateCat(i, "maleWage", e.target.value)} /></div>}
                    {showMoney && <div><Lbl>Female Wage ₹</Lbl><Inp type="number" value={c.femaleWage} onChange={(e: any) => updateCat(i, "femaleWage", e.target.value)} /></div>}
                  </div>
                </div>
              );
            })}
            {showMoney && <div style={{ textAlign: "right", marginTop: 6, fontSize: 13, fontWeight: 800, color: "#fb923c" }}>Total Cost: {fmtINR(form.cats.reduce((a, c) => a + ((+c.male || 0) * (+c.maleWage || 0) + (+c.female || 0) * (+c.femaleWage || 0)), 0))}</div>}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={save} icon="ti-device-floppy">{editId ? "Update" : "Save"} Entry</Btn>
            <Btn variant="ghost" onClick={() => { setOpen(false); setEditId(null); }}>Cancel</Btn>
          </div>
        </Card>
      )}

      <div style={{ display: "flex", gap: 12, marginBottom: 18, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><i className="ti ti-calendar" style={{ color: "var(--t3)", fontSize: 16 }} /><Inp type="date" value={selDate} onChange={(e: any) => setSelDate(e.target.value)} /></div>
        <div style={{ width: 200 }}><Sel value={selP} onChange={(e: any) => setSelP(+e.target.value)}><option value={0}>All Projects</option>{projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}</Sel></div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ background: "var(--s1)", border: "1px solid var(--br)", borderRadius: 10, padding: "8px 16px" }}><div style={{ fontSize: 20, fontWeight: 900, color: "#a78bfa" }}>{totalWorkers}</div><div style={{ fontSize: 9, color: "var(--t3)", fontWeight: 700 }}>WORKERS</div></div>
          <div style={{ background: "var(--s1)", border: "1px solid var(--br)", borderRadius: 10, padding: "8px 16px" }}><div style={{ fontSize: 20, fontWeight: 900, color: "#3b82f6" }}>{totalMale}</div><div style={{ fontSize: 9, color: "var(--t3)", fontWeight: 700 }}>MALE</div></div>
          <div style={{ background: "var(--s1)", border: "1px solid var(--br)", borderRadius: 10, padding: "8px 16px" }}><div style={{ fontSize: 20, fontWeight: 900, color: "#ec4899" }}>{totalFemale}</div><div style={{ fontSize: 9, color: "var(--t3)", fontWeight: 700 }}>FEMALE</div></div>
          {showMoney && <div style={{ background: "var(--s1)", border: "1px solid var(--br)", borderRadius: 10, padding: "8px 16px" }}><div style={{ fontSize: 20, fontWeight: 900, color: "#fb923c" }}>{fmtINR(totalCost)}</div><div style={{ fontSize: 9, color: "var(--t3)", fontWeight: 700 }}>COST</div></div>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14 }}>Trade Breakdown</div>
          {Object.keys(tradeMap).length === 0 ? <div style={{ color: "var(--t3)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No data</div>
            : (Object.entries(tradeMap).sort((a, b) => b[1] - a[1])).map(([trade, cnt]) => (
              <div key={trade} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid var(--br)" }}>
                <span style={{ fontSize: 13 }}>{trade}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 70 }}><PBar pct={totalWorkers > 0 ? Math.round(cnt / totalWorkers * 100) : 0} color="#a78bfa" /></div>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#a78bfa", minWidth: 24, textAlign: "right" }}>{cnt}</span>
                </div>
              </div>
            ))}
        </Card>
        <Card>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
              <thead><tr>{["Date", "Project", "Categories", "M/F", "Hours", "Total", ...(showMoney ? ["Cost"] : []), "Shift", "Edit"].map(h => <TH key={h} c={h} />)}</tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={showMoney ? 9 : 8} style={{ textAlign: "center", padding: 40, color: "var(--t3)" }}>No entries found</td></tr>}
                {filtered.map((l: any) => {
                  const p = projects.find((x: any) => x.id === l.projectId);
                  const cats = l.cats || [{ trade: l.trade, skill: "-", male: l.count, female: 0, count: l.count }];
                  const male = cats.reduce((a: any, c: any) => a + (c.male || 0), 0);
                  const female = cats.reduce((a: any, c: any) => a + (c.female || 0), 0);
                  return (
                    <tr key={l.id}>
                      <TD><span style={{ background: "var(--s2)", padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600 }}>{fmtD(l.date)}</span></TD>
                      <TD bold>{p?.name?.split(" - ")[0] || "-"}</TD>
                      <TD><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{cats.map((c: any, ci: number) => <Badge key={ci} text={`${c.trade}${c.skill && c.skill !== "-" ? " (" + c.skill[0] + ")" : ""}: ${c.count || ((c.male || 0) + (c.female || 0))}`} color="#a78bfa" />)}</div></TD>
                      <TD mono><span style={{ color: "#3b82f6" }}>{male}</span>/<span style={{ color: "#ec4899" }}>{female}</span></TD>
                      <TD mono color="#fb923c">{l.hours || "—"}{l.hours ? "h" : ""}</TD>
                      <TD bold color="#a78bfa" mono>{l.count}</TD>
                      {showMoney && <TD bold color="#fb923c" mono>{l.cost ? fmtINR(l.cost) : "—"}</TD>}
                      <TD><Badge text={l.shift} color={l.shift === "Night" ? "#3b82f6" : "#fbbf24"} /></TD>
                      <TD><button onClick={() => editEntry(l)} style={{ background: "rgba(251,146,60,0.12)", border: "1px solid rgba(251,146,60,0.3)", borderRadius: 6, padding: "4px 10px", color: "#fb923c", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>✎ Edit</button></TD>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

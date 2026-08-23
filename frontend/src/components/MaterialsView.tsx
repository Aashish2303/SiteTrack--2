import React, { useState } from 'react';
import { Card, Badge, Btn, Lbl, Inp, Sel, TH, TD } from './UI';
import { today, uid, fmtD, fmtN, fmtINR, colDot } from '../utils';
import { UNITS, MAT_COLOURS, STEEL_DIAS } from '../constants';

export function MaterialsView({ user, projects, mat, setMat, txn, setTxn, stockMap, showToast }: any) {
  const [sub, setSub] = useState("stock");
  const emM = { name: "", unit: "Bag", opening: 0, minStock: 0, maxStock: 0, rate: 0, supplier: "", colour: "—", hsnCode: "", diameters: [] };
  const emT = { date: today(), projectId: projects[0]?.id || "", material: mat[0]?.id || "", type: "IN", qty: 0, rate: 0, ref: "", issuedTo: "" };
  const [mF, setMF] = useState(emM);
  const [tF, setTF] = useState(emT);
  const [openM, setOpenM] = useState(false);
  const [openT, setOpenT] = useState(false);

  const sm = (k: string, v: any) => setMF(f => ({ ...f, [k]: v }));
  
  const saveMat = () => {
    if (!mF.name) return showToast("Enter name", "error");
    const id = "MAT" + String(mat.length + 1).padStart(3, "0");
    setMat((m: any) => [...m, { ...mF, id, opening: +mF.opening, minStock: +mF.minStock, maxStock: +mF.maxStock, rate: +mF.rate, diameters: mF.diameters || [] }]);
    setMF(emM);
    setOpenM(false);
    showToast("Material saved!");
  };

  const saveTxn = () => {
    if (!tF.qty || tF.qty <= 0) return showToast("Enter qty", "error");
    setTxn((t: any) => [{ ...tF, id: uid(), qty: +tF.qty, rate: +tF.rate, projectId: +tF.projectId, createdAt: Date.now() }, ...t]);
    setTF(emT);
    setOpenT(false);
    showToast("Transaction saved!");
  };

  const tabs = [
    ["stock", "Stock Table", "ti-chart-bar"],
    ["balance", "Balance View", "ti-scale"],
    ["txn", "Transactions", "ti-arrows-shuffle"],
    ["master", "Master", "ti-database"]
  ];

  return (
    <div className="fadeIn">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div><div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>Materials</div><div style={{ color: "var(--t2)", fontSize: 13, marginTop: 3 }}>Stock · Balance · Colour & HSN · Transactions · Master</div></div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 4, background: "var(--s1)", padding: 4, borderRadius: 10, border: "1px solid var(--br)" }}>
            {tabs.map(([k, l, i]) => (
              <button key={k} onClick={() => setSub(k)} style={{ background: sub === k ? "linear-gradient(135deg, #fb923c, #f97316)" : "transparent", color: sub === k ? "#fff" : "var(--t2)", border: "none", borderRadius: 7, padding: "8px 12px", fontWeight: 600, fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}>
                <i className={"ti " + i} />{l}
              </button>
            ))}
          </div>
          <Btn sm icon="ti-plus" onClick={() => { setOpenM(!openM); setOpenT(false); }}>Add Material</Btn>
          <Btn sm variant="ghost" icon="ti-arrows-shuffle" onClick={() => { setOpenT(!openT); setOpenM(false); }}>IN / OUT</Btn>
        </div>
      </div>

      {openM && (
        <Card style={{ borderColor: "var(--acc)", marginBottom: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14 }}>
            <div><Lbl>Material Name</Lbl><Inp value={mF.name} onChange={(e: any) => sm("name", e.target.value)} icon="ti-box" /></div>
            <div><Lbl>Unit</Lbl><Sel value={mF.unit} onChange={(e: any) => sm("unit", e.target.value)}>{UNITS.map(u => <option key={u}>{u}</option>)}</Sel></div>
            <div><Lbl>Opening Stock</Lbl><Inp type="number" value={mF.opening} onChange={(e: any) => sm("opening", e.target.value)} /></div>
            <div><Lbl>Rate (₹/unit)</Lbl><Inp type="number" value={mF.rate} onChange={(e: any) => sm("rate", e.target.value)} icon="ti-currency-rupee" /></div>
            <div><Lbl>Min Stock</Lbl><Inp type="number" value={mF.minStock} onChange={(e: any) => sm("minStock", e.target.value)} /></div>
            <div><Lbl>Max Stock</Lbl><Inp type="number" value={mF.maxStock} onChange={(e: any) => sm("maxStock", e.target.value)} /></div>
            <div><Lbl>Supplier</Lbl><Inp value={mF.supplier} onChange={(e: any) => sm("supplier", e.target.value)} icon="ti-truck" /></div>
            <div><Lbl>Colour</Lbl><Sel value={mF.colour} onChange={(e: any) => sm("colour", e.target.value)}>{MAT_COLOURS.map(c => <option key={c}>{c}</option>)}</Sel></div>
            <div><Lbl>HSN Code (optional)</Lbl><Inp value={mF.hsnCode} onChange={(e: any) => sm("hsnCode", e.target.value)} placeholder="e.g. 7214.20" /></div>
            <div style={{ gridColumn: "span 3" }}>
              <Lbl>Steel Diameters (if applicable — hold Ctrl to multi-select)</Lbl>
              <select multiple value={mF.diameters} onChange={(e: any) => sm("diameters", [...e.target.selectedOptions].map(o => o.value))}
                style={{ background: "var(--s2)", border: "1px solid var(--br)", borderRadius: 8, padding: "6px", fontSize: 12, width: "100%", color: "var(--t1)", height: 72, display: "flex" }}>
                {STEEL_DIAS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <Btn onClick={saveMat} icon="ti-device-floppy">Save Material</Btn>
            <Btn variant="ghost" onClick={() => setOpenM(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      {openT && (
        <Card style={{ marginBottom: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr 1fr", gap: 12, alignItems: "end" }}>
            <div>
              <Lbl>Type</Lbl>
              <div style={{ display: "flex", gap: 8 }}>
                {["IN", "OUT"].map(t => (
                  <button key={t} onClick={() => setTF({ ...tF, type: t })} style={{ background: tF.type === t ? (t === "IN" ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #ef4444, #dc2626)") : "var(--s2)", color: tF.type === t ? "#fff" : "var(--t2)", border: "1px solid " + (tF.type === t ? "transparent" : "var(--br)"), borderRadius: 8, padding: "10px 18px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>{t}</button>
                ))}
              </div>
            </div>
            <div><Lbl>Date</Lbl><Inp type="date" value={tF.date} onChange={(e: any) => setTF({ ...tF, date: e.target.value })} /></div>
            <div><Lbl>Project</Lbl><Sel value={tF.projectId} onChange={(e: any) => setTF({ ...tF, projectId: +e.target.value })}>{projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}</Sel></div>
            <div><Lbl>Material</Lbl><Sel value={tF.material} onChange={(e: any) => setTF({ ...tF, material: e.target.value })}>{mat.map((m: any) => <option key={m.id} value={m.id}>{m.id} - {m.name}{m.colour && m.colour !== "—" ? " (" + m.colour + ")" : ""}</option>)}</Sel></div>
            <div><Lbl>Qty</Lbl><Inp type="number" value={tF.qty} onChange={(e: any) => setTF({ ...tF, qty: e.target.value })} /></div>
            <div><Lbl>Rate (₹)</Lbl><Inp type="number" value={tF.rate} onChange={(e: any) => setTF({ ...tF, rate: e.target.value })} /></div>
            <div><Lbl>{tF.type === "IN" ? "Ref / DC No." : "Issued To"}</Lbl><Inp value={tF.type === "IN" ? tF.ref : tF.issuedTo} onChange={(e: any) => setTF(tF.type === "IN" ? { ...tF, ref: e.target.value } : { ...tF, issuedTo: e.target.value })} /></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <Btn variant={tF.type === "IN" ? "success" : "danger"} onClick={saveTxn} icon="ti-device-floppy">Save {tF.type}</Btn>
            <Btn variant="ghost" onClick={() => setOpenT(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      {sub === "stock" && (
        <Card>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["ID", "Material", "Colour", "Unit", "Opening", "Total IN", "Total OUT", "Current Stock", "Rate", "Value", "Min", "Max", "Status"].map(h => <TH key={h} c={h} />)}</tr></thead>
              <tbody>
                {mat.map((m: any) => {
                  const ins = txn.filter((t: any) => t.material === m.id && t.type === "IN").reduce((s: any, t: any) => s + t.qty, 0);
                  const outs = txn.filter((t: any) => t.material === m.id && t.type === "OUT").reduce((s: any, t: any) => s + t.qty, 0);
                  const cur = m.opening + ins - outs;
                  const ok = cur > m.minStock;
                  return (
                    <tr key={m.id}>
                      <TD mono color="var(--t3)">{m.id}</TD>
                      <TD bold>{m.name}{(m.diameters || []).length > 0 && <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginTop: 3 }}>{(m.diameters || []).map((d: any) => <Badge key={d} text={d} color="#3b82f6" />)}</div>}</TD>
                      <TD>{m.colour && m.colour !== "—" ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><div style={{ width: 10, height: 10, borderRadius: "50%", background: colDot(m.colour), border: "1px solid var(--br2)" }} />{m.colour}</span> : "—"}</TD>
                      <TD>{m.unit}</TD><TD mono>{m.opening}</TD><TD mono color="#10b981" bold>+{ins}</TD><TD mono color="#ef4444" bold>-{outs}</TD>
                      <td style={{ padding: "11px 13px", borderBottom: "1px solid var(--br)", fontWeight: 900, fontSize: 16, color: ok ? "#10b981" : "#ef4444", fontFamily: "monospace" }}>{cur}</td>
                      <TD mono>{fmtINR(m.rate)}</TD><TD mono bold color="#fb923c">{fmtINR(cur * m.rate)}</TD><TD mono color="var(--t3)">{m.minStock}</TD><TD mono color="var(--t3)">{m.maxStock}</TD>
                      <TD><Badge text={ok ? "OK" : "REORDER"} color={ok ? "#10b981" : "#ef4444"} icon={ok ? "ti-check" : "ti-alert-triangle"} /></TD>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {sub === "balance" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {mat.map((m: any) => {
            const ins = txn.filter((t: any) => t.material === m.id && t.type === "IN").reduce((s: any, t: any) => s + t.qty, 0);
            const outs = txn.filter((t: any) => t.material === m.id && t.type === "OUT").reduce((s: any, t: any) => s + t.qty, 0);
            const cur = m.opening + ins - outs;
            const ok = cur > m.minStock;
            const pct = m.maxStock > 0 ? Math.min(cur / m.maxStock * 100, 100) : 0;
            return (
              <div key={m.id} style={{ background: "var(--s1)", border: "1px solid " + (ok ? "var(--br)" : "rgba(239,68,68,0.3)"), borderRadius: 14, padding: 18, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 4, background: ok ? "#10b981" : "#ef4444" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: "var(--t3)", display: "flex", alignItems: "center", gap: 8 }}>
                      {m.colour && m.colour !== "—" && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: colDot(m.colour) }} />{m.colour}</span>}
                      {m.hsnCode && <span>HSN: {m.hsnCode}</span>}
                    </div>
                    {(m.diameters || []).length > 0 && <div style={{ marginTop: 5, display: "flex", gap: 3, flexWrap: "wrap" }}>{(m.diameters || []).map((d: any) => <Badge key={d} text={d} color="#3b82f6" />)}</div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 30, fontWeight: 900, color: ok ? "#10b981" : "#ef4444", lineHeight: 1 }}>{fmtN(cur)}</div>
                    <div style={{ fontSize: 11, color: "var(--t3)" }}>{m.unit}</div>
                  </div>
                </div>
                <div style={{ background: "var(--s3)", borderRadius: 6, height: 8, overflow: "hidden", marginBottom: 8 }}>
                  <div style={{ width: pct + "%", height: "100%", background: `linear-gradient(90deg, ${ok ? "#10b981" : "#ef4444"}99, ${ok ? "#10b981" : "#ef4444"})`, borderRadius: 6 }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
                  <div style={{ textAlign: "center", background: "var(--s2)", borderRadius: 8, padding: "8px 4px" }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#10b981" }}>{fmtN(ins)}</div>
                    <div style={{ fontSize: 9, color: "var(--t3)", fontWeight: 700, letterSpacing: "0.05em" }}>TOTAL IN</div>
                  </div>
                  <div style={{ textAlign: "center", background: "var(--s2)", borderRadius: 8, padding: "8px 4px" }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#ef4444" }}>{fmtN(outs)}</div>
                    <div style={{ fontSize: 9, color: "var(--t3)", fontWeight: 700, letterSpacing: "0.05em" }}>TOTAL OUT</div>
                  </div>
                  <div style={{ textAlign: "center", background: "var(--s2)", borderRadius: 8, padding: "8px 4px" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#fb923c" }}>{fmtINR(cur * m.rate)}</div>
                    <div style={{ fontSize: 9, color: "var(--t3)", fontWeight: 700, letterSpacing: "0.05em" }}>VALUE</div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--t3)", marginTop: 8 }}>
                  <span>Min: {m.minStock} · Max: {m.maxStock}</span>
                  <Badge text={ok ? "OK" : "REORDER"} color={ok ? "#10b981" : "#ef4444"} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {sub === "txn" && (
        <Card>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
              <thead><tr>{["Date", "Project", "Material", "Type", "Qty", "Rate", "Amount", "Ref / To"].map(h => <TH key={h} c={h} />)}</tr></thead>
              <tbody>
                {txn.map((t: any) => {
                  const m = mat.find((x: any) => x.id === t.material);
                  const pr = projects.find((x: any) => x.id === t.projectId);
                  return (
                    <tr key={t.id}>
                      <TD>{fmtD(t.date)}</TD><TD>{pr?.name?.split(" - ")[0] || "-"}</TD><TD bold>{m?.name || t.material}</TD>
                      <td style={{ padding: "11px 13px", borderBottom: "1px solid var(--br)" }}><Badge text={t.type} color={t.type === "IN" ? "#10b981" : "#ef4444"} icon={t.type === "IN" ? "ti-arrow-down-right" : "ti-arrow-up-right"} /></td>
                      <TD bold mono>{t.qty} {m?.unit}</TD><TD mono>{fmtINR(t.rate)}</TD><TD bold mono color="#fb923c">{fmtINR(t.qty * t.rate)}</TD><TD color="var(--t3)">{t.ref || t.issuedTo || "—"}</TD>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {sub === "master" && (
        <Card>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["ID", "Name", "Unit", "Colour", "HSN Code", "Diameters", "Opening", "Rate", "Supplier", "Status"].map(h => <TH key={h} c={h} />)}</tr></thead>
              <tbody>
                {mat.map((m: any) => {
                  const ok = (stockMap[m.id] || 0) > m.minStock;
                  return (
                    <tr key={m.id}>
                      <TD mono color="var(--t3)">{m.id}</TD><TD bold>{m.name}</TD><TD>{m.unit}</TD>
                      <TD>{m.colour && m.colour !== "—" ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><div style={{ width: 10, height: 10, borderRadius: "50%", background: colDot(m.colour), border: "1px solid var(--br2)" }} />{m.colour}</span> : "—"}</TD>
                      <TD mono color="var(--t3)">{m.hsnCode || "—"}</TD>
                      <TD>{(m.diameters || []).length > 0 ? <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>{(m.diameters || []).map((d: any) => <Badge key={d} text={d} color="#3b82f6" />)}</div> : "—"}</TD>
                      <TD mono>{m.opening}</TD><TD mono>{fmtINR(m.rate)}</TD><TD color="var(--t2)">{m.supplier}</TD>
                      <TD><Badge text={ok ? "OK" : "REORDER"} color={ok ? "#10b981" : "#ef4444"} /></TD>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

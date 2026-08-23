import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Card, Badge, Btn, Lbl, Inp, Sel } from './UI';
import { today, uid, fmtD, fmtINR } from '../utils';
import { UNITS, ENGINEERS, WORK_CATEGORIES, INDENT_SIZES, URGENCY, scol, ucol } from '../constants';

export function IndentsView({ user, projects, indents, setIndents, showToast }: any) {
  const emItem = { item: "", qty: 0, unit: "Bag", category: WORK_CATEGORIES[0], size: "—", itemStatus: "Pending" };
  const em = { date: today(), projectId: projects[0]?.id || "", items: [{ ...emItem }], urgency: "Normal", engineer: user.role === "engineer" ? user.name : ENGINEERS[0], notes: "", noteForApproval: "", poNumber: "", woNumber: "" };
  const [form, setForm] = useState(em);
  const [open, setOpen] = useState(false);
  const [exp, setExp] = useState<number | null>(null);
  const [qF, setQF] = useState<any>({});
  const attachRefs = useRef<any>({});
  const [uploading, setUploading] = useState<number | null>(null);

  const s = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const sqf = (id: number, k: string, v: any) => setQF((f: any) => ({ ...f, [id]: { ...(f[id] || {}), [k]: v } }));
  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { ...emItem }] }));
  const removeItem = (i: number) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const updateItem = (i: number, k: string, v: any) => setForm(f => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, [k]: v } : it) }));

  const saveIndent = () => {
    if (!form.items[0]?.item) return showToast("Enter at least one material item", "error");
    const items = form.items.map(it => ({ ...it, qty: +it.qty || 0, itemStatus: it.itemStatus || "Pending", category: it.category || WORK_CATEGORIES[0], size: it.size || "—" }));
    setIndents((d: any) => [{ ...form, items, id: uid(), projectId: +form.projectId, status: "Pending Quotation", quotations: [], approvedIdx: null, createdAt: Date.now() }, ...d]);
    setForm(em);
    setOpen(false);
    showToast("Indent raised! " + items.length + " item(s).");
  };

  const setItemStatus = (indId: number, itemIdx: number, status: string) => {
    setIndents((d: any) => d.map((i: any) => {
      if (i.id !== indId) return i;
      const items = (i.items || []).map((it: any, idx: number) => idx === itemIdx ? { ...it, itemStatus: status } : it);
      return { ...i, items };
    }));
    showToast(`Item: ${status}`);
  };

  const addQ = (ind: any) => {
    const q = qF[ind.id] || {};
    if (!q.vendor || !q.rate) return showToast("Fill vendor & rate", "error");
    const totalQty = (ind.items || [{ qty: ind.qty }]).reduce((s: any, it: any) => s + (+it.qty || 0), 0);
    const total = +(q.total || q.rate * totalQty);
    const nq = { vendor: q.vendor, rate: +q.rate, total, delivery: q.delivery || "", notes: q.notes || "", attachedFile: q.attachedFile || null, attachedFileName: q.attachedFileName || "" };
    const nqs = [...(ind.quotations || []), nq];
    setIndents((d: any) => d.map((i: any) => i.id !== ind.id ? i : { ...i, quotations: nqs, status: nqs.length >= 2 ? "MD Review" : "Pending Quotation" }));
    setQF((f: any) => ({ ...f, [ind.id]: {} }));
    showToast("Quotation added!");
  };

  const attachFile = (indId: number, e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return showToast("Max 5MB", "error");
    setUploading(indId);
    const r = new FileReader();
    r.onload = ev => {
      sqf(indId, "attachedFile", ev.target?.result);
      sqf(indId, "attachedFileName", file.name);
      setUploading(null);
      showToast("File attached!");
    };
    r.readAsDataURL(file);
    e.target.value = "";
  };

  const approve = (ind: any, qi: number) => {
    setIndents((d: any) => d.map((i: any) => i.id !== ind.id ? i : { ...i, approvedIdx: qi, status: "Approved" }));
    showToast("Approved! PO ready.");
  };

  const reject = (ind: any) => {
    setIndents((d: any) => d.map((i: any) => i.id !== ind.id ? i : { ...i, status: "Rejected" }));
    showToast("Rejected", "error");
  };

  const downloadIndent = (ind: any) => {
    const p = projects.find((x: any) => x.id === ind.projectId);
    const items = ind.items || [{ item: ind.item, qty: ind.qty, unit: ind.unit }];
    const ws = XLSX.utils.json_to_sheet(items.map((it: any, i: number) => ({ "S.No": i + 1, "Indent No": "IND-" + ind.id, Date: ind.date, Project: p?.name || "-", Material: it.item, Quantity: it.qty, Unit: it.unit, Urgency: ind.urgency, Engineer: ind.engineer, Status: ind.status, Notes: ind.notes, "Note for Approval": ind.noteForApproval || "" })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Indent");
    XLSX.writeFile(wb, "Indent_IND-" + ind.id + ".xlsx");
    showToast("Indent Excel downloaded!");
  };

  const downloadPO = (ind: any) => {
    const q = ind.quotations[ind.approvedIdx || 0];
    const p = projects.find((x: any) => x.id === ind.projectId);
    const items = ind.items || [{ item: ind.item, qty: ind.qty, unit: ind.unit }];
    const ws = XLSX.utils.json_to_sheet([{ "PO Number": ind.poNumber || "PO-" + ind.id, "WO Number": ind.woNumber || "WO-" + ind.id, Date: today(), Project: p?.name || "-", Vendor: q?.vendor || "-", Items: items.map((it: any) => `${it.item}: ${it.qty} ${it.unit}`).join(", "), Rate: q?.rate || 0, Total: q?.total || 0, Delivery: q?.delivery || "", "Raised By": ind.engineer, "Approved By": "MD", "Note for Approval": ind.noteForApproval || "" }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PO & WO");
    XLSX.writeFile(wb, "PO_WO_" + ind.id + "_" + q?.vendor?.replace(/\s+/g, "_") + ".xlsx");
    showToast("PO & WO downloaded!");
  };

  const canRaise = user.role === "engineer" || user.role === "qms" || user.role === "admin";

  return (
    <div className="fadeIn">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div><div style={{ fontSize: 26, fontWeight: 800 }}>Material Indents</div>
          <div style={{ color: "var(--t2)", fontSize: 13, marginTop: 3, display: "flex", alignItems: "center", gap: 8 }}>
            <Badge text="Engineer raises" color="#3b82f6" icon="ti-helmet" />
            <i className="ti ti-arrow-right" style={{ color: "var(--t3)" }} />
            <Badge text="Sales uploads quotes" color="#a78bfa" icon="ti-briefcase" />
            <i className="ti ti-arrow-right" style={{ color: "var(--t3)" }} />
            <Badge text="MD approves" color="#ef4444" icon="ti-crown" />
          </div>
        </div>
        {canRaise && <Btn onClick={() => setOpen(!open)} icon={open ? "ti-x" : "ti-plus"}>{open ? "Close" : "Raise Indent"}</Btn>}
      </div>

      {open && canRaise && (
        <Card style={{ borderColor: "var(--acc)", marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, display: "flex", alignItems: "center", gap: 8, color: "var(--acc)" }}><i className="ti ti-package" />New Material Indent — Multiple Items per Sheet</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div><Lbl>Date</Lbl><Inp type="date" value={form.date} onChange={(e: any) => s("date", e.target.value)} /></div>
            <div><Lbl>Project</Lbl><Sel value={form.projectId} onChange={(e: any) => s("projectId", +e.target.value)}>{projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}</Sel></div>
            <div><Lbl>Urgency</Lbl><Sel value={form.urgency} onChange={(e: any) => s("urgency", e.target.value)}>{URGENCY.map(u => <option key={u}>{u}</option>)}</Sel></div>
            <div><Lbl>Site Engineer</Lbl><Sel value={form.engineer} onChange={(e: any) => s("engineer", e.target.value)}>{ENGINEERS.map(x => <option key={x}>{x}</option>)}</Sel></div>
            <div><Lbl>Notes / Specifications</Lbl><Inp value={form.notes} onChange={(e: any) => s("notes", e.target.value)} placeholder="Required date, grade, specs..." /></div>
            <div><Lbl>Note for Approval</Lbl><Inp value={form.noteForApproval} onChange={(e: any) => s("noteForApproval", e.target.value)} placeholder="Why this is urgent/critical..." icon="ti-info-circle" /></div>
          </div>

          <div style={{ background: "var(--s2)", borderRadius: 10, padding: 14, marginBottom: 14, border: "1px solid var(--br)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t2)", display: "flex", alignItems: "center", gap: 6 }}><i className="ti ti-list-check" style={{ color: "var(--acc)" }} />MATERIAL ITEMS ({form.items.length})</div>
              <Btn sm onClick={addItem} icon="ti-plus" variant="ghost">+ Add Another Item</Btn>
            </div>
            {form.items.map((it, i) => (
              <div key={i} style={{ marginBottom: 8, padding: "12px", background: "var(--s1)", borderRadius: 8, border: "1px solid var(--br)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--t3)" }}>Item {i + 1}</span>
                  {form.items.length > 1 && <button onClick={() => removeItem(i)} style={{ background: "rgba(239,68,68,0.12)", border: "none", borderRadius: 6, padding: "3px 8px", color: "#ef4444", cursor: "pointer", fontSize: 12 }}>✕ Remove</button>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 0.8fr 1fr 1fr 1.4fr", gap: 10 }}>
                  <div><Lbl>Material Name</Lbl><Inp value={it.item} onChange={(e: any) => updateItem(i, "item", e.target.value)} placeholder="e.g. Cement, Paint, Pipe" /></div>
                  <div><Lbl>Qty</Lbl><Inp type="number" value={it.qty} onChange={(e: any) => updateItem(i, "qty", e.target.value)} /></div>
                  <div><Lbl>Unit</Lbl><Sel value={it.unit} onChange={(e: any) => updateItem(i, "unit", e.target.value)}>{UNITS.map(u => <option key={u}>{u}</option>)}</Sel></div>
                  <div><Lbl>Size/Dia</Lbl><Sel value={it.size || "—"} onChange={(e: any) => updateItem(i, "size", e.target.value)}>{INDENT_SIZES.map(sz => <option key={sz}>{sz}</option>)}</Sel></div>
                  <div><Lbl>Category of Work</Lbl><Sel value={it.category || WORK_CATEGORIES[0]} onChange={(e: any) => updateItem(i, "category", e.target.value)}>{WORK_CATEGORIES.map(c => <option key={c}>{c}</option>)}</Sel></div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={saveIndent} icon="ti-send">Raise Indent ({form.items.length} item{form.items.length > 1 ? "s" : ""})</Btn>
            <Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      {indents.map((ind: any) => {
        const proj = projects.find((p: any) => p.id === ind.projectId);
        const qf = qF[ind.id] || {};
        const isExp = exp === ind.id;
        const sc = scol[ind.status];
        const lowest = ind.quotations?.length > 0 ? Math.min(...ind.quotations.map((q: any) => q.total)) : Infinity;
        const indItems = ind.items || [{ item: ind.item, qty: ind.qty, unit: ind.unit }];
        const primaryItem = indItems[0]?.item || "—";

        return (
          <div key={ind.id} style={{ background: "var(--s1)", borderRadius: 14, border: "1px solid var(--br)", borderLeft: "4px solid " + sc, marginBottom: 14, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 800, fontSize: 15 }}>{primaryItem}</span>
                    {indItems.length > 1 && <Badge text={"+" + (indItems.length - 1) + " more"} color="#3b82f6" />}
                    <Badge text={ind.urgency} color={ucol[ind.urgency]} />
                    <Badge text={ind.status} color={sc} />
                    {ind.quotations?.length > 0 && <Badge text={ind.quotations.length + "q"} color="var(--t3)" icon="ti-file-text" />}
                    {ind.poNumber && <Badge text={ind.poNumber} color="#10b981" icon="ti-file-check" />}
                  </div>
                  <div style={{ color: "var(--t3)", fontSize: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <span><i className="ti ti-building" style={{ fontSize: 11 }} /> {proj?.name || "-"}</span>
                    <span>{indItems.map((it: any) => `${it.qty} ${it.unit}`).join(", ")}</span>
                    <span><i className="ti ti-user" style={{ fontSize: 11 }} /> {ind.engineer}</span>
                    <span><i className="ti ti-calendar" style={{ fontSize: 11 }} /> {fmtD(ind.date)}</span>
                  </div>
                  {ind.notes && <div style={{ marginTop: 6, fontSize: 12, color: "var(--t2)", fontStyle: "italic", padding: "4px 10px", background: "var(--s2)", borderRadius: 6, display: "inline-block" }}>{ind.notes}</div>}
                  {ind.noteForApproval && <div style={{ marginTop: 5, fontSize: 12, color: "#fb923c", padding: "4px 10px", background: "rgba(251,146,60,0.08)", borderRadius: 6, border: "1px solid rgba(251,146,60,0.2)", display: "inline-block", marginLeft: 6 }}><i className="ti ti-info-circle" style={{ marginRight: 4 }} />Note for MD: {ind.noteForApproval}</div>}
                  
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                    {indItems.map((it: any, ii: number) => {
                      const st = it.itemStatus || "Pending";
                      const stColor = ({ Pending: "#fbbf24", Approved: "#10b981", Rejected: "#ef4444", "On Hold": "#a78bfa" } as any)[st] || "#6b7494";
                      const canHold = ["md", "admin", "qms"].includes(user.role);
                      return (
                        <div key={ii} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "7px 11px", background: st === "On Hold" ? "rgba(167,139,250,0.06)" : "var(--s2)", borderRadius: 8, border: "1px solid " + (st === "On Hold" ? "rgba(167,139,250,0.3)" : "var(--br)") }}>
                          <span style={{ fontSize: 12, fontWeight: 700 }}>{it.item}</span>
                          <span style={{ fontSize: 11, color: "var(--t2)" }}>{it.qty} {it.unit}</span>
                          {it.size && it.size !== "—" && <Badge text={it.size} color="#fb923c" />}
                          {it.category && <Badge text={it.category} color="#3b82f6" />}
                          <Badge text={st} color={stColor} />
                          {canHold && (
                            <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
                              {st !== "On Hold" ? <button onClick={() => setItemStatus(ind.id, ii, "On Hold")} style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.3)", borderRadius: 6, padding: "3px 9px", color: "#a78bfa", cursor: "pointer", fontSize: 10, fontWeight: 700 }}>Hold</button> : <button onClick={() => setItemStatus(ind.id, ii, "Pending")} style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 6, padding: "3px 9px", color: "#10b981", cursor: "pointer", fontSize: 10, fontWeight: 700 }}>Release</button>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {ind.status === "Approved" && (
                    <div style={{ marginTop: 8, padding: "6px 12px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                      <i className="ti ti-check" style={{ color: "#10b981" }} />
                      <strong style={{ color: "#10b981" }}>MD Approved:</strong>
                      <span style={{ color: "var(--t2)" }}>{ind.quotations[ind.approvedIdx || 0]?.vendor} — {fmtINR(ind.quotations[ind.approvedIdx || 0]?.total)}</span>
                      {ind.poNumber && <Badge text={"PO: " + ind.poNumber} color="#10b981" />}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Btn sm variant="ghost" onClick={() => downloadIndent(ind)} icon="ti-file-download">Indent</Btn>
                  {user.role === "sales" && ind.status !== "Approved" && ind.status !== "Rejected" && <Btn sm variant="info" onClick={() => setExp(isExp ? null : ind.id)} icon={isExp ? "ti-x" : "ti-upload"}>{isExp ? "Close" : "Upload Quotes"}</Btn>}
                  {(user.role === "md" || user.role === "admin") && ind.status === "MD Review" && <Btn sm onClick={() => setExp(isExp ? null : ind.id)} icon={isExp ? "ti-x" : "ti-scale"}>{isExp ? "Close" : "Compare & Approve"}</Btn>}
                  {ind.status === "Approved" && (
                    <>
                      {(user.role === "sales" || user.role === "md" || user.role === "admin") && <Btn sm variant="success" onClick={() => downloadPO(ind)} icon="ti-file-invoice">PO & WO</Btn>}
                      <Btn sm variant="ghost" onClick={() => setExp(isExp ? null : ind.id)} icon="ti-eye">{isExp ? "Hide" : "Details"}</Btn>
                    </>
                  )}
                  {(user.role === "engineer" || user.role === "qms") && ind.quotations?.length > 0 && <Btn sm variant="ghost" onClick={() => setExp(isExp ? null : ind.id)} icon="ti-eye">{isExp ? "Hide" : "View Quotes"}</Btn>}
                </div>
              </div>
            </div>

            {isExp && (
              <div style={{ borderTop: "1px solid var(--br)", padding: "18px 20px", background: "var(--s2)" }}>
                {user.role === "sales" && ind.status !== "Approved" && ind.status !== "Rejected" && (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa", marginBottom: 12 }}>Upload Vendor Quotation</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1.5fr", gap: 10, marginBottom: 12 }}>
                      <div><Lbl>Vendor Name</Lbl><Inp value={qf.vendor || ""} onChange={(e: any) => sqf(ind.id, "vendor", e.target.value)} /></div>
                      <div><Lbl>Rate (₹/unit)</Lbl><Inp type="number" value={qf.rate || ""} onChange={(e: any) => sqf(ind.id, "rate", e.target.value)} /></div>
                      <div><Lbl>Total (₹)</Lbl><Inp type="number" value={qf.total || ""} onChange={(e: any) => sqf(ind.id, "total", e.target.value)} /></div>
                      <div><Lbl>Delivery</Lbl><Inp value={qf.delivery || ""} placeholder="2 days" onChange={(e: any) => sqf(ind.id, "delivery", e.target.value)} /></div>
                      <div><Lbl>Notes</Lbl><Inp value={qf.notes || ""} onChange={(e: any) => sqf(ind.id, "notes", e.target.value)} /></div>
                    </div>
                    <div style={{ background: "var(--s1)", border: "2px dashed " + (qf.attachedFileName ? "#10b981" : "var(--br2)"), borderRadius: 10, padding: "12px 16px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <i className={"ti " + (qf.attachedFileName ? "ti-file-check" : "ti-paperclip")} style={{ fontSize: 22, color: qf.attachedFileName ? "#10b981" : "#a78bfa" }} />
                        <div>{qf.attachedFileName ? <><div style={{ fontWeight: 700, fontSize: 13, color: "#6ee7b7" }}>{qf.attachedFileName}</div><div style={{ fontSize: 11, color: "var(--t3)" }}>MD can view this file</div></> : <><div style={{ fontWeight: 600, fontSize: 13 }}>Attach vendor's original quotation</div><div style={{ fontSize: 11, color: "var(--t3)" }}>PDF, Excel, Image · Max 5MB</div></>}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {qf.attachedFileName && <Btn sm variant="ghost" icon="ti-x" onClick={() => { sqf(ind.id, "attachedFile", null); sqf(ind.id, "attachedFileName", ""); }}>Remove</Btn>}
                        <Btn sm variant={qf.attachedFileName ? "ghost" : "info"} icon="ti-upload" disabled={uploading === ind.id} onClick={() => attachRefs.current[ind.id]?.click()}>{qf.attachedFileName ? "Replace" : "Attach"}</Btn>
                      </div>
                      <input ref={el => attachRefs.current[ind.id] = el} type="file" accept=".pdf,.xlsx,.xls,.png,.jpg,.jpeg" onChange={e => attachFile(ind.id, e)} style={{ display: "none" }} />
                    </div>
                    <Btn sm variant="info" onClick={() => addQ(ind)} icon="ti-plus">Add Quotation</Btn>
                    {ind.quotations?.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        {ind.quotations.map((q: any, qi: number) => (
                          <div key={qi} style={{ background: "var(--s1)", border: "1px solid var(--br)", borderRadius: 9, padding: "11px 14px", marginBottom: 7, display: "flex", gap: 12, alignItems: "center", fontSize: 13, flexWrap: "wrap" }}>
                            <span style={{ fontWeight: 700, minWidth: 130 }}>{q.vendor}</span><span style={{ color: "var(--t2)" }}>{fmtINR(q.rate)}/unit</span>
                            <span style={{ fontWeight: 700, color: "#fb923c" }}>{fmtINR(q.total)}</span>
                            {q.delivery && <span style={{ color: "var(--t3)", fontSize: 11 }}><i className="ti ti-truck" /> {q.delivery}</span>}
                            <span style={{ color: "var(--t3)", fontSize: 11, flex: 1 }}>{q.notes}</span>
                            {q.attachedFile && <Btn sm variant="ghost" icon="ti-eye" onClick={() => { const a = document.createElement("a"); a.href = q.attachedFile; a.download = q.attachedFileName; a.click(); }}>View</Btn>}
                          </div>
                        ))}
                        {ind.quotations.length >= 2 && <div style={{ fontSize: 12, color: "#10b981", padding: "8px 12px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8 }}><i className="ti ti-circle-check" /> Sent to MD for review</div>}
                      </div>
                    )}
                  </div>
                )}

                {(user.role === "md" || user.role === "admin") && (
                  <div>
                    {ind.status === "Approved" ? (
                      <div style={{ padding: "14px 18px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                        <div><div style={{ fontWeight: 700, color: "#10b981", marginBottom: 3 }}><i className="ti ti-check" /> APPROVED</div><div style={{ fontSize: 14, fontWeight: 700 }}>{ind.quotations[ind.approvedIdx || 0]?.vendor} — {fmtINR(ind.quotations[ind.approvedIdx || 0]?.total)}</div></div>
                        <Btn sm variant="success" icon="ti-file-invoice" onClick={() => downloadPO(ind)}>Download PO & WO</Btn>
                      </div>
                    ) : (
                      <>
                        {ind.noteForApproval && <div style={{ marginBottom: 14, padding: "10px 14px", background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.3)", borderRadius: 10, fontSize: 13 }}><i className="ti ti-info-circle" style={{ color: "#fb923c", marginRight: 6 }} />Engineer's Note: <strong>{ind.noteForApproval}</strong></div>}
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#fb923c", marginBottom: 14 }}><i className="ti ti-scale" style={{ marginRight: 6 }} />Compare Quotations — Click to Approve</div>
                        {!ind.quotations?.length ? <div style={{ color: "var(--t3)", fontSize: 13, padding: "20px 0", textAlign: "center" }}>No quotations yet from Sales</div> : (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                            {ind.quotations.map((q: any, qi: number) => {
                              const isLow = q.total === lowest;
                              return (
                                <div key={qi} style={{ background: isLow ? "rgba(251,146,60,0.08)" : "var(--s1)", border: "2px solid " + (isLow ? "#fb923c" : "var(--br)"), borderRadius: 12, padding: 16, position: "relative" }}>
                                  {isLow && <div style={{ position: "absolute", top: -9, left: 14, background: "linear-gradient(135deg, #fb923c, #f97316)", color: "#fff", fontSize: 9, fontWeight: 800, padding: "3px 9px", borderRadius: 20 }}>LOWEST</div>}
                                  <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}>{q.vendor}</div>
                                  <div style={{ fontSize: 22, fontWeight: 900, color: isLow ? "#fb923c" : "var(--t1)", marginBottom: 3 }}>{fmtINR(q.total)}</div>
                                  <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 4 }}>{fmtINR(q.rate)}/unit · {q.delivery}</div>
                                  {q.notes && <div style={{ fontSize: 11, color: "var(--t2)", marginBottom: 10, fontStyle: "italic" }}>{q.notes}</div>}
                                  {q.attachedFile && <div style={{ marginBottom: 8 }}><Btn sm variant="ghost" onClick={() => { const a = document.createElement("a"); a.href = q.attachedFile; a.download = q.attachedFileName; a.click(); }} full icon="ti-file-search">View Original</Btn></div>}
                                  <Btn sm variant="success" onClick={() => approve(ind, qi)} full icon="ti-check">Approve</Btn>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {ind.quotations?.length > 0 && <div style={{ marginTop: 12 }}><Btn sm variant="danger" onClick={() => reject(ind)} icon="ti-x">Reject All</Btn></div>}
                      </>
                    )}
                  </div>
                )}

                {(user.role === "engineer" || user.role === "qms") && (
                  <div>
                    {ind.status === "Approved" ? (
                      <div style={{ padding: "12px 16px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 10, fontSize: 13 }}>
                        <div style={{ fontWeight: 700, color: "#10b981", marginBottom: 4 }}><i className="ti ti-check" /> MD DECISION: APPROVED</div>
                        <div>{ind.quotations[ind.approvedIdx || 0]?.vendor} — {fmtINR(ind.quotations[ind.approvedIdx || 0]?.total)} · {ind.quotations[ind.approvedIdx || 0]?.delivery}</div>
                        {ind.poNumber && <div style={{ marginTop: 6, display: "flex", gap: 8 }}><Badge text={"PO: " + ind.poNumber} color="#10b981" /><Badge text={"WO: " + ind.woNumber} color="#3b82f6" /></div>}
                      </div>
                    ) : ind.status === "Rejected" ? (
                      <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, fontSize: 13, color: "#fca5a5", fontWeight: 700 }}><i className="ti ti-x" /> MD DECISION: REJECTED</div>
                    ) : ind.quotations?.length > 0 ? (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t3)", marginBottom: 10, letterSpacing: "0.08em" }}>QUOTATIONS UPLOADED — AWAITING MD REVIEW</div>
                        {ind.quotations.map((q: any, qi: number) => (
                          <div key={qi} style={{ background: "var(--s1)", border: "1px solid var(--br)", borderRadius: 8, padding: "11px 14px", marginBottom: 7, display: "flex", gap: 12, alignItems: "center", fontSize: 13, flexWrap: "wrap" }}>
                            <span style={{ fontWeight: 700, minWidth: 120 }}>{q.vendor}</span><span style={{ color: "var(--t2)" }}>{fmtINR(q.rate)}/unit</span>
                            <span style={{ fontWeight: 700, color: "#fb923c" }}>{fmtINR(q.total)}</span><span style={{ color: "var(--t3)", fontSize: 11, flex: 1 }}>{q.notes}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: "var(--t3)", fontSize: 13 }}>Waiting for Sales to upload quotations...</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      {indents.length === 0 && <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--t3)" }}><i className="ti ti-package" style={{ fontSize: 40, display: "block", marginBottom: 10 }} />No indents yet</div>}
    </div>
  );
}

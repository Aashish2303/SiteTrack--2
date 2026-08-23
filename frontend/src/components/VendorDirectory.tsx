import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Card, Badge, Btn, Lbl, Inp, Sel } from './UI';
import { uid } from '../utils';
import { VENDOR_CATEGORIES } from '../constants';

export function VendorDirectory({ user, vendorDB, setVendorDB, showToast }: any) {
  const em = { name: "", company: "", mobile: "", altContact: "", category: VENDOR_CATEGORIES[0], location: "", materialType: "", remarks: "", cardPhoto: null };
  const [form, setForm] = useState(em);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [fc, setFc] = useState("All");
  const [editId, setEditId] = useState<number | null>(null);
  const cardRef = useRef<any>(null);

  const s = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.name || !form.mobile) return showToast("Name & mobile required", "error");
    if (editId) {
      setVendorDB((d: any) => d.map((v: any) => v.id === editId ? { ...v, ...form } : v));
      showToast("Updated!");
    } else {
      setVendorDB((d: any) => [{ ...form, id: uid() }, ...d]);
      showToast("Vendor added!");
    }
    setForm(em);
    setOpen(false);
    setEditId(null);
  };

  const editV = (v: any) => {
    setForm({ ...v });
    setEditId(v.id);
    setOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const delV = (id: number) => {
    if (confirm("Delete vendor?")) {
      setVendorDB((d: any) => d.filter((v: any) => v.id !== id));
      showToast("Deleted", "error");
    }
  };

  const upCard = (e: any) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 3 * 1024 * 1024) return showToast("Max 3MB", "error");
    const r = new FileReader();
    r.onload = ev => {
      s("cardPhoto", ev.target?.result);
      showToast("Card attached!");
    };
    r.readAsDataURL(f);
    e.target.value = "";
  };

  const viewCard = (p: string, n: string) => {
    const w = window.open("", "_blank");
    w?.document.write(`<html><head><title>${n}</title><style>body{margin:0;background:#0a0e1a;display:flex;align-items:center;justify-content:center;min-height:100vh}img{max-width:100%;max-height:90vh;border-radius:8px}</style></head><body><img src="${p}"/></body></html>`);
    w?.document.close();
  };

  const filtered = vendorDB.filter((v: any) => {
    const m = !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.company.toLowerCase().includes(search.toLowerCase()) || v.mobile.includes(search) || (v.materialType || "").toLowerCase().includes(search.toLowerCase());
    return m && (fc === "All" || v.category === fc);
  });

  const exportXLS = () => {
    const ws = XLSX.utils.json_to_sheet(vendorDB.map((v: any, i: number) => ({ "#": i + 1, Name: v.name, Company: v.company, Mobile: v.mobile, "Alt": v.altContact, Category: v.category, Location: v.location, "Material/Service": v.materialType, Remarks: v.remarks })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vendors");
    XLSX.writeFile(wb, "Vendor_Directory.xlsx");
    showToast("Exported!");
  };

  return (
    <div className="fadeIn">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div><div style={{ fontSize: 26, fontWeight: 800 }}>Vendor Directory</div><div style={{ color: "var(--t2)", fontSize: 13, marginTop: 3 }}>Centralized vendor contacts · {vendorDB.length} vendors</div></div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" sm icon="ti-file-spreadsheet" onClick={exportXLS}>Export</Btn>
          <Btn onClick={() => { setEditId(null); setForm(em); setOpen(!open); }} icon={open ? "ti-x" : "ti-plus"}>{open ? "Close" : "Add Vendor"}</Btn>
        </div>
      </div>

      {open && (
        <Card style={{ borderColor: "var(--acc)", marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>{editId ? "Edit" : "New"} Vendor {editId && <Badge text="EDITING" color="#fbbf24" />}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <div><Lbl>Vendor Name *</Lbl><Inp value={form.name} onChange={(e: any) => s("name", e.target.value)} /></div>
            <div><Lbl>Company</Lbl><Inp value={form.company} onChange={(e: any) => s("company", e.target.value)} /></div>
            <div><Lbl>Mobile *</Lbl><Inp value={form.mobile} onChange={(e: any) => s("mobile", e.target.value)} /></div>
            <div><Lbl>Alt Contact</Lbl><Inp value={form.altContact} onChange={(e: any) => s("altContact", e.target.value)} /></div>
            <div><Lbl>Category</Lbl><Sel value={form.category} onChange={(e: any) => s("category", e.target.value)}>{VENDOR_CATEGORIES.map(c => <option key={c}>{c}</option>)}</Sel></div>
            <div><Lbl>Location</Lbl><Inp value={form.location} onChange={(e: any) => s("location", e.target.value)} /></div>
            <div style={{ gridColumn: "span 2" }}><Lbl>Material/Service Type</Lbl><Inp value={form.materialType} onChange={(e: any) => s("materialType", e.target.value)} /></div>
            <div>
              <Lbl>Visiting Card</Lbl>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => cardRef.current?.click()} style={{ flex: 1, background: form.cardPhoto ? "rgba(16,185,129,0.12)" : "var(--s2)", border: "1px solid " + (form.cardPhoto ? "rgba(16,185,129,0.3)" : "var(--br)"), borderRadius: 8, padding: "10px", color: form.cardPhoto ? "#10b981" : "var(--t2)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{form.cardPhoto ? "Attached" : "Upload"}</button>
                {form.cardPhoto && <button onClick={() => s("cardPhoto", null)} style={{ background: "rgba(239,68,68,0.12)", border: "none", borderRadius: 8, padding: "0 12px", color: "#ef4444", cursor: "pointer" }}>✕</button>}
              </div>
              <input ref={cardRef} type="file" accept="image/*" onChange={upCard} style={{ display: "none" }} />
            </div>
            <div style={{ gridColumn: "span 3" }}><Lbl>Remarks</Lbl><Inp value={form.remarks} onChange={(e: any) => s("remarks", e.target.value)} /></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <Btn onClick={save} icon="ti-device-floppy">{editId ? "Update" : "Save"}</Btn>
            <Btn variant="ghost" onClick={() => { setOpen(false); setEditId(null); }}>Cancel</Btn>
          </div>
        </Card>
      )}

      <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <i className="ti ti-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--t3)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, company, mobile, material..." style={{ background: "var(--s2)", border: "1px solid var(--br)", borderRadius: 10, padding: "11px 14px 11px 38px", fontSize: 13, width: "100%", color: "var(--t1)" }} />
        </div>
        <div style={{ width: 200 }}>
          <Sel value={fc} onChange={(e: any) => setFc(e.target.value)}>
            <option value="All">All Categories</option>
            {VENDOR_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </Sel>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
        {filtered.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "var(--t3)" }}>No vendors found</div>}
        {filtered.map((v: any) => (
          <Card key={v.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(251,146,60,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fb923c", fontSize: 16 }}>{v.name[0] || "?"}</div>
                <div><div style={{ fontWeight: 800, fontSize: 14 }}>{v.name}</div><div style={{ fontSize: 11, color: "var(--t3)" }}>{v.company}</div></div>
              </div>
              <Badge text={v.category} color="#3b82f6" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><i className="ti ti-phone" style={{ color: "#10b981" }} /><a href={`tel:${v.mobile}`} style={{ color: "#10b981", textDecoration: "none", fontWeight: 600 }}>{v.mobile}</a>{v.altContact && <span style={{ color: "var(--t3)" }}>· {v.altContact}</span>}</div>
              {v.location && <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--t2)" }}><i className="ti ti-map-pin" style={{ color: "var(--t3)" }} />{v.location}</div>}
              {v.materialType && <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--t2)" }}><i className="ti ti-package" style={{ color: "var(--t3)" }} />{v.materialType}</div>}
              {v.remarks && <div style={{ fontSize: 11, color: "var(--t3)", fontStyle: "italic" }}>{v.remarks}</div>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <a href={`tel:${v.mobile}`} style={{ flex: 1, textDecoration: "none" }}><div style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8, padding: "7px", textAlign: "center", color: "#10b981", fontSize: 12, fontWeight: 700 }}>Call</div></a>
              {v.cardPhoto && <button onClick={() => viewCard(v.cardPhoto, v.name)} style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 8, padding: "7px 12px", color: "#3b82f6", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Card</button>}
              <button onClick={() => editV(v)} style={{ background: "rgba(251,146,60,0.12)", border: "1px solid rgba(251,146,60,0.3)", borderRadius: 8, padding: "7px 12px", color: "#fb923c", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>✎</button>
              <button onClick={() => delV(v.id)} style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "7px 12px", color: "#ef4444", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>🗑</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

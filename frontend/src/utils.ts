export const uid = () => Date.now() + Math.floor(Math.random() * 9999);

export const today = () => new Date().toISOString().split("T")[0];

export const fmtD = (d: string) => {
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" });
  } catch {
    return d;
  }
};

export const fmtN = (n: number | string | undefined | null) => Math.round(Number(n) || 0).toLocaleString("en-IN");
export const fmtINR = (n: number | string | undefined | null) => "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");

export const scol = (s: string) => (({ "Pending Quotation": "#fbbf24", "MD Review": "#3b82f6", "Approved": "#10b981", "Rejected": "#ef4444" } as any)[s] || "#6b7494");
export const ucol = { Low: "#6b7494", Normal: "#3b82f6", High: "#fbbf24", Critical: "#ef4444" } as any;
export const icol = { Open: "#ef4444", "In Progress": "#fbbf24", Resolved: "#10b981", Closed: "#6b7494" } as any;
export const colDot = (c: string) => (({ Red: "#ef4444", Blue: "#3b82f6", Yellow: "#fbbf24", Green: "#10b981", White: "#e2e8f0", Black: "#374151", Grey: "#94a3b8", Silver: "#cbd5e1", Brown: "#92400e", Orange: "#fb923c", Multi: "#a78bfa" } as any)[c] || "var(--t3)");

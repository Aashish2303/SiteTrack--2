export const USERS = [
  { username: "aashish", password: "Aashish@2025", name: "Aashish", role: "md", avatar: "AA" },
  { username: "amrutha", password: "Amrutha@2025", name: "Amrutha", role: "qms", avatar: "AM" },
  { username: "bhavani", password: "Bhavani@2025", name: "Bhavani", role: "engineer", avatar: "BH" },
  { username: "raju", password: "Raju@2025", name: "Raju", role: "engineer", avatar: "RJ" },
  { username: "uday", password: "Uday@2025", name: "Uday", role: "sales", avatar: "UD" },
  { username: "accounts", password: "Accounts@2025", name: "Accounts", role: "accounts", avatar: "AC" },
  { username: "admin", password: "Admin@2025", name: "Administrator", role: "admin", avatar: "AD" },
];

export const ROLE_META: Record<string, { label: string; color: string; icon: string }> = {
  md: { label: "Managing Director", color: "#ef4444", icon: "ti-crown" },
  engineer: { label: "Site Engineer", color: "#3b82f6", icon: "ti-helmet" },
  sales: { label: "Sales/Procurement", color: "#a78bfa", icon: "ti-briefcase" },
  qms: { label: "QMS/Quality", color: "#10b981", icon: "ti-shield-check" },
  accounts: { label: "Accounts/Finance", color: "#f59e0b", icon: "ti-calculator" },
  admin: { label: "Administrator", color: "#ec4899", icon: "ti-settings" },
};

export const FINANCE_ROLES = ["md", "qms", "accounts", "admin"];
export const canSeeFinance = (role: string) => FINANCE_ROLES.includes(role);
export const isAdmin = (role: string) => role === "admin";

export const ucol: Record<string, string> = { Low: "#3b82f6", Normal: "#10b981", High: "#fbbf24", Critical: "#ef4444", Medium: "#fbbf24" };
export const icol: Record<string, string> = { Open: "#ef4444", Resolved: "#10b981", "In Progress": "#fbbf24", Closed: "#94a3b8" };
export const scol: Record<string, string> = {
  Completed: "#10b981",
  Partial: "#3b82f6",
  "Delayed - Carry Forward": "#fbbf24",
  Cancelled: "#ef4444",
  "Not Started": "#94a3b8"
};

export const colDot = (c: string) => `<div style="width:8px;height:8px;border-radius:50%;background:${c};display:inline-block;margin-right:6px"></div>`;

export const SUBCONS = ["M/s Patel Works", "M/s Singh Constructions", "M/s Kumar & Co", "M/s Reddy Infra"];
export const INCHARGES = ["Suresh Rao", "Vinod Nair", "Karthik Pillai"];
export const ENGINEERS = ["Ravi Kumar", "Anil Sharma", "Priya Mehta"];
export const UNITS = ["Cum", "Sqm", "Rmt", "MT", "Bag", "Nos", "LS", "Litre", "Kg", "mm", "inches", "feet", "sqft", "angular", "Rft", "Ton", "Set", "Pair"];
export const URGENCY = ["Low", "Normal", "High", "Critical"];
export const TRADES = ["Mason", "Carpenter", "Bar Bender", "Plumber", "Electrician", "Painter", "Helper", "Supervisor", "Driver", "Operator"];
export const ISSUE_CATS = ["Equipment", "Material", "Weather", "Labour", "Quality", "Design", "Safety", "Other"];
export const MAT_COLOURS = ["—", "Red", "Blue", "Yellow", "Green", "White", "Black", "Grey", "Silver", "Brown", "Orange", "Multi"];
export const STEEL_DIAS = ["6mm", "8mm", "10mm", "12mm", "16mm", "20mm", "25mm", "32mm"];
export const WORK_STATUSES = ["Completed", "Partial", "Delayed - Carry Forward", "Cancelled", "Not Started"];
export const WORK_CATEGORIES = ["Masonry", "Painting", "Centering/Shuttering", "Plumbing", "Electrical", "Carpentry", "RCC/Concrete", "Flooring/Tiling", "Plastering", "Waterproofing", "Steel/Reinforcement", "Finishing", "Earthwork", "Other"];
export const ITEM_STATUSES = ["Pending", "Approved", "Rejected", "On Hold"];
export const SKILL_TYPES = ["Skilled", "Unskilled", "Semi-Skilled"];
export const VENDOR_CATEGORIES = ["Cement", "Steel/TMT", "Sand/Aggregate", "Bricks/Blocks", "Electrical", "Plumbing", "Paint", "Hardware", "Tiles/Marble", "Wood/Ply", "Glass", "Sanitary", "Tools", "Other"];
export const INDENT_SIZES = ["—", "1\"", "1.5\"", "2\"", "2.5\"", "3\"", "4\"", "5\"", "6\"", "8\"", "10\"", "12\"", "6mm", "8mm", "10mm", "12mm", "16mm", "20mm", "25mm", "32mm", "M6", "M8", "M10", "M12", "M16", "Custom"];

export const SD_PROJECTS = [
  { id: 1, name: "Block A - Residential Tower", location: "Hyderabad", client: "Rama Developers", startDate: "2025-01-15", budget: 45000000, status: "Active" },
  { id: 2, name: "Block B - Commercial Complex", location: "Bengaluru", client: "Metro Builders", startDate: "2025-02-20", budget: 72000000, status: "Active" },
  { id: 3, name: "Site C - Township", location: "Vijayawada", client: "VP Infrastructure", startDate: "2025-03-10", budget: 120000000, status: "Active" },
];

export const SD_BOQ = [
  { id: 101, projectId: 1, item: "Earthwork Excavation", unit: "Cum", boqQty: 500, cumDone: 370, rate: 280, isExtra: false },
  { id: 102, projectId: 1, item: "PCC Work 1:4:8", unit: "Cum", boqQty: 120, cumDone: 95, rate: 4500, isExtra: false },
  { id: 103, projectId: 1, item: "RCC Slab 1st Floor", unit: "Cum", boqQty: 85, cumDone: 85, rate: 7800, isExtra: false },
  { id: 104, projectId: 1, item: "RCC Slab 2nd Floor", unit: "Cum", boqQty: 85, cumDone: 40, rate: 7800, isExtra: false },
  { id: 105, projectId: 1, item: "Brickwork Internal", unit: "Sqm", boqQty: 800, cumDone: 420, rate: 850, isExtra: false },
  { id: 106, projectId: 2, item: "Brickwork South Wing", unit: "Sqm", boqQty: 1200, cumDone: 540, rate: 850, isExtra: false },
  { id: 107, projectId: 2, item: "External Plastering", unit: "Sqm", boqQty: 2400, cumDone: 360, rate: 380, isExtra: false },
  { id: 108, projectId: 2, item: "Extra - Client Requested Granite Flooring", unit: "Sqm", boqQty: 200, cumDone: 0, rate: 2800, isExtra: true },
  { id: 109, projectId: 3, item: "Road Formation", unit: "Rmt", boqQty: 800, cumDone: 240, rate: 2400, isExtra: false },
  { id: 110, projectId: 3, item: "WBM Course Layer 1", unit: "Cum", boqQty: 240, cumDone: 90, rate: 1850, isExtra: false },
];

export const SD_DWR = [
  { id: 201, date: "2025-05-15", projectId: 1, description: "RCC Column Casting Grid C1-C5", location: "3rd Floor", quantity: "38 Cum", subcon: "M/s Patel Works", engineer: "Ravi Kumar", incharge: "Suresh Rao", remarks: "M30 grade", workStatus: "Completed", carryForward: false, createdAt: 2000 },
  { id: 202, date: "2025-05-15", projectId: 2, description: "Brickwork South Wing 2nd floor", location: "2nd Floor", quantity: "95 Sqm", subcon: "M/s Singh Constructions", engineer: "Anil Sharma", incharge: "Vinod Nair", remarks: "CM 1:6", workStatus: "Partial", carryForward: true, createdAt: 2001 },
  { id: 203, date: "2025-05-14", projectId: 1, description: "Bar bending for columns", location: "3rd Floor", quantity: "4.2 MT", subcon: "M/s Kumar & Co", engineer: "Ravi Kumar", incharge: "Suresh Rao", remarks: "Fe500 grade", workStatus: "Completed", carryForward: false, createdAt: 2002 },
];

export const SD_DPR = [
  { id: 301, date: "2025-05-15", projectId: 1, boqId: 104, description: "RCC Slab 2nd Floor", location: "2nd Floor", pct: 75, qtyDone: 28, subcon: "M/s Patel Works", engineer: "Ravi Kumar", incharge: "Suresh Rao", reason: "Pump breakdown 1.5hrs", workStatus: "Partial", carryForward: true, createdAt: 3000 },
  { id: 302, date: "2025-05-15", projectId: 2, boqId: 106, description: "Brickwork South Wing", location: "2nd Floor", pct: 100, qtyDone: 45, subcon: "M/s Singh Constructions", engineer: "Anil Sharma", incharge: "Vinod Nair", reason: "", workStatus: "Completed", carryForward: false, createdAt: 3001 },
];

export const SD_MAT = [
  { id: "MAT001", name: "Cement OPC 53", unit: "Bag", opening: 150, minStock: 100, maxStock: 600, rate: 380, supplier: "ACC Cements", colour: "Grey", hsnCode: "2523.29", diameters: [] },
  { id: "MAT002", name: "Steel TMT Fe500", unit: "MT", opening: 12, minStock: 8, maxStock: 50, rate: 58000, supplier: "SAIL Steel", colour: "Silver", hsnCode: "7214.20", diameters: ["8mm", "10mm", "12mm", "16mm", "20mm"] },
  { id: "MAT003", name: "River Sand", unit: "Cum", opening: 80, minStock: 30, maxStock: 200, rate: 1200, supplier: "Local Vendor", colour: "Yellow", hsnCode: "2505.10", diameters: [] },
  { id: "MAT004", name: "Aggregate 20mm", unit: "Cum", opening: 60, minStock: 20, maxStock: 150, rate: 950, supplier: "Quarry & Co", colour: "Grey", hsnCode: "2517.10", diameters: [] },
  { id: "MAT005", name: "Bricks 9 inch", unit: "Nos", opening: 8000, minStock: 3000, maxStock: 20000, rate: 9, supplier: "M/s Brick Depot", colour: "Red", hsnCode: "6904.10", diameters: [] },
  { id: "MAT006", name: "Electrical Wire", unit: "Rmt", opening: 500, minStock: 100, maxStock: 2000, rate: 28, supplier: "Polycab", colour: "Red", hsnCode: "8544.49", diameters: [] },
  { id: "MAT007", name: "Binding Wire", unit: "Kg", opening: 120, minStock: 30, maxStock: 300, rate: 72, supplier: "Steel Centre", colour: "Silver", hsnCode: "7217.10", diameters: [] },
];

export const SD_TXN = [
  { id: 401, date: "2025-05-13", projectId: 1, material: "MAT001", type: "IN", qty: 300, rate: 380, ref: "DC-2301", issuedTo: "", createdAt: 5000 },
  { id: 402, date: "2025-05-13", projectId: 1, material: "MAT001", type: "OUT", qty: 180, rate: 380, ref: "", issuedTo: "M/s Patel Works", createdAt: 5001 },
  { id: 403, date: "2025-05-14", projectId: 2, material: "MAT002", type: "IN", qty: 8, rate: 58000, ref: "DC-2302", issuedTo: "", createdAt: 5002 },
  { id: 404, date: "2025-05-14", projectId: 2, material: "MAT005", type: "OUT", qty: 3500, rate: 9, ref: "", issuedTo: "M/s Singh Constructions", createdAt: 5003 },
];

export const SD_INDENTS = [
  { id: 501, date: "2025-05-14", projectId: 2, items: [{ item: "Cement OPC 53", qty: 400, unit: "Bag" }, { item: "River Sand", qty: 20, unit: "Cum" }], urgency: "High", engineer: "Anil Sharma", status: "Pending Quotation", quotations: [], approvedIdx: null, noteForApproval: "Required urgently for slab pour on 18th May", poNumber: "", woNumber: "", notes: "Slab work blocked", createdAt: 6000 },
  { id: 502, date: "2025-05-13", projectId: 1, items: [{ item: "Acrylic Paint White", qty: 80, unit: "Litre" }], urgency: "Normal", engineer: "Ravi Kumar", status: "MD Review", approvedIdx: null, noteForApproval: "Painting scheduled 20th — please approve", poNumber: "", woNumber: "", notes: "Internal walls 2nd floor", createdAt: 6001, quotations: [{ vendor: "Asian Paints", rate: 145, total: 11600, delivery: "2 days", notes: "ISO certified, 5yr warranty" }, { vendor: "Berger Paints", rate: 138, total: 11040, delivery: "4 days", notes: "Standard quality" }] },
  { id: 503, date: "2025-05-11", projectId: 3, items: [{ item: "WBM Stone Aggregate", qty: 150, unit: "MT" }], urgency: "Critical", engineer: "Anil Sharma", status: "Approved", approvedIdx: 0, noteForApproval: "Critical path — road blocked without this", poNumber: "PO-2025-0511", woNumber: "WO-2025-0511", notes: "Road layer 2 urgent", createdAt: 6002, quotations: [{ vendor: "Granite Quarry Ltd", rate: 840, total: 126000, delivery: "1 day", notes: "Local supplier" }] },
];

export const SD_LABOUR = [
  { id: 601, date: "2025-05-15", projectId: 1, trade: "Mason", count: 18, subcon: "M/s Patel Works", incharge: "Suresh Rao", shift: "Day", remarks: "" },
  { id: 602, date: "2025-05-15", projectId: 1, trade: "Helper", count: 22, subcon: "M/s Patel Works", incharge: "Suresh Rao", shift: "Day", remarks: "" },
  { id: 603, date: "2025-05-15", projectId: 2, trade: "Mason", count: 14, subcon: "M/s Singh Constructions", incharge: "Vinod Nair", shift: "Day", remarks: "" },
  { id: 604, date: "2025-05-14", projectId: 1, trade: "Carpenter", count: 10, subcon: "M/s Kumar & Co", incharge: "Suresh Rao", shift: "Day", remarks: "Shuttering work" },
];

export const SD_ISSUES = [
  { id: 701, date: "2025-05-15", projectId: 1, title: "Concrete pump breakdown", description: "Pump stopped mid-pour. 1.5 hrs lost.", category: "Equipment", priority: "High", status: "Resolved", assignedTo: "Suresh Rao", resolvedDate: "2025-05-15", remarks: "Repaired on-site" },
  { id: 702, date: "2025-05-14", projectId: 2, title: "Brick quality issue", description: "2000 nos bricks rejected - high water absorption.", category: "Material", priority: "High", status: "Open", assignedTo: "Vinod Nair", resolvedDate: "", remarks: "Replacement requested" },
  { id: 703, date: "2025-05-12", projectId: 1, title: "Labour shortage", description: "Only 5 bar benders attended vs 12 required.", category: "Labour", priority: "Medium", status: "Open", assignedTo: "Ravi Kumar", resolvedDate: "", remarks: "" },
];

export const SD_SUBCON = [
  { id: 901, subcon: "M/s Patel Works", projectId: 1, date: "2025-05-10", type: "Work Order", description: "RCC works Block A - May", amount: 320000, paid: 200000, woNumber: "WO-2025-001", remarks: "Balance due 25 May" },
  { id: 902, subcon: "M/s Singh Constructions", projectId: 2, date: "2025-05-12", type: "Work Order", description: "Brickwork South Wing", amount: 180000, paid: 180000, woNumber: "WO-2025-002", remarks: "Fully paid" },
];

export const SD_VENDOR_LEDGER = [
  { id: 1001, vendor: "ACC Cements", projectId: 1, date: "2025-05-11", type: "Purchase", description: "Cement OPC 53 - 300 bags", poNumber: "PO-MAT-001", amount: 114000, invoiceAmount: 114000, paid: 114000, remarks: "Paid via NEFT" },
  { id: 1002, vendor: "SAIL Steel", projectId: 2, date: "2025-05-13", type: "Purchase", description: "TMT Fe500 - 8 MT", poNumber: "PO-MAT-002", amount: 464000, invoiceAmount: 468000, paid: 300000, remarks: "Balance pending" },
];

export const SD_VENDOR_DB = [
  { id: 2001, name: "Rajesh Gupta", company: "ACC Cements Distributor", mobile: "9876543210", altContact: "040-23456789", category: "Cement", location: "Hyderabad", materialType: "OPC/PPC Cement all grades", remarks: "Bulk discount available", cardPhoto: null },
  { id: 2002, name: "Suresh Patel", company: "SAIL Authorized Dealer", mobile: "9988776655", altContact: "", category: "Steel/TMT", location: "Bengaluru", materialType: "TMT Fe500/Fe550 all dia", remarks: "3 day delivery", cardPhoto: null },
];

export const SD_ORDERS = [
  { id: 3001, vendor: "SAIL Steel", projectId: 2, material: "Steel TMT Fe500", date: "2025-05-13", poNumber: "PO-MAT-002", orderedQty: 200, unit: "MT", rate: 58000, billStatus: "Partial", payStatus: "Partial", remarks: "Phased delivery", deliveries: [{ id: 1, date: "2025-05-13", qty: 150, dcNumber: "DC-101" }] },
  { id: 3002, vendor: "ACC Cements", projectId: 1, material: "Cement OPC 53", date: "2025-05-11", poNumber: "PO-MAT-001", orderedQty: 300, unit: "Bag", rate: 380, billStatus: "Complete", payStatus: "Paid", remarks: "Full delivery", deliveries: [{ id: 1, date: "2025-05-11", qty: 300, dcNumber: "DC-098" }] },
];

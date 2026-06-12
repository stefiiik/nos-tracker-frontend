import { useEffect, useState, useCallback } from "react";
import imagesMap from "./images_map";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine
} from "recharts";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const C = {
  bgMain:    "#0d0f13",
  bgSide:    "#13161c",
  bgCard:    "#1a1e27",
  bgRowOdd:  "#1e2230",
  bgRowEvn:  "#191d28",
  bgHeader:  "#141720",
  accent:    "#c8922a",
  accent2:   "#e0a832",
  textPri:   "#e8e8e8",
  textSec:   "#7a8099",
  textDim:   "#4a5068",
  green:     "#3ecf6e",
  red:       "#e05555",
  yellow:    "#e0c032",
  border:    "#252a38",
};

const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bgMain}; color: ${C.textPri}; font-family: 'Segoe UI', system-ui, sans-serif; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${C.bgMain}; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }

  .layout { display: flex; min-height: 100vh; }

  /* SIDEBAR */
  .sidebar {
    width: 210px; min-width: 210px; background: ${C.bgSide};
    display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh;
  }
  .logo-block { padding: 28px 20px 10px; }
  .logo-title { font-size: 18px; font-weight: 700; color: ${C.accent2}; }
  .logo-sub   { font-size: 11px; color: ${C.textSec}; margin-top: 2px; }
  .sidebar-divider { height: 1px; background: ${C.border}; margin: 10px 15px 18px; }
  .nav-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 24px; cursor: pointer; font-size: 14px; color: ${C.textSec};
    border-radius: 8px; margin: 3px 12px; transition: all .15s;
    background: transparent; border: none; width: calc(100% - 24px); text-align: left;
  }
  .nav-btn:hover { background: #1f2436; }
  .nav-btn.active {
    background: ${C.accent}; color: #111; font-weight: 700;
  }
  .nav-btn .icon { font-size: 15px; width: 18px; text-align: center; }
  .sidebar-section-label {
    font-size: 10px; font-weight: 700; color: ${C.textDim};
    padding: 0 18px 4px; margin-top: 4px; letter-spacing: .06em;
  }
  .sidebar-search {
    padding: 0 14px 8px;
  }
  .sidebar-search input {
    width: 100%; padding: 8px 12px; background: #0d0f13; border: 1px solid ${C.border};
    border-radius: 8px; color: ${C.textPri}; font-size: 13px; outline: none;
  }
  .sidebar-search input:focus { border-color: ${C.accent}; }
  .suggestions {
    background: #0d0f13; border: 1px solid ${C.border}; border-radius: 6px;
    margin: 0 14px; overflow: hidden;
  }
  .suggestion-item {
    padding: 7px 12px; font-size: 12px; color: ${C.textPri}; cursor: pointer;
  }
  .suggestion-item:hover { background: ${C.accent}; color: #111; }
  .sidebar-version {
    margin-top: auto; padding: 14px 18px; font-size: 9px; color: ${C.textDim};
  }

  /* MAIN */
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .topbar {
    height: 56px; background: ${C.bgSide}; display: flex; align-items: center;
    justify-content: space-between; padding: 0 28px; flex-shrink: 0;
  }
  .topbar-title { font-size: 22px; font-weight: 700; }
  .status { display: flex; align-items: center; gap: 6px; font-size: 12px; color: ${C.textSec}; }
  .status-dot { color: ${C.green}; font-size: 13px; }
  .content { flex: 1; overflow-y: auto; padding: 0; }
  .page { padding: 0 24px 40px; }
  .page-title { font-size: 22px; font-weight: 700; padding: 20px 0 4px; }
  .page-sub { font-size: 12px; color: ${C.textSec}; padding-bottom: 16px; }

  /* CARDS */
  .card {
    background: ${C.bgCard}; border-radius: 10px; overflow: hidden;
    margin-bottom: 16px;
  }
  .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
  .stat-card { background: ${C.bgCard}; border-radius: 10px; padding: 14px 16px 12px; }
  .stat-label { font-size: 11px; color: ${C.textSec}; margin-bottom: 6px; }
  .stat-value { font-size: 20px; font-weight: 700; }

  /* SECTION LABEL */
  .section-label {
    font-size: 10px; font-weight: 700; color: ${C.textDim};
    letter-spacing: .06em; padding: 16px 0 6px;
  }

  /* TABLE */
  .tbl-header {
    background: ${C.bgHeader}; display: flex; padding: 0 14px;
  }
  .tbl-header span {
    font-size: 10px; font-weight: 700; color: ${C.textDim};
    padding: 10px 0; letter-spacing: .05em;
  }
  .tbl-row {
    display: flex; align-items: center; padding: 0 14px;
    border-top: 1px solid ${C.border}; height: 44px; cursor: pointer;
    transition: background .1s;
  }
  .tbl-row:hover { background: #1f2436 !important; }
  .tbl-cell { display: flex; align-items: center; overflow: hidden; }
  .tbl-item-name { font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tbl-num { font-family: Consolas, monospace; font-size: 12px; color: ${C.textSec}; }
  .tbl-num.accent { color: ${C.accent2}; }
  .tbl-date { font-size: 11px; color: ${C.textDim}; }
  .trend-badge {
    font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px;
  }

  /* HISTORY TABLE */
  .hist-header { background: ${C.bgHeader}; display: flex; padding: 0 14px; }
  .hist-header span { font-size: 10px; font-weight: 700; color: ${C.textDim}; padding: 10px 0; letter-spacing: .05em; }
  .hist-row { display: flex; align-items: center; padding: 0 14px; height: 40px; }

  /* ANALYSIS */
  .analysis-hero { padding: 20px 24px 16px; }
  .analysis-header { display: flex; align-items: center; gap: 20px; margin-bottom: 16px; }
  .analysis-item-img { width: 80px; height: 80px; object-fit: contain; }
  .analysis-item-name { font-size: 26px; font-weight: 700; }
  .analysis-verdict { font-size: 18px; font-weight: 700; margin-top: 6px; }
  .analysis-cols { display: flex; gap: 12px; flex-wrap: wrap; }
  .analysis-col { background: ${C.bgHeader}; border-radius: 8px; padding: 10px 16px; min-width: 140px; }
  .analysis-col-label { font-size: 11px; color: ${C.textSec}; margin-bottom: 4px; }
  .analysis-col-val { font-size: 18px; font-weight: 700; }

  /* GRAPH */
  .chart-wrap { padding: 10px 16px 20px; }
  .chart-title { font-size: 16px; font-weight: 700; padding: 16px 20px 4px; }

  /* OCR / ITEMS PAGE */
  .ocr-card { padding: 20px 24px; }
  .ocr-paste-hint {
    background: ${C.bgHeader}; border-radius: 8px; padding: 14px 18px;
    font-size: 13px; color: ${C.textSec}; margin-bottom: 16px;
    border: 1px dashed ${C.border};
  }
  .ocr-paste-hint kbd {
    background: #252a38; padding: 2px 6px; border-radius: 4px; font-size: 12px; color: ${C.textPri};
  }
  .ocr-result { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
  .ocr-stat { background: ${C.bgHeader}; border-radius: 8px; padding: 10px 14px; }
  .ocr-stat-label { font-size: 10px; color: ${C.textSec}; letter-spacing: .05em; margin-bottom: 4px; }
  .ocr-stat-val { font-size: 17px; font-weight: 700; color: ${C.accent2}; }
  .ocr-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  .select-item {
    padding: 8px 12px; background: #0d0f13; border: 1px solid ${C.border};
    border-radius: 8px; color: ${C.textPri}; font-size: 13px; outline: none; min-width: 220px;
  }
  .select-item:focus { border-color: ${C.accent}; }
  .input-new {
    padding: 8px 12px; background: #0d0f13; border: 1px solid ${C.border};
    border-radius: 8px; color: ${C.textPri}; font-size: 13px; outline: none; min-width: 200px;
  }
  .input-new:focus { border-color: ${C.accent}; }

  /* BUTTONS */
  .btn-accent {
    padding: 9px 20px; background: ${C.accent}; color: #111; border: none;
    border-radius: 7px; font-size: 13px; font-weight: 700; cursor: pointer; transition: background .15s;
    white-space: nowrap;
  }
  .btn-accent:hover { background: ${C.accent2}; }
  .btn-ghost {
    padding: 8px 16px; background: transparent; color: ${C.textSec};
    border: 1px solid ${C.border}; border-radius: 7px; font-size: 13px; cursor: pointer;
    transition: background .15s; white-space: nowrap;
  }
  .btn-ghost:hover { background: ${C.bgRowOdd}; }

  /* GRAPH PAGE */
  .graph-ctrl { display: flex; gap: 10px; align-items: center; margin-bottom: 14px; flex-wrap: wrap; }
  .graph-select {
    padding: 8px 12px; background: #0d0f13; border: 1px solid ${C.border};
    border-radius: 8px; color: ${C.textPri}; font-size: 13px; outline: none; min-width: 200px;
  }
  .graph-select:focus { border-color: ${C.accent}; }

  /* EMPTY STATE */
  .empty-state { padding: 40px; text-align: center; color: ${C.textSec}; font-size: 14px; }

  /* TOOLTIP */
  .custom-tooltip {
    background: ${C.bgCard}; border: 1px solid ${C.border}; border-radius: 8px;
    padding: 10px 14px; font-size: 13px;
  }
  .custom-tooltip .label { color: ${C.textSec}; font-size: 11px; margin-bottom: 4px; }
  .custom-tooltip .val { font-weight: 700; color: ${C.accent2}; }

  /* RESPONSIVE */
  @media (max-width: 768px) {
    .sidebar { display: none; }
    .stats-row { grid-template-columns: 1fr; }
    .ocr-result { grid-template-columns: repeat(2,1fr); }
  }
`;

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt(n) {
  if (n == null) return "—";
  return Number(n).toLocaleString("cs-CZ");
}

function getItemImage(name) {
  return imagesMap[name] || null;
}

function TrendBadge({ median, history }) {
  if (!history || history.length < 2) return <span style={{ color: C.textDim, fontSize: 11 }}>— nová</span>;
  const hist = history.reduce((a, b) => a + b, 0) / history.length;
  const diff = ((median - hist) / hist) * 100;
  if (diff <= -10) return <span className="trend-badge" style={{ color: C.green, background: "#1a2e20" }}>▼ Výhodná</span>;
  if (diff >= 10)  return <span className="trend-badge" style={{ color: C.red,   background: "#2e1a1a" }}>▲ Drahá</span>;
  return <span className="trend-badge" style={{ color: C.yellow, background: "#2a2710" }}>● Normální</span>;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="label">{label}</div>
      <div className="val">{fmt(payload[0]?.value)}</div>
    </div>
  );
}

// ─── pages ──────────────────────────────────────────────────────────────────

function DashboardPage({ items, dashboard, onItemClick }) {
  const [filter, setFilter] = useState("");
  const filtered = filter
    ? items.filter(it => it.name.toLowerCase().includes(filter.toLowerCase()))
    : items;

  return (
    <div className="page">
      <div className="page-title">Přehled trhu</div>
      <div className="page-sub">Souhrn všech sledovaných itemů</div>

      {dashboard && (
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">SLEDOVANÉ ITEMY</div>
            <div className="stat-value">{dashboard.items}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">CELKEM MĚŘENÍ</div>
            <div className="stat-value">{dashboard.measurements}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">POSLEDNÍ MĚŘENÍ</div>
            <div className="stat-value" style={{ fontSize: 15 }}>{dashboard.last_update || "—"}</div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div className="section-label" style={{ padding: "16px 0 6px" }}>VŠECHNY ITEMY</div>
        <input
          className="input-new"
          placeholder="🔍  Hledat item..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ minWidth: 220, padding: "7px 12px", fontSize: 13 }}
        />
      </div>
      <div className="card">
        <div className="tbl-header">
          <span className="tbl-cell" style={{ flex: "0 0 260px" }}>ITEM</span>
          <span className="tbl-cell" style={{ flex: "0 0 120px", justifyContent: "flex-end" }}>MINIMUM</span>
          <span className="tbl-cell" style={{ flex: "0 0 120px", justifyContent: "flex-end" }}>MEDIÁN</span>
          <span className="tbl-cell" style={{ flex: "0 0 120px", justifyContent: "flex-end" }}>PRŮMĚR</span>
          <span className="tbl-cell" style={{ flex: "0 0 110px", justifyContent: "flex-end" }}>DATUM</span>
          <span className="tbl-cell" style={{ flex: 1, justifyContent: "center" }}>TREND</span>
        </div>
        {filtered.length === 0 && (
          <div className="empty-state">{filter ? `Žádný item neodpovídá „${filter}"` : "Žádná data. Začni analýzou screenshotu."}</div>
        )}
        {filtered.map((item, i) => (
          <div
            key={item.name}
            className="tbl-row"
            style={{ background: i % 2 === 0 ? C.bgRowOdd : C.bgRowEvn }}
            onClick={() => onItemClick(item.name)}
          >
            <div className="tbl-cell" style={{ flex: "0 0 260px", gap: 10 }}>
              {getItemImage(item.name) && (
                <img src={getItemImage(item.name)} alt="" style={{ width: 32, height: 32, objectFit: "contain" }} />
              )}
              <span className="tbl-item-name">{item.name}</span>
            </div>
            <div className="tbl-cell tbl-num" style={{ flex: "0 0 120px", justifyContent: "flex-end" }}>{fmt(item.minimum)}</div>
            <div className="tbl-cell tbl-num accent" style={{ flex: "0 0 120px", justifyContent: "flex-end" }}>{fmt(item.median)}</div>
            <div className="tbl-cell tbl-num" style={{ flex: "0 0 120px", justifyContent: "flex-end" }}>{fmt(item.average)}</div>
            <div className="tbl-cell tbl-date" style={{ flex: "0 0 110px", justifyContent: "flex-end" }}>{item.date}</div>
            <div className="tbl-cell" style={{ flex: 1, justifyContent: "center" }}>
              <TrendBadge median={item.median} history={item.medianHistory} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ItemsPage({ items }) {
  const [ocrResult, setOcrResult] = useState(null);
  const [selectedItem, setSelectedItem] = useState("");   // final picked name
  const [itemSearch, setItemSearch] = useState("");       // text in search box
  const [itemSuggs, setItemSuggs] = useState([]);         // dropdown suggestions
  const [newItemName, setNewItemName] = useState("");
  const [history, setHistory] = useState([]);
  const [histItem, setHistItem] = useState("");

  const handleItemSearch = (val) => {
    setItemSearch(val);
    setSelectedItem("__new__");                           // treat as new until picked
    if (!val) { setItemSuggs([]); return; }
    setItemSuggs(items.filter(it => it.name.toLowerCase().includes(val.toLowerCase())).slice(0, 8));
  };

  const pickItem = (name) => {
    setSelectedItem(name);
    setItemSearch(name);
    setItemSuggs([]);
  };

  const handlePaste = async (e) => {
    for (let ci of e.clipboardData.items) {
      if (ci.type.includes("image")) {
        const fd = new FormData();
        fd.append("file", ci.getAsFile());
        const res = await fetch(`${API}/analyze`, { method: "POST", body: fd });
        setOcrResult(await res.json());
      }
    }
  };

  const handleSave = async () => {
    let name = (selectedItem && selectedItem !== "__new__") ? selectedItem : itemSearch.trim();
    if (!name) { alert("Vyber nebo zadej název itemu"); return; }
    if (!ocrResult) { alert("Nejdříve vlož screenshot"); return; }
    const res = await fetch(`${API}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item: name, minimum: ocrResult.minimum, median: ocrResult.median, average: ocrResult.average }),
    });
    const data = await res.json();
    if (data.success) { alert("Uloženo!"); window.location.reload(); }
  };

  const loadHistory = async (name) => {
    if (!name) return;
    setHistItem(name);
    const res = await fetch(`${API}/history/${encodeURIComponent(name)}`);
    setHistory(await res.json());
  };

  return (
    <div className="page" tabIndex={0} onPaste={handlePaste} style={{ outline: "none" }}>
      <div className="page-title">Správa itemů</div>
      <div className="page-sub">Analyzuj screenshot a ulož ceny do databáze</div>

      <div className="card">
        <div className="ocr-card">
          <div className="ocr-paste-hint">
            📸 Udělej screenshot trhu: <kbd>Win + Shift + S</kbd> → vyberte oblast → <kbd>Ctrl + V</kbd> sem
          </div>

          {ocrResult && !ocrResult.error && (
            <div className="ocr-result">
              <div className="ocr-stat">
                <div className="ocr-stat-label">MINIMUM</div>
                <div className="ocr-stat-val">{fmt(ocrResult.minimum)}</div>
              </div>
              <div className="ocr-stat">
                <div className="ocr-stat-label">MEDIÁN</div>
                <div className="ocr-stat-val">{fmt(ocrResult.median)}</div>
              </div>
              <div className="ocr-stat">
                <div className="ocr-stat-label">PRŮMĚR</div>
                <div className="ocr-stat-val">{fmt(ocrResult.average)}</div>
              </div>
              <div className="ocr-stat">
                <div className="ocr-stat-label">POČET CEN</div>
                <div className="ocr-stat-val">{ocrResult.count}</div>
              </div>
            </div>
          )}
          {ocrResult?.error && (
            <div style={{ color: C.red, marginBottom: 12 }}>⚠ Nebyly nalezeny žádné ceny</div>
          )}

          <div style={{ marginBottom: 14, position: "relative" }}>
            <div style={{ fontSize: 11, color: C.textSec, marginBottom: 6, letterSpacing: ".05em" }}>ITEM</div>
            <input
              className="input-new"
              style={{ width: "100%", padding: "9px 12px", fontSize: 13 }}
              placeholder="Hledat nebo zadat název itemu..."
              value={itemSearch}
              onChange={e => handleItemSearch(e.target.value)}
              autoComplete="off"
            />
            {itemSuggs.length > 0 && (
              <div style={{
                position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10,
                background: C.bgHeader, border: `1px solid ${C.border}`, borderRadius: 8,
                overflow: "hidden", marginTop: 4, boxShadow: "0 8px 24px #00000060"
              }}>
                {itemSuggs.map(s => (
                  <div key={s.name} onClick={() => pickItem(s.name)} style={{
                    padding: "9px 14px", fontSize: 13, color: C.textPri, cursor: "pointer",
                    borderBottom: `1px solid ${C.border}`, transition: "background .1s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = C.accent}
                  onMouseLeave={e => e.currentTarget.style.background = ""}
                  >
                    {s.name}
                  </div>
                ))}
              </div>
            )}
            {itemSearch && itemSuggs.length === 0 && selectedItem === "__new__" && (
              <div style={{ fontSize: 11, color: C.textDim, marginTop: 5 }}>
                ➕ Uloží se jako nový item „{itemSearch}"
              </div>
            )}
            {selectedItem && selectedItem !== "__new__" && (
              <div style={{ fontSize: 11, color: C.green, marginTop: 5 }}>
                ✔ Existující item vybrán
              </div>
            )}
          </div>
          <div className="ocr-actions">
            <button className="btn-accent" onClick={handleSave} disabled={!ocrResult || !itemSearch.trim()}>💾 Uložit do DB</button>
          </div>
        </div>
      </div>

      <div className="section-label">HISTORIE ITEMU</div>
      <div className="card">
        <div style={{ padding: "14px 20px", display: "flex", gap: 10, alignItems: "center", borderBottom: `1px solid ${C.border}` }}>
          <select className="graph-select" value={histItem} onChange={e => loadHistory(e.target.value)}>
            <option value="">Vyber item...</option>
            {items.map(it => <option key={it.name} value={it.name}>{it.name}</option>)}
          </select>
        </div>
        {histItem && history.length === 0 && <div className="empty-state">Žádná data pro tento item.</div>}
        {history.length > 0 && (
          <>
            <div className="hist-header">
              <span style={{ flex: "0 0 180px" }}>DATUM</span>
              <span style={{ flex: "0 0 140px" }}>MINIMUM</span>
              <span style={{ flex: "0 0 140px" }}>MEDIÁN</span>
              <span style={{ flex: 1 }}>PRŮMĚR</span>
            </div>
            {history.map((row, i) => (
              <div key={i} className="hist-row" style={{ background: i % 2 === 0 ? C.bgRowOdd : C.bgRowEvn }}>
                <span style={{ flex: "0 0 180px", fontSize: 11, color: C.textSec }}>{row.date}</span>
                <span style={{ flex: "0 0 140px", fontFamily: "Consolas,monospace", fontSize: 12, color: C.textSec }}>{fmt(row.min_price)}</span>
                <span style={{ flex: "0 0 140px", fontFamily: "Consolas,monospace", fontSize: 12, color: C.accent2 }}>{fmt(row.median)}</span>
                <span style={{ flex: 1, fontFamily: "Consolas,monospace", fontSize: 12, color: C.textSec }}>{fmt(row.average)}</span>
              </div>
            ))}
          </>
        )}
        {!histItem && <div className="empty-state">Vyber item pro zobrazení historie.</div>}
      </div>
    </div>
  );
}


function AnalysisPage({ items, preselect }) {
  const [selected, setSelected] = useState(preselect || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (preselect) { setSelected(preselect); runAnalysis(preselect); }
  }, [preselect]);

  const runAnalysis = async (name) => {
    if (!name) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/analyze_price/${encodeURIComponent(name)}`);
      setResult(await res.json());
    } finally { setLoading(false); }
  };

  const verdict = result
    ? result.diff_pct <= -10
      ? { text: "Výhodná cena", color: C.green, icon: "🟢" }
      : result.diff_pct >= 10
      ? { text: "Nad běžnou cenou", color: C.red, icon: "🔴" }
      : { text: "Normální cena", color: C.yellow, icon: "🟡" }
    : null;

  const chartData = result?.history?.map((v, i) => ({ i, median: v })) || [];

  return (
    <div className="page">
      <div className="page-title">Analýza ceny</div>
      <div className="page-sub">Porovnání aktuální ceny s historickým mediánem</div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <select className="graph-select" value={selected} onChange={e => setSelected(e.target.value)}>
          <option value="">Vyber item...</option>
          {items.map(it => <option key={it.name} value={it.name}>{it.name}</option>)}
        </select>
        <button className="btn-accent" onClick={() => runAnalysis(selected)} disabled={!selected || loading}>
          {loading ? "Analyzuji..." : "◎ Analyzovat"}
        </button>
      </div>

      {result && !result.error && verdict && (
        <>
          <div className="card">
            <div className="analysis-hero">
              <div className="analysis-header">
                {getItemImage(result.item) && (
                  <img className="analysis-item-img" src={getItemImage(result.item)} alt="" />
                )}
                <div>
                  <div className="analysis-item-name">{result.item}</div>
                  <div className="analysis-verdict" style={{ color: verdict.color }}>
                    {verdict.icon} {verdict.text}
                  </div>
                </div>
              </div>
              <div className="analysis-cols">
                <div className="analysis-col">
                  <div className="analysis-col-label">AKTUÁLNÍ MEDIÁN</div>
                  <div className="analysis-col-val" style={{ color: C.accent2 }}>{fmt(result.current_median)}</div>
                </div>
                <div className="analysis-col">
                  <div className="analysis-col-label">HISTORICKÝ MEDIÁN</div>
                  <div className="analysis-col-val">{fmt(result.hist_median)}</div>
                </div>
                <div className="analysis-col">
                  <div className="analysis-col-label">ROZDÍL</div>
                  <div className="analysis-col-val" style={{ color: verdict.color }}>
                    {result.diff_pct > 0 ? "+" : ""}{result.diff_pct?.toFixed(2)} %
                  </div>
                </div>
                <div className="analysis-col">
                  <div className="analysis-col-label">POČET MĚŘENÍ</div>
                  <div className="analysis-col-val">{result.count}</div>
                </div>
              </div>
            </div>
          </div>

          {chartData.length >= 2 && (
            <div className="card">
              <div className="chart-title">📈 Vývoj ceny</div>
              <div className="chart-wrap" style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
                    <XAxis dataKey="i" tick={false} />
                    <YAxis tickFormatter={v => new Intl.NumberFormat("cs-CZ").format(v)} tick={{ fill: C.textDim, fontSize: 11 }} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={result.hist_median} stroke={C.textDim} strokeDasharray="4 4" label={{ value: "hist. med.", fill: C.textDim, fontSize: 10 }} />
                    <Line
                      type="monotone" dataKey="median"
                      stroke={result.diff_pct <= -10 ? C.green : result.diff_pct >= 10 ? C.red : C.accent2}
                      strokeWidth={3} dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="section-label">STATISTIKY ITEMU</div>
          <div className="card" style={{ padding: "16px 24px" }}>
            {[
              ["Počet měření", result.count],
              ["První měření", result.first_date || "—"],
              ["Poslední měření", result.last_date || "—"],
              ["Poslední minimum", fmt(result.last_min)],
              ["Poslední medián", fmt(result.current_median)],
              ["Poslední průměr", fmt(result.last_avg)],
            ].map(([lbl, val]) => (
              <div key={lbl} style={{ display: "flex", padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ width: 200, fontSize: 13, color: C.textSec }}>{lbl}</span>
                <span style={{ fontFamily: "Consolas,monospace", fontSize: 13 }}>{val}</span>
              </div>
            ))}
          </div>
        </>
      )}
      {result?.error && <div style={{ color: C.red, padding: 20 }}>⚠ {result.error}</div>}
      {!result && <div className="card"><div className="empty-state">Vyber item a klikni Analyzovat.</div></div>}
    </div>
  );
}

// ─── main app ───────────────────────────────────────────────────────────────

const PAGES = [
  { key: "dashboard", icon: "◈", label: "Dashboard" },
  { key: "analysis",  icon: "◎", label: "Analýza" },
  { key: "items",     icon: "⊞", label: "Vložení" },
];

const PAGE_TITLES = {
  dashboard: "Dashboard",
  items: "Vložení",
  analysis: "Analýza ceny",
};

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [items, setItems] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [analysisTarget, setAnalysisTarget] = useState(null);

  useEffect(() => {
    fetch(`${API}/items`).then(r => r.json()).then(setItems);
    fetch(`${API}/dashboard`).then(r => r.json()).then(setDashboard);
  }, []);

  useEffect(() => {
    if (!search) { setSuggestions([]); return; }
    setSuggestions(items.filter(it => it.name.toLowerCase().includes(search.toLowerCase())).slice(0, 6));
  }, [search, items]);

  const handleItemClick = useCallback((name) => {
    setAnalysisTarget(name);
    setSearch(name);
    setPage("analysis");
  }, []);

  const pickSuggestion = (name) => {
    setSearch(name);
    setSuggestions([]);
    handleItemClick(name);
  };

  return (
    <>
      <style>{css}</style>
      <div className="layout">
        <aside className="sidebar">
          <div className="logo-block">
            <div className="logo-title">NosTale</div>
            <div className="logo-sub">Market Tracker</div>
          </div>
          <div className="sidebar-divider" />

          {PAGES.map(p => (
            <button
              key={p.key}
              className={`nav-btn${page === p.key ? " active" : ""}`}
              onClick={() => setPage(p.key)}
            >
              <span className="icon">{p.icon}</span>
              {p.label}
            </button>
          ))}

          <div className="sidebar-divider" style={{ marginTop: 18 }} />
          <div className="sidebar-section-label">ITEM</div>
          <div className="sidebar-search">
            <input
              placeholder="Název itemu..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {suggestions.length > 0 && (
            <div className="suggestions">
              {suggestions.map(s => (
                <div key={s.name} className="suggestion-item" onClick={() => pickSuggestion(s.name)}>
                  {s.name}
                </div>
              ))}
            </div>
          )}

          <div className="sidebar-version">v2.0 · NosTale MT</div>
        </aside>

        <div className="main">
          <div className="topbar">
            <span className="topbar-title">{PAGE_TITLES[page]}</span>
            <div className="status">
              <span className="status-dot">●</span>
              <span>DB připojena</span>
            </div>
          </div>
          <div className="content">
            {page === "dashboard" && <DashboardPage items={items} dashboard={dashboard} onItemClick={handleItemClick} />}
            {page === "items"     && <ItemsPage items={items} />}
            {page === "analysis"  && <AnalysisPage items={items} preselect={analysisTarget} />}
          </div>
        </div>
      </div>
    </>
  );
}

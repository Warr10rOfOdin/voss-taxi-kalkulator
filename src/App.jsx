import React, { useEffect, useMemo, useRef, useState } from "react";
import "./index.css";

/* ============================================================
   CONSTANTS & DEFAULTS
============================================================ */
const PERIODS = ["Dag", "Kveld", "Laurdag", "Helg/Natt", "Høytid"];
const GROUPS = ["1–4", "5–6", "7–8", "9–16"];
const GROUP_LABELS = {
  "1–4": "1-4 Personer",
  "5–6": "5-6 Personer",
  "7–8": "7-8 Personer",
  "9–16": "9-16 Personer",
};
const DEFAULT_START = "Hestavangen 11, Voss";
const PASSWORD = "Hestavangen11";

/* Official tariff values (from your sheet) */
const TARIFFS_DEFAULT = {
  "1–4": {
    "Dag":       { min:8.42,  km:11.14,  km10:21.23, start:58,  frammote:97,  minste:128 },
    "Kveld":     { min:10.19, km:14.76,  km10:25.65, start:70,  frammote:117, minste:155 },
    "Laurdag":   { min:10.95, km:15.06,  km10:27.56, start:75,  frammote:126, minste:166 },
    "Helg/Natt": { min:11.37, km:16.47,  km10:28.62, start:78,  frammote:131, minste:173 },
    "Høytid":    { min:12.21, km:17.69,  km10:30.74, start:84,  frammote:141, minste:186 }
  },
  "5–6": {
    "Dag":       { min:10.95, km:14.48,  km10:27.60, start:75.4,  frammote:126.1,  minste:166.4 },
    "Kveld":     { min:13.47, km:17.82,  km10:33.97, start:90.9,  frammote:151.1,  minste:201.5 },
    "Laurdag":   { min:14.24, km:18.29,  km10:36.23, start:97.5,  frammote:163.8,  minste:222.2 },
    "Helg/Natt": { min:14.78, km:19.16,  km10:38.63, start:101.4, frammote:170.3,  minste:232.5 },
    "Høytid":    { min:15.84, km:20.51,  km10:41.04, start:109.2, frammote:183.3,  minste:250.8 }
  },
  "7–8": {
    "Dag":       { min:13.47, km:17.82,  km10:33.97, start:92.8,  frammote:155.2,  minste:204.8 },
    "Kveld":     { min:16.39, km:21.56,  km10:41.28, start:112,   frammote:186.5,  minste:241.6 },
    "Laurdag":   { min:17.52, km:22.59,  km10:44.11, start:120,   frammote:199.1,  minste:266.5 },
    "Helg/Natt": { min:18.19, km:23.53,  km10:47.04, start:124.8, frammote:206,    minste:278.4 },
    "Høytid":    { min:19.54, km:25.09,  km10:50.82, start:134.4, frammote:221.7,  minste:297.6 }
  },
  "9–16": {
    "Dag":       { min:16.84, km:22.28,  km10:42.46, start:116,   frammote:194,    minste:256 },
    "Kveld":     { min:20.38, km:26.53,  km10:51.30, start:140,   frammote:234,    minste:310 },
    "Laurdag":   { min:21.90, km:28.12,  km10:56.16, start:150,   frammote:251,    minste:344 },
    "Helg/Natt": { min:22.74, km:29.11,  km10:59.23, start:156,   frammote:260,    minste:359 },
    "Høytid":    { min:24.42, km:31.11,  km10:63.03, start:168,   frammote:280,    minste:372 }
  }
};

const PERIOD_FACTOR = { "Dag":1, "Kveld":1.21, "Laurdag":1.30, "Helg/Natt":1.35, "Høytid":1.45 };

/* ============================================================
   HELPERS
============================================================ */
function getRecentAddresses(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
}
function saveRecentAddress(key, addr) {
  if (!addr || addr.length < 2) return;
  let list = getRecentAddresses(key).filter(x => x !== addr);
  list.unshift(addr);
  if (list.length > 8) list = list.slice(0, 8);
  localStorage.setItem(key, JSON.stringify(list));
}

/* Excel-accurate “Dag” base (minutes price = 1–4 Dag) */
function calcDayFareForGroup(tariffs, group, km, min) {
  const kmNum = Number(km) || 0;
  const minNum = Number(min) || 0;
  const gDay = tariffs[group]["Dag"];
  const minutePrice14 = tariffs["1–4"]["Dag"].min;

  let sum =
    kmNum <= 10
      ? gDay.frammote + gDay.km * kmNum + minutePrice14 * minNum
      : gDay.frammote + gDay.km * 10 + gDay.km10 * (kmNum - 10) + minutePrice14 * minNum;

  if (sum < gDay.minste) sum = gDay.minste;
  return Math.round(sum);
}
function calcFarePeriod(tariffs, group, period, km, min) {
  return Math.round(calcDayFareForGroup(tariffs, group, km, min) * (PERIOD_FACTOR[period] ?? 1));
}

/* ============================================================
   GOOGLE MAPS JS LOADER
============================================================ */
let mapsJsPromise;
function loadMapsJs() {
  if (!mapsJsPromise) {
    const key = import.meta.env.VITE_GOOGLE_MAPS_KEY;
    mapsJsPromise = new Promise((resolve, reject) => {
      if (window.google?.maps?.places) return resolve(window.google.maps);
      const s = document.createElement("script");
      s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&language=no&libraries=places`;
      s.async = true;
      s.onerror = reject;
      s.onload = () => resolve(window.google.maps);
      document.head.appendChild(s);
    });
  }
  return mapsJsPromise;
}

/* ============================================================
   ADDRESS INPUT (absolute dropdown, clear button, Husnr)
============================================================ */
function AddressInput({
  label,
  value,
  onChange,
  onSelect,
  onPlaceSelect,
  onRecenter,
  placeholder,
  storageKey,
  houseNo,
  setHouseNo,
  width = 380,
}) {
  const [open, setOpen] = useState(false);
  const [pred, setPred] = useState([]); // [{ description, place_id }]
  const husnrRef = useRef(null);

  // predictions via JS SDK
  useEffect(() => {
    let active = true;
    async function run() {
      const maps = await loadMapsJs();
      const q = (value || "").trim();
      if (q.length < 2) { if (active) setPred([]); return; }
      const svc = new maps.places.AutocompleteService();
      svc.getPlacePredictions(
        { input: q, componentRestrictions: { country: "no" } },
        (res) => {
          if (!active) return;
          setPred((res || []).map(r => ({ description: r.description, place_id: r.place_id })).slice(0, 4));
        }
      );
    }
    const t = setTimeout(run, 140);
    return () => { active = false; clearTimeout(t); };
  }, [value]);

  const recentAll = getRecentAddresses(storageKey);
  const q = (value || "").toLowerCase();
  const recentFiltered = recentAll
    .filter(r => !pred.some(p => p.description === r))
    .filter(r => !q || r.toLowerCase().includes(q))
    .slice(0, 4);

  async function choosePrediction(p) {
    const maps = await loadMapsJs();
    const detailSvc = new maps.places.PlacesService(document.createElement("div"));
    detailSvc.getDetails(
      { placeId: p.place_id, fields: ["place_id", "formatted_address", "geometry"] },
      (place, status) => {
        if (status !== maps.places.PlacesServiceStatus.OK || !place) {
          onSelect(p.description);
          return;
        }
        const formatted = place.formatted_address || p.description;
        onSelect(formatted);
        onPlaceSelect?.({ placeId: place.place_id, formatted_address: formatted });
        if (husnrRef.current) husnrRef.current.focus();
        const loc = place.geometry?.location;
        if (loc && onRecenter) onRecenter({ lat: loc.lat(), lng: loc.lng() });
        saveRecentAddress(storageKey, formatted);
      }
    );
  }

  function clearAll() {
    onSelect("");
    onChange("");
    onPlaceSelect?.(null);
    setHouseNo?.("");
  }

  return (
    <div className="addr-wrap" style={{ gridTemplateColumns: `max-content ${width}px max-content` }}>
      <label className="addr-label">{label}</label>

      <div className="addr-input-wrap" style={{ width }}>
        <input
          className="addr-input"
          type="text"
          value={value}
          autoComplete="off"
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          placeholder={placeholder}
        />
        {value && (
          <button
            type="button"
            className="addr-clear"
            onMouseDown={e => e.preventDefault()}
            onClick={clearAll}
            title="Tøm"
          >×</button>
        )}

        {open && (pred.length || recentFiltered.length) ? (
          <div className="addr-drop">
            {pred.map(p => (
              <div
                key={p.place_id}
                className="addr-item addr-item--pred"
                onMouseDown={e => { e.preventDefault(); choosePrediction(p); }}
              >
                {p.description}
              </div>
            ))}
            {recentFiltered.length > 0 && (
              <div className="addr-recent-title">Tidligere søk</div>
            )}
            {recentFiltered.map((addr, i) => (
              <div
                key={`r-${i}-${addr}`}
                className="addr-item"
                onMouseDown={e => { e.preventDefault(); onSelect(addr); onPlaceSelect?.(null); if (husnrRef.current) husnrRef.current.focus(); }}
              >
                {addr}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="addr-husnr">
        <span>Husnr</span>
        <input
          ref={husnrRef}
          className="husnr-input"
          type="text"
          inputMode="numeric"
          value={houseNo}
          onChange={e => setHouseNo?.(e.target.value)}
          placeholder="1814"
        />
      </div>
    </div>
  );
}

/* ============================================================
   FIXED PRICES MODAL (simple CRUD + import/export)
============================================================ */
function FixedPricesModal({ show, onClose }) {
  const seed = [
    { id: 1, from: "Voss", to: "Gudvangen", group: "1–4", period: "Dag", price: 1450 },
    { id: 2, from: "Voss", to: "Flåm",      group: "1–4", period: "Dag", price: 2200 },
    { id: 3, from: "Voss", to: "Tvindefossen", group: "1–4", period: "Dag", price: 600 },
  ];
  const [list, setList] = useState(() => {
    try { return JSON.parse(localStorage.getItem("fixed_prices_v1")) || seed; }
    catch { return seed; }
  });
  const [q, setQ] = useState("");
  const [sort, setSort] = useState({ key: "to", dir: "asc" });
  const [form, setForm] = useState({ from:"Voss", to:"", group:"1–4", period:"Dag", price:"" });
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");

  useEffect(()=>{ localStorage.setItem("fixed_prices_v1", JSON.stringify(list)); }, [list]);

  const filtered = useMemo(() => {
    const arr = list.filter(r => (`${r.from} ${r.to} ${r.group} ${r.period}`).toLowerCase().includes(q.toLowerCase()));
    const dir = sort.dir === "asc" ? 1 : -1;
    return arr.sort((a,b) => {
      const ka = (a[sort.key] ?? "").toString().toLowerCase();
      const kb = (b[sort.key] ?? "").toString().toLowerCase();
      if (ka < kb) return -1 * dir;
      if (ka > kb) return  1 * dir;
      return 0;
    });
  }, [list, q, sort]);

  function addRow(e){
    e.preventDefault();
    const price = Number(form.price);
    if (!form.to || isNaN(price)) return;
    setList(prev => [{ id: Date.now(), ...form, price }, ...prev]);
    setForm({ from:"Voss", to:"", group:"1–4", period:"Dag", price:"" });
  }
  function remove(id){ setList(prev => prev.filter(x => x.id !== id)); }
  function toggleSort(key){ setSort(s => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }); }
  function exportJson(){
    const blob = new Blob([JSON.stringify(list, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "turistpriser.json"; a.click();
    URL.revokeObjectURL(url);
  }
  function parseImport(){
    try {
      const txt = importText.trim();
      if (!txt) return;
      if (txt.startsWith("[") || txt.startsWith("{")) {
        const obj = JSON.parse(txt);
        const arr = Array.isArray(obj) ? obj : obj.rows;
        if (!Array.isArray(arr)) throw new Error("JSON must be an array or {rows:[...]}")
        const norm = arr.map((r,i) => ({
          id: Date.now() + i,
          from: r.from ?? "Voss",
          to: r.to ?? r.destination ?? r.name ?? "",
          group: r.group ?? r.seats ?? "1–4",
          period: r.period ?? r.tariff ?? "Dag",
          price: Number(r.price ?? r.amount ?? 0)
        })).filter(x => x.to && !Number.isNaN(x.price));
        if (!norm.length) throw new Error("No valid rows in JSON");
        setList(norm); setImportOpen(false); setImportText(""); return;
      }

      const lines = txt.split(/\r?\n/).filter(Boolean);
      const rows = [];
      const split = (line) => {
        const out = []; let cur = "", inQ = false;
        for (let ch of line) { if (ch === '"') { inQ=!inQ; continue; } if (ch===',' && !inQ){ out.push(cur.trim()); cur=""; continue; } cur+=ch; }
        out.push(cur.trim()); return out;
      };
      let start = 0; let cols = ["from","to","group","period","price"];
      const first = split(lines[0]).map(s=>s.toLowerCase());
      if (first.some(c => ["to","til","destinasjon","pris","price"].includes(c))) { cols = first; start = 1; }
      for (let i=start;i<lines.length;i++){
        const parts = split(lines[i]); const rec = {};
        for (let c=0;c<parts.length;c++){
          const key = (cols[c] || "").toLowerCase(); const val = parts[c];
          if (["from","fra"].includes(key)) rec.from = val || "Voss";
          if (["to","til","destinasjon","mål"].includes(key)) rec.to = val;
          if (["group","gruppe","seats"].includes(key)) rec.group = val || "1–4";
          if (["period","periode","tariff"].includes(key)) rec.period = val || "Dag";
          if (["price","pris","amount"].includes(key)) rec.price = Number((val||"").replace(/[^\d.]/g,""));
        }
        rows.push(rec);
      }
      const norm = rows.filter(r => r.to && !Number.isNaN(r.price)).map((r,i)=>({
        id: Date.now()+i, from:r.from||"Voss", to:r.to, group:r.group||"1–4", period:r.period||"Dag", price:r.price
      }));
      if (!norm.length) throw new Error("No valid rows in CSV");
      setList(norm); setImportOpen(false); setImportText("");
    } catch (e) { alert("Import-feil: " + e.message); }
  }

  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-head">
          <div className="title">Turistpriser / Fastpriser</div>
          <div className="head-actions">
            <button className="btn btn-blue" onClick={()=>setImportOpen(o=>!o)}>Importer</button>
            <button className="btn btn-green" onClick={exportJson}>Eksporter</button>
            <button className="btn" onClick={onClose}>Lukk</button>
          </div>
        </div>

        {importOpen && (
          <div className="import-box">
            <div className="import-title">Lim inn CSV eller JSON under, og trykk “Last inn”</div>
            <textarea
              rows={6}
              value={importText}
              onChange={e=>setImportText(e.target.value)}
              placeholder={`Eksempel CSV:\nfrom,to,group,period,price\nVoss,Gudvangen,1–4,Dag,1450\nVoss,Flåm,1–4,Dag,2200`}
            />
            <div className="import-actions">
              <button className="btn btn-purple" onClick={parseImport}>Last inn</button>
              <button className="btn" onClick={()=>{setImportOpen(false);setImportText("");}}>Avbryt</button>
            </div>
          </div>
        )}

        <div className="modal-body">
          <div className="filter-row">
            <input
              value={q}
              onChange={e=>setQ(e.target.value)}
              placeholder="Søk (sted, periode, gruppe)…"
              className="input"
            />
          </div>

          <table className="prices-table">
            <thead>
              <tr>
                <th onClick={()=>toggleSort("from")}>Fra</th>
                <th onClick={()=>toggleSort("to")}>Til</th>
                <th onClick={()=>toggleSort("group")}>Gruppe</th>
                <th onClick={()=>toggleSort("period")}>Periode</th>
                <th onClick={()=>toggleSort("price")}>Pris (kr)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td>{r.from}</td>
                  <td>{r.to}</td>
                  <td className="center">{r.group}</td>
                  <td className="center">{r.period}</td>
                  <td className="right">kr {r.price.toLocaleString("no-NO")}</td>
                  <td className="right">
                    <button className="btn btn-danger" onClick={()=>remove(r.id)}>Slett</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="muted">Ingen treff.</td></tr>
              )}
            </tbody>
          </table>

          <div className="add-title">Legg til ny fastpris</div>
          <form onSubmit={addRow} className="add-grid">
            <input className="input" value={form.from} onChange={e=>setForm(f=>({...f, from:e.target.value}))} placeholder="Fra" />
            <input className="input" value={form.to} onChange={e=>setForm(f=>({...f, to:e.target.value}))} placeholder="Til (sted/attraksjon)" />
            <select className="input" value={form.group} onChange={e=>setForm(f=>({...f, group:e.target.value}))}>
              <option>1–4</option><option>5–6</option><option>7–8</option><option>9–16</option>
            </select>
            <select className="input" value={form.period} onChange={e=>setForm(f=>({...f, period:e.target.value}))}>
              <option>Dag</option><option>Kveld</option><option>Laurdag</option><option>Helg/Natt</option><option>Høytid</option>
            </select>
            <input className="input" type="number" step="1" value={form.price} onChange={e=>setForm(f=>({...f, price:e.target.value}))} placeholder="Pris" />
            <button className="btn btn-purple" type="submit">Legg til</button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TARIFF EDITOR MODAL (password-gated)
============================================================ */
function TariffModal({ show, onClose, tariffs, setTariffs }) {
  const [local, setLocal] = useState(() => JSON.parse(JSON.stringify(tariffs)));
  useEffect(() => { setLocal(JSON.parse(JSON.stringify(tariffs))); }, [tariffs, show]);

  function handleChange(g, p, f, val) {
    setLocal(obj => { const c = {...obj}; c[g][p][f] = Number(val); return c; });
  }
  if (!show) return null;

  const FIELDS = [
    { key: "min", label: "Minutt" },
    { key: "km", label: "Km (0-10)" },
    { key: "km10", label: "Km >10" },
    { key: "start", label: "Startpris" },
    { key: "frammote", label: "Frammøte" },
    { key: "minste", label: "Minstepris" },
  ];

  return (
    <div className="modal-backdrop">
      <div className="modal-card lg">
        <div className="modal-head">
          <div className="title">Rediger takster</div>
          <div className="head-actions">
            <button className="btn" onClick={onClose}>Lukk</button>
          </div>
        </div>

        <div className="modal-body">
          <table className="edit-table">
            <thead>
              <tr>
                <th></th>
                {PERIODS.map(p => <th key={p}>{p}</th>)}
              </tr>
            </thead>
            <tbody>
              {GROUPS.map(g =>
                FIELDS.map(field => (
                  <tr key={g+field.key}>
                    <td className="edit-label">
                      {GROUP_LABELS[g]} <br/><span>{field.label}</span>
                    </td>
                    {PERIODS.map(p =>
                      <td key={g+p+field.key}>
                        <input
                          className="input small"
                          type="number"
                          value={local[g][p][field.key]}
                          onChange={e=>handleChange(g,p,field.key,e.target.value)}
                        />
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="tariff-actions">
            <button className="btn btn-purple"
              onClick={() => { setTariffs(local); localStorage.setItem("custom_tariffs", JSON.stringify(local)); onClose(); }}
            >
              Lagre takster
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN APP
============================================================ */
export default function App() {
  const [fra, setFra] = useState("");
  const [til, setTil] = useState("");
  const [fraNo, setFraNo] = useState("");
  const [tilNo, setTilNo] = useState("");
  const [fraPlace, setFraPlace] = useState(null);
  const [tilPlace, setTilPlace] = useState(null);

  const [manuellKm, setManuellKm] = useState("");
  const [manuellMin, setManuellMin] = useState("");
  const [km, setKm] = useState("");
  const [min, setMin] = useState("");
  const [feil, setFeil] = useState("");
  const [loading, setLoading] = useState(false);

  const [tariffs, setTariffs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("custom_tariffs")) || TARIFFS_DEFAULT; }
    catch { return TARIFFS_DEFAULT; }
  });
  const [editing, setEditing] = useState(false);
  const [password, setPassword] = useState("");
  const [editAuth, setEditAuth] = useState(false);

  const [showFixed, setShowFixed] = useState(false);

  const printAreaRef = useRef(null);

  // Map + routing
  const mapHostRef = useRef(null);
  const [mapObj, setMapObj] = useState(null);
  const directionsRendererRef = useRef(null);
  const previewMarkerRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const maps = await loadMapsJs();
      if (!mounted) return;
      const map = new maps.Map(mapHostRef.current, {
        center: { lat: 60.628, lng: 6.414 }, // Voss-ish
        zoom: 11,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      const dr = new maps.DirectionsRenderer({ map, suppressMarkers: false });
      setMapObj(map);
      directionsRendererRef.current = dr;
    })();
    return () => { mounted = false; };
  }, []);

  function printPDF() {
    const printContents = printAreaRef.current.innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Taxi kalkulator – Voss</title>
      <style>
        body { background:#fff;color:#222;font-family:Arial,Helvetica,sans-serif }
        table { border-collapse:collapse;width:100% }
        th,td { border:1px solid #aaa;padding:1em }
        th { background:#f6c745;color:#111 }
        td { background:#f9f9f9 }
        h1 { font-size:2.1em;margin:0 0 .4em 0 }
      </style></head><body>
      <div style="margin-bottom:1.2em">
        <h1>Taxi kalkulator – Voss</h1>
        <div><b>Fra:</b> ${fra || DEFAULT_START} &nbsp; <b>Til:</b> ${til || ""} &nbsp; <b>Km:</b> ${manuellKm||km||"-"} &nbsp; <b>Min:</b> ${manuellMin||min||"-"}</div>
      </div>
      ${printContents}
      </body></html>
    `);
    win.document.close(); win.focus(); setTimeout(()=>win.print(), 300);
  }

  // Recenter map when prediction picked
  function recenterMap(pos) {
    if (!mapObj || !pos) return;
    mapObj.setCenter(pos);
    mapObj.setZoom(14);
    const maps = window.google.maps;
    if (!previewMarkerRef.current) {
      previewMarkerRef.current = new maps.Marker({ position: pos, map: mapObj });
    } else {
      previewMarkerRef.current.setPosition(pos);
      previewMarkerRef.current.setMap(mapObj);
    }
  }

  function withNo(text, no) {
    const t = (text || "").trim();
    const n = (no || "").toString().trim();
    return t && n ? `${t} ${n}` : t;
  }

  async function hentFraGoogle() {
    setFeil(""); setLoading(true);
    const maps = await loadMapsJs();

    let origin = fraPlace?.placeId ? { placeId: fraPlace.placeId } : null;
    let originText = withNo(fra || DEFAULT_START, fraNo) || DEFAULT_START;

    let destination = tilPlace?.placeId ? { placeId: tilPlace.placeId } : null;
    let destinationText = withNo(til, tilNo);

    if (!destinationText) { setFeil("Du må skrive inn et gyldig reisemål."); setLoading(false); return; }

    const geocoder = new maps.Geocoder();
    async function geocodeAddress(addr) { return new Promise((res) => geocoder.geocode({ address: addr }, (r) => res(r?.[0] || null))); }

    if (!origin) { const r = await geocodeAddress(originText); origin = r?.place_id ? { placeId: r.place_id } : originText; }
    if (!destination) { const r = await geocodeAddress(destinationText); destination = r?.place_id ? { placeId: r.place_id } : destinationText; }

    try {
      const svc = new maps.DirectionsService();
      const result = await svc.route({ origin, destination, travelMode: maps.TravelMode.DRIVING });

      const leg = result.routes[0].legs[0];
      setKm((leg.distance.value / 1000).toFixed(2));
      setMin((leg.duration.value / 60).toFixed(0));
      setManuellKm(""); setManuellMin("");

      if (directionsRendererRef.current) {
        directionsRendererRef.current.setDirections(result);
        const bounds = new maps.LatLngBounds();
        result.routes[0].overview_path.forEach(pt => bounds.extend(pt));
        mapObj && mapObj.fitBounds(bounds, { top: 40, bottom: 40, left: 40, right: 40 });
      }

      saveRecentAddress("recent_fra", originText || DEFAULT_START);
      saveRecentAddress("recent_til", destinationText);
    } catch (e) {
      console.error(e);
      setFeil("Kunne ikke hente rute. Sjekk adresser, API-nøkkel og at Maps JavaScript/Places/Directions er aktivert.");
    }
    setLoading(false);
  }

  const aktivKm = manuellKm !== "" ? manuellKm : km;
  const aktivMin = manuellMin !== "" ? manuellMin : min;

  /* ===================== RENDER ===================== */
  return (
    <div className="page">
      {/* TOP CARD */}
      <div className="card top">
        <div className="top-inner">
          <h1 className="title">Taxi kalkulator – Voss</h1>

          {/* HORIZONTAL TOOLBAR */}
          <div className="toolbar">
            <AddressInput
              label="Startadresse:"
              value={fra}
              onChange={setFra}
              onSelect={val => setFra(val)}
              onPlaceSelect={setFraPlace}
              onRecenter={recenterMap}
              placeholder={DEFAULT_START}
              storageKey="recent_fra"
              houseNo={fraNo}
              setHouseNo={setFraNo}
              width={420}
            />
            <AddressInput
              label="Destinasjon:"
              value={til}
              onChange={setTil}
              onSelect={val => setTil(val)}
              onPlaceSelect={setTilPlace}
              onRecenter={recenterMap}
              placeholder="Adresse eller sted"
              storageKey="recent_til"
              houseNo={tilNo}
              setHouseNo={setTilNo}
              width={420}
            />
            <div className="toolbar-btncell">
              <button className="btn btn-purple btn-fat" onClick={hentFraGoogle} disabled={loading}>
                {loading ? "Henter km og tid ..." : "Hent km og tid fra Google Maps"}
              </button>
            </div>
          </div>

          {/* MANUAL INPUTS */}
          <div className="manual-hint">eller skriv inn manuelt:</div>
          <div className="manual-row">
            <div className="manual-field">
              <label>Kilometer:</label>
              <input className="input" type="number" step="0.01" value={manuellKm} onChange={e => setManuellKm(e.target.value)} placeholder={km} />
            </div>
            <div className="manual-field">
              <label>Minutter:</label>
              <input className="input" type="number" step="1" value={manuellMin} onChange={e => setManuellMin(e.target.value)} placeholder={min} />
            </div>
          </div>

          {feil && <div className="error">{feil}</div>}

          {/* ACTIONS */}
          <div className="actions">
            <button className="btn btn-green" onClick={printPDF}>Skriv ut / Lagre som PDF</button>
            <button className="btn btn-blue" onClick={()=>setShowFixed(true)}>Turistpriser</button>
            {editAuth
              ? <button className="btn btn-orange" onClick={()=>{setEditAuth(false);setEditing(false);}}>Logg ut takstredigering</button>
              : <button className="btn" onClick={()=>setEditing(true)}>Rediger takster</button>
            }
          </div>
        </div>
      </div>

      {/* TWO-COLUMN LAYOUT: LEFT = TABLE, RIGHT = MAP */}
      <div className="layout-2col">
        {/* LEFT: PRICE TABLE */}
        <div ref={printAreaRef} className="card table-card">
          <table className="excel-style-table">
            <thead>
              <tr>
                <th className="blank"></th>
                {PERIODS.map(p => <th key={p} className="period-head">{p}</th>)}
              </tr>
            </thead>
            <tbody>
              {GROUPS.map(group => (
                <tr key={group} className={group==="9–16" ? "row-emph" : ""}>
                  <td className="group-cell">{GROUP_LABELS[group]}</td>
                  {PERIODS.map(period => {
                    const fare = (aktivKm && aktivMin)
                      ? calcFarePeriod(TARIFFS_DEFAULT, group, period, aktivKm, aktivMin)
                      : "-";
                    return (
                      <td key={period} className="fare-cell">
                        {fare !== "-" ? `kr ${fare.toLocaleString("no-NO")}` : <span className="muted">-</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="legend">
            <div>Prosentøkning i forhold til dagtakst:
              <span className="accent"> Kveld 21% </span>
              <span className="accent"> Laurdag 30% </span>
              <span className="accent"> Helg/Natt 35% </span>
              <span className="accent"> Høytid 45%</span>
            </div>
            <div>Prosentøkning i forhold til 1–4 seter:
              <span className="accent"> 5–6 pers: 30% </span>
              <span className="accent"> 7–8 pers: 60% </span>
              <span className="accent"> 9–16 pers: 100%</span>
            </div>
          </div>
          <div className="updated">Oppdatert 26/04-2024</div>
        </div>

        {/* RIGHT: MAP */}
        <aside className="card map-aside">
          <div className="map-title">Kart og rute</div>
          <div ref={mapHostRef} className="map-host" />
        </aside>
      </div>

      {/* PASSWORD GATE */}
      {editing && !editAuth && (
        <div className="modal-backdrop">
          <div className="login-card">
            <div className="title">Rediger takster</div>
            <div className="muted" style={{marginBottom:12}}>Skriv inn passord for å låse opp redigering:</div>
            <input
              className="input"
              type="password" autoFocus value={password}
              onChange={e=>setPassword(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&password===PASSWORD&&setEditAuth(true)}
            />
            <div className="login-actions">
              <button className="btn" onClick={()=>{setEditing(false);setPassword("");}}>Avbryt</button>
              <button className="btn btn-purple" onClick={() => password===PASSWORD && setEditAuth(true)} disabled={password.length<2}>Logg inn</button>
            </div>
            {password && password!==PASSWORD && (<div className="error" style={{marginTop:10}}>Feil passord</div>)}
          </div>
        </div>
      )}

      {/* MODALS */}
      <TariffModal show={editing && editAuth} onClose={()=>{setEditing(false);}} tariffs={tariffs} setTariffs={setTariffs} />
      <FixedPricesModal show={showFixed} onClose={()=>setShowFixed(false)} />

      <footer className="footer">© {new Date().getFullYear()} Voss Taxi-kalkulator</footer>
    </div>
  );
}

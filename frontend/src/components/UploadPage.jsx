import { useRef, useState } from "react";
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowRight, FileCheck2 } from "lucide-react";

export default function UploadPage({ imports, onUpload, onOpenDashboard, loading, error }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState(null);
  const [preview, setPreview] = useState(null);

  async function choose(file) {
    if (!file) return;
    setSelected(file);
    setPreview(null);
  }
  async function submit() {
    if (!selected) return;
    const result = await onUpload(selected);
    if (result) setPreview(result);
  }

  return <div className="page-content upload-page">
    <div className="page-heading">
      <div><div className="eyebrow">LET'S GET STARTED</div><h1>Bring your sales<br /><em>to the table.</em></h1>
        <p>Upload your Square transactions and turn your daily sales into something lovely to explore.</p></div>
      <div className="heading-art"><span>✿</span><small>made with<br />a little love</small></div>
    </div>
    <section className={`dropzone ${dragging ? "dragging" : ""}`} onDragOver={e => {e.preventDefault(); setDragging(true);}} onDragLeave={() => setDragging(false)} onDrop={e => {e.preventDefault(); setDragging(false); choose(e.dataTransfer.files[0]);}}>
      <input ref={inputRef} type="file" accept=".csv,text/csv" hidden onChange={e => choose(e.target.files[0])} />
      <div className="upload-orb"><UploadCloud size={27} /></div>
      <h2>Upload your Square CSV</h2>
      <p>Drag and drop your file here, or browse your computer.</p>
      <button className="button button-primary" onClick={() => inputRef.current?.click()}>Choose a CSV file <ArrowRight size={16}/></button>
      <div className="drop-foot"><FileSpreadsheet size={14}/> CSV files only · Up to 20 MB</div>
    </section>
    {selected && <section className="selected-file">
      <div className="file-badge"><FileSpreadsheet size={20}/></div>
      <div className="file-meta"><strong>{selected.name}</strong><span>{(selected.size / 1024).toFixed(1)} KB · Ready to import</span></div>
      <button className="button button-primary" disabled={loading} onClick={submit}>{loading ? "Saving..." : "Import and save"}</button>
    </section>}
    {error && <div className="alert error-alert"><AlertCircle size={18}/>{error}</div>}
    {preview && <div className="alert success-alert"><CheckCircle2 size={19}/><div><strong>Your sales data is saved!</strong><span>{preview.row_count.toLocaleString()} transaction rows imported from {preview.filename}.</span></div><button className="text-button" onClick={onOpenDashboard}>View dashboard →</button></div>}
    <div className="upload-lower">
      <div className="lower-title"><div><div className="eyebrow">YOUR DATA LIBRARY</div><h2>Recent imports</h2></div><span className="soft-count">{imports.length} saved {imports.length === 1 ? "file" : "files"}</span></div>
      {imports.length ? <div className="import-list">{imports.slice(0, 5).map(item => <div className="import-row" key={item.id}><div className="file-badge small"><FileCheck2 size={17}/></div><div className="file-meta"><strong>{item.filename}</strong><span>{new Date(item.uploaded_at).toLocaleString()} · {item.row_count.toLocaleString()} rows</span></div><span className="saved-pill">Saved</span></div>)}</div> : <div className="empty-library">Your imported files will live here, ready whenever you need them.</div>}
    </div>
    <div className="format-hint"><strong>Looking for the right file?</strong><span>Use the CSV export from Square with transaction, product, date, sales, discount, tax and payment details.</span></div>
  </div>;
}

import { useCallback, useEffect, useState } from "react";
import { Cake } from "lucide-react";
import Sidebar from "./components/Sidebar";
import UploadPage from "./components/UploadPage";
import DashboardPage from "./components/DashboardPage";
import { getImports, getDashboard, uploadCsv } from "./services/api";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [imports, setImports] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [selectedImport, setSelectedImport] = useState("");

  const refreshImports = useCallback(async () => {
    try {
      const list = await getImports();
      setImports(list);
      if (list.length && !selectedImport) setSelectedImport(String(list[0].id));
    } catch (e) { setError(e.message); }
  }, [selectedImport]);

  const refreshDashboard = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const data = await getDashboard({ ...filters, import_id: selectedImport || undefined });
      setDashboard(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [selectedImport]);

  useEffect(() => { refreshImports(); }, []);
  useEffect(() => { refreshDashboard(); }, [selectedImport]);

  async function handleUpload(file) {
    setUploading(true); setError("");
    try {
      const result = await uploadCsv(file);
      await refreshImports();
      setSelectedImport(String(result.id));
      return result;
    } catch (e) {
      setError(e.message);
      return null;
    } finally { setUploading(false); }
  }

  return <div className="app-shell">
    <Sidebar page={page} setPage={setPage} latestImport={imports[0]}/>
    <main className="main-area">
      <div className="mobile-brand"><Cake size={18}/> Clovers Cakes <span>BAKERY ANALYTICS</span></div>
      {page === "import"
        ? <UploadPage imports={imports} onUpload={handleUpload} onOpenDashboard={()=>setPage("dashboard")} loading={uploading} error={error}/>
        : <DashboardPage imports={imports} dashboard={dashboard} loading={loading} onRefresh={refreshDashboard} onOpenImport={()=>{setError("");setPage("import");}} onSelectImport={id=>setSelectedImport(String(id))}/>}
    </main>
  </div>;
}

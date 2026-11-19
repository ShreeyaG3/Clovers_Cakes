import { useState } from "react";
import { 
  CakeSlice, ChartNoAxesCombined, UploadCloud, Heart, ChevronLeft, ChevronRight 
} from "lucide-react";


export default function Sidebar({ page, setPage, latestImport }) {
  const [collapsed, setCollapsed] = useState(false);
  const items = [
    { id: "dashboard", label: "Dashboard", icon: ChartNoAxesCombined },
    { id: "import", label: "Import CSV", icon: UploadCloud }
  ];
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="brand">
      <div className="brand-mark"><CakeSlice size={22} /></div>
        {!collapsed && (
          <div>
            <div className="brand-name">clovers<br />cakes</div>
            <div className="brand-sub">SALES ANALYTICS</div>
          </div>
        )}

        </div>
        {!collapsed && (
          <div className="nav-caption">WORKSPACE</div>
        )}
      <nav className="nav-list">
        {items.map(item => {
          const Icon = item.icon;
          return ( <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => setPage(item.id)}>
            <Icon size={18} strokeWidth={1.8} /> {!collapsed && <span>{item.label}</span>}
          </button> );
        })}
      </nav>

      <button
        className="sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      <div className="sidebar-bottom">
        {!collapsed && (
        <>
        <div className="sidebar-note">
          <div className="note-icon"><Heart size={15} /></div>
          <strong>Baked with love,<br />measured with care.</strong>
        </div>

        <div className="storage-status"><span className="status-dot" /> {latestImport ? "Sales data saved" : "Waiting for your first upload"}</div>
        </>
        )}
      </div>
    </aside>
  );
}

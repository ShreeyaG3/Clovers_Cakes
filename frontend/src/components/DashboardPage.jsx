import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronDown, Sparkles, TrendingUp, ShoppingBag, Package, Wallet, Download, CakeSlice, CreditCard, Clock3 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import MetricCard from "./MetricCard";

const money = n => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(n || 0));
const COLORS = ["#C77D99", "#E7B8C8", "#EBCDBD", "#A98591", "#F0DDE3", "#D9A58E", "#8D6D79"];

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return <div className="chart-tooltip"><span>{label}</span><strong>{money(payload[0].value)}</strong></div>;
}

export default function DashboardPage({ imports, dashboard, loading, onRefresh, onOpenImport, onSelectImport }) {
  const [range, setRange] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const latest = dashboard?.import_info;
  const params = useMemo(() => {
    if (range === "all") return {};
    const end = new Date();
    let start = new Date();
    if (range === "7d") start.setDate(end.getDate() - 6);
    if (range === "30d") start.setDate(end.getDate() - 29);
    if (range === "90d") start.setDate(end.getDate() - 89);
    if (range === "custom") return { start_date: customStart, end_date: customEnd };
    return { start_date: start.toISOString().slice(0,10), end_date: end.toISOString().slice(0,10) };
  }, [range, customStart, customEnd]);

  useEffect(() => { onRefresh(params); }, [params, latest?.id]);

  const summary = dashboard?.summary || {};
  const hasData = dashboard?.has_data && !dashboard?.empty;
  const topProduct = dashboard?.top_products?.[0];
  const topCategory = dashboard?.categories?.[0];
  const maxCategory = Math.max(1, ...(dashboard?.categories || []).map(x => x.revenue));

  function exportReport() {
    if (!dashboard) return;
    const blob = new Blob([JSON.stringify(dashboard, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "clovers-sales-report.json"; a.click();
    URL.revokeObjectURL(url);
  }

  if (!dashboard?.has_data && !loading) return <div className="empty-dashboard"><div className="empty-art">♣</div><div className="eyebrow">A FRESH LOOK</div><h1>Your story starts<br/><em>with a little data.</em></h1><p>Import your Square sales CSV to see your bakery's performance bloom.</p><button className="button button-primary" onClick={onOpenImport}>Import your first CSV <span>→</span></button></div>;

  return <div className="page-content dashboard-page">
    <div className="dashboard-title-row">
      <div><div className="eyebrow">YOUR BUSINESS AT A GLANCE</div><h1>Good things are <em>selling.</em> <span className="title-sparkle">🍀</span></h1><p>A little look at how your bakery is doing.</p></div>
      <div className="dashboard-actions">
        <select className="import-select" value={latest?.id || ""} onChange={e => onSelectImport(e.target.value)} aria-label="Select saved import">{imports.map(i => <option key={i.id} value={i.id}>{i.filename}</option>)}</select>
        <button className="icon-button" onClick={exportReport} title="Export analytics JSON"><Download size={17}/></button>
        <button className="button button-primary compact" onClick={onOpenImport}> <span>+</span> Import CSV</button>
      </div>
    </div>

    <div className="filter-bar">
      <div className="filter-label"><CalendarDays size={16}/> DATE RANGE</div>
      <div className="range-pills">{[["all","All time"],["7d","7 days"],["30d","30 days"],["90d","90 days"],["custom","Custom"]].map(([v,l]) => <button key={v} className={range===v?"selected":""} onClick={() => setRange(v)}>{l}</button>)}</div>
      {range === "custom" && <div className="custom-dates"><input type="date" value={customStart} onChange={e=>setCustomStart(e.target.value)}/><span>to</span><input type="date" value={customEnd} onChange={e=>setCustomEnd(e.target.value)}/><button className="text-button" onClick={()=>onRefresh({start_date:customStart,end_date:customEnd})}>Apply</button></div>}
      <span className="filter-spacer"/><span className="dataset-tag"><span className="status-dot"/>{latest?.row_count?.toLocaleString()} rows saved</span>
    </div>

    {loading ? <div className="loading-panel"><div className="loader"/>Gathering your numbers...</div> : !hasData ? <div className="empty-range">No sales found for this date range. Try a wider range.</div> : <>
      <section className="metrics-grid">
        <MetricCard label="Net revenue" value={money(summary.revenue)} helper="Sales excluding tax" icon={Wallet} tint="mint"/>
        <MetricCard label="Total orders" value={Number(summary.orders||0).toLocaleString()} helper="Unique transactions" icon={ShoppingBag} tint="green"/>
        <MetricCard label="Average order value" value={money(summary.average_order_value)} helper="Revenue per order" icon={TrendingUp} tint="blush"/>
        <MetricCard label="Units sold" value={Number(summary.units_sold||0).toLocaleString()} helper="Items across all orders" icon={Package} tint="pink"/>
      </section>

     <section className="insights-panel"><div className="insights-heading"><div className="insights-icon"><Sparkles size={19}/></div><div><div className="eyebrow">A LITTLE BUSINESS INTELLIGENCE</div><h2>Fresh insights for you</h2></div></div><div className="insights-list">{dashboard.insights.map((insight,i)=><div className="insight-item" key={i}><span>0{i+1}</span><p>{insight}</p></div>)}</div></section>
    
      <section className="main-chart-grid">
        <article className="panel revenue-panel">
          <div className="panel-heading"><div><div className="eyebrow">THE BIG PICTURE</div><h2>Sales over time</h2><p>Your daily net sales, beautifully laid out.</p></div><span className="chart-legend"><i/> Net sales</span></div>
          <div className="large-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={dashboard.daily_sales} margin={{top:12,right:8,left:0,bottom:0}}><defs><linearGradient id="roseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#D58AA5" stopOpacity={0.28}/><stop offset="100%" stopColor="#D58AA5" stopOpacity={0.015}/></linearGradient></defs><CartesianGrid stroke="#F3E9EC" vertical={false} strokeDasharray="3 5"/><XAxis dataKey="date" tickFormatter={v=>v.slice(5)} axisLine={false} tickLine={false} tick={{fill:"#A58D96",fontSize:11}} minTickGap={24}/><YAxis tickFormatter={v=>`$${v}`} axisLine={false} tickLine={false} tick={{fill:"#A58D96",fontSize:11}} width={52}/><Tooltip content={<ChartTip/>}/><Area type="monotone" dataKey="sales" stroke="#C77D99" strokeWidth={2.8} fill="url(#roseFill)" activeDot={{r:5,stroke:"#fff",strokeWidth:2}}/></AreaChart></ResponsiveContainer></div>
        </article>
        <article className="panel highlight-panel"><div className="eyebrow">A LITTLE SPOTLIGHT</div><h2>Your best seller</h2><div className="spotlight-illustration"><div className="spotlight-circle"><CakeSlice size={48} strokeWidth={1.2}/><span>✿</span></div></div>{topProduct ? <><h3>{topProduct.product}</h3><div className="spotlight-revenue">{money(topProduct.revenue)}</div><p>Top product by net revenue</p><div className="spotlight-foot"><span>{Number(topProduct.quantity).toLocaleString()} units sold</span><span>{topProduct.orders} orders</span></div></> : <p>No product data available.</p>}</article>
      </section>

      <section className="analysis-grid">
        <article className="panel"><div className="panel-heading"><div><div className="eyebrow">WHAT'S IN THE MIX</div><h2>Category performance</h2></div></div><div className="category-list">{dashboard.categories.map((c,i)=><div className="category-item" key={c.category}><div className="category-top"><div className="category-name"><i style={{background:COLORS[i%COLORS.length]}}/>{c.category}</div><strong>{money(c.revenue)}</strong></div><div className="category-track"><div style={{width:`${Math.max(0,c.revenue/maxCategory*100)}%`,background:COLORS[i%COLORS.length]}}/></div><div className="category-percent">{Number(c.percentage).toFixed(1)}% of net sales</div></div>)}</div></article>
        <article className="panel"><div className="panel-heading"><div><div className="eyebrow">CUSTOMER FAVORITES</div><h2>Top products</h2></div></div><div className="product-list">{dashboard.top_products.slice(0,6).map((p,i)=><div className="product-row" key={p.product}><span className={`product-rank rank-${i+1}`}>{String(i+1).padStart(2,"0")}</span><div className="product-detail"><strong>{p.product}</strong><span>{Number(p.quantity).toLocaleString()} units · {p.orders} orders</span></div><strong className="product-revenue">{money(p.revenue)}</strong></div>)}</div></article>
      </section>

      <section className="analysis-grid lower-analytics">
        <article className="panel"><div className="panel-heading"><div><div className="eyebrow">WHEN YOU SHINE</div><h2>Sales by weekday</h2></div></div><div className="small-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={dashboard.weekdays} margin={{top:10,right:4,left:-20,bottom:0}}><CartesianGrid stroke="#F3E9EC" vertical={false} strokeDasharray="3 5"/><XAxis dataKey="day" tickFormatter={v=>v.slice(0,3)} axisLine={false} tickLine={false} tick={{fill:"#A58D96",fontSize:11}}/><YAxis tickFormatter={v=>`$${v}`} axisLine={false} tickLine={false} tick={{fill:"#A58D96",fontSize:10}}/><Tooltip content={<ChartTip/>}/><Bar dataKey="sales" fill="#DDA5B8" radius={[6,6,0,0]} maxBarSize={34}/></BarChart></ResponsiveContainer></div></article>
        <article className="panel"><div className="panel-heading"><div><div className="eyebrow">HOW THEY PAY</div><h2>Payment methods</h2></div></div><div className="payment-content"><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={dashboard.payments} dataKey="revenue" nameKey="method" innerRadius="63%" outerRadius="88%" paddingAngle={3} stroke="none">{dashboard.payments.map((p,i)=><Cell key={p.method} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip formatter={v=>money(v)}/></PieChart></ResponsiveContainer></div><div className="payment-legend">{dashboard.payments.map((p,i)=><div key={p.method}><span><i style={{background:COLORS[i%COLORS.length]}}/>{p.method}</span><strong>{money(p.revenue)}</strong></div>)}</div></div></article>
      </section>

      <div className="footnote">Numbers are based on the selected Square CSV snapshot. Revenue reflects Net Sales and excludes tax.</div>

    </>}
  </div>;
}

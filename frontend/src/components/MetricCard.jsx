export default function MetricCard({ label, value, helper, icon: Icon, tint = "pink" }) {
  return <article className={`metric-card tint-${tint}`}>
    <div className="metric-top"><span>{label}</span><div className="metric-icon"><Icon size={18} /></div></div>
    <div className="metric-value">{value}</div>
    <div className="metric-helper">{helper}</div>
  </article>;
}

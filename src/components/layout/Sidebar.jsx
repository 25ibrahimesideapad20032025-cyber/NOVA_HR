import { roleLabels } from "../../features/shared/hrInitialData";

const navigationItems = [
  { id: "dashboard", icon: "⌂", label: "لوحة التحكم", roles: ["admin", "hr", "manager", "employee"] },
  { id: "employees", icon: "▤", label: "إدارة الموظفين", roles: ["admin", "hr"] },
  { id: "departments", icon: "▦", label: "إدارة الأقسام", roles: ["admin", "hr"] },
  { id: "admin", icon: "♙", label: "إدارة المسؤولين", roles: ["admin"] },
  { id: "leaves", icon: "▧", label: "إدارة الإجازات", roles: ["admin", "hr", "manager", "employee"] },
  { id: "attendance", icon: "◷", label: "الحضور والانصراف", roles: ["admin", "hr", "manager", "employee"] },
  { id: "payroll", icon: "₪", label: "إدارة الرواتب", roles: ["admin", "hr", "employee"] },
  { id: "performance", icon: "☆", label: "تقييم الأداء", roles: ["admin", "hr", "manager", "employee"] },
  { id: "training", icon: "▣", label: "التدريب والتطوير", roles: ["admin", "hr"] },
  { id: "reports", icon: "▥", label: "التقارير", roles: ["admin", "hr", "manager", "employee"] },
];

function Sidebar({ activePage, onNavigate, currentUser, onLogout }) {
  const items = navigationItems.filter((item) => item.roles.includes(currentUser?.role));
  const initial = currentUser?.name?.trim()?.charAt(0) || "م";

  return (
    <aside className="sidebar">
      <div className="brand"><div className="brand-logo">N</div><div><h2>NOVA HR</h2><span>نظام إدارة الموارد البشرية</span></div></div>
      <div className="sidebar-section"><span className="sidebar-label">القائمة الرئيسية</span><nav className="sidebar-nav">
        {items.map((item) => <button key={item.id} type="button" className={`nav-item ${activePage === item.id ? "active" : ""}`} onClick={() => onNavigate(item.id)}><span>{item.icon}</span>{item.label}</button>)}
      </nav></div>
      <div className="sidebar-footer"><div className="user-avatar">{initial}</div><div className="user-info"><strong>{currentUser?.name}</strong><span>{roleLabels[currentUser?.role] || "مستخدم"}</span></div><button type="button" className="sidebar-logout" onClick={onLogout} title="تسجيل الخروج" aria-label="تسجيل الخروج">↪</button></div>
    </aside>
  );
}

export default Sidebar;

const pageTitles = {
  dashboard: "لوحة التحكم",
  employees: "إدارة الموظفين",
  departments: "إدارة الأقسام",
  "department-add": "إضافة قسم",
  "department-edit": "تعديل القسم",
  admin: "إدارة المسؤولين",
  leaves: "إدارة الإجازات",
  attendance: "الحضور والانصراف",
  payroll: "إدارة الرواتب",
  performance: "تقييم الأداء",
  training: "التدريب والتطوير",
  reports: "التقارير الإدارية",
};

function Topbar({ activePage, currentUser, onLogout }) {
  const initial = currentUser?.name?.trim()?.charAt(0) || "م";
  return <header className="topbar"><div className="breadcrumb"><span>الرئيسية</span><span className="breadcrumb-separator">/</span><strong>{pageTitles[activePage] || "لوحة التحكم"}</strong></div><div className="topbar-actions"><div className="topbar-user"><div className="user-avatar">{initial}</div><span>{currentUser?.name}</span></div><button type="button" className="topbar-logout" onClick={onLogout}>تسجيل الخروج</button></div></header>;
}

export default Topbar;

# NOVA HR — جميع الأكواد الجديدة والمعدّلة

هذه النسخة الكاملة لملفات التحديث. الملفات الموجودة سابقًا وغير المدرجة هنا بقيت كما هي في حزمة المشروع الكاملة.

## `src/App.jsx`

```jsx
import { useEffect, useState } from "react";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import EmployeesPage from "./pages/EmployeesPage";
import DepartmentsListPage from "./pages/DepartmentsListPage";
import DepartmentFormPage from "./features/Departments/DepartmentFormPage";
import DepartmentDetailsModal from "./features/Departments/DepartmentDetailsModal";
import AuthenticationPage from "./features/auth/AuthenticationPage";
import {
  AdminManagementPage,
  LeaveManagementPage,
  AttendanceManagementPage,
  PayrollManagementPage,
  PerformanceEvaluationPage,
  TrainingManagementPage,
  DashboardPage,
  ReportsPage,
} from "./features/modules/HRManagementPages";
import { useStoredList, readStoredList, getCurrentEmployees } from "./features/shared/hrStorage";
import { initialUsers } from "./features/shared/hrInitialData";
import { departments as initialDepartments } from "./features/data/departments";

const ROLE_PAGES = {
  admin: ["dashboard", "employees", "departments", "admin", "leaves", "attendance", "payroll", "performance", "training", "reports"],
  hr: ["dashboard", "employees", "departments", "leaves", "attendance", "payroll", "performance", "training", "reports"],
  manager: ["dashboard", "leaves", "attendance", "performance", "reports"],
  employee: ["dashboard", "leaves", "attendance", "payroll", "performance", "reports"],
};

function readSession() {
  try {
    const saved = localStorage.getItem("nova_hr_session_v1");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function App() {
  const [users, setUsers] = useStoredList("nova_hr_users_v1", initialUsers);
  const [departments, setDepartments] = useStoredList("nova_hr_departments_v1", initialDepartments);
  const [currentUser, setCurrentUser] = useState(() => {
    const session = readSession();
    if (!session) return null;
    const savedUsers = readStoredList("nova_hr_users_v1", initialUsers);
    const account = savedUsers.find((user) => user.id === session.id);
    return account?.status === "active" ? {
      id: account.id,
      employeeId: account.employeeId,
      name: account.name,
      username: account.username,
      email: account.email,
      role: account.role,
    } : null;
  });
  const [activePage, setActivePage] = useState("dashboard");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showDepartmentDetails, setShowDepartmentDetails] = useState(false);

  useEffect(() => {
    try {
      if (currentUser) localStorage.setItem("nova_hr_session_v1", JSON.stringify(currentUser));
      else localStorage.removeItem("nova_hr_session_v1");
    } catch (error) {
      console.error("تعذر حفظ جلسة المستخدم:", error);
    }
  }, [currentUser]);

  function handleLogin(account) {
    const sessionUser = {
      id: account.id,
      employeeId: account.employeeId,
      name: account.name,
      username: account.username,
      email: account.email,
      role: account.role,
    };
    setCurrentUser(sessionUser);
    setActivePage("dashboard");
  }

  function handleLogout() {
    setCurrentUser(null);
    setActivePage("dashboard");
    setSelectedDepartment(null);
    setShowDepartmentDetails(false);
  }

  function handleNavigate(page) {
    const allowedPages = ROLE_PAGES[currentUser?.role] || [];
    if (!allowedPages.includes(page)) return;
    setActivePage(page);
    setSelectedDepartment(null);
    setShowDepartmentDetails(false);
  }

  function handleCancelDepartmentForm() {
    setSelectedDepartment(null);
    setActivePage("departments");
  }

  function handleAddDepartment(newDepartment) {
    setDepartments((previous) => [{ ...newDepartment, id: `DEP-${Date.now()}` }, ...previous]);
    setSelectedDepartment(null);
    setActivePage("departments");
  }

  function handleViewDepartment(department) {
    setSelectedDepartment(department);
    setShowDepartmentDetails(true);
  }

  function handleCloseDepartmentDetails() {
    setShowDepartmentDetails(false);
    setSelectedDepartment(null);
  }

  function handleEditDepartment(department) {
    setSelectedDepartment(department);
    setShowDepartmentDetails(false);
    setActivePage("department-edit");
  }

  function handleUpdateDepartment(updatedDepartment) {
    setDepartments((previous) => previous.map((department) =>
      department.id === updatedDepartment.id ? { ...department, ...updatedDepartment } : department
    ));
    setSelectedDepartment(null);
    setActivePage("departments");
  }

  function handleDeleteDepartment(department) {
    const confirmed = window.confirm(`هل أنت متأكد من حذف قسم "${department.name}"؟\n\nلا يمكن التراجع عن هذا الإجراء.`);
    if (!confirmed) return;
    setDepartments((previous) => previous.filter((item) => item.id !== department.id));
    setSelectedDepartment(null);
    setShowDepartmentDetails(false);
    setActivePage("departments");
  }

  function renderPage() {
    switch (activePage) {
      case "dashboard":
        return <DashboardPage currentUser={currentUser} departments={departments} />;
      case "employees":
        return <EmployeesPage />;
      case "departments":
        return <DepartmentsListPage departments={departments} onAddDepartment={() => { setSelectedDepartment(null); setActivePage("department-add"); }} onViewDetails={handleViewDepartment} onEditDepartment={handleEditDepartment} onDeleteDepartment={handleDeleteDepartment} />;
      case "department-add":
        return <DepartmentFormPage mode="add" departments={departments} employees={getCurrentEmployees()} onSave={handleAddDepartment} onCancel={handleCancelDepartmentForm} />;
      case "department-edit":
        return selectedDepartment
          ? <DepartmentFormPage mode="edit" department={selectedDepartment} departments={departments} employees={getCurrentEmployees()} onSave={handleUpdateDepartment} onCancel={handleCancelDepartmentForm} onDelete={handleDeleteDepartment} />
          : <DepartmentsListPage departments={departments} onAddDepartment={() => setActivePage("department-add")} onViewDetails={handleViewDepartment} onEditDepartment={handleEditDepartment} onDeleteDepartment={handleDeleteDepartment} />;
      case "admin":
        return <AdminManagementPage users={users} setUsers={setUsers} currentUser={currentUser} />;
      case "leaves":
        return <LeaveManagementPage currentUser={currentUser} />;
      case "attendance":
        return <AttendanceManagementPage currentUser={currentUser} />;
      case "payroll":
        return <PayrollManagementPage currentUser={currentUser} />;
      case "performance":
        return <PerformanceEvaluationPage currentUser={currentUser} />;
      case "training":
        return <TrainingManagementPage currentUser={currentUser} />;
      case "reports":
        return <ReportsPage currentUser={currentUser} />;
      default:
        return <DashboardPage currentUser={currentUser} departments={departments} />;
    }
  }

  if (!currentUser) return <AuthenticationPage users={users} onLogin={handleLogin} />;

  const activeSidebarPage = activePage.startsWith("department") ? "departments" : activePage;

  return (
    <div className="app-shell" dir="rtl">
      <Sidebar activePage={activeSidebarPage} currentUser={currentUser} onNavigate={handleNavigate} onLogout={handleLogout} />
      <main className="main-content">
        <Topbar activePage={activePage} currentUser={currentUser} onLogout={handleLogout} />
        {renderPage()}
      </main>
      {showDepartmentDetails && <DepartmentDetailsModal department={selectedDepartment} onClose={handleCloseDepartmentDetails} onEdit={handleEditDepartment} />}
    </div>
  );
}

export default App;
```

## `src/components/layout/Sidebar.jsx`

```jsx
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
```

## `src/components/layout/Topbar.jsx`

```jsx
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
```

## `src/main.jsx`

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./styles/global.css";
import "./styles/layout.css";
import "./styles/departments.css";
import "./styles/employees.css";
import "./styles/hr-modules.css";
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

## `src/features/auth/AuthenticationPage.jsx`

```jsx
import { useState } from "react";
import { roleLabels } from "../shared/hrInitialData";

function AuthenticationPage({ users = [], onLogin }) {
  const [identity, setIdentity] = useState("admin@nova.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    const account = users.find(
      (user) =>
        user.username?.toLowerCase() === identity.trim().toLowerCase() ||
        user.email?.toLowerCase() === identity.trim().toLowerCase()
    );

    if (!account || account.status !== "active") {
      setError("تعذر العثور على حساب نشط بهذه البيانات.");
      return;
    }

    if (!account.demoPassword || account.demoPassword !== password) {
      setError("كلمة المرور غير صحيحة.");
      return;
    }

    onLogin(account);
  }

  return (
    <main className="auth-screen" dir="rtl">
      <section className="auth-brand-panel">
        <div className="auth-brand-lockup">
          <span className="auth-brand-mark">N</span>
          <div>
            <strong>NOVA HR</strong>
            <span>نظام إدارة الموارد البشرية</span>
          </div>
        </div>
        <div className="auth-brand-copy">
          <span className="auth-eyebrow">HUMAN RESOURCE MANAGEMENT</span>
          <h1>إدارة مواردك البشرية، بوضوح وكفاءة.</h1>
          <p>
            منصة موحدة لتنظيم بيانات الموظفين، ومتابعة العمليات الإدارية،
            ودعم القرارات بالمعلومات.
          </p>
        </div>
        <div className="auth-brand-footer">NOVA HR · 2026 / 2027</div>
      </section>

      <section className="auth-form-panel">
        <form className="auth-card" onSubmit={handleSubmit} noValidate>
          <div className="auth-mobile-brand">
            <span className="auth-brand-mark">N</span>
            <strong>NOVA HR</strong>
          </div>

          <div className="auth-heading">
            <span className="auth-eyebrow">مرحبًا بعودتك</span>
            <h2>تسجيل الدخول</h2>
            <p>أدخل بيانات حسابك للوصول إلى لوحة العمل.</p>
          </div>

          <div className="hr-field">
            <label htmlFor="auth-identity">اسم المستخدم أو البريد الإلكتروني *</label>
            <input
              id="auth-identity"
              type="text"
              autoComplete="username"
              value={identity}
              onChange={(event) => setIdentity(event.target.value)}
              placeholder="أدخل اسم المستخدم أو البريد الإلكتروني"
              required
            />
            <small>استخدم اسم المستخدم أو البريد المسجل لحسابك.</small>
          </div>

          <div className="hr-field">
            <label htmlFor="auth-password">كلمة المرور *</label>
            <div className="auth-password-wrap">
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="أدخل كلمة المرور"
                required
              />
              <button
                type="button"
                className="auth-show-password"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? "إخفاء" : "إظهار"}
              </button>
            </div>
            <small>تأكد من كتابة كلمة المرور بحروفها الصحيحة.</small>
          </div>

          {error && <div className="hr-alert hr-alert-danger" role="alert">{error}</div>}

          <button className="hr-button hr-button-primary auth-submit" type="submit">
            تسجيل الدخول <span aria-hidden="true">←</span>
          </button>

          <button
            type="button"
            className="auth-forgot"
            onClick={() => setNotice("استعادة كلمة المرور تحتاج إلى ربط خدمة البريد الإلكتروني في Laravel.")}
          >
            هل نسيت كلمة المرور؟
          </button>

          {notice && <div className="hr-alert hr-alert-info" role="status">{notice}</div>}

          <details className="auth-demo-details">
            <summary>حسابات تجريبية لاختبار الأدوار</summary>
            <div className="auth-demo-list">
              {users.filter((user) => user.status === "active").map((user) => (
                <button
                  type="button"
                  key={user.id}
                  onClick={() => {
                    setIdentity(user.email);
                    setPassword(user.demoPassword || "");
                    setError("");
                  }}
                >
                  <strong>{roleLabels[user.role] || user.role}</strong>
                  <span>{user.email}</span>
                </button>
              ))}
            </div>
            <small>كلمات المرور التجريبية موجودة في ملف بيانات الحسابات للمطور فقط.</small>
          </details>

          <p className="auth-security-note">
            هذه واجهة تجريبية للواجهة الأمامية؛ المصادقة الفعلية والتحقق الآمن
            من كلمات المرور يجب تنفيذهما في Laravel.
          </p>
        </form>
      </section>
    </main>
  );
}

export default AuthenticationPage;
```

## `src/features/modules/HRManagementPages.jsx`

```jsx
import { useMemo, useState } from "react";
import {
  useStoredList, getCurrentEmployees, getEmployeeById, getEmployeeName,
  getEmployeeDepartment, createRecordId, getToday, formatDate, formatMoney,
  isEmployeeVisibleToUser,
} from "../shared/hrStorage";
import {
  initialLeaveRequests, initialLeaveBalances, leaveTypeLabels,
  initialAttendance, attendanceStatusLabels, initialPayroll,
  initialEvaluations, evaluationStatusLabels, initialTrainingPrograms,
  trainingStatusLabels, roleLabels,
} from "../shared/hrInitialData";

// عناصر واجهة مشتركة حتى تحافظ جميع الوحدات على هوية بصرية واحدة.
function PageHeading({ title, subtitle, eyebrow = "إدارة الموارد البشرية", actions }) {
  return <div className="hr-page-heading"><div><span className="hr-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div>{actions && <div className="hr-heading-actions">{actions}</div>}</div>;
}

function StatCards({ items = [] }) {
  return <div className="hr-stats-grid">{items.map((item) => <article className="hr-stat-card" key={item.label}><div className="hr-stat-top"><span>{item.label}</span><span className={`hr-stat-icon ${item.tone || "blue"}`}>{item.icon || "◈"}</span></div><strong>{item.value}</strong>{item.note && <small>{item.note}</small>}</article>)}</div>;
}

function StatusBadge({ status, label }) {
  return <span className={`hr-badge hr-badge-${String(status || "unknown").toLowerCase()}`}>{label || status || "غير محدد"}</span>;
}

function ActionButton({ children, onClick, tone = "secondary", disabled = false }) {
  return <button type="button" className={`hr-button hr-button-${tone} hr-table-action`} onClick={onClick} disabled={disabled}>{children}</button>;
}

function DataTable({ columns, rows, emptyMessage = "لا توجد بيانات لعرضها.", renderActions }) {
  return <div className="hr-table-wrap"><table className="hr-table"><thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}{renderActions && <th>الإجراءات</th>}</tr></thead><tbody>{rows.length ? rows.map((row) => <tr key={row.id}>{columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : row[column.key] ?? "—"}</td>)}{renderActions && <td><div className="hr-row-actions">{renderActions(row)}</div></td>}</tr>) : <tr><td className="hr-empty-cell" colSpan={columns.length + (renderActions ? 1 : 0)}><span className="hr-empty-icon">▤</span><strong>{emptyMessage}</strong></td></tr>}</tbody></table></div>;
}

function SearchToolbar({ value, onChange, children }) {
  return <div className="hr-toolbar"><div className="hr-search-wrap"><span>⌕</span><input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder="ابحث في السجلات..." aria-label="البحث في السجلات" /></div><div className="hr-toolbar-filters">{children}</div></div>;
}

function FormModal({ title, fields, initialValue, onClose, onSave, validate }) {
  const [formData, setFormData] = useState(initialValue || {});
  const [errors, setErrors] = useState({});
  function change(name, value) {
    setFormData((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
  }
  function submit(event) {
    event.preventDefault();
    const nextErrors = {};
    fields.forEach((field) => {
      if (field.required && !String(formData[field.name] ?? "").trim()) nextErrors[field.name] = `يرجى إدخال ${field.label.replace("*", "").trim()}.`;
    });
    if (validate) Object.assign(nextErrors, validate(formData) || {});
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    onSave(formData);
  }
  return <div className="hr-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="hr-modal" role="dialog" aria-modal="true" aria-labelledby="hr-modal-title"><div className="hr-modal-heading"><div><span className="hr-eyebrow">NOVA HR</span><h2 id="hr-modal-title">{title}</h2></div><button className="hr-modal-close" type="button" onClick={onClose} aria-label="إغلاق">×</button></div><form onSubmit={submit} noValidate><div className="hr-form-grid">{fields.map((field) => <div className={`hr-field ${field.fullWidth ? "hr-field-full" : ""}`} key={field.name}><label htmlFor={`hr-${field.name}`}>{field.label}{field.required ? " *" : ""}</label>{field.type === "textarea" ? <textarea id={`hr-${field.name}`} rows={field.rows || 3} value={formData[field.name] ?? ""} onChange={(event) => change(field.name, event.target.value)} placeholder={field.placeholder || "اكتب هنا..."} aria-invalid={Boolean(errors[field.name])} /> : field.type === "select" ? <select id={`hr-${field.name}`} value={formData[field.name] ?? ""} onChange={(event) => change(field.name, event.target.value)} aria-invalid={Boolean(errors[field.name])}><option value="">{field.placeholder || "اختر من القائمة"}</option>{(field.options || []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input id={`hr-${field.name}`} type={field.type || "text"} min={field.min} max={field.max} step={field.step} value={formData[field.name] ?? ""} onChange={(event) => change(field.name, event.target.value)} placeholder={field.placeholder || "أدخل القيمة"} aria-invalid={Boolean(errors[field.name])} />}{field.hint && <small className="hr-field-hint">{field.hint}</small>}{errors[field.name] && <small className="hr-field-error" role="alert">{errors[field.name]}</small>}</div>)}</div><div className="hr-modal-actions"><button className="hr-button hr-button-primary" type="submit">حفظ البيانات</button><button className="hr-button hr-button-secondary" type="button" onClick={onClose}>إلغاء</button></div></form></section></div>;
}

function ModulePage({ title, subtitle, stats, rows, columns, renderActions, emptyMessage, search, onSearch, toolbar, children, eyebrow }) {
  return <section className="hr-page" dir="rtl"><PageHeading title={title} subtitle={subtitle} eyebrow={eyebrow} /><StatCards items={stats} /><section className="hr-panel">{(onSearch || toolbar) && <SearchToolbar value={search || ""} onChange={onSearch || (() => {})}>{toolbar}</SearchToolbar>}<DataTable columns={columns} rows={rows} renderActions={renderActions} emptyMessage={emptyMessage} /></section>{children}</section>;
}

const employeeOptions = (employees) => employees.map((employee) => ({ value: employee.id, label: `${employee.name} — ${employee.id}` }));
function employeeCell(employeeId, employees) {
  const employee = getEmployeeById(employeeId, employees);
  return employee ? <div className="hr-identity-cell"><strong>{employee.name}</strong><small>{employee.id}</small></div> : "موظف غير محدد";
}

// 04 — Admin Management: الحسابات والأدوار والصلاحيات.
export function AdminManagementPage({ users, setUsers, currentUser }) {
  const employees = useMemo(() => getCurrentEmployees(), []);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const rows = users.filter((user) => [user.name, user.username, user.email, user.id].some((value) => String(value || "").toLowerCase().includes(search.toLowerCase())));
  const stats = [
    { label: "إجمالي الحسابات", value: users.length, icon: "♙", tone: "blue" },
    { label: "حسابات نشطة", value: users.filter((user) => user.status === "active").length, icon: "✓", tone: "green" },
    { label: "حسابات معطلة", value: users.filter((user) => user.status === "inactive").length, icon: "⊘", tone: "orange" },
    { label: "الأدوار المستخدمة", value: new Set(users.map((user) => user.role)).size, icon: "▦", tone: "purple" },
  ];
  const fields = [
    { name: "employeeId", label: "الموظف المرتبط بالحساب", type: "select", required: true, options: employeeOptions(employees), fullWidth: true, hint: "اربط الحساب بموظف موجود في ملف الموظفين." },
    { name: "username", label: "اسم المستخدم", required: true, hint: "حروف إنجليزية وأرقام ونقاط أو شرطات، دون مسافات." },
    { name: "email", label: "البريد الإلكتروني", type: "email", required: true, hint: "مثال: employee@nova.com" },
    { name: "role", label: "دور المستخدم", type: "select", required: true, options: Object.entries(roleLabels).map(([value, label]) => ({ value, label })) },
    { name: "status", label: "حالة الحساب", type: "select", required: true, options: [{ value: "active", label: "نشط" }, { value: "inactive", label: "غير نشط" }] },
    { name: "demoPassword", label: editing ? "كلمة مرور تجريبية جديدة (اختياري)" : "كلمة المرور التجريبية", type: "password", required: !editing, hint: "للتجربة الأمامية فقط؛ تخزين كلمات المرور الفعلي يجب أن يتم بأمان في Laravel." },
  ];
  function saveUser(data) {
    const employee = getEmployeeById(data.employeeId, employees);
    const duplicate = users.some((user) => user.id !== editing?.id && (user.username.toLowerCase() === data.username.trim().toLowerCase() || user.email.toLowerCase() === data.email.trim().toLowerCase()));
    if (duplicate) { alert("اسم المستخدم أو البريد الإلكتروني مستخدم بالفعل."); return; }
    if (editing?.id === currentUser.id && (data.role !== editing.role || data.status !== "active")) {
      alert("لا يمكن تغيير دور الحساب الحالي أو تعطيله من الجلسة نفسها.");
      return;
    }
    const saved = { ...editing, ...data, id: editing?.id || createRecordId("USR"), name: employee?.name || "", username: data.username.trim(), email: data.email.trim().toLowerCase(), demoPassword: data.demoPassword || editing?.demoPassword || "", createdAt: editing?.createdAt || getToday() };
    setUsers((previous) => editing ? previous.map((user) => user.id === editing.id ? saved : user) : [saved, ...previous]);
    setShowForm(false); setEditing(null);
  }
  function toggleStatus(user) {
    if (user.id === currentUser.id) { alert("لا يمكن تعطيل الحساب المستخدم حاليًا."); return; }
    setUsers((previous) => previous.map((item) => item.id === user.id ? { ...item, status: item.status === "active" ? "inactive" : "active" } : item));
  }
  function deleteUser(user) {
    if (user.id === currentUser.id) { alert("لا يمكن حذف الحساب المستخدم حاليًا."); return; }
    if (window.confirm(`هل تريد حذف حساب ${user.name}؟`)) setUsers((previous) => previous.filter((item) => item.id !== user.id));
  }
  return <>
    <ModulePage title="إدارة المستخدمين والمسؤولين" subtitle="إنشاء حسابات النظام وربطها بالموظفين وتحديد الأدوار وحالة الوصول." stats={stats} rows={rows} search={search} onSearch={setSearch} toolbar={<button className="hr-button hr-button-primary" type="button" onClick={() => { setEditing(null); setShowForm(true); }}>＋ إضافة حساب</button>} columns={[
      { key: "name", label: "المستخدم", render: (row) => employeeCell(row.employeeId, employees) },
      { key: "username", label: "اسم المستخدم" }, { key: "email", label: "البريد الإلكتروني" },
      { key: "role", label: "الدور", render: (row) => roleLabels[row.role] || row.role },
      { key: "status", label: "الحالة", render: (row) => <StatusBadge status={row.status} label={row.status === "active" ? "نشط" : "غير نشط"} /> },
      { key: "createdAt", label: "تاريخ الإنشاء", render: (row) => formatDate(row.createdAt) },
    ]} renderActions={(row) => <><ActionButton onClick={() => { setEditing(row); setShowForm(true); }}>تعديل</ActionButton><ActionButton tone={row.status === "active" ? "warning" : "success"} onClick={() => toggleStatus(row)}>{row.status === "active" ? "تعطيل" : "تفعيل"}</ActionButton><ActionButton tone="danger" onClick={() => deleteUser(row)}>حذف</ActionButton></>} emptyMessage="لا توجد حسابات مطابقة للبحث.">
      <section className="hr-panel"><div className="hr-section-heading"><div><h2>مصفوفة الأدوار والصلاحيات</h2><p>الأدوار المقترحة وفق متطلبات المشروع.</p></div></div><div className="hr-role-grid">{[["admin", "إدارة حسابات المستخدمين والصلاحيات وإعدادات النظام."], ["hr", "إدارة الموظفين والعقود والأقسام والحضور والرواتب والإجازات."], ["manager", "مراجعة إجازات فريقه وتقييم أدائه ومتابعة حضوره."], ["employee", "عرض ملفه وطلب الإجازة ومراجعة حضوره وقسيمة راتبه."]].map(([role, description]) => <article key={role}><strong>{roleLabels[role]}</strong><p>{description}</p></article>)}</div><div className="hr-alert hr-alert-info">هذه صلاحيات واجهة تجريبية؛ يجب تطبيقها والتحقق منها في Laravel API، لا الاكتفاء بإخفاء الأزرار.</div></section>
    </ModulePage>
    {showForm && <FormModal title={editing ? "تعديل حساب المستخدم" : "إنشاء حساب مستخدم"} fields={fields} initialValue={editing || { employeeId: "", username: "", email: "", role: "employee", status: "active", demoPassword: "" }} onClose={() => { setShowForm(false); setEditing(null); }} onSave={saveUser} validate={(data) => ({ username: !/^[a-zA-Z][a-zA-Z0-9._-]{2,29}$/.test(data.username || "") ? "اسم المستخدم يجب أن يبدأ بحرف إنجليزي ويحتوي على 3 إلى 30 رمزًا." : "", email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email || "") ? "أدخل بريدًا إلكترونيًا صحيحًا." : "", demoPassword: data.demoPassword && data.demoPassword.length < 8 ? "كلمة المرور التجريبية يجب ألا تقل عن 8 رموز." : "" })} />}
  </>;
}

// 05 — Leave Management: الطلبات والأرصدة ومسار الموافقات.
export function LeaveManagementPage({ currentUser }) {
  const employees = useMemo(() => getCurrentEmployees(), []);
  const [requests, setRequests] = useStoredList("nova_hr_leave_requests_v1", initialLeaveRequests);
  const [balances, setBalances] = useStoredList("nova_hr_leave_balances_v1", initialLeaveBalances);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const teamRequests = requests.filter((request) => {
    const employee = getEmployeeById(request.employeeId, employees);
    return employee && isEmployeeVisibleToUser(employee, currentUser);
  });
  const rows = teamRequests.filter((request) => `${getEmployeeName(request.employeeId, employees)} ${request.id} ${leaveTypeLabels[request.type]}`.toLowerCase().includes(search.toLowerCase()) && (statusFilter === "all" || request.status === statusFilter));
  const canReview = ["admin", "hr", "manager"].includes(currentUser.role);
  const canChooseEmployee = currentUser.role !== "employee";
  const selectableEmployees = currentUser.role === "manager"
    ? employees.filter((employee) => isEmployeeVisibleToUser(employee, currentUser))
    : employees;
  function submitRequest(data) {
    const start = new Date(`${data.startDate}T00:00:00`); const end = new Date(`${data.endDate}T00:00:00`);
    const days = Math.floor((end - start) / 86400000) + 1;
    if (days <= 0) { alert("تاريخ النهاية يجب أن يكون مساويًا لتاريخ البداية أو بعده."); return; }
    setRequests((previous) => [{ id: createRecordId("LEV"), employeeId: canChooseEmployee ? data.employeeId : currentUser.employeeId, type: data.type, startDate: data.startDate, endDate: data.endDate, days, reason: data.reason.trim(), status: "pending", decisionNote: "", createdAt: getToday() }, ...previous]);
    setShowForm(false);
  }
  function decideRequest(request, status) {
    let decisionNote = "";
    if (status === "rejected") { decisionNote = window.prompt("اكتب سبب رفض طلب الإجازة:")?.trim() || ""; if (!decisionNote) return; }
    if (status === "approved" && ["annual", "sick", "emergency"].includes(request.type)) {
      const balance = balances.find((item) => item.employeeId === request.employeeId);
      const remaining = Number(balance?.[request.type] ?? 0);
      if (remaining < Number(request.days)) { alert(`الرصيد المتبقي غير كافٍ. الرصيد الحالي: ${remaining} يوم.`); return; }
      setBalances((previous) => previous.map((item) => item.employeeId === request.employeeId ? { ...item, [request.type]: Number(item[request.type] || 0) - Number(request.days) } : item));
    }
    setRequests((previous) => previous.map((item) => item.id === request.id ? { ...item, status, decisionNote } : item));
  }
  const labels = { pending: "قيد المراجعة", approved: "معتمدة", rejected: "مرفوضة" };
  const stats = [
    { label: "إجمالي الطلبات", value: teamRequests.length, icon: "▤", tone: "blue" },
    { label: "قيد المراجعة", value: teamRequests.filter((item) => item.status === "pending").length, icon: "◷", tone: "orange" },
    { label: "معتمدة", value: teamRequests.filter((item) => item.status === "approved").length, icon: "✓", tone: "green" },
    { label: "مرفوضة", value: teamRequests.filter((item) => item.status === "rejected").length, icon: "×", tone: "purple" },
  ];
  const visibleBalances = balances.filter((balance) => {
    const employee = getEmployeeById(balance.employeeId, employees);
    return employee && isEmployeeVisibleToUser(employee, currentUser);
  });
  return <>
    <ModulePage title="إدارة الإجازات" subtitle="تنظيم الطلبات ومراجعتها ومتابعة الأرصدة المتاحة لكل موظف." stats={stats} rows={rows} search={search} onSearch={setSearch} toolbar={<><select className="hr-filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="تصفية حسب الحالة"><option value="all">جميع الحالات</option><option value="pending">قيد المراجعة</option><option value="approved">معتمدة</option><option value="rejected">مرفوضة</option></select><button className="hr-button hr-button-primary" type="button" onClick={() => setShowForm(true)}>＋ طلب إجازة</button></>} columns={[
      { key: "id", label: "رقم الطلب" }, { key: "employeeId", label: "الموظف", render: (row) => employeeCell(row.employeeId, employees) },
      { key: "type", label: "نوع الإجازة", render: (row) => leaveTypeLabels[row.type] || row.type },
      { key: "period", label: "الفترة", render: (row) => `${formatDate(row.startDate)} — ${formatDate(row.endDate)}` },
      { key: "days", label: "المدة", render: (row) => `${row.days} يوم` },
      { key: "status", label: "الحالة", render: (row) => <StatusBadge status={row.status} label={labels[row.status]} /> },
    ]} renderActions={(row) => row.status === "pending" && canReview && !(currentUser.role === "manager" && row.employeeId === currentUser.employeeId) ? <><ActionButton tone="success" onClick={() => decideRequest(row, "approved")}>موافقة</ActionButton><ActionButton tone="danger" onClick={() => decideRequest(row, "rejected")}>رفض</ActionButton></> : <span className="hr-muted">لا يوجد إجراء</span>} emptyMessage="لا توجد طلبات إجازة مطابقة.">
      <section className="hr-panel"><div className="hr-section-heading"><div><h2>أرصدة الإجازات</h2><p>الأرصدة التجريبية المتبقية لكل نوع إجازة.</p></div></div><DataTable rows={visibleBalances} columns={[{ key: "employeeId", label: "الموظف", render: (row) => employeeCell(row.employeeId, employees) }, { key: "annual", label: "سنوية", render: (row) => `${row.annual} يوم` }, { key: "sick", label: "مرضية", render: (row) => `${row.sick} يوم` }, { key: "emergency", label: "طارئة", render: (row) => `${row.emergency} يوم` }]} emptyMessage="لا توجد أرصدة مسجلة." /></section>
    </ModulePage>
    {showForm && <FormModal title="تقديم طلب إجازة" fields={[...(canChooseEmployee ? [{ name: "employeeId", label: "الموظف", type: "select", required: true, options: employeeOptions(selectableEmployees), fullWidth: true }] : []), { name: "type", label: "نوع الإجازة", type: "select", required: true, options: Object.entries(leaveTypeLabels).map(([value, label]) => ({ value, label })) }, { name: "startDate", label: "تاريخ البداية", type: "date", required: true }, { name: "endDate", label: "تاريخ النهاية", type: "date", required: true }, { name: "reason", label: "سبب الإجازة", type: "textarea", required: true, fullWidth: true, hint: "اكتب سببًا واضحًا لمساعدة المدير على مراجعة الطلب." }]} initialValue={{ employeeId: canChooseEmployee ? "" : currentUser.employeeId, type: "annual", startDate: getToday(), endDate: getToday(), reason: "" }} onClose={() => setShowForm(false)} onSave={submitRequest} validate={(data) => ({ endDate: data.startDate && data.endDate && data.endDate < data.startDate ? "تاريخ النهاية لا يمكن أن يسبق تاريخ البداية." : "" })} />}
  </>;
}

// 08 — Attendance Management: الحضور والانصراف والتأخير والغياب.
function workedHours(checkIn, checkOut) {
  if (!checkIn || !checkOut) return "—";
  const [ih, im] = checkIn.split(":").map(Number); const [oh, om] = checkOut.split(":").map(Number);
  const mins = oh * 60 + om - (ih * 60 + im);
  return mins < 0 ? "—" : `${Math.floor(mins / 60)} س ${mins % 60} د`;
}
export function AttendanceManagementPage({ currentUser }) {
  const employees = useMemo(() => getCurrentEmployees(), []);
  const [records, setRecords] = useStoredList("nova_hr_attendance_v1", initialAttendance);
  const [search, setSearch] = useState(""); const [dateFilter, setDateFilter] = useState(""); const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState(null); const [showForm, setShowForm] = useState(false);
  const teamRecords = records.filter((record) => {
    const employee = getEmployeeById(record.employeeId, employees);
    if (currentUser.role === "employee") return record.employeeId === currentUser.employeeId;
    if (currentUser.role === "manager") return employee && (employee.manager === currentUser.name || employee.managerId === currentUser.employeeId || employee.id === currentUser.employeeId);
    return true;
  });
  const rows = teamRecords.filter((record) => `${getEmployeeName(record.employeeId, employees)} ${record.id}`.toLowerCase().includes(search.toLowerCase()) && (!dateFilter || record.date === dateFilter) && (statusFilter === "all" || record.status === statusFilter));
  const canManage = ["admin", "hr"].includes(currentUser.role);
  function saveRecord(data) {
    const duplicate = records.some((record) => record.id !== editing?.id && record.employeeId === data.employeeId && record.date === data.date);
    if (duplicate) { alert("يوجد سجل حضور لهذا الموظف في التاريخ المحدد بالفعل."); return; }
    if (data.checkIn && data.checkOut && data.checkOut < data.checkIn) { alert("وقت الانصراف يجب أن يكون بعد وقت الحضور."); return; }
    const status = data.status || (data.checkIn > "08:30" ? "late" : data.checkIn ? "present" : "absent");
    const saved = { ...editing, ...data, id: editing?.id || createRecordId("ATT"), status };
    setRecords((previous) => editing ? previous.map((item) => item.id === editing.id ? saved : item) : [saved, ...previous]);
    setShowForm(false); setEditing(null);
  }
  function quickAttendanceAction() {
    const employeeId = currentUser.employeeId; const today = getToday();
    const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date());
    const existing = records.find((item) => item.employeeId === employeeId && item.date === today);
    if (!existing) { setRecords((previous) => [{ id: createRecordId("ATT"), employeeId, date: today, checkIn: time, checkOut: "", status: time > "08:30" ? "late" : "present", notes: "تسجيل حضور ذاتي" }, ...previous]); return; }
    if (!existing.checkOut) {
      if (time < existing.checkIn) { alert("لا يمكن تسجيل الانصراف قبل وقت الحضور."); return; }
      setRecords((previous) => previous.map((item) => item.id === existing.id ? { ...item, checkOut: time, notes: item.notes || "تسجيل انصراف ذاتي" } : item));
      return;
    }
    alert("تم تسجيل الحضور والانصراف لهذا اليوم بالفعل.");
  }
  const stats = [
    { label: "سجلات اليوم", value: teamRecords.filter((item) => item.date === getToday()).length, icon: "▤", tone: "blue" },
    { label: "حضور", value: teamRecords.filter((item) => item.date === getToday() && item.status === "present").length, icon: "✓", tone: "green" },
    { label: "تأخير", value: teamRecords.filter((item) => item.date === getToday() && item.status === "late").length, icon: "◷", tone: "orange" },
    { label: "غياب", value: teamRecords.filter((item) => item.date === getToday() && item.status === "absent").length, icon: "×", tone: "purple" },
  ];
  return <>
    <ModulePage title="إدارة الحضور والانصراف" subtitle="متابعة سجلات الدوام اليومية وأوقات الحضور والمغادرة والتأخير والغياب." stats={stats} rows={rows} search={search} onSearch={setSearch} toolbar={<><input className="hr-filter-select" type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} aria-label="تصفية حسب التاريخ" /><select className="hr-filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="تصفية حسب الحالة"><option value="all">جميع الحالات</option><option value="present">حاضر</option><option value="late">متأخر</option><option value="absent">غائب</option><option value="leave">إجازة</option></select>{currentUser.role === "employee" && <button className="hr-button hr-button-primary" type="button" onClick={quickAttendanceAction}>تسجيل حضور / انصراف</button>}{canManage && <button className="hr-button hr-button-primary" type="button" onClick={() => { setEditing(null); setShowForm(true); }}>＋ إضافة سجل</button>}</>} columns={[
      { key: "employeeId", label: "الموظف", render: (row) => employeeCell(row.employeeId, employees) },
      { key: "date", label: "التاريخ", render: (row) => formatDate(row.date) }, { key: "checkIn", label: "الحضور" }, { key: "checkOut", label: "الانصراف" },
      { key: "hours", label: "ساعات العمل", render: (row) => workedHours(row.checkIn, row.checkOut) },
      { key: "status", label: "الحالة", render: (row) => <StatusBadge status={row.status} label={attendanceStatusLabels[row.status]} /> },
    ]} renderActions={canManage ? (row) => <ActionButton onClick={() => { setEditing(row); setShowForm(true); }}>تعديل</ActionButton> : undefined} emptyMessage="لا توجد سجلات حضور تطابق الفلاتر الحالية." />
    {showForm && <FormModal title={editing ? "تعديل سجل الحضور" : "إضافة سجل حضور"} fields={[{ name: "employeeId", label: "الموظف", type: "select", required: true, options: employeeOptions(employees), fullWidth: true }, { name: "date", label: "التاريخ", type: "date", required: true }, { name: "checkIn", label: "وقت الحضور", type: "time" }, { name: "checkOut", label: "وقت الانصراف", type: "time" }, { name: "status", label: "الحالة", type: "select", required: true, options: Object.entries(attendanceStatusLabels).map(([value, label]) => ({ value, label })) }, { name: "notes", label: "ملاحظات", type: "textarea", fullWidth: true }]} initialValue={editing || { employeeId: "", date: getToday(), checkIn: "08:00", checkOut: "16:00", status: "present", notes: "" }} onClose={() => { setShowForm(false); setEditing(null); }} onSave={saveRecord} />}
  </>;
}

// 07 — Payroll Management: الرواتب والبدلات والمكافآت والخصومات.
export function PayrollManagementPage({ currentUser }) {
  const employees = useMemo(() => getCurrentEmployees(), []);
  const [records, setRecords] = useStoredList("nova_hr_payroll_v1", initialPayroll);
  const [search, setSearch] = useState(""); const [month, setMonth] = useState(getToday().slice(0, 7));
  const [editing, setEditing] = useState(null); const [showForm, setShowForm] = useState(false);
  const canManage = ["admin", "hr"].includes(currentUser.role);
  const visibleRecords = records.filter((record) => currentUser.role !== "employee" || record.employeeId === currentUser.employeeId);
  const rows = visibleRecords.filter((record) => `${getEmployeeName(record.employeeId, employees)} ${record.month} ${record.id}`.toLowerCase().includes(search.toLowerCase()) && (month === "all" || record.month === month));

  function generatePayroll() {
    if (month === "all") { alert("اختر شهرًا محددًا قبل إنشاء كشف الرواتب."); return; }
    const activeEmployees = employees.filter((employee) => employee.status === "نشط");
    const generated = new Set(records.filter((record) => record.month === month).map((record) => record.employeeId));
    const eligibleEmployees = activeEmployees.filter((employee) => Number(employee.salary) > 0 && !generated.has(employee.id));
    const missingSalaryCount = activeEmployees.filter((employee) => !(Number(employee.salary) > 0)).length;
    const newRecords = eligibleEmployees.map((employee) => ({
      id: createRecordId("PAY"), employeeId: employee.id, month,
      basicSalary: Number(employee.salary) || 0, allowances: 0, bonus: 0,
      deductions: 0, netSalary: Number(employee.salary) || 0, status: "draft", createdAt: getToday(),
    }));
    if (!newRecords.length) { alert("لا توجد سجلات جديدة بمرتبات أساسية صحيحة لهذه الفترة؛ تحقق من الشهر وملفات الموظفين."); return; }
    setRecords((previous) => [...newRecords, ...previous]);
    if (missingSalaryCount) alert(`تم إنشاء ${newRecords.length} قسيمة، وتُرك ${missingSalaryCount} موظفًا لعدم وجود راتب أساسي صحيح في ملفه.`);
  }

  function savePayroll(data) {
    const allowances = Number(data.allowances) || 0; const bonus = Number(data.bonus) || 0; const deductions = Number(data.deductions) || 0;
    if ([allowances, bonus, deductions].some((value) => value < 0)) { alert("لا يمكن إدخال قيمة سالبة."); return; }
    const netSalary = Number(editing.basicSalary) + allowances + bonus - deductions;
    if (netSalary < 0) { alert("صافي الراتب لا يمكن أن يكون أقل من صفر."); return; }
    setRecords((previous) => previous.map((item) => item.id === editing.id ? { ...item, allowances, bonus, deductions, netSalary } : item));
    setShowForm(false); setEditing(null);
  }
  function setPayrollStatus(record, status) {
    setRecords((previous) => previous.map((item) => item.id === record.id ? { ...item, status } : item));
  }

  const monthRecords = visibleRecords.filter((record) => record.month === month);
  const totalNet = monthRecords.reduce((sum, record) => sum + Number(record.netSalary || 0), 0);
  const stats = [
    { label: "عدد قسائم الشهر", value: monthRecords.length, icon: "▤", tone: "blue" },
    { label: "إجمالي الرواتب الصافية", value: `${formatMoney(totalNet)} ₪`, icon: "₪", tone: "green" },
    { label: "مسودات", value: monthRecords.filter((record) => record.status === "draft").length, icon: "◷", tone: "orange" },
    { label: "مدفوعة", value: monthRecords.filter((record) => record.status === "paid").length, icon: "✓", tone: "purple" },
  ];
  const labels = { draft: "مسودة", approved: "معتمد", paid: "مدفوع" };
  const monthOptions = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(); date.setMonth(date.getMonth() - index); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }).filter((value, index, array) => array.indexOf(value) === index);

  return <>
    <ModulePage title={currentUser.role === "employee" ? "قسائم رواتبي" : "إدارة الرواتب"} subtitle={currentUser.role === "employee" ? "عرض قسائم الرواتب الخاصة بحسابك فقط." : "إعداد كشوف الرواتب الشهرية ومراجعة البدلات والمكافآت والخصومات."} stats={stats} rows={rows} search={search} onSearch={setSearch} toolbar={<><select className="hr-filter-select" value={month} onChange={(event) => setMonth(event.target.value)} aria-label="الشهر"><option value="all">كل الفترات</option>{monthOptions.map((value) => <option key={value} value={value}>{value}</option>)}</select>{canManage && <button className="hr-button hr-button-primary" type="button" onClick={generatePayroll}>＋ إنشاء كشف للشهر</button>}</>} columns={[
      { key: "id", label: "رقم القسيمة" }, { key: "employeeId", label: "الموظف", render: (row) => employeeCell(row.employeeId, employees) },
      { key: "month", label: "الفترة" }, { key: "basicSalary", label: "الأساسي", render: (row) => `${formatMoney(row.basicSalary)} ₪` },
      { key: "allowances", label: "البدلات", render: (row) => `${formatMoney(row.allowances)} ₪` }, { key: "bonus", label: "المكافآت", render: (row) => `${formatMoney(row.bonus)} ₪` },
      { key: "deductions", label: "الخصومات", render: (row) => `${formatMoney(row.deductions)} ₪` }, { key: "netSalary", label: "الصافي", render: (row) => <strong>{formatMoney(row.netSalary)} ₪</strong> },
      { key: "status", label: "الحالة", render: (row) => <StatusBadge status={row.status} label={labels[row.status]} /> },
    ]} renderActions={canManage ? (row) => <>{row.status === "draft" && <><ActionButton onClick={() => { setEditing(row); setShowForm(true); }}>تعديل القيم</ActionButton><ActionButton tone="success" onClick={() => setPayrollStatus(row, "approved")}>اعتماد</ActionButton></>}{row.status === "approved" && <ActionButton tone="success" onClick={() => setPayrollStatus(row, "paid")}>تأكيد الدفع</ActionButton>}</> : (row) => <ActionButton onClick={() => alert(`صافي الراتب للفترة ${row.month}: ${formatMoney(row.netSalary)} ₪`)}>عرض القسيمة</ActionButton>} emptyMessage="لا توجد قسائم رواتب لهذه الفترة.">
      <div className="hr-alert hr-alert-warning">تُنشأ المسودة من الراتب الأساسي المسجل في ملف الموظف، وتبدأ البدلات والمكافآت والخصومات بصفر. يجب إدخال قواعد الاستحقاق الفعلية المعتمدة لدى المؤسسة قبل اعتماد الرواتب.</div>
    </ModulePage>
    {showForm && <FormModal title={`تفاصيل راتب ${getEmployeeName(editing.employeeId, employees)} — ${editing.month}`} fields={[{ name: "allowances", label: "البدلات", type: "number", required: true, min: 0, step: "0.01", hint: "مجموع البدلات المستحقة وفق سياسة المؤسسة." }, { name: "bonus", label: "المكافآت", type: "number", required: true, min: 0, step: "0.01" }, { name: "deductions", label: "الخصومات", type: "number", required: true, min: 0, step: "0.01", hint: "أدخل الخصومات المعتمدة فقط." }]} initialValue={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSave={savePayroll} />}
  </>;
}

// 10 — Performance Evaluation: مؤشرات التقييم الدوري واعتماد النتائج.
function performanceScore(record) {
  return [record.quality, record.productivity, record.teamwork, record.commitment].map(Number).reduce((sum, value) => sum + value, 0) / 4;
}
export function PerformanceEvaluationPage({ currentUser }) {
  const employees = useMemo(() => getCurrentEmployees(), []);
  const [evaluations, setEvaluations] = useStoredList("nova_hr_performance_v1", initialEvaluations);
  const [search, setSearch] = useState(""); const [showForm, setShowForm] = useState(false);
  const canEvaluate = ["admin", "hr", "manager"].includes(currentUser.role);
  const canApprove = ["admin", "hr"].includes(currentUser.role);
  const selectableEmployees = currentUser.role === "manager"
    ? employees.filter((employee) => isEmployeeVisibleToUser(employee, currentUser))
    : employees;
  const teamEvaluations = evaluations.filter((record) => isEmployeeVisibleToUser(getEmployeeById(record.employeeId, employees) || { id: record.employeeId }, currentUser));
  const rows = teamEvaluations.filter((record) => `${getEmployeeName(record.employeeId, employees)} ${record.period} ${record.id}`.toLowerCase().includes(search.toLowerCase()));
  function saveEvaluation(data) {
    const values = [data.quality, data.productivity, data.teamwork, data.commitment].map(Number);
    if (values.some((value) => value < 1 || value > 5 || !Number.isFinite(value))) { alert("يجب أن تكون جميع درجات التقييم بين 1 و5."); return; }
    setEvaluations((previous) => [{ ...data, id: createRecordId("PER"), quality: Number(data.quality), productivity: Number(data.productivity), teamwork: Number(data.teamwork), commitment: Number(data.commitment), status: "submitted", createdAt: getToday(), evaluatorId: currentUser.employeeId }, ...previous]);
    setShowForm(false);
  }
  function updateStatus(record, status) { setEvaluations((previous) => previous.map((item) => item.id === record.id ? { ...item, status } : item)); }
  const stats = [
    { label: "إجمالي التقييمات", value: teamEvaluations.length, icon: "▤", tone: "blue" },
    { label: "متوسط الأداء", value: teamEvaluations.length ? `${(teamEvaluations.reduce((sum, item) => sum + performanceScore(item), 0) / teamEvaluations.length).toFixed(1)} / 5` : "—", icon: "☆", tone: "green" },
    { label: "بانتظار المراجعة", value: teamEvaluations.filter((item) => item.status === "submitted").length, icon: "◷", tone: "orange" },
    { label: "تقييمات معتمدة", value: teamEvaluations.filter((item) => item.status === "approved").length, icon: "✓", tone: "purple" },
  ];
  return <>
    <ModulePage title="تقييم الأداء الوظيفي" subtitle="تسجيل التقييمات الدورية وقياس جودة العمل والإنتاجية والتعاون والالتزام." stats={stats} rows={rows} search={search} onSearch={setSearch} toolbar={canEvaluate && <button className="hr-button hr-button-primary" type="button" onClick={() => setShowForm(true)}>＋ إضافة تقييم</button>} columns={[
      { key: "employeeId", label: "الموظف", render: (row) => employeeCell(row.employeeId, employees) }, { key: "period", label: "فترة التقييم" },
      { key: "quality", label: "جودة العمل" }, { key: "productivity", label: "الإنتاجية" }, { key: "teamwork", label: "التعاون" }, { key: "commitment", label: "الالتزام" },
      { key: "score", label: "المتوسط", render: (row) => <strong>{performanceScore(row).toFixed(2)} / 5</strong> },
      { key: "status", label: "الحالة", render: (row) => <StatusBadge status={row.status} label={evaluationStatusLabels[row.status]} /> },
    ]} renderActions={(row) => <>{row.status === "draft" && currentUser.role === "manager" && <ActionButton tone="success" onClick={() => updateStatus(row, "submitted")}>إرسال للمراجعة</ActionButton>}{row.status === "submitted" && canApprove && <ActionButton tone="success" onClick={() => updateStatus(row, "approved")}>اعتماد التقييم</ActionButton>}<ActionButton onClick={() => alert(`نقاط القوة: ${row.strengths || "—"}\n\nمجالات التحسين: ${row.improvements || "—"}`)}>التفاصيل</ActionButton></>} emptyMessage="لا توجد تقييمات مسجلة حتى الآن.">
      <div className="hr-alert hr-alert-info">كل معيار من 1 إلى 5. المتوسط الحالي يحسب المعايير الأربعة بالتساوي؛ يمكن تعديل الأوزان لاحقًا بعد اعتماد نموذج تقييم المؤسسة.</div>
    </ModulePage>
    {showForm && <FormModal title="إنشاء تقييم أداء" fields={[{ name: "employeeId", label: "الموظف", type: "select", required: true, options: employeeOptions(selectableEmployees), fullWidth: true }, { name: "period", label: "فترة التقييم", required: true, placeholder: "مثال: 2026-Q4", hint: "استخدم صيغة الفترة المعتمدة لدى المؤسسة." }, { name: "quality", label: "جودة العمل (1–5)", type: "number", required: true, min: 1, max: 5, step: 1 }, { name: "productivity", label: "الإنتاجية (1–5)", type: "number", required: true, min: 1, max: 5, step: 1 }, { name: "teamwork", label: "التعاون (1–5)", type: "number", required: true, min: 1, max: 5, step: 1 }, { name: "commitment", label: "الالتزام (1–5)", type: "number", required: true, min: 1, max: 5, step: 1 }, { name: "strengths", label: "نقاط القوة", type: "textarea", required: true, fullWidth: true }, { name: "improvements", label: "مجالات التحسين", type: "textarea", required: true, fullWidth: true }]} initialValue={{ employeeId: "", period: `${new Date().getFullYear()}-Q4`, quality: 3, productivity: 3, teamwork: 3, commitment: 3, strengths: "", improvements: "" }} onClose={() => setShowForm(false)} onSave={saveEvaluation} validate={(data) => Object.fromEntries(["quality", "productivity", "teamwork", "commitment"].map((key) => [key, Number(data[key]) < 1 || Number(data[key]) > 5 ? "أدخل درجة من 1 إلى 5." : ""]))} />}
  </>;
}

// 09 — Training Management: واجهة اختيارية خارج نطاق النسخة المعتمدة حاليًا.
export function TrainingManagementPage({ currentUser }) {
  const [programs, setPrograms] = useStoredList("nova_hr_training_v1", initialTrainingPrograms);
  const [search, setSearch] = useState(""); const [showForm, setShowForm] = useState(false); const [editing, setEditing] = useState(null);
  const canManage = ["admin", "hr"].includes(currentUser.role);
  const rows = programs.filter((item) => `${item.title} ${item.category} ${item.trainer}`.toLowerCase().includes(search.toLowerCase()));
  function saveProgram(data) {
    const saved = { ...editing, ...data, id: editing?.id || createRecordId("TRN"), capacity: Number(data.capacity) || 0 };
    setPrograms((previous) => editing ? previous.map((item) => item.id === editing.id ? saved : item) : [saved, ...previous]);
    setShowForm(false); setEditing(null);
  }
  const stats = [
    { label: "إجمالي البرامج", value: programs.length, icon: "▤", tone: "blue" },
    { label: "مجدولة", value: programs.filter((item) => item.status === "planned").length, icon: "◷", tone: "orange" },
    { label: "قيد التنفيذ", value: programs.filter((item) => item.status === "ongoing").length, icon: "↗", tone: "green" },
    { label: "مكتملة", value: programs.filter((item) => item.status === "completed").length, icon: "✓", tone: "purple" },
  ];
  return <>
    <ModulePage title="إدارة التدريب والتطوير" subtitle="واجهة اختيارية لتخطيط البرامج التدريبية وتحديد المدرب والفترة والطاقة الاستيعابية." eyebrow="ميزة تطويرية — خارج النطاق الرسمي الحالي" stats={stats} rows={rows} search={search} onSearch={setSearch} toolbar={canManage && <button className="hr-button hr-button-primary" type="button" onClick={() => { setEditing(null); setShowForm(true); }}>＋ إضافة برنامج</button>} columns={[
      { key: "title", label: "البرنامج التدريبي" }, { key: "category", label: "التصنيف" }, { key: "trainer", label: "المدرب / الجهة" },
      { key: "period", label: "الفترة", render: (row) => `${formatDate(row.startDate)} — ${formatDate(row.endDate)}` },
      { key: "capacity", label: "السعة", render: (row) => `${row.capacity} متدرب` },
      { key: "status", label: "الحالة", render: (row) => <StatusBadge status={row.status} label={trainingStatusLabels[row.status]} /> },
    ]} renderActions={canManage ? (row) => <ActionButton onClick={() => { setEditing(row); setShowForm(true); }}>تعديل</ActionButton> : undefined} emptyMessage="لا توجد برامج تدريبية مسجلة.">
      <div className="hr-alert hr-alert-warning">ملخص المشروع الرسمي يستثني التدريب من النسخة الحالية. احتفظ بهذه الصفحة كتصميم اختياري فقط إلى أن يتم تحديث نطاق المشروع واعتماده.</div>
    </ModulePage>
    {showForm && <FormModal title={editing ? "تعديل البرنامج التدريبي" : "إضافة برنامج تدريبي"} fields={[{ name: "title", label: "اسم البرنامج", required: true, fullWidth: true }, { name: "category", label: "التصنيف", required: true }, { name: "trainer", label: "المدرب / الجهة", required: true }, { name: "startDate", label: "تاريخ البداية", type: "date", required: true }, { name: "endDate", label: "تاريخ النهاية", type: "date", required: true }, { name: "capacity", label: "الطاقة الاستيعابية", type: "number", required: true, min: 1, step: 1 }, { name: "status", label: "الحالة", type: "select", required: true, options: Object.entries(trainingStatusLabels).map(([value, label]) => ({ value, label })) }]} initialValue={editing || { title: "", category: "إداري", trainer: "", startDate: getToday(), endDate: getToday(), capacity: 10, status: "planned" }} onClose={() => { setShowForm(false); setEditing(null); }} onSave={saveProgram} validate={(data) => ({ endDate: data.startDate && data.endDate && data.endDate < data.startDate ? "تاريخ النهاية يجب ألا يسبق تاريخ البداية." : "" })} />}
  </>;
}

// 01 — Dashboard: ملخص الواجهة الرئيسية بحسب دور المستخدم.
export function DashboardPage({ currentUser, departments = [] }) {
  const employees = useMemo(() => getCurrentEmployees(), []);
  const [leaves] = useStoredList("nova_hr_leave_requests_v1", initialLeaveRequests);
  const [attendance] = useStoredList("nova_hr_attendance_v1", initialAttendance);
  const [payroll] = useStoredList("nova_hr_payroll_v1", initialPayroll);
  const [evaluations] = useStoredList("nova_hr_performance_v1", initialEvaluations);
  const visibleEmployees = employees.filter((employee) => isEmployeeVisibleToUser(employee, currentUser));
  const visibleLeaves = leaves.filter((item) => {
    const employee = getEmployeeById(item.employeeId, employees);
    if (currentUser.role === "employee") return item.employeeId === currentUser.employeeId;
    if (currentUser.role === "manager") return employee && (employee.manager === currentUser.name || employee.managerId === currentUser.employeeId);
    return true;
  });
  const visibleAttendance = attendance.filter((item) => isEmployeeVisibleToUser(getEmployeeById(item.employeeId, employees) || { id: item.employeeId }, currentUser));
  const stats = [
    { label: "الموظفون", value: currentUser.role === "employee" ? 1 : visibleEmployees.length, icon: "♙", tone: "blue" },
    { label: "الأقسام", value: currentUser.role === "employee" ? getEmployeeDepartment(currentUser.employeeId, employees) : departments.length, icon: "▦", tone: "green" },
    { label: "طلبات الإجازة المعلقة", value: visibleLeaves.filter((item) => item.status === "pending").length, icon: "◷", tone: "orange" },
    { label: "سجلات الحضور اليوم", value: visibleAttendance.filter((item) => item.date === getToday()).length, icon: "✓", tone: "purple" },
  ];
  return <section className="hr-page" dir="rtl"><PageHeading title={`مرحبًا، ${currentUser.name}`} subtitle="نظرة عامة على مؤشرات وعمليات الموارد البشرية حسب صلاحيات حسابك." /><StatCards items={stats} /><div className="hr-dashboard-grid"><section className="hr-panel"><div className="hr-section-heading"><div><h2>أحدث طلبات الإجازة</h2><p>آخر الطلبات المسجلة في النظام.</p></div></div><DataTable rows={visibleLeaves.slice(0, 4)} columns={[{ key: "employeeId", label: "الموظف", render: (row) => getEmployeeName(row.employeeId, employees) }, { key: "type", label: "النوع", render: (row) => leaveTypeLabels[row.type] }, { key: "days", label: "المدة", render: (row) => `${row.days} يوم` }, { key: "status", label: "الحالة", render: (row) => <StatusBadge status={row.status} label={{ pending: "قيد المراجعة", approved: "معتمدة", rejected: "مرفوضة" }[row.status]} /> }]} emptyMessage="لا توجد طلبات بعد." /></section><section className="hr-panel hr-quick-panel"><h2>الوحدات المتاحة</h2><div className="hr-quick-links"><div><strong>إدارة الموظفين والأقسام</strong><span>البيانات الأساسية والهيكل التنظيمي.</span></div><div><strong>الحضور والإجازات</strong><span>تسجيل الدوام ومسار الموافقات.</span></div><div><strong>الرواتب والتقييم</strong><span>الكشوف ومؤشرات الأداء الوظيفي.</span></div></div><p className="hr-muted">عدد قسائم الرواتب: {payroll.length} · عدد التقييمات: {evaluations.length}</p></section></div></section>;
}

export function ReportsPage({ currentUser }) {
  const employees = useMemo(() => getCurrentEmployees(), []);
  const [leaves] = useStoredList("nova_hr_leave_requests_v1", initialLeaveRequests);
  const [attendance] = useStoredList("nova_hr_attendance_v1", initialAttendance);
  const [payroll] = useStoredList("nova_hr_payroll_v1", initialPayroll);
  const visibleLeaves = leaves.filter((item) => isEmployeeVisibleToUser(getEmployeeById(item.employeeId, employees) || { id: item.employeeId }, currentUser));
  const visibleAttendance = attendance.filter((item) => isEmployeeVisibleToUser(getEmployeeById(item.employeeId, employees) || { id: item.employeeId }, currentUser));
  const rows = employees.filter((employee) => isEmployeeVisibleToUser(employee, currentUser));
  const visibleEmployeeIds = new Set(rows.map((employee) => employee.id));
  const visiblePayroll = payroll.filter((item) => currentUser.role === "employee" || visibleEmployeeIds.has(item.employeeId));
  const csv = [["Employee ID", "Name", "Department", "Job", "Status"], ...rows.map((employee) => [employee.id, employee.name, employee.department, employee.job, employee.status])].map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
  function downloadCSV() {
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a");
    link.href = url; link.download = "nova-hr-employees-report.csv"; link.click(); URL.revokeObjectURL(url);
  }
  return <section className="hr-page" dir="rtl"><PageHeading title="التقارير الإدارية" subtitle="ملخص مؤشرات الموارد البشرية وتصدير قائمة الموظفين الظاهرة لهذا الحساب." actions={<button className="hr-button hr-button-primary" type="button" onClick={downloadCSV}>تصدير الموظفين CSV</button>} /><StatCards items={[{ label: "الموظفون الظاهرون", value: rows.length, icon: "♙", tone: "blue" }, { label: "طلبات الإجازة", value: visibleLeaves.length, icon: "▤", tone: "green" }, { label: "سجلات الحضور", value: visibleAttendance.length, icon: "◷", tone: "orange" }, { label: "قسائم الرواتب", value: visiblePayroll.length, icon: "₪", tone: "purple" }]} /><div className="hr-alert hr-alert-info">التقارير الحالية أولية وتعتمد على بيانات الواجهة التجريبية. يجب بناء تقارير الخادم والتصدير الرسمي بعد ربط Laravel وقواعد البيانات.</div></section>;
}
```

## `src/features/shared/hrInitialData.js`

```javascript
export const roleLabels = {
  admin: "مدير النظام",
  hr: "مسؤول الموارد البشرية",
  manager: "المدير المباشر",
  employee: "موظف",
};

export const accountStatuses = {
  active: "نشط",
  inactive: "غير نشط",
};

export const initialUsers = [
  {
    id: "USR-001",
    employeeId: "EMP-001",
    username: "admin",
    name: "أحمد محمد عبد الله",
    email: "admin@nova.com",
    role: "admin",
    status: "active",
    demoPassword: "Admin123!",
    createdAt: "2026-01-01",
  },
  {
    id: "USR-002",
    employeeId: "EMP-003",
    username: "hr",
    name: "محمد ياسر أبو عودة",
    email: "hr@nova.com",
    role: "hr",
    status: "active",
    demoPassword: "HR123456!",
    createdAt: "2026-01-05",
  },
  {
    id: "USR-003",
    employeeId: "EMP-001",
    username: "manager",
    name: "أحمد محمد عبد الله",
    email: "manager@nova.com",
    role: "manager",
    status: "active",
    demoPassword: "Manager123!",
    createdAt: "2026-01-10",
  },
  {
    id: "USR-004",
    employeeId: "EMP-002",
    username: "employee",
    name: "سارة خالد حمد",
    email: "employee@nova.com",
    role: "employee",
    status: "active",
    demoPassword: "Employee123!",
    createdAt: "2026-01-15",
  },
];

export const initialLeaveRequests = [
  {
    id: "LEV-1001",
    employeeId: "EMP-002",
    type: "annual",
    startDate: "2026-11-18",
    endDate: "2026-11-20",
    days: 3,
    reason: "ظرف عائلي",
    status: "pending",
    decisionNote: "",
    createdAt: "2026-11-11",
  },
  {
    id: "LEV-1002",
    employeeId: "EMP-003",
    type: "sick",
    startDate: "2026-11-04",
    endDate: "2026-11-05",
    days: 2,
    reason: "إجازة مرضية",
    status: "approved",
    decisionNote: "تمت الموافقة بعد مراجعة الطلب.",
    createdAt: "2026-11-02",
  },
  {
    id: "LEV-1003",
    employeeId: "EMP-004",
    type: "emergency",
    startDate: "2026-10-22",
    endDate: "2026-10-22",
    days: 1,
    reason: "ظرف طارئ",
    status: "rejected",
    decisionNote: "يرجى إعادة تقديم الطلب بتاريخ بديل.",
    createdAt: "2026-10-20",
  },
];

export const initialLeaveBalances = [
  { employeeId: "EMP-001", annual: 18, sick: 12, emergency: 3 },
  { employeeId: "EMP-002", annual: 15, sick: 10, emergency: 3 },
  { employeeId: "EMP-003", annual: 20, sick: 12, emergency: 3 },
  { employeeId: "EMP-004", annual: 14, sick: 12, emergency: 3 },
  { employeeId: "EMP-005", annual: 18, sick: 12, emergency: 3 },
];

export const leaveTypeLabels = {
  annual: "سنوية",
  sick: "مرضية",
  emergency: "طارئة",
  unpaid: "بدون راتب",
};

export const initialAttendance = [
  { id: "ATT-1001", employeeId: "EMP-001", date: "2026-11-13", checkIn: "08:05", checkOut: "16:10", status: "present", notes: "" },
  { id: "ATT-1002", employeeId: "EMP-002", date: "2026-11-13", checkIn: "08:47", checkOut: "16:00", status: "late", notes: "تأخر بسبب المواصلات" },
  { id: "ATT-1003", employeeId: "EMP-003", date: "2026-11-13", checkIn: "08:15", checkOut: "16:05", status: "present", notes: "" },
  { id: "ATT-1004", employeeId: "EMP-004", date: "2026-11-13", checkIn: "", checkOut: "", status: "absent", notes: "غياب مسجل" },
];

export const attendanceStatusLabels = {
  present: "حاضر",
  late: "متأخر",
  absent: "غائب",
  leave: "إجازة",
};

export const initialPayroll = [];

export const initialEvaluations = [
  {
    id: "PER-1001",
    employeeId: "EMP-002",
    period: "2026-Q3",
    quality: 4,
    productivity: 4,
    teamwork: 5,
    commitment: 4,
    strengths: "التعاون وسرعة إنجاز المهام.",
    improvements: "تعزيز توثيق الأعمال اليومية.",
    status: "approved",
    createdAt: "2026-10-01",
  },
];

export const evaluationStatusLabels = {
  draft: "مسودة",
  submitted: "بانتظار المراجعة",
  approved: "معتمد",
};

// هذا القسم إضافي/اختياري؛ ملخص المشروع الرسمي يستثني التدريب من النسخة الحالية.
export const initialTrainingPrograms = [
  {
    id: "TRN-1001",
    title: "مهارات Excel وتحليل البيانات",
    category: "تقني",
    trainer: "وحدة التدريب والتطوير",
    startDate: "2026-12-01",
    endDate: "2026-12-03",
    capacity: 20,
    status: "planned",
  },
];

export const trainingStatusLabels = {
  planned: "مجدول",
  ongoing: "قيد التنفيذ",
  completed: "مكتمل",
  cancelled: "ملغي",
};
```

## `src/features/shared/hrStorage.js`

```javascript
import { useEffect, useState } from "react";
import { employees as initialEmployees } from "../employees/data/employees";

export function readStoredList(key, fallback = []) {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    console.error(`تعذر قراءة البيانات من ${key}:`, error);
    return fallback;
  }
}

export function useStoredList(key, fallback = []) {
  const [items, setItems] = useState(() => readStoredList(key, fallback));

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch (error) {
      console.error(`تعذر حفظ البيانات في ${key}:`, error);
    }
  }, [key, items]);

  return [items, setItems];
}

export function getCurrentEmployees() {
  return readStoredList("nova_hr_employees_v1", initialEmployees);
}

export function createRecordId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export function getToday() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
}

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ar-PS", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatMoney(value) {
  return new Intl.NumberFormat("ar-PS", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export function getEmployeeName(employeeId, employees = getCurrentEmployees()) {
  return employees.find((employee) => employee.id === employeeId)?.name || "موظف غير محدد";
}

export function getEmployeeDepartment(employeeId, employees = getCurrentEmployees()) {
  return employees.find((employee) => employee.id === employeeId)?.department || "—";
}

export function getEmployeeById(employeeId, employees = getCurrentEmployees()) {
  return employees.find((employee) => employee.id === employeeId) || null;
}

export function isEmployeeVisibleToUser(employee, user) {
  if (!user || user.role === "admin" || user.role === "hr") return true;
  if (user.role === "employee") return employee.id === user.employeeId;
  if (user.role === "manager") {
    return employee.id === user.employeeId ||
      employee.manager === user.name ||
      employee.managerId === user.employeeId;
  }
  return false;
}
```

## `src/styles/hr-modules.css`

```css
/* =========================================================
   NOVA HR — Shared modules and authentication
   Uses global design tokens from global.css
   ========================================================= */

.hr-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  padding: 26px 30px 36px;
  color: var(--color-text-primary);
}

.hr-page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
}

.hr-page-heading h1 {
  margin-top: 3px;
  color: var(--color-brand);
  font-size: 23px;
  font-weight: 700;
}

.hr-page-heading p {
  margin-top: 5px;
  color: var(--color-text-muted);
  font-size: 12px;
}

.hr-eyebrow {
  color: var(--color-primary);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .3px;
}

.hr-heading-actions,
.hr-toolbar-filters,
.hr-row-actions,
.hr-modal-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.hr-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.hr-stat-card,
.hr-panel {
  min-width: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.hr-stat-card {
  display: flex;
  min-height: 112px;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
  padding: 16px 17px;
}

.hr-stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: var(--color-text-secondary);
  font-size: 11px;
}

.hr-stat-card > strong {
  color: var(--color-brand);
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.hr-stat-card > small {
  color: var(--color-text-muted);
  font-size: 10px;
}

.hr-stat-icon {
  display: grid;
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  place-items: center;
  border-radius: 9px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 16px;
}
.hr-stat-icon.green { background: #ecfdf3; color: #079455; }
.hr-stat-icon.orange { background: #fffaeb; color: #dc6803; }
.hr-stat-icon.purple { background: #f4f0ff; color: #6941c6; }

.hr-panel {
  padding: 18px;
}

.hr-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 15px;
}

.hr-search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  width: min(360px, 100%);
  min-height: 38px;
  padding: 0 11px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: #fff;
  color: var(--color-text-muted);
}

.hr-search-wrap:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(40, 120, 200, .09);
}

.hr-search-wrap input {
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--color-text-primary);
  font-size: 11px;
}

.hr-filter-select {
  min-height: 38px;
  min-width: 120px;
  padding: 0 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: #fff;
  color: var(--color-text-secondary);
  font-size: 11px;
}

.hr-button {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 13px;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-family: var(--font-family-primary);
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  transition: background .18s ease, border-color .18s ease, transform .18s ease;
}

.hr-button:active { transform: translateY(1px); }
.hr-button-primary { background: var(--color-primary); color: #fff; }
.hr-button-primary:hover { background: var(--color-primary-hover); }
.hr-button-secondary { border-color: var(--color-border); background: #fff; color: var(--color-text-secondary); }
.hr-button-secondary:hover { background: var(--color-surface-hover); }
.hr-button-success { border-color: #a6f4c5; background: #ecfdf3; color: #067647; }
.hr-button-success:hover { background: #d1fadf; }
.hr-button-warning { border-color: #fedf89; background: #fffaeb; color: #b54708; }
.hr-button-danger { border-color: #fecdca; background: #fef3f2; color: #b42318; }
.hr-button-danger:hover { background: #fee4e2; }
.hr-table-action { min-height: 29px; padding: 5px 8px; font-size: 10px; }

.hr-table-wrap {
  width: 100%;
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.hr-table {
  width: 100%;
  min-width: 740px;
  border-collapse: separate;
  border-spacing: 0;
  text-align: right;
}

.hr-table th {
  padding: 12px 11px;
  border-bottom: 1px solid var(--color-border);
  background: #f8fafc;
  color: var(--color-text-secondary);
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.hr-table td {
  padding: 12px 11px;
  border-bottom: 1px solid #eef0f4;
  color: var(--color-text-secondary);
  font-size: 11px;
  vertical-align: middle;
}

.hr-table tbody tr:last-child td { border-bottom: 0; }
.hr-table tbody tr:hover td { background: #fbfdff; }
.hr-row-actions { min-width: 112px; }

.hr-identity-cell { display: flex; min-width: 125px; flex-direction: column; gap: 2px; }
.hr-identity-cell strong { color: var(--color-text-primary); font-size: 11px; font-weight: 600; }
.hr-identity-cell small { color: var(--color-text-muted); font-size: 9px; }
.hr-muted { color: var(--color-text-muted); font-size: 10px; }

.hr-badge {
  display: inline-flex;
  align-items: center;
  min-height: 23px;
  padding: 3px 8px;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}
.hr-badge-active, .hr-badge-approved, .hr-badge-present, .hr-badge-paid, .hr-badge-completed { border-color: #a6f4c5; background: #ecfdf3; color: #067647; }
.hr-badge-inactive, .hr-badge-rejected, .hr-badge-absent, .hr-badge-cancelled { border-color: #fecdca; background: #fef3f2; color: #b42318; }
.hr-badge-pending, .hr-badge-draft, .hr-badge-planned, .hr-badge-late { border-color: #fedf89; background: #fffaeb; color: #b54708; }
.hr-badge-submitted, .hr-badge-ongoing, .hr-badge-leave { border-color: #b2ddff; background: #eff8ff; color: #175cd3; }

.hr-empty-cell {
  height: 115px;
  color: var(--color-text-muted) !important;
  text-align: center !important;
}
.hr-empty-cell strong { display: block; margin-top: 7px; font-size: 11px; font-weight: 500; }
.hr-empty-icon { display: block; color: #aab3c2; font-size: 22px; }

.hr-section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
}
.hr-section-heading h2,
.hr-quick-panel h2 { color: var(--color-brand); font-size: 14px; font-weight: 700; }
.hr-section-heading p { margin-top: 3px; color: var(--color-text-muted); font-size: 10px; }
.hr-permissions-panel { display: flex; flex-direction: column; gap: 14px; }
.hr-permissions-panel .hr-section-heading { margin-bottom: 0; }
.hr-role-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.hr-role-grid article { padding: 13px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: #fbfcfe; }
.hr-role-grid strong { color: var(--color-brand); font-size: 11px; }
.hr-role-grid p { margin-top: 5px; color: var(--color-text-secondary); font-size: 10px; line-height: 1.8; }

.hr-alert { padding: 11px 13px; border: 1px solid transparent; border-radius: var(--radius-md); font-size: 10px; line-height: 1.8; }
.hr-alert-info { border-color: var(--color-info-border); background: var(--color-info-bg); color: #175cd3; }
.hr-alert-warning { border-color: var(--color-warning-border); background: var(--color-warning-bg); color: #b54708; }
.hr-alert-danger { border-color: var(--color-danger-border); background: var(--color-danger-bg); color: #b42318; }
.hr-dashboard-grid { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(260px, 1fr); gap: 16px; }
.hr-dashboard-grid .hr-panel { min-width: 0; }
.hr-quick-panel { display: flex; flex-direction: column; gap: 14px; }
.hr-quick-links { display: flex; flex-direction: column; gap: 9px; }
.hr-quick-links > div { display: flex; flex-direction: column; gap: 3px; padding: 11px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: #fbfcfe; }
.hr-quick-links strong { color: var(--color-text-primary); font-size: 11px; }
.hr-quick-links span { color: var(--color-text-muted); font-size: 10px; }

/* Forms and dialogs */
.hr-modal-backdrop {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(16, 24, 40, .42);
  overflow-y: auto;
}
.hr-modal {
  width: min(680px, 100%);
  max-height: min(90vh, 900px);
  padding: 22px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: #fff;
  box-shadow: 0 20px 60px rgba(16, 24, 40, .2);
  overflow-y: auto;
}
.hr-modal-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 15px; margin-bottom: 18px; }
.hr-modal-heading h2 { margin-top: 3px; color: var(--color-brand); font-size: 17px; }
.hr-modal-close { display: grid; width: 30px; height: 30px; place-items: center; border-radius: 7px; background: #f2f4f7; color: #667085; font-size: 20px; }
.hr-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.hr-field { display: flex; min-width: 0; flex-direction: column; gap: 6px; }
.hr-field-full { grid-column: 1 / -1; }
.hr-field label { color: var(--color-text-secondary); font-size: 11px; font-weight: 600; }
.hr-field input,
.hr-field select,
.hr-field textarea {
  width: 100%;
  min-height: 39px;
  padding: 9px 10px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  background: #fff;
  color: var(--color-text-primary);
  font-family: var(--font-family-primary);
  font-size: 11px;
  transition: border-color .18s ease, box-shadow .18s ease;
}
.hr-field textarea { min-height: 85px; resize: vertical; }
.hr-field input:focus,
.hr-field select:focus,
.hr-field textarea:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(40, 120, 200, .09); }
.hr-field [aria-invalid="true"] { border-color: var(--color-danger); background: #fffafa; }
.hr-field-hint { color: var(--color-text-muted); font-size: 9px; line-height: 1.7; }
.hr-field-error { color: var(--color-danger); font-size: 10px; line-height: 1.6; }
.hr-modal-actions { justify-content: flex-start; margin-top: 20px; padding-top: 15px; border-top: 1px solid var(--color-border); }

/* Authentication */
.auth-screen { display: grid; min-height: 100vh; grid-template-columns: minmax(300px, .9fr) minmax(420px, 1.1fr); background: #fff; }
.auth-brand-panel {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(28px, 5vw, 68px);
  background: #142b4a;
  color: #fff;
}
.auth-brand-lockup, .auth-mobile-brand { display: flex; align-items: center; gap: 11px; }
.auth-brand-mark { display: grid; width: 42px; height: 42px; flex: 0 0 42px; place-items: center; border-radius: 11px; background: #2878c8; color: #fff; font-size: 22px; font-weight: 800; }
.auth-brand-lockup strong, .auth-mobile-brand strong { display: block; font-size: 16px; letter-spacing: .5px; }
.auth-brand-lockup span:not(.auth-brand-mark) { display: block; margin-top: 3px; color: #c4d0df; font-size: 10px; }
.auth-brand-copy { max-width: 470px; padding: 60px 0; }
.auth-brand-copy .auth-eyebrow { color: #92c5f4; }
.auth-brand-copy h1 { margin-top: 14px; color: #fff; font-size: clamp(27px, 3vw, 42px); line-height: 1.55; }
.auth-brand-copy p { max-width: 390px; margin-top: 15px; color: #cbd5e1; font-size: 13px; line-height: 2; }
.auth-brand-footer { color: #9fb0c4; font-size: 10px; letter-spacing: .6px; }
.auth-form-panel { display: grid; place-items: center; padding: 35px 22px; background: #f8fafc; }
.auth-card { width: min(430px, 100%); padding: 30px; border: 1px solid var(--color-border); border-radius: 16px; background: #fff; box-shadow: 0 12px 35px rgba(16, 24, 40, .07); }
.auth-mobile-brand { display: none; margin-bottom: 25px; color: var(--color-brand); }
.auth-mobile-brand .auth-brand-mark { width: 34px; height: 34px; flex-basis: 34px; font-size: 17px; }
.auth-heading { margin-bottom: 24px; }
.auth-heading h2 { margin-top: 5px; color: var(--color-brand); font-size: 23px; }
.auth-heading p { margin-top: 5px; color: var(--color-text-muted); font-size: 11px; }
.auth-card .hr-field { margin-top: 17px; }
.auth-password-wrap { position: relative; display: flex; align-items: center; }
.auth-password-wrap input { padding-left: 65px; }
.auth-show-password { position: absolute; left: 9px; padding: 4px; background: transparent; color: var(--color-primary); font-size: 10px; }
.auth-submit { width: 100%; min-height: 43px; margin-top: 22px; }
.auth-forgot { display: block; margin: 13px auto 0; background: transparent; color: var(--color-primary); font-size: 10px; }
.auth-demo-details { margin-top: 22px; padding-top: 14px; border-top: 1px solid var(--color-border); }
.auth-demo-details summary { color: var(--color-text-secondary); font-size: 10px; cursor: pointer; }
.auth-demo-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; margin-top: 10px; }
.auth-demo-list button { display: flex; min-width: 0; flex-direction: column; gap: 3px; padding: 8px; border: 1px solid var(--color-border); border-radius: 7px; background: #fbfcfe; text-align: right; }
.auth-demo-list button:hover { border-color: var(--color-primary); background: var(--color-primary-light); }
.auth-demo-list strong { color: var(--color-brand); font-size: 9px; }
.auth-demo-list span { color: var(--color-text-muted); font-size: 8px; overflow-wrap: anywhere; }
.auth-demo-details > small { display: block; margin-top: 8px; color: var(--color-text-muted); font-size: 8px; line-height: 1.7; }
.auth-security-note { margin-top: 16px; color: var(--color-text-muted); font-size: 9px; line-height: 1.8; text-align: center; }

/* Topbar and sidebar additions */
.topbar-actions { gap: 13px; }
.topbar-logout, .sidebar-logout { border: 1px solid var(--color-border); border-radius: 7px; background: #fff; color: var(--color-text-secondary); font-family: var(--font-family-primary); font-size: 10px; }
.topbar-logout { padding: 7px 10px; }
.sidebar-logout { width: 30px; height: 30px; flex: 0 0 30px; font-size: 15px; }
.topbar-logout:hover, .sidebar-logout:hover { border-color: var(--color-danger-border); background: var(--color-danger-bg); color: var(--color-danger); }

@media (max-width: 1100px) {
  .hr-stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .hr-page { padding: 22px 20px 30px; }
}
@media (max-width: 760px) {
  .hr-page-heading { align-items: flex-start; flex-direction: column; }
  .hr-toolbar { align-items: stretch; flex-direction: column; }
  .hr-search-wrap { width: 100%; }
  .hr-dashboard-grid { grid-template-columns: 1fr; }
  .auth-screen { grid-template-columns: 1fr; }
  .auth-brand-panel { display: none; }
  .auth-mobile-brand { display: flex; }
  .auth-card { padding: 24px 20px; }
}
@media (max-width: 520px) {
  .hr-stats-grid { grid-template-columns: 1fr 1fr; gap: 9px; }
  .hr-stat-card { min-height: 98px; padding: 12px; }
  .hr-stat-card > strong { font-size: 20px; }
  .hr-page { padding: 18px 12px 25px; gap: 14px; }
  .hr-panel { padding: 12px; }
  .hr-form-grid { grid-template-columns: 1fr; }
  .hr-field-full { grid-column: auto; }
  .hr-role-grid { grid-template-columns: 1fr; }
  .hr-heading-actions, .hr-toolbar-filters { width: 100%; }
  .hr-toolbar-filters > * { flex: 1 1 auto; }
  .hr-modal { padding: 16px; }
}
```

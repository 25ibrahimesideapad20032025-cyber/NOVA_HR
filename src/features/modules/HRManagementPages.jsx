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

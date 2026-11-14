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

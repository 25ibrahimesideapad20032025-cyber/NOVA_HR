
import { useEffect, useState } from "react";

// البيانات الأولية التي تظهر عند تشغيل النظام لأول مرة
import {
  employees as initialEmployees,
} from "../features/employees/data/employees";

// مكونات قسم إدارة الموظفين
import EmployeeStats from "../features/employees/EmployeeStats";
import EmployeeTable from "../features/employees/EmployeeTable";
import EmployeeForm from "../features/employees/EmployeeForm";
import EmployeeDetailsModal from "../features/employees/EmployeeDetailsModal";

// مفتاح تخزين بيانات الموظفين في المتصفح
const STORAGE_KEY = "nova_hr_employees_v1";

function EmployeesPage() {

  // =========================================
  // 1. Employees State
  // تحميل الموظفين من localStorage عند فتح الصفحة
  // =========================================

  const [employees, setEmployees] = useState(() => {
    try {
      const savedEmployees = localStorage.getItem(STORAGE_KEY);

      if (savedEmployees) {
        const parsedEmployees = JSON.parse(savedEmployees);

        // التأكد من أن البيانات المحفوظة عبارة عن مصفوفة
        if (Array.isArray(parsedEmployees)) {
          return parsedEmployees;
        }
      }

      return initialEmployees;

    } catch (error) {
      console.error(
        "حدث خطأ أثناء تحميل بيانات الموظفين:",
        error
      );

      return initialEmployees;
    }
  });


  // =========================================
  // 2. Page States
  // التحكم في النماذج والتفاصيل والبحث
  // =========================================

  const [searchTerm, setSearchTerm] = useState("");

  // هل نموذج الإضافة أو التعديل مفتوح؟
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);

  // الموظف الذي نريد تعديله
  const [editingEmployee, setEditingEmployee] = useState(null);

  // الموظف الذي نريد عرض تفاصيله
  const [selectedEmployee, setSelectedEmployee] = useState(null);


  // =========================================
  // 3. Save Employees
  // حفظ بيانات الموظفين تلقائيًا عند تغييرها
  // =========================================

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(employees)
      );

    } catch (error) {
      console.error(
        "حدث خطأ أثناء حفظ بيانات الموظفين:",
        error
      );
    }
  }, [employees]);


  // =========================================
  // 4. Add Employee
  // فتح نموذج إضافة موظف جديد
  // =========================================

  function handleOpenAddForm() {
    setSelectedEmployee(null);
    setEditingEmployee(null);
    setShowEmployeeForm(true);
  }


  // =========================================
  // 5. Edit Employee
  // فتح نموذج التعديل مع بيانات الموظف
  // =========================================

  function handleEditEmployee(employee) {
    setSelectedEmployee(null);
    setEditingEmployee(employee);
    setShowEmployeeForm(true);
  }


  // =========================================
  // 6. Close Employee Form
  // إغلاق نموذج الإضافة أو التعديل
  // =========================================

  function handleCloseEmployeeForm() {
    setShowEmployeeForm(false);
    setEditingEmployee(null);
  }


  // =========================================
  // 7. Save Employee
  // إضافة موظف جديد أو تحديث بيانات موظف
  // =========================================

  async function handleSaveEmployee(savedEmployee) {

    // إذا كان هناك موظف قيد التعديل يتم تحديثه
    // وإلا تتم إضافة الموظف الجديد إلى بداية القائمة

    const updatedEmployees = editingEmployee
      ? employees.map((employee) =>
          employee.id === editingEmployee.id
            ? savedEmployee
            : employee
        )
      : [savedEmployee, ...employees];

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedEmployees)
      );

      setEmployees(updatedEmployees);

      // إغلاق النموذج بعد نجاح الحفظ
      handleCloseEmployeeForm();

    } catch (error) {
      console.error(
        "فشل حفظ بيانات الموظف:",
        error
      );

      alert(
        "تعذر حفظ بيانات الموظف. تحقق من مساحة التخزين."
      );

      throw error;
    }
  }


  // =========================================
  // 8. Delete Employee
  // حذف موظف محدد من الجدول
  // =========================================

  function handleDeleteEmployee(employee) {

    // التأكد من موافقة المستخدم قبل الحذف
    const confirmed = window.confirm(
      `هل أنت متأكد من حذف الموظف "${employee.name}"؟\n\nلا يمكن التراجع عن هذا الإجراء.`
    );

    if (!confirmed) {
      return;
    }

    // إنشاء قائمة جديدة بدون الموظف المطلوب
    const updatedEmployees = employees.filter(
      (item) => item.id !== employee.id
    );

    try {
      // حفظ القائمة الجديدة
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedEmployees)
      );

      // تحديث واجهة المستخدم
      setEmployees(updatedEmployees);

      // إغلاق صفحة التفاصيل إذا كان الموظف المحذوف معروضًا
      if (selectedEmployee?.id === employee.id) {
        setSelectedEmployee(null);
      }

    } catch (error) {
      console.error(
        "فشل حذف بيانات الموظف:",
        error
      );

      alert(
        "تعذر حذف بيانات الموظف. حاول مرة أخرى."
      );
    }
  }


  // =========================================
  // 9. View Employee Details
  // فتح صفحة تفاصيل الموظف
  // =========================================

  function handleViewDetails(employee) {
    setSelectedEmployee(employee);
  }


  // إغلاق صفحة التفاصيل والعودة إلى القائمة
  function handleCloseDetails() {
    setSelectedEmployee(null);
  }


  // =========================================
  // 10. Employee Form Page
  // عرض نموذج الإضافة أو التعديل
  // =========================================

  if (showEmployeeForm) {
    return (
      <EmployeeForm
        key={editingEmployee?.id ?? "new-employee"}
        employee={editingEmployee}
        onSubmit={handleSaveEmployee}
        onCancel={handleCloseEmployeeForm}
      />
    );
  }


  // =========================================
  // 11. Employee Profile Page
  // عرض الملف الشخصي للموظف
  // =========================================

  if (selectedEmployee) {
    return (
      <EmployeeDetailsModal
        employee={selectedEmployee}
        onClose={handleCloseDetails}
        onEdit={handleEditEmployee}
      />
    );
  }


  // =========================================
  // 12. Employees List Page
  // عرض قائمة الموظفين الرئيسية
  // =========================================

  return (
    <section className="page-content" dir="rtl">

      {/* عنوان القسم */}
      <div className="page-heading">
        <div>
          <h1>إدارة الموظفين</h1>
          <p>
            إدارة وتنظيم بيانات موظفي المؤسسة
          </p>
        </div>
      </div>


      {/* إحصائيات الموظفين */}
      <EmployeeStats employees={employees} />


      {/* جدول الموظفين */}
      <EmployeeTable
        employees={employees}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onViewDetails={handleViewDetails}
        onEditEmployee={handleEditEmployee}
        onDeleteEmployee={handleDeleteEmployee}
        onAddEmployee={handleOpenAddForm}
      />

    </section>
  );
}

export default EmployeesPage;


import { useState } from "react";

// =========================================
// 1. Helper Function
// استخراج الأحرف الأولى من اسم الموظف
// =========================================

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}


// =========================================
// 2. Employee Table Component
// المكون الرئيسي لجدول الموظفين
// =========================================

function EmployeeTable({
  employees,
  searchTerm,
  onSearchChange,
  onViewDetails,
  onEditEmployee,
  onDeleteEmployee,
  onAddEmployee,
}) {

  // =========================================
  // 3. Local States
  // حالات البحث والتصفية وترقيم الصفحات
  // =========================================

  const [showFilters, setShowFilters] = useState(false);

  const [selectedDepartment, setSelectedDepartment] =
    useState("الكل");

  const [selectedStatus, setSelectedStatus] =
    useState("الكل");

  const [currentPage, setCurrentPage] = useState(1);

  // عدد الموظفين في كل صفحة
  const pageSize = 10;


  // =========================================
  // 4. Departments
  // استخراج الأقسام الموجودة في بيانات الموظفين
  // =========================================

  const departments = [
    "الكل",
    ...new Set(
      employees
        .map((employee) => employee.department)
        .filter(Boolean)
    ),
  ];


  // =========================================
  // 5. Search and Filtering
  // البحث والتصفية حسب الاسم والقسم والحالة
  // =========================================

  const filteredEmployees = employees.filter((employee) => {

    const search = String(searchTerm ?? "")
      .toLowerCase()
      .trim();

    // تحويل القيم إلى نصوص لتجنب أخطاء البحث
    const safeText = (value) =>
      String(value ?? "").toLowerCase();

    // البحث في بيانات الموظف
    const matchesSearch =
      safeText(employee.name).includes(search) ||
      safeText(employee.id).includes(search) ||
      safeText(employee.department).includes(search) ||
      safeText(employee.job).includes(search) ||
      safeText(employee.email).includes(search);

    // التصفية حسب القسم
    const matchesDepartment =
      selectedDepartment === "الكل" ||
      employee.department === selectedDepartment;

    // التصفية حسب حالة الموظف
    const matchesStatus =
      selectedStatus === "الكل" ||
      employee.status === selectedStatus;

    return (
      matchesSearch &&
      matchesDepartment &&
      matchesStatus
    );
  });


  // =========================================
  // 6. Pagination
  // حساب عدد الصفحات والموظفين المعروضين
  // =========================================

  const totalPages = Math.ceil(
    filteredEmployees.length / pageSize
  );

  // التأكد من أن الصفحة الحالية ضمن النطاق الصحيح
  const safeCurrentPage = Math.min(
    currentPage,
    Math.max(totalPages, 1)
  );

  const startIndex =
    (safeCurrentPage - 1) * pageSize;

  const endIndex =
    startIndex + pageSize;

  // الموظفون الظاهرون في الصفحة الحالية
  const currentEmployees =
    filteredEmployees.slice(startIndex, endIndex);


  // =========================================
  // 7. Search Handler
  // التعامل مع تغيير نص البحث
  // =========================================

  function handleSearchChange(value) {
    onSearchChange(value);
    setCurrentPage(1);
  }


  // =========================================
  // 8. Filter Handlers
  // تغيير القسم أو الحالة أو مسح التصفية
  // =========================================

  function handleDepartmentChange(value) {
    setSelectedDepartment(value);
    setCurrentPage(1);
  }

  function handleStatusChange(value) {
    setSelectedStatus(value);
    setCurrentPage(1);
  }

  function clearFilters() {
    onSearchChange("");
    setSelectedDepartment("الكل");
    setSelectedStatus("الكل");
    setCurrentPage(1);
  }


  // =========================================
  // 9. Pagination Handler
  // الانتقال بين صفحات الجدول
  // =========================================

  function goToPage(pageNumber) {
    if (
      pageNumber >= 1 &&
      pageNumber <= totalPages
    ) {
      setCurrentPage(pageNumber);
    }
  }


  // =========================================
  // 10. Employee Status
  // تحديد لون حالة الموظف
  // =========================================

  function statusClass(status) {
    switch (status) {
      case "نشط":
        return "status-active";

      case "إجازة":
        return "status-leave";

      case "قيد المراجعة":
        return "status-review";

      default:
        return "status-inactive";
    }
  }


  // =========================================
  // 11. Table UI
  // بناء واجهة الجدول وأدوات الإدارة
  // =========================================

  return (
    <div className="employees-card">

      {/* -------------------------------------
          A. Table Heading
          عنوان الجدول وأزرار الإضافة والبحث
      ------------------------------------- */}

      <div className="table-heading">

        <div className="table-title">
          <h2>قائمة الموظفين</h2>
          <p>
            عرض وإدارة بيانات الموظفين المسجلين
          </p>
        </div>


        <div className="table-toolbar">

          {/* زر إضافة موظف */}
          <button
            type="button"
            className="add-employee-button"
            onClick={onAddEmployee}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>

            <span>إضافة موظف</span>
          </button>


          {/* زر إظهار وإخفاء التصفية */}
          <button
            type="button"
            className={`filter-button ${
              showFilters ? "active" : ""
            }`}
            onClick={() =>
              setShowFilters((previous) => !previous)
            }
            aria-expanded={showFilters}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 6h16M7 12h10m-7 6h4" />
            </svg>

            <span>تصفية</span>
          </button>


          {/* مربع البحث */}
          <div className="search-box">

            <svg
              className="search-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m16 16 4 4" />
            </svg>

            <input
              type="text"
              className="search-input"
              placeholder="ابحث بالاسم أو الرقم أو القسم..."
              value={searchTerm}
              onChange={(event) =>
                handleSearchChange(event.target.value)
              }
            />

            {/* مسح نص البحث */}
            {searchTerm && (
              <button
                type="button"
                className="clear-search-button"
                onClick={() => handleSearchChange("")}
                aria-label="مسح البحث"
              >
                ×
              </button>
            )}

            <span className="search-shortcut">
              Ctrl K
            </span>

          </div>

        </div>
      </div>


      {/* -------------------------------------
          B. Filter Panel
          خيارات التصفية حسب القسم والحالة
      ------------------------------------- */}

      {showFilters && (
        <div className="filter-panel">

          {/* التصفية حسب القسم */}
          <div className="filter-field">
            <label htmlFor="department-filter">
              القسم
            </label>

            <select
              id="department-filter"
              value={selectedDepartment}
              onChange={(event) =>
                handleDepartmentChange(event.target.value)
              }
            >
              {departments.map((department) => (
                <option
                  key={department}
                  value={department}
                >
                  {department}
                </option>
              ))}
            </select>
          </div>


          {/* التصفية حسب حالة الموظف */}
          <div className="filter-field">
            <label htmlFor="status-filter">
              الحالة
            </label>

            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(event) =>
                handleStatusChange(event.target.value)
              }
            >
              <option value="الكل">كل الحالات</option>
              <option value="نشط">نشط</option>
              <option value="إجازة">إجازة</option>
              <option value="غير نشط">غير نشط</option>
              <option value="قيد المراجعة">
                قيد المراجعة
              </option>
            </select>
          </div>


          {/* مسح جميع خيارات التصفية */}
          <button
            type="button"
            className="clear-filters-button"
            onClick={clearFilters}
          >
            مسح التصفية
          </button>

        </div>
      )}


      {/* -------------------------------------
          C. Employees Table
          عرض بيانات الموظفين في الجدول
      ------------------------------------- */}

      <div className="table-wrapper">

        <table className="employees-table">

          {/* عناوين الأعمدة */}
          <thead>
            <tr>
              <th>الموظف</th>
              <th>الرقم الوظيفي</th>
              <th>القسم</th>
              <th>المسمى الوظيفي</th>
              <th>الحالة</th>
              <th className="actions-column">
                الإجراءات
              </th>
            </tr>
          </thead>


          {/* بيانات الموظفين */}
          <tbody>

            {currentEmployees.map((employee) => (

              <tr key={employee.id}>

                {/* اسم الموظف وصورته */}
                <td>
                  <div className="employee-cell">

                    <div className="employee-avatar">
                      {getInitials(employee.name)}
                    </div>

                    <div className="employee-identity">
                      <strong>{employee.name}</strong>
                      <span>{employee.email}</span>
                    </div>

                  </div>
                </td>


                {/* الرقم الوظيفي */}
                <td className="employee-id">
                  {employee.id}
                </td>


                {/* القسم */}
                <td>
                  {employee.department || "—"}
                </td>


                {/* المسمى الوظيفي */}
                <td>
                  {employee.job || "—"}
                </td>


                {/* حالة الموظف */}
                <td>
                  <span
                    className={`status-badge ${statusClass(
                      employee.status
                    )}`}
                  >
                    <span className="status-dot" />
                    {employee.status || "غير محدد"}
                  </span>
                </td>


                {/* ---------------------------------
                    Employee Actions
                    أزرار العرض والتعديل والحذف
                    الخاصة بكل موظف
                --------------------------------- */}

                <td>
                  <div className="employee-row-actions">

                    {/* 1. View Details */}
                    <button
                      type="button"
                      className="icon-action-button view-action"
                      onClick={() =>
                        onViewDetails(employee)
                      }
                      aria-label={`عرض تفاصيل ${employee.name}`}
                      title="عرض التفاصيل"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>


                    {/* 2. Edit Employee */}
                    <button
                      type="button"
                      className="icon-action-button edit-action"
                      onClick={() =>
                        onEditEmployee(employee)
                      }
                      aria-label={`تعديل ${employee.name}`}
                      title="تعديل الموظف"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="m15 5 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15v5Z" />
                      </svg>
                    </button>


                    {/* 3. Delete Employee */}
                    <button
                      type="button"
                      className="icon-action-button delete-action"
                      onClick={() =>
                        onDeleteEmployee(employee)
                      }
                      aria-label={`حذف ${employee.name}`}
                      title="حذف الموظف"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" />
                      </svg>
                    </button>

                  </div>
                </td>

              </tr>
            ))}


            {/* ---------------------------------
                D. Empty State
                تظهر عند عدم وجود نتائج
            --------------------------------- */}

            {filteredEmployees.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="empty-message"
                >
                  لا توجد نتائج مطابقة للبحث أو التصفية
                </td>
              </tr>
            )}

          </tbody>
        </table>
      </div>


      {/* -------------------------------------
          E. Table Footer
          عدد السجلات وترقيم الصفحات
      ------------------------------------- */}

      <div className="table-footer">

        <span className="table-results">
          {filteredEmployees.length === 0
            ? "لا توجد سجلات"
            : `عرض ${startIndex + 1}–${Math.min(
                endIndex,
                filteredEmployees.length
              )} من ${filteredEmployees.length} موظف`}
        </span>


        {/* أزرار التنقل بين الصفحات */}
        {totalPages > 1 && (
          <div className="pagination">

            {/* الصفحة السابقة */}
            <button
              type="button"
              className="pagination-button"
              disabled={safeCurrentPage === 1}
              onClick={() =>
                goToPage(safeCurrentPage - 1)
              }
            >
              السابق
            </button>


            {/* أرقام الصفحات */}
            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (

              <button
                type="button"
                key={page}
                className={`pagination-number ${
                  safeCurrentPage === page ? "active" : ""
                }`}
                onClick={() => goToPage(page)}
                aria-current={
                  safeCurrentPage === page
                    ? "page"
                    : undefined
                }
              >
                {page}
              </button>
            ))}


            {/* الصفحة التالية */}
            <button
              type="button"
              className="pagination-button"
              disabled={safeCurrentPage === totalPages}
              onClick={() =>
                goToPage(safeCurrentPage + 1)
              }
            >
              التالي
            </button>

          </div>
        )}

      </div>

    </div>
  );
}

export default EmployeeTable;

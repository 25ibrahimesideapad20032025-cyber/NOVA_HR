
import { useMemo, useState } from "react";

// عدد الأقسام التي تظهر في كل صفحة
const PAGE_SIZE = 8;

// تحويل التاريخ إلى صيغة عربية
function formatDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("ar", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(parsedDate);
}

// تحويل حالة القسم إلى نص عربي
const statusLabels = {
  active: "نشط",
  inactive: "غير نشط",
};

// مكون زر الإجراءات
function ActionButton({ label, icon, className, onClick }) {
  return (
    <button
      type="button"
      className={`department-action-button ${className}`}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {icon}
    </button>
  );
}

// المكون الرئيسي لجدول الأقسام
function DepartmentTable({
  departments = [],
 onAddDepartment,
onViewDetails,
onEditDepartment,
onDeleteDepartment,
}) {
  // حالة البحث
  const [searchTerm, setSearchTerm] = useState("");

  // حالة فلترة الأقسام
  const [selectedStatus, setSelectedStatus] = useState("all");

  // حالة إظهار خيارات التصفية
  const [showFilters, setShowFilters] = useState(false);

  // الصفحة الحالية
  const [currentPage, setCurrentPage] = useState(1);

  // البحث والتصفية
  const filteredDepartments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return departments.filter((department) => {
      const matchesSearch = [
        department.name,
        department.englishName,
        department.code,
        department.manager,
        department.id,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(normalizedSearch)
      );

      const matchesStatus =
        selectedStatus === "all" ||
        department.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [departments, searchTerm, selectedStatus]);

  // حساب عدد الصفحات
  const totalPages = Math.max(
    1,
    Math.ceil(filteredDepartments.length / PAGE_SIZE)
  );

  // التأكد من أن الصفحة الحالية صالحة
  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  // استخراج الأقسام الخاصة بالصفحة الحالية
  const paginatedDepartments = filteredDepartments.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE
  );

  // تغيير نص البحث
  function handleSearchChange(event) {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  }

  // تغيير حالة التصفية
  function handleStatusChange(event) {
    setSelectedStatus(event.target.value);
    setCurrentPage(1);
  }

  // إعادة ضبط البحث والتصفية
  function handleClearFilters() {
    setSearchTerm("");
    setSelectedStatus("all");
    setCurrentPage(1);
  }

  // الانتقال إلى صفحة معينة
  function handlePageChange(page) {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }

  return (
    <section className="departments-table-card">

      {/* عنوان الجدول وأدوات التحكم */}
      <div className="departments-table-header">

        <div className="departments-table-heading">
          <h2>قائمة الأقسام</h2>

          <p>
            عرض وإدارة جميع الأقسام الموجودة في المؤسسة
          </p>
        </div>

        <div className="departments-table-toolbar">

          {/* زر إضافة قسم */}
          <button
            type="button"
            className="department-add-button"
            onClick={onAddDepartment}
          >
            <span>＋</span>
            إضافة قسم
          </button>

          {/* زر إظهار التصفية */}
          <button
            type="button"
            className={`department-filter-button ${
              showFilters ? "active" : ""
            }`}
            onClick={() => setShowFilters((previous) => !previous)}
          >
            <span>☷</span>
            تصفية
          </button>

          {/* مربع البحث */}
          <div className="department-search-box">

            <span className="department-search-icon">
              ⌕
            </span>

            <input
              type="search"
              placeholder="ابحث عن قسم أو مدير القسم..."
              value={searchTerm}
              onChange={handleSearchChange}
              aria-label="البحث عن قسم"
            />

          </div>

        </div>
      </div>

      {/* خيارات التصفية */}
      {showFilters && (
        <div className="department-filters-panel">

          <div className="department-filter-field">
            <label htmlFor="department-status-filter">
              حالة القسم
            </label>

            <select
              id="department-status-filter"
              value={selectedStatus}
              onChange={handleStatusChange}
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
            </select>
          </div>

          <button
            type="button"
            className="department-clear-filters"
            onClick={handleClearFilters}
          >
            إعادة تعيين
          </button>

        </div>
      )}

      {/* جدول الأقسام */}
      <div className="departments-table-wrapper">

        <table className="departments-table">

          <thead>
            <tr>
              <th>القسم</th>
              <th>مدير القسم</th>
              <th>عدد الموظفين</th>
              <th>تاريخ الإنشاء</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>

          <tbody>

            {paginatedDepartments.length > 0 ? (
              paginatedDepartments.map((department) => (

                <tr key={department.id}>

                  {/* اسم القسم ورمزه */}
                  <td>
                    <div className="department-table-identity">

                      <div className="department-table-avatar">
                        {department.code?.slice(0, 2) || "DP"}
                      </div>

                      <div className="department-table-name">
                        <strong>
                          {department.name}
                        </strong>

                        <span>
                          {department.code || department.id}
                        </span>
                      </div>

                    </div>
                  </td>

                  {/* مدير القسم */}
                  <td>
                    <span className="department-manager-name">
                      {department.manager || "غير محدد"}
                    </span>
                  </td>

                  {/* عدد الموظفين */}
                  <td>
                    <span className="department-employee-count">
                      {Number(department.employeeCount || 0)}
                    </span>
                  </td>

                  {/* تاريخ الإنشاء */}
                  <td>
                    <span className="department-created-date">
                      {formatDate(department.createdAt)}
                    </span>
                  </td>

                  {/* حالة القسم */}
                  <td>
                    <span
                      className={`department-status-badge ${
                        department.status === "active"
                          ? "status-active"
                          : "status-inactive"
                      }`}
                    >
                      <span className="department-status-dot" />

                      {statusLabels[department.status] || "غير محدد"}
                    </span>
                  </td>

                  {/* أزرار الإجراءات */}
                  <td>
                    <div className="department-row-actions">

                      <ActionButton
                        label="عرض التفاصيل"
                        icon="◉"
                        className="view-action"
                        onClick={() => onViewDetails?.(department)}
                      />

                      <ActionButton
                        label="تعديل القسم"
                        icon="✎"
                        className="edit-action"
                        onClick={() => onEditDepartment?.(department)}
                      />

                      <ActionButton
                        label="حذف القسم"
                        icon="⌫"
                        className="delete-action"
                        onClick={() => onDeleteDepartment?.(department)}
                      />

                    </div>
                  </td>

                </tr>
              ))
            ) : (

              // حالة عدم وجود نتائج
              <tr>
                <td
                  colSpan={6}
                  className="department-empty-cell"
                >
                  <div className="department-empty-state">

                    <span className="department-empty-icon">
                      ▦
                    </span>

                    <strong>
                      لا توجد أقسام مطابقة
                    </strong>

                    <p>
                      لم نعثر على أقسام تطابق البحث أو التصفية المحددة.
                    </p>

                    <button
                      type="button"
                      onClick={handleClearFilters}
                    >
                      مسح البحث والتصفية
                    </button>

                  </div>
                </td>
              </tr>

            )}

          </tbody>

        </table>

      </div>

      {/* تذييل الجدول والتنقل بين الصفحات */}
      <div className="departments-table-footer">

        <span className="departments-results-count">
          عرض{" "}
          {filteredDepartments.length > 0
            ? (safeCurrentPage - 1) * PAGE_SIZE + 1
            : 0}
          {" "}إلى{" "}
          {Math.min(
            safeCurrentPage * PAGE_SIZE,
            filteredDepartments.length
          )}
          {" "}من أصل{" "}
          {filteredDepartments.length} قسم
        </span>

        <div className="departments-pagination">

          <button
            type="button"
            className="pagination-arrow"
            disabled={safeCurrentPage === 1}
            onClick={() => handlePageChange(safeCurrentPage - 1)}
            aria-label="الصفحة السابقة"
          >
            ‹
          </button>

          {Array.from(
            { length: totalPages },
            (_, index) => index + 1
          ).map((page) => (

            <button
              type="button"
              key={page}
              className={`pagination-page ${
                safeCurrentPage === page ? "active" : ""
              }`}
              onClick={() => handlePageChange(page)}
              aria-label={`الصفحة ${page}`}
              aria-current={
                safeCurrentPage === page ? "page" : undefined
              }
            >
              {page}
            </button>

          ))}

          <button
            type="button"
            className="pagination-arrow"
            disabled={safeCurrentPage === totalPages}
            onClick={() => handlePageChange(safeCurrentPage + 1)}
            aria-label="الصفحة التالية"
          >
            ›
          </button>

        </div>

      </div>

    </section>
  );
}

export default DepartmentTable;

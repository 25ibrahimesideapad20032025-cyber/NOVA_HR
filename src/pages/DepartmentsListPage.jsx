
import DepartmentStats from "../features/Departments/DepartmentStats";
import DepartmentTable from "../features/Departments/DepartmentTable";

import "../styles/departments.css";

function DepartmentsListPage({
  departments,
  onAddDepartment,
  onViewDetails,
  onEditDepartment,
  onDeleteDepartment,
}) {
  return (
    <div className="departments-page" dir="rtl">

      <div className="departments-page-heading">

        <div className="departments-page-title">
          <h1>إدارة الأقسام</h1>

          <p>
            إدارة وتنظيم الأقسام والوحدات التنظيمية في المؤسسة
          </p>
        </div>

        <div className="departments-page-breadcrumb">
          <span>الرئيسية</span>
          <span className="breadcrumb-separator">/</span>
          <strong>إدارة الأقسام</strong>
        </div>

      </div>

      {/* الإحصائيات الديناميكية */}
      <DepartmentStats departments={departments} />

      {/* جدول الأقسام */}
      <DepartmentTable
        departments={departments}
        onAddDepartment={onAddDepartment}
        onViewDetails={onViewDetails}
        onEditDepartment={onEditDepartment}
        onDeleteDepartment={onDeleteDepartment}
      />

    </div>
  );
}

export default DepartmentsListPage;

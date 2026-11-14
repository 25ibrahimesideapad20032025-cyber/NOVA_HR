
import { departmentStatuses } from "../data/departments";

function DepartmentDetailsModal({
  department,
  onClose,
  onEdit,
}) {
  if (!department) return null;

  const details = [
    {
      label: "اسم القسم",
      value: department.name,
    },
    {
      label: "الاسم الإنجليزي",
      value: department.englishName,
    },
    {
      label: "رمز القسم",
      value: department.code,
    },
    {
      label: "مدير القسم",
      value: department.manager || "غير محدد",
    },
    {
      label: "نائب المدير",
      value: department.deputyManager || "غير محدد",
    },
    {
      label: "عدد الموظفين",
      value: department.employeeCount || 0,
    },
    {
      label: "الموقع",
      value: department.location || "غير محدد",
    },
    {
      label: "البريد الإلكتروني",
      value: department.email || "غير محدد",
    },
    {
      label: "رقم الهاتف",
      value: department.phone || "غير محدد",
    },
    {
      label: "تاريخ الإنشاء",
      value: department.createdAt || "—",
    },
    {
      label: "حالة القسم",
      value:
        departmentStatuses[department.status] ||
        department.status,
    },
  ];

  return (
    <div
      className="department-modal-overlay"
      onClick={onClose}
    >
      <section
        className="department-details-modal"
        dir="rtl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="department-details-header">
          <div>
            <h2>تفاصيل القسم</h2>
            <p>معلومات القسم وبياناته الإدارية</p>
          </div>

          <button
            type="button"
            className="department-modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="department-details-identity">
          <div className="department-details-avatar">
            {department.name?.charAt(0)}
          </div>

          <div>
            <h3>{department.name}</h3>
            <span>{department.code}</span>
          </div>
        </div>

        <div className="department-details-grid">
          {details.map((item) => (
            <div
              className="department-details-item"
              key={item.label}
            >
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>

        <div className="department-details-description">
          <span>وصف القسم</span>
          <p>
            {department.description || "لا يوجد وصف لهذا القسم."}
          </p>
        </div>

        <div className="department-details-actions">
          <button
            type="button"
            className="department-save-button"
            onClick={() => onEdit(department)}
          >
            تعديل القسم
          </button>

          <button
            type="button"
            className="department-cancel-button"
            onClick={onClose}
          >
            إغلاق
          </button>
        </div>
      </section>
    </div>
  );
}

export default DepartmentDetailsModal;

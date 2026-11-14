
/*
  NOVA HR — Department Management
  بيانات الأقسام والإحصائيات
*/

export const departments = [
  {
    id: "DEP-001",
    name: "الموارد البشرية",
    englishName: "Human Resources",
    code: "HR",
    parentDepartmentId: "",

    description: "إدارة شؤون الموظفين والتوظيف والتطوير الوظيفي.",

    manager: "أحمد محمد",
    managerId: "EMP-001",

    deputyManager: "",
    deputyManagerId: "",

    location: "المقر الرئيسي",
    phone: "0599000001",
    email: "hr@nova.com",

    employeeCount: 25,
    status: "active",

    createdAt: "2026-01-15",
    updatedAt: "2026-01-15",
  },

  {
    id: "DEP-002",
    name: "تقنية المعلومات",
    englishName: "Information Technology",
    code: "IT",
    parentDepartmentId: "",

    description: "إدارة الأنظمة والشبكات والدعم التقني.",

    manager: "محمد خالد",
    managerId: "EMP-002",

    deputyManager: "",
    deputyManagerId: "",

    location: "المقر الرئيسي",
    phone: "0599000002",
    email: "it@nova.com",

    employeeCount: 18,
    status: "active",

    createdAt: "2026-02-10",
    updatedAt: "2026-02-10",
  },

  {
    id: "DEP-003",
    name: "الشؤون المالية",
    englishName: "Finance Department",
    code: "FIN",
    parentDepartmentId: "",

    description: "إدارة الحسابات والموازنات والمعاملات المالية.",

    manager: "سارة أحمد",
    managerId: "EMP-003",

    deputyManager: "",
    deputyManagerId: "",

    location: "المقر الرئيسي",
    phone: "0599000003",
    email: "finance@nova.com",

    employeeCount: 15,
    status: "active",

    createdAt: "2026-02-20",
    updatedAt: "2026-02-20",
  },

  {
    id: "DEP-004",
    name: "التسويق",
    englishName: "Marketing",
    code: "MKT",
    parentDepartmentId: "",

    description: "إدارة الحملات التسويقية والاتصال المؤسسي.",

    manager: "خالد إبراهيم",
    managerId: "EMP-004",

    deputyManager: "",
    deputyManagerId: "",

    location: "الفرع الرئيسي",
    phone: "0599000004",
    email: "marketing@nova.com",

    employeeCount: 12,
    status: "inactive",

    createdAt: "2026-03-05",
    updatedAt: "2026-03-05",
  },
];

export const departmentStatuses = {
  active: "نشط",
  inactive: "غير نشط",
};

// حساب إحصائيات الأقسام
export function getDepartmentStats(data = departments) {
  const total = data.length;

  const totalEmployees = data.reduce(
    (sum, department) =>
      sum + Number(department.employeeCount || 0),
    0
  );

  const departmentsWithoutManager = data.filter(
    (department) =>
      !department.managerId && !department.manager?.trim()
  ).length;

  const averageEmployees =
    total > 0
      ? Math.round(totalEmployees / total)
      : 0;

  return {
    total,
    totalEmployees,
    averageEmployees,
    departmentsWithoutManager,
  };
}

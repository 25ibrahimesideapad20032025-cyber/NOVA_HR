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

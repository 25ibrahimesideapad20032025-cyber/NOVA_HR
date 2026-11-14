
import { getDepartmentStats } from "../data/departments";

function DepartmentStats({ departments = [] }) {
  const stats = getDepartmentStats(departments);

  const statCards = [
    {
      id: "without-manager",
      title: "أقسام بدون مدير",
      value: stats.departmentsWithoutManager,
      hint: "أقسام تحتاج إلى تعيين مدير",
      icon: "!",
      color: "orange",
    },
    {
      id: "average",
      title: "متوسط حجم القسم",
      value: stats.averageEmployees,
      hint: "متوسط عدد الموظفين",
      icon: "↗",
      color: "purple",
    },
    {
      id: "employees",
      title: "إجمالي الموظفين",
      value: stats.totalEmployees,
      hint: "موزعون على جميع الأقسام",
      icon: "♙",
      color: "green",
    },
    {
      id: "total",
      title: "إجمالي الأقسام",
      value: stats.total,
      hint: "الأقسام المسجلة بالنظام",
      icon: "▦",
      color: "blue",
    },
  ];

  return (
    <section className="department-stats">
      {statCards.map((card) => (
        <article
          className="department-stat-card"
          key={card.id}
        >
          <div
            className={`department-stat-icon ${card.color}`}
          >
            {card.icon}
          </div>

          <div className="department-stat-info">
            <span className="department-stat-title">
              {card.title}
            </span>

            <strong className="department-stat-value">
              {card.value}
            </strong>

            <span className="department-stat-hint">
              {card.hint}
            </span>
          </div>
        </article>
      ))}
    </section>
  );
}

export default DepartmentStats;

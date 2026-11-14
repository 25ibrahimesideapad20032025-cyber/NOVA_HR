
function getDaysFromToday(dateString) {
  if (!dateString) return null;

  const [year, month, day] = dateString.split("-").map(Number);
  const contractDate = new Date(year, month - 1, day);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const difference = contractDate.getTime() - today.getTime();

  return Math.ceil(difference / (1000 * 60 * 60 * 24));
}

function EmployeeStats({ employees }) {
  const totalEmployees = employees.length;

  const activeEmployees = employees.filter(
    (employee) => employee.status === "نشط"
  ).length;

  const employeesOnLeave = employees.filter(
    (employee) => employee.status === "إجازة"
  ).length;

  const contractsExpiringSoon = employees.filter((employee) => {
    const daysRemaining = getDaysFromToday(employee.contractEndDate);

    return daysRemaining !== null &&
      daysRemaining >= 0 &&
      daysRemaining <= 30;
  }).length;

  const stats = [
    {
      title: "إجمالي الموظفين",
      value: totalEmployees,
      note: "جميع الموظفين المسجلين",
      icon: "users",
      color: "blue",
    },
    {
      title: "الموظفون النشطون",
      value: activeEmployees,
      note: "على رأس عملهم",
      icon: "user-check",
      color: "green",
    },
    {
      title: "في إجازة",
      value: employeesOnLeave,
      note: "الموظفون المسجلون بحالة إجازة",
      icon: "calendar",
      color: "orange",
    },
    {
      title: "عقود تنتهي قريبًا",
      value: contractsExpiringSoon,
      note: "خلال الثلاثين يومًا القادمة",
      icon: "file-clock",
      color: "purple",
    },
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat) => (
        <div className="stat-card" key={stat.title}>
          <div className="stat-card-top">
            <span className="stat-title">{stat.title}</span>

            <div className={`stat-icon stat-icon-${stat.color}`}>
              {stat.icon === "users" && (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="10" cy="7" r="4" />
                  <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              )}

              {stat.icon === "user-check" && (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="10" cy="7" r="4" />
                  <path d="m16 11 2 2 4-4" />
                </svg>
              )}

              {stat.icon === "calendar" && (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M16 3v4M8 3v4M3 11h18" />
                  <path d="M12 14v3M10.5 15.5h3" />
                </svg>
              )}

              {stat.icon === "file-clock" && (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h7" />
                  <path d="M14 2v6h6M14 2l6 6" />
                  <circle cx="17.5" cy="17.5" r="3.5" />
                  <path d="M17.5 15.5v2l1.3.8" />
                </svg>
              )}
            </div>
          </div>

          <strong className="stat-value">{stat.value}</strong>
          <span className="stat-note">{stat.note}</span>
        </div>
      ))}
    </div>
  );
}

export default EmployeeStats;

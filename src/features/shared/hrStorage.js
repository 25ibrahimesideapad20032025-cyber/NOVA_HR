import { useEffect, useState } from "react";
import { employees as initialEmployees } from "../employees/data/employees";

export function readStoredList(key, fallback = []) {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    console.error(`تعذر قراءة البيانات من ${key}:`, error);
    return fallback;
  }
}

export function useStoredList(key, fallback = []) {
  const [items, setItems] = useState(() => readStoredList(key, fallback));

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch (error) {
      console.error(`تعذر حفظ البيانات في ${key}:`, error);
    }
  }, [key, items]);

  return [items, setItems];
}

export function getCurrentEmployees() {
  return readStoredList("nova_hr_employees_v1", initialEmployees);
}

export function createRecordId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export function getToday() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
}

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ar-PS", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatMoney(value) {
  return new Intl.NumberFormat("ar-PS", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export function getEmployeeName(employeeId, employees = getCurrentEmployees()) {
  return employees.find((employee) => employee.id === employeeId)?.name || "موظف غير محدد";
}

export function getEmployeeDepartment(employeeId, employees = getCurrentEmployees()) {
  return employees.find((employee) => employee.id === employeeId)?.department || "—";
}

export function getEmployeeById(employeeId, employees = getCurrentEmployees()) {
  return employees.find((employee) => employee.id === employeeId) || null;
}

export function isEmployeeVisibleToUser(employee, user) {
  if (!user || user.role === "admin" || user.role === "hr") return true;
  if (user.role === "employee") return employee.id === user.employeeId;
  if (user.role === "manager") {
    return employee.id === user.employeeId ||
      employee.manager === user.name ||
      employee.managerId === user.employeeId;
  }
  return false;
}

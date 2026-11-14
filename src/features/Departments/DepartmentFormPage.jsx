
import { useState } from "react";

import "../../styles/department-form.css";

// =========================================
// 1. إنشاء القيم الأولية للنموذج
// =========================================

function createInitialForm(department) {
  return {
    name: department?.name || "",
    englishName: department?.englishName || "",
    code: department?.code || "",
    parentDepartmentId: department?.parentDepartmentId || "",
    location: department?.location || "",
    email: department?.email || "",
    phone: department?.phone || "",
    description: department?.description || "",
    managerId: department?.managerId || "",
    deputyManagerId: department?.deputyManagerId || "",
    status: department?.status || "active",
  };
}

// =========================================
// 2. التحقق من صحة بيانات القسم
// =========================================


function validateDepartmentData(data, departments = [], department = null) {
  const errors = {};

  // اسم القسم بالعربية
  if (!data.name.trim()) {
    errors.name = "يرجى إدخال اسم القسم.";
  } else if (data.name.trim().length < 2) {
    errors.name = "يجب ألا يقل اسم القسم عن حرفين.";
  }

  // اسم القسم بالإنجليزية
  if (!data.englishName.trim()) {
    errors.englishName = "يرجى إدخال اسم القسم باللغة الإنجليزية.";
  } else if (!/^[a-zA-Z][a-zA-Z\s&-]*$/.test(data.englishName.trim())) {
    errors.englishName =
      "استخدم الأحرف الإنجليزية والمسافات والرموز (& و -) فقط.";
  }

  // رمز القسم
  if (!data.code.trim()) {
    errors.code = "يرجى إدخال رمز القسم.";
  } else if (!/^[A-Z][A-Z0-9_-]{1,9}$/i.test(data.code.trim())) {
    errors.code =
      "يجب أن يبدأ الرمز بحرف إنجليزي، ويمكن أن يحتوي على أرقام أو (-) أو (_)، وبحد أقصى 10 أحرف.";
  } else {
    const duplicateCode = departments.some(
      (item) =>
        item.code?.toLowerCase() === data.code.trim().toLowerCase() &&
        item.id !== department?.id
    );

    if (duplicateCode) {
      errors.code = "رمز القسم مستخدم بالفعل، يرجى اختيار رمز آخر.";
    }
  }

  // القسم الرئيسي
  if (!data.parentDepartmentId) {
    errors.parentDepartmentId = "يرجى اختيار القسم الرئيسي.";
  } else if (data.parentDepartmentId === department?.id) {
    errors.parentDepartmentId =
      "لا يمكن اختيار القسم نفسه كقسم رئيسي.";
  } else if (
    !departments.some((item) => item.id === data.parentDepartmentId)
  ) {
    errors.parentDepartmentId =
      "القسم الرئيسي المحدد غير موجود.";
  }

  // الموقع
  if (!data.location.trim()) {
    errors.location = "يرجى إدخال موقع القسم.";
  } else if (data.location.trim().length < 2) {
    errors.location = "يرجى إدخال موقع صحيح.";
  }

  // البريد الإلكتروني
  if (!data.email.trim()) {
    errors.email = "يرجى إدخال البريد الإلكتروني.";
  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email.trim())
  ) {
    errors.email = "يرجى إدخال بريد إلكتروني صحيح، مثال: name@company.com.";
  }

  // رقم الهاتف الفلسطيني
  if (!data.phone.trim()) {
    errors.phone = "يرجى إدخال رقم هاتف القسم.";
  } else if (!/^(05[69]\d{7}|\+9705[69]\d{7})$/.test(data.phone.trim())) {
    errors.phone =
      "أدخل رقمًا فلسطينيًا صحيحًا، مثال: 0591234567 أو +970591234567.";
  }

  // وصف القسم
  if (!data.description.trim()) {
    errors.description = "يرجى إدخال وصف القسم.";
  } else if (data.description.trim().length < 10) {
    errors.description =
      "يجب ألا يقل وصف القسم عن 10 أحرف.";
  }

  // مدير القسم
  if (!data.managerId) {
    errors.managerId = "يرجى اختيار مدير القسم.";
  }

  // نائب مدير القسم
  if (!data.deputyManagerId) {
    errors.deputyManagerId = "يرجى اختيار نائب مدير القسم.";
  } else if (
    data.managerId &&
    data.managerId === data.deputyManagerId
  ) {
    errors.deputyManagerId =
      "يجب اختيار موظف مختلف كنائب لمدير القسم.";
  }

  // حالة القسم
  if (!data.status) {
    errors.status = "يرجى تحديد حالة القسم.";
  }

  return errors;
}


// =========================================
// 3. مكوّن صفحة إضافة / تعديل القسم
// =========================================

function DepartmentFormPage({
  mode = "add",
  department = null,
  departments = [],
  employees = [],
  onSave,
  onCancel,
  onDelete,
}) {
  const isEdit = mode === "edit";

  // بيانات النموذج
  const [formData, setFormData] = useState(() =>
    createInitialForm(department)
  );

  // أخطاء الحقول
  const [fieldErrors, setFieldErrors] = useState({});

  // رسالة الخطأ العامة
  const [error, setError] = useState("");

  // =========================================
  // 4. التعامل مع تغيير الحقول
  // =========================================

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    // إزالة خطأ الحقل عند تعديله
    setFieldErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    // إزالة رسالة الخطأ العامة
    setError("");
  }

  // =========================================
  // 5. التعامل مع حفظ النموذج
  // =========================================

  function handleSubmit(event) {
    event.preventDefault();

    setError("");

    // تنظيف البيانات النصية
    const cleanedData = {
      ...formData,
      name: formData.name.trim(),
      englishName: formData.englishName.trim(),
      code: formData.code.trim().toUpperCase(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      location: formData.location.trim(),
      description: formData.description.trim(),
    };

    // تنفيذ التحقق
    const errors = validateDepartmentData(
      cleanedData,
      departments,
      department
    );

    setFieldErrors(errors);

    // منع الحفظ عند وجود أخطاء
    if (Object.keys(errors).length > 0) {
      setError("يرجى مراجعة الحقول المحددة وتصحيح الأخطاء قبل الحفظ.");
      return;
    }

    // تحديد المدير
    const selectedManager = employees.find(
      (employee) => employee.id === cleanedData.managerId
    );

    // تحديد نائب المدير
    const selectedDeputy = employees.find(
      (employee) => employee.id === cleanedData.deputyManagerId
    );

    const savedDepartment = {
      ...department,
      ...cleanedData,

      manager: selectedManager?.name || "",
      managerId: selectedManager?.id || "",

      deputyManager: selectedDeputy?.name || "",
      deputyManagerId: selectedDeputy?.id || "",

      employeeCount: department?.employeeCount || 0,

      createdAt:
        department?.createdAt ||
        new Date().toISOString().split("T")[0],

      updatedAt: new Date().toISOString().split("T")[0],
    };

    onSave(savedDepartment);
  }

  // =========================================
  // 6. الموظفون المتاحون للاختيار
  // =========================================

  const availableEmployees = employees.filter(
    (employee) =>
      employee.status === "نشط" ||
      employee.status === "active"
  );

  // =========================================
  // 7. واجهة النموذج
  // =========================================

  return (
    <section className="department-form-page" dir="rtl">

      {/* عنوان الصفحة */}
      <div className="department-form-heading">
        <div>
          <div className="department-form-breadcrumb">
            الرئيسية / إدارة الأقسام /{" "}
            {isEdit ? "تعديل القسم" : "إضافة قسم"}
          </div>

          <h1>
            {isEdit ? "تعديل بيانات القسم" : "إضافة قسم جديد"}
          </h1>

          <p>
            {isEdit
              ? "قم بتحديث بيانات القسم ومعلومات الإدارة."
              : "أدخل بيانات القسم الجديد لإضافته إلى الهيكل التنظيمي."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>

        <div className="department-form-layout">

          {/* العمود الجانبي */}
          <aside className="department-form-aside">

            {isEdit ? (
              <>
                <div className="department-form-card">
                  <h3>ملخص القسم</h3>

                  <div className="department-summary-item">
                    <span>عدد الموظفين</span>
                    <strong>
                      {department?.employeeCount || 0}
                    </strong>
                  </div>

                  <div className="department-summary-item">
                    <span>تاريخ الإنشاء</span>
                    <strong>
                      {department?.createdAt || "—"}
                    </strong>
                  </div>

                  <div className="department-summary-item">
                    <span>آخر تعديل</span>
                    <strong>
                      {department?.updatedAt || "—"}
                    </strong>
                  </div>
                </div>

                <div className="department-form-card delete-card">
                  <h3>حذف القسم</h3>

                  <p>
                    حذف القسم إجراء لا يمكن التراجع عنه.
                  </p>

                  <button
                    type="button"
                    className="department-delete-button"
                    onClick={() => onDelete(department)}
                  >
                    حذف القسم
                  </button>
                </div>
              </>
            ) : (
              <div className="department-form-card">
                <h3>قبل أن تبدأ</h3>

                <div className="department-form-note">
                  <strong>معلومات مهمة</strong>
                  <p>
                    تأكد من إدخال اسم القسم ورمزه بشكل صحيح قبل الحفظ.
                  </p>
                </div>

                <div className="department-form-note">
                  <strong>إدارة القسم</strong>
                  <p>
                    يمكنك اختيار مدير القسم ونائبه من قائمة الموظفين المسجلين.
                  </p>
                </div>
              </div>
            )}

          </aside>

          {/* النموذج الرئيسي */}
          <div className="department-form-main">

            {/* بيانات القسم */}
            <div className="department-form-card">

              <div className="department-form-card-heading">
                <h3>بيانات القسم</h3>
                <p>
                  المعلومات الأساسية للقسم والوحدة التنظيمية
                </p>
              </div>

              <div className="department-form-grid">

                {/* اسم القسم بالعربية */}
                <div
                  className={`department-field form-group ${
                    fieldErrors.name ? "has-error" : ""
                  }`}
                >
                  <label htmlFor="department-name">
                    اسم القسم بالعربية *
                  </label>

                  <input
                    id="department-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="مثال: الموارد البشرية"
                    aria-invalid={Boolean(fieldErrors.name)}
                    aria-describedby="department-name-error"
                  />

                  {fieldErrors.name && (
                    <small
                      id="department-name-error"
                      className="field-error"
                    >
                      {fieldErrors.name}
                    </small>
                  )}
                </div>

                {/* اسم القسم بالإنجليزية */}
                <div
                  className={`department-field form-group ${
                    fieldErrors.englishName ? "has-error" : ""
                  }`}
                >
                  <label htmlFor="department-english-name">
                    اسم القسم بالإنجليزية *
                  </label>

                  <input
                    id="department-english-name"
                    name="englishName"
                    value={formData.englishName}
                    onChange={handleChange}
                    placeholder="Human Resources"
                    dir="ltr"
                    aria-invalid={Boolean(fieldErrors.englishName)}
                    aria-describedby="department-english-name-error"
                  />

                  {fieldErrors.englishName && (
                    <small
                      id="department-english-name-error"
                      className="field-error"
                    >
                      {fieldErrors.englishName}
                    </small>
                  )}
                </div>

                {/* القسم الرئيسي */}
                <div
                  className={`department-field form-group ${
                    fieldErrors.parentDepartmentId ? "has-error" : ""
                  }`}
                >
                  <label htmlFor="department-parent">
                    القسم الرئيسي
                  </label>

                  <select
                    id="department-parent"
                    name="parentDepartmentId"
                    value={formData.parentDepartmentId}
                    onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors.parentDepartmentId)}
                    aria-describedby="department-parent-error"
                  >
                    <option value="">قسم رئيسي</option>

                    {departments
                      .filter((item) => item.id !== department?.id)
                      .map((item) => (
                        <option value={item.id} key={item.id}>
                          {item.name}
                        </option>
                      ))}
                  </select>

                  {fieldErrors.parentDepartmentId && (
                    <small
                      id="department-parent-error"
                      className="field-error"
                    >
                      {fieldErrors.parentDepartmentId}
                    </small>
                  )}
                </div>

                {/* رمز القسم */}
                <div
                  className={`department-field form-group ${
                    fieldErrors.code ? "has-error" : ""
                  }`}
                >
                  <label htmlFor="department-code">
                    رمز القسم *
                  </label>

                  <input
                    id="department-code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="HR"
                    dir="ltr"
                    aria-invalid={Boolean(fieldErrors.code)}
                    aria-describedby="department-code-error"
                  />

                  {fieldErrors.code && (
                    <small
                      id="department-code-error"
                      className="field-error"
                    >
                      {fieldErrors.code}
                    </small>
                  )}
                </div>

                {/* الموقع */}
                <div className="department-field form-group">
                  <label htmlFor="department-location">
                    الموقع / المبنى
                  </label>

                  <input
                    id="department-location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="المقر الرئيسي"
                  />
                </div>

                {/* البريد الإلكتروني */}
                <div
                  className={`department-field form-group ${
                    fieldErrors.email ? "has-error" : ""
                  }`}
                >
                  <label htmlFor="department-email">
                    البريد الإلكتروني للقسم
                  </label>

                  <input
                    id="department-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="department@nova.com"
                    dir="ltr"
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby="department-email-error"
                  />

                  {fieldErrors.email && (
                    <small
                      id="department-email-error"
                      className="field-error"
                    >
                      {fieldErrors.email}
                    </small>
                  )}
                </div>

                {/* وصف القسم */}
                <div className="department-field form-group full-width">
                  <label htmlFor="department-description">
                    وصف القسم
                  </label>

                  <textarea
                    id="department-description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="اكتب وصفًا مختصرًا لمهام القسم..."
                    rows="3"
                  />
                </div>

              </div>
            </div>

            {/* إدارة القسم */}
            <div className="department-form-card">

              <div className="department-form-card-heading">
                <h3>إدارة القسم</h3>
                <p>
                  تحديد المسؤولين والحالة التشغيلية للقسم
                </p>
              </div>

              <div className="department-form-grid">

                {/* مدير القسم */}
                <div className="department-field form-group">
                  <label htmlFor="department-manager">
                    مدير القسم
                  </label>

                  <select
                    id="department-manager"
                    name="managerId"
                    value={formData.managerId}
                    onChange={handleChange}
                  >
                    <option value="">اختر مدير القسم</option>

                    {availableEmployees.map((employee) => (
                      <option value={employee.id} key={employee.id}>
                        {employee.name} — {employee.job}
                      </option>
                    ))}
                  </select>
                </div>

                {/* نائب المدير */}
                <div
                  className={`department-field form-group ${
                    fieldErrors.deputyManagerId ? "has-error" : ""
                  }`}
                >
                  <label htmlFor="department-deputy">
                    نائب المدير
                  </label>

                  <select
                    id="department-deputy"
                    name="deputyManagerId"
                    value={formData.deputyManagerId}
                    onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors.deputyManagerId)}
                    aria-describedby="department-deputy-error"
                  >
                    <option value="">اختر نائب المدير</option>

                    {availableEmployees.map((employee) => (
                      <option value={employee.id} key={employee.id}>
                        {employee.name} — {employee.job}
                      </option>
                    ))}
                  </select>

                  {fieldErrors.deputyManagerId && (
                    <small
                      id="department-deputy-error"
                      className="field-error"
                    >
                      {fieldErrors.deputyManagerId}
                    </small>
                  )}
                </div>

                {/* الهاتف */}
                <div
                  className={`department-field form-group ${
                    fieldErrors.phone ? "has-error" : ""
                  }`}
                >
                  <label htmlFor="department-phone">
                    رقم الهاتف
                  </label>

                  <input
                    id="department-phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0599000000"
                    dir="ltr"
                    aria-invalid={Boolean(fieldErrors.phone)}
                    aria-describedby="department-phone-error"
                  />

                  {fieldErrors.phone && (
                    <small
                      id="department-phone-error"
                      className="field-error"
                    >
                      {fieldErrors.phone}
                    </small>
                  )}
                </div>

                {/* حالة القسم */}
                <div className="department-field form-group">
                  <label htmlFor="department-status">
                    حالة القسم
                  </label>

                  <select
                    id="department-status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                  </select>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* رسالة الخطأ العامة */}
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        {/* أزرار النموذج */}
        <div className="department-form-actions">

          <div>
            <button
              type="submit"
              className="department-save-button"
            >
              {isEdit ? "حفظ التغييرات" : "إنشاء القسم"}
            </button>

            <button
              type="button"
              className="department-cancel-button"
              onClick={onCancel}
            >
              إلغاء
            </button>
          </div>

          <span>
            الحقول التي تحمل علامة (*) إلزامية
          </span>

        </div>

      </form>
    </section>
  );
}

export default DepartmentFormPage;

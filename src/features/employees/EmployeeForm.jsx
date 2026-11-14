import { useEffect, useState } from "react";
import {
  saveEmployeeFile,
  getEmployeeFile,
} from "../utils/fileStorage";

// =========================================
// 1. Helpers & Form Data
// =========================================

function createDocumentId() {
  return `DOC-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// دعم المستندات القديمة حتى لو كانت محفوظة كنصوص
function normalizeDocuments(documents = []) {
  if (!Array.isArray(documents)) return [];

  return documents.map((document, index) => {
    if (typeof document === "string") {
      return {
        id: `LEGACY-${index}-${document}`,
        name: document,
        type: "",
        size: 0,
        pending: false,
      };
    }

    return {
      ...document,
      id: document.id ?? document.fileId ?? `LEGACY-${index}-${document.name ?? "FILE"}`,
      pending: false,
    };
  });
}

function createFormData(employee) {
  return {
    name: employee?.name ?? "",
    englishName: employee?.englishName ?? "",
    email: employee?.email ?? "",

    nationalId: employee?.nationalId ?? "",
    birthDate: employee?.birthDate ?? "",
    gender: employee?.gender ?? "",
    maritalStatus: employee?.maritalStatus ?? "",

    phone: employee?.phone ?? "",
    alternativePhone: employee?.alternativePhone ?? "",
    city: employee?.city ?? "",
    address: employee?.address ?? "",
    emergencyContact: employee?.emergencyContact ?? "",
    emergencyPhone: employee?.emergencyPhone ?? "",

    department: employee?.department ?? "",
    job: employee?.job ?? "",
    manager: employee?.manager ?? "",
    hireDate: employee?.hireDate ?? "",
    employmentType: employee?.employmentType ?? "دوام كامل",
    workLocation: employee?.workLocation ?? "",

    contractType: employee?.contractType ?? "محدد المدة",
    contractStartDate: employee?.contractStartDate ?? "",
    contractEndDate: employee?.contractEndDate ?? "",
    salary: employee?.salary ?? "",

    username: employee?.username ?? "",
    accountRole: employee?.accountRole ?? "موظف",

    status: employee?.status ?? "نشط",
    photoName: employee?.photoName ?? "",
    photoFileId: employee?.photoFileId ?? "",

    documents: normalizeDocuments(employee?.documents ?? []),
  };
}

// =========================================
// 2. Validation Rules
// =========================================

const validationPatterns = {
  // بريد إلكتروني ينتهي بـ .com
  email: /^[^\s@]+@[^\s@]+\.com$/i,

  // رقم هوية من 9 أرقام
  nationalId: /^\d{9}$/,

  // أرقام جوال فلسطينية
  phone: /^(05[69]\d{7}|\+9705[69]\d{7})$/,

  // اسم مستخدم إنجليزي وأرقام وشرطة سفلية
  username: /^[a-zA-Z0-9_]+$/,

  // راتب موجب مع منزلتين عشريتين كحد أقصى
  salary: /^\d+(\.\d{1,2})?$/,
};

// الحقول التي يجب ألا تكون فارغة
const requiredFields = [
  "name",
  "englishName",
  "email",
  "nationalId",
  "birthDate",
  "gender",
  "maritalStatus",
  "phone",
  "alternativePhone",
  "city",
  "address",
  "emergencyContact",
  "emergencyPhone",
  "department",
  "job",
  "manager",
  "hireDate",
  "employmentType",
  "workLocation",
  "contractType",
  "contractStartDate",
  "salary",
  "username",
  "accountRole",
  "status",
];

// الحصول على تاريخ اليوم بصيغة محلية YYYY-MM-DD
function getLocalDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// =========================================
// 3. Validate Employee Data
// =========================================

function validateEmployeeData(data, employee, photoFile) {
  const errors = {};

  // 1. التحقق من الحقول المطلوبة
  requiredFields.forEach((field) => {
    const value = data[field];

    if (
      value === undefined ||
      value === null ||
      String(value).trim() === ""
    ) {
      errors[field] = "هذا الحقل مطلوب.";
    }
  });

  // 2. البريد الإلكتروني
  if (
    data.email &&
    !validationPatterns.email.test(data.email.trim())
  ) {
    errors.email = "أدخل بريدًا إلكترونيًا صحيحًا ينتهي بـ .com";
  }

  // 3. رقم الهوية
  if (
    data.nationalId &&
    !validationPatterns.nationalId.test(data.nationalId.trim())
  ) {
    errors.nationalId = "رقم الهوية يجب أن يتكون من 9 أرقام.";
  }

  // 4. أرقام الهواتف
  ["phone", "alternativePhone", "emergencyPhone"].forEach((field) => {
    const normalizedPhone = String(data[field] ?? "").replace(/[\s-]/g, "");

    if (
      normalizedPhone &&
      !validationPatterns.phone.test(normalizedPhone)
    ) {
      errors[field] =
        "أدخل رقم جوال فلسطيني صحيحًا، مثل 0591234567 أو +970591234567.";
    }
  });

  // 5. اسم المستخدم
  if (
    data.username &&
    !validationPatterns.username.test(data.username.trim())
  ) {
    errors.username =
      "اسم المستخدم يقبل الأحرف الإنجليزية والأرقام والشرطة السفلية فقط.";
  }

  // 6. الراتب
  if (
    data.salary === "" ||
    !validationPatterns.salary.test(String(data.salary)) ||
    Number(data.salary) <= 0
  ) {
    errors.salary = "أدخل راتبًا صحيحًا أكبر من صفر.";
  }

  // 7. تاريخ الميلاد
  const today = getLocalDateString();

  if (data.birthDate && data.birthDate >= today) {
    errors.birthDate = "تاريخ الميلاد يجب أن يكون قبل تاريخ اليوم.";
  }

  // 8. تاريخ التعيين
  if (data.hireDate && data.hireDate > today) {
    errors.hireDate = "تاريخ التعيين لا يمكن أن يكون في المستقبل.";
  }

  // 9. التأكد من أن تاريخ التعيين بعد تاريخ الميلاد
  if (
    data.birthDate &&
    data.hireDate &&
    data.hireDate <= data.birthDate
  ) {
    errors.hireDate = "تاريخ التعيين يجب أن يكون بعد تاريخ الميلاد.";
  }

  // 10. تاريخ بداية العقد
  if (
    data.contractStartDate &&
    data.hireDate &&
    data.contractStartDate < data.hireDate
  ) {
    errors.contractStartDate =
      "بداية العقد لا يمكن أن تكون قبل تاريخ التعيين.";
  }

  // 11. تاريخ نهاية العقد
  if (
    data.contractStartDate &&
    data.contractEndDate &&
    data.contractEndDate < data.contractStartDate
  ) {
    errors.contractEndDate =
      "تاريخ نهاية العقد يجب أن يكون بعد تاريخ بدايته.";
  }

  // 12. نهاية العقد للعقود محددة المدة
  if (
    data.contractType === "محدد المدة" &&
    !data.contractEndDate
  ) {
    errors.contractEndDate = "تاريخ نهاية العقد مطلوب لهذا النوع من العقود.";
  }

  // 13. الصورة الشخصية
  const hasPhoto = Boolean(
    photoFile ||
    employee?.photoFileId ||
    data.photoFileId
  );

  if (!hasPhoto && !employee) {
  errors.photo = "يرجى رفع الصورة الشخصية للموظف.";
}

  // 14. المستندات
 if (
  (!Array.isArray(data.documents) || data.documents.length === 0) &&
  !employee
) {
  errors.documents = "يرجى إرفاق مستند واحد على الأقل.";
}

  return errors;
}

// =========================================
// 4. Reusable Form Field
// =========================================

function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  disabled = false,
  dir = "rtl",
  error = "",
  inputMode,
  maxLength,
  min,
  step,
}) {
  return (
    <div className={`form-group ${error ? "has-error" : ""}`}>
      <label htmlFor={name}>
        {label}
        {required && <span className="required-mark"> *</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        dir={dir}
        inputMode={inputMode}
        maxLength={maxLength}
        min={min}
        step={step}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
      />

      {error && (
        <small id={`${name}-error`} className="field-error">
          {error}
        </small>
      )}
    </div>
  );
}

// =========================================
// 5. Reusable Select
// =========================================

function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  error = "",
}) {
  return (
    <div className={`form-group ${error ? "has-error" : ""}`}>
      <label htmlFor={name}>
        {label}
        {required && <span className="required-mark"> *</span>}
      </label>

      <select
        id={name}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <small id={`${name}-error`} className="field-error">
          {error}
        </small>
      )}
    </div>
  );
}

// =========================================
// 6. Form Section
// =========================================

function FormSection({
  title,
  description,
  children,
  className = "",
}) {
  return (
    <section className={`employee-form-section ${className}`}>
      <div className="employee-form-section-header">
        <div>
          <h3>{title}</h3>
          {description && <p>{description}</p>}
        </div>
      </div>

      <div className="employee-form-section-body">
        {children}
      </div>
    </section>
  );
}

// =========================================
// 7. Employee Form
// =========================================

function EmployeeForm({
  onSubmit,
  onCancel,
  employee = null,
}) {
  // =========================================
  // 1. State
  // =========================================

  const [formData, setFormData] = useState(() =>
    createFormData(employee)
  );

  const [photoPreview, setPhotoPreview] = useState("");
  const [photoFile, setPhotoFile] = useState(null);

  // كل ملف جديد مرتبط بمعرف المستند نفسه
  const [documentFiles, setDocumentFiles] = useState([]);

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const isEditing = Boolean(employee);

  // =========================================
  // 2. Effects
  // =========================================
  // تحميل صورة الموظف القديمة عند فتح التعديل
// تحميل صورة الموظف القديمة عند فتح التعديل
useEffect(() => {
  let cancelled = false;

  async function loadExistingPhoto() {
    if (!employee?.photoFileId) return;

    try {
      const savedFile = await getEmployeeFile(
        employee.photoFileId
      );

      if (cancelled || !savedFile?.file) return;

      const imageUrl = URL.createObjectURL(savedFile.file);
      setPhotoPreview(imageUrl);
    } catch (loadError) {
      if (!cancelled) {
        console.error("تعذر تحميل صورة الموظف:", loadError);
      }
    }
  }

  loadExistingPhoto();

  return () => {
    cancelled = true;
  };
}, [employee?.photoFileId]);

  // تحرير روابط الصور المؤقتة عند تغييرها أو مغادرة الصفحة
  useEffect(() => {
    return () => {
      if (photoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  // =========================================
  // 3. Event Handlers
  // =========================================

  // تحديث الحقول النصية والقوائم
  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setFieldErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
    }));

    setError("");
  }

  // اختيار الصورة الشخصية
  function handlePhotoChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFieldErrors((previousErrors) => ({
        ...previousErrors,
        photo: "الملف المختار ليس صورة صالحة.",
      }));

      event.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setPhotoPreview(previewUrl);
    setPhotoFile(file);

    setFormData((previousData) => ({
      ...previousData,
      photoName: file.name,
    }));

    setFieldErrors((previousErrors) => ({
      ...previousErrors,
      photo: "",
    }));

    setError("");
    event.target.value = "";
  }

  // اختيار مستندات جديدة
  function handleDocumentsChange(event) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) return;

    const newDocuments = files.map((file) => {
      const documentId = createDocumentId();

      return {
        id: documentId,
        name: file.name,
        type: file.type,
        size: file.size,
        pending: true,
      };
    });

    const newDocumentFiles = newDocuments.map((document, index) => ({
      id: document.id,
      file: files[index],
    }));

    setFormData((previousData) => ({
      ...previousData,
      documents: [
        ...previousData.documents,
        ...newDocuments,
      ],
    }));

    setDocumentFiles((previousFiles) => [
      ...previousFiles,
      ...newDocumentFiles,
    ]);

    setFieldErrors((previousErrors) => ({
      ...previousErrors,
      documents: "",
    }));

    setError("");
    event.target.value = "";
  }

  // حذف مستند باستخدام معرفه، وليس ترتيبه في القائمة
  function handleRemoveDocument(documentId) {
    setFormData((previousData) => ({
      ...previousData,
      documents: previousData.documents.filter(
        (document) => document.id !== documentId
      ),
    }));

    setDocumentFiles((previousFiles) =>
      previousFiles.filter((item) => item.id !== documentId)
    );

    setFieldErrors((previousErrors) => ({
      ...previousErrors,
      documents: "",
    }));

    setError("");
  }

  // =========================================
  // 4. Derived Values
  // =========================================

  const employeeInitials = formData.name.trim()
    ? formData.name.trim().slice(0, 2)
    : "؟";

  // =========================================
  // 5. Submit
  // =========================================

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    // تجهيز البيانات وإزالة المسافات الزائدة
    const cleanedData = {
      ...formData,

      name: String(formData.name ?? "").trim(),
      englishName: String(formData.englishName ?? "").trim(),
      email: String(formData.email ?? "").trim(),
      nationalId: String(formData.nationalId ?? "").trim(),

      phone: String(formData.phone ?? "").trim(),
      alternativePhone: String(formData.alternativePhone ?? "").trim(),
      city: String(formData.city ?? "").trim(),
      address: String(formData.address ?? "").trim(),
      emergencyContact: String(formData.emergencyContact ?? "").trim(),
      emergencyPhone: String(formData.emergencyPhone ?? "").trim(),

      department: String(formData.department ?? "").trim(),
      job: String(formData.job ?? "").trim(),
      manager: String(formData.manager ?? "").trim(),
      workLocation: String(formData.workLocation ?? "").trim(),

      username: String(formData.username ?? "").trim(),

      salary:
        formData.salary === ""
          ? ""
          : Number(formData.salary),

      documents: formData.documents,
    };

    // التحقق من البيانات قبل حفظ أي ملف
    const validationErrors = validateEmployeeData(
      cleanedData,
      employee,
      photoFile
    );

    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setError(
        "يرجى مراجعة الحقول الموضحة والتأكد من صحة جميع البيانات."
      );
      return;
    }

    try {
      // =====================================
      // حفظ الصورة
      // =====================================

      let photoFileId = employee?.photoFileId ?? "";

      if (photoFile) {
        const savedPhoto = await saveEmployeeFile(photoFile);

        if (!savedPhoto?.id) {
          throw new Error("لم يتم حفظ الصورة الشخصية.");
        }

        photoFileId = savedPhoto.id;
      }

      // =====================================
      // حفظ المستندات الجديدة والاحتفاظ بالقديمة
      // =====================================

      const savedDocuments = [];

      for (const document of cleanedData.documents) {
        if (!document.pending) {
          // مستند قديم: نحتفظ ببياناته كما هي
          savedDocuments.push(document);
          continue;
        }

        // مستند جديد: نبحث عن الملف المرتبط بمعرفه
        const matchingFile = documentFiles.find(
          (item) => item.id === document.id
        );

        if (!matchingFile?.file) {
          throw new Error(
            `تعذر العثور على الملف: ${document.name}`
          );
        }

        const savedFile = await saveEmployeeFile(
          matchingFile.file
        );

        if (!savedFile?.id) {
          throw new Error(
            `تعذر حفظ المستند: ${document.name}`
          );
        }

        savedDocuments.push({
          id: savedFile.id,
          name: savedFile.name,
          type: savedFile.type,
          size: savedFile.size,
        });
      }

      // =====================================
      // تجهيز الموظف النهائي
      // =====================================

      const savedEmployee = {
        ...(employee || {}),
        ...cleanedData,

        photoFileId,
        documents: savedDocuments,

        id: employee?.id ?? `EMP-${Date.now()}`,
      };

      // إرسال البيانات إلى الصفحة الأم
      await onSubmit(savedEmployee);
    } catch (submitError) {
      console.error(
        "خطأ أثناء حفظ الموظف أو ملفاته:",
        submitError
      );

      setError(
        submitError.message ||
        "تعذر حفظ البيانات أو المرفقات. يرجى المحاولة مرة أخرى."
      );
    }
  }

  // =========================================
  // 6. Page UI
  // =========================================

  return (
    <section className="employee-form-page" dir="rtl">

      {/* Page Header */}
      <div className="employee-form-page-header">

        <div className="employee-form-breadcrumb">
          <button
            type="button"
            className="breadcrumb-back"
            onClick={onCancel}
          >
            الموظفون
          </button>

          <span>/</span>

          <span>
            {isEditing ? "تعديل الموظف" : "إضافة موظف"}
          </span>
        </div>

        <div className="employee-form-title-row">
          <div>
            <h1>
              {isEditing ? "تعديل بيانات الموظف" : "إضافة موظف جديد"}
            </h1>

            <p>
              {isEditing
                ? "قم بتحديث بيانات الموظف ومعلوماته الوظيفية."
                : "أدخل البيانات المطلوبة لإضافة موظف جديد إلى المؤسسة."}
            </p>
          </div>

          {isEditing && (
            <span className="employee-id-label">
              {employee.id}
            </span>
          )}
        </div>

      </div>

      {/* Main Form */}
      <form
        className="employee-form"
        onSubmit={handleSubmit}
        noValidate
      >

        <div className="employee-form-layout">

          {/* Main Column */}
          <div className="employee-form-main">

            {/* Personal Information */}
            <FormSection
              title="المعلومات الشخصية"
              description="أدخل المعلومات الشخصية الأساسية للموظف."
            >
              <div className="employee-form-grid">

                <FormField
                  label="الاسم الكامل"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="أدخل الاسم الكامل"
                  required
                  error={fieldErrors.name}
                />

                <FormField
                  label="الاسم باللغة الإنجليزية"
                  name="englishName"
                  value={formData.englishName}
                  onChange={handleChange}
                  placeholder="Enter employee name"
                  dir="ltr"
                  required
                  error={fieldErrors.englishName}
                />

                <FormField
                  label="رقم الهوية"
                  name="nationalId"
                  value={formData.nationalId}
                  onChange={handleChange}
                  placeholder="أدخل رقم الهوية"
                  required
                  inputMode="numeric"
                  maxLength={9}
                  error={fieldErrors.nationalId}
                />

                <FormField
                  label="تاريخ الميلاد"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleChange}
                  required
                  error={fieldErrors.birthDate}
                />

                <FormSelect
                  label="الجنس"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  error={fieldErrors.gender}
                  options={[
                    { value: "", label: "اختر الجنس" },
                    { value: "ذكر", label: "ذكر" },
                    { value: "أنثى", label: "أنثى" },
                  ]}
                />

                <FormSelect
                  label="الحالة الاجتماعية"
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  required
                  error={fieldErrors.maritalStatus}
                  options={[
                    { value: "", label: "اختر الحالة الاجتماعية" },
                    { value: "أعزب", label: "أعزب" },
                    { value: "متزوج", label: "متزوج" },
                    { value: "مطلق", label: "مطلق" },
                    { value: "أرمل", label: "أرمل" },
                  ]}
                />

              </div>
            </FormSection>

            {/* Contact Information */}
            <FormSection
              title="معلومات التواصل"
              description="بيانات الاتصال والعنوان الخاص بالموظف."
            >
              <div className="employee-form-grid">

                <FormField
                  label="البريد الإلكتروني"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@company.com"
                  dir="ltr"
                  required
                  error={fieldErrors.email}
                />

                <FormField
                  label="رقم الهاتف"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="059XXXXXXXX"
                  dir="ltr"
                  required
                  maxLength={13}
                  error={fieldErrors.phone}
                />

                <FormField
                  label="رقم هاتف بديل"
                  name="alternativePhone"
                  type="tel"
                  value={formData.alternativePhone}
                  onChange={handleChange}
                  placeholder="رقم هاتف بديل"
                  dir="ltr"
                  required
                  maxLength={13}
                  error={fieldErrors.alternativePhone}
                />

                <FormField
                  label="المدينة"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="أدخل المدينة"
                  required
                  error={fieldErrors.city}
                />

                <FormField
                  label="العنوان بالتفصيل"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="أدخل عنوان السكن"
                  required
                  error={fieldErrors.address}
                />

              </div>

              <div className="employee-subsection">
                <h4>جهة الاتصال في حالات الطوارئ</h4>

                <div className="employee-form-grid">

                  <FormField
                    label="اسم جهة الاتصال"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    placeholder="اسم الشخص"
                    required
                    error={fieldErrors.emergencyContact}
                  />

                  <FormField
                    label="رقم هاتف الطوارئ"
                    name="emergencyPhone"
                    type="tel"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    placeholder="رقم الهاتف"
                    dir="ltr"
                    required
                    maxLength={13}
                    error={fieldErrors.emergencyPhone}
                  />

                </div>
              </div>
            </FormSection>

            {/* Employment Information */}
            <FormSection
              title="البيانات الوظيفية"
              description="المعلومات المتعلقة بوظيفة الموظف وموقع عمله."
            >
              <div className="employee-form-grid">

                <FormField
                  label="القسم"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="أدخل القسم"
                  required
                  error={fieldErrors.department}
                />

                <FormField
                  label="المسمى الوظيفي"
                  name="job"
                  value={formData.job}
                  onChange={handleChange}
                  placeholder="أدخل المسمى الوظيفي"
                  required
                  error={fieldErrors.job}
                />

                <FormField
                  label="المدير المباشر"
                  name="manager"
                  value={formData.manager}
                  onChange={handleChange}
                  placeholder="اسم المدير المباشر"
                  required
                  error={fieldErrors.manager}
                />

                <FormField
                  label="تاريخ التعيين"
                  name="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={handleChange}
                  required
                  error={fieldErrors.hireDate}
                />

                <FormSelect
                  label="نوع الدوام"
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  required
                  error={fieldErrors.employmentType}
                  options={[
                    { value: "", label: "اختر نوع الدوام" },
                    { value: "دوام كامل", label: "دوام كامل" },
                    { value: "دوام جزئي", label: "دوام جزئي" },
                    { value: "مؤقت", label: "مؤقت" },
                    { value: "عن بُعد", label: "عن بُعد" },
                  ]}
                />

                <FormField
                  label="موقع العمل"
                  name="workLocation"
                  value={formData.workLocation}
                  onChange={handleChange}
                  placeholder="أدخل موقع العمل"
                  required
                  error={fieldErrors.workLocation}
                />

              </div>
            </FormSection>

            {/* Contract Information */}
            <FormSection
              title="العقد والتوظيف"
              description="تفاصيل العقد والراتب وفترة التوظيف."
            >
              <div className="employee-form-grid">

                <FormSelect
                  label="نوع العقد"
                  name="contractType"
                  value={formData.contractType}
                  onChange={handleChange}
                  required
                  error={fieldErrors.contractType}
                  options={[
                    { value: "", label: "اختر نوع العقد" },
                    { value: "محدد المدة", label: "محدد المدة" },
                    { value: "غير محدد المدة", label: "غير محدد المدة" },
                    { value: "مؤقت", label: "مؤقت" },
                    { value: "تدريب", label: "تدريب" },
                  ]}
                />

                <FormField
                  label="الراتب الأساسي"
                  name="salary"
                  type="number"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="أدخل الراتب"
                  required
                  min="0.01"
                  step="0.01"
                  error={fieldErrors.salary}
                />

                <FormField
                  label="بداية العقد"
                  name="contractStartDate"
                  type="date"
                  value={formData.contractStartDate}
                  onChange={handleChange}
                  required
                  error={fieldErrors.contractStartDate}
                />

                <FormField
                  label="نهاية العقد"
                  name="contractEndDate"
                  type="date"
                  value={formData.contractEndDate}
                  onChange={handleChange}
                  required={formData.contractType === "محدد المدة"}
                  error={fieldErrors.contractEndDate}
                />

              </div>
            </FormSection>

            {/* Documents */}
            <FormSection
              title="المستندات والمرفقات"
              description="إرفاق المستندات والوثائق الخاصة بالموظف."
            >

              {fieldErrors.documents && (
                <small className="field-error">
                  {fieldErrors.documents}
                </small>
              )}

              <div className="documents-upload-area">

                <div className="documents-upload-icon">
                  <span>↑</span>
                </div>

                <strong>اسحب الملفات هنا أو اختر من جهازك</strong>

                <p>
                  يمكنك إرفاق المستندات والصور الخاصة بالموظف.
                </p>

                <label
                  htmlFor="employee-documents"
                  className="upload-button"
                >
                  اختيار الملفات
                </label>

                <input
                  id="employee-documents"
                  type="file"
                  multiple
                  onChange={handleDocumentsChange}
                  hidden
                />

              </div>

              {formData.documents.length > 0 && (
                <div className="uploaded-documents-list">
                  {formData.documents.map((document) => (
                    <div
                      className="uploaded-document-item"
                      key={document.id}
                    >
                      <span>{document.name}</span>

                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(document.id)}
                        aria-label={`حذف ${document.name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="form-info-note">
                تُحفظ الملفات حاليًا داخل قاعدة بيانات المتصفح (IndexedDB).
                وسيتم نقلها إلى الخادم عند تنفيذ التكامل الخلفي.
              </p>

            </FormSection>

          </div>

          {/* Side Column */}
          <aside className="employee-form-aside">

            {/* Profile Photo */}
            <FormSection
              title="الصورة الشخصية"
              className="employee-aside-card"
            >

              {fieldErrors.photo && (
                <small className="field-error">
                  {fieldErrors.photo}
                </small>
              )}

              <div className="employee-profile-upload">

                <div className="employee-profile-avatar">
                  {photoPreview ? (
                    <img src={photoPreview} alt="صورة الموظف" />
                  ) : (
                    employeeInitials
                  )}
                </div>

                <h4>
                  {formData.name || "اسم الموظف"}
                </h4>

                <p>
                  {formData.job || "المسمى الوظيفي"}
                </p>

                <label
                  htmlFor="employee-photo"
                  className="upload-button"
                >
                  {photoPreview ? "تغيير الصورة" : "رفع الصورة"}
                </label>

                <input
                  id="employee-photo"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePhotoChange}
                  hidden
                />

                {formData.photoName && (
                  <span className="uploaded-file-name">
                    {formData.photoName}
                  </span>
                )}

                <small>PNG أو JPG أو WEBP</small>

              </div>
            </FormSection>

            {/* Employee Status */}
            <FormSection
              title="حالة الموظف"
              className="employee-aside-card"
            >
              <div className="employee-status-control">

                <FormSelect
                  label="الحالة الحالية"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  error={fieldErrors.status}
                  options={[
                    { value: "", label: "اختر حالة الموظف" },
                    { value: "نشط", label: "نشط" },
                    { value: "إجازة", label: "إجازة" },
                    { value: "غير نشط", label: "غير نشط" },
                  ]}
                />

                <span
                  className={`employee-status-preview ${
                    formData.status === "نشط"
                      ? "status-active"
                      : formData.status === "إجازة"
                        ? "status-leave"
                        : "status-inactive"
                  }`}
                >
                  <span className="status-dot"></span>
                  {formData.status}
                </span>

              </div>
            </FormSection>

            {/* Account Information */}
            <FormSection
              title="حساب النظام"
              description="بيانات الدخول والصلاحيات."
              className="employee-aside-card"
            >
              <div className="employee-form-grid employee-aside-grid">

                <FormField
                  label="اسم المستخدم"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="username"
                  dir="ltr"
                  required
                  error={fieldErrors.username}
                />

                <FormSelect
                  label="صلاحية الحساب"
                  name="accountRole"
                  value={formData.accountRole}
                  onChange={handleChange}
                  required
                  error={fieldErrors.accountRole}
                  options={[
                    { value: "", label: "اختر صلاحية الحساب" },
                    { value: "موظف", label: "موظف" },
                    { value: "مدير", label: "مدير" },
                    { value: "مسؤول النظام", label: "مسؤول النظام" },
                  ]}
                />

              </div>

              <p className="form-info-note">
                سيتم ربط صلاحيات الحساب بنظام المصادقة عند تكامل الواجهة
                مع الخادم الخلفي.
              </p>

            </FormSection>

            {/* Employee Number */}
            <FormSection
              title="الرقم الوظيفي"
              className="employee-aside-card"
            >
              <div className="employee-number-display">
                <span>الرقم الوظيفي</span>
                <strong>
                  {employee?.id ?? "يُنشأ تلقائيًا"}
                </strong>
              </div>
            </FormSection>

          </aside>

        </div>

        {/* Form Actions */}
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        <div className="employee-form-actions">

          <button
            type="button"
            className="secondary-button"
            onClick={onCancel}
          >
            إلغاء
          </button>

          <button
            type="submit"
            className="primary-button"
          >
            {isEditing ? "حفظ التعديلات" : "حفظ الموظف"}
          </button>

        </div>

      </form>
    </section>
  );
}

export default EmployeeForm;
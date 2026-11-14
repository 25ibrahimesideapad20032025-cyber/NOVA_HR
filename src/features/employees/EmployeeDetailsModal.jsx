
import { useEffect, useRef, useState } from "react";
import { getEmployeeFile } from "../utils/fileStorage";

function DetailItem({ label, value }) {
  return (
    <div className="employee-profile-detail">
      <span>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <section className="employee-profile-section">
      <h3>{title}</h3>
      <div className="employee-profile-grid">
        {children}
      </div>
    </section>
  );
}

function EmployeeDetailsModal({ employee, onClose, onEdit }) {
  const [photo, setPhoto] = useState({
    fileId: null,
    url: "",
  });

  const photoUrlRef = useRef("");
  const requestIdRef = useRef(0);

  // تحميل صورة الموظف وإدارة رابط الصورة المؤقت
  useEffect(() => {
    const currentRequestId = ++requestIdRef.current;
    const currentFileId = employee?.photoFileId;

    async function loadPhoto() {
      if (!currentFileId) return;

      try {
        const savedFile = await getEmployeeFile(currentFileId);

        // تجاهل نتيجة الطلب إذا تغير الموظف أو انتهى التأثير
        if (
          requestIdRef.current !== currentRequestId ||
          !savedFile?.file
        ) {
          return;
        }

        const newPhotoUrl = URL.createObjectURL(savedFile.file);

        photoUrlRef.current = newPhotoUrl;

        setPhoto({
          fileId: currentFileId,
          url: newPhotoUrl,
        });
      } catch (error) {
        if (requestIdRef.current === currentRequestId) {
          console.error("تعذر تحميل صورة الموظف:", error);
        }
      }
    }

    loadPhoto();

    return () => {
      requestIdRef.current += 1;

      if (photoUrlRef.current) {
        URL.revokeObjectURL(photoUrlRef.current);
        photoUrlRef.current = "";
      }
    };
  }, [employee?.photoFileId]);

  if (!employee) return null;

  const initials = employee.name?.trim().slice(0, 2) || "؟";

  // لا نعرض صورة موظف سابق عند الانتقال إلى موظف آخر
  const currentPhoto =
    photo.fileId === employee.photoFileId
      ? photo.url
      : "";

  return (
    <section className="employee-profile-page" dir="rtl">

      <div className="employee-profile-heading">
        <div>
          <div className="employee-form-breadcrumb">
            <button type="button" onClick={onClose}>
              الموظفون
            </button>

            <span>/</span>
            <span>ملف الموظف</span>
          </div>

          <h1>ملف الموظف</h1>
          <p>عرض البيانات الشخصية والوظيفية للموظف.</p>
        </div>

        <div className="employee-profile-heading-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
          >
            العودة
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={() => onEdit?.(employee)}
          >
            تعديل البيانات
          </button>
        </div>
      </div>

      <section className="employee-profile-hero">
        <div className="employee-profile-identity">
          <div className="employee-profile-large-avatar">
            {currentPhoto ? (
              <img src={currentPhoto} alt={employee.name} />
            ) : (
              initials
            )}
          </div>

          <div>
            <h2>{employee.name}</h2>
            <p>{employee.job || "المسمى الوظيفي غير محدد"}</p>

            <span className="employee-profile-id">
              {employee.id}
            </span>
          </div>
        </div>

        <span
          className={`employee-status-preview ${
            employee.status === "نشط"
              ? "status-active"
              : employee.status === "إجازة"
                ? "status-leave"
                : "status-inactive"
          }`}
        >
          <span className="status-dot" />
          {employee.status || "غير محدد"}
        </span>
      </section>

      <DetailSection title="المعلومات الشخصية">
        <DetailItem label="الاسم الكامل" value={employee.name} />
        <DetailItem label="الاسم باللغة الإنجليزية" value={employee.englishName} />
        <DetailItem label="رقم الهوية" value={employee.nationalId} />
        <DetailItem label="تاريخ الميلاد" value={employee.birthDate} />
        <DetailItem label="الجنس" value={employee.gender} />
        <DetailItem label="الحالة الاجتماعية" value={employee.maritalStatus} />
      </DetailSection>

      <DetailSection title="معلومات التواصل">
        <DetailItem label="البريد الإلكتروني" value={employee.email} />
        <DetailItem label="رقم الهاتف" value={employee.phone} />
        <DetailItem label="الهاتف البديل" value={employee.alternativePhone} />
        <DetailItem label="المدينة" value={employee.city} />
        <DetailItem label="العنوان" value={employee.address} />
        <DetailItem label="جهة اتصال الطوارئ" value={employee.emergencyContact} />
        <DetailItem label="هاتف الطوارئ" value={employee.emergencyPhone} />
      </DetailSection>

      <DetailSection title="البيانات الوظيفية">
        <DetailItem label="القسم" value={employee.department} />
        <DetailItem label="المسمى الوظيفي" value={employee.job} />
        <DetailItem label="المدير المباشر" value={employee.manager} />
        <DetailItem label="تاريخ التعيين" value={employee.hireDate} />
        <DetailItem label="نوع الدوام" value={employee.employmentType} />
        <DetailItem label="موقع العمل" value={employee.workLocation} />
      </DetailSection>

      <DetailSection title="العقد والتوظيف">
        <DetailItem label="نوع العقد" value={employee.contractType} />
        <DetailItem label="الراتب الأساسي" value={employee.salary} />
        <DetailItem label="بداية العقد" value={employee.contractStartDate} />
        <DetailItem label="نهاية العقد" value={employee.contractEndDate} />
      </DetailSection>

      <DetailSection title="حساب النظام">
        <DetailItem label="اسم المستخدم" value={employee.username} />
        <DetailItem label="صلاحية الحساب" value={employee.accountRole} />
      </DetailSection>

      <section className="employee-profile-section">
        <h3>المستندات والمرفقات</h3>

        {employee.documents?.length ? (
          <div className="employee-profile-documents">
            {employee.documents.map((document, index) => (
              <div
                className="employee-profile-document"
                key={
                  document.id ||
                  `${document.name || document}-${index}`
                }
              >
                <span>{document.name || document}</span>

                <small>
                  {document.size
                    ? `${(document.size / 1024).toFixed(1)} KB`
                    : ""}
                </small>
              </div>
            ))}
          </div>
        ) : (
          <p className="employee-profile-empty">
            لا توجد مستندات مرفقة لهذا الموظف.
          </p>
        )}
      </section>

    </section>
  );
}

export default EmployeeDetailsModal;

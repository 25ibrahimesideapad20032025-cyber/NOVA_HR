import { useState } from "react";
import { roleLabels } from "../shared/hrInitialData";

function AuthenticationPage({ users = [], onLogin }) {
  const [identity, setIdentity] = useState("admin@nova.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    const account = users.find(
      (user) =>
        user.username?.toLowerCase() === identity.trim().toLowerCase() ||
        user.email?.toLowerCase() === identity.trim().toLowerCase()
    );

    if (!account || account.status !== "active") {
      setError("تعذر العثور على حساب نشط بهذه البيانات.");
      return;
    }

    if (!account.demoPassword || account.demoPassword !== password) {
      setError("كلمة المرور غير صحيحة.");
      return;
    }

    onLogin(account);
  }

  return (
    <main className="auth-screen" dir="rtl">
      <section className="auth-brand-panel">
        <div className="auth-brand-lockup">
          <span className="auth-brand-mark">N</span>
          <div>
            <strong>NOVA HR</strong>
            <span>نظام إدارة الموارد البشرية</span>
          </div>
        </div>
        <div className="auth-brand-copy">
          <span className="auth-eyebrow">HUMAN RESOURCE MANAGEMENT</span>
          <h1>إدارة مواردك البشرية، بوضوح وكفاءة.</h1>
          <p>
            منصة موحدة لتنظيم بيانات الموظفين، ومتابعة العمليات الإدارية،
            ودعم القرارات بالمعلومات.
          </p>
        </div>
        <div className="auth-brand-footer">NOVA HR · 2026 / 2027</div>
      </section>

      <section className="auth-form-panel">
        <form className="auth-card" onSubmit={handleSubmit} noValidate>
          <div className="auth-mobile-brand">
            <span className="auth-brand-mark">N</span>
            <strong>NOVA HR</strong>
          </div>

          <div className="auth-heading">
            <span className="auth-eyebrow">مرحبًا بعودتك</span>
            <h2>تسجيل الدخول</h2>
            <p>أدخل بيانات حسابك للوصول إلى لوحة العمل.</p>
          </div>

          <div className="hr-field">
            <label htmlFor="auth-identity">اسم المستخدم أو البريد الإلكتروني *</label>
            <input
              id="auth-identity"
              type="text"
              autoComplete="username"
              value={identity}
              onChange={(event) => setIdentity(event.target.value)}
              placeholder="أدخل اسم المستخدم أو البريد الإلكتروني"
              required
            />
            <small>استخدم اسم المستخدم أو البريد المسجل لحسابك.</small>
          </div>

          <div className="hr-field">
            <label htmlFor="auth-password">كلمة المرور *</label>
            <div className="auth-password-wrap">
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="أدخل كلمة المرور"
                required
              />
              <button
                type="button"
                className="auth-show-password"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? "إخفاء" : "إظهار"}
              </button>
            </div>
            <small>تأكد من كتابة كلمة المرور بحروفها الصحيحة.</small>
          </div>

          {error && <div className="hr-alert hr-alert-danger" role="alert">{error}</div>}

          <button className="hr-button hr-button-primary auth-submit" type="submit">
            تسجيل الدخول <span aria-hidden="true">←</span>
          </button>

          <button
            type="button"
            className="auth-forgot"
            onClick={() => setNotice("استعادة كلمة المرور تحتاج إلى ربط خدمة البريد الإلكتروني في Laravel.")}
          >
            هل نسيت كلمة المرور؟
          </button>

          {notice && <div className="hr-alert hr-alert-info" role="status">{notice}</div>}

          <details className="auth-demo-details">
            <summary>حسابات تجريبية لاختبار الأدوار</summary>
            <div className="auth-demo-list">
              {users.filter((user) => user.status === "active").map((user) => (
                <button
                  type="button"
                  key={user.id}
                  onClick={() => {
                    setIdentity(user.email);
                    setPassword(user.demoPassword || "");
                    setError("");
                  }}
                >
                  <strong>{roleLabels[user.role] || user.role}</strong>
                  <span>{user.email}</span>
                </button>
              ))}
            </div>
            <small>كلمات المرور التجريبية موجودة في ملف بيانات الحسابات للمطور فقط.</small>
          </details>

          <p className="auth-security-note">
            هذه واجهة تجريبية للواجهة الأمامية؛ المصادقة الفعلية والتحقق الآمن
            من كلمات المرور يجب تنفيذهما في Laravel.
          </p>
        </form>
      </section>
    </main>
  );
}

export default AuthenticationPage;

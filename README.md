# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

# NOVA HR – نظام إدارة الموارد البشرية

## نبذة عن المشروع

**NOVA HR** هو نظام إلكتروني لإدارة الموارد البشرية (Human Resources Management System – HRMS)، يهدف إلى تنظيم وأتمتة العمليات الإدارية المتعلقة بالموظفين داخل المؤسسات، من خلال منصة موحدة توفر واجهات سهلة الاستخدام لإدارة بيانات الموظفين والأقسام ومتابعة العمليات والأنشطة المرتبطة بالموارد البشرية.

يجمع المشروع بين الجوانب الإدارية والتقنية، ويسعى إلى تحسين كفاءة العمل، وتقليل الاعتماد على الإجراءات الورقية، وتسهيل الوصول إلى المعلومات، ودعم اتخاذ القرارات الإدارية من خلال عرض البيانات والإحصائيات والتقارير.

## الأهداف الرئيسية

- تنظيم وإدارة بيانات الموظفين.
- إدارة الهيكل التنظيمي والأقسام داخل المؤسسة.
- تنظيم عمليات الإجازات والحضور والانصراف.
- إدارة الرواتب والاستحقاقات المالية.
- متابعة تقييم أداء الموظفين.
- إدارة صلاحيات المستخدمين وفق الأدوار الوظيفية.
- توفير لوحات معلومات وإحصائيات وتقارير تساعد الإدارة في متابعة الأداء.

## الوحدات الرئيسية

يتضمن النظام مجموعة من الوحدات الإدارية، أبرزها:

1. **لوحة التحكم (Dashboard):** عرض المؤشرات والإحصائيات الرئيسية.
2. **إدارة الموظفين (Employee Management):** إضافة الموظفين وتعديل بياناتهم وعرضها وإدارتها.
3. **إدارة الأقسام (Department Management):** تنظيم الأقسام والبيانات المرتبطة بالهيكل التنظيمي.
4. **إدارة المستخدمين (User Management):** إدارة حسابات المستخدمين والأدوار والصلاحيات.
5. **إدارة الإجازات (Leave Management):** متابعة طلبات الإجازات وحالاتها.
6. **إدارة الحضور والانصراف (Attendance Management):** متابعة سجلات الحضور والتأخير.
7. **إدارة الرواتب (Payroll Management):** عرض وإدارة بيانات الرواتب والاستحقاقات والخصومات.
8. **تقييم الأداء (Performance Evaluation):** متابعة تقييم أداء الموظفين.
9. **التقارير (Reports):** عرض البيانات والإحصائيات وإمكانية تصدير التقارير.

## التقنيات المستخدمة

- **React.js:** بناء واجهات المستخدم باستخدام المكونات.
- **JavaScript:** تنفيذ منطق التطبيق والتعامل مع البيانات والأحداث.
- **Vite:** توفير بيئة تطوير سريعة وتشغيل وبناء المشروع.
- **CSS:** تصميم الواجهات وتنسيق العناصر.
- **LocalStorage:** تخزين البيانات التجريبية محليًا داخل المتصفح.

## طريقة تشغيل المشروع محليًا

يتطلب تشغيل المشروع تثبيت Node.js أولًا.

```bash
# الانتقال إلى مجلد المشروع
cd NOVA_HR_Project

# تثبيت المكتبات والاعتماديات
npm install

# تشغيل المشروع
npm run dev
```

بعد التشغيل، افتح الرابط الذي يظهر في Terminal، وغالبًا يكون:

`http://localhost:5173/`

## حالة المشروع

المشروع عبارة عن نموذج أولي (Prototype) بواجهة أمامية (Frontend)، يعتمد حاليًا على بيانات تجريبية وتخزين محلي باستخدام LocalStorage. ولا يتضمن في نسخته الحالية خادم Backend أو قاعدة بيانات مركزية.

لذلك فإن البيانات المحفوظة محليًا تكون مرتبطة بالمتصفح والجهاز الذي تم استخدامه، ولا تتم مزامنتها تلقائيًا بين المستخدمين أو الأجهزة المختلفة.

## ملاحظة

يهدف المشروع إلى تقديم نموذج عملي لنظام إدارة موارد بشرية يجمع بين مفاهيم نظم المعلومات الإدارية وتقنيات تطوير تطبيقات الويب الحديثة، مع إمكانية تطويره مستقبلًا بإضافة Backend وقاعدة بيانات مشتركة، وتعزيز الأمان والصلاحيات ودعم تعدد المستخدمين.

---

**NOVA HR – Smart Human Resources Management System**

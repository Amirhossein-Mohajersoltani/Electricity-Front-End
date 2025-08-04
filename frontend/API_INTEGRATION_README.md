# 🔗 API Integration Guide - داشبورد برق

این مستند نحوه سینک شدن فرانت‌اند React با بک‌اند Flask را توضیح می‌دهد.

## 🛠 تغییرات انجام شده

### 1. ایجاد سرویس API (`src/services/api.ts`)
- تمام endpoint های مطابق با مستندات API پیاده‌سازی شده
- Authentication با session cookies
- Error handling مناسب
- TypeScript interfaces برای type safety

### 2. Authentication System
- `AuthContext` برای مدیریت وضعیت کاربر
- `ProtectedRoute` برای محافظت از صفحات
- صفحه Login با UI مناسب
- Logout functionality در Header

### 3. به‌روزرسانی Components

#### DataFilter Component
- حالا parameters را مطابق API می‌فرستد:
  - `region_code` (کد ناحیه)
  - `fidder_code` (کد فیدر) 
  - `start_date` (تاریخ شروع)
  - `end_date` (تاریخ پایان)

#### Pages
- **FeederAnalysis**: با API endpoint `/fidder-analysis` سینک شده
- **EnergyComparison**: با API endpoint `/compare-energetic` سینک شده
- **TariffShare**: ۶ تعرفه به جای ۴ تعرفه (همانطور که خواسته شده)

### 4. Router Updates
- مسیر `/login` اضافه شده
- تمام routes محافظت شده با `ProtectedRoute`
- Redirect به login برای کاربران غیر مجاز

## 🚀 نحوه راه‌اندازی

### 1. نصب Dependencies
```bash
npm install
```

### 2. تنظیم بک‌اند
مطمئن شوید Flask backend روی `http://localhost:5000` در حال اجرا است.

### 3. اجرای Development Server
```bash
npm run dev
```

## 🔐 Authentication Flow

1. کاربر وارد `/login` می‌شود
2. اطلاعات ورود به `/api/login` ارسال می‌شود
3. Session در server ست می‌شود
4. کاربر به dashboard redirect می‌شود
5. تمام API calls با session cookies ارسال می‌شوند

## 📊 API Endpoints در حال استفاده

### Authentication
- `POST /api/login` - ورود کاربر
- `POST /api/logout` - خروج کاربر  
- `POST /api/check-auth` - بررسی وضعیت authentication

### Data Analysis
- `POST /api/fidder-analysis` - تحلیل فیدر
- `POST /api/compare-energetic` - مقایسه انرژی
- `POST /api/consumption-distribution` - توزیع مصرف

## 🔧 تنظیمات اضافی

### تغییر Base URL
در فایل `src/services/api.ts`:
```typescript
const API_BASE_URL = 'http://your-domain:port/api';
```

### نمونه درخواست API
```typescript
const response = await apiService.getFeederAnalysis({
  fidder_code: "FDR1234",
  start_date: "1402-01-01", 
  end_date: "1402-12-29",
  region_code: "RG01"
});
```

## 🐛 مدیریت خطاها

- Network errors از API service handle می‌شوند
- Loading states در UI نمایش داده می‌شوند  
- Error messages به فارسی برای کاربر نمایش داده می‌شوند
- Fallback به حالت offline در صورت عدم دسترسی به سرور

## 🎯 ویژگی‌های اضافه شده

### صفحه تعرفه
- ۶ تعرفه به جای ۴ تعرفه
- رنگ‌بندی متنوع
- درصدهای متعادل (مجموع ۱۰۰%)

### UI/UX Improvements  
- Loading spinners
- Error states
- Empty states
- Responsive design

## 📝 نکات مهم

1. **CORS**: مطمئن شوید Flask backend اجازه CORS از domain فرانت‌اند را دارد
2. **Session Management**: Cookies باید از domain مناسب set شوند
3. **Error Handling**: همیشه fallback برای حالت offline در نظر بگیرید
4. **Type Safety**: از TypeScript interfaces استفاده کنید

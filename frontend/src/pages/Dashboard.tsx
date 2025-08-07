// src/pages/Dashboard.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RegionFeederGuide from '../components/RegionFeederGuide';
import PrivateCompanyGuide from '../components/PrivateCompanyGuide';

const Dashboard = () => {
  const { companyType, loading, userEmail } = useAuth();
  const navigate = useNavigate();
  const [localLoading] = useState(false);

  // ✅ منطق نام کاربر برای همه نقش‌ها به‌روز شد
  const getUserName = (email: string | null): string => {
    if (!email) return 'کاربر';
    const name = email.split('@')[0];
    if (companyType === 'admin') return 'ادمین سیستم';
    if (companyType === 'private' && name === 'flour.company') return 'مدیر شرکت';
    if (companyType === 'public' && name === 'techie') return 'مهندس توزیع برق';
    return name;
  };

  if (loading || localLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-lg text-gray-600">در حال بارگذاری داشبورد...</p>
        </div>
      </div>
    );
  }

  // ✅ متغیرها برای مدیریت پویای محتوا بر اساس نوع شرکت
  const isPrivate = companyType === 'private';
  const isAdmin = companyType === 'admin';

  const companyLabel = isAdmin ? 'پنل ادمین' : isPrivate ? 'شرکت خصوصی' : 'شرکت عمومی';
  const badgeColor = isAdmin ? 'red' : isPrivate ? 'purple' : 'blue';
  const pageSubtitle = isPrivate ? 'داشبورد مدیریت مصرف انرژی شرکت' : 'داشبورد شرکت توزیع نیروی برق';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  خوش آمدید، {getUserName(userEmail)} 👋
                </h1>
                <p className="text-gray-600">{pageSubtitle}</p>
                <div className="mt-2 flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${badgeColor}-100 text-${badgeColor}-800`}>
                    {companyLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary (for private only) */}
        {isPrivate && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">خلاصه وضعیت شرکت</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-2">خودکار</div>
                <div className="text-sm text-gray-600">تنظیمات</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">مستقیم</div>
                <div className="text-sm text-gray-600">دسترسی به داده‌ها</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">تخصصی</div>
                <div className="text-sm text-gray-600">گزارش‌گیری</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">دسترسی سریع</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/feeder-analysis')}
              className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {isPrivate ? 'تحلیل مصرف برق' : 'تحلیل فیدر'}
              </span>
            </button>

            <button
              onClick={() => navigate('/energy-comparison')}
              className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
            >
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-900">مقایسه انرژی</span>
            </button>

            <button
              onClick={() => navigate('/csv-upload')}
              className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
            >
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-900">آپلود اطلاعات</span>
            </button>
          </div>
        </div>

        {/* Guide Section */}
        <div className="mt-8">
          {isPrivate ? <PrivateCompanyGuide /> : <RegionFeederGuide />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
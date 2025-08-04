import React from 'react';
import { Building2, Shield, BarChart3, Info, CheckCircle, Clock, Database } from 'lucide-react';

interface PrivateCompanyGuideProps {
  className?: string;
}

const PrivateCompanyGuide: React.FC<PrivateCompanyGuideProps> = ({ className = "" }) => {
  return (
    <div className={`bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-purple-600" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            راهنمای شرکت خصوصی
          </h3>

          <div className="space-y-4">
            {/* Access Info */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-3 h-3 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Database className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-gray-900">دسترسی خودکار به داده‌ها</span>
                </div>
                <p className="text-sm text-gray-600">
                  به عنوان شرکت خصوصی شما به طور خودکار به داده های مربوط به مصرف انرژی خود دسترسی دارید.
                </p>
              </div>
            </div>



            {/* Time Range Selection */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-3 h-3 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-gray-900">انتخاب بازه زمانی</span>
                </div>
                <p className="text-sm text-gray-600">
                  تنها کاری که نیاز دارید انجام دهید، انتخاب بازه زمانی مورد نظر برای تحلیل است.
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">مزایای شرکت خصوصی:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">دسترسی مستقیم به داده‌ها</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">عدم نیاز به تنظیمات پیچیده</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">تحلیل سریع و آسان</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">گزارش‌گیری تخصصی</span>
              </div>
            </div>
          </div>

          {/* Quick Start */}
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-gray-900">شروع سریع</span>
            </div>
            <p className="text-sm text-gray-700">
              برای شروع تحلیل، روی یکی از گزینه های "تحلیل مصرف انرژی" یا "مقایسه مصرف انرژی" کلیک کنید و سپس بازه زمانی مورد نظر را انتخاب کنید.
                          </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateCompanyGuide; 
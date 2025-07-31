import React from 'react';
import { MapPin, Zap, Info, CheckCircle, ArrowRight } from 'lucide-react';

interface RegionFeederGuideProps {
  className?: string;
}

const RegionFeederGuide: React.FC<RegionFeederGuideProps> = ({ className = "" }) => {
  return (
    <div className={`bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Info className="w-5 h-5 text-blue-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            راهنمای فیلتر منطقه و فیدر
          </h3>
          
          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-900">انتخاب منطقه</span>
                </div>
                <p className="text-sm text-gray-600">
                  ابتدا یک یا چند منطقه را انتخاب کنید. سیستم به طور خودکار فیدرهای مربوط به آن مناطق را نمایش می‌دهد.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-gray-900">انتخاب فیدر</span>
                </div>
                <p className="text-sm text-gray-600">
                  فیدرهای مورد نظر را انتخاب کنید یا از دکمه "انتخاب همه" برای انتخاب تمام فیدرهای منطقه استفاده کنید.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-gray-900">تحلیل جامع</span>
                </div>
                <p className="text-sm text-gray-600">
                  با یک کلیک، تمام فیدرهای منطقه انتخاب شده در تحلیل لحاظ می‌شوند.
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">ویژگی‌های سیستم:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">انتخاب چندین منطقه همزمان</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">فیلتر خودکار فیدرها</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">انتخاب سریع همه فیدرها</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">تعداد نامحدود منطقه و فیدر</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionFeederGuide; 
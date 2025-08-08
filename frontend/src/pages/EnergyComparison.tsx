import { useState } from "react";
import type {
  EnergyComparisonRequest,
  FilterData,
  EnergyComparisonData,
  FlexibleApiResponse,
  CompanyEnergyData,
} from "../types/api.interfaces";
import DynamicFilterPanel from "../components/DynamicFilterPanel";
import FloatingFilterButton from "../components/FloatingFilterButton";
import MultiFilterEnergyChart from "../components/charts/MultiFilterEnergyChart";
import { apiService } from "../services/api";
import { useAuth } from "../context/AuthContext";

interface MultiFilterEnergyData {
  [filterId: string]: EnergyComparisonData;
}

const EnergyComparison = () => {
  // دریافت مستقیم companyType و userEmail از useAuth
  const { companyType, userEmail } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dynamicFilters, setDynamicFilters] = useState<FilterData[]>([]);
  const [multiFilterData, setMultiFilterData] = useState<MultiFilterEnergyData>({});
  const [showDynamicFilters, setShowDynamicFilters] = useState(false);

  const handleDynamicFilters = async (filters: FilterData[]) => {
    setDynamicFilters(filters);
    if (filters.length === 0) {
      setMultiFilterData({});
      return;
    }
    setLoading(true);
    setError('');

    try {
      const promises = filters.map(async (filter) => {
        if (!filter.startDate || !filter.endDate) return null;

        const startYear = filter.startDate.substring(0, 4);
        const endYear = filter.endDate.substring(0, 4);
        const years = Array.from(new Set([startYear, endYear]));
        const costumePeriod = filter.costume_period || undefined;

        // شرط اصلی حالا به سادگی بر اساس companyType است
        if (companyType === 'admin') {
          if (!filter.companyNames || filter.companyNames.length === 0) return null;

          const apiPayload: EnergyComparisonRequest = {
            company_names: filter.companyNames,
            costume_period: costumePeriod,
            end_date: filter.endDate,
            fidder_code: filter.feeders || [],
            period: filter.period === 'yearly' ? 'year' : filter.period || 'week',
            region_code: (filter.regions || []).map(Number),
            start_date: filter.startDate,
            years: years,
          };

          const response = await apiService.getEnergyComparison(apiPayload) as FlexibleApiResponse;
          if (response.status === 'success' && response.data) {
            return { id: filter.id, data: response.data as EnergyComparisonData };
          }
        }
        // منطق برای کاربر خصوصی
        else if (companyType === 'private') {
          const apiPayload: Omit<EnergyComparisonRequest, 'company_names'> = {
            costume_period: costumePeriod,
            end_date: filter.endDate,
            fidder_code: filter.feeders || [],
            period: filter.period === 'yearly' ? 'year' : filter.period || 'week',
            region_code: (filter.regions || []).map(Number),
            start_date: filter.startDate,
            years: years,
          };

          const response = await apiService.getEnergyComparison(apiPayload) as FlexibleApiResponse;

          if (response.status === 'success' && response.data?.energy_comparison) {
            // استفاده از userEmail به عنوان نام یا شناسه شرکت
            const companyName = userEmail || 'شرکت من';
            const companyAPIData = response.data.energy_comparison as CompanyEnergyData;

            const energyData: EnergyComparisonData = {
              [companyName]: companyAPIData
            };
            return { id: filter.id, data: energyData };
          }
        }

        return null;
      });

      const results = await Promise.all(promises);
      const newMultiFilterData = results.reduce<MultiFilterEnergyData>((acc, result) => {
        if (result && result.data) acc[result.id] = result.data;
        return acc;
      }, {});

      setMultiFilterData(newMultiFilterData);

      if (Object.keys(newMultiFilterData).length === 0) {
        setError('هیچ داده‌ای برای فیلترهای انتخاب شده یافت نشد.');
      }
    } catch (err) {
      console.error('❌ Multi-filter API call failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'خطا در بارگذاری داده‌های چندگانه';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setDynamicFilters([]);
    setMultiFilterData({});
    setError('');
  };

  const getDataStatistics = () => {
    const totalFilters = dynamicFilters.length;
    const totalCompanies = Object.values(multiFilterData).reduce((count, filterData) => {
      return count + Object.keys(filterData).length;
    }, 0);

    const totalPeriods = new Set<string>();
    Object.values(multiFilterData).forEach(filterData => {
      Object.values(filterData).forEach(companyData => {
        if (companyData.result && Array.isArray(companyData.result)) {
          companyData.result.forEach(item => {
            if (item.period_start && item.period_end) {
              totalPeriods.add(`${item.period_start}-${item.period_end}`);
            }
          });
        }
      });
    });

    return { totalFilters, totalCompanies, totalPeriods: totalPeriods.size };
  };

  const stats = getDataStatistics();

  // --- بخش JSX برای نمایش کامپوننت در صفحه ---
  return (
    <div className="min-h-screen bg-gray-50 p-3 lg:p-6">
      <div className="max-w-full mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">مقایسه مصرف انرژی</h1>
          <p className="text-gray-600">مقایسه مصرف انرژی شرکت‌های مختلف در بازه‌های زمانی متنوع</p>
          
          {stats.totalCompanies > 0 && !loading && (
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
              <span>🏢 {stats.totalCompanies} شرکت</span>
              <span>📊 {stats.totalFilters} فیلتر</span>
              <span>📅 {stats.totalPeriods} دوره زمانی</span>
            </div>
          )}
        </div>

        <div className="w-full">
          {/* نمایش خطا */}
          {error && !loading && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-center">{error}</p>
              <button 
                onClick={resetFilters}
                className="mt-2 mx-auto block px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                پاک کردن فیلترها
              </button>
            </div>
          )}

          {/* نمایش لودینگ */}
          {loading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-center items-center h-80 lg:h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">در حال بارگذاری داده‌های مقایسه انرژی...</p>
                </div>
              </div>
            </div>
          )}

          {/* نمایش چارت یا حالت اولیه */}
          {!loading && !error && (
            Object.keys(multiFilterData).length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">نمودار مقایسه انرژی</h2>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDynamicFilters(true)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      ویرایش فیلترها
                    </button>
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      ریست
                    </button>
                  </div>
                </div>
                <div className="h-96 lg:h-[600px]">
                  <MultiFilterEnergyChart
                    multiData={multiFilterData}
                    filters={dynamicFilters}
                    loading={loading}
                    title=""
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    آماده برای مقایسه انرژی
                  </h3>
                  <p className="text-gray-500 mb-4">
                    برای شروع، از دکمه فیلتر برای اضافه کردن شرکت‌ها و بازه‌های زمانی استفاده کنید.
                  </p>
                  <button
                    onClick={() => setShowDynamicFilters(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                  >
                    <span>افزودن فیلتر</span>
                    <span>📊</span>
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
      
      <FloatingFilterButton
        onClick={() => setShowDynamicFilters(true)}
        activeFiltersCount={dynamicFilters.length}
      />

      <DynamicFilterPanel
        isOpen={showDynamicFilters}
        onClose={() => setShowDynamicFilters(false)}
        onApplyFilters={handleDynamicFilters}
        title="فیلترهای پیشرفته مقایسه انرژی"
      />
    </div>
  );
}

export default EnergyComparison;
import { useState } from "react";
import DynamicFilterPanel from "../components/DynamicFilterPanel";
import FloatingFilterButton from "../components/FloatingFilterButton";
import MultiFilterChart from "../components/charts/MultiFilterChart";
import { apiService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { DynamicFilterData, FilterDataStructure, MultiFilterAnalysisData } from '../types/filterInterfaces';

// ✅ FIX: Standardized chart types to use 'profil'
type ChartType = 'daily_peak' | 'weekly_peak' | 'daily_profil_max' | 'daily_profil_mean' | 'load_continuity' | 'long_term';

interface ExtendedAuthContext {
  companyType: string;
  company?: string;
}

export default function FeederAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // ✅ FIX: Removed unused 'company' variable
  const { companyType } = useAuth() as ExtendedAuthContext;

  // ✅ FIX: Using a more flexible type for filters from the panel
  const [dynamicFilters, setDynamicFilters] = useState<any[]>([]);
  const [multiFilterData, setMultiFilterData] = useState<MultiFilterAnalysisData>({});
  const [showDynamicFilters, setShowDynamicFilters] = useState(false);
  const [useDynamicFilters, setUseDynamicFilters] = useState(false);
  // ✅ FIX: Initial selected chart matches the corrected ChartType
  const [selectedChart, setSelectedChart] = useState<ChartType>('daily_peak');
  const [parallelMode, setParallelMode] = useState(false);

  // ✅ FIX: Standardized chart options to use 'profil'
  const chartOptions = [
    { id: 'daily_peak' as ChartType, name: 'پیک روزانه', description: companyType === 'private' ? 'نمودار مصرف پیک روزانه خط تولید' : 'نمودار مصرف پیک روزانه فیدر' },
    { id: 'weekly_peak' as ChartType, name: 'پیک هفتگی', description: 'حداکثر مصرف هفتگی' },
    { id: 'daily_profil_max' as ChartType, name: 'پروفیل روزانه (حداکثر)', description: 'حداکثر مصرف ساعتی' },
    { id: 'daily_profil_mean' as ChartType, name: 'پروفیل روزانه (میانگین)', description: 'میانگین مصرف ساعتی' },
    { id: 'load_continuity' as ChartType, name: 'تداوم بار', description: companyType === 'private' ? 'تحلیل تداوم و پایداری بار خط تولید' : 'تحلیل تداوم و پایداری بار فیدر' },
    { id: 'long_term' as ChartType, name: 'تحلیل بلندمدت', description: 'روند مصرف در طول زمان' }
  ];

  const getSelectedChartInfo = () => {
    return chartOptions.find(chart => chart.id === selectedChart) || chartOptions[0];
  };

  // ✅ FIX: Changed function signature to accept filters from DynamicFilterPanel (which may have optional dates)
  const handleDynamicFilters = async (filters: any[]) => {
    setDynamicFilters(filters);
    setUseDynamicFilters(true);
    setLoading(true);
    setError('');

    try {
      const newMultiFilterData: MultiFilterAnalysisData = {};

      for (const filter of filters) {
        console.log('🔄 Processing filter:', filter.name, filter);

        if (companyType === 'private') {
          const companyNames = filter.companyNames || [];

          if (companyNames.length === 0) {
            console.warn('⚠️ No company names provided for private filter:', filter.id);
            continue;
          }

          console.log('📋 Private company request:', {
            company_names: companyNames,
            start_date: filter.startDate,
            end_date: filter.endDate
          });

          const response = await apiService.getPrivateCompanyAnalysis({
            company_names: companyNames,
            start_date: filter.startDate ?? '',
            end_date: filter.endDate ?? ''
          });

          if (response.status === 'success' && response.data) {
            console.log('✅ Private company API response:', response.data);

            if (typeof response.data === 'object' && response.data !== null) {
              // ✅ FIX: Cast to a flexible type to avoid mismatch errors
              const companiesData = response.data as Record<string, any>;
              const companyKeys = Object.keys(companiesData);

              if (companyKeys.length > 0) {
                const firstCompanyKey = companyKeys[0];
                const companyData = companiesData[firstCompanyKey];

                console.log(`📊 Using data from company: ${firstCompanyKey}`, companyData);

                // ✅ FIX: Corrected property access from 'profile' to 'profil' to match standardized naming
                const transformedData: FilterDataStructure = {
                  daily_peak: companyData.daily_peak || { result: [] },
                  weekly_peak: companyData.weekly_peak || { result: [] },
                  daily_profil_max: companyData.daily_profil_max || { result: [] },
                  daily_profil_mean: companyData.daily_profil_mean || { result: [] },
                  load_continuity: companyData.load_continuity || { result: [] },
                  Load_continuity: companyData.load_continuity || { result: [] }, // Fallback for different naming
                  long_term: companyData.long_term || { result: [] }
                };

                newMultiFilterData[filter.id] = transformedData;
              }
            }
          } else {
            console.error('❌ Private company API call failed:', response);
            setError(`خطا در بارگذاری داده‌های شرکت ${filter.name}: ${response.message || 'نامشخص'}`);
          }

        } else {
          let feedersToSend: string[] = [];
          let regionsToSend: string[] = [];

          // ✅ FIX: Ensure feeders array elements are strings for the API call
          feedersToSend = filter.feeders && filter.feeders.length > 0 ? filter.feeders.map(String) : [];
          // ✅ FIX: Ensure regions array elements are strings for the API call
          regionsToSend = (filter.regions || []).map(String);


          console.log('🏢 Public company request:', {
            fidder_code: feedersToSend,
            region_code: regionsToSend,
            start_date: filter.startDate,
            end_date: filter.endDate
          });

          const response = await apiService.getFeederAnalysisByArrays(
            feedersToSend,
            regionsToSend,
          
            filter.startDate ?? '',
            filter.endDate ?? ''
          );

          if (response.status === 'success' && response.data) {
            console.log('✅ Public company API response:', response.data);
            try {
              const transformedData: FilterDataStructure = response.data as unknown as FilterDataStructure;
              newMultiFilterData[filter.id] = transformedData;
            } catch (error) {
              console.error('Error transforming data for filter:', filter.id, error);
              newMultiFilterData[filter.id] = {
                daily_peak: { result: [] },
                weekly_peak: { result: [] },
                daily_profil_max: { result: [] },
                daily_profil_mean: { result: [] },
                load_continuity: { result: [] },
                Load_continuity: { result: [] },
                long_term: { result: [] }
              };
            }
          } else {
            console.error('❌ Public company API call failed:', response);
            setError(`خطا در بارگذاری داده‌های فیلتر ${filter.name}: ${response.message || 'نامشخص'}`);
          }
        }
      }

      console.log('📊 Final multi-filter data:', newMultiFilterData);
      setMultiFilterData(newMultiFilterData);

    } catch (error) {
      console.error('❌ Multi-filter API call failed:', error);
      setError('خطا در بارگذاری داده‌های چندگانه: ' + (error instanceof Error ? error.message : 'نامشخص'));
    } finally {
      setLoading(false);
    }
  };

  const resetToSingleFilter = () => {
    setUseDynamicFilters(false);
    setDynamicFilters([]);
    setMultiFilterData({});
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 lg:p-6 ">
      <div className="max-w-full mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            {companyType === 'private' ? 'تحلیل مصرف انرژی شرکت‌های خصوصی' : 'تحلیل مصرف انرژی شرکت‌های عمومی'}
          </h1>
          <p className="text-gray-600">
            بررسی و تحلیل جامع عملکرد {companyType === 'private' ? 'شرکت‌های خصوصی' : 'فیدرها و مناطق'}
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-700">نحوه استفاده</span>
            </div>
            <p className="text-sm text-blue-700 mt-2">
              برای مقایسه داده‌ها در بازه‌های زمانی مختلف یا {companyType === 'private' ? 'شرکت‌های' : 'مناطق'} مختلف,
              روی دکمه شناور فیلتر (پایین سمت چپ) کلیک کنید.
              سپس نمودار مورد نظر را از پایین انتخاب کنید.
            </p>
          </div>
        </div>

        <div className="w-full space-y-6">

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">در حال بارگذاری داده‌ها...</p>
                </div>
              </div>
            </div>
          )}

          {useDynamicFilters && dynamicFilters.length > 0 && Object.keys(multiFilterData).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">مقایسه چندگانه - {getSelectedChartInfo().name}</h2>
                  <p className="text-gray-600 mt-1">مقایسه {dynamicFilters.length} فیلتر مختلف</p>
                </div>
                <div className="text-right">
                  <button
                    onClick={resetToSingleFilter}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    بازگشت به حالت اولیه
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-end mb-4">
                <button
                  onClick={() => setParallelMode((p) => !p)}
                  className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  {parallelMode ? 'نمایش عادی' : 'نمایش موازی'}
                </button>
              </div>
              <div className="h-96 lg:h-[500px]">
                <MultiFilterChart
                  multiData={multiFilterData}
                  filters={dynamicFilters}
                  chartType={selectedChart}
                  loading={loading}
                  title={getSelectedChartInfo().name}
                  parallelMode={parallelMode}
                  company={companyType}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-32 bg-white rounded-xl shadow-sm p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">انتخاب نمودار برای نمایش</h3>
            <p className="text-gray-600 text-sm">
              نمودار مورد نظر خود را انتخاب کنید
              ({chartOptions.length} نمودار در دسترس{companyType === 'private' ? ' برای شرکت خصوصی' : ' برای شرکت عمومی'})
            </p>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 ${companyType === 'private' ? 'lg:grid-cols-3' : 'lg:grid-cols-6'} gap-4`}>
            {chartOptions.map((chart) => (
              <button
                key={chart.id}
                onClick={() => setSelectedChart(chart.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-right ${
                  selectedChart === chart.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-sm mb-1">{chart.name}</div>
                <div className="text-xs text-gray-500">{chart.description}</div>
                {selectedChart === chart.id && (
                  <div className="mt-2 flex justify-end">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm">
              <span className="font-medium">نمودار انتخاب شده:</span> {getSelectedChartInfo().name}
            </p>
          </div>
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
        title={companyType === 'private' ? "فیلترهای پیشرفته مصرف برق شرکت‌های خصوصی" : "فیلترهای پیشرفته تحلیل فیدر"}
      />


    </div>
  );
}
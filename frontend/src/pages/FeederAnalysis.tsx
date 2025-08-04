import { useState } from "react";
// import { FullScreenChart } from "../components/charts/FullScreenChart";
import DynamicFilterPanel from "../components/DynamicFilterPanel";
import FloatingFilterButton from "../components/FloatingFilterButton";
import MultiFilterChart from "../components/charts/MultiFilterChart";
import { apiService } from "../services/api";
import { useAuth } from "../context/AuthContext";
// import { useFullScreenChart } from "../hooks/useFullScreenChart";

interface DynamicFilterData {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  regions: string[];
  feeders: string[];
  color: string;
}

// Define types that exactly match what MultiFilterChart expects
interface DailyPeakResult {
  date: string;
  amount: number;
}

interface FilterDataStructure {
  daily_peak?: { result?: DailyPeakResult[] };
  weekly_peak?: { result?: DailyPeakResult[] };
  daily_profile_max?: { result?: DailyPeakResult[] };
  daily_profile_mean?: { result?: DailyPeakResult[] };
  load_continuity?: { result?: DailyPeakResult[] };
  long_term?: { result?: DailyPeakResult[] };
}

interface MultiFilterAnalysisData {
  [filterId: string]: FilterDataStructure;
}

// Define the chart type more specifically
type ChartType = 'daily_peak' | 'weekly_peak' | 'daily_profile_max' | 'daily_profile_mean' | 'load_continuity' | 'long_term';

// Extend the AuthContext type to include company property
interface ExtendedAuthContext {
  companyType: string;
  company?: string;
}

export default function FeederAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { companyType, company } = useAuth() as ExtendedAuthContext;
  // const fullScreenChart = useFullScreenChart();

  const [dynamicFilters, setDynamicFilters] = useState<DynamicFilterData[]>([]);
  const [multiFilterData, setMultiFilterData] = useState<MultiFilterAnalysisData>({});
  const [showDynamicFilters, setShowDynamicFilters] = useState(false);
  const [useDynamicFilters, setUseDynamicFilters] = useState(false);
  const [selectedChart, setSelectedChart] = useState<ChartType>('daily_peak');
  const [parallelMode, setParallelMode] = useState(false);

  const chartOptions = [
    { id: 'daily_peak' as ChartType, name: 'پیک روزانه', description: companyType === 'private' ? 'نمودار مصرف پیک روزانه خط تولید' : 'نمودار مصرف پیک روزانه فیدر' },
    { id: 'weekly_peak' as ChartType, name: 'پیک هفتگی', description: 'حداکثر مصرف هفتگی' },
    { id: 'daily_profile_max' as ChartType, name: 'پروفیل روزانه', description: 'حداکثر مصرف ساعتی' },
    { id: 'daily_profile_mean' as ChartType, name: 'پروفیل روزانه', description: 'میانگین مصرف ساعتی' },
    { id: 'load_continuity' as ChartType, name: 'تداوم بار', description: companyType === 'private' ? 'تحلیل تداوم و پایداری بار خط تولید' : 'تحلیل تداوم و پایداری بار فیدر' },
    { id: 'long_term' as ChartType, name: 'تحلیل بلندمدت', description: 'روند مصرف در طول زمان' }
  ];

  const getSelectedChartInfo = () => {
    return chartOptions.find(chart => chart.id === selectedChart) || chartOptions[0];
  };

  const handleDynamicFilters = async (filters: DynamicFilterData[]) => {
    setDynamicFilters(filters);
    setUseDynamicFilters(true);
    setLoading(true);
    setError('');

    try {
      const newMultiFilterData: MultiFilterAnalysisData = {};

      for (const filter of filters) {
        let feedersToSend: string[] = [];
        let regionsToSend: string[] = [];

        if (companyType === 'private') {
          feedersToSend = ['1'];
          regionsToSend = ['1'];
        } else {
          feedersToSend = filter.feeders.length > 0 ? filter.feeders : [];
          regionsToSend = filter.regions;
        }

        const response = await apiService.getFeederAnalysisByArrays(
          feedersToSend,
          regionsToSend,
          filter.startDate,
          filter.endDate
        );

        if (response.status === 'success' && response.data) {
          // Since we can't access chart properties directly on response.data,
          // we need to cast it to the expected structure or transform it
          // For now, let's assume the API response data structure matches what we need
          try {
            const transformedData: FilterDataStructure = response.data as unknown as FilterDataStructure;
            newMultiFilterData[filter.id] = transformedData;
          } catch (error) {
            console.error('Error transforming data for filter:', filter.id, error);
            // Provide empty structure as fallback
            newMultiFilterData[filter.id] = {
              daily_peak: { result: [] },
              weekly_peak: { result: [] },
              daily_profile_max: { result: [] },
              daily_profile_mean: { result: [] },
              load_continuity: { result: [] },
              long_term: { result: [] }
            };
          }
        }
      }

      setMultiFilterData(newMultiFilterData);
    } catch (error) {
      console.error('❌ Multi-filter API call failed:', error);
      setError('خطا در بارگذاری داده‌های چندگانه');
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
            {companyType === 'private' ? 'تحلیل مصرف انرژی' : 'تحلیل مصرف انرژی'}
          </h1>
          <p className="text-gray-600">
            {companyType === 'private' 
              ? `بررسی و تحلیل جامع عملکرد شرکت ${company || ''}` 
              : `بررسی و تحلیل جامع عملکرد شرکت ${company || ''}`
            }
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-700">نحوه استفاده</span>
            </div>
            <p className="text-sm text-blue-700 mt-2">
              برای مقایسه داده‌ها در بازه‌های زمانی مختلف، روی دکمه شناور فیلتر (پایین سمت چپ) کلیک کنید.
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

          <div className={`grid grid-cols-1 sm:grid-cols-2 ${companyType === 'private' ? 'lg:grid-cols-4' : 'lg:grid-cols-6'} gap-4`}>
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
        title={companyType === 'private' ? "فیلترهای پیشرفته مصرف برق" : "فیلترهای پیشرفته تحلیل فیدر"}
        supportedAnalyses={['feeder']}
      />

      {/* <FullScreenChart
        isOpen={fullScreenChart.isOpen}
        onClose={fullScreenChart.closeFullScreen}
        chartData={fullScreenChart.chartData}
        chartType={fullScreenChart.chartType}
        title={fullScreenChart.title}
        description={fullScreenChart.description}
      /> */}
    </div>
  );
}
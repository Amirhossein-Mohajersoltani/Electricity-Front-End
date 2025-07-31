// src/pages/EnergyComparison.tsx
import { useState } from "react";
import EnergyComparisonChart from "../components/charts/EnergyComparisonChart"
// import { FullScreenChart } from "../components/charts/FullScreenChart"
import DynamicFilterPanel from "../components/DynamicFilterPanel"
import FloatingFilterButton from "../components/FloatingFilterButton"
import MultiFilterEnergyChart from "../components/charts/MultiFilterEnergyChart"
import { apiService } from "../services/api"
// import { useFullScreenChart } from "../hooks/useFullScreenChart"
import { useAuth } from "../context/AuthContext"

interface FilterData {
  startDate: string;
  endDate: string;
  regions: string[];
  feeders: string[];
}

interface EnergyData {
  compare_energetic?: {
    result?: any[];
  };
  comparison_result?: {
    result?: any[];
  };
  weekly_peak?: {
    result?: any[];
  };
  daily_peak?: any[];
  feeder_comparison?: any[];
}

interface DynamicFilterData {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  regions: string[];
  feeders: string[];
  color: string;
}

interface MultiFilterEnergyData {
  [filterId: string]: EnergyData;
}

const EnergyComparison = () => {
  const { companyType } = useAuth();
  const [loading, setLoading] = useState(false);
  const [energyData, setEnergyData] = useState<EnergyData | null>(null);
  const [error, setError] = useState('');
  // const fullScreenChart = useFullScreenChart();

  // Dynamic filter system states
  const [dynamicFilters, setDynamicFilters] = useState<DynamicFilterData[]>([]);
  const [multiFilterData, setMultiFilterData] = useState<MultiFilterEnergyData>({});
  const [showDynamicFilters, setShowDynamicFilters] = useState(false);
  const [useDynamicFilters, setUseDynamicFilters] = useState(false);

  const handleMaximize = () => {
    if (!energyData || !energyData.compare_energetic) {
      console.warn('EnergyComparison: No energy data available for full screen');
      return;
    }
    
    // Convert energy data to Chart.js format for FullScreenChart
    let chartData: any = { labels: [], datasets: [] };
    
    if (energyData.compare_energetic.result && Array.isArray(energyData.compare_energetic.result)) {
      const labels = energyData.compare_energetic.result.map((item: any, index: number) => 
        item.num_fidder ? `فیدر ${item.num_fidder}` : 
        item.year ? `سال ${item.year}` : 
        item.section || `مورد ${index + 1}`
      );
      
      const data = energyData.compare_energetic.result.map((item: any) => 
        item.energetic || item.amount || item.consumption || 0
      );
      
      chartData = {
        labels,
        datasets: [{
          label: 'مصرف انرژی',
          data,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 20,
          borderRadius: 20,
        }]
      };
    }
    
    console.log('📊 EnergyComparison handleMaximize:', {
      originalData: energyData,
      processedChartData: chartData
    });
    
    // fullScreenChart.openFullScreen(
    //   chartData,
    //   'bar',
    //   'مقایسه انرژی',
    //   'مقایسه مصرف انرژی در بازه‌های زمانی مختلف'
    // );
  };

  // Dynamic filter functions
  const handleDynamicFilters = async (filters: DynamicFilterData[]) => {
    setDynamicFilters(filters);
    setUseDynamicFilters(true);
    setLoading(true);
    setError('');

    try {
      const newMultiFilterData: MultiFilterEnergyData = {};
      
      // Process each filter
      for (const filter of filters) {
        console.log('🔄 Processing dynamic filter:', filter.name);
        
        // Extract years from the date range
        const startYear = filter.startDate.split('-')[0];
        const endYear = filter.endDate.split('-')[0];
        const years = startYear === endYear ? [startYear] : [startYear, endYear];
        
        // Prepare data based on company type
        let feedersToSend: string[] = [];
        let regionsToSend: string[] = [];
        
        if (companyType === 'private') {
          feedersToSend = ['1'];
          regionsToSend = ['1'];
        } else {
          feedersToSend = filter.feeders.length > 0 ? filter.feeders : [];
          regionsToSend = filter.regions;
        }
        
        const response = await apiService.getEnergyComparisonByYears(
          years,
          regionsToSend,
          feedersToSend
        );
        
        if (response.status === 'success' && response.data) {
          newMultiFilterData[filter.id] = {
            compare_energetic: response.data.energy_comparison || response.data
          };
        }
      }
      
      setMultiFilterData(newMultiFilterData);
      console.log('✅ Multi-filter energy data loaded successfully');
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
    setEnergyData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 lg:p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">مقایسه انرژی</h1>
          <p className="text-gray-600">مقایسه مصرف انرژی در بازه‌های زمانی مختلف</p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-700">نحوه استفاده</span>
            </div>
            <p className="text-sm text-blue-700 mt-2">
              برای مقایسه داده‌ها در بازه‌های زمانی مختلف، روی دکمه شناور فیلتر (پایین سمت چپ) کلیک کنید و فیلترهای مختلف ایجاد کنید.
            </p>
          </div>
        </div>

        {/* Chart Section - Full Width */}
        <div className="w-full">
          
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-center">{error}</p>
              <p className="text-red-500 text-xs mt-2 text-center">
                برای اطلاعات بیشتر، کنسول مرورگر را بررسی کنید
              </p>
            </div>
          )}

          {/* Loading State */}
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

          {/* No Data State */}
          {!loading && !error && !energyData && !useDynamicFilters && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-center items-center h-80 lg:h-96">
                <div className="text-center p-8">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 1-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">آماده برای مقایسه انرژی</h3>
                  <p className="text-gray-500 text-center max-w-md">
                    برای شروع مقایسه، روی دکمه شناور فیلتر کلیک کنید و فیلترهای مختلف ایجاد کنید
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Multi-Filter Chart - Show when using dynamic filters */}
          {useDynamicFilters && dynamicFilters.length > 0 && Object.keys(multiFilterData).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">مقایسه چندگانه انرژی</h2>
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
              <div className="h-96 lg:h-[500px] ">
                <MultiFilterEnergyChart
                  multiData={multiFilterData}
                  filters={dynamicFilters}
                  loading={loading}
                  title="مقایسه انرژی"
                />
              </div>
            </div>
          )}

          {/* Single Chart Container - Show when not using dynamic filters */}
          {!useDynamicFilters && !loading && !error && energyData && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 ">
              <div className="relative h-96 lg:h-[500px] ">
                <EnergyComparisonChart 
                  data={energyData} 
                  loading={false} 
                  onMaximize={handleMaximize} 
                />
              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* Floating Filter Button */}
      <FloatingFilterButton
        onClick={() => setShowDynamicFilters(true)}
        activeFiltersCount={dynamicFilters.length}
      />

      {/* Dynamic Filter Panel */}
      <DynamicFilterPanel
        isOpen={showDynamicFilters}
        onClose={() => setShowDynamicFilters(false)}
        onApplyFilters={handleDynamicFilters}
        title="فیلترهای پیشرفته مقایسه انرژی"
        supportedAnalyses={['energy']}
      />

     
    </div>
  )
}

export default EnergyComparison;

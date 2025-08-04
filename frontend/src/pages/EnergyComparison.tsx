import { useState } from "react";
import DynamicFilterPanel from "../components/DynamicFilterPanel";
import type { FilterData } from "../components/DynamicFilterPanel"
import FloatingFilterButton from "../components/FloatingFilterButton";
import MultiFilterEnergyChart from "../components/charts/MultiFilterEnergyChart";
import { apiService } from "../services/api";
import type { EnergyComparisonRequest, EnergyComparisonResponseDataItem } from "../types/api.interfaces";
import { useAuth } from "../context/AuthContext";

// --- CHANGED: Redefine the data structure to match what the chart expects ---
// This interface now represents the full API response object for a single filter.
interface ApiDataForChart {
  data: {
    energy_comparison: {
      result: EnergyComparisonResponseDataItem[];
    };
  };
  // You can add status, message, etc. if needed elsewhere
}

// The main state will hold a map from filterId to the full response object.
interface MultiFilterEnergyData {
  [filterId: string]: ApiDataForChart;
}
// ---

const EnergyComparison = () => {
  useAuth();
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
        // This part for creating the payload is correct and unchanged
        if (!filter.startDate || !filter.endDate) {
          return null;
        }
        const startYear = filter.startDate.substring(0, 4);
        const endYear = filter.endDate.substring(0, 4);
        const years = Array.from(new Set([startYear, endYear]));

        const apiPayload: EnergyComparisonRequest = {
          start_date: filter.startDate,
          end_date: filter.endDate,
          region_code: filter.regions.map(r => String(r)),
          fidder_code: filter.feeders,
          period: filter.period || 'monthly',
          costume_period: filter.costume_period || null,
          years: years,
        };
        
        const response = await apiService.getEnergyComparison(apiPayload);
        
        // --- CHANGED: Instead of returning just the result array, return the whole response ---
        if (response.status === 'success' && response.data?.energy_comparison) {
          // We pass the entire response object forward
          return { id: filter.id, fullResponse: response };
        }
        
        return null;
      });

      const results = await Promise.all(promises);
      
      // --- CHANGED: The reducer now assembles the state with the full response objects ---
      const newMultiFilterData = results.reduce<MultiFilterEnergyData>((acc, result) => {
        if (result) {
          // Store the entire response object, not just a part of it
          acc[result.id] = result.fullResponse;
        }
        return acc;
      }, {});

      setMultiFilterData(newMultiFilterData);

      if (Object.keys(newMultiFilterData).length === 0) {
        setError('هیچ داده‌ای برای فیلترهای انتخاب شده یافت نشد.');
      }
    } catch (err) {
      console.error('❌ Multi-filter API call failed:', err);
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری داده‌های چندگانه');
      setMultiFilterData({});
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setDynamicFilters([]);
    setMultiFilterData({});
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 lg:p-6">
      <div className="max-w-full mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">مقایسه مصرف انرژی</h1>
          <p className="text-gray-600">مقایسه مصرف انرژی در بازه‌های زمانی مختلف</p>
        </div>

        <div className="w-full">
          {error && !loading && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          )}

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

          {!loading && !error && (
            dynamicFilters.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">مقایسه چندگانه انرژی</h2>
                    <p className="text-gray-600 mt-1">مقایسه {dynamicFilters.length} فیلتر مختلف</p>
                  </div>
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    بازگشت به حالت اولیه
                  </button>
                </div>
                <div className="h-96 lg:h-[500px]">
                  {/* This component call is now correct because multiFilterData has the right type */}
                  <MultiFilterEnergyChart
                    multiData={multiFilterData}
                    filters={dynamicFilters}
                    loading={loading}
                    title="مقایسه انرژی"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">آماده برای مقایسه انرژی</h3>
                <p className="text-gray-500">برای شروع، از دکمه فیلتر برای اضافه کردن بازه‌های زمانی استفاده کنید.</p>
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
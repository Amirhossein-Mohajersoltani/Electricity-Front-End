import React, { useState, useMemo, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type {
  DailyPeakResult,
  WeeklyPeakResult,
  DailyProfileResult,
  LongTermResult,
  MultiFilterChartProps,
  LoadContinuityValueItem,
} from "@/types/filterInterfaces";

interface CustomBrushHandleProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

interface ChartDataPoint {
  key: string;
  value: number;
  resultIndex?: number;
  originalData?: unknown;
  source?: string;
}
const defaultColors = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042"
];

const CustomBrushHandle = ({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
}: CustomBrushHandleProps) => {
  const handleColor = "#3b82f6";
  const handleWidth = 14;
  const handleHeight = 38;
  const handleX = x + (width - handleWidth) / 2;
  const handleY = y + (height - handleHeight) / 2;
  return (
    <g
      transform={`translate(${handleX}, ${handleY})`}
      style={{ filter: "drop-shadow(0 1px 3px rgba(0, 0, 0, 0.15))" }}
    >
      <rect
        x={0}
        y={0}
        width={handleWidth}
        height={handleHeight}
        fill={handleColor}
        rx="6"
        style={{ cursor: "ew-resize" }}
      />
      <line
        x1={4}
        y1={handleHeight / 2 - 5}
        x2={handleWidth - 4}
        y2={handleHeight / 2 - 5}
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1={4}
        y1={handleHeight / 2}
        x2={handleWidth - 4}
        y2={handleHeight / 2}
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1={4}
        y1={handleHeight / 2 + 5}
        x2={handleWidth - 4}
        y2={handleHeight / 2 + 5}
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </g>
  );
};

const MultiFilterChart: React.FC<MultiFilterChartProps> = ({
  multiData,
  filters,
  chartType,
  loading = false,
  title = "مقایسه چندگانه",
  parallelMode = false,
  company = "",
}) => {
  const [loadContinuityLimit, setLoadContinuityLimit] = useState<string>("100");

  const chartData = useMemo(() => {
    const dataMap = new Map<string, Record<string, unknown>>();
    
    for (const key of Object.keys(multiData)) {
      const filterData = multiData[key];
      if (!filterData) {
        console.warn(`⚠️ No data found for filter: ${key} (${key})`);
        return;
      }

      let extractedPoints: ChartDataPoint[] = [];

      try {
        switch (chartType) {
          case "daily_peak": {
            const dailyPeakData = filterData.daily_peak;
            if (dailyPeakData?.result && Array.isArray(dailyPeakData.result)) {
              extractedPoints = dailyPeakData.result.map(
                (item: DailyPeakResult, index: number): ChartDataPoint => ({
                  key: parallelMode ? `روز ${index + 1}` : item.date,
                  value: item.amount || 0,
                })
              );
            }
            break;
          }

          case "weekly_peak": {
            const weeklyPeakData = filterData.weekly_peak;
            if (weeklyPeakData?.result && Array.isArray(weeklyPeakData.result)) {
              extractedPoints = weeklyPeakData.result.map(
                (item: WeeklyPeakResult, index: number): ChartDataPoint => ({
                  key: parallelMode
                    ? `هفته ${index + 1}`
                    : `هفته ${item.num_week}`,
                  value: item.max_week || 0,
                })
              );
            }
            break;
          }

          case "daily_profile_max": {
            const dailyProfileMaxData = filterData.daily_profile_max;
            if (dailyProfileMaxData?.result && Array.isArray(dailyProfileMaxData.result)) {
              extractedPoints = dailyProfileMaxData.result.map(
                (item: DailyProfileResult): ChartDataPoint => ({
                  key: item.hour?.replace("H", "") || "",
                  value: item.amount || 0,
                })
              );
            }
            break;
          }
          case "daily_profile_mean": {
            const dailyProfileMeanData = filterData.daily_profile_mean;
            if (dailyProfileMeanData?.result && Array.isArray(dailyProfileMeanData.result)) {
              extractedPoints = dailyProfileMeanData.result.map(
                (item: DailyProfileResult): ChartDataPoint => ({
                  key: item.hour?.replace("H", "") || "",
                  value: item.amount || 0,
                })
              );
            }
            break;
          }

          case "load_continuity": {
            // Handle both possible naming conventions
            const loadContinuityData = filterData.load_continuity || filterData.Load_continuity;
            
            if (!loadContinuityData || !loadContinuityData.result || !Array.isArray(loadContinuityData.result)) {
              console.warn(`⚠️ No load continuity data for filter: ${key}`);
              break;
            }

            let chartPoints: ChartDataPoint[] = [];
            
            loadContinuityData.result.forEach((resultItem) => {
              if (resultItem.sort_value && Array.isArray(resultItem.sort_value)) {
                const sortValues = resultItem.sort_value.map(
                  (valueItem, index): ChartDataPoint => {
                    let finalValue = 0;
                    
                    // Handle both object and number formats
                    if (typeof valueItem === "object" && valueItem !== null) {
                      const objValue = valueItem as LoadContinuityValueItem;
                      finalValue = objValue.value !== undefined ? Number(objValue.value) : 0;
                    } else {
                      finalValue = Number(valueItem);
                    }

                    return {
                      key: parallelMode ? `${index + 1}` : `${index}`,
                      value: !isNaN(finalValue) ? finalValue : 0,
                    };
                  }
                );
                chartPoints = [...chartPoints, ...sortValues];
              }
            });

            const validData = chartPoints.filter(
              (item) => item.value != null && !isNaN(Number(item.value))
            );

            // Apply limit
            const limit = parseInt(loadContinuityLimit, 10) || 100;
            extractedPoints = validData.slice(0, limit);
            break;
          }

          case "long_term": {
            const longTermData = filterData.long_term;
            if (longTermData?.result && Array.isArray(longTermData.result)) {
              extractedPoints = longTermData.result.map(
                (item: LongTermResult, index: number): ChartDataPoint => ({
                  key: parallelMode ? `هفته ${index + 1}` : `هفته ${item.week}`,
                  value: item.amount || 0,
                })
              );
            }
            break;
          }

          default:
            console.warn(`⚠️ Unknown chart type: ${chartType}`);
            break;
        }
      } catch (error) {
        console.error(`❌ Error processing ${chartType} data for filter ${key}:`, error);
      }

      // Add extracted points to the data map
      extractedPoints.forEach((point) => {
        if (!dataMap.has(point.key)) {
          dataMap.set(point.key, { key: point.key });
        }
        const existing = dataMap.get(point.key);
        if (existing) {
          existing[key] = point.value;
        }
      });
    }

    const result = Array.from(dataMap.values());
    console.log(`📊 Chart data for ${chartType}:`, result.length, 'points');
    return result;
  }, [multiData, filters, chartType, parallelMode, loadContinuityLimit]);

  const yAxisRange = useMemo(() => {
    if (chartData.length === 0) return { min: 0, max: 100 };

    let overallMin = Infinity;
    let overallMax = -Infinity;

    chartData.forEach((dataPoint) => {
    Object.keys(multiData).forEach((key) => {
      const value = dataPoint[key] as number;
      if (typeof value === "number" && !isNaN(value)) {
        if (value < overallMin) overallMin = value;
        if (value > overallMax) overallMax = value;
      }
    });
  });

    if (overallMin === Infinity) return { min: 0, max: 100 };

    const padding = (overallMax - overallMin) * 0.1;
    const finalMin = Math.floor(overallMin - padding);
    const finalMax = Math.ceil(overallMax + padding);

    return { min: Math.max(0, finalMin), max: finalMax > 0 ? finalMax : 100 };
  }, [chartData, filters]);

  const [yDomain, setYDomain] = useState<[number | "auto", number | "auto"]>([
    "auto",
    "auto",
  ]);
  const [tempYDomain, setTempYDomain] = useState<{ min: string; max: string }>({
    min: "",
    max: "",
  });

  useEffect(() => {
    setYDomain(["auto", "auto"]);
    setTempYDomain({ min: "", max: "" });
    setLoadContinuityLimit("100");
  }, [chartType, filters]);

  const handleYDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTempYDomain((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyYDomain = () => {
    const newMin = tempYDomain.min === "" ? "auto" : Number(tempYDomain.min);
    const newMax = tempYDomain.max === "" ? "auto" : Number(tempYDomain.max);
    
    if (
      typeof newMin === "number" &&
      typeof newMax === "number" &&
      newMin >= newMax
    ) {
      alert("مقدار حداقل باید کمتر از حداکثر باشد.");
      return;
    }
    setYDomain([newMin, newMax]);
  };

  const handleResetYDomain = () => {
    setYDomain(["auto", "auto"]);
    setTempYDomain({ min: "", max: "" });
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(chartData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ChartData");
    const fileName = `${chartType}_data_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, fileName);
  };

  const getXAxisLabel = (): string => {
    switch (chartType) {
      case "daily_peak":
        return "تاریخ";
      case "weekly_peak":
        return "هفته";
      case "daily_profile_max":
      case "daily_profile_mean":
        return "ساعت";
      case "load_continuity":
        return "ساعت";
      case "long_term":
        return "هفته";
      default:
        return "زمان";
    }
  };

  const getYAxisLabel = (): string => {
    const unit = company === "private" ? "kW" : company === "public" ? "MW" : "kW";
    return `توان (${unit})`;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 bg-gray-50 rounded-lg">
        <svg
          className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="mt-4 text-gray-700 font-semibold">
          ...در حال بارگذاری داده‌ها
        </p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-semibold text-gray-800">
          داده‌ای برای نمایش وجود ندارد
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          لطفا فیلترهای خود را بررسی کنید یا محدوده زمانی دیگری را انتخاب
          نمایید.
        </p>
      </div>
    );
  }

  const brushLine = Object.keys(multiData).length > 0 ? Object.keys(multiData)[0] : "";


  return (
    <div className="w-full bg-white p-6 sm:p-6 rounded-2xl shadow-lg border border-gray-200/80">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">
            مقایسه {Object.keys(multiData).length} فیلتر مختلف
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {chartType === "load_continuity" && (
            <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-lg">
              <input
                type="number"
                value={loadContinuityLimit}
                onChange={(e) => setLoadContinuityLimit(e.target.value)}
                placeholder="تعداد نقاط"
                className="w-24 p-1.5 border border-gray-300 rounded-md text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                title="حداکثر تعداد نقاط برای نمایش در نمودار تداوم بار"
              />
              <label className="text-sm text-gray-600 pr-1">نقطه</label>
            </div>
          )}

          <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-lg">
            <input
              type="number"
              name="max"
              value={tempYDomain.max}
              onChange={handleYDomainChange}
              placeholder={`بالا: ${yAxisRange.max}`}
              className="w-24 p-1.5 border border-gray-300 rounded-md text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              title="مقدار حداکثر محور Y"
            />
            <input
              type="number"
              name="min"
              value={tempYDomain.min}
              onChange={handleYDomainChange}
              placeholder={`پایین: ${yAxisRange.min}`}
              className="w-24 p-1.5 border border-gray-300 rounded-md text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              title="مقدار حداقل محور Y"
            />
            <button
              onClick={handleApplyYDomain}
              className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              title="اعمال محدوده"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              onClick={handleResetYDomain}
              className="p-1.5 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              title="ریست کردن محدوده"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5"
                />
              </svg>
            </button>
          </div>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 transition-all shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
              <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
            </svg>
            اکسل
          </button>
        </div>
      </div>

      <div className="w-full h-[400px] ">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="key"
              tick={{
                fontSize: 12,
                fontFamily: "Dana, sans-serif",
                fill: "#6b7280",
              }}
              label={{
                value: getXAxisLabel(),
                position: "insideBottom",
                offset: -30,
                fontFamily: "Dana, sans-serif",
                fontSize: 14,
                fontWeight: "bold",
                fill: "#374151",
              }}
              tickMargin={15}
              axisLine={{ stroke: "#d1d5db" }}
              tickLine={{ stroke: "#d1d5db" }}
            />
            <YAxis
              tick={{
                fontSize: 12,
                fontFamily: "Dana, sans-serif",
                fill: "#6b7280",
              }}
              label={{
                value: getYAxisLabel(),
                angle: -90,
                position: "insideLeft",
                offset: -10,
                fontFamily: "Dana, sans-serif",
                fontSize: 14,
                fontWeight: "bold",
                fill: "#374151",
              }}
              tickMargin={30}
              domain={yDomain}
              allowDataOverflow={true}
              axisLine={{ stroke: "#d1d5db" }}
              tickLine={{ stroke: "#d1d5db" }}
            />
            <Tooltip
              contentStyle={{
                fontFamily: "Dana, sans-serif",
                borderRadius: "0.75rem",
                boxShadow:
                  "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                border: "1px solid #e5e7eb",
              }}
            />
            <Legend
              wrapperStyle={{
                bottom: 10,
                fontFamily: "Dana, sans-serif",
                fontSize: "14px",
              }}
            />

            {Object.keys(multiData).map((key, index) => {
            const filter = filters.find(f => f.id === key);
            const strokeColor = filter?.color || defaultColors[index % defaultColors.length];
            return (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={filter?.name || key}
                stroke={strokeColor}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 7, strokeWidth: 2, stroke: "#ffffff" }}
                connectNulls={false}
              />
            );
          })}

            <Brush
              dataKey="key"
              height={40}
              stroke="#e5e7eb"
              fill="#f9fafb"
              y={330}
              traveller={<CustomBrushHandle />}
            >
              <LineChart>
                {brushLine && (
                  <Line
                    dataKey={brushLine}
                    type="monotone"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                )}
              </LineChart>
            </Brush>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MultiFilterChart;
// **ConsumptionLimitationFilter , ConsumptionLimitation page **

// filter data structure
export interface ConsumptionLimitationFilterData {
  fidder_code: string[];
  region_code: string[];
  no_limitation_start_date: string;
  no_limitation_end_date: string;
  limitation_start_date: string;
  limitation_end_date: string;
}
// component input
export interface ConsumptionLimitationFilterProps {
  onFilter: (data: ConsumptionLimitationFilterData) => void;
  loading?: boolean;
}

// ** DynamicFilterPanel **

// structure of a filter
export interface FilterData {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  regions: (string | number)[];
  feeders: string[];
  color: string;
  period?: string;
  costume_period?: string;
}
// props of component input
export interface DynamicFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterData[]) => void;
  title?: string;
  supportedAnalyses?: string[];
}
// ** ConsumptionLimitation page **

// structure or model of dynamic filter
export interface DynamicFilterData {
  id: string;
  name: string;
  regions: string[];
  feeders: string[];
  startDate: string;
  endDate: string;
}

// ** Feeder Analysis page **

// use in tariffShare page & feeder analysis
export interface DynamicFilterData {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  regions: string[];
  feeders: string[];
  color: string;
} 

// Define types that exactly match what MultiFilterChart expects
export interface DailyPeakResult {
  date: string;
  amount: number;
}

// 
export interface FilterDataStructure {
  daily_peak?: { result?: DailyPeakResult[] };
  weekly_peak?: { result?: DailyPeakResult[] };
  daily_profile_max?: { result?: DailyPeakResult[] };
  daily_profile_mean?: { result?: DailyPeakResult[] };
  load_continuity?: { result?: DailyPeakResult[] };
  long_term?: { result?: DailyPeakResult[] };
}
// 
export interface MultiFilterAnalysisData {
  [filterId: string]: FilterDataStructure;
}

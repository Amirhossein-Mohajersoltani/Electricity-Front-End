
// ** ConsumptionLimitationChart **

// Structure of data from Api
// and ConsumptionLimitation page
export interface ConsumptionLimitationItem {
  'start date limit': string;
  'end date limit': string;
  'start date no limit': string;
  'end date no limit': string;
  'feeder code'?: number;
  'consumption reduction factor': number;
}

// component input specification
export interface ConsumptionLimitationChartProps {
  data: any;
  loading?: boolean;
  onMaximize?: () => void;
  filterInfo?: any;
}
//  --------------------------------------------------------------------------------------------
//** EnergyComparisonChart **/

// component input specification
export interface EnergyComparisonChartProps {
  data?: {
    energy_comparison?: {
      result?: Array<{
        energetic: number;
        num_fidder: number;
        year: number;
      }>;
    };
  };
  loading?: boolean;
  onMaximize?: () => void;
}

//structure of chart items
export interface ChartDataPoint {
  name: string;
  value: number;
  year: number;
  feeder: number;
}

//  --------------------------------------------------------------------------------------------
 
//  ** FullScreenChart **

//Receiving data and settings from outside into the main component
export interface FullScreenChartProps {
  isOpen: boolean;
  onClose: () => void;
  chartData: any;
  chartType: 'area' | 'line' | 'bar' | 'pie';
  title: string;
  description?: string;
}

// Displaying design tools in the toolbar and configuring their appearance
export interface DrawingTool {
  id: string;
  name: string;
  icon: React.ReactNode;
  cursor: string;
}

// Storing the data of each shape drawn on the canvas
export interface DrawnElement {
  id: string;
  type: string;
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
  color: string;
  width: number;
  text?: string;
  points?: { x: number; y: number }[];
}

// Custom tooltip structure for displaying data point information
export interface DetailedTooltip {
  visible: boolean;
  x: number;
  y: number;
  data: {
    label: string;
    value: number;
    index: number;
    percentage?: number;
    additionalInfo?: string;
  } | null;
}
//  --------------------------------------------------------------------------------------------

// ** MMultifilterEnergyChart **

//Data for final chart rendering
export interface ProcessedChartData {
  period_label: string;
  [filterId: string]: string | number; // Allows for dynamic filter IDs
}
//  --------------------------------------------------------------------------------------------

// ** MultiFilterChart **

//Filter details (name, color, type)
export interface FilterData {
  id: string;
  name: string;
  color: string;
  type?: 'public' | 'private';
}

// Daily peak results
export interface DailyPeakResult {
  date: string;
  amount: number;
}

//Weekly peak results
export interface WeeklyPeakResult {
  num_week: number;
  max_week: number;
}

//Hourly profile results
export interface DailyProfileResult {
  hour: string;
  amount: number;
}

//Load duration curve results
export interface LoadContinuityResult {
  sort_value?: (number | { value?: number; amount?: number; power?: number })[];
  data?: number[];
  values?: number[];
  amounts?: number[];
  load_data?: number[];
  load_values?: number[];
  continuity_data?: number[];
  power_data?: number[];
  consumption_data?: number[];
  [key: string]: unknown;
}

//Long-term analysis results
export interface LongTermResult {
  'start date': string;
  'end date': string;
  week: number;
  amount: number;
}

//Data structure related to each filter
export interface FilterDataStructure {
  daily_peak?: {
    result?: DailyPeakResult[];
  };
  weekly_peak?: {
    result?: WeeklyPeakResult[];
  };
  daily_profil_max?: {
    result?: DailyProfileResult[];
  };
  daily_profil_mean?: {
    result?: DailyProfileResult[];
  };
  load_continuity?: {
    result?: LoadContinuityResult[];
    data?: number[];
  };
  Load_continuity?: {
    result?: LoadContinuityResult[];
    data?: number[];
  };
  long_term?: {
    result?: LongTermResult[];
    status?: string;
    region_code?: number[];
    fidder_code?: number[];
  };
  [key: string]: unknown;
}

//Chart component inputs
export interface MultiFilterChartProps {
  multiData: { [filterId: string]: FilterDataStructure };
  filters: FilterData[];
  chartType:
  | 'daily_peak'
  | 'weekly_peak'
  | 'daily_profile_max'
  | 'daily_profile_mean'
  | 'load_continuity'
  | 'long_term';
  loading?: boolean;
  title?: string;
  parallelMode?: boolean;
  company: string | null;
}

//Appearance settings of the handle for the Brush
export interface CustomBrushHandleProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}
//  --------------------------------------------------------------------------------------------
// ** MultiFilterEnergyChart **

//"Defining the structure of each data item received from the API"
export interface ResultItem {
  energetic: number;
  'fidder code': number;
  period_end: string;
  period_start: string;
  period_num: number;
}

// It models the overall data structure returned by the API.
export interface ApiData {
  data: {
    energy_comparison: {
      result: ResultItem[];
    };
  };
}

// It defines the data structure related to the filters used in the chart.
export interface FilterData {
  id: string;
  name: string;
  color: string;
}

//It specifies the structure of the props that the MultiFilterEnergyChart component receives.
export interface MultiFilterEnergyChartProps {
  multiData: Record<string, ApiData>;
  filters: FilterData[];
  loading?: boolean;
  title?: string;
}
//  --------------------------------------------------------------------------------------------


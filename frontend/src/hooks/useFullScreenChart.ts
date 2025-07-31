// import { useState } from 'react';

// interface FullScreenChartState {
//   isOpen: boolean;
//   chartData: any;
//   chartType: 'area' | 'line' | 'bar' | 'pie';
//   title: string;
//   description?: string;
// }

// export function useFullScreenChart() {
//   const [state, setState] = useState<FullScreenChartState>({
//     isOpen: false,
//     chartData: null,
//     chartType: 'area',
//     title: '',
//     description: ''
//   });

//   const openFullScreen = (
//     chartData: any, 
//     chartType: 'area' | 'line' | 'bar' | 'pie', 
//     title: string, 
//     description?: string
//   ) => {
//     console.log('🔍 useFullScreenChart openFullScreen called with:', {
//       chartData,
//       chartType,
//       title,
//       description,
//       chartDataIsArray: Array.isArray(chartData),
//       chartDataLength: Array.isArray(chartData) ? chartData.length : 'N/A'
//     });
    
//     setState({
//       isOpen: true,
//       chartData,
//       chartType,
//       title,
//       description
//     });
//   };

//   const closeFullScreen = () => {
//     setState(prev => ({ ...prev, isOpen: false }));
//   };

//   return {
//     ...state,
//     openFullScreen,
//     closeFullScreen
//   };
// } 
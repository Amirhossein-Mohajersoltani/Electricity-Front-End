import React, { useState, useRef, useEffect } from 'react';
import { X, Maximize2, Minimize2, Pencil, Ruler, Square, Circle, Type, Eraser, Undo, Redo, Move, ZoomIn, ZoomOut } from 'lucide-react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  BarController,
  PieController
} from 'chart.js';

import type { ChartOptions, InteractionItem, ChartEvent } from 'chart.js';
import { Chart, } from 'react-chartjs-2';
import type { FullScreenChartProps, DrawingTool,DrawnElement,DetailedTooltip } from '@/types/chartInterfaces';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  BarController,
  PieController
);



const drawingTools: DrawingTool[] = [
  { id: 'move', name: 'حرکت', icon: <Move className="w-4 h-4" />, cursor: 'move' },
  { id: 'pencil', name: 'مداد آزاد', icon: <Pencil className="w-4 h-4" />, cursor: 'crosshair' },
  { id: 'line', name: 'خط مستقیم', icon: <Ruler className="w-4 h-4" />, cursor: 'crosshair' },
  { id: 'rectangle', name: 'مستطیل', icon: <Square className="w-4 h-4" />, cursor: 'crosshair' },
  { id: 'circle', name: 'دایره', icon: <Circle className="w-4 h-4" />, cursor: 'crosshair' },
  { id: 'text', name: 'متن', icon: <Type className="w-4 h-4" />, cursor: 'text' },
  { id: 'eraser', name: 'پاک کن', icon: <Eraser className="w-4 h-4" />, cursor: 'grab' },
];

const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB'];

export function FullScreenChart({ isOpen, onClose, chartData, chartType, title, description }: FullScreenChartProps) {
  const [selectedTool, setSelectedTool] = useState<string>('move');
  const [selectedColor, setSelectedColor] = useState<string>('#FF0000');
  const [lineWidth, setLineWidth] = useState<number>(2);
  const [drawnElements, setDrawnElements] = useState<DrawnElement[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentElement, setCurrentElement] = useState<DrawnElement | null>(null);
  const [history, setHistory] = useState<DrawnElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [tooltip, setTooltip] = useState<DetailedTooltip>({ visible: false, x: 0, y: 0, data: null });
  const [zoom, setZoom] = useState<number>(1);
  
  // State for crosshair
  const [crosshair, setCrosshair] = useState<{
    visible: boolean;
    x: number;
    y: number;
  }>({
    visible: false,
    x: 0,
    y: 0
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ChartJS>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    redrawCanvas();
  }, [drawnElements, currentElement, zoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isOpen]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Don't scale the canvas context - keep 1:1 pixel mapping
    // Elements are already stored in screen coordinates

    drawnElements.forEach(element => {
      ctx.strokeStyle = element.color;
      ctx.fillStyle = element.color;
      ctx.lineWidth = element.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      switch (element.type) {
        case 'pencil':
          if (element.points && element.points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(element.points[0].x, element.points[0].y);
            for (let i = 1; i < element.points.length; i++) {
              ctx.lineTo(element.points[i].x, element.points[i].y);
            }
            ctx.stroke();
          }
          break;
        case 'line':
          ctx.beginPath();
          ctx.moveTo(element.startX, element.startY);
          ctx.lineTo(element.endX || element.startX, element.endY || element.startY);
          ctx.stroke();
          break;
        case 'rectangle':
          const width = (element.endX || element.startX) - element.startX;
          const height = (element.endY || element.startY) - element.startY;
          ctx.strokeRect(element.startX, element.startY, width, height);
          break;
        case 'circle':
          const radius = Math.sqrt(
            Math.pow((element.endX || element.startX) - element.startX, 2) +
            Math.pow((element.endY || element.startY) - element.startY, 2)
          );
          ctx.beginPath();
          ctx.arc(element.startX, element.startY, radius, 0, 2 * Math.PI);
          ctx.stroke();
          break;
        case 'text':
          ctx.font = `${element.width * 8}px Arial`;
          ctx.fillText(element.text || '', element.startX, element.startY);
          break;
      }
    });

    // Render current element being drawn
    if (currentElement) {
      ctx.strokeStyle = currentElement.color;
      ctx.fillStyle = currentElement.color;
      ctx.lineWidth = currentElement.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      switch (currentElement.type) {
        case 'pencil':
          if (currentElement.points && currentElement.points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(currentElement.points[0].x, currentElement.points[0].y);
            for (let i = 1; i < currentElement.points.length; i++) {
              ctx.lineTo(currentElement.points[i].x, currentElement.points[i].y);
            }
            ctx.stroke();
          }
          break;
        case 'line':
          ctx.beginPath();
          ctx.moveTo(currentElement.startX, currentElement.startY);
          ctx.lineTo(currentElement.endX || currentElement.startX, currentElement.endY || currentElement.startY);
          ctx.stroke();
          break;
        case 'rectangle':
          const width = (currentElement.endX || currentElement.startX) - currentElement.startX;
          const height = (currentElement.endY || currentElement.startY) - currentElement.startY;
          ctx.strokeRect(currentElement.startX, currentElement.startY, width, height);
          break;
        case 'circle':
          const radius = Math.sqrt(
            Math.pow((currentElement.endX || currentElement.startX) - currentElement.startX, 2) +
            Math.pow((currentElement.endY || currentElement.startY) - currentElement.startY, 2)
          );
          ctx.beginPath();
          ctx.arc(currentElement.startX, currentElement.startY, radius, 0, 2 * Math.PI);
          ctx.stroke();
          break;
      }
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Get raw coordinates and show crosshair
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;
    
    // Show crosshair for ALL tools
    setCrosshair({
      visible: true,
      x: rawX,
      y: rawY
    });

    if (selectedTool === 'move' || selectedTool === 'eraser') return;

    // Use raw coordinates directly - 1:1 pixel mapping
    const x = rawX;
    const y = rawY;

    if (selectedTool === 'text') {
      const text = prompt('متن را وارد کنید:');
      if (text) {
        const newElement: DrawnElement = {
          id: Date.now().toString(),
          type: selectedTool,
          startX: x,
          startY: y,
          color: selectedColor,
          width: lineWidth,
          text
        };
        setDrawnElements(prev => [...prev, newElement]);
        saveToHistory([...drawnElements, newElement]);
      }
      return;
    }

    setIsDrawing(true);
    const newElement: DrawnElement = {
      id: Date.now().toString(),
      type: selectedTool,
      startX: x,
      startY: y,
      endX: x,
      endY: y,
      color: selectedColor,
      width: lineWidth,
      points: selectedTool === 'pencil' ? [{ x, y }] : undefined
    };
    setCurrentElement(newElement);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Show crosshair at current mouse position (raw coordinates) - ALWAYS visible
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;
    
    setCrosshair({
      visible: true,
      x: rawX,
      y: rawY
    });

    // Use raw coordinates directly - 1:1 pixel mapping
    const x = rawX;
    const y = rawY;

    // Update drawing for ALL drawing tools (not just when isDrawing)
    if (isDrawing && currentElement) {
      if (selectedTool === 'pencil') {
        setCurrentElement(prev => prev ? {
          ...prev,
          points: [...(prev.points || []), { x, y }]
        } : null);
      } else {
        setCurrentElement(prev => prev ? { ...prev, endX: x, endY: y } : null);
      }
    }
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawing || !currentElement) return;

    setDrawnElements(prev => [...prev, currentElement]);
    saveToHistory([...drawnElements, currentElement]);
    setIsDrawing(false);
    setCurrentElement(null);
  };

  const handleCanvasMouseLeave = () => {
    setCrosshair({ visible: false, x: 0, y: 0 });
  };

  const handleChartHover = (event: ChartEvent, elements: InteractionItem[]) => {
    if (elements.length > 0 && chartRef.current) {
      const element = elements[0];
      const chart = chartRef.current;
      // const datasetIndex = element.datasetIndex;
      const index = element.index;
      
      if (chartData && chartData[index]) {
        const dataPoint = chartData[index];
        const canvas = chart.canvas;
        const rect = canvas.getBoundingClientRect();
        
        // Calculate total for percentage (for pie charts)
        const total = chartData.reduce((sum: number, item: any) => sum + (item.value || 0), 0);
        const percentage = total > 0 ? ((dataPoint.value || 0) / total * 100).toFixed(1) : '0';
        
        setTooltip({
          visible: true,
          x: rect.left + ((event.native as MouseEvent)?.clientX || 0) - rect.left + 10,
          y: rect.top + ((event.native as MouseEvent)?.clientY || 0) - rect.top - 10,
          data: {
            label: dataPoint.month || dataPoint.name || `آیتم ${index + 1}`,
            value: dataPoint.value || 0,
            index: index,
            percentage: chartType === 'pie' ? parseFloat(percentage) : undefined,
            additionalInfo: `موقعیت: ${index + 1} از ${chartData.length}`
          }
        });
      }
    } else {
      setTooltip(prev => ({ ...prev, visible: false }));
    }
  };

  const saveToHistory = (elements: DrawnElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...elements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setDrawnElements(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setDrawnElements(history[historyIndex + 1]);
    }
  };

  const clearCanvas = () => {
    setDrawnElements([]);
    saveToHistory([]);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5));
  };

  const getChartConfig = () => {
    if (!chartData || !Array.isArray(chartData)) {
      console.warn('FullScreenChart: Invalid chart data received:', chartData);
      return null;
    }

    // Log the received data for debugging
    console.log('FullScreenChart: Processing data:', chartData, 'Chart type:', chartType);

    const commonOptions: ChartOptions<any> = {
      responsive: true,
      maintainAspectRatio: false,
      animation: false, // Disable all animations
      animations: {
        colors: false,
        x: false,
        y: false
      },
      transitions: {
        active: {
          animation: {
            duration: 0
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index' as const,
      },
      onHover: handleChartHover,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            font: {
              family: 'Arial, sans-serif',
              size: 14
            }
          }
        },
        tooltip: {
          enabled: false, // Disable default tooltip as we use custom one
        },
      },
      scales: chartType !== 'pie' ? {
        x: {
          display: true,
          title: {
            display: true,
            text: 'محور X',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'مقدار',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        }
      } : undefined
    };

    // Enhanced data processing to handle different formats
    const labels = chartData.map((item: any) => {
      // Try multiple possible label fields
      return item.month || item.name || item.label || item.date || item.hour || item.week || `آیتم ${chartData.indexOf(item) + 1}`;
    });
    
    const values = chartData.map((item: any) => {
      // Try multiple possible value fields
      const value = item.value || item.amount || item.energetic || item.consumption || item.data || 0;
      return typeof value === 'number' ? value : 0;
    });

    // Log processed labels and values
    console.log('FullScreenChart: Processed labels:', labels);
    console.log('FullScreenChart: Processed values:', values);

    // Check if we have valid data to display
    if (values.every(v => v === 0)) {
      console.warn('FullScreenChart: All values are zero, chart may not display properly');
    }

    switch (chartType) {
      case 'area':
        return {
          type: 'line' as const,
          data: {
            labels,
            datasets: [{
              label: title || 'داده‌ها',
              data: values,
              fill: true,
              borderColor: '#4F46E5',
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
              borderWidth: 3,
              pointRadius: 6,
              pointHoverRadius: 8,
              tension: 0.4
            }]
          },
          options: {
            ...commonOptions,
            animation: false,
            animations: {
              colors: false,
              x: false,
              y: false
            }
          }
        };
      case 'line':
        return {
          type: 'line' as const,
          data: {
            labels,
            datasets: [{
              label: title || 'داده‌ها',
              data: values,
              fill: false,
              borderColor: '#10B981',
              backgroundColor: '#10B981',
              borderWidth: 3,
              pointRadius: 6,
              pointHoverRadius: 8,
              tension: 0.4
            }]
          },
          options: {
            ...commonOptions,
            animation: false,
            animations: {
              colors: false,
              x: false,
              y: false
            }
          }
        };
      case 'bar':
        // Generate colors for bar chart based on data length
        const barColors = values.map((_, index) => {
          const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#45B7D1', '#C9CBCF',
            '#4ECDC4', '#96CEB4'
          ];
          return colors[index % colors.length];
        });
        
        return {
          type: 'bar' as const,
          data: {
            labels,
            datasets: [{
              label: title || 'داده‌ها',
              data: values,
              backgroundColor: barColors,
              borderColor: barColors,
              borderWidth: 2
            }]
          },
          options: {
            ...commonOptions,
            animation: false,
            animations: {
              colors: false,
              x: false,
              y: false
            }
          }
        };
      case 'pie':
        // Generate colors for pie chart based on data length
        const pieColors = values.map((_, index) => {
          const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#45B7D1', '#C9CBCF',
            '#4ECDC4', '#96CEB4', '#FFEAA7', '#DDA0DD'
          ];
          return colors[index % colors.length];
        });
        
        return {
          type: 'pie' as const,
          data: {
            labels,
            datasets: [{
              data: values,
              backgroundColor: pieColors,
              borderColor: '#ffffff',
              borderWidth: 3
            }]
          },
          options: {
            ...commonOptions,
            animation: false,
            animations: {
              colors: false,
              x: false,
              y: false
            },
            plugins: {
              ...commonOptions.plugins,
              legend: {
                position: 'right' as const,
                labels: {
                  font: {
                    family: 'Arial, sans-serif',
                    size: 14
                  },
                  padding: 20
                }
              }
            }
          }
        };
      default:
        console.warn('FullScreenChart: Unknown chart type:', chartType);
        return null;
    }
  };

  const chartConfig = getChartConfig();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div 
        ref={containerRef}
        className="bg-white rounded-lg shadow-xl w-full h-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              {description && <p className="text-sm text-gray-600">{description}</p>}
            </div>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="کوچک نمایی"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600 px-2">{Math.round(zoom * 100)}%</span>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="بزرگ نمایی"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={toggleFullScreen}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="تمام صفحه"
            >
              {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          {/* Drawing Tools */}
          <div className="flex items-center space-x-2 space-x-reverse">
            {drawingTools.map(tool => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className={`p-2 rounded-lg transition-colors ${
                  selectedTool === tool.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
                title={tool.name}
              >
                {tool.icon}
              </button>
            ))}
          </div>

          {/* Colors */}
          <div className="flex items-center space-x-2 space-x-reverse">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full border-2 ${
                  selectedColor === color ? 'border-gray-800' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {/* Line Width */}
          <div className="flex items-center space-x-2 space-x-reverse">
            <label className="text-sm text-gray-700">ضخامت:</label>
            <input
              type="range"
              min="1"
              max="10"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-20"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              title="بازگشت"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              title="جلو"
            >
              <Redo className="w-4 h-4" />
            </button>
            <button
              onClick={clearCanvas}
              className="p-2 rounded-lg transition-colors hover:bg-red-100 text-red-600"
              title="پاک کردن همه"
            >
              <Eraser className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chart Container */}
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
            {chartConfig ? (
              <Chart
                ref={chartRef}
                type={chartConfig.type}
                data={chartConfig.data}
                options={chartConfig.options}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-gray-600 text-lg font-medium mb-2">داده‌ای برای نمایش وجود ندارد</p>
                  <p className="text-gray-500 text-sm">
                    ممکن است داده‌های چارت خالی باشند یا فرمت آن‌ها نامعتبر باشد.
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    برای اطلاعات بیشتر کنسول مرورگر را بررسی کنید.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Drawing Canvas - Should NOT be scaled */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseLeave}
            style={{ 
              cursor: drawingTools.find(t => t.id === selectedTool)?.cursor,
              pointerEvents: 'auto'
            }}
          />

          {/* Crosshair - Always visible when mouse is over canvas */}
          {crosshair.visible && (
            <>
              {/* Vertical line */}
              <div
                className="absolute pointer-events-none z-40"
                style={{
                  left: crosshair.x,
                  top: 0,
                  bottom: 0,
                  width: '1px',
                  backgroundColor: selectedTool === 'move' ? 'rgba(0, 150, 255, 0.7)' : 'rgba(255, 0, 0, 0.7)',
                  boxShadow: `0 0 2px ${selectedTool === 'move' ? 'rgba(0, 150, 255, 0.4)' : 'rgba(255, 0, 0, 0.4)'}`
                }}
              />
              {/* Horizontal line */}
              <div
                className="absolute pointer-events-none z-40"
                style={{
                  top: crosshair.y,
                  left: 0,
                  right: 0,
                  height: '1px',
                  backgroundColor: selectedTool === 'move' ? 'rgba(0, 150, 255, 0.7)' : 'rgba(255, 0, 0, 0.7)',
                  boxShadow: `0 0 2px ${selectedTool === 'move' ? 'rgba(0, 150, 255, 0.4)' : 'rgba(255, 0, 0, 0.4)'}`
                }}
              />
              {/* Center dot */}
              <div
                className="absolute pointer-events-none z-40"
                style={{
                  left: crosshair.x - 3,
                  top: crosshair.y - 3,
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: selectedTool === 'move' ? 'rgba(0, 150, 255, 0.9)' : 'rgba(255, 0, 0, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.9)',
                  boxShadow: `0 0 4px ${selectedTool === 'move' ? 'rgba(0, 150, 255, 0.6)' : 'rgba(255, 0, 0, 0.6)'}`
                }}
              />
              {/* Coordinate display */}
              <div
                className="absolute pointer-events-none z-50 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded"
                style={{
                  left: crosshair.x + 10,
                  top: crosshair.y - 30,
                  transform: crosshair.x > 200 ? 'translateX(-100%)' : 'none'
                }}
              >
                X: {Math.round(crosshair.x)} | Y: {Math.round(crosshair.y)}
              </div>
            </>
          )}

          {/* Custom Detailed Tooltip */}
          {tooltip.visible && tooltip.data && (
            <div
              className="absolute bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 pointer-events-none"
              style={{
                left: tooltip.x,
                top: tooltip.y,
                transform: 'translate(-50%, -100%)'
              }}
            >
              <div className="text-sm font-semibold text-gray-900 mb-2">
                {tooltip.data.label}
              </div>
              <div className="text-lg font-bold text-blue-600 mb-1">
                {tooltip.data.value.toLocaleString()}
              </div>
              {tooltip.data.percentage !== undefined && (
                <div className="text-sm text-gray-600 mb-1">
                  درصد: {tooltip.data.percentage}%
                </div>
              )}
              <div className="text-xs text-gray-500">
                {tooltip.data.additionalInfo}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 

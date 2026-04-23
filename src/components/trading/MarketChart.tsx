import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, LineData } from 'lightweight-charts';

interface MarketChartProps {
  data: any[];
  symbol?: string;
}

const MarketChart: React.FC<MarketChartProps> = ({ data, symbol = 'MAIZE' }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | ISeriesApi<"Baseline"> | null>(null);
  const [chartType, setChartType] = useState<'candle' | 'line'>('candle');

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0b0e11' },
        textColor: '#707a8a',
      },
      grid: {
        vertLines: { color: '#1f2226' },
        horzLines: { color: '#1f2226' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        borderColor: '#1f2226',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#1f2226',
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
      },
      crosshair: {
        mode: 0, // Normal
        vertLine: {
          color: '#5d6673',
          width: 0.5,
          style: 2, // Dashed
        },
        horzLine: {
          color: '#5d6673',
          width: 0.5,
          style: 2,
        },
      },
    });

    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    if (seriesRef.current) {
      chartRef.current.removeSeries(seriesRef.current as any);
    }

    if (chartType === 'candle') {
      const candlestickSeries = chartRef.current.addCandlestickSeries({
        upColor: '#2ebd85',
        downColor: '#f6465d',
        borderVisible: false,
        wickUpColor: '#2ebd85',
        wickDownColor: '#f6465d',
      });
      candlestickSeries.setData(data as CandlestickData[]);
      seriesRef.current = candlestickSeries;
    } else {
      const lineSeries = chartRef.current.addBaselineSeries({
        baseValue: { type: 'price', price: data[0].close },
        topFillColor1: 'rgba(46, 189, 133, 0.28)',
        topFillColor2: 'rgba(46, 189, 133, 0.05)',
        topLineColor: 'rgba(46, 189, 133, 1)',
        bottomFillColor1: 'rgba(246, 70, 93, 0.05)',
        bottomFillColor2: 'rgba(246, 70, 93, 0.28)',
        bottomLineColor: 'rgba(246, 70, 93, 1)',
      });
      lineSeries.setData(data as LineData[]);
      seriesRef.current = lineSeries;
    }

    chartRef.current.timeScale().fitContent();
  }, [data, chartType]);

  const lastPoint = data[data.length - 1];
  const firstPoint = data[0];
  const priceChange = lastPoint ? lastPoint.close - firstPoint.open : 0;
  const priceChangePct = firstPoint?.open ? ((priceChange / firstPoint.open) * 100).toFixed(2) : '0.00';
  const isPositive = priceChange >= 0;

  return (
    <div className="w-full h-full flex flex-col bg-card">
      <div className="flex items-center justify-between px-3 md:px-4 py-2 shrink-0 border-b border-gray-800/40">
        <div className="flex items-center gap-3 md:gap-5">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-[8px] md:text-[10px] uppercase font-bold tracking-wider">Price</span>
            <span className="text-foreground font-bold text-xs md:text-base font-mono tracking-tight">
              ₦{lastPoint?.close.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-[8px] md:text-[10px] uppercase font-bold tracking-wider">24h Change</span>
            <span className={`font-bold text-[10px] md:text-xs font-mono ${isPositive ? 'text-primary' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{priceChangePct}%
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex bg-[#161a1e]/90 rounded-md p-0.5 border border-gray-800/40">
            <button
              onClick={() => setChartType('candle')}
              className={`h-5 md:h-6 px-2 rounded text-[9px] md:text-[10px] font-bold transition-all ${
                chartType === 'candle' ? 'bg-gray-800 text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Candle
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`h-5 md:h-6 px-2 rounded text-[9px] md:text-[10px] font-bold transition-all ${
                chartType === 'line' ? 'bg-gray-800 text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Line
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative" ref={chartContainerRef} />
    </div>
  );
};

export default MarketChart;

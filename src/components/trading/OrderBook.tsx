import React, { useMemo } from 'react';

interface OrderBookProps {
  symbol: string;
  currentPrice: number;
}

const OrderBook = ({ symbol, currentPrice }: OrderBookProps) => {
  const asks = useMemo(() => [
    { price: currentPrice * 1.0004, amount: 2.5, total: currentPrice * 1.0004 * 2.5 },
    { price: currentPrice * 1.0003, amount: 1.2, total: currentPrice * 1.0003 * 1.2 },
    { price: currentPrice * 1.0002, amount: 0.8, total: currentPrice * 1.0002 * 0.8 },
    { price: currentPrice * 1.0001, amount: 3.1, total: currentPrice * 1.0001 * 3.1 },
    { price: currentPrice * 1.00005, amount: 0.5, total: currentPrice * 1.00005 * 0.5 },
    { price: currentPrice * 1.00002, amount: 1.8, total: currentPrice * 1.00002 * 1.8 },
    { price: currentPrice * 1.00001, amount: 0.3, total: currentPrice * 1.00001 * 0.3 },
  ].sort((a, b) => b.price - a.price), [currentPrice]);

  const bids = useMemo(() => [
    { price: currentPrice * 0.9999, amount: 1.5, total: currentPrice * 0.9999 * 1.5 },
    { price: currentPrice * 0.9998, amount: 2.2, total: currentPrice * 0.9998 * 2.2 },
    { price: currentPrice * 0.9997, amount: 0.7, total: currentPrice * 0.9997 * 0.7 },
    { price: currentPrice * 0.9996, amount: 4.8, total: currentPrice * 0.9996 * 4.8 },
    { price: currentPrice * 0.9995, amount: 1.1, total: currentPrice * 0.9995 * 1.1 },
    { price: currentPrice * 0.9994, amount: 2.0, total: currentPrice * 0.9994 * 2.0 },
    { price: currentPrice * 0.9993, amount: 0.9, total: currentPrice * 0.9993 * 0.9 },
  ], [currentPrice]);

  const maxAmount = Math.max(
    ...asks.map(a => a.amount),
    ...bids.map(b => b.amount)
  );


  const spread = asks[asks.length - 1].price - bids[0].price;
  const spreadPct = ((spread / currentPrice) * 100).toFixed(3);

  return (
    <div className="flex flex-col h-full bg-[#161a1e] text-[11px] font-mono select-none">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-gray-800 flex justify-between items-center shrink-0">
        <h3 className="text-gray-400 font-bold uppercase tracking-widest text-[9px] font-sans">Order Book</h3>
        <div className="flex gap-1">
          <button className="w-5 h-4 rounded-sm bg-gradient-to-b from-red-500/60 to-emerald-500/60 border border-gray-700" title="Both" />
          <button className="w-5 h-4 rounded-sm bg-emerald-500/30 border border-gray-800" title="Bids" />
          <button className="w-5 h-4 rounded-sm bg-red-500/30 border border-gray-800" title="Asks" />
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 px-3 py-1.5 text-gray-600 font-bold uppercase text-[8px] tracking-wider shrink-0 font-sans">
        <span>Price (NGN)</span>
        <span className="text-right">Amt (MT)</span>
        <span className="text-right">Total</span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-auto min-h-0 flex flex-col">
        {/* Asks (Sell Orders) - reversed so lowest ask is at bottom */}
        <div className="flex flex-col-reverse mt-auto">
          {asks.map((ask, i) => (
            <div key={`ask-${i}`} className="grid grid-cols-3 py-[3px] px-3 hover:bg-white/[0.03] relative cursor-pointer items-center transition-colors">
              <div
                className="absolute inset-y-0 right-0 bg-red-500/[0.08] transition-all duration-500"
                style={{ width: `${(ask.amount / maxAmount) * 100}%` }}
              />
              <span className="text-red-400 relative z-10 font-semibold">{ask.price.toLocaleString()}</span>
              <span className="text-right text-gray-400 relative z-10">{ask.amount.toFixed(3)}</span>
              <span className="text-right text-gray-600 relative z-10 text-[9px]">{(ask.total / 1000).toFixed(1)}K</span>
            </div>
          ))}
        </div>

        {/* Current Price / Spread */}
        <div className="py-2 px-3 border-y border-gray-800/60 bg-[#1e2329]/50 shrink-0 my-0.5">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-emerald-500 tracking-tighter">{currentPrice.toLocaleString()}</span>
            <span className="text-gray-600 text-[10px]">↑</span>
          </div>
          <div className="flex justify-between items-center text-[8px] text-gray-600 uppercase font-bold tracking-wider mt-0.5 font-sans">
            <span>Market Price</span>
            <span>Spread: {spread} ({spreadPct}%)</span>
          </div>
        </div>

        {/* Bids (Buy Orders) */}
        <div className="flex flex-col">
          {bids.map((bid, i) => (
            <div key={`bid-${i}`} className="grid grid-cols-3 py-[3px] px-3 hover:bg-white/[0.03] relative cursor-pointer items-center transition-colors">
              <div
                className="absolute inset-y-0 right-0 bg-emerald-500/[0.08] transition-all duration-500"
                style={{ width: `${(bid.amount / maxAmount) * 100}%` }}
              />
              <span className="text-emerald-400 relative z-10 font-semibold">{bid.price.toLocaleString()}</span>
              <span className="text-right text-gray-400 relative z-10">{bid.amount.toFixed(3)}</span>
              <span className="text-right text-gray-600 relative z-10 text-[9px]">{(bid.total / 1000).toFixed(1)}K</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderBook;

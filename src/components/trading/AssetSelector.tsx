import React, { useState } from 'react';
import { Search, Wheat } from 'lucide-react';
import { Input } from "@/components/ui/input";

const AssetSelector = ({ assets, onSelect }: { assets: any[], onSelect: (asset: any) => void }) => {
  const [search, setSearch] = useState("");

  const filtered = assets.filter(a => a.symbol.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="w-full h-full bg-[#161a1e] flex flex-col font-sans">
      <div className="p-4 space-y-4 bg-[#1e2329]/10">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Markets</h3>
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-emerald-500" />
            <div className="w-1 h-1 rounded-full bg-gray-700" />
          </div>
        </div>
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-600 group-focus-within:text-emerald-500 transition-colors" />
          <input
            placeholder="Search Assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 bg-[#0b0e11] border-none h-9 text-xs text-white placeholder:text-gray-700 placeholder:font-bold placeholder:uppercase placeholder:tracking-tighter focus:ring-1 focus:ring-emerald-500/30 rounded-md transition-all outline-none"
          />
        </div>

        <div className="grid grid-cols-3 text-[9px] text-gray-600 uppercase font-black tracking-widest px-1">
          <span>Asset</span>
          <span className="text-right">Price</span>
          <span className="text-right">Change</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar py-2">
        {filtered.map((asset) => (
          <div
            key={asset.symbol}
            onClick={() => onSelect(asset)}
            className="grid grid-cols-3 px-4 py-2.5 hover:bg-[#1e2329] cursor-pointer transition-all border-l-2 border-transparent hover:border-emerald-500 group"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                <Wheat className="h-3 w-3 text-emerald-500" />
              </div>
              <span className="text-xs text-white font-bold tracking-tight">{asset.symbol}</span>
            </div>
            <div className="flex flex-col items-end justify-center">
              <span className="text-[11px] text-gray-200 font-mono font-bold tracking-tighter">{asset.price.toLocaleString()}</span>
              <span className="text-[8px] text-gray-600 font-bold uppercase">NGN</span>
            </div>
            <div className="flex items-center justify-end">
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-sm ${asset.change >= 0 ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10"}`}>
                {asset.change >= 0 ? "+" : ""}{asset.change}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetSelector;

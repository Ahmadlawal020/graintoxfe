import React, { useState, useMemo, useEffect } from 'react';
import MarketChart from './MarketChart';
import OrderBook from './OrderBook';
import TradePanel from './TradePanel';
import AssetSelector from './AssetSelector';
import { ChevronDown, X, BarChart3, BookOpen, ArrowLeftRight, List, Loader2, Clock, History as HistoryIcon, Wallet, Receipt } from 'lucide-react';
import { useGetCropsQuery, useGetCropHistoryQuery } from '@/services/api/cropApiSlice';
import { useGetUserTransactionsQuery, useGetUserTradesQuery } from '@/services/api/financeApiSlice';
import { format } from 'date-fns';
import { useGetUserByIdQuery } from '@/services/api/userApiSlice';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/services/authSlice';

type MobileTab = 'chart' | 'orderbook' | 'trade' | 'history';

const TradingLayout = () => {
  const user = useSelector(selectCurrentUser);
  const { data: userData } = useGetUserByIdQuery(user?.id || "");
  const { data: realCrops, isLoading: cropsLoading } = useGetCropsQuery(undefined, {
    pollingInterval: 30000,
  });

  const assets = useMemo(() => {
    if (!realCrops) return [];
    return realCrops.map((c: any) => ({
      id: c._id,
      symbol: c.tokenSymbol,
      name: c.name,
      price: c.pricePerUnit,
      change: c.priceChange || 0,
      high: c.pricePerUnit * 1.02,
      low: c.pricePerUnit * 0.98,
      volume: (c.totalStock || 0).toLocaleString()
    }));
  }, [realCrops]);

  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>('chart');
  const [showMobileTradeSheet, setShowMobileTradeSheet] = useState(false);
  const [showMobileAssets, setShowMobileAssets] = useState(false);
  const [mobileTradeType, setMobileTradeType] = useState<'buy' | 'sell'>('buy');
  const [bottomTab, setBottomTab] = useState('Trade History');
  const [mobileHistorySubTab, setMobileHistorySubTab] = useState<'trades' | 'funds'>('trades');

  const selectedAsset = useMemo(() => {
    if (!assets.length) return null;
    if (!selectedAssetId) return assets[0];
    return assets.find(a => a.id === selectedAssetId) || assets[0];
  }, [assets, selectedAssetId]);

  useEffect(() => {
    if (selectedAsset && !selectedAssetId) {
      setSelectedAssetId(selectedAsset.id);
    }
  }, [selectedAsset, selectedAssetId]);

  const { data: trades, isLoading: tradesLoading } = useGetUserTradesQuery(undefined);
  const tradeHistory = useMemo(() => trades || [], [trades]);

  const { data: historyData, isLoading: historyLoading } = useGetCropHistoryQuery(
    selectedAsset?.id,
    {
      skip: !selectedAsset?.id,
      pollingInterval: 60000
    }
  );

  const chartData = useMemo(() => {
    if (historyData && historyData.length > 0) {
      return historyData.map((h: any) => ({
        time: Math.floor(new Date(h.createdAt).getTime() / 1000),
        open: h.open,
        high: h.high,
        low: h.low,
        close: h.close
      }));
    }
    if (!selectedAsset) return [];
    const data = [];
    let currentPrice = selectedAsset.price;
    const now = Math.floor(Date.now() / 1000);
    for (let i = 0; i < 80; i++) {
      const open = currentPrice + (Math.random() - 0.5) * (selectedAsset.price * 0.01);
      const close = open + (Math.random() - 0.5) * (selectedAsset.price * 0.01);
      const high = Math.max(open, close) + Math.random() * (selectedAsset.price * 0.005);
      const low = Math.min(open, close) - Math.random() * (selectedAsset.price * 0.005);
      data.push({ time: now - (80 - i) * 3600, open, high, low, close });
      currentPrice = close;
    }
    return data;
  }, [selectedAsset?.symbol, historyData]);

  const handleAssetSelect = (asset: any) => {
    const fullAsset = assets.find(a => a.symbol === asset.symbol);
    if (fullAsset) setSelectedAssetId(fullAsset.id);
    setShowMobileAssets(false);
  };

  const openMobileTrade = (type: 'buy' | 'sell') => {
    setMobileTradeType(type);
    setShowMobileTradeSheet(true);
  };

  const mobileTabs: { key: MobileTab; label: string; icon: any }[] = [
    { key: 'chart', label: 'Chart', icon: BarChart3 },
    { key: 'orderbook', label: 'Book', icon: BookOpen },
    { key: 'trade', label: 'Trade', icon: ArrowLeftRight },
    { key: 'history', label: 'History', icon: HistoryIcon },
  ];

  if (cropsLoading || !selectedAsset) {
    return (
      <div className="flex-1 flex items-center justify-center bg-card">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card text-muted-foreground overflow-hidden select-none font-sans">

      {/* ═══ TOP TICKER BAR ═══ */}
      <div className="h-12 md:h-14 border-b border-gray-800 flex items-center px-3 md:px-4 gap-3 md:gap-6 shrink-0 bg-[#161a1e] z-20">
        <button
          className="flex items-center gap-1.5 min-w-0 active:opacity-70 transition-opacity"
          onClick={() => setShowMobileAssets(true)}
        >
          <span className="text-sm md:text-lg font-bold text-foreground tracking-tight whitespace-nowrap">{selectedAsset.symbol}/NGN</span>
          <ChevronDown className="w-3 h-3 text-muted-foreground md:hidden shrink-0" />
        </button>

        <div className="h-6 w-px bg-gray-800 hidden md:block" />

        <div className="flex flex-col min-w-0">
          <span className={`text-sm md:text-base font-bold font-mono truncate ${selectedAsset.change >= 0 ? "text-primary" : "text-red-500"}`}>
            ₦{selectedAsset.price.toLocaleString()}
          </span>
          <span className="text-[9px] text-muted-foreground hidden md:block">≈ ${(selectedAsset.price / 1600).toFixed(2)}</span>
        </div>

        <div className="md:hidden ml-auto">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${selectedAsset.change >= 0 ? "text-primary bg-primary/10" : "text-red-500 bg-red-500/10"}`}>
            {selectedAsset.change >= 0 ? "+" : ""}{selectedAsset.change}%
          </span>
        </div>

        <div className="hidden lg:flex gap-6 text-[11px] ml-auto">
          {[
            { label: '24h Change', value: `${selectedAsset.change >= 0 ? '+' : ''}${selectedAsset.change}%`, color: selectedAsset.change >= 0 ? 'text-primary' : 'text-red-500' },
            { label: '24h High', value: selectedAsset.high.toLocaleString(), color: 'text-foreground' },
            { label: '24h Low', value: selectedAsset.low.toLocaleString(), color: 'text-foreground' },
            { label: 'Volume', value: `${selectedAsset.volume} MT`, color: 'text-foreground' },
          ].map(s => (
            <div key={s.label} className="flex flex-col">
              <span className="text-muted-foreground text-[9px] mb-0.5">{s.label}</span>
              <span className={`font-medium ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">

        {/* LEFT: Asset List (desktop only) */}
        <div className="hidden lg:flex w-64 xl:w-72 shrink-0 border-r border-gray-800 bg-[#161a1e] flex-col overflow-y-auto">
          <AssetSelector onSelect={handleAssetSelect} assets={assets} />
        </div>

        {/* CENTER: Chart + Bottom Panel */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">

          {/* Mobile tab bar */}
          <div className="flex md:hidden border-b border-gray-800 bg-[#161a1e] shrink-0">
            {mobileTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setMobileTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[11px] font-bold uppercase tracking-wide transition-all touch-manipulation ${mobileTab === tab.key
                  ? 'border-b-2 border-primary text-foreground'
                  : 'text-muted-foreground active:bg-accent'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content area */}
          <div className="flex-1 min-h-0 flex flex-col">

            {/* CHART TAB (mobile) / always visible (desktop) */}
            <div className={`flex-1 min-h-0 flex-col ${mobileTab === 'chart' ? 'flex' : 'hidden'} md:flex`}>
              <div className="flex-1 min-h-0">
                <MarketChart data={chartData} symbol={selectedAsset.symbol} />
              </div>

              {/* Mobile quick stats */}
              <div className="flex md:hidden border-t border-gray-800 bg-[#161a1e] shrink-0">
                <div className="flex-1 py-2 flex flex-col items-center border-r border-gray-800">
                  <span className="text-[8px] text-muted-foreground font-bold uppercase">High</span>
                  <span className="text-[11px] text-foreground font-bold font-mono">₦{selectedAsset.high.toLocaleString()}</span>
                </div>
                <div className="flex-1 py-2 flex flex-col items-center border-r border-gray-800">
                  <span className="text-[8px] text-muted-foreground font-bold uppercase">Low</span>
                  <span className="text-[11px] text-foreground font-bold font-mono">₦{selectedAsset.low.toLocaleString()}</span>
                </div>
                <div className="flex-1 py-2 flex flex-col items-center">
                  <span className="text-[8px] text-muted-foreground font-bold uppercase">Vol</span>
                  <span className="text-[11px] text-foreground font-bold font-mono">{selectedAsset.volume} MT</span>
                </div>
              </div>
            </div>

            {/* ORDER BOOK TAB (mobile only) */}
            <div className={`flex-1 min-h-0 overflow-auto ${mobileTab === 'orderbook' ? 'block' : 'hidden'} md:hidden`}>
              <OrderBook symbol={selectedAsset.symbol} currentPrice={selectedAsset.price} />
            </div>

            {/* TRADE TAB (mobile only) */}
            <div className={`flex-1 min-h-0 overflow-auto ${mobileTab === 'trade' ? 'block' : 'hidden'} md:hidden`}>
              <TradePanel symbol={selectedAsset.symbol} name={selectedAsset.name} currentPrice={selectedAsset.price} />
            </div>

            {/* HISTORY TAB (mobile only) */}
            <div className={`flex-1 min-h-0 flex flex-col ${mobileTab === 'history' ? 'flex' : 'hidden'} md:hidden bg-[#161a1e]`}>
              <div className="flex border-b border-gray-800 shrink-0">
                <button
                  onClick={() => setMobileHistorySubTab('trades')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wide transition-all ${mobileHistorySubTab === 'trades' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground'}`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  Trade History
                </button>
                <button
                  onClick={() => setMobileHistorySubTab('funds')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wide transition-all ${mobileHistorySubTab === 'funds' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground'}`}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  Funds
                </button>
              </div>
              <div className="flex-1 overflow-auto p-2">
                {mobileHistorySubTab === 'trades' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead className="sticky top-0 bg-[#161a1e] z-10">
                        <tr className="border-b border-gray-800/40 text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                          <th className="px-3 py-2">Time</th>
                          <th className="px-3 py-2">Asset</th>
                          <th className="px-3 py-2">Side</th>
                          <th className="px-3 py-2">Price</th>
                          <th className="px-3 py-2">Amount</th>
                          <th className="px-3 py-2">Total</th>
                        </tr>
                      </thead>
                      <tbody className="text-[10px] font-mono">
                        {tradeHistory.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-10 opacity-40">
                              <div className="flex flex-col items-center">
                                <HistoryIcon className="w-8 h-8 mb-2 text-muted-foreground" />
                                <span className="text-[9px] font-bold uppercase tracking-widest">No trade activity yet</span>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          tradeHistory.map((tx: any) => (
                            <tr key={tx._id} className="border-b border-gray-800/20">
                              <td className="px-3 py-2 text-muted-foreground text-[9px]">
                                {format(new Date(tx.createdAt), 'MMM dd, HH:mm:ss')}
                              </td>
                              <td className="px-3 py-2 font-bold text-foreground">{tx.symbol || 'N/A'}</td>
                              <td className="px-3 py-2">
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${tx.type === 'buy' ? 'text-primary bg-primary/10' : 'text-red-500 bg-red-500/10'}`}>
                                  {tx.type.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-3 py-2">₦{(tx.price || 0).toLocaleString()}</td>
                              <td className="px-3 py-2">{tx.amount || 0} MT</td>
                              <td className="px-3 py-2 text-foreground font-bold">₦{tx.total?.toLocaleString()}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[300px]">
                      <thead className="sticky top-0 bg-[#161a1e] z-10">
                        <tr className="border-b border-gray-800/40 text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                          <th className="px-3 py-2">Asset</th>
                          <th className="px-3 py-2">Balance</th>
                          <th className="px-3 py-2">Value (NGN)</th>
                        </tr>
                      </thead>
                      <tbody className="text-[10px] font-mono">
                        <tr className="border-b border-gray-800/20">
                          <td className="px-3 py-2 text-foreground font-bold">NGN</td>
                          <td className="px-3 py-2">₦{(userData?.walletBalance || 0).toLocaleString()}</td>
                          <td className="px-3 py-2 text-foreground">₦{(userData?.walletBalance || 0).toLocaleString()}</td>
                        </tr>
                        {userData?.holdings?.map((h: any) => (
                          <tr key={h._id} className="border-b border-gray-800/20">
                            <td className="px-3 py-2 text-foreground font-bold">{h.tokenSymbol}</td>
                            <td className="px-3 py-2">{h.amount.toLocaleString()} MT</td>
                            <td className="px-3 py-2 text-foreground">
                              ₦{((h.amount || 0) * (assets.find(a => a.symbol === h.tokenSymbol)?.price || h.averagePrice || 0)).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop: Bottom orders panel */}
          <div className="hidden md:flex h-48 xl:h-56 border-t border-gray-800 bg-[#161a1e] flex-col shrink-0">
            <div className="flex border-b border-gray-800/60 overflow-x-auto">
              {['Open Orders (0)', 'Trade History', 'Funds'].map((label) => (
                <button
                  key={label}
                  onClick={() => setBottomTab(label)}
                  className={`px-4 lg:px-6 py-2.5 text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${bottomTab === label ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-muted-foreground'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-auto min-h-0">
              {bottomTab === 'Trade History' ? (
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="sticky top-0 bg-[#161a1e] z-10">
                      <tr className="border-b border-gray-800/40 text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                        <th className="px-4 py-2">Time</th>
                        <th className="px-4 py-2">Asset</th>
                        <th className="px-4 py-2">Side</th>
                        <th className="px-4 py-2">Price</th>
                        <th className="px-4 py-2">Amount</th>
                        <th className="px-4 py-2">Fee</th>
                        <th className="px-4 py-2">Total</th>
                        <th className="px-4 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-[10px] font-mono">
                      {tradeHistory.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-10 opacity-40">
                            <div className="flex flex-col items-center">
                              <HistoryIcon className="w-8 h-8 mb-2 text-muted-foreground" />
                              <span className="text-[9px] font-bold uppercase tracking-widest">No trade activity yet</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        tradeHistory.map((tx: any) => (
                          <tr key={tx._id} className="border-b border-gray-800/20 hover:bg-white/[0.02] transition-colors group">
                            <td className="px-4 py-3 text-muted-foreground font-sans group-hover:text-muted-foreground">
                              {format(new Date(tx.createdAt), 'MMM dd, HH:mm:ss')}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                <span className="text-foreground font-bold tracking-tight">{tx.symbol || 'N/A'}</span>
                                <span className="text-[8px] text-muted-foreground uppercase">/NGN</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-wider ${tx.type === 'buy' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                }`}>
                                {tx.type.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground font-bold">
                              ₦{(tx.price || 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-muted-foreground">{tx.amount || 0}</span>
                              <span className="text-[9px] text-muted-foreground ml-1">MT</span>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground text-[9px]">
                              ₦{(tx.fee || 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-foreground font-bold">
                              ₦{tx.total?.toLocaleString()}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                                <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">
                                  {tx.status}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              ) : bottomTab === 'Funds' ? (
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead className="sticky top-0 bg-[#161a1e] z-10">
                      <tr className="border-b border-gray-800/40 text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                        <th className="px-4 py-2">Asset</th>
                        <th className="px-4 py-2">Balance</th>
                        <th className="px-4 py-2">Available</th>
                        <th className="px-4 py-2">Avg. Price</th>
                        <th className="px-4 py-2">Value (NGN)</th>
                      </tr>
                    </thead>
                    <tbody className="text-[10px] font-mono">
                      <tr className="border-b border-gray-800/20 hover:bg-accent transition-colors">
                        <td className="px-4 py-2 text-foreground font-bold">NGN</td>
                        <td className="px-4 py-2 text-muted-foreground">₦{(userData?.walletBalance || 0).toLocaleString()}</td>
                        <td className="px-4 py-2 text-primary">₦{(userData?.walletBalance || 0).toLocaleString()}</td>
                        <td className="px-4 py-2 text-muted-foreground">-</td>
                        <td className="px-4 py-2 text-foreground">₦{(userData?.walletBalance || 0).toLocaleString()}</td>
                      </tr>
                      {userData?.holdings?.map((h: any) => (
                        <tr key={h._id} className="border-b border-gray-800/20 hover:bg-accent transition-colors">
                          <td className="px-4 py-2 text-foreground font-bold">{h.tokenSymbol}</td>
                          <td className="px-4 py-2 text-muted-foreground">{h.amount.toLocaleString()} MT</td>
                          <td className="px-4 py-2 text-primary">{h.amount.toLocaleString()} MT</td>
                          <td className="px-4 py-2 text-muted-foreground">₦{(h.averagePrice || 0).toLocaleString()}</td>
                          <td className="px-4 py-2 text-foreground">
                            ₦{((h.amount || 0) * (assets.find(a => a.symbol === h.tokenSymbol)?.price || h.averagePrice || 0)).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-40">
                  <div className="h-10 w-10 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center mb-3">
                    <span className="text-muted-foreground text-sm">📋</span>
                  </div>
                  <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">No data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Order Book + Trade Panel (desktop only) */}
        <div className="hidden md:flex w-[300px] xl:w-[340px] flex-col shrink-0 bg-[#161a1e] border-l border-gray-800 min-h-0">
          <div className="flex-1 overflow-auto min-h-0">
            <OrderBook symbol={selectedAsset.symbol} currentPrice={selectedAsset.price} />
          </div>
          <div className="border-t border-gray-800 shrink-0 overflow-auto max-h-[50%]">
            <TradePanel symbol={selectedAsset.symbol} name={selectedAsset.name} currentPrice={selectedAsset.price} />
          </div>
        </div>
      </div>

      {/* ═══ MOBILE BUY/SELL BAR ═══ */}
      {mobileTab !== 'trade' && (
        <div className="md:hidden grid grid-cols-2 gap-2 p-2.5 bg-[#161a1e] border-t border-gray-800 shrink-0">
          <button
            onClick={() => openMobileTrade('buy')}
            className="h-11 bg-primary text-foreground font-bold text-sm rounded-lg active:scale-[0.97] transition-transform shadow-lg shadow-primary/15 touch-manipulation"
          >
            Buy {selectedAsset.symbol}
          </button>
          <button
            onClick={() => openMobileTrade('sell')}
            className="h-11 bg-red-500 text-foreground font-bold text-sm rounded-lg active:scale-[0.97] transition-transform shadow-lg shadow-red-500/15 touch-manipulation"
          >
            Sell {selectedAsset.symbol}
          </button>
        </div>
      )}

      {/* ═══ MOBILE TRADE SHEET ═══ */}
      {showMobileTradeSheet && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileTradeSheet(false)} />
          <div className="relative bg-[#161a1e] rounded-t-2xl border-t border-gray-700 max-h-[85vh] flex flex-col">
            <div className="flex justify-center pt-2 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-700" />
            </div>
            <div className="px-4 pb-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${mobileTradeType === 'buy' ? 'bg-primary' : 'bg-red-500'}`} />
                <span className="text-foreground font-bold text-sm">{mobileTradeType === 'buy' ? 'Buy' : 'Sell'} {selectedAsset.symbol}</span>
              </div>
              <button onClick={() => setShowMobileTradeSheet(false)} className="p-1.5 rounded-lg bg-gray-800 text-muted-foreground touch-manipulation">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-1 pb-4">
              <TradePanel symbol={selectedAsset.symbol} name={selectedAsset.name} currentPrice={selectedAsset.price} defaultTab={mobileTradeType} />
            </div>
          </div>
        </div>
      )}

      {/* ═══ MOBILE ASSET SELECTOR ═══ */}
      {showMobileAssets && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-card">
          <div className="p-3 border-b border-gray-800 flex items-center justify-between bg-[#161a1e] shrink-0">
            <span className="text-foreground font-bold text-sm">Select Market</span>
            <button onClick={() => setShowMobileAssets(false)} className="p-1.5 rounded-lg bg-gray-800 text-muted-foreground touch-manipulation">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            <AssetSelector onSelect={handleAssetSelect} assets={assets} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingLayout;
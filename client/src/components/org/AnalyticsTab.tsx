"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import fetchClient from "@/api/axiosInstance";

export function AnalyticsTab({ orgId }: { orgId: string }) {
  const [data, setData] = useState<{ overview: any; chartData: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetchClient.get(`/orgs/${orgId}/analytics`);
        setData(res.data as any);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [orgId]);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;
  }

  if (!data) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <p className="text-sm text-neutral-500 mb-2">Total Tokens Served</p>
          <p className="text-4xl font-display font-bold text-white">{data.overview.totalServedToday}</p>
        </div>
        <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <p className="text-sm text-neutral-500 mb-2">Avg Wait Time</p>
          <p className="text-4xl font-display font-bold text-white">
            {Math.round(data.overview.avgServiceTimeGlobal / 60000) || 0}
            <span className="text-xl text-neutral-500 font-normal ml-2">min</span>
          </p>
        </div>
        <div className="p-6 rounded-2xl border border-emerald-500/10 bg-emerald-500/5">
          <p className="text-sm text-emerald-500/70 mb-2">Queue Efficiency</p>
          <p className="text-4xl font-display font-bold text-emerald-400">94%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-white/[0.06] bg-[#0A0A0A]">
          <h3 className="text-lg font-semibold text-white mb-6">Tokens Served Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData}>
                <defs>
                  <linearGradient id="colorServed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={12} tickMargin={10} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="served" stroke="#34d399" strokeWidth={2} fillOpacity={1} fill="url(#colorServed)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-white/[0.06] bg-[#0A0A0A]">
          <h3 className="text-lg font-semibold text-white mb-6">Average Wait Time (Mins)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={12} tickMargin={10} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="avgWaitTimeMinutes" stroke="#60a5fa" strokeWidth={2} dot={{ r: 4, fill: '#60a5fa' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

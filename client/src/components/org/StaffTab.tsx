"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import fetchClient from "@/api/axiosInstance";

interface StaffMember {
  _id: string;
  name: string;
  phone: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export function StaffTab({ orgId }: { orgId: string }) {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", password: "" });
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");

  const fetchStaff = async () => {
    try {
      const res = await fetchClient.get(`/orgs/${orgId}/staff`);
      setStaffList((res.data as any).staff);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [orgId]);

  const handleInvite = async () => {
    setInviting(true);
    setError("");
    try {
      await fetchClient.post(`/orgs/${orgId}/staff`, form);
      setShowInvite(false);
      setForm({ name: "", phone: "", password: "" });
      fetchStaff();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to invite staff");
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Staff Members</h2>
        <ShimmerButton onClick={() => setShowInvite(true)} className="px-6 py-2">
          + Add Staff
        </ShimmerButton>
      </div>

      {showInvite && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] mb-8"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Invite New Staff</h3>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:border-white/20 focus:outline-none transition-colors"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:border-white/20 focus:outline-none transition-colors"
            />
            <input
              type="text"
              placeholder="Temporary Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:border-white/20 focus:outline-none transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowInvite(false)} className="px-6 py-2 rounded-full border border-white/10 text-neutral-400 hover:text-white transition-colors">Cancel</button>
            <ShimmerButton onClick={handleInvite} disabled={!form.name || !form.phone || !form.password || inviting} className="py-2">
              {inviting ? "Creating..." : "Create Staff Account"}
            </ShimmerButton>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>
      ) : (
        <div className="grid gap-4">
          {staffList.map((staff, i) => (
            <motion.div 
              key={staff._id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-5 rounded-2xl border border-white/[0.06] bg-black"
            >
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-semibold text-white">{staff.name}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${staff.role === 'org_admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {staff.role.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-neutral-500">{staff.phone}</p>
              </div>
              <div className="text-right">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${staff.isActive ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                <span className="text-xs text-neutral-400">{staff.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

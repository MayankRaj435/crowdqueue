"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import fetchClient from "@/api/axiosInstance";

const orgTypes = [
  { value: "hospital", label: "Hospital", icon: "🏥" },
  { value: "bank", label: "Bank", icon: "🏦" },
  { value: "government", label: "Government", icon: "🏛️" },
  { value: "rto", label: "RTO", icon: "🚗" },
  { value: "other", label: "Other", icon: "📋" },
];

export default function OrgRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    type: "",
    description: "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
    longitude: "77.209",
    latitude: "28.6139",
    phone: "",
    email: "",
  });

  const update = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await fetchClient.post("/orgs/register", {
        name: form.name,
        type: form.type,
        description: form.description,
        address: {
          line1: form.line1,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        },
        longitude: parseFloat(form.longitude),
        latitude: parseFloat(form.latitude),
        phone: form.phone,
        email: form.email,
      });
      router.push("/org/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((p) => ({
          ...p,
          longitude: pos.coords.longitude.toFixed(6),
          latitude: pos.coords.latitude.toFixed(6),
        }));
      },
      () => {},
      { timeout: 5000 }
    );
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-bold text-white mb-2">
              Register Your Organization
            </h1>
            <p className="text-neutral-400 mb-8">
              Set up your organization to start managing queues
            </p>
          </motion.div>

          {/* Step Indicators */}
          <div className="flex items-center gap-3 mb-10">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    step >= s
                      ? "bg-white text-black"
                      : "bg-white/[0.05] text-neutral-500"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div className={`w-12 h-px ${step > s ? "bg-white/30" : "bg-white/[0.06]"}`} />
                )}
              </div>
            ))}
            <span className="text-sm text-neutral-500 ml-2">
              {step === 1 ? "Details" : step === 2 ? "Location" : "Contact"}
            </span>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Step 1: Details */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Organization Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="City General Hospital"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/20 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-3">Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {orgTypes.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => update("type", t.value)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        form.type === t.value
                          ? "border-white/30 bg-white/[0.06]"
                          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
                      }`}
                    >
                      <span className="text-xl">{t.icon}</span>
                      <p className="text-sm text-white mt-2">{t.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-2">Description (optional)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Brief description of your organization"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/20 transition-colors resize-none"
                />
              </div>

              <ShimmerButton
                onClick={() => setStep(2)}
                disabled={!form.name || !form.type}
                className="w-full py-4"
              >
                Continue
              </ShimmerButton>
            </motion.div>
          )}

          {/* Step 2: Address & Location */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Address Line</label>
                <input
                  type="text"
                  value={form.line1}
                  onChange={(e) => update("line1", e.target.value)}
                  placeholder="123 Main Street"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/20 transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    placeholder="New Delhi"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/20 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">State</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => update("state", e.target.value)}
                    placeholder="Delhi"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/20 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-2">Pincode</label>
                <input
                  type="text"
                  value={form.pincode}
                  onChange={(e) => update("pincode", e.target.value)}
                  placeholder="110001"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Longitude</label>
                  <input
                    type="text"
                    value={form.longitude}
                    onChange={(e) => update("longitude", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Latitude</label>
                  <input
                    type="text"
                    value={form.latitude}
                    onChange={(e) => update("latitude", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleDetectLocation}
                className="w-full py-3 rounded-xl border border-white/[0.08] text-sm text-neutral-400 hover:text-white hover:border-white/20 transition-all"
              >
                📍 Detect My Location
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-full border border-white/10 text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                <ShimmerButton
                  onClick={() => setStep(3)}
                  disabled={!form.line1 || !form.city || !form.state}
                  className="flex-1 py-3"
                >
                  Continue
                </ShimmerButton>
              </div>
            </motion.div>
          )}

          {/* Step 3: Contact */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Contact Phone (optional)</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="011-12345678"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-2">Contact Email (optional)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="info@hospital.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-full border border-white/10 text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                <ShimmerButton
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      Registering...
                    </span>
                  ) : (
                    "Register Organization"
                  )}
                </ShimmerButton>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

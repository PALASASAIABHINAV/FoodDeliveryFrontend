// src/components/owenr/OwnerVerificationPending.jsx
import React from "react";
import { useUserStore } from "../../store/useAuthStore";
import { ShieldCheck, Clock, MapPin, Phone } from "lucide-react";

const OwnerVerificationPending = () => {
  const { user } = useUserStore();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-7 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
        <div className="absolute -left-16 bottom-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-500 font-semibold">
                Request submitted
              </p>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Waiting for admin approval
              </h1>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 mb-4">
            Hi{" "}
            <span className="font-semibold">
              {user?.fullName || "Partner"}
            </span>
            , we&apos;ve received your owner verification request. Our onboarding
            team will review your documents and update your account status.
          </p>

          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5 mb-4">
            <Clock className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <p className="text-[11px] text-emerald-900">
              Typical review time: <span className="font-semibold">24–48 hours</span>{" "}
              (for demo projects, this depends on your admin).
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-slate-700" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">
                  Admin contact (demo)
                </p>
                <p className="text-slate-500 text-[11px]">
                  Email: support@zentroeat.demo
                  <br />
                  Phone: +91-91234-56789
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-slate-700" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">
                  ZentroEat office (demo)
                </p>
                <p className="text-slate-500 text-[11px]">
                  Kukatpally, Hyderabad – 500072, Telangana, India
                </p>
              </div>
            </div>
          </div>

          <p className="mt-5 text-[11px] text-slate-400 text-center">
            Once your account is approved, you&apos;ll see the{" "}
            <span className="font-semibold text-slate-600">
              “Add my restaurant”
            </span>{" "}
            button on your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OwnerVerificationPending;

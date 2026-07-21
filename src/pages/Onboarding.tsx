import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";

const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState<string | null>(null);
  const { user, refreshProfile } = useAuthStore();
  const navigate = useNavigate();

  async function finish() {
    if (!user) return;
    await supabase.from("profiles").update({ gender, onboarded_at: new Date().toISOString() }).eq("id", user.id);
    await refreshProfile();
    navigate("/");
  }

  return (
    <div className="flex h-screen flex-col justify-between p-6">
      <div className="flex justify-center gap-1.5 pt-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1.5 w-8 rounded-full ${i <= step ? "bg-navy" : "bg-gray-200"}`} />
        ))}
      </div>

      {step === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <h1 className="text-2xl font-bold">Welcome to VORTEXIA 👋</h1>
          <p className="text-gray-500">Where every opportunity meets you. Let's set up your account in a few quick steps.</p>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-1 flex-col justify-center gap-4">
          <h2 className="text-xl font-bold">How do you identify?</h2>
          <p className="text-sm text-gray-500">Optional — used to personalize your experience.</p>
          <div className="space-y-2">
            {GENDERS.map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`w-full rounded-xl border px-4 py-3 text-left ${
                  gender === g ? "border-navy bg-navy/5 font-semibold" : "border-gray-200 dark:border-slate-700"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <div className="text-4xl">👑</div>
          <h1 className="text-2xl font-bold">VIP unlocks more</h1>
          <p className="text-gray-500">
            "Who viewed my profile," profile badges, a free trial, and more — you can upgrade anytime from your Profile page.
          </p>
        </div>
      )}

      <div className="flex justify-between pt-4">
        {step > 0 ? (
          <button onClick={() => setStep(step - 1)} className="text-sm text-gray-500">Back</button>
        ) : <span />}
        {step < 2 ? (
          <button onClick={() => setStep(step + 1)} className="rounded-full bg-navy px-6 py-2.5 font-semibold text-white">
            Next
          </button>
        ) : (
          <button onClick={finish} className="rounded-full bg-navy px-6 py-2.5 font-semibold text-white">
            Get started
          </button>
        )}
      </div>
    </div>
  );
}

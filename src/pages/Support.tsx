import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";

const FAQ = [
  { q: "How do I get an invite code?", a: "Ask a VIP member, or a friend who's already on VORTEXIA — every member can generate a limited number of invite codes from their Profile." },
  { q: "What are Points used for?", a: "Points are VORTEXIA's internal currency (like Upwork Connects) — used to post listings and apply to jobs. They have no cash value." },
  { q: "Why can't I post or message yet?", a: "You need to complete both email and identity verification first. Check your status under Profile → Security." },
  { q: "How does Face/Fingerprint unlock work?", a: "It uses your device's own screen lock via WebAuthn. The scan never leaves your device — VORTEXIA only receives a cryptographic confirmation." },
];

const STATUS_LABEL: Record<string, string> = { pending: "⏳ Pending", reviewed: "👀 Reviewed", resolved: "✅ Resolved" };

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export default function Support() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"faq" | "tickets">("faq");

  const { data: tickets } = useQuery({
    queryKey: ["support-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Ticket[];
    },
  });

  async function submitTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !subject.trim() || !message.trim()) return;
    const { error } = await supabase.from("support_tickets").insert({ user_id: user.id, subject, message });
    if (error) { alert(error.message); return; }
    setSubject(""); setMessage("");
    queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
    setTab("tickets");
  }

  return (
    <div className="p-4">
      <button onClick={() => navigate("/profile")} className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <ArrowLeft size={16} /> Back to Profile
      </button>
      <h1 className="mb-4 text-xl font-bold">Help & Support</h1>

      <div className="mb-4 flex gap-2">
        <button onClick={() => setTab("faq")} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === "faq" ? "bg-navy text-white" : "bg-gray-100 dark:bg-slate-800"}`}>FAQ</button>
        <button onClick={() => setTab("tickets")} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === "tickets" ? "bg-navy text-white" : "bg-gray-100 dark:bg-slate-800"}`}>My Tickets</button>
      </div>

      {tab === "faq" && (
        <div className="space-y-3">
          {FAQ.map((item) => (
            <details key={item.q} className="rounded-xl border border-gray-200 p-3 dark:border-slate-700">
              <summary className="cursor-pointer font-semibold">{item.q}</summary>
              <p className="mt-2 text-sm text-gray-500">{item.a}</p>
            </details>
          ))}
        </div>
      )}

      {tab === "tickets" && (
        <div>
          <form onSubmit={submitTicket} className="mb-5 space-y-2 rounded-xl border border-gray-200 p-3 dark:border-slate-700">
            <div className="font-semibold">Submit a new ticket</div>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:bg-slate-800 dark:border-slate-700" />
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue…" rows={3} required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:bg-slate-800 dark:border-slate-700" />
            <button type="submit" className="w-full rounded-full bg-navy py-2.5 font-semibold text-white">Submit ticket</button>
          </form>
          <div className="space-y-2">
            {tickets?.map((t) => (
              <div key={t.id} className="rounded-xl border border-gray-200 p-3 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{t.subject}</div>
                  <span className="text-xs">{STATUS_LABEL[t.status]}</span>
                </div>
                <div className="text-sm text-gray-500">{t.message}</div>
              </div>
            ))}
            {tickets?.length === 0 && <div className="text-sm text-gray-400">No tickets yet.</div>}
          </div>
        </div>
      )}
    </div>
  );
}

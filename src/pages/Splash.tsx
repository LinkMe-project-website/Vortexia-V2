export default function Splash() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-white dark:bg-slate-950">
      <div className="text-4xl font-extrabold text-navy dark:text-cyan">VORTEXIA</div>
      <div className="text-sm text-cyan">Where Every Opportunity Meets You</div>
      <div className="text-xs text-gray-400">Secure • No Social Links • One-Time Login</div>
      <div className="mt-6 h-1 w-40 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-800">
        <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-cyan to-blue" />
      </div>
    </div>
  );
}

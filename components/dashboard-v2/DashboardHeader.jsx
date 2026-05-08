export function DashboardHeader({ userName }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6">
      <h1 className="text-2xl font-semibold text-slate-900 sm:text-[2rem]">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        {userName ? `Bienvenido, ${userName}.` : 'Resumen operativo del sistema.'} Gestion diaria y seguimiento en tiempo real.
      </p>
    </section>
  );
}

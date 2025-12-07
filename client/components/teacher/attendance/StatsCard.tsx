"use client";
interface StatsCardProps {
  title: string;
  value: number;
  gradient: string;
  icon?: string;
}
export default function StatsCard({ title, value, gradient, icon }: StatsCardProps) {
  return (
    <div className={`${gradient} text-white p-6 rounded-3xl shadow-lg hover:scale-105 transition-transform`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        {icon && <span className="text-4xl opacity-80">{icon}</span>}
      </div>
    </div>
  );
}
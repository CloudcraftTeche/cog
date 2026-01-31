import {
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  Layers,
  BookMarked,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface OverviewStatsProps {
  overview?: {
    totalStudents?: number;
    totalTeachers?: number;
    totalGrades?: number;
    totalChapters?: number;
    totalAnnouncements?: number;
    totalQueries?: number;
    completionRate?: number;
  };
}

export const OverviewStats = ({ overview }: OverviewStatsProps) => {
  const router=useRouter();
  const stats = [
    {
      title: "Students",
      value: overview?.totalStudents ?? 0,
      icon: Users,
      gradient: "from-purple-500 via-purple-600 to-indigo-700",
      iconColor: "text-purple-100",
      link: "/dashboard/admin/students",
    },
    {
      title: "Teachers",
      value: overview?.totalTeachers ?? 0,
      icon: GraduationCap,
      gradient: "from-blue-500 via-blue-600 to-cyan-700",
      iconColor: "text-blue-100",
      link: "/dashboard/admin/teachers",
    },
    {
      title: "Chapters",
      value: overview?.totalChapters ?? 0,
      icon: BookOpen,
      gradient: "from-emerald-500 via-green-600 to-teal-700",
      iconColor: "text-green-100",
      link: "/dashboard/admin/chapters",
    },
    {
      title: "Announcements",
      value: overview?.totalAnnouncements ?? 0,
      icon: FileText,
      gradient: "from-orange-500 via-red-600 to-pink-700",
      iconColor: "text-orange-100",
      link: "/dashboard/admin/announcements",
    },
  ];

  const secondaryStats = [
    {
      title: "Grades",
      value: overview?.totalGrades ?? 0,
      icon: Layers,
      gradient: "from-indigo-500 via-purple-600 to-violet-700",
      link: "/dashboard/admin/grades",
    },
    {
      title: "Queries",
      value: overview?.totalQueries ?? 0,
      icon: BookMarked,
      gradient: "from-pink-500 via-rose-600 to-red-700",
      link: "/dashboard/admin/queries",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        {stats.map((stat, index) => (
          <div key={index} className="group relative"
          onClick={() => router.push(stat.link)}
          >
            <div
              className={`relative bg-gradient-to-br ${stat.gradient} text-white p-8 rounded-3xl shadow-2xl transition-all duration-500 hover:scale-105 hover:-rotate-1`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center ring-4 ring-white/10">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-right">
                  <p
                    className={`${stat.iconColor} text-sm font-semibold uppercase tracking-wider`}
                  >
                    Total
                  </p>
                  <h3 className="text-xl font-bold">{stat.title}</h3>
                </div>
              </div>
              <p className="text-5xl font-black mb-4">{stat.value}</p>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-white/20 rounded-full h-3">
                  <div className="bg-gradient-to-r from-white to-purple-100 rounded-full h-3 w-3/4 shadow-sm"></div>
                </div>
                <Star className="h-4 w-4 text-yellow-300" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {secondaryStats.map((stat, index) => (
          <div key={index} className="group relative" 
          onClick={()=>{router.push(stat.link)}}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-3xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
            <div
              className={`relative bg-gradient-to-br ${stat.gradient} text-white p-8 rounded-3xl shadow-2xl transition-all duration-500 hover:scale-105`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center ring-4 ring-white/10">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-indigo-100 text-sm font-semibold uppercase tracking-wider">
                    Total
                  </p>
                  <h3 className="text-xl font-bold">{stat.title}</h3>
                </div>
              </div>
              <p className="text-5xl font-black mb-4">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

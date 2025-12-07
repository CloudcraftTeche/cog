import { Users } from "lucide-react";

interface Student {
  id?: string;
  name?: string;
  email?: string;
  class?: string;
}

interface RecentStudentsProps {
  students?: Student[];
}

export const RecentStudents = ({ students }: RecentStudentsProps) => {
  const recentStudents = students ?? [];

  return (
    <div className="relative group mb-10">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-200/50 to-purple-200/50 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
      <div className="relative bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-violet-100/50">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-lg">
            <Users className="h-7 w-7 text-white" />
          </div>
          <div>
            <h3 className="text-3xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Recently Registered Students
            </h3>
            <p className="text-gray-500 font-medium">
              Latest student enrollments
            </p>
          </div>
        </div>
        {recentStudents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {recentStudents.slice(0, 10).map((student, index) => (
              <div key={student?.id || index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100 hover:border-purple-300 transition-all duration-300 hover:scale-105">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2 truncate">
                    {student?.name || "N/A"}
                  </h4>
                  <p className="text-sm text-gray-600 mb-1 truncate">
                    {student?.email || "N/A"}
                  </p>
                  <p className="text-sm font-semibold text-purple-600">
                    {student?.class || "N/A"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-semibold text-gray-500">
              No recent students available
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
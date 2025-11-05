"use client";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { FolderKanban, Calendar, Clock, TrendingUp } from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/api/v1/projects")
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestion de Projets</h1>
        <button className="bg-app-primary text-white px-4 py-2 rounded-md">Nouveau Projet</button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {projects.map((project: any) => (
          <div key={project.id} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <FolderKanban className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">{project.name}</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${project.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                {project.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-slate-600">Progression</div>
                <div className="font-semibold">{project.progress}%</div>
              </div>
              <div>
                <div className="text-slate-600">Budget</div>
                <div className="font-semibold">{project.budget.toLocaleString()} FCFA</div>
              </div>
              <div>
                <div className="text-slate-600">Dépensé</div>
                <div className="font-semibold">{project.spent.toLocaleString()} FCFA</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

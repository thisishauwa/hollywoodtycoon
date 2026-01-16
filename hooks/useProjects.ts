import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { Movie, ProjectStatus } from "../types";
import { useAuth } from "../contexts/AuthContext";

interface SupabaseProject {
  id: string;
  studio_id: string;
  script_id: string;
  title: string;
  genre: string;
  cast: string[];
  production_budget: number;
  marketing_budget: number;
  current_budget_spent: number;
  status: string;
  progress: number;
  phase_progress: number;
  quality: number;
  chemistry: number;
  release_month: number | null;
  release_year: number | null;
  estimated_release_month: number | null;
  estimated_release_year: number | null;
  revenue: number;
  reviews: string[];
  production_events: any[];
  created_at: string;
  updated_at: string;
}

// Convert Supabase project to local Movie type
const toMovie = (sp: SupabaseProject): Movie => ({
  id: sp.id,
  scriptId: sp.script_id,
  studioId: sp.studio_id,
  title: sp.title,
  genre: sp.genre as any,
  cast: sp.cast,
  productionBudget: sp.production_budget,
  marketingBudget: sp.marketing_budget,
  currentBudgetSpent: sp.current_budget_spent || 0,
  status: sp.status as ProjectStatus,
  progress: sp.progress,
  phaseProgress: sp.phase_progress,
  quality: sp.quality,
  chemistry: sp.chemistry,
  releaseMonth: sp.release_month || 0,
  releaseYear: sp.release_year || 0,
  estimatedReleaseMonth: sp.estimated_release_month || 0,
  estimatedReleaseYear: sp.estimated_release_year || 0,
  revenue: sp.revenue,
  reviews: sp.reviews || [],
  productionEvents: sp.production_events || [],
});

// Convert local Movie to Supabase format
const toSupabaseProject = (movie: Movie) => ({
  script_id: movie.scriptId,
  studio_id: movie.studioId,
  title: movie.title,
  genre: movie.genre,
  cast: movie.cast,
  production_budget: movie.productionBudget,
  marketing_budget: movie.marketingBudget,
  current_budget_spent: movie.currentBudgetSpent || 0,
  status: movie.status,
  progress: movie.progress,
  phase_progress: movie.phaseProgress,
  quality: movie.quality,
  chemistry: movie.chemistry,
  release_month: movie.releaseMonth || null,
  release_year: movie.releaseYear || null,
  estimated_release_month: movie.estimatedReleaseMonth || null,
  estimated_release_year: movie.estimatedReleaseYear || null,
  revenue: movie.revenue,
  reviews: movie.reviews || [],
  production_events: movie.productionEvents || [],
});

export const useProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from("projects")
        .select("*")
        .eq("studio_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("[Projects] Error fetching:", fetchError);
        setError(fetchError.message);
        return;
      }

      // Deduplicate by project ID (in case of database duplicates or rapid subscription events)
      const uniqueProjects = (data || []).reduce((acc, project) => {
        if (!acc.find(p => p.id === project.id)) {
          acc.push(project);
        }
        return acc;
      }, [] as SupabaseProject[]);
      
      console.log(`[Projects] Fetched ${data?.length || 0} projects, ${uniqueProjects.length} unique`);
      setProjects(uniqueProjects.map(toMovie));
      setError(null);
    } catch (err: any) {
      console.error("[Projects] Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProjects();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel("projects_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects",
        },
        (payload) => {
          console.log("[Projects] Real-time update:", payload.eventType);
          fetchProjects();
        }
      )
      .subscribe((status) => {
        console.log("[Projects] Subscription status:", status);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProjects]);

  // Create a new project
  const createProject = useCallback(
    async (movie: Movie) => {
      if (!user) return { error: "Not authenticated", project: null };

      const { data, error: createError } = await supabase
        .from("projects")
        .insert(toSupabaseProject(movie))
        .select()
        .single();

      if (createError) {
        console.error("[Projects] Error creating:", createError);
        return { error: createError.message, project: null };
      }

      await fetchProjects();
      return { error: null, project: toMovie(data) };
    },
    [user, fetchProjects]
  );

  // Update an existing project
  const updateProject = useCallback(
    async (projectId: string, updates: Partial<Movie>) => {
      if (!user) return { error: "Not authenticated" };

      // Convert updates to Supabase format
      const supabaseUpdates: any = {};
      if (updates.status) supabaseUpdates.status = updates.status;
      if (updates.progress !== undefined)
        supabaseUpdates.progress = updates.progress;
      if (updates.phaseProgress !== undefined)
        supabaseUpdates.phase_progress = updates.phaseProgress;
      if (updates.quality !== undefined)
        supabaseUpdates.quality = updates.quality;
      if (updates.currentBudgetSpent !== undefined)
        supabaseUpdates.current_budget_spent = updates.currentBudgetSpent;
      if (updates.releaseMonth !== undefined)
        supabaseUpdates.release_month = updates.releaseMonth;
      if (updates.releaseYear !== undefined)
        supabaseUpdates.release_year = updates.releaseYear;
      if (updates.estimatedReleaseMonth !== undefined)
        supabaseUpdates.estimated_release_month = updates.estimatedReleaseMonth;
      if (updates.estimatedReleaseYear !== undefined)
        supabaseUpdates.estimated_release_year = updates.estimatedReleaseYear;
      if (updates.revenue !== undefined)
        supabaseUpdates.revenue = updates.revenue;
      if (updates.reviews) supabaseUpdates.reviews = updates.reviews;
      if (updates.productionEvents)
        supabaseUpdates.production_events = updates.productionEvents;

      const { error: updateError } = await supabase
        .from("projects")
        .update(supabaseUpdates)
        .eq("id", projectId)
        .eq("studio_id", user.id);

      if (updateError) {
        console.error("[Projects] Error updating:", updateError);
        return { error: updateError.message };
      }

      await fetchProjects();
      return { error: null };
    },
    [user, fetchProjects]
  );

  // Delete a project
  const deleteProject = useCallback(
    async (projectId: string) => {
      if (!user) return { error: "Not authenticated" };

      const { error: deleteError } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId)
        .eq("studio_id", user.id);

      if (deleteError) {
        console.error("[Projects] Error deleting:", deleteError);
        return { error: deleteError.message };
      }

      await fetchProjects();
      return { error: null };
    },
    [user, fetchProjects]
  );

  // Get active projects (not released)
  const getActiveProjects = useCallback(() => {
    return projects.filter((p) => p.status !== ProjectStatus.Released);
  }, [projects]);

  // Get released films
  const getReleasedFilms = useCallback(() => {
    return projects.filter((p) => p.status === ProjectStatus.Released);
  }, [projects]);

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    getActiveProjects,
    getReleasedFilms,
    refetch: fetchProjects,
  };
};

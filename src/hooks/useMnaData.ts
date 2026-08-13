import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export function useRegions() {
  return useQuery({
    queryKey: ["regions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("regions").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useChurches() {
  return useQuery({
    queryKey: ["churches"],
    queryFn: async () => {
      const { data, error } = await supabase.from("churches").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useSpecialties() {
  return useQuery({
    queryKey: ["specialties"],
    queryFn: async () => {
      const { data, error } = await supabase.from("specialties").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useTrainers() {
  return useQuery({
    queryKey: ["trainers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("trainers").select("*").order("full_name");
      if (error) throw error;
      return data;
    },
  });
}

export function useDisciplines() {
  return useQuery({
    queryKey: ["disciplines"],
    queryFn: async () => {
      const { data, error } = await supabase.from("disciplines").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useAssessmentTypes() {
  return useQuery({
    queryKey: ["assessment_types"],
    queryFn: async () => {
      const { data, error } = await supabase.from("assessment_types").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function usePreLeaders() {
  return useQuery({
    queryKey: ["pre_leaders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pre_leaders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useGrades() {
  return useQuery({
    queryKey: ["grades"],
    queryFn: async () => {
      const { data, error } = await supabase.from("grades").select("*").order("stage_date");
      if (error) throw error;
      return data;
    },
  });
}

export function useAttendance() {
  return useQuery({
    queryKey: ["attendance"],
    queryFn: async () => {
      const { data, error } = await supabase.from("attendance").select("*").order("session_date");
      if (error) throw error;
      return data;
    },
  });
}

export function useObservations() {
  return useQuery({
    queryKey: ["observations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("observations").select("*");
      if (error) throw error;
      return data;
    },
  });
}

export function useCohorts() {
  return useQuery({
    queryKey: ["cohorts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cohorts").select("*").order("year");
      if (error) throw error;
      return data;
    },
  });
}

import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type StaffRole = "super_admin_1" | "super_admin_2" | "admin";

export function useStaffProfile() {
  return useQuery({
    queryKey: ["staff-profile"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return null;

      const [{ data: profile }, { data: roles }, { data: regions }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
        supabase.from("admin_regions").select("region_id").eq("user_id", user.id),
      ]);

      const roleList = (roles ?? []).map((r) => r.role as StaffRole);
      return {
        user,
        profile,
        roles: roleList,
        isSuper: roleList.some((r) => r === "super_admin_1" || r === "super_admin_2"),
        isSuper1: roleList.includes("super_admin_1"),
        regionIds: (regions ?? []).map((r) => r.region_id),
      };
    },
    staleTime: 60_000,
  });
}

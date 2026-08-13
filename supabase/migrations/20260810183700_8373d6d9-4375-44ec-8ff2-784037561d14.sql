
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_super(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_access_region(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_access_pre_leader(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.next_pre_leader_key(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.pre_leaders_set_key() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, authenticated;

-- This function allows executing raw SQL queries through the API
-- It needs to be created manually in the Supabase SQL Editor first
CREATE OR REPLACE FUNCTION pg_temp.execute(query text) 
RETURNS json AS $$
BEGIN
    EXECUTE query;
    RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

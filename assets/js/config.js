/*
  SITE CONFIG
  -----------
  Leave both values empty to run in DEMO MODE (content and admin changes are saved
  only in the visitor's own browser — good for previewing).

  To go live, create a free Supabase project (see README.md, step 2) and paste:
    - Project URL      (Settings → API → Project URL)
    - anon public key  (Settings → API → Project API keys → anon / public)

  The anon key is designed to be public. Your data is protected by the
  row-level security rules in supabase/schema.sql.
*/
window.SITE_CONFIG = {
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: ""
};

// import { createClient } from "@supabase/supabase-js";


// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseServiceRoleKey =
//   process.env.SUPABASE_SERVICE_ROLE_KEY;

// if (!supabaseUrl || !supabaseServiceRoleKey) {
//   throw new Error("Missing Supabase environment variables");
// }
// export const supabase = createClient(
//   supabaseUrl,
//   supabaseServiceRoleKey
// );



// apps/api/src/data/supabase.client.ts
// ⚠️  Backend uses SERVICE ROLE key — never use this on frontend
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables"
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});







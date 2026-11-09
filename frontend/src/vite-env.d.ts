// Type definitions for Vite environment variables
// Allows .env variables to be used in utils/supabase.ts file

/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

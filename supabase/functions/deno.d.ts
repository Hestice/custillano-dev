// Deno global type declarations for Supabase Edge Functions
declare const Deno: {
  readonly env: {
    get(key: string): string | undefined;
  };
};

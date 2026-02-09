/**
 * Global shims for Deno to resolve linting errors in Supabase Edge Functions
 */

declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
  }
  export const env: Env;

  export function serve(handler: (request: Request) => Promise<Response> | Response): void;

  export namespace errors {
    export class NotFound extends Error {}
    export class PermissionDenied extends Error {}
    export class ConnectionRefused extends Error {}
  }
}

// Suppress errors for URL imports
declare module "https://*" {
  const content: any;
  export default content;
  export const createClient: any;
}

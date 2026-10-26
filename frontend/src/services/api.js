// Backwards-compatible import path for older components.
// All requests now use the central client, which safely handles empty and
// non-JSON responses instead of calling Response.json() unconditionally.
export { api } from '../api';

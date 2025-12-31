"use client";

import { createApiClient } from "./api-client";
// TODO: need browser get config instead of mixed config
import { getConfig } from "@/lib/config";

export type {
  UnauthenticatedReason,
  ApiClient,
  AuthStore,
  AuthGrantResponse,
  AuthMeResponse,
  TrackFetchParams,
  AuthEvent,
  AuthEvents,
} from "./api-client";

export { ApiError, UnauthenticatedError } from "./api-client";

export const api = createApiClient({
  baseUrl: getConfig().apiUrl,
});

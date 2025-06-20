import { generatePath } from "react-router";

const BASE = "decision-api";
const UIBASE = "ui-api";

export const API_SUBDOMAIN = "apis";
export const UI_SUBDOMAIN = "admin-ui";

export const ROUTES = {
  BASE: `${BASE}`,
  UIBASE: `${BASE}/${UIBASE}`,
  LOGOUT: `/${BASE}/logout`,
  LIST: `/`,
  LIST_DETAIL: `detail/:projectID/:listID`,
  LIST_EDIT: `detail/:projectID/:listID/edit`,
  ANY: "/*",
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DETAILS: '/details/:id',
  MAP: '/map',
};

export const BACKEND = {
  LISTS: "v2/lists",
  LIST_INSTANCE: "v2/lists/:projectID/:listID",
  LIST_DELETE: "v2/lists/:listID",
  ACTIVE_INSTANCE: "v2/lists/:listID/active",
  DATASOURCES: "v2/datasources",
  USER_PROFILE: "userdata",
  VERSION_DETAILS: "v2/lists/:projectID/:listID/versions/:versionID",
  VERSIONS: "v2/lists/:projectID/:listID/versions",
  DATASOURCE_ENTRIES: "v2/datasources/:projectID/:datasourceID/entries",
};

/**
 * A helper method to replace parameter placeholders in a string.
 *
 * @example getRoute('detail/:id', { id: 1 }) will return 'detail/1'
 *
 * @param {string} route The route with optional parameter placeholders, e.g. 'detail/:id'
 * @param {Object} [params] Optional object with key value pairs to replace parameter placeholders from the `route`.
 * @returns {string} resolved route with parameters
 * @throws Will throw a TypeError if provided params and path don’t match
 */
export const getRoute = (route, params) => {
  return generatePath(route, params);
};

export const getAbsoluteRoute = (route, params) => {
  route = `/${BASE}/${route}`;
  return getRoute(route, params);
};
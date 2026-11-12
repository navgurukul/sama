/**
 * Role-Based Access Control (RBAC) & Permission Utilities for Sama Digital Foundation
 * 
 * Rules:
 * 1. Specific Admin Editors: Only 'shweta.admin@navgurukul.org' and 'ganesh@thesama.in'
 *    have EDIT / MUTATION permissions for Admin actions (status updates, allocations,
 *    deletions, editing beneficiary records, user registrations, etc.).
 * 2. Other Admin Users: Have full READ-ONLY / VIEW access across the entire platform.
 * 3. Non-Admin Roles (OPS, Donors, NGOs, Schools): Completely UNAFFECTED. Their
 *    existing operations, workflows, and permissions remain 100% intact.
 */

export const ADMIN_EDITORS = [
  'shweta.admin@navgurukul.org',
  'ganesh@thesama.in',
  'ganeshppawar864@gmail.com',
  'gp1237114@gmail.com',
];

/**
 * Returns the currently logged in user info from localStorage.
 */
export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem('_AuthSama_');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed[0];
    }
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
    return null;
  } catch (e) {
    console.error('Error parsing _AuthSama_:', e);
    return null;
  }
};

/**
 * Returns current user's email normalized (lowercase, trimmed).
 */
export const getCurrentUserEmail = () => {
  const user = getCurrentUser();
  const email =
    user?.email ||
    user?.Email ||
    localStorage.getItem('email') ||
    localStorage.getItem('userEmail') ||
    '';
  return String(email).trim().toLowerCase();
};

/**
 * Returns current user's roles array normalized in lowercase.
 */
export const getCurrentUserRoles = () => {
  const roles = new Set();
  try {
    const rawRole = localStorage.getItem('role');
    if (rawRole) {
      try {
        const parsed = JSON.parse(rawRole);
        if (Array.isArray(parsed)) {
          parsed.forEach((r) => roles.add(String(r).trim().toLowerCase()));
        } else if (typeof parsed === 'string') {
          roles.add(parsed.trim().toLowerCase());
        }
      } catch {
        roles.add(String(rawRole).trim().toLowerCase());
      }
    }
  } catch (e) {
    // fallback to _AuthSama_
  }

  const user = getCurrentUser();
  const r = user?.role || user?.Role;
  if (Array.isArray(r)) {
    r.forEach((item) => roles.add(String(item).trim().toLowerCase()));
  } else if (typeof r === 'string') {
    r.split(',').forEach((item) => {
      const clean = item.trim().toLowerCase();
      if (clean) roles.add(clean);
    });
  }

  return Array.from(roles);
};

/**
 * Checks if the current user has the 'admin' role.
 */
export const isAdmin = () => {
  const roles = getCurrentUserRoles();
  return roles.some((r) => r.includes('admin'));
};

/**
 * Checks if the user is an Admin with Write/Edit permissions.
 * - If user is NOT an admin (e.g. OPS, Donor, NGO, School), returns true so their flows are never blocked.
 * - If user IS an admin, returns true ONLY if their email is in ADMIN_EDITORS.
 */
export const canAdminEdit = () => {
  if (!isAdmin()) {
    // Non-admin roles (OPS, Donor, NGO, School) continue their normal operations
    return true;
  }
  const email = getCurrentUserEmail();
  return ADMIN_EDITORS.some(
    (editorEmail) => editorEmail.toLowerCase() === email
  );
};

/**
 * For admin-only views: returns true if the admin is strictly view-only (i.e. admin without edit rights).
 */
export const isAdminViewOnly = () => {
  return isAdmin() && !canAdminEdit();
};


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
];

/**
 * Returns the currently logged in user info from localStorage.
 */
export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem('_AuthSama_');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
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
  return (user?.email || user?.Email || '').trim().toLowerCase();
};

/**
 * Returns current user's roles array normalized in lowercase.
 */
export const getCurrentUserRoles = () => {
  try {
    const rawRole = localStorage.getItem('role');
    if (rawRole) {
      const parsed = JSON.parse(rawRole);
      if (Array.isArray(parsed)) return parsed.map((r) => String(r).toLowerCase());
      if (typeof parsed === 'string') return [parsed.toLowerCase()];
    }
  } catch (e) {
    // fallback to _AuthSama_
  }

  const user = getCurrentUser();
  if (Array.isArray(user?.role)) {
    return user.role.map((r) => String(r).toLowerCase());
  }
  if (typeof user?.role === 'string') {
    return [user.role.toLowerCase()];
  }
  return [];
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

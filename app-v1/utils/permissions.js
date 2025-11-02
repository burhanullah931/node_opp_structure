// Permission utilities built on DB-backed roles and permissions

// Compute a user's permissions from eager-loaded roles -> permissions
// Expects user.roles[].permissions[] each having a 'slug'
function getPermissionsForUser(user) {
  const roles = user?.roles || [];
  const slugs = [];
  for (const role of roles) {
    const perms = role?.permissions || [];
    for (const p of perms) {
      if (p?.slug) slugs.push(String(p.slug));
    }
  }
  return Array.from(new Set(slugs));
}

// Check if a set of user permissions includes a required permission
// Supports wildcard '*' and scoped wildcard like 'user.*'
function permissionAllows(userPerms, requiredPerm) {
  if (!Array.isArray(userPerms)) return false;
  if (userPerms.includes('*')) return true;

  const [reqNs, reqAct] = String(requiredPerm).split('.');
  return userPerms.some((p) => {
    if (p === requiredPerm) return true;
    const [ns, act] = String(p).split('.');
    // namespace.* grants all actions in that namespace
    if (act === '*' && ns === reqNs) return true;
    return false;
  });
}

// Ensure user has all required permissions
function hasAllPermissions(userPerms, requiredPerms) {
  const req = Array.isArray(requiredPerms) ? requiredPerms : [requiredPerms];
  return req.every((r) => permissionAllows(userPerms, r));
}

// Ensure user has at least one of the required permissions
function hasAnyPermission(userPerms, requiredPerms) {
  const req = Array.isArray(requiredPerms) ? requiredPerms : [requiredPerms];
  return req.some((r) => permissionAllows(userPerms, r));
}

module.exports = {
  getPermissionsForUser,
  hasAllPermissions,
  hasAnyPermission,
  permissionAllows,
};

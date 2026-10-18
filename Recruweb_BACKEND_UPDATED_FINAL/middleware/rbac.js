export const authorizeRole = (...allowedRoles) => {
  // Flatten so both authorize(ROLE_GROUPS.X) and authorize(...ROLE_GROUPS.X)
  // (and any mix with extra individual role strings) work identically.
  const flatAllowedRoles = allowedRoles.flat();

  return (req, res, next) => {
    const userRoles = [
      ...(req.user.roles || []),
      ...(req.user.role ? [req.user.role] : []),
    ];

    const allowed = userRoles.some((role) => flatAllowedRoles.includes(role));

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient role.",
      });
    }

    next();
  };
};

export const authorizePermission = (...permissions) => {
  const flatPermissions = permissions.flat();

  return (req, res, next) => {
    const userPermissions = req.user.permissions || [];

    const allowed = flatPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Missing permission.",
      });
    }

    next();
  };
};

// ✅ Backward compatibility
export const authorize = authorizeRole;

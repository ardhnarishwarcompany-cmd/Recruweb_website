import { verifyAccessToken } from "../utils/tokens.js";
import { User, Role, Permission } from "../models/index.js";
// Verifies the short-lived JWT access token and attaches the authenticated
// user (id, role, isActive, ...) to req.user. Use `authorize(...)` from
// middleware/rbac.js after this to restrict by role.
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, no token provided" });
  }

  try {
    const decoded = verifyAccessToken(token);

    if (decoded.tokenType && decoded.tokenType !== "access") {
      return res.status(401).json({
        success: false,
        message: "Not authorized, invalid token type",
      });
    }

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Role,
          as: "roles",
          through: { attributes: [] },
          include: [
            {
              model: Permission,
              as: "permissions",
              through: { attributes: [] },
            },
          ],
        },
      ],
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, user no longer exists",
      });
    }
    if (!user.isActive) {
      return res
        .status(403)
        .json({ success: false, message: "Account is deactivated" });
    }

    // Trust the DB role over the token's role claim in case it changed
    // since the token was issued.
    req.user = {
      id: user.id,
      role: user.role, // Legacy support

      roles: user.roles?.map((r) => r.name) || [],

      permissions: [
        ...new Set(
          user.roles.flatMap(
            (role) =>
              role.permissions?.map((permission) => permission.name) || [],
          ),
        ),
      ],

      email: user.email,
      name: user.name,
      isEmailVerified: user.isEmailVerified,
    };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token expired",
        code: "TOKEN_EXPIRED",
      });
    }
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, token failed" });
  }
};

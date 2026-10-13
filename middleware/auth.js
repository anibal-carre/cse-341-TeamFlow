export function requireAuth(req, res, next) {
  if (req.isAuthenticated?.() && req.user) return next();
  return res.status(401).json({
    error: "Unauthorized",
    message: "Sign in with GitHub at /auth/github to perform this operation."
  });
}

export function getAuthenticatedUserId(req) {
  return req.user?._id?.toString?.() ?? req.user?.id?.toString?.() ?? null;
}

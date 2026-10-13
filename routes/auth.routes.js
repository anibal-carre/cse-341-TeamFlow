import { Router } from "express";
import passport, { isOAuthConfigured } from "../config/passport.js";

const router = Router();

router.get("/github", (req, res, next) => {
  if (!isOAuthConfigured()) {
    return res.status(503).json({
      error: "OAuth Not Configured",
      message: "Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in the environment."
    });
  }
  return passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
});

router.get("/github/callback", (req, res, next) => {
  if (!isOAuthConfigured()) {
    return res.status(503).json({ error: "OAuth Not Configured", message: "GitHub OAuth is not configured." });
  }
  passport.authenticate("github", {
    failureRedirect: "/?login=failed",
    successRedirect: "/?login=success"
  })(req, res, next);
});

router.get("/me", (req, res) => {
  if (!req.isAuthenticated?.() || !req.user) {
    return res.status(401).json({ error: "Unauthorized", message: "You are not signed in." });
  }
  const { _id, githubId, displayName, username, email, avatarUrl } = req.user;
  res.status(200).json({ id: _id, githubId, displayName, username, email, avatarUrl });
});

router.post("/logout", (req, res, next) => {
  if (!req.logout) return res.status(200).json({ message: "Already signed out." });
  req.logout((error) => {
    if (error) return next(error);
    req.session?.destroy((sessionError) => {
      if (sessionError) return next(sessionError);
      res.clearCookie("teamflow.sid");
      return res.status(200).json({ message: "Signed out successfully." });
    });
  });
});

export default router;

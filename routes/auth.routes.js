import { Router } from "express";
import passport, { isOAuthConfigured } from "../config/passport.js";
import { getDatabase } from "../config/database.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

const router = Router();


const publicUser = (user) => ({
  id: user._id,
  displayName: user.displayName,
  username: user.username ?? null,
  email: user.email,
  avatarUrl: user.avatarUrl ?? null,
  provider: user.provider ?? (user.githubId ? "github" : "local")
});

const normalizeEmail = (email) => email.trim().toLowerCase();


router.post("/register", async (req, res, next) => {
  try {
    const { displayName, email, password } = req.body ?? {};
    if (typeof displayName !== "string" || displayName.trim().length < 2 || displayName.trim().length > 80) {
      return res.status(400).json({ error: "Validation Error", message: "displayName must contain 2 to 80 characters." });
    }
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: "Validation Error", message: "A valid email address is required." });
    }
    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
      return res.status(400).json({ error: "Validation Error", message: "password must contain 8 to 128 characters." });
    }

    const users = getDatabase().collection("users");
    const normalizedEmail = normalizeEmail(email);
    const existingUser = await users.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ error: "Account Exists", message: "An account with this email already exists. Sign in instead." });
    }

    const now = new Date();
    const user = {
      displayName: displayName.trim(),
      username: normalizedEmail.split("@")[0],
      email: normalizedEmail,
      passwordHash: await hashPassword(password),
      provider: "local",
      avatarUrl: null,
      createdAt: now,
      updatedAt: now
    };
    const result = await users.insertOne(user);
    user._id = result.insertedId;
    req.logIn(user, (error) => {
      if (error) return next(error);
      return res.status(201).json({ message: "Account created and signed in successfully.", user: publicUser(user) });
    });
  } catch (error) {
    return next(error);
  }
});


router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      return res.status(400).json({ error: "Validation Error", message: "email and password are required." });
    }

    const user = await getDatabase().collection("users").findOne({ email: normalizeEmail(email) });
    if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid Credentials", message: "Email or password is incorrect." });
    }

    req.logIn(user, (error) => {
      if (error) return next(error);
      return res.status(200).json({ message: "Signed in successfully.", user: publicUser(user) });
    });
  } catch (error) {
    return next(error);
  }
});

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
  res.status(200).json({ ...publicUser(req.user), githubId: req.user.githubId ?? null });
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

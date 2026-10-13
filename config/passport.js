import "dotenv/config";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { ObjectId } from "mongodb";
import { getDatabase } from "./database.js";

const configured = Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);

if (configured) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || "/auth/github/callback",
    scope: ["user:email"]
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const users = getDatabase().collection("users");
      const email = profile.emails?.[0]?.value ?? null;
      const now = new Date();
      const update = {
        githubId: profile.id,
        displayName: profile.displayName || profile.username || "GitHub user",
        username: profile.username || null,
        email,
        avatarUrl: profile.photos?.[0]?.value || null,
        updatedAt: now
      };
      const result = await users.findOneAndUpdate(
        { githubId: profile.id },
        { $set: update, $setOnInsert: { createdAt: now } },
        { upsert: true, returnDocument: "after" }
      );
      const user = result?.value ?? result;
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
}

passport.serializeUser((user, done) => done(null, user._id.toString()));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await getDatabase().collection("users").findOne({ _id: new ObjectId(id) });
    done(null, user || false);
  } catch (error) {
    done(error);
  }
});

export function isOAuthConfigured() {
  return configured;
}
export default passport;

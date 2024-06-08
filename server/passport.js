const dotenv = require('dotenv');
const passport = require('passport');
dotenv.config();
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const pool = require("./db.ts");

console.log(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/auth/google/callback"
},
  async function (accessToken, refreshToken, profile, /*cb*/done) {
    /* User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    }); */
    const user = await pool.query("SELECT * FROM users");
    let flag = false;
    for (let i = 0; i < user.rows.length; i++) {
      if (user.rows[i].id === profile.id) {
        flag = true;
        done(null, profile)
      }
    }
    if (flag) {
      return;
    }
    const newUser = await pool.query("INSERT INTO users (id,username,favourite) VALUES ($1,$2,$3) RETURNING *", [profile.id, profile.displayName, []]);
    await pool.query("INSERT INTO portfolios (available_amount,id) VALUES ($1,$2) RETURNING *", [0, profile.id]);
    done(null, profile)
  }
));
//Serializing and Deserializing User as we are using sessions
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});

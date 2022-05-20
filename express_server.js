//NEEDED FUNCTIONS/NPMS/ETC
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const {urlsForUser, generaterRandomString, getUserByEmail, passCheck} = require("./helpers");
const { send } = require("express/lib/response");

//DATABASE OF SHORT:LONG URLS
const urlDatabase = {};

//DATABASE OF USERS
const users = {};

// MIDDLEWARE
app.set("view engine", "ejs");
app.use(cookieSession({
  name: "session",
  keys: ["key"],
}));
app.use(bodyParser.urlencoded({ extended: false }));

//ROUTE FOR SIMPLE START UP PAGE WITH REDIRECTS
app.get("/", (req, res) => {
  if(!req.session.user_id) {
    res.redirect("/login")
  } else {
    res.redirect("/urls")
  }
});

//JSON ROUTE FOR DATABASE
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//LOGIN PAGE ROUTE
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id]};
  res.render("urls_login", templateVars);
});

//REGISTER PAGE ROUTE
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id]};
  res.render("urls_register", templateVars);
});

//URL PAGE ROUTE
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id] };
  if (req.session.user_id) {
    
    res.render("urls_index", templateVars);
  } else {
    return res.status(401).send("Please login or register first");
  }
});

//NEW URL FORM ROUTE
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
  if (req.session.user_id) {
    res.render("urls_new", templateVars);
  } else {
    return res.status(401).send("Please login/register to access");
  }
});

//URL DATABASE ROUTE
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userUrls = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.user_id]};
  if (!urlDatabase.hasOwnProperty(shortURL)) {
    return res.status(404).send("URL does not exist in database");
  }
  if (!req.session.user_id || !userUrls[shortURL]) {
    return res.status(401).send("Please login/register to view your URL");
  
  } else {
    res.render("urls_show", templateVars);
  }
});

//URL REDIRECT 
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase.hasOwnProperty(shortURL)) {
    return res.status(404).send("URL does not exist in database");
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});

//GENERATES NEW STRING AND REDIRECTS URL DONE
app.post("/urls", (req, res) => {
  const shortURL = generaterRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session.user_id};
  res.redirect(`/urls/${shortURL}`);
});

//EDIT FUNCTION/REDIRECTS TO SHORTURL AFTER CHANGE DONE
app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.newURL;
  res.redirect("/urls");
});

//DELETE BUTTON FUNCTION/REDIRECTS URLS DONE
app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).send("You do not have credentials to delete");
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//RESIGER ENDPOINT - REDIRECTS TO URLS
app.post("/register", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  const password = req.body.password;
  if (!req.body.email || !req.body.password) {
    return res.status(411).send("Email and/or password cannot be blank");
  }
  
  if (user) {
    return res.status(400).send("Account already exists!");
  } else {
    const id = generaterRandomString();
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[id] = {
      id,
      email: req.body.email,
      password: hashedPassword
    };
    req.session.user_id = id;
    res.redirect("/urls");
    console.log(users);
  }
});

//LOGIN ENDPOINT - REDIRECTS TO URLS
app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (!user) {
    res.status(403).send("Account not on file");
  } else if (user && !passCheck(req.body.password, user)) {
    res.status(403).send("Email/Password do not match");
  } else {
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
});

//LOGOUT ENDPOINT - REDIRECTS TO LOGIN
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//SERVER ON/LOGS IF CONNECTION IS TRUE
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
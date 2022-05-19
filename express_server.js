const express = require("express");
const res = require("express/lib/response");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs')

const {urlsForUser, generaterRandomString, findUserByEmail, passCheck} = require('./helpers')

//DATABASE OF SHORT:LONG URLS
const urlDatabase = {};

//DATABASE OF USERS
const users = {}

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));

const cookieParser = require("cookie-parser");
const { redirect } = require("express/lib/response");
const req = require("express/lib/request");
app.use(cookieParser());



//ROUTE FOR SIMPLE START UP PAGE
app.get("/", (req, res) => {
  res.send("Hello!");
});

//JSON ROUTE FOR DATABASE
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//ROUTE FOR BASIC HELLO PAGE
app.get("/hello", (req, res) => {
  res.send('<html><body>Hello <b>World</b></body?</html>\n');
});

//ROUTE FOR URL PAGE
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlsForUser(req.cookies["user_id"], urlDatabase), 
  user: users[req.cookies["user_id"]] };
  if(!req.cookies["user_id"]){
    return res.send("Please login or register first")
  } else {
  res.render("urls_index", templateVars)
  }
});



//ROUTE FOR NEW URL FORM
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  if(!req.cookies["user_id"]){
    res.redirect("/login")
  } else {
  res.render("urls_new", templateVars)
  }
});

//ROUTE FOR THE SHORT URL
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if(!urlDatabase.hasOwnProperty(shortURL)) {
    return res.status(404).send("page not found")
  } else {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.cookies["user_id"]]};
  res.render("urls_show", templateVars);
  }
});


//DELETE BUTTON FUNCTION/REDIRECTS URLS
app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.status(401).send("You do not have credentials to delete")
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")
});

//EDIT REDIRECTS TO SHORTURL
app.get('/urls/:shortURL/edit', (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.status(401).send("You do not have credentials to edit")
  }
  shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`)
});

//EDIT FUNCTION/REDIRECTS TO SHORTURL AFTER CHANGE
app.post('/urls/:shortURL', (req, res) => {
  shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.newURL;
  res.redirect(`/urls/${shortURL}`);
});


//REDIRECTS SHORT URL TO LONG URL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if(!urlDatabase.hasOwnProperty(shortURL)) {
    return res.status(404).send("page not found")
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
}
});

//GENERATES NEW STRING AND REDIRECTS URL
app.post("/urls", (req, res) => {
  const shortURL = generaterRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.cookies["user_id"]};
  res.redirect(`/urls/${shortURL}`)
});

//ROUTE FOR REGISTER PAGE
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]]}
  res.render("urls_register", templateVars)
})

//POST/RESIGER ENDPOINT - REDIRECTS TO URLS
app.post("/register", (req, res) => {
  const user = findUserByEmail(req.body.email, users)
  if (!req.body.email || !req.body.password) {
    return res.send(400, "Email and/or password cannot be blank")
  } 
  
  if (user) {
    res.send('Account already exists!')
  } else {
    const id = generaterRandomString();
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[id] = {
      id,
      email: req.body.email,
      password: hashedPassword
    }
    res.cookie('user_id', id)
    res.redirect("urls")
    console.log(users)
  }
})

//LOGIN PAGE ROUTE
app.get('/login', (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]]}
  res.render("urls_login", templateVars)
})

//LOGIN FUNCTION/REDIRECTS TO URLS(LOGGEDIN)
app.post('/login', (req, res) => {
  const user = findUserByEmail(req.body.email, users)
  if(!user) {
    res.status(403).send('Account not on file')
  } else if (user && !passCheck(req.body.password, user)) {
    res.status(403).send('Email/Password do not match')
  } else {
    res.cookie("user_id", user.id)
    res.redirect("/urls")
  }
});

//LOGOUT FUNCTION/REDICRETS TO URLS(LOGGEDOUT)
app.post('/logout', (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/login")
});

//SERVER ON/LOGS IF CONNECTION IS TRUE
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
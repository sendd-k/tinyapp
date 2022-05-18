const express = require("express");
const res = require("express/lib/response");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');


//DATABASE OF SHORT:LONG URLS
const urlDatabase = {};

//DATABASE OF USERS
const users = {}

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

//LOGIN FUNCTION/REDIRECTS TO URLS(LOGGEDIN)
app.post('/login', (req, res) => {
  res.cookie("user_id", req.body.email)
  res.redirect("/urls")
});

//LOGOUT FUNCTION/REDICRETS TO URLS(LOGGEDOUT)
app.post('/logout', (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/urls")
});

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
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars)
});



//ROUTE FOR NEW URL FORM
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars)
});

//ROUTE FOR THE SHORT URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["user_id"]]};
  res.render("urls_show", templateVars);
});


//DELETE BUTTON FUNCTION/REDIRECTS URLS
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")
});

//EDIT REDIRECTS TO SHORTURL
app.get('/urls/:shortURL/edit', (req, res) => {
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
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

//GENERATES NEW STRING AND REDIRECTS URL
app.post("/urls", (req, res) => {
  const shortURL = generaterRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`)
});

//ROUTE FOR REGISTER PAGE
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]]}
  res.render("urls_register", templateVars)
})

//POST/RESIGER ENDPOINT - REDIRECTS TO URLS
app.post("/register", (req, res) => {
  const id = generaterRandomString()
  users[id] = {
    id,
    email: req.body.email,
    password: req.body.password
  }
  res.cookie('user_id', id)
  res.redirect("urls")
  console.log(users)
})


//SERVER ON/LOGS IF CONNECTION IS TRUE
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//GENERATES RANDOM ALPHANUMERIC STRING
function generaterRandomString() {
  let string = ''
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for(let i = 0; i < chars.length; i++) {
    string += chars.charAt(Math.floor(Math.random() * chars.length));
    string = string.slice(0, 6)
  }
  return string
};

generaterRandomString()

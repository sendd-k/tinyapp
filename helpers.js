const bcrypt = require('bcryptjs')

//GENERATES RANDOM ALPHANUMERIC STRING
const generaterRandomString = function () {
  let string = ''
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for(let i = 0; i < chars.length; i++) {
    string += chars.charAt(Math.floor(Math.random() * chars.length));
    string = string.slice(0, 6)
  }
  return string
};

// CHECKS EMAIL
const getUserByEmail = function(email, usersDB) {
  for (const user in usersDB) {
    if (usersDB[user].email === email) {
      return usersDB[user]
    }
  } 
  return false;
};

// CHECKS PASSWORD
const passCheck = function(password, user) {
  if(!bcrypt.compareSync(password, user.password)) return false
  return true
};

// LOOPS DATABASE FOR MATCHING IDS TO URLS
const urlsForUser = function(id, urlDatabase) {
  let urls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      urls[url] = urlDatabase[url];
    }
  }
  return urls;
};

module.exports = {urlsForUser, generaterRandomString, getUserByEmail, passCheck}
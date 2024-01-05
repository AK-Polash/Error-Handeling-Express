const jwt = require("jsonwebtoken");

const tokenCreator = (basedOn, secret, expire) => {
  const token = jwt.sign(basedOn, secret, { expiresIn: expire });
  return token;
};

module.exports = tokenCreator;

const namePattern = /^[a-zA-Z][a-zA-Z0-9\s]*$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^\S+$/;

const nameValidator = (res, name, errorField) => {
  const field =
    errorField.charAt(0).toUpperCase() + errorField.toLowerCase().slice(1);

  if (!name) {
    res.status(400).send({ error: `${field} Is Required`, errorField });
    return true;
  } else if (!namePattern.test(name)) {
    res.status(400).send({ error: `Valid ${field} Is Required`, errorField });
    return true;
  } else {
    return false;
  }
};

const emailValidator = (res, email, errorField) => {
  if (!email) {
    res.status(400).send({ error: "Email Is Required", errorField });
    return true;
  } else if (!emailPattern.test(email)) {
    res.status(400).send({ error: "Valid Email Is Required", errorField });
    return true;
  } else {
    return false;
  }
};

const passwordValidator = (res, password, errorField) => {
  if (!password) {
    res.status(400).send({ error: "Password Is Required", errorField });
    return true;
  } else if (!passwordPattern.test(password)) {
    res
      .status(400)
      .send({ error: "Space Is Not Allowed In Password", errorField });
    return true;
  } else if (password.length < 8) {
    res
      .status(400)
      .send({ error: "Password Length Must Be Over 7 Character", errorField });
    return true;
  } else {
    return false;
  }
};

module.exports = { nameValidator, emailValidator, passwordValidator };

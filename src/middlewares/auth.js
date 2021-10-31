const User = require("../models/user");
const jwt = require("jsonwebtoken");

// auth will run before get "users/me"
const auth = async (req, res, next) => {
  try {
    // we get request from server having header 'Authorization' having value as 'Bearer '+token of user , and we extract our token
    const token = req.header("Authorization").replace("Bearer ", "");
    // we then verify the extracted token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // using decode._id and token we find our user
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: "Please authenticate ." });
  }
};

module.exports = auth;

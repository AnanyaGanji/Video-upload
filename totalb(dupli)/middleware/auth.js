const jwt = require('jsonwebtoken');
const {User} = require('../models/User');

module.exports = async (req, res, next) => {
  const token = req.headers.Authorization || req.get('Authorization');
  if (!token) return res.status(401).send('Access Denied');
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(verified.user._id);
    if (!req.user) return res.status(404).send('User not found');
    next();
  } catch (err) {
    res.status(403).send('Invalid Token');
  }
};

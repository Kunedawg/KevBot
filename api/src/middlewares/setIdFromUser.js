function setIdFromUser(req, res, next) {
  if (!req.user?.id) {
    return res.status(500).json({ error: "Unexpected issue: User ID not found" });
  }
  req.params.id = req.user.id;
  next();
}

module.exports = setIdFromUser;

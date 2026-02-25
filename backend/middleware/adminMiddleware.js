module.exports = (req, res, next) => {

  const allowedRoles = ['admin', 'CEO', 'Manager'];

  if (req.user && allowedRoles.includes(req.user.role)) {
    next(); 
  } else {
    return res.status(403).json({ 
      message: "Access denied. This area is reserved for CEO, Manager, or Admin only." 
    });
  }
};
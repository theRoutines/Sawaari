import User from '../models/User.js';

// Basic session-based auth
export const requireAuth = (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

export const requireUserType = (type) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.session.userId);
      if (!user || user.userType !== type) {
        return res.status(403).json({ message: `${type} access only` });
      }
      req.currentUser = user;
      next();
    } catch (err) {
      console.error('User type check error:', err);
      res.status(500).json({ message: 'Server error checking permissions' });
    }
  };
};

export const requireUser = requireUserType('user');
export const requireDriver = requireUserType('driver');
export const requireAdmin = requireUserType('admin');



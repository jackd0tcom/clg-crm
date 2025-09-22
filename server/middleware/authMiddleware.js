import { User } from "../model.js";

// Middleware to check if user has access to the system
export const requireAccess = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.session.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }

    // Check if user exists and is allowed
    const user = await User.findByPk(req.session.user.userId, {
      attributes: ['userId', 'username', 'firstName', 'lastName', 'email', 'role', 'isAllowed']
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Your account could not be found. Please contact support.'
      });
    }

    if (!user.isAllowed) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Your account does not have access to this system. Please contact an administrator.',
        contactInfo: {
          email: 'admin@yourlawfirm.com', // You can customize this
          message: 'Contact an administrator to request access'
        }
      });
    }

    // Add user info to request for use in other middleware/routes
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in access middleware:", error);
    res.status(500).json({
      error: 'Authentication error',
      message: 'An error occurred while verifying your access'
    });
  }
};

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Admin access required',
      message: 'Only administrators can access this endpoint'
    });
  }
  next();
};

// Middleware to check if user is admin OR the owner of the resource
export const requireAdminOrOwner = (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId;
  
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
  }

  if (req.user.role !== 'admin' && req.user.userId !== parseInt(resourceUserId)) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'You can only access your own resources unless you are an administrator'
    });
  }

  next();
};

// Middleware to log access attempts (for security monitoring)
export const logAccessAttempt = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  console.log(`[${timestamp}] Access attempt - IP: ${ip}, User-Agent: ${userAgent}, Path: ${req.path}`);
  
  next();
};

// Middleware to check user access for specific operations
export const checkUserPermission = (operation) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to perform this action'
      });
    }

    // Define permissions based on user role
    const permissions = {
      admin: ['read', 'write', 'delete', 'manage_users', 'manage_system'],
      user: ['read', 'write']
    };

    const userPermissions = permissions[req.user.role] || [];
    
    if (!userPermissions.includes(operation)) {
      return res.status(403).json({
        error: 'Permission denied',
        message: `You don't have permission to ${operation}`,
        requiredPermission: operation
      });
    }

    next();
  };
};

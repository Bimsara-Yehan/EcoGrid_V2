const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-ecogrid-2024');
        
        // Handle both old and new JWT structure
        if (decoded.user) {
            // Old structure
            req.user = decoded.user;
        } else {
            // New structure with userId and role
            req.user = {
                id: decoded.userId,
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role
            };
        }
        
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Helper function to check if user has required role
module.exports.requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const userRole = req.user.role;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ 
                message: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
            });
        }

        next();
    };
};

// Helper function to check if user is incinerator operator
module.exports.requireIncinerator = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'Incinerator') {
        return res.status(403).json({ message: 'Access denied. Incinerator operator role required.' });
    }

    next();
};

// Helper function to check if user is admin or manager
module.exports.requireAdminOrManager = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (!['Admin', 'Manager'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied. Admin or Manager role required.' });
    }

    next();
};


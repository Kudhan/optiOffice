const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Mutate request to include current user equivalent (React just passes token, backend checks 'sub')
      req.user = decoded; // Contains { sub: 'username', role: '...', iat, exp }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ detail: 'Not authenticated' });
    }
  } else {
    res.status(401).json({ detail: 'Not authenticated' });
  }
};

module.exports = { protect };

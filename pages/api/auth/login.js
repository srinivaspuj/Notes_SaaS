const jwt = require('jsonwebtoken');
const db = require('../../../lib/db');
const { cors } = require('../../../lib/cors');

// Simplified for demo - in production use bcrypt

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  db.get(
    `SELECT u.*, t.slug as tenant_slug, t.plan as tenant_plan 
     FROM users u 
     JOIN tenants t ON u.tenant_id = t.id 
     WHERE u.email = ?`,
    [email],
    (err, user) => {
      if (err || !user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Simple password check for demo (in production, use bcrypt)
      if (password !== 'password') {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { 
          userId: user.id, 
          tenantId: user.tenant_id, 
          role: user.role,
          tenantSlug: user.tenant_slug,
          tenantPlan: user.tenant_plan
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(200).json({ 
        token, 
        user: { 
          id: user.id, 
          email: user.email, 
          role: user.role, 
          tenantSlug: user.tenant_slug,
          tenantPlan: user.tenant_plan
        } 
      });
    }
  );
}

export default cors(handler);
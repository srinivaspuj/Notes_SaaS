const db = require('../../../lib/db');
const { requireRole } = require('../../../lib/auth');
const { cors } = require('../../../lib/cors');

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug } = req.query;
  const { tenantId } = req.user;

  db.get(
    'SELECT * FROM tenants WHERE id = ? AND slug = ?',
    [tenantId, slug],
    (err, tenant) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

      db.run(
        'UPDATE tenants SET plan = ? WHERE id = ?',
        ['pro', tenantId],
        function(err) {
          if (err) return res.status(500).json({ error: 'Database error' });
          if (this.changes === 0) return res.status(404).json({ error: 'Tenant not found' });
          
          res.status(200).json({ 
            message: 'Upgraded to Pro plan', 
            plan: 'pro',
            success: true
          });
        }
      );
    }
  );
}

export default cors(requireRole('admin')(handler));
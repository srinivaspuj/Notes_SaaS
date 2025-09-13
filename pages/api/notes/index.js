const db = require('../../../lib/db');
const { requireAuth } = require('../../../lib/auth');

async function handler(req, res) {
  const { method } = req;
  const { userId, tenantId } = req.user;

  switch (method) {
    case 'GET':
      db.all(
        'SELECT * FROM notes WHERE tenant_id = ? ORDER BY created_at DESC',
        [tenantId],
        (err, notes) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          res.status(200).json(notes);
        }
      );
      break;

    case 'POST':
      const { title, content } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content required' });
      }
      
      // Get current tenant plan from database
      db.get(
        'SELECT plan FROM tenants WHERE id = ?',
        [tenantId],
        (err, tenant) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
          
          // Check note limit for free plan
          if (tenant.plan === 'free') {
            db.get(
              'SELECT COUNT(*) as count FROM notes WHERE tenant_id = ?',
              [tenantId],
              (err, result) => {
                if (err) return res.status(500).json({ error: 'Database error' });
                
                if (result.count >= 3) {
                  return res.status(403).json({ error: 'Note limit reached. Upgrade to Pro plan.' });
                }
                
                createNote();
              }
            );
          } else {
            createNote();
          }
        }
      );

      function createNote() {
        db.run(
          'INSERT INTO notes (title, content, tenant_id, user_id) VALUES (?, ?, ?, ?)',
          [title, content, tenantId, userId],
          function(err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.status(201).json({ id: this.lastID, title, content });
          }
        );
      }
      break;

    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAuth(handler);
const db = require('../../lib/db');
const { requireAuth } = require('../../lib/auth');
const { cors } = require('../../lib/cors');

async function handler(req, res) {
  const { method, query } = req;
  const { id } = query;
  const { tenantId } = req.user;

  switch (method) {
    case 'GET':
      db.get(
        'SELECT * FROM notes WHERE id = ? AND tenant_id = ?',
        [id, tenantId],
        (err, note) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          if (!note) return res.status(404).json({ error: 'Note not found' });
          res.status(200).json(note);
        }
      );
      break;

    case 'PUT':
      const { title, content } = req.body;
      db.run(
        'UPDATE notes SET title = ?, content = ? WHERE id = ? AND tenant_id = ?',
        [title, content, id, tenantId],
        function(err) {
          if (err) return res.status(500).json({ error: 'Database error' });
          if (this.changes === 0) return res.status(404).json({ error: 'Note not found' });
          res.status(200).json({ id, title, content });
        }
      );
      break;

    case 'DELETE':
      db.run(
        'DELETE FROM notes WHERE id = ? AND tenant_id = ?',
        [id, tenantId],
        function(err) {
          if (err) return res.status(500).json({ error: 'Database error' });
          if (this.changes === 0) return res.status(404).json({ error: 'Note not found' });
          res.status(200).json({ message: 'Note deleted' });
        }
      );
      break;

    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}

export default cors(requireAuth(handler));
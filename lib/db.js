// Database abstraction layer - supports both TiDB and in-memory fallback
const tidb = process.env.TIDB_HOST ? require('./tidb') : null;
const simplePassword = 'password';

const data = {
  tenants: [
    { id: 1, slug: 'acme', name: 'Acme Corp', plan: 'free' },
    { id: 2, slug: 'globex', name: 'Globex Inc', plan: 'free' }
  ],
  users: [
    { id: 1, email: 'admin@acme.test', password: simplePassword, role: 'admin', tenant_id: 1 },
    { id: 2, email: 'user@acme.test', password: simplePassword, role: 'member', tenant_id: 1 },
    { id: 3, email: 'admin@globex.test', password: simplePassword, role: 'admin', tenant_id: 2 },
    { id: 4, email: 'user@globex.test', password: simplePassword, role: 'member', tenant_id: 2 }
  ],
  notes: [],
  nextId: 1
};

const db = {
  get: async (query, params, callback) => {
    if (tidb) {
      try {
        const result = await tidb.get(query, params);
        callback(null, result);
      } catch (error) {
        callback(error);
      }
      return;
    }
    if (query.includes('FROM users')) {
      const user = data.users.find(u => u.email === params[0]);
      if (user) {
        const tenant = data.tenants.find(t => t.id === user.tenant_id);
        callback(null, { ...user, tenant_slug: tenant.slug, tenant_plan: tenant.plan });
      } else {
        callback(null, null);
      }
    } else if (query.includes('FROM tenants WHERE id') && params.length === 2) {
      const tenant = data.tenants.find(t => t.id === params[0] && t.slug === params[1]);
      callback(null, tenant);
    } else if (query.includes('FROM tenants WHERE id')) {
      const tenant = data.tenants.find(t => t.id == params[0]);
      callback(null, tenant);
    } else if (query.includes('FROM notes WHERE id')) {
      const note = data.notes.find(n => n.id == parseInt(params[0]) && n.tenant_id == parseInt(params[1]));
      callback(null, note);
    } else if (query.includes('COUNT(*)')) {
      const count = data.notes.filter(n => n.tenant_id == params[0]).length;
      callback(null, { count });
    }
  },
  all: async (query, params, callback) => {
    if (tidb) {
      try {
        const result = await tidb.all(query, params);
        callback(null, result);
      } catch (error) {
        callback(error);
      }
      return;
    }
    if (query.includes('FROM notes')) {
      const notes = data.notes.filter(n => n.tenant_id == params[0]);
      callback(null, notes);
    }
  },
  run: async (query, params, callback) => {
    if (tidb) {
      try {
        const result = await tidb.run(query, params);
        callback.call(result, null);
      } catch (error) {
        callback(error);
      }
      return;
    }
    if (query.includes('INSERT INTO notes')) {
      const note = {
        id: data.nextId++,
        title: params[0],
        content: params[1],
        tenant_id: params[2],
        user_id: params[3],
        created_at: new Date().toISOString()
      };
      data.notes.push(note);
      callback.call({ lastID: note.id }, null);
    } else if (query.includes('UPDATE notes')) {
      const noteIndex = data.notes.findIndex(n => String(n.id) === String(params[2]) && String(n.tenant_id) === String(params[3]));
      if (noteIndex >= 0) {
        data.notes[noteIndex].title = params[0];
        data.notes[noteIndex].content = params[1];
        callback.call({ changes: 1 }, null);
      } else {
        callback.call({ changes: 0 }, null);
      }
    } else if (query.includes('DELETE FROM notes')) {
      const noteIndex = data.notes.findIndex(n => n.id == parseInt(params[0]) && n.tenant_id == parseInt(params[1]));
      if (noteIndex >= 0) {
        data.notes.splice(noteIndex, 1);
        callback.call({ changes: 1 }, null);
      } else {
        callback.call({ changes: 0 }, null);
      }
    } else if (query.includes('UPDATE tenants')) {
      const tenant = data.tenants.find(t => t.id == params[1]);
      if (tenant) {
        tenant.plan = params[0];
        callback.call({ changes: 1 }, null);
      } else {
        callback.call({ changes: 0 }, null);
      }
    }
  }
};

module.exports = db;
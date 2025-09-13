import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      fetchNotes(token);
    }
  }, []);

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        fetchNotes(data.token);
        setError('');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Login failed');
    }
  };

  const fetchNotes = async (token) => {
    try {
      const res = await fetch('/api/notes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setNotes(data);
    } catch (err) {
      console.error('Failed to fetch notes');
    }
  };

  const createNote = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: title.trim(), content: content.trim() })
      });
      const data = await res.json();
      
      if (res.ok) {
        setNotes([data, ...notes]);
        setTitle('');
        setContent('');
        setError('');
      } else {
        setError(data.error || 'Failed to create note');
      }
    } catch (err) {
      setError('Failed to create note: ' + err.message);
    }
  };

  const updateNote = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/notes/${editingNote.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: title.trim(), content: content.trim() })
      });
      const data = await res.json();
      
      if (res.ok) {
        setNotes(notes.map(note => note.id === editingNote.id ? { ...note, title: data.title, content: data.content } : note));
        setTitle('');
        setContent('');
        setEditingNote(null);
        setError('');
      } else {
        setError(data.error || 'Failed to update note');
      }
    } catch (err) {
      setError('Failed to update note: ' + err.message);
    }
  };

  const startEdit = (note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setError('');
  };

  const deleteNote = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setNotes(notes.filter(note => note.id !== id));
        setError('');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete note');
      }
    } catch (err) {
      setError('Failed to delete note: ' + err.message);
    }
  };

  const upgrade = async () => {
    if (!confirm('Upgrade to Pro plan for unlimited notes?')) {
      return;
    }
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/tenants/${user.tenantSlug}/upgrade`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        // Update user state immediately
        const updatedUser = { ...user, tenantPlan: 'pro' };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setError('');
        alert('🎉 Successfully upgraded to Pro plan! You can now create unlimited notes.');
      } else {
        const data = await res.json();
        setError(data.error || 'Upgrade failed');
      }
    } catch (err) {
      setError('Upgrade failed: ' + err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setNotes([]);
  };

  if (!user) {
    return (
      <>
        <Head>
          <title>Notes SaaS - Login</title>
          <style jsx global>{`
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: #f8f9fa;
              min-height: 100vh;
            }
            @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
            @keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
            @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
          `}</style>
        </Head>
        <div style={{ minHeight: '100vh' }}>
          {/* Navbar */}
          <div style={{
            background: 'white',
            padding: '20px 40px',
            borderBottom: '1px solid #e9ecef',
            position: 'sticky',
            top: 0,
            zIndex: 100
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center'
            }}>
              <h1 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#333',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📝 Notes SaaS
              </h1>
            </div>
          </div>

          {/* Split Screen Content */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            minHeight: 'calc(100vh - 80px)',
            maxWidth: '1200px',
            margin: '0 auto',
            boxShadow: '0 0 50px rgba(0,0,0,0.1)'
          }}>
          {/* Left Side - Login Form */}
          <div style={{
            background: 'white',
            padding: '60px 50px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            animation: 'slideInLeft 0.8s ease-out'
          }}>
            <div style={{ marginBottom: '40px' }}>
              <h1 style={{ 
                color: '#333', 
                fontSize: '32px', 
                fontWeight: '700',
                marginBottom: '12px'
              }}>Sign in to Notes SaaS</h1>
              <p style={{ color: '#666', fontSize: '16px' }}>Welcome back! Please sign in to your account.</p>
            </div>
            <form onSubmit={login}>
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '15px 20px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4facfe'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  required
                />
              </div>
              <div style={{ marginBottom: '30px' }}>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '15px 20px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4facfe'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  required
                />
              </div>
              <button 
                type="submit" 
                style={{
                  width: '100%',
                  padding: '15px',
                  background: '#4facfe',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.background = '#3d8bfd';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.background = '#4facfe';
                }}
              >
                Sign In
              </button>
            </form>
            
            {error && (
              <div style={{
                marginTop: '20px',
                padding: '12px',
                background: '#fee',
                color: '#c33',
                borderRadius: '8px',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}
            
            <div style={{
              marginTop: '40px',
              padding: '20px',
              background: '#f8f9fa',
              borderRadius: '8px',
              fontSize: '12px'
            }}>
              <p style={{ fontWeight: '600', marginBottom: '10px', color: '#333' }}>Test Accounts:</p>
              <div style={{ color: '#666', lineHeight: '1.6' }}>
                <p><strong>Acme:</strong> admin@acme.test / password</p>
                <p style={{ marginLeft: '20px' }}>user@acme.test / password</p>
                <p><strong>Globex:</strong> admin@globex.test / password</p>
                <p style={{ marginLeft: '20px' }}>user@globex.test / password</p>
              </div>
            </div>
          </div>

          {/* Right Side - Illustration */}
          <div style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 40px',
            color: 'white',
            animation: 'slideInRight 0.8s ease-out'
          }}>
            <div style={{
              fontSize: '120px',
              marginBottom: '30px',
              animation: 'float 3s ease-in-out infinite'
            }}>
              📝
            </div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              Organize Your Ideas
            </h2>
            <p style={{
              fontSize: '16px',
              textAlign: 'center',
              opacity: 0.9,
              lineHeight: '1.6',
              maxWidth: '300px'
            }}>
              Create, edit, and manage your notes with our powerful multi-tenant platform. 
              Perfect for teams and individuals.
            </p>
            <div style={{
              marginTop: '40px',
              display: 'flex',
              gap: '20px',
              fontSize: '40px'
            }}>
              <span style={{ animation: 'float 3s ease-in-out infinite 0.5s' }}>📊</span>
              <span style={{ animation: 'float 3s ease-in-out infinite 1s' }}>💼</span>
              <span style={{ animation: 'float 3s ease-in-out infinite 1.5s' }}>✨</span>
            </div>
          </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Notes SaaS - Dashboard</title>
        <style jsx global>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
          }
          @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes bounce { 0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); } 40%, 43% { transform: translate3d(0, -8px, 0); } 70% { transform: translate3d(0, -4px, 0); } 90% { transform: translate3d(0, -2px, 0); } }
        `}</style>
      </Head>
      <div style={{ minHeight: '100vh' }}>
        {/* Navbar */}
        <div style={{
          background: 'white',
          padding: '20px 40px',
          borderBottom: '1px solid #e9ecef',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center'
          }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#333',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📝 Notes SaaS
            </h1>
          </div>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px 1fr', gap: '25px', maxWidth: '1400px', margin: '0 auto' }}>
          {/* Left Column - Header & Plan */}
          <div>
            {/* Header */}
            <div style={{
              background: '#f8f9fa',
              padding: '25px 30px',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              marginBottom: '25px',
              animation: 'slideIn 0.6s ease-out'
            }}>
              <div>
                <h1 style={{ 
                  color: '#333', 
                  fontSize: '24px', 
                  fontWeight: '700',
                  marginBottom: '5px'
                }}>
                  📝 {user.email}
                </h1>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  {user.role === 'admin' ? '👑 Administrator' : '👤 Member'} • {user.tenantSlug.toUpperCase()}
                </p>
              </div>
              <button 
                onClick={logout}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  marginTop: '15px',
                  width: '100%'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                🚪 Logout
              </button>
            </div>
            
            {/* Plan Status */}
            <div style={{
              background: user.tenantPlan === 'pro' 
                ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              padding: '25px 30px',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              color: 'white',
              animation: 'fadeInUp 0.6s ease-out 0.2s both'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
                {user.tenantPlan === 'pro' ? '✨ Pro Plan' : '🎆 Free Plan'}
              </h3>
              {user.tenantPlan === 'free' ? (
                <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '15px' }}>
                  📄 {notes.length}/3 notes used
                </p>
              ) : (
                <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '15px' }}>
                  ♾️ Unlimited notes available
                </p>
              )}
              {user.tenantPlan === 'free' && user.role === 'admin' && (
                <button 
                  onClick={upgrade}
                  style={{
                    padding: '12px 24px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  🚀 Upgrade to Pro
                </button>
              )}
            </div>
          </div>

          {/* Middle Column - Note Form */}
          <div style={{
            background: '#f8f9fa',
            padding: '30px',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            animation: 'fadeInUp 0.6s ease-out 0.4s both',
            height: 'fit-content',
            position: 'sticky',
            top: '20px'
          }}>
            <h3 style={{
              color: '#333',
              fontSize: '20px',
              fontWeight: '700',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              {editingNote ? '✏️ Edit Note' : '✨ Create New Note'}
            </h3>
            
            <form onSubmit={editingNote ? updateNote : createNote}>
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="📝 Enter note title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '15px 20px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '12px',
                    fontSize: '16px',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4facfe'}
                  onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
                  required
                />
              </div>
              <div style={{ marginBottom: '25px' }}>
                <textarea
                  placeholder="💬 Write your note content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '15px 20px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '12px',
                    fontSize: '16px',
                    height: '120px',
                    resize: 'vertical',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4facfe'}
                  onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
                  required
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: editingNote ? 'column' : 'row', gap: '12px' }}>
                <button 
                  type="submit" 
                  disabled={!editingNote && user.tenantPlan === 'free' && notes.length >= 3}
                  style={{ 
                    padding: '15px 20px',
                    background: editingNote 
                      ? '#ffc107'
                      : (!editingNote && user.tenantPlan === 'free' && notes.length >= 3 
                          ? '#ddd' 
                          : '#28a745'),
                    color: (!editingNote && user.tenantPlan === 'free' && notes.length >= 3) ? '#999' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: (!editingNote && user.tenantPlan === 'free' && notes.length >= 3) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    width: '100%',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (e.target.style.cursor !== 'not-allowed') {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.background = editingNote ? '#e0a800' : '#218838';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.background = editingNote ? '#ffc107' : '#28a745';
                  }}
                >
                  {editingNote 
                    ? '✨ Update Note' 
                    : (user.tenantPlan === 'free' && notes.length >= 3 
                        ? '🚫 Limit Reached - Upgrade to Pro' 
                        : '🎆 Create Note')}
                </button>
                
                {editingNote && (
                  <button 
                    type="button" 
                    onClick={cancelEdit}
                    style={{ 
                      padding: '12px 20px',
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      width: '100%',
                      textAlign: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.background = '#5a6268';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.background = '#6c757d';
                    }}
                  >
                    ❌ Cancel
                  </button>
                )}
              </div>
            </form>
            
            {/* Error Message */}
            {error && (
              <div style={{
                marginTop: '20px',
                padding: '15px 20px',
                background: '#fee',
                color: '#c33',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Right Column - Notes List */}
          <div style={{
            background: '#f8f9fa',
            padding: '30px',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            animation: 'fadeInUp 0.6s ease-out 0.6s both'
          }}>
            <h2 style={{
              color: '#333',
              fontSize: '22px',
              fontWeight: '700',
              marginBottom: '25px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              📁 Your Notes ({notes.length})
            </h2>
            
            {notes.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#999'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📄</div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px', color: '#666' }}>
                  No notes yet
                </h3>
                <p style={{ fontSize: '14px' }}>
                  Create your first note using the form above!
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {notes.map((note, index) => (
                  <div 
                    key={note.id} 
                    style={{
                      background: '#f8f9fa',
                      padding: '25px',
                      borderRadius: '12px',
                      border: '1px solid #e9ecef',
                      transition: 'all 0.3s ease',
                      animation: `fadeInUp 0.6s ease-out ${0.1 * index}s both`,
                      position: 'relative',
                      overflow: 'hidden',
                      minHeight: '180px',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '4px',
                      height: '100%',
                      background: '#4facfe'
                    }}></div>
                    
                    <h3 style={{
                      margin: '0 0 15px 0',
                      color: '#333',
                      fontSize: '18px',
                      fontWeight: '700',
                      lineHeight: '1.4'
                    }}>
                      {note.title}
                    </h3>
                    
                    <p style={{
                      margin: '0 0 auto 0',
                      color: '#666',
                      fontSize: '15px',
                      lineHeight: '1.6',
                      wordBreak: 'break-word',
                      flex: 1
                    }}>
                      {note.content}
                    </p>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '15px',
                      borderTop: '1px solid #e9ecef',
                      marginTop: '15px'
                    }}>
                      <small style={{
                        color: '#999',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        📅 {new Date(note.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </small>
                      
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          onClick={() => startEdit(note)} 
                          style={{
                            background: '#ffc107',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.background = '#e0a800';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.background = '#ffc107';
                          }}
                        >
                          Edit
                        </button>
                        
                        <button 
                          onClick={() => deleteNote(note.id)} 
                          style={{
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.background = '#c82333';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.background = '#dc3545';
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    </>
  );
}
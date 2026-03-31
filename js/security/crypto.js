// Crypto utility to avoid exposing sensitive logic clearly
// Simulating secure hashing and token generation

export const HashUtils = {
  // Very basic simulation of hashing for demo purposes (NOT FOR REAL PROD)
  // In a real vanilla JS app without backend, you can't truly secure passwords natively 
  // without SubtleCrypto, but for simulation we just obfuscate
  hashPassword: async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  generateToken: () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
};

export const Session = {
  setToken: (user) => {
    const token = HashUtils.generateToken();
    const sessionData = {
      token,
      userId: user.id,
      role: user.role,
      name: user.name,
      expiry: Date.now() + 86400000 // 24 hours
    };
    // Obfuscate session data slightly
    sessionStorage.setItem('_cars_sess', btoa(JSON.stringify(sessionData)));
    return token;
  },

  getSession: () => {
    try {
      const data = sessionStorage.getItem('_cars_sess');
      if (!data) return null;
      const session = JSON.parse(atob(data));
      if (Date.now() > session.expiry) {
        sessionStorage.removeItem('_cars_sess');
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },

  clearSession: () => {
    sessionStorage.removeItem('_cars_sess');
  },
  
  isAuthenticated: () => !!Session.getSession(),
  isAdmin: () => {
    const s = Session.getSession();
    return s && s.role === 'admin';
  }
};

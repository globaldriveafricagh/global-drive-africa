import { dbInstance } from '../database/db.js';
import { HashUtils, Session } from '../security/crypto.js';

export const AuthAPI = {
  async register(name, email, password) {
    try {
      const existingUser = await dbInstance.getOneByIndex('users', 'email', email);
      if (existingUser) throw new Error('Email already registered');

      const hashedPassword = await HashUtils.hashPassword(password);
      
      const userId = await dbInstance.insert('users', {
        name,
        email,
        password: hashedPassword,
        role: 'user', // Default role
        createdAt: new Date().toISOString()
      });

      return "Registration successful. Please log in.";
    } catch (err) {
      throw err;
    }
  },

  async login(email, password) {
    try {
      const user = await dbInstance.getOneByIndex('users', 'email', email);
      if (!user) throw new Error('Invalid email or password');

      const hashedPassword = await HashUtils.hashPassword(password);
      if (user.password !== hashedPassword) {
        throw new Error('Invalid email or password');
      }

      // Create session
      const token = Session.setToken(user);
      return { token, user: { id: user.id, name: user.name, role: user.role } };
    } catch (err) {
      throw err;
    }
  },

  logout() {
    Session.clearSession();
    window.location.href = 'login.html';
  },

  checkAuth(requiredRole = null) {
    const session = Session.getSession();
    if (!session) {
      window.location.href = 'login.html';
      return null;
    }
    
    if (requiredRole && session.role !== requiredRole) {
      // Unauthorized access
      window.location.href = 'index.html';
      return null;
    }

    return session;
  }
};

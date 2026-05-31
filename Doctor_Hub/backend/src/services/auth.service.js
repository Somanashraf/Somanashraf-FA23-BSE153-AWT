const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const config = require('../config/env');
const { InvalidAccountException } = require('../exceptions');

function signAccess(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwt.accessSecret, { expiresIn: config.jwt.accessTtl });
}

function signRefresh(user) {
  return jwt.sign({ id: user.id, tokenType: 'refresh' }, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshTtl });
}

class AuthService {
  async register(payload) {
    const exists = await userRepository.findByEmail(payload.email);
    if (exists) throw new InvalidAccountException('Email is already registered');
    const passwordHash = await bcrypt.hash(payload.password, 12);
    const user = await userRepository.create({ ...payload, passwordHash, roleName: payload.role || 'PATIENT' });
    return { user, accessToken: signAccess(user), refreshToken: signRefresh(user) };
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user || user.status !== 'ACTIVE') throw new InvalidAccountException();
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw new InvalidAccountException();
    delete user.password_hash;
    return { user, accessToken: signAccess(user), refreshToken: signRefresh(user) };
  }

  async refresh(refreshToken) {
    try {
      const payload = jwt.verify(refreshToken, config.jwt.refreshSecret);
      const user = await userRepository.findById(payload.id);
      if (!user) throw new InvalidAccountException();
      return { accessToken: signAccess(user), refreshToken: signRefresh(user) };
    } catch (error) {
      throw new InvalidAccountException('Refresh token is invalid or expired');
    }
  }
}

module.exports = new AuthService();

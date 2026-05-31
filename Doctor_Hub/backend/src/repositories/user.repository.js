const { query } = require('../config/db');

class UserRepository {
  findByEmail(email) {
    return query(`SELECT u.*, r.name AS role FROM users u JOIN roles r ON r.id = u.role_id WHERE u.email = ? LIMIT 1`, [email]).then(rows => rows[0]);
  }

  findById(id) {
    return query(`SELECT u.id, u.full_name, u.email, u.phone, u.status, r.name AS role FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = ?`, [id]).then(rows => rows[0]);
  }

  async create({ fullName, email, phone, passwordHash, roleName }) {
    const role = await query('SELECT id FROM roles WHERE name = ?', [roleName]);
    const result = await query(
      'INSERT INTO users (role_id, full_name, email, phone, password_hash, status) VALUES (?, ?, ?, ?, ?, ?)',
      [role[0].id, fullName, email, phone, passwordHash, 'ACTIVE']
    );
    return this.findById(result.insertId);
  }

  list() {
    return query(`SELECT u.id, u.full_name, u.email, u.phone, u.status, r.name AS role, u.created_at FROM users u JOIN roles r ON r.id = u.role_id ORDER BY u.created_at DESC`);
  }
}

module.exports = new UserRepository();

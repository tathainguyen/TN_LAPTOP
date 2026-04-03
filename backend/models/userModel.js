import { pool } from '../config/db.js';

export async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE email = ? LIMIT 1',
    [email]
  );

  return rows[0] || null;
}

export async function findRoleByName(roleName) {
  const [rows] = await pool.execute(
    'SELECT id, role_name FROM roles WHERE role_name = ? LIMIT 1',
    [roleName]
  );

  return rows[0] || null;
}

export async function createUser(userData) {
  const {
    roleId,
    email,
    passwordHash,
    fullName,
    phone = null,
    gender = null,
    dateOfBirth = null,
    avatarUrl = null,
    emailVerified = 0,
    userStatus = 'ACTIVE',
    googleId = null,
    facebookId = null,
  } = userData;

  const [result] = await pool.execute(
    `INSERT INTO users (
      role_id,
      email,
      password_hash,
      full_name,
      phone,
      gender,
      date_of_birth,
      avatar_url,
      email_verified,
      user_status,
      google_id,
      facebook_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      roleId,
      email,
      passwordHash,
      fullName,
      phone,
      gender,
      dateOfBirth,
      avatarUrl,
      emailVerified,
      userStatus,
      googleId,
      facebookId,
    ]
  );

  return result.insertId;
}
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

export async function findRoleById(roleId) {
  const [rows] = await pool.execute(
    'SELECT id, role_name FROM roles WHERE id = ? LIMIT 1',
    [Number(roleId)]
  );

  return rows[0] || null;
}

export async function getRoles() {
  const [rows] = await pool.query(
    `SELECT id, role_name, description
    FROM roles
    ORDER BY id ASC`
  );

  return rows;
}

function buildUserWhereClause({ keyword = '', roleId = null, status = 'all' } = {}) {
  const whereParts = ['1 = 1'];
  const params = [];

  if (keyword && String(keyword).trim()) {
    const like = `%${String(keyword).trim()}%`;
    whereParts.push('(u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
    params.push(like, like, like);
  }

  if (roleId) {
    whereParts.push('u.role_id = ?');
    params.push(Number(roleId));
  }

  if (status === 'active') {
    whereParts.push("u.user_status = 'ACTIVE'");
  }

  if (status === 'blocked') {
    whereParts.push("u.user_status = 'BLOCKED'");
  }

  if (status === 'verified') {
    whereParts.push('u.email_verified = 1');
  }

  if (status === 'unverified') {
    whereParts.push('u.email_verified = 0');
  }

  return {
    whereSQL: ` WHERE ${whereParts.join(' AND ')}`,
    params,
  };
}

function userSelectSQL() {
  return `SELECT
    u.id,
    u.role_id,
    r.role_name,
    r.description AS role_description,
    u.email,
    u.full_name,
    u.phone,
    u.gender,
    u.date_of_birth,
    u.avatar_url,
    u.email_verified,
    u.user_status,
    u.last_login_at,
    u.created_at,
    u.updated_at
  FROM users u
  LEFT JOIN roles r ON u.role_id = r.id`;
}

export async function getUsers(options = {}) {
  const {
    keyword = '',
    roleId = null,
    status = 'all',
    page = null,
    limit = null,
  } = options;

  const { whereSQL, params } = buildUserWhereClause({ keyword, roleId, status });
  const orderSQL = ' ORDER BY u.created_at DESC';
  const hasPaging = Number.isInteger(page) && page > 0 && Number.isInteger(limit) && limit > 0;

  if (!hasPaging) {
    const [rows] = await pool.query(`${userSelectSQL()}${whereSQL}${orderSQL}`, params);
    return rows;
  }

  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `${userSelectSQL()}${whereSQL}${orderSQL} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    ${whereSQL}`,
    params
  );

  const total = Number(countRows[0]?.total || 0);

  return {
    items: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function getUserById(id) {
  const [rows] = await pool.query(
    `${userSelectSQL()} WHERE u.id = ? LIMIT 1`,
    [Number(id)]
  );

  return rows[0] || null;
}

export async function updateUserById(id, userData) {
  const allowedFields = {
    roleId: 'role_id',
    fullName: 'full_name',
    phone: 'phone',
    gender: 'gender',
    dateOfBirth: 'date_of_birth',
    avatarUrl: 'avatar_url',
    emailVerified: 'email_verified',
    userStatus: 'user_status',
  };

  const updates = [];
  const params = [];

  Object.entries(allowedFields).forEach(([key, column]) => {
    if (!Object.prototype.hasOwnProperty.call(userData, key)) {
      return;
    }

    updates.push(`${column} = ?`);
    params.push(userData[key]);
  });

  if (updates.length === 0) {
    return false;
  }

  params.push(Number(id));

  const [result] = await pool.query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
    params
  );

  return result.affectedRows > 0;
}

export async function updateUserStatusById(id, userStatus) {
  const [result] = await pool.query(
    'UPDATE users SET user_status = ? WHERE id = ?',
    [userStatus, Number(id)]
  );

  return result.affectedRows > 0;
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
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import {
  createUser,
  findRoleById,
  findRoleByName,
  findUserByEmail,
} from '../models/userModel.js';

function buildAuthToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      roleId: user.role_id,
      fullName: user.full_name,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const { password_hash, ...safeUser } = user;
  return safeUser;
}

export async function register(req, res) {
  try {
    const requestBody = req.body || {};
    console.log('Dữ liệu nhận được tại Backend:', req.body);

    const {
      full_name,
      email,
      password,
      phone = null,
      gender = null,
      dateOfBirth = null,
    } = requestBody;

    const normalizedFullName = String(full_name || '').trim();
    const normalizedEmailInput = String(email || '').trim();
    const normalizedPasswordInput = String(password || '').trim();

    const missingFields = [];

    if (!normalizedFullName) {
      missingFields.push('full_name');
    }

    if (!normalizedEmailInput) {
      missingFields.push('email');
    }

    if (!normalizedPasswordInput) {
      missingFields.push('password');
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Thiếu trường bắt buộc: ${missingFields.join(', ')}`,
        data: {
          missing_fields: missingFields,
        },
      });
    }

    const normalizedEmail = normalizedEmailInput.toLowerCase();
    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'Email này đã được sử dụng.',
        data: null,
      });
    }

    const customerRole = await findRoleByName('CUSTOMER');

    if (!customerRole) {
      return res.status(500).json({
        status: 'error',
        message: 'Không tìm thấy vai trò khách hàng trong hệ thống.',
        data: null,
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userId = await createUser({
      roleId: customerRole.id,
      email: normalizedEmail,
      passwordHash,
      fullName: normalizedFullName,
      phone: phone ? String(phone).trim() : null,
      gender: gender || null,
      dateOfBirth: dateOfBirth || null,
      avatarUrl: null,
      emailVerified: 0,
      userStatus: 'ACTIVE',
      googleId: null,
      facebookId: null,
    });

    const createdUser = await findUserByEmail(normalizedEmail);
    const customerRoleName = customerRole?.role_name || 'CUSTOMER';
    const token = buildAuthToken({
      ...createdUser,
      id: userId,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Đăng ký tài khoản thành công.',
      data: {
        user: {
          ...sanitizeUser(createdUser),
          role_name: customerRoleName,
        },
        token,
      },
    });
  } catch (error) {
    console.error('❌ Lỗi register:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Đăng ký thất bại. Vui lòng thử lại sau.',
      data: null,
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Vui lòng cung cấp email và mật khẩu.',
        data: null,
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Email hoặc mật khẩu không chính xác.',
        data: null,
      });
    }

    if (user.user_status === 'BLOCKED') {
      return res.status(403).json({
        status: 'error',
        message: 'Tài khoản của bạn đã bị khóa.',
        data: null,
      });
    }

    if (!user.password_hash) {
      return res.status(400).json({
        status: 'error',
        message: 'Tài khoản này chưa được thiết lập mật khẩu đăng nhập.',
        data: null,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Email hoặc mật khẩu không chính xác.',
        data: null,
      });
    }

    const token = buildAuthToken(user);
    const role = await findRoleById(user.role_id);

    return res.status(200).json({
      status: 'success',
      message: 'Đăng nhập thành công.',
      data: {
        user: {
          ...sanitizeUser(user),
          role_name: role?.role_name || null,
        },
        token,
      },
    });
  } catch (error) {
    console.error('❌ Lỗi login:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Đăng nhập thất bại. Vui lòng thử lại sau.',
      data: null,
    });
  }
}
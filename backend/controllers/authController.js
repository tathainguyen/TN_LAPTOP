import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

import {
  createUser,
  findRoleById,
  findRoleByName,
  findUserByEmail,
  updateUserById,
} from '../models/userModel.js';

const EMAIL_VERIFICATION_COOLDOWN_MS = 30_000;
const verificationCooldownByUserId = new Map();

function getFrontendBaseUrl() {
  return process.env.FRONTEND_URL || 'http://localhost:5173';
}

function getBackendBaseUrl(req) {
  return `${req.protocol}://${req.get('host')}`;
}

function buildEmailVerificationToken(user) {
  const secret = process.env.EMAIL_SECRET || process.env.JWT_SECRET;
  return jwt.sign(
    {
      purpose: 'verify-email',
      id: user.id,
      email: user.email,
    },
    secret,
    { expiresIn: '30m' }
  );
}

function buildVerificationResultUrl(status, message = '') {
  const base = getFrontendBaseUrl();
  const params = new URLSearchParams({ status });
  if (message) {
    params.set('message', message);
  }
  return `${base}/email-verified?${params.toString()}`;
}

async function sendVerificationMail({ toEmail, fullName, verificationLink }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Thiếu cấu hình EMAIL_USER/EMAIL_PASS trong .env');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const customerName = String(fullName || '').trim() || 'Quý khách';

  const html = `
  <div style="font-family: Arial, sans-serif; color:#1f2937; line-height:1.6; max-width:680px; margin:0 auto; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden;">
    <div style="padding:20px 24px; background:linear-gradient(135deg,#0b65e3,#0ea5e9); color:#ffffff;">
      <h2 style="margin:0; font-size:22px;">TN Laptop</h2>
      <p style="margin:6px 0 0; opacity:0.95;">Xác thực địa chỉ email tài khoản của bạn</p>
    </div>
    <div style="padding:24px;">
      <p>Xin chào <strong>${customerName}</strong>,</p>
      <p>Cảm ơn bạn đã mua sắm tại TN Laptop. Để bảo vệ tài khoản và nhận đầy đủ thông báo đơn hàng, vui lòng xác thực email bằng nút bên dưới:</p>
      <p style="margin:24px 0;">
        <a href="${verificationLink}" style="display:inline-block; background:#0b65e3; color:#fff; text-decoration:none; padding:12px 18px; border-radius:8px; font-weight:700;">Xác thực email ngay</a>
      </p>
      <p>Nếu nút không hoạt động, hãy sao chép đường link này vào trình duyệt:</p>
      <p style="word-break:break-all; color:#0b65e3;">${verificationLink}</p>
      <p style="margin-top:20px; color:#6b7280; font-size:13px;">Liên kết có hiệu lực trong 30 phút. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
    </div>
  </div>`;

  await transporter.sendMail({
    from: `"TN Laptop" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Xác thực email tài khoản TN Laptop',
    html,
  });
}

function getVerificationCooldownState(userId) {
  const lastSentAt = verificationCooldownByUserId.get(Number(userId)) || 0;
  const elapsed = Date.now() - lastSentAt;
  const remainingMs = Math.max(0, EMAIL_VERIFICATION_COOLDOWN_MS - elapsed);

  return {
    lastSentAt,
    remainingMs,
    retryAfterSeconds: Math.max(0, Math.ceil(remainingMs / 1000)),
  };
}

function markVerificationEmailSent(userId) {
  verificationCooldownByUserId.set(Number(userId), Date.now());
}

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

export async function sendEmailVerification(req, res) {
  try {
    const userId = Number(req.body?.user_id || 0);
    const email = String(req.body?.email || '').trim().toLowerCase();

    if (!Number.isInteger(userId) || userId <= 0 || !email) {
      return res.status(400).json({
        status: 'error',
        message: 'Thiếu thông tin user_id hoặc email.',
        data: null,
      });
    }

    const user = await findUserByEmail(email);

    if (!user || Number(user.id) !== userId) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy tài khoản để gửi xác thực email.',
        data: null,
      });
    }

    if (Number(user.email_verified) === 1) {
      return res.status(200).json({
        status: 'success',
        message: 'Email của bạn đã được xác thực trước đó.',
        data: null,
      });
    }

    const cooldownState = getVerificationCooldownState(user.id);
    if (cooldownState.remainingMs > 0) {
      res.set('Retry-After', String(cooldownState.retryAfterSeconds));
      return res.status(429).json({
        status: 'error',
        message: `Bạn vui lòng chờ ${cooldownState.retryAfterSeconds} giây trước khi gửi lại email xác thực.`,
        data: {
          retry_after_seconds: cooldownState.retryAfterSeconds,
        },
      });
    }

    const token = buildEmailVerificationToken(user);
    const verificationLink = `${getBackendBaseUrl(req)}/api/auth/verify-email?token=${encodeURIComponent(token)}`;

    await sendVerificationMail({
      toEmail: user.email,
      fullName: user.full_name,
      verificationLink,
    });

    markVerificationEmailSent(user.id);

    return res.status(200).json({
      status: 'success',
      message: 'Đã gửi email xác thực. Vui lòng kiểm tra hộp thư của bạn.',
      data: {
        preview_link: verificationLink,
        retry_after_seconds: Math.ceil(EMAIL_VERIFICATION_COOLDOWN_MS / 1000),
      },
    });
  } catch (error) {
    console.error('❌ Lỗi sendEmailVerification:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Không thể gửi email xác thực lúc này. Vui lòng thử lại sau.',
      data: null,
    });
  }
}

export async function verifyEmail(req, res) {
  const token = String(req.query?.token || '').trim();

  if (!token) {
    return res.redirect(buildVerificationResultUrl('error', 'Thiếu token xác thực.'));
  }

  try {
    const secret = process.env.EMAIL_SECRET || process.env.JWT_SECRET;
    const payload = jwt.verify(token, secret);

    if (payload?.purpose !== 'verify-email') {
      return res.redirect(buildVerificationResultUrl('error', 'Token xác thực không hợp lệ.'));
    }

    const email = String(payload?.email || '').trim().toLowerCase();
    const userId = Number(payload?.id || 0);

    const user = await findUserByEmail(email);
    if (!user || Number(user.id) !== userId) {
      return res.redirect(buildVerificationResultUrl('error', 'Tài khoản không tồn tại hoặc đã thay đổi.'));
    }

    if (Number(user.email_verified) !== 1) {
      await updateUserById(userId, { emailVerified: 1 });
    }

    return res.redirect(buildVerificationResultUrl('success'));
  } catch (error) {
    console.error('❌ Lỗi verifyEmail:', error);
    return res.redirect(buildVerificationResultUrl('error', 'Liên kết xác thực đã hết hạn hoặc không hợp lệ.'));
  }
}
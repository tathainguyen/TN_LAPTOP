import bcrypt from 'bcryptjs';

import {
  changePassword,
  createUser,
  findRoleById,
  findUserByEmail,
  getRoles,
  getUserById,
  getUserPasswordHash,
  getUsers,
  updateUserById,
  updateUserProfile,
  updateUserStatusById,
} from '../models/userModel.js';

function normalizeDbErrorMessage(error, fallbackMessage) {
  const code = error?.code;

  if (code === 'ER_DUP_ENTRY') {
    return 'Dữ liệu đã tồn tại trong hệ thống.';
  }

  if (code === 'ER_NO_REFERENCED_ROW_2') {
    return 'Dữ liệu liên kết không hợp lệ.';
  }

  return fallbackMessage;
}

export async function getUserMasterData(req, res) {
  try {
    const roles = await getRoles();

    return res.status(200).json({
      status: 'success',
      message: 'Lấy dữ liệu người dùng thành công.',
      data: {
        roles,
      },
    });
  } catch (error) {
    console.error('❌ Lỗi getUserMasterData:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Không thể lấy dữ liệu người dùng.',
      data: null,
    });
  }
}

export async function getUserList(req, res) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const keyword = req.query.keyword || '';
    const roleId = req.query.roleId ? Number(req.query.roleId) : null;
    const status = req.query.status || 'all';

    const usePaging = Number.isInteger(page) && page > 0 && Number.isInteger(limit) && limit > 0;

    const users = await getUsers(
      usePaging
        ? { page, limit, keyword, roleId, status }
        : { keyword, roleId, status }
    );

    return res.status(200).json({
      status: 'success',
      message: 'Lấy danh sách người dùng thành công.',
      data: users,
    });
  } catch (error) {
    console.error('❌ Lỗi getUserList:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Không thể lấy danh sách người dùng.',
      data: null,
    });
  }
}

export async function createUserItem(req, res) {
  try {
    const {
      full_name,
      email,
      password,
      role_id,
      phone,
      gender,
      date_of_birth,
      avatar_url,
      email_verified,
      user_status,
    } = req.body;

    const normalizedFullName = String(full_name || '').trim();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedPassword = String(password || '');
    const normalizedRoleId = Number(role_id);

    if (!normalizedFullName || !normalizedEmail || !normalizedPassword || !normalizedRoleId) {
      return res.status(400).json({
        status: 'error',
        message: 'Thiếu trường bắt buộc: full_name, email, password, role_id.',
        data: null,
      });
    }

    if (normalizedPassword.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Mật khẩu phải có ít nhất 6 ký tự.',
        data: null,
      });
    }

    if (gender && !['MALE', 'FEMALE', 'OTHER'].includes(String(gender))) {
      return res.status(400).json({
        status: 'error',
        message: 'Giới tính không hợp lệ.',
        data: null,
      });
    }

    if (user_status && !['ACTIVE', 'BLOCKED'].includes(String(user_status))) {
      return res.status(400).json({
        status: 'error',
        message: 'Trạng thái người dùng không hợp lệ.',
        data: null,
      });
    }

    const [existingUser, role] = await Promise.all([
      findUserByEmail(normalizedEmail),
      findRoleById(normalizedRoleId),
    ]);

    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'Email này đã được sử dụng.',
        data: null,
      });
    }

    if (!role) {
      return res.status(400).json({
        status: 'error',
        message: 'Vai trò không tồn tại.',
        data: null,
      });
    }

    const passwordHash = await bcrypt.hash(normalizedPassword, 10);

    const insertedId = await createUser({
      roleId: normalizedRoleId,
      email: normalizedEmail,
      passwordHash,
      fullName: normalizedFullName,
      phone: phone ? String(phone).trim() : null,
      gender: gender || null,
      dateOfBirth: date_of_birth || null,
      avatarUrl: avatar_url || null,
      emailVerified: Number(email_verified) ? 1 : 0,
      userStatus: user_status || 'ACTIVE',
      googleId: null,
      facebookId: null,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Tạo người dùng thành công.',
      data: {
        id: insertedId,
      },
    });
  } catch (error) {
    console.error('❌ Lỗi createUserItem:', error);

    return res.status(500).json({
      status: 'error',
      message: normalizeDbErrorMessage(error, 'Không thể tạo người dùng.'),
      data: null,
    });
  }
}

export async function getUserByIdDetail(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ID người dùng không hợp lệ.',
        data: null,
      });
    }

    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy người dùng.',
        data: null,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Lấy chi tiết người dùng thành công.',
      data: user,
    });
  } catch (error) {
    console.error('❌ Lỗi getUserByIdDetail:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Không thể lấy chi tiết người dùng.',
      data: null,
    });
  }
}

export async function updateUserItem(req, res) {
  try {
    const id = Number(req.params.id);
    const {
      full_name,
      role_id,
      phone,
      gender,
      date_of_birth,
      avatar_url,
      email_verified,
      user_status,
    } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ID người dùng không hợp lệ.',
        data: null,
      });
    }

    if (!full_name || !String(full_name).trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Thiếu full_name.',
        data: null,
      });
    }

    if (!role_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Thiếu role_id.',
        data: null,
      });
    }

    if (user_status && !['ACTIVE', 'BLOCKED'].includes(String(user_status))) {
      return res.status(400).json({
        status: 'error',
        message: 'Trạng thái người dùng không hợp lệ.',
        data: null,
      });
    }

    const updated = await updateUserById(id, {
      fullName: String(full_name).trim(),
      roleId: Number(role_id),
      phone: phone ? String(phone).trim() : null,
      gender: gender || null,
      dateOfBirth: date_of_birth || null,
      avatarUrl: avatar_url || null,
      emailVerified:
        email_verified === undefined || email_verified === null
          ? undefined
          : Number(email_verified) ? 1 : 0,
      userStatus: user_status || undefined,
    });

    if (!updated) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy người dùng để cập nhật.',
        data: null,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Cập nhật người dùng thành công.',
      data: { id },
    });
  } catch (error) {
    console.error('❌ Lỗi updateUserItem:', error);

    return res.status(500).json({
      status: 'error',
      message: normalizeDbErrorMessage(error, 'Không thể cập nhật người dùng.'),
      data: null,
    });
  }
}

export async function toggleUserStatus(req, res) {
  try {
    const id = Number(req.params.id);
    const { user_status } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ID người dùng không hợp lệ.',
        data: null,
      });
    }

    if (!user_status || !['ACTIVE', 'BLOCKED'].includes(String(user_status))) {
      return res.status(400).json({
        status: 'error',
        message: 'Trạng thái người dùng không hợp lệ.',
        data: null,
      });
    }

    const updated = await updateUserStatusById(id, String(user_status));

    if (!updated) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy người dùng để đổi trạng thái.',
        data: null,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Đổi trạng thái người dùng thành công.',
      data: { id },
    });
  } catch (error) {
    console.error('❌ Lỗi toggleUserStatus:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Không thể đổi trạng thái người dùng.',
      data: null,
    });
  }
}

export async function updateUserProfileItem(req, res) {
  try {
    const userId = Number(req.params.userId);
    const {
      full_name,
      phone,
      gender,
      date_of_birth,
      avatar_url,
    } = req.body;

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ID người dùng không hợp lệ.',
        data: null,
      });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy người dùng.',
        data: null,
      });
    }

    if (full_name && !String(full_name).trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Tên đầy đủ không được để trống.',
        data: null,
      });
    }

    if (gender && !['MALE', 'FEMALE', 'OTHER'].includes(String(gender))) {
      return res.status(400).json({
        status: 'error',
        message: 'Giới tính không hợp lệ.',
        data: null,
      });
    }

    const profileData = {};
    if (full_name !== undefined) profileData.fullName = String(full_name).trim();
    if (phone !== undefined) profileData.phone = phone ? String(phone).trim() : null;
    if (gender !== undefined) profileData.gender = gender || null;
    if (date_of_birth !== undefined) profileData.dateOfBirth = date_of_birth || null;
    if (avatar_url !== undefined) profileData.avatarUrl = avatar_url || null;

    const updated = await updateUserProfile(userId, profileData);

    if (!updated) {
      return res.status(500).json({
        status: 'error',
        message: 'Không thể cập nhật thông tin cá nhân.',
        data: null,
      });
    }

    const updatedUser = await getUserById(userId);

    return res.status(200).json({
      status: 'success',
      message: 'Cập nhật thông tin cá nhân thành công.',
      data: updatedUser,
    });
  } catch (error) {
    console.error('❌ Lỗi updateUserProfileItem:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Không thể cập nhật thông tin cá nhân.',
      data: null,
    });
  }
}

export async function changeUserPassword(req, res) {
  try {
    const userId = Number(req.params.userId);
    const {
      current_password,
      new_password,
      confirm_password,
    } = req.body;

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ID người dùng không hợp lệ.',
        data: null,
      });
    }

    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({
        status: 'error',
        message: 'Vui lòng nhập đủ thông tin mật khẩu.',
        data: null,
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({
        status: 'error',
        message: 'Mật khẩu mới và xác nhận mật khẩu chưa khớp.',
        data: null,
      });
    }

    if (String(new_password).length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự.',
        data: null,
      });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy người dùng.',
        data: null,
      });
    }

    const passwordHash = await getUserPasswordHash(userId);
    if (!passwordHash) {
      return res.status(400).json({
        status: 'error',
        message: 'Tài khoản này không có mật khẩu (thường dùng GG/FB login).',
        data: null,
      });
    }

    const isPasswordMatch = await bcrypt.compare(String(current_password), passwordHash);
    if (!isPasswordMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Mật khẩu hiện tại không đúng.',
        data: null,
      });
    }

    const newPasswordHash = await bcrypt.hash(String(new_password), 10);
    const updated = await changePassword(userId, newPasswordHash);

    if (!updated) {
      return res.status(500).json({
        status: 'error',
        message: 'Không thể đổi mật khẩu.',
        data: null,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Đổi mật khẩu thành công.',
      data: null,
    });
  } catch (error) {
    console.error('❌ Lỗi changeUserPassword:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Không thể đổi mật khẩu.',
      data: null,
    });
  }
}

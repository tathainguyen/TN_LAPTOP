import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import AdminLayout from '../../layouts/AdminLayout.jsx';
import { getUserById, updateUser } from '../../services/user/userService.js';

function getStoredUser() {
  try {
    const raw = localStorage.getItem('tn_laptop_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function formatDate(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(date);
}

function AdminProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    gender: '',
    date_of_birth: '',
  });

  useEffect(() => {
    async function loadProfile() {
      const storedUser = getStoredUser();
      const roleName = String(storedUser?.role_name || '').toUpperCase();
      const isAdmin = roleName === 'ADMIN' || Number(storedUser?.role_id) === 1;

      if (!storedUser?.id || !isAdmin) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        setLoading(true);
        const response = await getUserById(storedUser.id);
        const detail = response?.data || null;

        if (!detail) {
          toast.error('Không tìm thấy dữ liệu hồ sơ admin.');
          navigate('/admin', { replace: true });
          return;
        }

        setProfile(detail);
        setForm({
          full_name: detail.full_name || '',
          phone: detail.phone || '',
          gender: detail.gender || '',
          date_of_birth: detail.date_of_birth ? String(detail.date_of_birth).slice(0, 10) : '',
        });
      } catch (error) {
        const message = error?.response?.data?.message || 'Không thể tải hồ sơ admin.';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [navigate]);

  function resetForm() {
    if (!profile) {
      return;
    }

    setForm({
      full_name: profile.full_name || '',
      phone: profile.phone || '',
      gender: profile.gender || '',
      date_of_birth: profile.date_of_birth ? String(profile.date_of_birth).slice(0, 10) : '',
    });
  }

  async function handleSave(event) {
    event.preventDefault();

    if (!profile) {
      return;
    }

    if (!form.full_name.trim()) {
      toast.error('Vui lòng nhập họ tên.');
      return;
    }

    try {
      setSaving(true);
      await updateUser(profile.id, {
        full_name: form.full_name.trim(),
        role_id: Number(profile.role_id),
        phone: form.phone.trim(),
        gender: form.gender || null,
        date_of_birth: form.date_of_birth || null,
        email_verified: Number(profile.email_verified) ? 1 : 0,
        user_status: profile.user_status || 'ACTIVE',
      });

      const updatedProfile = {
        ...profile,
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        gender: form.gender || null,
        date_of_birth: form.date_of_birth || null,
      };
      setProfile(updatedProfile);

      const storedUser = getStoredUser();
      if (storedUser) {
        const updatedStoredUser = {
          ...storedUser,
          full_name: form.full_name.trim(),
          phone: form.phone.trim(),
          gender: form.gender || null,
          date_of_birth: form.date_of_birth || null,
        };
        localStorage.setItem('tn_laptop_user', JSON.stringify(updatedStoredUser));
        window.dispatchEvent(new Event('tn-laptop-auth-change'));
      }

      setIsEditing(false);
      toast.success('Cập nhật hồ sơ admin thành công.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể cập nhật hồ sơ admin.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('tn_laptop_token');
    localStorage.removeItem('tn_laptop_user');
    window.dispatchEvent(new Event('tn-laptop-auth-change'));
    navigate('/login', { replace: true });
  }

  return (
    <AdminLayout title="Hồ sơ Admin">
      <section className="admin-profile-shell">
        {loading ? (
          <div className="admin-loading">Đang tải hồ sơ admin...</div>
        ) : !profile ? (
          <div className="admin-empty">Không có dữ liệu hồ sơ.</div>
        ) : (
          <>
            <article className="admin-profile-hero">
              <div className="admin-profile-hero__avatar" aria-hidden="true">
                {String(profile.full_name || profile.email || 'A').trim().charAt(0).toUpperCase()}
              </div>

              <div className="admin-profile-hero__content">
                <h2>{profile.full_name || 'Admin'}</h2>
                <p>{profile.email || '-'}</p>

                <div className="admin-profile-hero__chips">
                  <span>{profile.role_name || `Role #${profile.role_id || '-'}`}</span>
                  <span>{Number(profile.email_verified) ? 'Email đã xác thực' : 'Email chưa xác thực'}</span>
                  <span>{profile.user_status === 'ACTIVE' ? 'Tài khoản hoạt động' : 'Tài khoản bị khóa'}</span>
                </div>
              </div>

              <div className="admin-profile-hero__actions">
                {!isEditing ? (
                  <button type="button" onClick={() => setIsEditing(true)}>
                    Chỉnh sửa hồ sơ
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setIsEditing(false);
                    }}
                    disabled={saving}
                  >
                    Hủy chỉnh sửa
                  </button>
                )}

                <button type="button" className="admin-btn admin-btn--delete" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </div>
            </article>

            <div className="admin-profile-grid">
              <article className="admin-profile-card">
                <h3>Thông tin hiện tại</h3>
                <dl className="admin-profile-dl">
                  <div>
                    <dt>Họ và tên</dt>
                    <dd>{profile.full_name || '-'}</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>{profile.email || '-'}</dd>
                  </div>
                  <div>
                    <dt>Số điện thoại</dt>
                    <dd>{profile.phone || '-'}</dd>
                  </div>
                  <div>
                    <dt>Giới tính</dt>
                    <dd>{profile.gender || '-'}</dd>
                  </div>
                  <div>
                    <dt>Ngày sinh</dt>
                    <dd>{formatDate(profile.date_of_birth)}</dd>
                  </div>
                  <div>
                    <dt>Cập nhật gần nhất</dt>
                    <dd>{formatDate(profile.updated_at)}</dd>
                  </div>
                </dl>
              </article>

              <article className="admin-profile-card">
                <h3>{isEditing ? 'Chỉnh sửa hồ sơ' : 'Bật chế độ chỉnh sửa để cập nhật'}</h3>

                <form className="admin-form-grid" onSubmit={handleSave}>
                  <label>
                    Họ và tên
                    <input
                      type="text"
                      value={form.full_name}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, full_name: event.target.value }))
                      }
                      disabled={!isEditing || saving}
                      required
                    />
                  </label>

                  <label>
                    Số điện thoại
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, phone: event.target.value }))
                      }
                      disabled={!isEditing || saving}
                    />
                  </label>

                  <label>
                    Giới tính
                    <select
                      value={form.gender}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, gender: event.target.value }))
                      }
                      disabled={!isEditing || saving}
                    >
                      <option value="">-- Không chọn --</option>
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </label>

                  <label>
                    Ngày sinh
                    <input
                      type="date"
                      value={form.date_of_birth}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, date_of_birth: event.target.value }))
                      }
                      disabled={!isEditing || saving}
                    />
                  </label>

                  <div className="admin-form-actions admin-form-grid__full">
                    <button type="submit" disabled={!isEditing || saving}>
                      {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </div>
                </form>
              </article>
            </div>
          </>
        )}
      </section>
    </AdminLayout>
  );
}

export default AdminProfile;

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

import AdminLayout from '../layouts/AdminLayout.jsx';
import {
  getUserById,
  getUserMasterData,
  getUsers,
  updateUser,
  updateUserStatus,
} from '../services/userService.js';

const LIMIT = 10;

function formatDateTime(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function getGenderLabel(value) {
  if (value === 'MALE') {
    return 'Nam';
  }

  if (value === 'FEMALE') {
    return 'Nữ';
  }

  if (value === 'OTHER') {
    return 'Khác';
  }

  return '-';
}

function getStatusLabel(value) {
  return Number(value) === 1 ? 'Đang hoạt động' : 'Đã khóa';
}

function getVerificationLabel(value) {
  return Number(value) === 1 ? 'Đã xác thực' : 'Chưa xác thực';
}

function AdminUserList() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actioningId, setActioningId] = useState(null);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [filters, setFilters] = useState({
    keyword: '',
    roleId: 'all',
    status: 'all',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: LIMIT,
    total: 0,
    totalPages: 1,
  });
  const [editItem, setEditItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    role_id: '',
    phone: '',
    gender: '',
    date_of_birth: '',
    email_verified: 0,
    user_status: 'ACTIVE',
  });

  const roleMap = useMemo(() => {
    return roles.reduce((acc, role) => {
      acc[role.id] = role.role_name;
      return acc;
    }, {});
  }, [roles]);

  async function loadUsersData() {
    const response = await getUsers({
      page: pagination.page,
      limit: pagination.limit,
      keyword: filters.keyword || undefined,
      roleId: filters.roleId === 'all' ? undefined : Number(filters.roleId),
      status: filters.status,
    });

    const payload = response?.data;

    if (Array.isArray(payload)) {
      setUsers(payload);
      setPagination((prev) => ({
        ...prev,
        total: payload.length,
        totalPages: 1,
      }));
      return;
    }

    setUsers(payload?.items || []);
    setPagination((prev) => ({
      ...prev,
      total: payload?.pagination?.total || 0,
      totalPages: payload?.pagination?.totalPages || 1,
    }));
  }

  useEffect(() => {
    async function loadMasterData() {
      try {
        const response = await getUserMasterData();
        setRoles(response?.data?.roles || []);
      } catch (error) {
        const message = error?.response?.data?.message || 'Không thể tải danh sách vai trò.';
        toast.error(message);
      }
    }

    loadMasterData();
  }, []);

  useEffect(() => {
    async function loadUsersDataSafe() {
      try {
        setLoading(true);
        await loadUsersData();
      } catch (error) {
        const message = error?.response?.data?.message || 'Không thể tải danh sách người dùng.';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    loadUsersDataSafe();
  }, [filters, pagination.page, pagination.limit]);

  function applySearch(event) {
    event.preventDefault();
    setFilters((prev) => ({ ...prev, keyword: keywordInput.trim() }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }

  function updateFilter(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }

  function goToPage(page) {
    setPagination((prev) => ({ ...prev, page }));
  }

  function openEdit(item) {
    setEditItem(item);
    setForm({
      full_name: item.full_name || '',
      role_id: String(item.role_id || ''),
      phone: item.phone || '',
      gender: item.gender || '',
      date_of_birth: item.date_of_birth ? String(item.date_of_birth).slice(0, 10) : '',
      email_verified: Number(item.email_verified) ? 1 : 0,
      user_status: item.user_status || 'ACTIVE',
    });
  }

  async function openView(item) {
    try {
      const response = await getUserById(item.id);
      setViewItem(response?.data || item);
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể tải chi tiết người dùng.';
      toast.error(message);
    }
  }

  async function handleSubmitEdit(event) {
    event.preventDefault();

    if (!editItem) {
      return;
    }

    if (!form.full_name.trim() || !form.role_id) {
      toast.error('Vui lòng nhập họ tên và vai trò.');
      return;
    }

    try {
      setSaving(true);
      await updateUser(editItem.id, {
        full_name: form.full_name.trim(),
        role_id: Number(form.role_id),
        phone: form.phone.trim(),
        gender: form.gender || null,
        date_of_birth: form.date_of_birth || null,
        email_verified: Number(form.email_verified) ? 1 : 0,
        user_status: form.user_status,
      });
      toast.success('Cập nhật người dùng thành công.');
      setEditItem(null);
      await loadUsersData();
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể cập nhật người dùng.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(item) {
    const nextStatus = Number(item.user_status === 'ACTIVE') ? 'BLOCKED' : 'ACTIVE';

    try {
      setActioningId(item.id);
      await updateUserStatus(item.id, nextStatus);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === item.id ? { ...user, user_status: nextStatus } : user
        )
      );
      toast.success('Đã cập nhật trạng thái người dùng.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể đổi trạng thái người dùng.';
      toast.error(message);
    } finally {
      setActioningId(null);
    }
  }

  async function handleExportUsers() {
    try {
      setExporting(true);

      const response = await getUsers({
        keyword: filters.keyword || undefined,
        roleId: filters.roleId === 'all' ? undefined : Number(filters.roleId),
        status: filters.status,
      });

      const allUsers = Array.isArray(response?.data)
        ? response.data
        : response?.data?.items || [];

      if (allUsers.length === 0) {
        toast.error('Không có dữ liệu người dùng để xuất file.');
        return;
      }

      const rows = allUsers.map((user, index) => ({
        STT: index + 1,
        ID: user.id,
        'Họ và tên': user.full_name || '',
        Email: user.email || '',
        'Số điện thoại': user.phone || '',
        'Vai trò': roleMap[user.role_id] || user.role_name || '',
        'Giới tính': getGenderLabel(user.gender),
        'Ngày sinh': user.date_of_birth || '',
        'Xác thực email': getVerificationLabel(user.email_verified),
        'Trạng thái': getStatusLabel(user.user_status === 'ACTIVE' ? 1 : user.user_status),
        'Đăng nhập cuối': formatDateTime(user.last_login_at),
        'Ngày tạo': formatDateTime(user.created_at),
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

      const now = new Date();
      const dateTag = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
      XLSX.writeFile(workbook, `tn-laptop-users-${dateTag}.xlsx`);
      toast.success('Xuất file Excel người dùng thành công.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể xuất file Excel người dùng.';
      toast.error(message);
    } finally {
      setExporting(false);
    }
  }

  const stats = useMemo(() => {
    const total = pagination.total;
    const active = users.filter((user) => Number(user.user_status) === 1 || user.user_status === 'ACTIVE').length;
    const blocked = users.filter((user) => user.user_status === 'BLOCKED' || Number(user.user_status) === 0).length;
    const verified = users.filter((user) => Number(user.email_verified) === 1).length;

    return { total, active, blocked, verified };
  }, [pagination.total, users]);

  return (
    <AdminLayout title="Quản lý người dùng">
      <div className="admin-cards admin-cards--four">
        <article className="admin-card">
          <p>Tổng tài khoản</p>
          <strong>{stats.total}</strong>
        </article>
        <article className="admin-card">
          <p>Đang hoạt động</p>
          <strong>{stats.active}</strong>
        </article>
        <article className="admin-card">
          <p>Bị khóa</p>
          <strong>{stats.blocked}</strong>
        </article>
        <article className="admin-card">
          <p>Đã xác thực</p>
          <strong>{stats.verified}</strong>
        </article>
      </div>

      <section className="admin-panel" style={{ marginTop: 12 }}>
        <div className="admin-panel__head">
          <div>
            <h2>Danh sách tài khoản</h2>
            <p>Quản lý thông tin người dùng, vai trò và trạng thái truy cập.</p>
          </div>

          <button
            type="button"
            className="admin-primary-link admin-primary-link--excel"
            disabled={loading || exporting}
            onClick={handleExportUsers}
          >
            {exporting ? 'Đang xuất...' : 'Xuất Excel'}
          </button>
        </div>

        <form className="admin-filter-row" onSubmit={applySearch}>
          <label className="admin-filter-row__keyword">
            Tìm kiếm
            <div className="admin-search-inline">
              <input
                type="search"
                value={keywordInput}
                onChange={(event) => setKeywordInput(event.target.value)}
                placeholder="Tìm theo tên, email hoặc số điện thoại"
              />
              <button type="submit">Lọc</button>
            </div>
          </label>

          <label>
            Vai trò
            <select value={filters.roleId} onChange={(event) => updateFilter('roleId', event.target.value)}>
              <option value="all">Tất cả</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.role_name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Trạng thái
            <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
              <option value="all">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="blocked">Bị khóa</option>
              <option value="verified">Đã xác thực</option>
              <option value="unverified">Chưa xác thực</option>
            </select>
          </label>
        </form>

        {loading ? (
          <div className="admin-loading">Đang tải dữ liệu người dùng...</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Liên hệ</th>
                  <th>Vai trò</th>
                  <th>Xác thực</th>
                  <th>Trạng thái</th>
                  <th>Cập nhật</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td className="admin-empty" colSpan={7}>
                      Không có người dùng phù hợp.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <p className="admin-product-name">{user.full_name || '-'}</p>
                        <div className="admin-subtext">ID: {user.id}</div>
                      </td>
                      <td>
                        <div>{user.email || '-'}</div>
                        <div className="admin-subtext">{user.phone || 'Chưa có số điện thoại'}</div>
                      </td>
                      <td>
                        <span className="admin-pill admin-pill--brand">
                          {roleMap[user.role_id] || user.role_name || '-'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`admin-pill ${Number(user.email_verified) ? 'admin-pill--success' : 'admin-pill--muted'}`}
                        >
                          {getVerificationLabel(user.email_verified)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`admin-pill ${Number(user.user_status) === 1 || user.user_status === 'ACTIVE' ? 'admin-pill--success' : 'admin-pill--danger'}`}
                        >
                          {getStatusLabel(user.user_status === 'ACTIVE' ? 1 : user.user_status)}
                        </span>
                      </td>
                      <td>
                        <div>{formatDateTime(user.updated_at)}</div>
                        <div className="admin-subtext">Đăng nhập: {formatDateTime(user.last_login_at)}</div>
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button type="button" className="admin-btn admin-btn--view" onClick={() => openView(user)}>
                            View
                          </button>
                          <button type="button" className="admin-btn admin-btn--edit" onClick={() => openEdit(user)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn--delete"
                            disabled={actioningId === user.id}
                            onClick={() => handleToggleStatus(user)}
                          >
                            {Number(user.user_status) === 1 || user.user_status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="admin-pagination">
          <button
            type="button"
            disabled={loading || pagination.page <= 1}
            onClick={() => goToPage(pagination.page - 1)}
          >
            Trước
          </button>
          <span>
            Trang {pagination.page}/{pagination.totalPages} ({pagination.total} tài khoản)
          </span>
          <button
            type="button"
            disabled={loading || pagination.page >= pagination.totalPages}
            onClick={() => goToPage(pagination.page + 1)}
          >
            Sau
          </button>
        </div>
      </section>

      {editItem ? (
        <div className="admin-modal-overlay" onClick={() => setEditItem(null)} role="presentation">
          <article className="admin-modal admin-modal--large" onClick={(event) => event.stopPropagation()}>
            <header>
              <h3>Chỉnh sửa người dùng</h3>
              <button type="button" onClick={() => setEditItem(null)}>
                Đóng
              </button>
            </header>

            <form className="admin-form-grid" onSubmit={handleSubmitEdit}>
              <label>
                Họ và tên
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(event) => setForm((prev) => ({ ...prev, full_name: event.target.value }))}
                  required
                />
              </label>

              <label>
                Email
                <input type="email" value={editItem.email || ''} disabled />
              </label>

              <label>
                Vai trò
                <select
                  value={form.role_id}
                  onChange={(event) => setForm((prev) => ({ ...prev, role_id: event.target.value }))}
                  required
                >
                  <option value="">-- Chọn vai trò --</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Số điện thoại
                <input
                  type="text"
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                  placeholder="0912 345 678"
                />
              </label>

              <label>
                Giới tính
                <select
                  value={form.gender}
                  onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))}
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
                  onChange={(event) => setForm((prev) => ({ ...prev, date_of_birth: event.target.value }))}
                />
              </label>

              <label>
                Xác thực email
                <select
                  value={form.email_verified}
                  onChange={(event) => setForm((prev) => ({ ...prev, email_verified: Number(event.target.value) }))}
                >
                  <option value={0}>Chưa xác thực</option>
                  <option value={1}>Đã xác thực</option>
                </select>
              </label>

              <label>
                Trạng thái
                <select
                  value={form.user_status}
                  onChange={(event) => setForm((prev) => ({ ...prev, user_status: event.target.value }))}
                >
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="BLOCKED">Đã khóa</option>
                </select>
              </label>

              <div className="admin-form-actions admin-form-grid__full">
                <button type="button" onClick={() => setEditItem(null)}>
                  Hủy
                </button>
                <button type="submit" disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </article>
        </div>
      ) : null}

      {viewItem ? (
        <div className="admin-modal-overlay" onClick={() => setViewItem(null)} role="presentation">
          <article className="admin-modal" onClick={(event) => event.stopPropagation()}>
            <header>
              <h3>Chi tiết người dùng</h3>
              <button type="button" onClick={() => setViewItem(null)}>
                Đóng
              </button>
            </header>

            <div className="admin-quick-info admin-quick-info--single">
              <p><strong>Họ và tên:</strong> {viewItem.full_name || '-'}</p>
              <p><strong>Email:</strong> {viewItem.email || '-'}</p>
              <p><strong>Mật khẩu:</strong> •••••••• (đã ẩn)</p>
              <p><strong>Vai trò:</strong> {viewItem.role_name || roleMap[viewItem.role_id] || '-'}</p>
              <p><strong>Số điện thoại:</strong> {viewItem.phone || '-'}</p>
              <p><strong>Giới tính:</strong> {getGenderLabel(viewItem.gender)}</p>
              <p><strong>Ngày sinh:</strong> {viewItem.date_of_birth || '-'}</p>
              <p><strong>Xác thực email:</strong> {getVerificationLabel(viewItem.email_verified)}</p>
              <p><strong>Trạng thái:</strong> {getStatusLabel(viewItem.user_status === 'ACTIVE' ? 1 : viewItem.user_status)}</p>
              <p><strong>Đăng nhập cuối:</strong> {formatDateTime(viewItem.last_login_at)}</p>
              <p><strong>Tạo lúc:</strong> {formatDateTime(viewItem.created_at)}</p>
              <p><strong>Cập nhật lúc:</strong> {formatDateTime(viewItem.updated_at)}</p>
            </div>
          </article>
        </div>
      ) : null}
    </AdminLayout>
  );
}

export default AdminUserList;

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import AdminLayout from '../../layouts/AdminLayout.jsx';
import {
  createVoucherCodeAdmin,
  deleteVoucherCodeAdmin,
  getVoucherCodesAdmin,
  getVoucherTypesAdmin,
  updateVoucherCodeAdmin,
} from '../../services/voucher/voucherService.js';

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN');
}

function getTypeLabel(type) {
  if (!type) return '-';
  const typeName = type.type_name || 'Không rõ';
  const discountType = String(type.discount_type || '').toUpperCase();
  const discountValue = Number(type.discount_value || 0);
  if (discountType === 'PERCENT') {
    return `${typeName} (${discountValue}%)`;
  }
  return `${typeName} (${discountValue.toLocaleString('vi-VN')} VND)`;
}

const EMPTY_FORM = {
  code: '',
  voucher_type_id: '',
  total_usage_limit: 0,
  start_at: '',
  end_at: '',
  is_active: 1,
};

function toInputDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const tzOffsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16);
}

function AdminVoucherCodes() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [codes, setCodes] = useState([]);
  const [types, setTypes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [codeResponse, typeResponse] = await Promise.all([
        getVoucherCodesAdmin(),
        getVoucherTypesAdmin(),
      ]);

      setCodes(codeResponse?.data || []);
      setTypes(typeResponse?.data || []);
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể tải danh sách mã khuyến mãi.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setModalMode('create');
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEditModal(item) {
    setModalMode('edit');
    setEditingId(item.id);
    setForm({
      code: item.code || '',
      voucher_type_id: item.voucher_type_id ? Number(item.voucher_type_id) : '',
      total_usage_limit: Number(item.total_usage_limit || 0),
      start_at: toInputDateTime(item.start_at),
      end_at: toInputDateTime(item.end_at),
      is_active: Number(item.is_active || 0),
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const code = String(form.code || '').trim().toUpperCase();
    const voucherTypeId = Number(form.voucher_type_id || 0);

    if (!code || !voucherTypeId) {
      toast.error('Mã voucher và loại voucher không được để trống.');
      return;
    }

    if (!form.start_at || !form.end_at) {
      toast.error('Vui lòng nhập ngày bắt đầu và ngày kết thúc.');
      return;
    }

    if (new Date(form.start_at).getTime() >= new Date(form.end_at).getTime()) {
      toast.error('Ngày kết thúc phải sau ngày bắt đầu.');
      return;
    }

    try {
      setSavingId(editingId || 'create');

      const payload = {
        code,
        voucher_type_id: voucherTypeId,
        total_usage_limit: Number(form.total_usage_limit || 0),
        start_at: form.start_at,
        end_at: form.end_at,
        is_active: Number(form.is_active || 0),
      };

      if (modalMode === 'create') {
        await createVoucherCodeAdmin(payload);
        toast.success('Thêm mã khuyến mãi thành công.');
      } else {
        await updateVoucherCodeAdmin(editingId, payload);
        toast.success('Cập nhật mã khuyến mãi thành công.');
      }

      closeModal();
      await loadData();
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể lưu mã khuyến mãi.';
      toast.error(message);
    } finally {
      setSavingId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;

    try {
      setDeletingId(deleteTarget.id);
      await deleteVoucherCodeAdmin(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
      toast.success('Đã xóa mã khuyến mãi.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể xóa mã khuyến mãi.';
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminLayout title="Quản lý voucher - Mã khuyến mãi">
      <section className="admin-panel">
        <div className="admin-panel__toolbar">
          <div>
            <h2>Danh sách mã khuyến mãi</h2>
            <p>Quản lý mã voucher theo loại, số lượng sử dụng, thời gian hiệu lực và trạng thái.</p>
          </div>
          <div className="admin-panel__actions">
            <button type="button" className="admin-action-button admin-action-button--primary" onClick={openCreateModal}>
              + Thêm mã khuyến mãi
            </button>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">Đang tải dữ liệu...</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Mã voucher</th>
                  <th>Loại voucher</th>
                  <th>Số lượng</th>
                  <th>Đã sử dụng</th>
                  <th>Bắt đầu</th>
                  <th>Kết thúc</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {codes.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="admin-empty">Chưa có mã khuyến mãi.</td>
                  </tr>
                ) : (
                  codes.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.code}</td>
                      <td>{getTypeLabel(item)}</td>
                      <td>{Number(item.total_usage_limit || 0)}</td>
                      <td>{Number(item.used_count || 0)}</td>
                      <td>{formatDateTime(item.start_at)}</td>
                      <td>{formatDateTime(item.end_at)}</td>
                      <td>
                        <span className={Number(item.is_active || 0) === 1 ? 'admin-status-chip admin-status-chip--success' : 'admin-status-chip admin-status-chip--warning'}>
                          {Number(item.is_active || 0) === 1 ? 'Đang hoạt động' : 'Tạm tắt'}
                        </span>
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <button type="button" className="admin-btn admin-btn--edit" onClick={() => openEditModal(item)}>
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn--delete"
                            onClick={() => setDeleteTarget({ id: item.id, code: item.code })}
                            disabled={deletingId === item.id}
                          >
                            {deletingId === item.id ? 'Đang xóa...' : 'Xóa'}
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
      </section>

      {modalOpen ? (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal">
            <header>
              <h3>{modalMode === 'create' ? 'Thêm mã khuyến mãi' : 'Sửa mã khuyến mãi'}</h3>
              <button type="button" onClick={closeModal}>✕</button>
            </header>

            <form onSubmit={handleSubmit}>
              <div className="admin-form-grid">
                <label>
                  Mã voucher
                  <input
                    type="text"
                    value={form.code}
                    onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))}
                    placeholder="Ví dụ: MAGIAM50"
                  />
                </label>

                <label>
                  Loại voucher
                  <select
                    value={form.voucher_type_id}
                    onChange={(event) => setForm((prev) => ({ ...prev, voucher_type_id: Number(event.target.value || 0) || '' }))}
                  >
                    <option value="">Chọn loại voucher</option>
                    {types.map((type) => (
                      <option key={type.id} value={type.id}>{getTypeLabel(type)}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Số lượng
                  <input
                    type="number"
                    min="0"
                    value={form.total_usage_limit}
                    onChange={(event) => setForm((prev) => ({ ...prev, total_usage_limit: Number(event.target.value || 0) }))}
                  />
                </label>

                <label>
                  Ngày bắt đầu
                  <input
                    type="datetime-local"
                    value={form.start_at}
                    onChange={(event) => setForm((prev) => ({ ...prev, start_at: event.target.value }))}
                  />
                </label>

                <label>
                  Ngày kết thúc
                  <input
                    type="datetime-local"
                    value={form.end_at}
                    onChange={(event) => setForm((prev) => ({ ...prev, end_at: event.target.value }))}
                  />
                </label>

                <label>
                  Trạng thái
                  <select
                    value={Number(form.is_active || 0)}
                    onChange={(event) => setForm((prev) => ({ ...prev, is_active: Number(event.target.value) }))}
                  >
                    <option value={1}>Đang hoạt động</option>
                    <option value={0}>Tạm tắt</option>
                  </select>
                </label>
              </div>

              <div className="admin-form-actions">
                <button type="button" onClick={closeModal}>Hủy</button>
                <button type="submit" className="admin-btn admin-btn--edit" disabled={savingId !== null}>
                  {savingId ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="admin-modal-overlay" role="presentation">
          <article className="admin-modal admin-confirm-modal">
            <header>
              <h3>Xác nhận xóa</h3>
            </header>
            <div className="admin-confirm-body">
              <p>
                Bạn có chắc muốn xóa mã voucher
                {' '}
                <strong>{deleteTarget.code}</strong>
                {' '}?
              </p>
              <div className="admin-form-actions">
                <button type="button" onClick={() => setDeleteTarget(null)} disabled={deletingId === deleteTarget.id}>
                  Hủy
                </button>
                <button type="button" onClick={handleConfirmDelete} disabled={deletingId === deleteTarget.id}>
                  {deletingId === deleteTarget.id ? 'Đang xóa...' : 'Xác nhận xóa'}
                </button>
              </div>
            </div>
          </article>
        </div>
      ) : null}
    </AdminLayout>
  );
}

export default AdminVoucherCodes;

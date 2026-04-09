import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import AdminLayout from '../../layouts/AdminLayout.jsx';
import {
  createVoucherTypeAdmin,
  deleteVoucherTypeAdmin,
  getVoucherTypesAdmin,
  updateVoucherTypeAdmin,
} from '../../services/voucher/voucherService.js';

function formatVnd(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

const EMPTY_FORM = {
  type_name: '',
  discount_type: 'PERCENT',
  discount_value: 0,
  min_order_value: 0,
  max_discount_value: '',
  is_active: 1,
};

function AdminVoucherTypes() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [types, setTypes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    loadVoucherTypes();
  }, []);

  async function loadVoucherTypes() {
    try {
      setLoading(true);
      const response = await getVoucherTypesAdmin();
      setTypes(response?.data || []);
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể tải loại khuyến mãi.';
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
      type_name: item.type_name || '',
      discount_type: item.discount_type || 'PERCENT',
      discount_value: Number(item.discount_value || 0),
      min_order_value: Number(item.min_order_value || 0),
      max_discount_value: item.max_discount_value === null ? '' : Number(item.max_discount_value || 0),
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

    const typeName = String(form.type_name || '').trim();
    const discountType = String(form.discount_type || '').trim().toUpperCase();

    if (!typeName || !['PERCENT', 'FIXED'].includes(discountType)) {
      toast.error('Vui lòng nhập đúng tên loại và kiểu voucher.');
      return;
    }

    if (Number(form.discount_value) < 0 || Number(form.min_order_value) < 0) {
      toast.error('Giá trị không hợp lệ.');
      return;
    }

    if (discountType === 'PERCENT' && Number(form.discount_value) > 100) {
      toast.error('Voucher phần trăm không thể lớn hơn 100.');
      return;
    }

    try {
      setSavingId(editingId || 'create');

      const payload = {
        type_name: typeName,
        discount_type: discountType,
        discount_value: Number(form.discount_value || 0),
        min_order_value: Number(form.min_order_value || 0),
        max_discount_value: form.max_discount_value === '' ? null : Number(form.max_discount_value),
        is_active: Number(form.is_active || 0),
      };

      if (modalMode === 'create') {
        await createVoucherTypeAdmin(payload);
        toast.success('Thêm loại khuyến mãi thành công.');
      } else {
        await updateVoucherTypeAdmin(editingId, payload);
        toast.success('Cập nhật loại khuyến mãi thành công.');
      }

      closeModal();
      await loadVoucherTypes();
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể lưu loại khuyến mãi.';
      toast.error(message);
    } finally {
      setSavingId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;

    try {
      setDeletingId(deleteTarget.id);
      await deleteVoucherTypeAdmin(deleteTarget.id);
      setDeleteTarget(null);
      await loadVoucherTypes();
      toast.success('Đã xóa loại khuyến mãi.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể xóa loại khuyến mãi.';
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminLayout title="Quản lý voucher - Loại khuyến mãi">
      <section className="admin-panel">
        <div className="admin-panel__toolbar">
          <div>
            <h2>Danh sách loại khuyến mãi</h2>
            <p>Quản lý loại voucher theo phần trăm hoặc VND, bao gồm giá trị tối thiểu và tối đa.</p>
          </div>
          <div className="admin-panel__actions">
            <button type="button" className="admin-action-button admin-action-button--primary" onClick={openCreateModal}>
              + Thêm loại khuyến mãi
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
                  <th>Loại voucher</th>
                  <th>Kiểu voucher</th>
                  <th>Giá trị</th>
                  <th>Đơn tối thiểu</th>
                  <th>Tối đa giảm</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {types.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="admin-empty">Chưa có loại khuyến mãi.</td>
                  </tr>
                ) : (
                  types.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.type_name}</td>
                      <td>{item.discount_type === 'PERCENT' ? 'Phần trăm' : 'VND'}</td>
                      <td>{item.discount_type === 'PERCENT' ? `${Number(item.discount_value || 0)}%` : formatVnd(item.discount_value)}</td>
                      <td>{formatVnd(item.min_order_value)}</td>
                      <td>{item.max_discount_value === null ? '-' : formatVnd(item.max_discount_value)}</td>
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
                            onClick={() => setDeleteTarget({ id: item.id, name: item.type_name })}
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
              <h3>{modalMode === 'create' ? 'Thêm loại khuyến mãi' : 'Sửa loại khuyến mãi'}</h3>
              <button type="button" onClick={closeModal}>✕</button>
            </header>

            <form onSubmit={handleSubmit}>
              <div className="admin-form-grid">
                <label className="admin-form-grid__full">
                  Tên loại khuyến mãi
                  <input
                    type="text"
                    value={form.type_name}
                    onChange={(event) => setForm((prev) => ({ ...prev, type_name: event.target.value }))}
                  />
                </label>

                <label>
                  Kiểu voucher
                  <select
                    value={form.discount_type}
                    onChange={(event) => setForm((prev) => ({ ...prev, discount_type: event.target.value }))}
                  >
                    <option value="PERCENT">Phần trăm</option>
                    <option value="FIXED">VND</option>
                  </select>
                </label>

                <label>
                  Giá trị
                  <input
                    type="number"
                    min="0"
                    value={form.discount_value}
                    onChange={(event) => setForm((prev) => ({ ...prev, discount_value: Number(event.target.value || 0) }))}
                  />
                </label>

                <label>
                  Đơn tối thiểu
                  <input
                    type="number"
                    min="0"
                    value={form.min_order_value}
                    onChange={(event) => setForm((prev) => ({ ...prev, min_order_value: Number(event.target.value || 0) }))}
                  />
                </label>

                <label>
                  Tối đa giảm (để trống nếu không giới hạn)
                  <input
                    type="number"
                    min="0"
                    value={form.max_discount_value}
                    onChange={(event) => setForm((prev) => ({ ...prev, max_discount_value: event.target.value }))}
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
                Bạn có chắc muốn xóa loại khuyến mãi
                {' '}
                <strong>{deleteTarget.name}</strong>
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

export default AdminVoucherTypes;

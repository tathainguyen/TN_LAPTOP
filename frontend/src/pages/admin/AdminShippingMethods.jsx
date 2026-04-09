import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import AdminLayout from '../../layouts/AdminLayout.jsx';
import {
  createShippingMethodAdmin,
  deleteShippingMethodAdmin,
  getShippingCarriersAdmin,
  getShippingMethodsAdmin,
  updateShippingMethodAdmin,
} from '../../services/shipping/shippingService.js';

function formatVnd(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

const EMPTY_FORM = {
  method_name: '',
  method_code: '',
  description: '',
  fee: 0,
  carrier_id: '',
  sort_order: 0,
  is_active: 1,
};

function AdminShippingMethods() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [methods, setMethods] = useState([]);
  const [carriers, setCarriers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  async function loadPageData() {
    try {
      setLoading(true);
      const [methodResponse, carrierResponse] = await Promise.all([
        getShippingMethodsAdmin(),
        getShippingCarriersAdmin(),
      ]);

      setMethods(methodResponse?.data || []);
      setCarriers(carrierResponse?.data || []);
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể tải phương thức vận chuyển.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPageData();
  }, []);

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
      method_name: item.method_name || '',
      method_code: item.method_code || '',
      description: item.description || '',
      fee: Number(item.fee || 0),
      carrier_id: item.carrier_id ? Number(item.carrier_id) : '',
      sort_order: Number(item.sort_order || 0),
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

    const methodName = String(form.method_name || '').trim();
    const methodCode = String(form.method_code || '').trim().toUpperCase();

    if (!methodName || !methodCode) {
      toast.error('Tên và mã phương thức không được để trống.');
      return;
    }

    if (Number(form.fee) < 0) {
      toast.error('Phí vận chuyển không hợp lệ.');
      return;
    }

    try {
      setSavingId(editingId || 'create');

      const payload = {
        method_name: methodName,
        method_code: methodCode,
        description: String(form.description || '').trim(),
        fee: Number(form.fee || 0),
        carrier_id: form.carrier_id ? Number(form.carrier_id) : null,
        sort_order: Number(form.sort_order || 0),
        is_active: Number(form.is_active || 0),
      };

      if (modalMode === 'create') {
        await createShippingMethodAdmin(payload);
        toast.success('Thêm phương thức vận chuyển thành công.');
      } else {
        await updateShippingMethodAdmin(editingId, payload);
        toast.success('Cập nhật phương thức vận chuyển thành công.');
      }

      closeModal();
      await loadPageData();
    } catch (error) {
      const message = error?.response?.data?.message || (modalMode === 'create' ? 'Không thể thêm phương thức vận chuyển.' : 'Không thể cập nhật phương thức.');
      toast.error(message);
    } finally {
      setSavingId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      setDeletingId(deleteTarget.id);
      await deleteShippingMethodAdmin(deleteTarget.id);
      await loadPageData();
      setDeleteTarget(null);
      toast.success('Đã xóa phương thức vận chuyển.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể xóa phương thức.';
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminLayout title="Quản lý vận chuyển - Phương thức vận chuyển">
      <section className="admin-panel">
        <div className="admin-panel__toolbar">
          <div>
            <h2>Phương thức vận chuyển</h2>
            <p>Thêm mới và chỉnh sửa qua form riêng để thao tác rõ ràng hơn, không sửa trực tiếp trên bảng.</p>
          </div>

          <div className="admin-panel__actions">
            <button type="button" className="admin-action-button admin-action-button--primary" onClick={openCreateModal}>
              + Thêm phương thức
            </button>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">Đang tải phương thức vận chuyển...</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên phương thức</th>
                  <th>Mã</th>
                  <th>Mô tả</th>
                  <th>Phí</th>
                  <th>Đơn vị vận chuyển</th>
                  <th>Thứ tự</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {methods.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="admin-empty">Chưa có phương thức vận chuyển.</td>
                  </tr>
                ) : (
                  methods.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.method_name}</td>
                      <td>{item.method_code}</td>
                      <td>{item.description || '-'}</td>
                      <td>
                        <div>{formatVnd(item.fee)}</div>
                        <div className="admin-order-sub">{Number(item.fee || 0).toLocaleString('vi-VN')} đ</div>
                      </td>
                      <td>{item.carrier_name || 'Chưa chọn'}</td>
                      <td>{item.sort_order}</td>
                      <td>
                        <span className={Number(item.is_active || 0) === 1 ? 'admin-status-chip admin-status-chip--success' : 'admin-status-chip admin-status-chip--warning'}>
                          {Number(item.is_active || 0) === 1 ? 'Đang hoạt động' : 'Tạm tắt'}
                        </span>
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <button
                            type="button"
                            className="admin-btn admin-btn--edit"
                            onClick={() => openEditModal(item)}
                            disabled={savingId === item.id || deletingId === item.id}
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn--delete"
                            onClick={() =>
                              setDeleteTarget({
                                id: item.id,
                                name: item.method_name,
                              })
                            }
                            disabled={deletingId === item.id || savingId === item.id}
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
          <div className="admin-modal admin-modal--large">
            <header>
              <h3>{modalMode === 'create' ? 'Thêm phương thức vận chuyển' : 'Sửa phương thức vận chuyển'}</h3>
              <button type="button" onClick={closeModal}>✕</button>
            </header>

            <form onSubmit={handleSubmit}>
              <div className="admin-form-grid">
                <label>
                  Tên phương thức
                  <input
                    type="text"
                    value={form.method_name}
                    onChange={(event) => setForm((prev) => ({ ...prev, method_name: event.target.value }))}
                    placeholder="Ví dụ: Giao nhanh"
                  />
                </label>

                <label>
                  Mã phương thức
                  <input
                    type="text"
                    value={form.method_code}
                    onChange={(event) => setForm((prev) => ({ ...prev, method_code: event.target.value.toUpperCase() }))}
                    placeholder="Ví dụ: FAST_PLUS"
                  />
                </label>

                <label className="admin-form-grid__full">
                  Mô tả
                  <input
                    type="text"
                    value={form.description}
                    onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                    placeholder="Mô tả thời gian giao"
                  />
                </label>

                <label>
                  Phí vận chuyển
                  <input
                    type="number"
                    min="0"
                    value={form.fee}
                    onChange={(event) => setForm((prev) => ({ ...prev, fee: Number(event.target.value || 0) }))}
                  />
                </label>

                <label>
                  Đơn vị vận chuyển
                  <select
                    value={form.carrier_id}
                    onChange={(event) => setForm((prev) => ({ ...prev, carrier_id: event.target.value ? Number(event.target.value) : '' }))}
                  >
                    <option value="">Chưa chọn</option>
                    {carriers.map((carrier) => (
                      <option key={carrier.id} value={carrier.id}>
                        {carrier.carrier_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Thứ tự
                  <input
                    type="number"
                    min="0"
                    value={form.sort_order}
                    onChange={(event) => setForm((prev) => ({ ...prev, sort_order: Number(event.target.value || 0) }))}
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
                <button type="button" onClick={closeModal}>
                  Hủy
                </button>
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
                Bạn có chắc muốn xóa phương thức
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

export default AdminShippingMethods;

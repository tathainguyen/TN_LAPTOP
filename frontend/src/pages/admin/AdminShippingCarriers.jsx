import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import AdminLayout from '../../layouts/AdminLayout.jsx';
import {
  createShippingCarrierAdmin,
  deleteShippingCarrierAdmin,
  getShippingCarriersAdmin,
  updateShippingCarrierAdmin,
} from '../../services/shipping/shippingService.js';

const EMPTY_FORM = {
  carrier_name: '',
  carrier_code: '',
  note: '',
  is_active: 1,
};

function AdminShippingCarriers() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [carriers, setCarriers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  async function loadCarriers() {
    try {
      setLoading(true);
      const response = await getShippingCarriersAdmin();
      setCarriers(response?.data || []);
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể tải đơn vị vận chuyển.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCarriers();
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
      carrier_name: item.carrier_name || '',
      carrier_code: item.carrier_code || '',
      note: item.note || '',
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

    const carrierName = String(form.carrier_name || '').trim();
    const carrierCode = String(form.carrier_code || '').trim().toUpperCase();

    if (!carrierName || !carrierCode) {
      toast.error('Tên và mã đơn vị vận chuyển không được để trống.');
      return;
    }

    try {
      setSavingId(editingId || 'create');

      const payload = {
        carrier_name: carrierName,
        carrier_code: carrierCode,
        note: String(form.note || '').trim(),
        is_active: Number(form.is_active || 0),
      };

      if (modalMode === 'create') {
        await createShippingCarrierAdmin(payload);
        toast.success('Thêm đơn vị vận chuyển thành công.');
      } else {
        await updateShippingCarrierAdmin(editingId, payload);
        toast.success('Cập nhật đơn vị vận chuyển thành công.');
      }

      closeModal();
      await loadCarriers();
    } catch (error) {
      const message = error?.response?.data?.message || (modalMode === 'create' ? 'Không thể thêm đơn vị vận chuyển.' : 'Không thể cập nhật đơn vị vận chuyển.');
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
      await deleteShippingCarrierAdmin(deleteTarget.id);
      await loadCarriers();
      setDeleteTarget(null);
      toast.success('Đã xóa đơn vị vận chuyển.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể xóa đơn vị vận chuyển.';
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminLayout title="Quản lý vận chuyển - Đơn vị vận chuyển">
      <section className="admin-panel">
        <div className="admin-panel__toolbar">
          <div>
            <h2>Đơn vị vận chuyển</h2>
            <p>Quản lý các đơn vị giao hàng theo form riêng để thêm và sửa gọn hơn.</p>
          </div>

          <div className="admin-panel__actions">
            <button type="button" className="admin-action-button admin-action-button--primary" onClick={openCreateModal}>
              + Thêm đơn vị
            </button>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">Đang tải đơn vị vận chuyển...</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên đơn vị</th>
                  <th>Mã</th>
                  <th>Trạng thái</th>
                  <th>Ghi chú</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {carriers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="admin-empty">Chưa có dữ liệu đơn vị vận chuyển.</td>
                  </tr>
                ) : (
                  carriers.map((carrier) => (
                    <tr key={carrier.id}>
                      <td>{carrier.id}</td>
                      <td>{carrier.carrier_name}</td>
                      <td>{carrier.carrier_code}</td>
                      <td>
                        <span className={Number(carrier.is_active || 0) === 1 ? 'admin-status-chip admin-status-chip--success' : 'admin-status-chip admin-status-chip--warning'}>
                          {Number(carrier.is_active || 0) === 1 ? 'Đang hoạt động' : 'Tạm tắt'}
                        </span>
                      </td>
                      <td>{carrier.note || '-'}</td>
                      <td>
                        <div className="admin-table-actions">
                          <button
                            type="button"
                            className="admin-btn admin-btn--edit"
                            onClick={() => openEditModal(carrier)}
                            disabled={savingId === carrier.id || deletingId === carrier.id}
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn--delete"
                            onClick={() =>
                              setDeleteTarget({
                                id: carrier.id,
                                name: carrier.carrier_name,
                              })
                            }
                            disabled={deletingId === carrier.id || savingId === carrier.id}
                          >
                            {deletingId === carrier.id ? 'Đang xóa...' : 'Xóa'}
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
              <h3>{modalMode === 'create' ? 'Thêm đơn vị vận chuyển' : 'Sửa đơn vị vận chuyển'}</h3>
              <button type="button" onClick={closeModal}>✕</button>
            </header>

            <form onSubmit={handleSubmit}>
              <div className="admin-form-grid">
                <label>
                  Tên đơn vị
                  <input
                    type="text"
                    value={form.carrier_name}
                    onChange={(event) => setForm((prev) => ({ ...prev, carrier_name: event.target.value }))}
                    placeholder="Ví dụ: Giao hàng nội bộ"
                  />
                </label>

                <label>
                  Mã đơn vị
                  <input
                    type="text"
                    value={form.carrier_code}
                    onChange={(event) => setForm((prev) => ({ ...prev, carrier_code: event.target.value.toUpperCase() }))}
                    placeholder="Ví dụ: INTERNAL"
                  />
                </label>

                <label className="admin-form-grid__full">
                  Ghi chú
                  <input
                    type="text"
                    value={form.note}
                    onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
                    placeholder="Ghi chú ngắn"
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
                Bạn có chắc muốn xóa đơn vị vận chuyển
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

export default AdminShippingCarriers;

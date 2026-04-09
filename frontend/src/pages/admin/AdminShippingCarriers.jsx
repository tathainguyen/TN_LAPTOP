import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import AdminLayout from '../../layouts/AdminLayout.jsx';
import {
  createShippingCarrierAdmin,
  deleteShippingCarrierAdmin,
  getShippingCarriersAdmin,
  updateShippingCarrierAdmin,
} from '../../services/shipping/shippingService.js';

function getCarrierStatusClass(status) {
  const key = String(status || '').toUpperCase();
  if (key === 'ACTIVE') return 'admin-status-chip admin-status-chip--success';
  return 'admin-status-chip admin-status-chip--warning';
}

function getCarrierStatusLabel(status) {
  const key = String(status || '').toUpperCase();
  if (key === 'ACTIVE') return 'Đang hoạt động';
  if (key === 'PLANNED') return 'Phát triển sau';
  return key || '-';
}

function AdminShippingCarriers() {
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [carriers, setCarriers] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [newCarrier, setNewCarrier] = useState({
    carrier_name: '',
    carrier_code: '',
    note: '',
    is_active: 1,
  });

  useEffect(() => {
    loadCarriers();
  }, []);

  async function loadCarriers() {
    try {
      setLoading(true);
      const response = await getShippingCarriersAdmin();
      const items = response?.data || [];
      setCarriers(items);
      setDrafts(
        items.reduce((acc, item) => {
          acc[item.id] = {
            carrier_name: item.carrier_name || '',
            carrier_code: item.carrier_code || '',
            note: item.note || '',
            is_active: Number(item.is_active || 0),
          };
          return acc;
        }, {})
      );
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể tải đơn vị vận chuyển.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    const name = String(newCarrier.carrier_name || '').trim();
    const code = String(newCarrier.carrier_code || '').trim().toUpperCase();

    if (!name || !code) {
      toast.error('Tên và mã đơn vị vận chuyển không được để trống.');
      return;
    }

    try {
      setCreating(true);
      await createShippingCarrierAdmin({
        carrier_name: name,
        carrier_code: code,
        note: String(newCarrier.note || '').trim(),
        is_active: Number(newCarrier.is_active || 0),
      });

      setNewCarrier({
        carrier_name: '',
        carrier_code: '',
        note: '',
        is_active: 1,
      });

      await loadCarriers();
      toast.success('Thêm đơn vị vận chuyển thành công.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể thêm đơn vị vận chuyển.';
      toast.error(message);
    } finally {
      setCreating(false);
    }
  }

  async function handleSave(carrier) {
    const draft = drafts[carrier.id];
    if (!draft) return;

    const name = String(draft.carrier_name || '').trim();
    const code = String(draft.carrier_code || '').trim().toUpperCase();

    if (!name || !code) {
      toast.error('Tên và mã đơn vị vận chuyển không được để trống.');
      return;
    }

    try {
      setSavingId(carrier.id);
      await updateShippingCarrierAdmin(carrier.id, {
        carrier_name: name,
        carrier_code: code,
        note: String(draft.note || '').trim(),
        is_active: Number(draft.is_active || 0),
      });
      await loadCarriers();
      toast.success('Cập nhật đơn vị vận chuyển thành công.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể cập nhật đơn vị vận chuyển.';
      toast.error(message);
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(carrier) {
    const confirmed = window.confirm(`Bạn có chắc muốn xóa đơn vị vận chuyển "${carrier.carrier_name}"?`);
    if (!confirmed) return;

    try {
      setDeletingId(carrier.id);
      await deleteShippingCarrierAdmin(carrier.id);
      await loadCarriers();
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
        <div className="admin-panel__head">
          <div>
            <h2>Đơn vị vận chuyển</h2>
            <p>Admin có thể thêm, sửa, xóa và chọn trạng thái đơn vị vận chuyển.</p>
          </div>
        </div>

        <div className="admin-table-wrap" style={{ marginBottom: 14 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên đơn vị</th>
                <th>Mã</th>
                <th>Ghi chú</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <input
                    type="text"
                    value={newCarrier.carrier_name}
                    onChange={(event) => setNewCarrier((prev) => ({ ...prev, carrier_name: event.target.value }))}
                    placeholder="Ví dụ: Giao hàng nội bộ"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={newCarrier.carrier_code}
                    onChange={(event) => setNewCarrier((prev) => ({ ...prev, carrier_code: event.target.value }))}
                    placeholder="Ví dụ: INTERNAL"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={newCarrier.note}
                    onChange={(event) => setNewCarrier((prev) => ({ ...prev, note: event.target.value }))}
                    placeholder="Ghi chú"
                  />
                </td>
                <td>
                  <select
                    value={Number(newCarrier.is_active || 0)}
                    onChange={(event) =>
                      setNewCarrier((prev) => ({
                        ...prev,
                        is_active: Number(event.target.value),
                      }))
                    }
                  >
                    <option value={1}>Đang hoạt động</option>
                    <option value={0}>Tạm tắt</option>
                  </select>
                </td>
                <td>
                  <button type="button" className="admin-btn admin-btn--create" onClick={handleCreate} disabled={creating}>
                    {creating ? 'Đang thêm...' : 'Thêm'}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
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
                  <th>Ma</th>
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
                      <td>
                        <input
                          type="text"
                          value={drafts[carrier.id]?.carrier_name || ''}
                          onChange={(event) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [carrier.id]: { ...prev[carrier.id], carrier_name: event.target.value },
                            }))
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={drafts[carrier.id]?.carrier_code || ''}
                          onChange={(event) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [carrier.id]: { ...prev[carrier.id], carrier_code: event.target.value },
                            }))
                          }
                        />
                      </td>
                      <td>
                        <select
                          value={Number(drafts[carrier.id]?.is_active || 0)}
                          onChange={(event) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [carrier.id]: { ...prev[carrier.id], is_active: Number(event.target.value) },
                            }))
                          }
                        >
                          <option value={1}>Đang hoạt động</option>
                          <option value={0}>Tạm tắt</option>
                        </select>
                        <div className="admin-order-sub">
                          <span className={getCarrierStatusClass(Number(drafts[carrier.id]?.is_active || 0) === 1 ? 'ACTIVE' : 'PLANNED')}>
                            {getCarrierStatusLabel(Number(drafts[carrier.id]?.is_active || 0) === 1 ? 'ACTIVE' : 'PLANNED')}
                          </span>
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={drafts[carrier.id]?.note || ''}
                          onChange={(event) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [carrier.id]: { ...prev[carrier.id], note: event.target.value },
                            }))
                          }
                        />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            className="admin-btn admin-btn--edit"
                            onClick={() => handleSave(carrier)}
                            disabled={savingId === carrier.id || deletingId === carrier.id}
                          >
                            {savingId === carrier.id ? 'Đang lưu...' : 'Lưu'}
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn--delete"
                            onClick={() => handleDelete(carrier)}
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
    </AdminLayout>
  );
}

export default AdminShippingCarriers;

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

function AdminShippingMethods() {
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [methods, setMethods] = useState([]);
  const [carriers, setCarriers] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [newMethod, setNewMethod] = useState({
    method_name: '',
    method_code: '',
    description: '',
    fee: 0,
    carrier_id: '',
    sort_order: 0,
    is_active: 1,
  });

  async function loadPageData() {
    try {
      setLoading(true);
      const [methodResponse, carrierResponse] = await Promise.all([
        getShippingMethodsAdmin(),
        getShippingCarriersAdmin(),
      ]);

      const items = methodResponse?.data || [];
      const carrierItems = carrierResponse?.data || [];

      setMethods(items);
      setCarriers(carrierItems);
      setDrafts(
        items.reduce((acc, item) => {
          acc[item.id] = {
            method_name: item.method_name || '',
            description: item.description || '',
            fee: Number(item.fee || 0),
            carrier_id: item.carrier_id ? Number(item.carrier_id) : '',
            sort_order: Number(item.sort_order || 0),
            is_active: Number(item.is_active || 0),
          };
          return acc;
        }, {})
      );
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

  async function handleCreate() {
    const methodName = String(newMethod.method_name || '').trim();
    const methodCode = String(newMethod.method_code || '').trim().toUpperCase();

    if (!methodName || !methodCode) {
      toast.error('Tên và mã phương thức không được để trống.');
      return;
    }

    if (Number(newMethod.fee) < 0) {
      toast.error('Phí vận chuyển không hợp lệ.');
      return;
    }

    try {
      setCreating(true);
      await createShippingMethodAdmin({
        method_name: methodName,
        method_code: methodCode,
        description: String(newMethod.description || '').trim(),
        fee: Number(newMethod.fee || 0),
        carrier_id: newMethod.carrier_id ? Number(newMethod.carrier_id) : null,
        sort_order: Number(newMethod.sort_order || 0),
        is_active: Number(newMethod.is_active || 0),
      });

      setNewMethod({
        method_name: '',
        method_code: '',
        description: '',
        fee: 0,
        carrier_id: '',
        sort_order: 0,
        is_active: 1,
      });

      await loadPageData();
      toast.success('Thêm phương thức vận chuyển thành công.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể thêm phương thức vận chuyển.';
      toast.error(message);
    } finally {
      setCreating(false);
    }
  }

  async function handleSave(item) {
    const draft = drafts[item.id];
    if (!draft) return;

    if (!String(draft.method_name || '').trim()) {
      toast.error('Tên phương thức không được để trống.');
      return;
    }

    if (Number(draft.fee) < 0) {
      toast.error('Phí vận chuyển không hợp lệ.');
      return;
    }

    try {
      setSavingId(item.id);
      await updateShippingMethodAdmin(item.id, {
        method_name: String(draft.method_name).trim(),
        description: String(draft.description || '').trim(),
        fee: Number(draft.fee || 0),
        carrier_id: draft.carrier_id ? Number(draft.carrier_id) : null,
        sort_order: Number(draft.sort_order || 0),
        is_active: Number(draft.is_active || 0),
      });
      await loadPageData();
      toast.success('Cập nhật phương thức vận chuyển thành công.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể cập nhật phương thức.';
      toast.error(message);
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(`Bạn có chắc muốn xóa phương thức "${item.method_name}"?`);
    if (!confirmed) return;

    try {
      setDeletingId(item.id);
      await deleteShippingMethodAdmin(item.id);
      await loadPageData();
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
        <div className="admin-panel__head">
          <div>
            <h2>Phương thức vận chuyển</h2>
            <p>Quản lý phương thức vận chuyển, bao gồm thêm mới, chỉnh sửa, xóa và gán đơn vị vận chuyển thủ công.</p>
          </div>
        </div>

        <div className="admin-table-wrap" style={{ marginBottom: 14 }}>
          <table className="admin-table">
            <thead>
              <tr>
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
              <tr>
                <td>
                  <input
                    type="text"
                    value={newMethod.method_name}
                    onChange={(event) => setNewMethod((prev) => ({ ...prev, method_name: event.target.value }))}
                    placeholder="Ví dụ: Siêu tốc"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={newMethod.method_code}
                    onChange={(event) => setNewMethod((prev) => ({ ...prev, method_code: event.target.value }))}
                    placeholder="Ví dụ: SUPER_FAST"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={newMethod.description}
                    onChange={(event) => setNewMethod((prev) => ({ ...prev, description: event.target.value }))}
                    placeholder="Mô tả thời gian giao"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={newMethod.fee}
                    onChange={(event) => setNewMethod((prev) => ({ ...prev, fee: Number(event.target.value || 0) }))}
                  />
                  <div className="admin-order-sub">{formatVnd(newMethod.fee)}</div>
                </td>
                <td>
                  <select
                    value={newMethod.carrier_id}
                    onChange={(event) => setNewMethod((prev) => ({ ...prev, carrier_id: event.target.value ? Number(event.target.value) : '' }))}
                  >
                    <option value="">Chưa chọn</option>
                    {carriers.map((carrier) => (
                      <option key={carrier.id} value={carrier.id}>
                        {carrier.carrier_name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={newMethod.sort_order}
                    onChange={(event) => setNewMethod((prev) => ({ ...prev, sort_order: Number(event.target.value || 0) }))}
                  />
                </td>
                <td>
                  <select
                    value={Number(newMethod.is_active || 0)}
                    onChange={(event) => setNewMethod((prev) => ({ ...prev, is_active: Number(event.target.value) }))}
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
          <div className="admin-loading">Đang tải phương thức vận chuyển...</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên phương thức</th>
                  <th>Mã</th>
                  <th>Mô tả thời gian</th>
                  <th>Phi</th>
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
                      <td>
                        <input
                          type="text"
                          value={drafts[item.id]?.method_name || ''}
                          onChange={(event) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [item.id]: { ...prev[item.id], method_name: event.target.value },
                            }))
                          }
                        />
                      </td>
                      <td>{item.method_code}</td>
                      <td>
                        <input
                          type="text"
                          value={drafts[item.id]?.description || ''}
                          onChange={(event) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [item.id]: { ...prev[item.id], description: event.target.value },
                            }))
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={drafts[item.id]?.fee ?? 0}
                          onChange={(event) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [item.id]: { ...prev[item.id], fee: Number(event.target.value || 0) },
                            }))
                          }
                        />
                        <div className="admin-order-sub">{formatVnd(drafts[item.id]?.fee ?? 0)}</div>
                      </td>
                      <td>
                        <select
                          value={drafts[item.id]?.carrier_id ?? ''}
                          onChange={(event) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [item.id]: { ...prev[item.id], carrier_id: event.target.value ? Number(event.target.value) : '' },
                            }))
                          }
                        >
                          <option value="">Chưa chọn</option>
                          {carriers.map((carrier) => (
                            <option key={carrier.id} value={carrier.id}>
                              {carrier.carrier_name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={drafts[item.id]?.sort_order ?? 0}
                          onChange={(event) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [item.id]: { ...prev[item.id], sort_order: Number(event.target.value || 0) },
                            }))
                          }
                        />
                      </td>
                      <td>
                        <select
                          value={Number(drafts[item.id]?.is_active || 0)}
                          onChange={(event) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [item.id]: { ...prev[item.id], is_active: Number(event.target.value) },
                            }))
                          }
                        >
                          <option value={1}>Đang hoạt động</option>
                          <option value={0}>Tạm tắt</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            className="admin-btn admin-btn--edit"
                            onClick={() => handleSave(item)}
                            disabled={savingId === item.id || deletingId === item.id}
                          >
                            {savingId === item.id ? 'Đang lưu...' : 'Lưu'}
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn--delete"
                            onClick={() => handleDelete(item)}
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
    </AdminLayout>
  );
}

export default AdminShippingMethods;

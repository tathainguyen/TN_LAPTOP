import {
  createShippingMethod,
  createShippingCarrier,
  deleteShippingCarrierById,
  deleteShippingMethodById,
  getShippingCarriersAdmin,
  getShippingMethodsAdmin,
  updateShippingCarrierById,
  updateShippingMethodById,
} from '../models/shippingModel.js';

export async function getShippingMethods(req, res) {
  try {
    const methods = await getShippingMethodsAdmin();

    return res.status(200).json({
      status: 'success',
      message: 'Lay danh sach phuong thuc van chuyen thanh cong.',
      data: methods,
    });
  } catch (error) {
    console.error('❌ Loi getShippingMethods:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Khong the tai danh sach phuong thuc van chuyen.',
      data: null,
    });
  }
}

export async function createShippingMethodController(req, res) {
  try {
    const methodName = String(req.body?.method_name || '').trim();
    const methodCode = String(req.body?.method_code || '').trim();

    if (!methodName || !methodCode) {
      return res.status(400).json({
        status: 'error',
        message: 'Ten va ma phuong thuc van chuyen khong duoc de trong.',
        data: null,
      });
    }

    const created = await createShippingMethod({
      method_name: methodName,
      method_code: methodCode,
      description: req.body?.description,
      fee: req.body?.fee,
      carrier_id: req.body?.carrier_id,
      sort_order: req.body?.sort_order,
      is_active: req.body?.is_active,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Them phuong thuc van chuyen thanh cong.',
      data: created,
    });
  } catch (error) {
    console.error('❌ Loi createShippingMethodController:', error);

    const isDuplicateCode = String(error?.message || '').includes('uk_shipping_methods_code');
    if (isDuplicateCode) {
      return res.status(409).json({
        status: 'error',
        message: 'Ma phuong thuc van chuyen da ton tai.',
        data: null,
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Khong the them phuong thuc van chuyen.',
      data: null,
    });
  }
}

export async function updateShippingMethod(req, res) {
  try {
    const id = Number(req.params.id || 0);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ID phuong thuc van chuyen khong hop le.',
        data: null,
      });
    }

    const payload = {
      method_name: req.body?.method_name,
      description: req.body?.description,
      fee: req.body?.fee,
      carrier_id: req.body?.carrier_id,
      sort_order: req.body?.sort_order,
      is_active: req.body?.is_active,
    };

    const updated = await updateShippingMethodById(id, payload);

    if (!updated) {
      return res.status(404).json({
        status: 'error',
        message: 'Khong tim thay phuong thuc van chuyen.',
        data: null,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Cap nhat phuong thuc van chuyen thanh cong.',
      data: updated,
    });
  } catch (error) {
    console.error('❌ Loi updateShippingMethod:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Khong the cap nhat phuong thuc van chuyen.',
      data: null,
    });
  }
}

export async function deleteShippingMethod(req, res) {
  try {
    const id = Number(req.params.id || 0);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ID phuong thuc van chuyen khong hop le.',
        data: null,
      });
    }

    const deleted = await deleteShippingMethodById(id);

    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Khong tim thay phuong thuc van chuyen.',
        data: null,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Xoa phuong thuc van chuyen thanh cong.',
      data: { id },
    });
  } catch (error) {
    console.error('❌ Loi deleteShippingMethod:', error);

    if (String(error?.message || '') === 'MINIMUM_SHIPPING_METHODS_REQUIRED') {
      return res.status(400).json({
        status: 'error',
        message: 'Khach hang phai luon co it nhat 3 phuong thuc van chuyen.',
        data: null,
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Khong the xoa phuong thuc van chuyen.',
      data: null,
    });
  }
}

export async function getShippingCarriers(req, res) {
  try {
    const carriers = await getShippingCarriersAdmin();

    return res.status(200).json({
      status: 'success',
      message: 'Lay danh sach don vi van chuyen thanh cong.',
      data: carriers,
    });
  } catch (error) {
    console.error('❌ Loi getShippingCarriers:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Khong the tai danh sach don vi van chuyen.',
      data: null,
    });
  }
}

export async function createShippingCarrierController(req, res) {
  try {
    const carrierName = String(req.body?.carrier_name || '').trim();
    const carrierCode = String(req.body?.carrier_code || '').trim();

    if (!carrierName || !carrierCode) {
      return res.status(400).json({
        status: 'error',
        message: 'Ten va ma don vi van chuyen khong duoc de trong.',
        data: null,
      });
    }

    const created = await createShippingCarrier({
      carrier_name: carrierName,
      carrier_code: carrierCode,
      note: req.body?.note,
      is_active: req.body?.is_active,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Them don vi van chuyen thanh cong.',
      data: created,
    });
  } catch (error) {
    console.error('❌ Loi createShippingCarrierController:', error);

    if (String(error?.message || '') === 'CARRIER_TABLE_NOT_AVAILABLE') {
      return res.status(400).json({
        status: 'error',
        message: 'Bang shipping_carriers chua duoc tao trong CSDL.',
        data: null,
      });
    }

    const isDuplicateCode = String(error?.message || '').includes('uk_shipping_carriers_code');
    if (isDuplicateCode) {
      return res.status(409).json({
        status: 'error',
        message: 'Ma don vi van chuyen da ton tai.',
        data: null,
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Khong the them don vi van chuyen.',
      data: null,
    });
  }
}

export async function updateShippingCarrierController(req, res) {
  try {
    const id = Number(req.params.id || 0);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ID don vi van chuyen khong hop le.',
        data: null,
      });
    }

    const updated = await updateShippingCarrierById(id, {
      carrier_name: req.body?.carrier_name,
      carrier_code: req.body?.carrier_code,
      note: req.body?.note,
      is_active: req.body?.is_active,
    });

    if (!updated) {
      return res.status(404).json({
        status: 'error',
        message: 'Khong tim thay don vi van chuyen.',
        data: null,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Cap nhat don vi van chuyen thanh cong.',
      data: updated,
    });
  } catch (error) {
    console.error('❌ Loi updateShippingCarrierController:', error);

    if (String(error?.message || '') === 'CARRIER_TABLE_NOT_AVAILABLE') {
      return res.status(400).json({
        status: 'error',
        message: 'Bang shipping_carriers chua duoc tao trong CSDL.',
        data: null,
      });
    }

    const isDuplicateCode = String(error?.message || '').includes('uk_shipping_carriers_code');
    if (isDuplicateCode) {
      return res.status(409).json({
        status: 'error',
        message: 'Ma don vi van chuyen da ton tai.',
        data: null,
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Khong the cap nhat don vi van chuyen.',
      data: null,
    });
  }
}

export async function deleteShippingCarrierController(req, res) {
  try {
    const id = Number(req.params.id || 0);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ID don vi van chuyen khong hop le.',
        data: null,
      });
    }

    const deleted = await deleteShippingCarrierById(id);

    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Khong tim thay don vi van chuyen.',
        data: null,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Xoa don vi van chuyen thanh cong.',
      data: { id },
    });
  } catch (error) {
    console.error('❌ Loi deleteShippingCarrierController:', error);

    if (String(error?.message || '') === 'CARRIER_TABLE_NOT_AVAILABLE') {
      return res.status(400).json({
        status: 'error',
        message: 'Bang shipping_carriers chua duoc tao trong CSDL.',
        data: null,
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Khong the xoa don vi van chuyen.',
      data: null,
    });
  }
}

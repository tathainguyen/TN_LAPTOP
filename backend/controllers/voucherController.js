import {
  calculateVoucherDiscountAmount,
  createVoucherCode,
  createVoucherType,
  deleteVoucherCodeById,
  deleteVoucherTypeById,
  getAvailableVouchersForCheckout,
  getVoucherByCodeForCheckout,
  getVouchersAdmin,
  getVoucherTypesAdmin,
  updateVoucherCodeById,
  updateVoucherTypeById,
} from '../models/voucherModel.js';

function parseOrderAmount(value) {
  const orderAmount = Number(value || 0);
  if (!Number.isFinite(orderAmount) || orderAmount < 0) {
    return null;
  }

  return orderAmount;
}

function checkVoucherAvailability(voucher, orderAmount) {
  if (!voucher) {
    return { ok: false, message: 'Ma voucher khong ton tai.' };
  }

  if (Number(voucher.is_active) !== 1) {
    return { ok: false, message: 'Voucher hien khong hoat dong.' };
  }

  const now = new Date();
  const startAt = new Date(voucher.start_at);
  const endAt = new Date(voucher.end_at);

  if (!Number.isNaN(startAt.getTime()) && now < startAt) {
    return { ok: false, message: 'Voucher chua den thoi gian ap dung.' };
  }

  if (!Number.isNaN(endAt.getTime()) && now > endAt) {
    return { ok: false, message: 'Voucher da het han.' };
  }

  const usageLimit = voucher.total_usage_limit === null
    ? null
    : Number(voucher.total_usage_limit || 0);

  if (usageLimit !== null && Number(voucher.used_count || 0) >= usageLimit) {
    return { ok: false, message: 'Voucher da het luot su dung.' };
  }

  const minOrderValue = Math.max(0, Number(voucher.min_order_value || 0));
  if (orderAmount < minOrderValue) {
    return {
      ok: false,
      message: `Don hang chua dat gia tri toi thieu ${Math.round(minOrderValue).toLocaleString('vi-VN')} VND de ap dung voucher.`,
    };
  }

  return { ok: true, message: '' };
}

export async function getVoucherTypes(req, res) {
  try {
    const types = await getVoucherTypesAdmin();

    return res.status(200).json({
      status: 'success',
      message: 'Lay danh sach loai khuyen mai thanh cong.',
      data: types,
    });
  } catch (error) {
    console.error('❌ Loi getVoucherTypes:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Khong the tai danh sach loai khuyen mai.',
      data: null,
    });
  }
}

export async function createVoucherTypeController(req, res) {
  try {
    const typeName = String(req.body?.type_name || '').trim();
    const discountType = String(req.body?.discount_type || '').trim().toUpperCase();

    if (!typeName || !discountType) {
      return res.status(400).json({
        status: 'error',
        message: 'Ten loai va kieu voucher khong duoc de trong.',
        data: null,
      });
    }

    if (!['PERCENT', 'FIXED'].includes(discountType)) {
      return res.status(400).json({
        status: 'error',
        message: 'Kieu voucher khong hop le.',
        data: null,
      });
    }

    const created = await createVoucherType({
      type_name: typeName,
      discount_type: discountType,
      discount_value: req.body?.discount_value,
      min_order_value: req.body?.min_order_value,
      max_discount_value: req.body?.max_discount_value,
      is_active: req.body?.is_active,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Them loai khuyen mai thanh cong.',
      data: created,
    });
  } catch (error) {
    console.error('❌ Loi createVoucherTypeController:', error);

    const duplicateName = String(error?.message || '').includes('Duplicate') && String(error?.message || '').includes('type_name');
    if (duplicateName) {
      return res.status(409).json({
        status: 'error',
        message: 'Ten loai khuyen mai da ton tai.',
        data: null,
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Khong the them loai khuyen mai.',
      data: null,
    });
  }
}

export async function updateVoucherTypeController(req, res) {
  try {
    const id = Number(req.params.id || 0);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ID loai khuyen mai khong hop le.',
        data: null,
      });
    }

    const updated = await updateVoucherTypeById(id, {
      type_name: req.body?.type_name,
      discount_type: req.body?.discount_type,
      discount_value: req.body?.discount_value,
      min_order_value: req.body?.min_order_value,
      max_discount_value: req.body?.max_discount_value,
      is_active: req.body?.is_active,
    });

    if (!updated) {
      return res.status(404).json({
        status: 'error',
        message: 'Khong tim thay loai khuyen mai.',
        data: null,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Cap nhat loai khuyen mai thanh cong.',
      data: updated,
    });
  } catch (error) {
    console.error('❌ Loi updateVoucherTypeController:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Khong the cap nhat loai khuyen mai.',
      data: null,
    });
  }
}

export async function deleteVoucherTypeController(req, res) {
  try {
    const id = Number(req.params.id || 0);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ID loai khuyen mai khong hop le.',
        data: null,
      });
    }

    const deleted = await deleteVoucherTypeById(id);

    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Khong tim thay loai khuyen mai.',
        data: null,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Xoa loai khuyen mai thanh cong.',
      data: { id },
    });
  } catch (error) {
    console.error('❌ Loi deleteVoucherTypeController:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Khong the xoa loai khuyen mai.',
      data: null,
    });
  }
}

export async function getVoucherCodes(req, res) {
  try {
    const vouchers = await getVouchersAdmin();

    return res.status(200).json({
      status: 'success',
      message: 'Lay danh sach ma khuyen mai thanh cong.',
      data: vouchers,
    });
  } catch (error) {
    console.error('❌ Loi getVoucherCodes:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Khong the tai danh sach ma khuyen mai.',
      data: null,
    });
  }
}

export async function createVoucherCodeController(req, res) {
  try {
    const code = String(req.body?.code || '').trim();
    const voucherTypeId = Number(req.body?.voucher_type_id || 0);

    if (!code || !voucherTypeId) {
      return res.status(400).json({
        status: 'error',
        message: 'Ma voucher va loai voucher khong duoc de trong.',
        data: null,
      });
    }

    const created = await createVoucherCode({
      code,
      voucher_type_id: voucherTypeId,
      total_usage_limit: req.body?.total_usage_limit,
      start_at: req.body?.start_at,
      end_at: req.body?.end_at,
      is_active: req.body?.is_active,
    });

    if (!created) {
      return res.status(404).json({
        status: 'error',
        message: 'Khong tim thay loai voucher.',
        data: null,
      });
    }

    return res.status(201).json({
      status: 'success',
      message: 'Them ma khuyen mai thanh cong.',
      data: created,
    });
  } catch (error) {
    console.error('❌ Loi createVoucherCodeController:', error);

    const duplicateCode = String(error?.message || '').includes('uk_vouchers_code');
    if (duplicateCode) {
      return res.status(409).json({
        status: 'error',
        message: 'Ma voucher da ton tai.',
        data: null,
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Khong the them ma khuyen mai.',
      data: null,
    });
  }
}

export async function updateVoucherCodeController(req, res) {
  try {
    const id = Number(req.params.id || 0);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ID ma voucher khong hop le.',
        data: null,
      });
    }

    const updated = await updateVoucherCodeById(id, {
      code: req.body?.code,
      voucher_type_id: req.body?.voucher_type_id,
      total_usage_limit: req.body?.total_usage_limit,
      start_at: req.body?.start_at,
      end_at: req.body?.end_at,
      is_active: req.body?.is_active,
    });

    if (!updated) {
      return res.status(404).json({
        status: 'error',
        message: 'Khong tim thay ma voucher hoac loai voucher.',
        data: null,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Cap nhat ma khuyen mai thanh cong.',
      data: updated,
    });
  } catch (error) {
    console.error('❌ Loi updateVoucherCodeController:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Khong the cap nhat ma khuyen mai.',
      data: null,
    });
  }
}

export async function deleteVoucherCodeController(req, res) {
  try {
    const id = Number(req.params.id || 0);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ID ma voucher khong hop le.',
        data: null,
      });
    }

    const deleted = await deleteVoucherCodeById(id);

    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Khong tim thay ma voucher.',
        data: null,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Xoa ma khuyen mai thanh cong.',
      data: { id },
    });
  } catch (error) {
    console.error('❌ Loi deleteVoucherCodeController:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Khong the xoa ma khuyen mai.',
      data: null,
    });
  }
}

export async function getCheckoutVouchers(req, res) {
  try {
    const orderAmount = parseOrderAmount(req.query?.order_amount);

    if (orderAmount === null) {
      return res.status(400).json({
        status: 'error',
        message: 'Gia tri order_amount khong hop le.',
        data: null,
      });
    }

    const vouchers = await getAvailableVouchersForCheckout(orderAmount);

    return res.status(200).json({
      status: 'success',
      message: 'Lay danh sach voucher checkout thanh cong.',
      data: vouchers,
    });
  } catch (error) {
    console.error('❌ Loi getCheckoutVouchers:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Khong the tai danh sach voucher checkout.',
      data: null,
    });
  }
}

export async function validateCheckoutVoucher(req, res) {
  try {
    const code = String(req.body?.code || '').trim().toUpperCase();
    const orderAmount = parseOrderAmount(req.body?.order_amount);

    if (!code) {
      return res.status(400).json({
        status: 'error',
        message: 'Ma voucher khong duoc de trong.',
        data: null,
      });
    }

    if (orderAmount === null) {
      return res.status(400).json({
        status: 'error',
        message: 'Gia tri order_amount khong hop le.',
        data: null,
      });
    }

    const voucher = await getVoucherByCodeForCheckout(code);
    const check = checkVoucherAvailability(voucher, orderAmount);

    if (!check.ok) {
      return res.status(400).json({
        status: 'error',
        message: check.message,
        data: null,
      });
    }

    const discountAmount = calculateVoucherDiscountAmount(voucher, orderAmount);
    if (discountAmount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Voucher khong tao duoc gia tri giam gia cho don hang nay.',
        data: null,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Ap dung voucher hop le.',
      data: {
        ...voucher,
        discount_amount: discountAmount,
      },
    });
  } catch (error) {
    console.error('❌ Loi validateCheckoutVoucher:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Khong the kiem tra voucher luc nay.',
      data: null,
    });
  }
}

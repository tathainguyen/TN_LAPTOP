import {
  getAddressesByUserId,
  createAddress,
  updateAddress,
  deleteAddress,
  getAddressById,
  getUserById,
} from '../models/userModel.js';

export async function getAddressList(req, res) {
  try {
    const userId = Number(req.params.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ID người dùng không hợp lệ.',
        data: null,
      });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy người dùng.',
        data: null,
      });
    }

    const addresses = await getAddressesByUserId(userId);

    return res.status(200).json({
      status: 'success',
      message: 'Lấy danh sách địa chỉ thành công.',
      data: addresses,
    });
  } catch (error) {
    console.error('❌ Lỗi getAddressList:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Không thể lấy danh sách địa chỉ.',
      data: null,
    });
  }
}

export async function createAddressItem(req, res) {
  try {
    const userId = Number(req.params.userId);
    const {
      recipient_name,
      recipient_phone,
      province,
      district,
      ward,
      address_line,
      address_note,
      is_default,
    } = req.body;

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ID người dùng không hợp lệ.',
        data: null,
      });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy người dùng.',
        data: null,
      });
    }

    if (!recipient_name || !String(recipient_name).trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Tên người nhận không được để trống.',
        data: null,
      });
    }

    if (!recipient_phone || !String(recipient_phone).trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Số điện thoại không được để trống.',
        data: null,
      });
    }

    if (!province || !String(province).trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Tỉnh/Thành phố không được để trống.',
        data: null,
      });
    }

    if (!district || !String(district).trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Quận/Huyện không được để trống.',
        data: null,
      });
    }

    if (!ward || !String(ward).trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Phường/Xã không được để trống.',
        data: null,
      });
    }

    if (!address_line || !String(address_line).trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Địa chỉ chi tiết không được để trống.',
        data: null,
      });
    }

    const insertedId = await createAddress(userId, {
      recipientName: String(recipient_name).trim(),
      recipientPhone: String(recipient_phone).trim(),
      province: String(province).trim(),
      district: String(district).trim(),
      ward: String(ward).trim(),
      addressLine: String(address_line).trim(),
      addressNote: address_note ? String(address_note).trim() : null,
      isDefault: is_default ? 1 : 0,
    });

    const newAddress = await getAddressById(userId, insertedId);

    return res.status(201).json({
      status: 'success',
      message: 'Thêm địa chỉ thành công.',
      data: newAddress,
    });
  } catch (error) {
    console.error('❌ Lỗi createAddressItem:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Không thể thêm địa chỉ.',
      data: null,
    });
  }
}

export async function updateAddressItem(req, res) {
  try {
    const userId = Number(req.params.userId);
    const addressId = Number(req.params.addressId);
    const {
      recipient_name,
      recipient_phone,
      province,
      district,
      ward,
      address_line,
      address_note,
      is_default,
    } = req.body;

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ID người dùng không hợp lệ.',
        data: null,
      });
    }

    if (!Number.isInteger(addressId) || addressId <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ID địa chỉ không hợp lệ.',
        data: null,
      });
    }

    const address = await getAddressById(userId, addressId);
    if (!address) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy địa chỉ.',
        data: null,
      });
    }

    const addressData = {};
    if (recipient_name !== undefined) addressData.recipientName = String(recipient_name).trim();
    if (recipient_phone !== undefined) addressData.recipientPhone = String(recipient_phone).trim();
    if (province !== undefined) addressData.province = String(province).trim();
    if (district !== undefined) addressData.district = String(district).trim();
    if (ward !== undefined) addressData.ward = String(ward).trim();
    if (address_line !== undefined) addressData.addressLine = String(address_line).trim();
    if (address_note !== undefined) addressData.addressNote = address_note ? String(address_note).trim() : null;
    if (is_default !== undefined) addressData.isDefault = is_default ? 1 : 0;

    const updated = await updateAddress(userId, addressId, addressData);

    if (!updated) {
      return res.status(500).json({
        status: 'error',
        message: 'Không thể cập nhật địa chỉ.',
        data: null,
      });
    }

    const updatedAddress = await getAddressById(userId, addressId);

    return res.status(200).json({
      status: 'success',
      message: 'Cập nhật địa chỉ thành công.',
      data: updatedAddress,
    });
  } catch (error) {
    console.error('❌ Lỗi updateAddressItem:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Không thể cập nhật địa chỉ.',
      data: null,
    });
  }
}

export async function deleteAddressItem(req, res) {
  try {
    const userId = Number(req.params.userId);
    const addressId = Number(req.params.addressId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ID người dùng không hợp lệ.',
        data: null,
      });
    }

    if (!Number.isInteger(addressId) || addressId <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ID địa chỉ không hợp lệ.',
        data: null,
      });
    }

    const address = await getAddressById(userId, addressId);
    if (!address) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy địa chỉ.',
        data: null,
      });
    }

    const deleted = await deleteAddress(userId, addressId);

    if (!deleted) {
      return res.status(500).json({
        status: 'error',
        message: 'Không thể xóa địa chỉ.',
        data: null,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Xóa địa chỉ thành công.',
      data: null,
    });
  } catch (error) {
    console.error('❌ Lỗi deleteAddressItem:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Không thể xóa địa chỉ.',
      data: null,
    });
  }
}

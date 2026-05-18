import React from 'react';
import {
    X,
    Save,
    Edit,
    Plus,
    Wifi,
    Presentation,
    AirVent,
    Brush,
    Volume2,
    Loader2
} from 'lucide-react';

import type { RoomListDTO, Device } from '../../utils/types/room';

interface RoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    editingRoom: RoomListDTO | null;
    formData: any;
    onFormChange: (field: string, value: any) => void;
    saving: boolean;
}

const RoomModal: React.FC<RoomModalProps> = ({
    isOpen,
    onClose,
    onSave,
    editingRoom,
    formData,
    onFormChange,
    saving
}) => {
    const deviceLabels: Record<string, string> = {
        PROJECTOR: 'Máy chiếu',
        WIFI: 'WiFi',
        AIR_CONDITIONER: 'Điều hòa',
        WHITEBOARD: 'Bảng trắng',
        SPEAKER: 'Loa'
    };

    const deviceIcons: Record<string, any> = {
        PROJECTOR: Presentation,
        WIFI: Wifi,
        AIR_CONDITIONER: AirVent,
        WHITEBOARD: Brush,
        SPEAKER: Volume2
    };

    const handleDeviceToggle = (deviceType: string) => {
        const currentDevices = [...formData.devices];
        const deviceIndex = currentDevices.findIndex((d: Device) => d.type === deviceType);

        if (deviceIndex === -1) {
            currentDevices.push({ type: deviceType } as Device);
        } else {
            currentDevices.splice(deviceIndex, 1);
        }

        onFormChange('devices', currentDevices);
    };

    const isDeviceSelected = (deviceType: string) => {
        return formData.devices.some((d: Device) => d.type === deviceType);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-100">

                {/* HEADER */}
                <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
                            {editingRoom ? (
                                <Edit className="text-gray-700" size={20} />
                            ) : (
                                <Plus className="text-gray-700" size={20} />
                            )}
                        </div>

                        <h2 className="text-lg font-semibold text-gray-800 tracking-tight">
                            {editingRoom ? 'Chỉnh sửa phòng học' : 'Thêm phòng học mới'}
                        </h2>
                    </div>

                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="p-2.5 rounded-xl hover:bg-gray-100 transition disabled:opacity-50"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-6 space-y-8 bg-white">

                    {/* BASIC INFO */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Thông tin cơ bản
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            <div>
                                <label className="text-sm text-gray-600 mb-1 block">
                                    Tên phòng <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => onFormChange('name', e.target.value)}
                                    disabled={saving}
                                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200
                             focus:ring-2 focus:ring-gray-300 transition outline-none
                             hover:border-gray-300"
                                    placeholder="VD: P.101 - Tòa 1"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 mb-1 block">
                                    Sức chứa <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.seatCapacity}
                                    onChange={(e) =>
                                        onFormChange('seatCapacity', parseInt(e.target.value) || 0)
                                    }
                                    disabled={saving}
                                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200
                             focus:ring-2 focus:ring-gray-300 transition outline-none
                             hover:border-gray-300"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 mb-1 block">
                                    Trạng thái
                                </label>
                                <select
                                    value={formData.manualStatus || formData.status}
                                    onChange={(e) => {
                                        onFormChange('manualStatus', e.target.value);
                                        onFormChange('status', e.target.value);
                                    }}
                                    disabled={saving}
                                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200
                             focus:ring-2 focus:ring-gray-300 transition outline-none"
                                >
                                    <option value="ACTIVE">Hoạt động</option>
                                    <option value="DISABLED">Vô hiệu hóa</option>
                                    <option value="MAINTENANCE">Bảo trì</option>
                                </select>
                            </div>

                        </div>
                    </div>

                    {/* DEVICES */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Thiết bị trong phòng
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.keys(deviceLabels).map((deviceType) => {
                                const Icon = deviceIcons[deviceType];
                                const isSelected = isDeviceSelected(deviceType);

                                return (
                                    <button
                                        key={deviceType}
                                        type="button"
                                        onClick={() => handleDeviceToggle(deviceType)}
                                        disabled={saving}
                                        className={`
                      group flex items-center gap-3 p-3 rounded-2xl border transition-all
                      hover:scale-[1.02] active:scale-[0.98]
                      ${isSelected
                                                ? 'border-gray-400 bg-gray-50'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }
                    `}
                                    >
                                        <Icon
                                            size={18}
                                            className={`${isSelected
                                                    ? 'text-gray-800'
                                                    : 'text-gray-400 group-hover:text-gray-600'
                                                }`}
                                        />

                                        <span className="text-sm font-medium text-gray-700">
                                            {deviceLabels[deviceType]}
                                        </span>

                                        {isSelected && (
                                            <div className="ml-auto w-2 h-2 rounded-full bg-gray-800" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <p className="text-xs text-gray-400">
                            Chọn thiết bị có sẵn trong phòng
                        </p>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="sticky bottom-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 px-6 py-4 flex justify-end gap-3">

                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="px-5 py-2.5 rounded-2xl border border-gray-200 text-gray-600
                       hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        Hủy
                    </button>

                    <button
                        onClick={onSave}
                        disabled={saving}
                        className="px-5 py-2.5 rounded-2xl bg-gray-900 text-white
                       hover:bg-black transition flex items-center gap-2
                       disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                {editingRoom ? 'Cập nhật' : 'Thêm mới'}
                            </>
                        )}
                    </button>

                </div>
            </div>
        </div>
    );
};

export default RoomModal;
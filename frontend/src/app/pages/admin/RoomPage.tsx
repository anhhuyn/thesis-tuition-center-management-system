import React, { useState, useEffect } from 'react';
import {
  Search,
  MoreVertical,
  Wifi,
  Presentation,
  AirVent,
  Brush,
  CheckCircle,
  AlertCircle,
  Calendar,
  TrendingUp,
  Sparkles,
  ClipboardList,
  Building2,
  Users,
  DoorOpen,
  Activity,
  ChevronRight,
  Grid3x3,
  LayoutList,
  Clock,
  BatteryCharging,
  Eye,
  Zap,
  Plus,
  Trash2,
  Edit,
  Volume2,
  Loader2
} from 'lucide-react';
import type { RoomListDTO, Device, DeviceUpdateDTO } from '../../utils/types/room';
import { roomApi } from '../../utils/api/room.api';
import RoomModal from '../../components/adminComponents/RoomModal';
import { useOutletContext } from 'react-router-dom';

const RoomPage = () => {
  const [classrooms, setClassrooms] = useState<RoomListDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomListDTO | null>(null);
  const { setAlert } = useOutletContext<any>();
  const [formData, setFormData] = useState<any>({
    name: '',
    seatCapacity: 30,
    manualStatus: 'ACTIVE',
    status: 'ACTIVE',
    location: '',
    devices: []
  });

  // Fetch rooms from API
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await roomApi.getAll();
      if (response.data) {
        setClassrooms(response.data);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Không thể tải danh sách phòng. Vui lòng thử lại sau.';
      setError(errorMessage);
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function để map status từ API sang UI
  const getRoomStatus = (room: RoomListDTO) => {
    // manual override cao nhất
    if (room.manualStatus === 'MAINTENANCE') {
      return {
        occupied: false,
        available: false,
        disabled: false,
        maintenance: true,
      };
    }

    if (room.manualStatus === 'DISABLED') {
      return {
        occupied: false,
        available: false,
        disabled: true,
        maintenance: false,
      };
    }

    // manual ACTIVE => xét status thật
    return {
      occupied: room.status === 'ACTIVE',
      available: room.status === 'DISABLED',
      disabled: false,
      maintenance: false,
    };
  };

  // Helper function để map devices từ API
  const getDevices = (devices: Device[]) => {
    return {
      projector: devices.some(d => d.type === 'PROJECTOR'),
      wifi: devices.some(d => d.type === 'WIFI'),
      ac: devices.some(d => d.type === 'AIR_CONDITIONER'),
      whiteboard: devices.some(d => d.type === 'WHITEBOARD'),
      speaker: devices.some(d => d.type === 'SPEAKER')
    };
  };

  const stats = {
    totalRooms: classrooms.length,

    inUse: classrooms.filter(
      r =>
        r.manualStatus === 'ACTIVE' &&
        r.status === 'ACTIVE'
    ).length,

    empty: classrooms.filter(
      r =>
        r.manualStatus === 'ACTIVE' &&
        r.status === 'DISABLED'
    ).length,

    maintenance: classrooms.filter(
      r => r.manualStatus === 'MAINTENANCE'
    ).length,

    disabled: classrooms.filter(
      r => r.manualStatus === 'DISABLED'
    ).length,

    avgOccupancy:
      classrooms.length > 0
        ? Math.round(
          (
            classrooms.filter(
              r =>
                r.manualStatus === 'ACTIVE' &&
                r.status === 'ACTIVE'
            ).length /
            classrooms.length
          ) * 100
        )
        : 0,
  };

  const DeviceIcon = ({
    active,
    icon: Icon,
    label,
  }: {
    active: boolean;
    icon: any;
    label: string;
  }) => {
    const [hovered, setHovered] = useState(false);

    return (
      <div
        className="relative flex items-center justify-center"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span
          className={`transition-all duration-200 ${active ? "text-indigo-500" : "text-gray-300"
            }`}
        >
          <Icon size={16} strokeWidth={active ? 2 : 1.5} />
        </span>
        {hovered && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
              {label}
            </div>
          </div>
        )}
      </div>
    );
  };

  const StatusBadge = ({ type, value }: { type: string; value: boolean }) => {
    if (!value) return null;
    const config: Record<string, { color: string; label: string; icon: any }> = {
      available: {
        color: "emerald",
        label: "Trống",
        icon: CheckCircle,
      },

      maintenance: {
        color: "rose",
        label: "Bảo trì",
        icon: AlertCircle,
      },

      occupied: {
        color: "indigo",
        label: "Đang sử dụng",
        icon: Users,
      },

      disabled: {
        color: "gray",
        label: "Vô hiệu hóa",
        icon: AlertCircle,
      },
    };
    const { color, label, icon: Icon } = config[type];
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-${color}-50 text-${color}-600`}>
        <Icon size={12} />
        {label}
      </span>
    );
  };

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRooms = classrooms.filter(room =>
    room.id.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (room?: RoomListDTO) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        name: room.name,
        seatCapacity: room.seatCapacity,
        manualStatus: room.manualStatus,
        status: room.status,
        location: (room as any).location || '',
        devices: room.devices || []
      });
    } else {
      setEditingRoom(null);
      setFormData({
        name: '',
        seatCapacity: 30,
        manualStatus: 'ACTIVE',
        status: 'ACTIVE',
        location: '',
        devices: []
      });
    }
    setIsModalOpen(true);
  };

  // Hàm xử lý đồng bộ devices
  const syncDevices = async (roomId: number, selectedDevices: Device[]) => {
    try {
      // Lấy danh sách device hiện tại của phòng
      const currentDevicesResponse = await roomApi.getDevices(roomId);
      const currentDevices = currentDevicesResponse.data || [];

      // Tìm devices cần xóa (có trong current nhưng không có trong selected)
      const devicesToDelete = currentDevices.filter(
        current => !selectedDevices.some(selected => selected.type === current.type)
      );

      // Tìm devices cần thêm (có trong selected nhưng không có trong current)
      const devicesToAdd = selectedDevices.filter(
        selected => !currentDevices.some(current => current.type === selected.type)
      );

      // Xóa devices
      for (const device of devicesToDelete) {
        await roomApi.deleteDevice(device.id);
      }

      // Thêm devices mới
      for (const device of devicesToAdd) {
        await roomApi.addDevice(roomId, device.type);
      }

      console.log(`Synced devices for room ${roomId}: deleted ${devicesToDelete.length}, added ${devicesToAdd.length}`);
    } catch (error) {
      console.error('Error syncing devices:', error);
      throw error;
    }
  };

  // Helper function để tạo DeviceUpdateDTO
const getDeviceUpdates = (currentDevices: Device[], newDevices: Device[]): DeviceUpdateDTO[] => {
  const updates: DeviceUpdateDTO[] = [];
  
  // Tìm devices cần xóa
  const devicesToDelete = currentDevices.filter(
    current => !newDevices.some(newDevice => newDevice.type === current.type)
  );
  
  // Tìm devices cần thêm
  const devicesToAdd = newDevices.filter(
    newDevice => !currentDevices.some(current => current.type === newDevice.type)
  );
  
  devicesToDelete.forEach(device => {
    updates.push({
      id: device.id,
      type: device.type,
      action: 'DELETE'
    });
  });
  
  devicesToAdd.forEach(device => {
    updates.push({
      id: null,
      type: device.type,
      action: 'ADD'
    });
  });
  
  return updates;
};


  const handleSaveRoom = async () => {
  // Validate
  if (!formData.name.trim()) {
    alert('Vui lòng điền tên phòng học');
    return;
  }

  if (formData.seatCapacity < 1) {
    alert('Sức chứa phải lớn hơn 0');
    return;
  }

  setSaving(true);
  try {
    // Chuẩn bị data cơ bản
    const roomData: any = {
      name: formData.name.trim(),
      seatCapacity: formData.seatCapacity,
      manualStatus: formData.manualStatus
    };

    if (editingRoom) {
      // Lấy danh sách devices hiện tại
      const currentDevicesResponse = await roomApi.getDevices(editingRoom.id);
      const currentDevices = currentDevicesResponse.data || [];
      
      // Tạo device updates nếu có thay đổi
      const deviceUpdates = getDeviceUpdates(currentDevices, formData.devices);
      
      if (deviceUpdates.length > 0) {
        roomData.devices = deviceUpdates;
      }
      
      // Gọi API update duy nhất, có thể có hoặc không có devices
      const updateResponse = await roomApi.update(editingRoom.id, roomData);
      
      setAlert?.({
        type: "success",
        message: "Cập nhật phòng học thành công",
      });
    } else {
      // THÊM MỚI
      const createResponse = await roomApi.create(roomData);
      const savedRoom = createResponse.data;

      // Thêm devices cho phòng mới
      if (savedRoom && formData.devices.length > 0) {
        for (const device of formData.devices) {
          await roomApi.addDevice(savedRoom.id, device.type);
        }
      }

      setAlert?.({
        type: "success",
        message: "Thêm phòng học mới thành công",
      });
    }

    // Refresh danh sách
    await fetchRooms();
    setIsModalOpen(false);
    setEditingRoom(null);
  } catch (err: any) {
    console.error('Error saving room:', err);
    const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi lưu phòng học';
    setAlert?.({
      type: "error",
      message: errorMessage,
    });
  } finally {
    setSaving(false);
  }
};

  const handleDeleteRoom = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phòng học này? Hành động này không thể hoàn tác.')) {
      try {
        await roomApi.delete(id);
        setAlert?.({
          type: "success",
          message: "Xóa phòng học thành công",
        });
        await fetchRooms();
      } catch (err: any) {
        console.error('Error deleting room:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xóa phòng học';
        setAlert?.({
          type: "error",
          message: errorMessage,
        });
      }
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  // Hardcoded energy score (có thể thay bằng API thật sau)
  const getEnergyScore = (roomId: number) => {
    const scores: Record<number, number> = {
      1: 85,
      2: 72,
    };
    return scores[roomId] || 75;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/20 p-6 font-sans flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-500 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Đang tải danh sách phòng học...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/20 p-6 font-sans flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchRooms}
            className="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/20 p-6 font-sans">
      {/* Room Modal */}
      <RoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRoom}
        editingRoom={editingRoom}
        formData={formData}
        onFormChange={handleInputChange}
        saving={saving}
      />

      <div className="max-w-7xl mx-auto">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          {[
            {
              icon: Building2,
              label: "Tổng số phòng",
              value: stats.totalRooms,
              color: "indigo",
              trend: null
            },

            {
              icon: Users,
              label: "Đang sử dụng",
              value: stats.inUse,
              color: "emerald",
              trend: "+8%"
            },

            {
              icon: DoorOpen,
              label: "Phòng trống",
              value: stats.empty,
              color: "amber",
              trend: "-2%"
            },

            {
              icon: Activity,
              label: "Bảo trì",
              value: stats.maintenance,
              color: "rose",
              trend: "0%"
            },

            {
              icon: AlertCircle,
              label: "Vô hiệu hóa",
              value: stats.disabled,
              color: "gray",
              trend: null
            },

            {
              icon: BatteryCharging,
              label: "Hiệu suất",
              value: `${stats.avgOccupancy}%`,
              color: "violet",
              trend: "+12%"
            },
          ].map((stat, idx) => (
            <div key={idx} className="group bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/50 hover:shadow-lg hover:bg-white transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100/50 group-hover:scale-105 transition-transform duration-200`}>
                  <stat.icon className={`text-${stat.color}-500`} size={20} />
                </div>
                {stat.trend && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stat.trend.startsWith('+') ? 'bg-emerald-100 text-emerald-600' : stat.trend.startsWith('-') ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-600'}`}>
                    {stat.trend}
                  </span>
                )}
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-xs text-gray-500 font-medium tracking-wide">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã phòng, tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white/80 backdrop-blur-sm transition-all"
            />
          </div>
          <div className="flex gap-2 bg-white/80 backdrop-blur-sm p-1 rounded-xl border border-gray-200 w-fit">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutList size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid3x3 size={18} />
            </button>
          </div>
        </div>

        {/* Dynamic View: Table or Grid */}
        {viewMode === 'table' ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                  <tr>
                    {["ID", "TÊN PHÒNG", "SỨC CHỨA", "THIẾT BỊ", "TRẠNG THÁI", "SỬ DỤNG HIỆN TẠI", ""].map((h) => (
                      <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRooms.map((room) => {
                    const status = getRoomStatus(room);
                    const devices = getDevices(room.devices);
                    const currentUsage = room.activeSession;

                    return (
                      <tr key={room.id} className="group hover:bg-indigo-50/30 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs text-gray-400">Room {room.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{room.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users size={14} className="text-gray-400" />
                            {room.seatCapacity}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2.5">
                            <DeviceIcon active={devices.projector} icon={Presentation} label="Máy chiếu" />
                            <DeviceIcon active={devices.wifi} icon={Wifi} label="WiFi" />
                            <DeviceIcon active={devices.ac} icon={AirVent} label="Điều hòa" />
                            <DeviceIcon active={devices.whiteboard} icon={Brush} label="Bảng trắng" />
                            <DeviceIcon active={devices.speaker} icon={Volume2} label="Loa" />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-1.5">
                            {status.available && (
                              <StatusBadge type="available" value />
                            )}

                            {status.maintenance && (
                              <StatusBadge type="maintenance" value />
                            )}

                            {status.occupied && (
                              <StatusBadge type="occupied" value />
                            )}

                            {status.disabled && (
                              <StatusBadge type="disabled" value />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {currentUsage ? (
                            <div className="space-y-0.5">
                              <div className="font-medium text-gray-800">
                                {currentUsage.subjectName}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Users size={10} /> {currentUsage.studentCount} sv
                                <Clock size={10} />
                                {currentUsage.startTime} - {currentUsage.endTime}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">----</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenModal(room)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteRoom(room.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                            <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all">
                              <MoreVertical size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 border-t border-gray-100 text-sm text-gray-500 bg-gray-50/30 flex justify-between items-center">
              <span>Hiển thị {filteredRooms.length} trên {classrooms.length} Phòng học</span>
              <button className="text-indigo-500 text-xs font-medium hover:text-indigo-600">Xem tất cả →</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {filteredRooms.map((room) => {
              const status = getRoomStatus(room);
              const devices = getDevices(room.devices);
              const currentUsage = room.activeSession;
              const energyScore = getEnergyScore(room.id);

              return (
                <div key={room.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm text-gray-500">{room.name}</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {status.available && (
                          <StatusBadge type="available" value />
                        )}

                        {status.occupied && (
                          <StatusBadge type="occupied" value />
                        )}

                        {status.maintenance && (
                          <StatusBadge type="maintenance" value />
                        )}

                        {status.disabled && (
                          <StatusBadge type="disabled" value />
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex gap-3">
                        <DeviceIcon active={devices.projector} icon={Presentation} label="Máy chiếu" />
                        <DeviceIcon active={devices.wifi} icon={Wifi} label="WiFi" />
                        <DeviceIcon active={devices.ac} icon={AirVent} label="Điều hòa" />
                        <DeviceIcon active={devices.whiteboard} icon={Brush} label="Bảng trắng" />
                        <DeviceIcon active={devices.speaker} icon={Volume2} label="Loa" />
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400">Sức chứa</div>
                        <div className="font-medium text-gray-700">{room.seatCapacity} sv</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 mb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <Zap size={12} className="text-indigo-400" />
                        Đang diễn ra
                      </div>
                      {currentUsage ? (
                        <>
                          <p className="text-sm font-medium text-gray-800">
                            {currentUsage.subjectName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {currentUsage.startTime} - {currentUsage.endTime}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Không có hoạt động</p>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 text-xs">
                        <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full bg-gradient-to-r ${energyScore >= 80 ? 'from-emerald-400 to-emerald-500' : energyScore >= 60 ? 'from-amber-400 to-amber-500' : 'from-rose-400 to-rose-500'}`} style={{ width: `${energyScore}%` }}></div>
                        </div>
                        <span className="text-gray-500">HS {energyScore}%</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleOpenModal(room)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button className="text-indigo-500 text-xs font-medium flex items-center gap-1 hover:gap-2 transition-all">
                          Chi tiết <Eye size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-white to-indigo-50/20 rounded-2xl p-6 shadow-sm border border-indigo-100/50">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-indigo-100 rounded-xl"><TrendingUp className="text-indigo-600" size={20} /></div>
              <h2 className="font-semibold text-gray-800 text-lg">Tối ưu cơ sở vật chất</h2>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-5">Công suất đạt đỉnh từ 10:00 – 14:00. AI đề xuất chuyển lịch bảo trì sang khung giờ 19:00 – 22:00 để tăng 23% hiệu quả sử dụng phòng trong giờ cao điểm.</p>
            <div className="flex gap-8">
              <div>
                <p className="text-xs text-gray-500 font-medium">TRUNG BÌNH NGÀY</p>
                <p className="text-2xl font-bold text-gray-800">82%</p>
                <p className="text-xs text-emerald-600 mt-1">↑ 5% so với tháng trước</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">TIẾT KIỆM NĂNG LƯỢNG</p>
                <p className="text-2xl font-bold text-emerald-600">1.24kWh</p>
                <p className="text-xs text-gray-500 mt-1">/phòng/ngày</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-violet-50/20 rounded-2xl p-6 shadow-sm border border-violet-100/50">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-violet-100 rounded-xl"><Sparkles className="text-violet-600" size={20} /></div>
              <h2 className="font-semibold text-gray-800 text-lg">Sắp xếp lịch thông minh</h2>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-5">Thuật toán phân bổ động của AI giúp tăng hiệu suất phòng đến <strong className="text-violet-600">20%</strong> và rút ngắn 15% thời gian di chuyển giữa các lớp liên tiếp.</p>
            <button className="bg-indigo-50 text-indigo-700 px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-indigo-100 hover:shadow-md transition-all duration-200 group">
              <ClipboardList size={16} className="group-hover:scale-110 transition-transform" />
              Phân tích lịch trình bằng AI
            </button>
          </div>
        </div>
      </div>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => handleOpenModal()}
          className="relative group w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 text-white shadow-2xl shadow-indigo-500/30 dark:shadow-indigo-600/40 backdrop-blur-sm overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          {/* Glow */}
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"
          />

          {/* Pulse Ring */}
          <span className="absolute inset-0 rounded-full border-2 border-indigo-400/60 animate-ping" />

          {/* Icon */}
          <Plus
            size={26}
            strokeWidth={2}
            className="relative z-10 mx-auto"
          />
        </button>
      </div>
    </div>
  );
};

export default RoomPage;
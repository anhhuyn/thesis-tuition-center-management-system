// payroll.api.ts

import axios from '../axios';
import type {
  PayrollPreviewResponse,
  PayrollDetailResponse,
  TeacherPayment,
  PayrollPreviewRequest,
  TeacherPayrollConfirmRequest,
  PayrollFinalizeRequest,
  PayrollStats,
  PayrollListItem,
  MonthlyPayrollPreview,
  MonthlyPayrollStats,
  TeacherPayrollSummary
} from '../types/payroll';

const logRequest = (method: string, url: string, params?: any, data?: any) => {
  console.log(`📤 ${method} ${url}`, { params, data });
};

const logResponse = (method: string, url: string, response: any) => {
  console.log(`📥 ${method} ${url} - Status: OK`);
};
const logError = (method: string, url: string, error: any) => {
  console.error(`❌ ${method} ${url} - Error:`, error.response?.data || error.message);
};


export const payrollApi = {
  // ========== Preview - 1 giáo viên ==========
  previewPayroll(request: PayrollPreviewRequest): Promise<PayrollPreviewResponse> {
    logRequest('POST', '/payroll/preview', undefined, request);
    return axios.post('/payroll/preview', request);
  },

  // ========== Generate - 1 giáo viên ==========
  generatePayroll(request: PayrollPreviewRequest): Promise<TeacherPayment> {
    logRequest('POST', '/payroll/generate', undefined, request);
    return axios.post('/payroll/generate', request);
  },

  // ========== Giáo viên xác nhận ==========
  confirmPayroll(request: TeacherPayrollConfirmRequest): Promise<string> {
    logRequest('POST', '/payroll/confirm', undefined, request);
    return axios.post('/payroll/confirm', request);
  },

  // ========== Admin chốt lương ==========
  finalizePayroll(request: PayrollFinalizeRequest, adminId: number): Promise<string> {
    logRequest('POST', `/payroll/finalize?adminId=${adminId}`, undefined, request);
    return axios.post('/payroll/finalize', request, {
      params: { adminId }
    });
  },

  // ========== Lấy danh sách bảng lương (Admin) ==========
  getAllPayrolls(): Promise<PayrollListItem[]> {
    logRequest('GET', '/payroll');
    return axios.get('/payroll');
  },

  // ========== Lấy chi tiết bảng lương theo ID (Admin) ==========
  getPayrollById(id: number): Promise<PayrollDetailResponse> {
    logRequest('GET', `/payroll/${id}`);
    return axios.get(`/payroll/${id}`);
  },

  // ========== Export bảng lương ==========
  exportPayroll(id: number): Promise<PayrollDetailResponse> {
    logRequest('GET', `/payroll/${id}/export`);
    return axios.get(`/payroll/${id}/export`);
  },

  // ========== Preview tất cả giáo viên trong tháng ==========
  previewMonthlyPayroll(month: number, year: number): Promise<MonthlyPayrollPreview> {
    logRequest('GET', '/payroll/monthly-preview', { month, year });
    return axios.get('/payroll/monthly-preview', {
      params: { month, year }
    });
  },

  // ========== Tạo bảng lương hàng loạt ==========
  generateMonthlyPayroll(month: number, year: number): Promise<TeacherPayment[]> {
    logRequest('POST', '/payroll/generate-month', { month, year });
    return axios.post('/payroll/generate-month', null, {
      params: { month, year }
    });
  },

  // ========== Thống kê bảng lương theo tháng ==========
  getMonthlyStats(month: number, year: number): Promise<MonthlyPayrollStats> {
    logRequest('GET', '/payroll/monthly-stats', { month, year });
    return axios.get('/payroll/monthly-stats', {
      params: { month, year }
    });
  },

  // ========== Giáo viên xem danh sách lương của mình ==========
  getMyPayrolls(teacherId: number): Promise<TeacherPayrollSummary[]> {
    logRequest('GET', '/payroll/my', { teacherId });
    return axios.get('/payroll/my', {
      params: { teacherId }
    });
  },

  // ========== Giáo viên xem chi tiết 1 bảng lương của mình ==========
  getMyPayrollDetail(paymentId: number, teacherId: number): Promise<PayrollDetailResponse> {
    logRequest('GET', `/payroll/my/${paymentId}`, { teacherId });
    return axios.get(`/payroll/my/${paymentId}`, {
      params: { teacherId }
    });
  },

  // ========== Utility Functions ==========
  async checkPayrollExists(teacherId: number, month: number, year: number): Promise<boolean> {
    try {
      const payrolls = await this.getAllPayrolls();
      return payrolls.some(p => p.teacherId === teacherId && p.month === month && p.year === year);
    } catch (error) {
      console.error('❌ API checkPayrollExists error:', error);
      return false;
    }
  },

  async getPayrollStats(month?: number, year?: number): Promise<PayrollStats> {
    try {
      const currentMonth = month || new Date().getMonth() + 1;
      const currentYear = year || new Date().getFullYear();

      const [stats, allPayrolls] = await Promise.all([
        this.getMonthlyStats(currentMonth, currentYear),
        this.getAllPayrolls()
      ]);

      return {
        totalAmount: stats.totalAmount,
        totalPaidAmount: 0,
        totalPayrolls: allPayrolls.length,
        draftCount: allPayrolls.filter(p => p.status === 'DRAFT').length,
        waitingConfirmationCount: allPayrolls.filter(p => p.status === 'WAITING_TEACHER_CONFIRMATION').length,
        confirmedCount: allPayrolls.filter(p => p.status === 'TEACHER_CONFIRMED').length,
        finalizedCount: allPayrolls.filter(p => p.status === 'FINALIZED').length,
        paidCount: allPayrolls.filter(p => p.status === 'PAID').length,
        completionRate: allPayrolls.length > 0
          ? Math.round((allPayrolls.filter(p => p.status === 'FINALIZED' || p.status === 'PAID').length / allPayrolls.length) * 100)
          : 0
      };
    } catch (error) {
      console.error('❌ API getPayrollStats error:', error);
      return {
        totalAmount: 0,
        totalPaidAmount: 0,
        totalPayrolls: 0,
        draftCount: 0,
        waitingConfirmationCount: 0,
        confirmedCount: 0,
        finalizedCount: 0,
        paidCount: 0,
        completionRate: 0
      };
    }
  },

  
};
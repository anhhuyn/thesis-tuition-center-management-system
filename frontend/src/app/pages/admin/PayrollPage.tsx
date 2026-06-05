// PayrollPage.tsx
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import PayrollModule from '../../components/adminComponents/payroll/PayrollModule';

interface PageContext {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const PayrollPage: React.FC = () => {
  const context = useOutletContext<PageContext>();
  console.log('PayrollPage context:', context);
  const showToast = context?.showToast || ((message: string, type?: 'success' | 'error' | 'info') => {
    console.log(`[${type || 'info'}]: ${message}`);
  });
  
  return <PayrollModule showToast={showToast} />;
};

export default PayrollPage;
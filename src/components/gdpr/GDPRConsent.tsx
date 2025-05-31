import { useState } from 'react';
import { useAuth } from '../../store/auth';
import { Shield, Download, Trash2 } from 'lucide-react';

export function GDPRConsent() {
  const { gdp, setGdp, reqData, delData, ldg } = useAuth();
  
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [dlg, setDlg] = useState<string | null>(null);

  const handleConsentChange = async (val: boolean) => {
    setMsg('');
    setErr('');
    
    const { err: consentErr } = await setGdp(val);
    
    if (consentErr) {
      setErr(consentErr);
    } else {
      setMsg(`Data processing consent ${val ? 'given' : 'withdrawn'}`);
      // Auto-clear success message after 3 seconds
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const handleDataRequest = async () => {
    setMsg('');
    setErr('');
    
    const { err: dataErr, url } = await reqData();
    
    if (dataErr) {
      setErr(dataErr);
    } else if (url) {
      setMsg('Data export prepared successfully');
      // In a real app, this would handle the download
      window.open(url, '_blank');
      // Auto-clear success message after 3 seconds
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const confirmDelete = () => {
    setDlg('delete');
  };

  const handleDataDelete = async () => {
    setMsg('');
    setErr('');
    setDlg(null);
    
    const { err: deleteErr } = await delData();
    
    if (deleteErr) {
      setErr(deleteErr);
    }
    // No need for success message as user will be logged out
  };

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Shield className="h-6 w-6 text-blue-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">Data Privacy Settings</h3>
            <p className="mt-1 text-sm text-gray-500">
              Control how your data is used and manage your privacy rights under GDPR.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="gdpr-consent"
                type="checkbox"
                checked={gdp}
                onChange={(e) => handleConsentChange(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="gdpr-consent" className="font-medium text-gray-700">
                Data processing consent
              </label>
              <p className="text-gray-500">
                Allow SkillSwapX to process your personal data to improve your experience and provide
                personalized services. You can withdraw consent at any time.
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900">Your data rights</h4>
            <p className="mt-1 text-xs text-gray-500">
              Under GDPR, you have the right to access, export, and delete your personal data.
            </p>
            
            <div className="mt-4 flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={handleDataRequest}
                disabled={ldg}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Download className="mr-2 h-4 w-4 text-gray-500" />
                {ldg ? 'Processing...' : 'Export my data'}
              </button>
              
              <button
                type="button"
                onClick={confirmDelete}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                Delete all my data
              </button>
            </div>
          </div>

          {msg && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{msg}</p>
                </div>
              </div>
            </div>
          )}

          {err && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{err}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation dialog for data deletion */}
      {dlg === 'delete' && (
        <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">Delete all your data</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete all your data? This action cannot be undone.
                        Your account will be permanently deleted and you will be logged out.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button 
                  type="button" 
                  onClick={handleDataDelete}
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete permanently
                </button>
                <button 
                  type="button"
                  onClick={() => setDlg(null)}
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useMock } from '../contexts/MockContext';

export const BackendUnavailableDialog: React.FC = () => {
  const { showDialog, dismissDialog } = useMock();

  if (!showDialog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative bg-darkest border border-lightest/30 rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
        <div className="mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-text mb-3">Service Temporarily Unavailable</h2>
        <p className="text-texthover text-sm leading-relaxed mb-6">
          We couldn't reach the server right now. You can still browse the store with sample content to get a feel for things.
        </p>
        <button
          onClick={dismissDialog}
          className="w-full py-3 px-6 bg-secondary hover:bg-secondary/80 text-white font-semibold rounded-lg transition-colors"
        >
          Continue with Demo
        </button>
      </div>
    </div>
  );
};

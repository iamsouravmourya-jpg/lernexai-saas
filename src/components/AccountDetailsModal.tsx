import { useState, useEffect } from "react";
import { X, Save, User, Mail, Phone, CheckCircle2 } from "lucide-react";

interface AccountDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  };
  onSave: (data: { first_name: string; last_name: string; phone: string }) => Promise<void>;
}

export default function AccountDetailsModal({ isOpen, onClose, user, onSave }: AccountDetailsModalProps) {
  const [firstName, setFirstName] = useState(user.first_name || "");
  const [lastName, setLastName] = useState(user.last_name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setPhone(user.phone || "");
      setShowSuccess(false);
    }
  }, [isOpen, user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      console.log("Saving account details:", { firstName, lastName, phone });
      await onSave({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim()
      });
      console.log("Save successful");
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Failed to save account details:", error);
      alert("Failed to save account details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-textDark">Account Details</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-all"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Profile Avatar */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-lg">
              <User className="h-12 w-12" />
            </div>
          </div>

          {/* First Name */}
          <div>
            <label className="block text-sm font-semibold text-textDark mb-2">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-primary transition-all"
              placeholder="Enter your first name"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-semibold text-textDark mb-2">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-primary transition-all"
              placeholder="Enter your last name"
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-semibold text-textDark mb-2">Email</label>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-border">
              <Mail className="h-5 w-5 text-textMuted" />
              <span className="text-textMuted">{user.email}</span>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-textDark mb-2">Phone Number</label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-50 border border-border">
                <Phone className="h-5 w-5 text-textMuted" />
                <span className="text-textMuted">+91</span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                className="flex-1 px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-primary transition-all"
                placeholder="Enter phone number"
                maxLength={10}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-full border border-border text-textDark font-semibold hover:bg-gray-50 transition-all"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {loading ? (
              <span>Saving...</span>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>

        {/* Success Popup */}
        {showSuccess && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-3xl flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-textDark mb-2">Saved!</h3>
              <p className="text-textMuted">Your account details have been updated</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

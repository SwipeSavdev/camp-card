'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  scope: 'GLOBAL' | 'PER_COUNCIL';
  council_id?: string;
  category: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  created_by: { id: string; email: string; name: string };
  updated_by: { id: string; email: string; name: string };
}

interface AuditLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  changed_by: { id: string; email: string; name: string };
  changed_at: string;
  ip_address: string;
}

export default function FeatureFlagsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [scopeFilter, setScopeFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: '',
    enabled: false,
    scope: 'GLOBAL' as 'GLOBAL' | 'PER_COUNCIL',
    council_id: '',
    category: 'offers',
    tags: [] as string[],
  });

  // Authorization check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      const userRole = (session?.user as Record<string, unknown>)?.role as string | undefined;
      if (!userRole || !['SYSTEM_ADMIN', 'COUNCIL_ADMIN'].includes(userRole)) {
        router.push('/dashboard');
      }
    }
  }, [status, session, router]);

  // Fetch flags
  useEffect(() => {
    if (status === 'authenticated') {
      fetchFlags();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, scopeFilter, categoryFilter]);

  const fetchFlags = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (scopeFilter !== 'ALL') params.append('scope', scopeFilter);
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);

      const response = await api.getFeatureFlags?.(
        `?${params.toString()}`,
        session,
      ) || { data: [] };

      setFlags(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feature flags');
      console.error('Error fetching flags:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLog = async (flagId: string) => {
    try {
      const logs = await api.getFeatureFlagAuditLog?.(flagId, session) || [];
      setAuditLogs(logs);
      setShowAuditLog(true);
    } catch (err) {
      setError('Failed to load audit log');
      console.error('Error fetching audit log:', err);
    }
  };

  const handleToggleFlag = async (flag: FeatureFlag) => {
    if (!window.confirm(`Are you sure you want to ${flag.enabled ? 'disable' : 'enable'} ${flag.name}?`)) {
      return;
    }

    try {
      const updated = await api.updateFeatureFlag?.(flag.id, { enabled: !flag.enabled }, session);
      setFlags(flags.map((f) => (f.id === flag.id ? updated : f)));

      if (selectedFlag?.id === flag.id) {
        setSelectedFlag(updated);
      }

      // Show success toast (assuming toast component available)
    } catch (err) {
      setError('Failed to update flag');
      console.error('Error updating flag:', err);
    }
  };

  const handleDeleteFlag = async (flagId: string) => {
    // Only SYSTEM_ADMIN can delete
    const userRole = (session?.user as Record<string, unknown>)?.role as string | undefined;
    if (userRole !== 'SYSTEM_ADMIN') {
      setError('Only system admins can delete feature flags');
      return;
    }

    if (!window.confirm('Are you sure? This action cannot be undone.')) {
      return;
    }

    try {
      await api.deleteFeatureFlag?.(flagId, session);
      setFlags(flags.filter((f) => f.id !== flagId));
      setShowDetailModal(false);
      setSelectedFlag(null);
    } catch (err) {
      setError('Failed to delete flag');
      console.error('Error deleting flag:', err);
    }
  };

  const handleCreateFlag = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newFlag = await api.createFeatureFlag?.(formData, session);
      setFlags([...flags, newFlag]);
      setShowCreateModal(false);
      setFormData({
        key: '',
        name: '',
        description: '',
        enabled: false,
        scope: 'GLOBAL',
        council_id: '',
        category: 'offers',
        tags: [],
      });
    } catch (err) {
      setError('Failed to create flag');
      console.error('Error creating flag:', err);
    }
  };

  const filteredFlags = flags.filter((flag) => {
    const matchesSearch = flag.key.toLowerCase().includes(searchQuery.toLowerCase())
 || flag.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const userRole = (session?.user as Record<string, unknown>)?.role as string | undefined;
  const isSystemAdmin = userRole === 'SYSTEM_ADMIN';

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Feature Flags</h1>
          <p className="text-gray-600 mt-1">Manage mobile app features and toggles</p>
        </div>
        {isSystemAdmin && (
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          + New Flag
        </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Scope Filter */}
          <div>
            <label htmlFor="scope" className="block text-sm font-medium text-gray-700 mb-2">Scope</label>
            <select
id="scope"
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Scopes</option>
              <option value="GLOBAL">Global</option>
              <option value="PER_COUNCIL">Per Council</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
id="category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Categories</option>
              <option value="offers">Offers</option>
              <option value="referrals">Referrals</option>
              <option value="notifications">Notifications</option>
              <option value="geo">Geo</option>
              <option value="analytics">Analytics</option>
              <option value="campaigns">Campaigns</option>
              <option value="ui">UI</option>
            </select>
          </div>

          {/* Search */}
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
id="search"
              type="text"
              placeholder="Search by key or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        {error}
        <button
          type="button"
          onClick={() => setError(null)}
          className="ml-2 font-semibold hover:underline"
        >
          Dismiss
        </button>
      </div>
      )}

      {/* Feature Flags Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* eslint-disable-next-line no-nested-ternary */}
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading feature flags...</div>
        ) : filteredFlags.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No feature flags found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Key</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Scope</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Updated</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFlags.map((flag) => (
                  <tr key={flag.id} className="hover:bg-gray-50">
                   <td className="px-6 py-4 text-sm font-mono text-gray-900">{flag.key}</td>
                   <td className="px-6 py-4 text-sm text-gray-900">{flag.name}</td>
                   <td className="px-6 py-4 text-sm">
                   <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                   flag.scope === 'GLOBAL'
                     ? 'bg-blue-100 text-blue-800'
                     : 'bg-purple-100 text-purple-800'
                 }`}
                 >
                   {flag.scope === 'GLOBAL' ? 'Global' : 'Per Council'}
                 </span>
                 </td>
                   <td className="px-6 py-4 text-sm text-gray-600">{flag.category}</td>
                   <td className="px-6 py-4 text-sm">
                   <button
                   type="button"
                   onClick={() => handleToggleFlag(flag)}
                   className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                   flag.enabled
                     ? 'bg-green-100 text-green-800 hover:bg-green-200'
                     : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                 }`}
                 >
                   {flag.enabled ? ' Enabled' : ' Disabled'}
                 </button>
                 </td>
                   <td className="px-6 py-4 text-sm text-gray-500">
                   {new Date(flag.updated_at).toLocaleDateString()}
                 </td>
                   <td className="px-6 py-4 text-sm text-right space-x-2">
                   <button
                   type="button"
                   onClick={() => {
                   setSelectedFlag(flag);
                   setShowDetailModal(true);
                 }}
                   className="text-blue-600 hover:text-blue-800 font-medium"
                 >
                 View
                 </button>
                   <button
                   type="button"
                   onClick={() => fetchAuditLog(flag.id)}
                   className="text-gray-600 hover:text-gray-800 font-medium"
                 >
                 Audit
                 </button>
                 </td>
                 </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedFlag && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">{selectedFlag.name}</h2>
            <button
              type="button"
              aria-label="Close details"
              onClick={() => setShowDetailModal(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            />
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-1">Key</label>
                <p className="text-sm font-mono text-gray-600 bg-gray-50 p-3 rounded">{selectedFlag.key}</p>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-sm text-gray-600">{selectedFlag.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="scope-2" className="block text-sm font-medium text-gray-700 mb-1">Scope</label>
                  <p className="text-sm text-gray-600">{selectedFlag.scope}</p>
                </div>
                <div>
                  <label htmlFor="category-2" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <p className="text-sm text-gray-600">{selectedFlag.category}</p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Status</h3>
                  <p className="text-sm text-gray-600 mt-1">
                   {selectedFlag.enabled ? 'This feature is currently enabled' : 'This feature is currently disabled'}
                 </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleFlag(selectedFlag)}
                  className={`px-4 py-2 rounded-lg font-medium text-white ${
                   selectedFlag.enabled
                     ? 'bg-red-600 hover:bg-red-700'
                     : 'bg-green-600 hover:bg-green-700'
                 }`}
                >
                  {selectedFlag.enabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>

            {/* Metadata */}
            <div className="border-t border-gray-200 pt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <label htmlFor="created-by" className="text-gray-600">Created by</label>
                <p className="font-medium text-gray-900">{selectedFlag.created_by.name}</p>
                <p className="text-gray-500 text-xs">{new Date(selectedFlag.created_at).toLocaleString()}</p>
              </div>
              <div>
                <label htmlFor="updated-by" className="text-gray-600">Updated by</label>
                <p className="font-medium text-gray-900">{selectedFlag.updated_by.name}</p>
                <p className="text-gray-500 text-xs">{new Date(selectedFlag.updated_at).toLocaleString()}</p>
              </div>
            </div>

            {/* Tags */}
            {selectedFlag.tags && selectedFlag.tags.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {selectedFlag.tags.map((tag) => (
                 <span key={tag} className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs">
                 {tag}
               </span>
               ))}
              </div>
            </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center">
            {isSystemAdmin && (
            <button
              type="button"
              onClick={() => {
                handleDeleteFlag(selectedFlag.id);
              }}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Delete Flag
            </button>
            )}
            <button
              type="button"
              onClick={() => setShowDetailModal(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Audit Log Modal */}
      {showAuditLog && selectedFlag && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-3xl w-full max-h-screen overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">
              Audit Log:
              {selectedFlag.name}
            </h2>
            <button
              type="button"
              aria-label="Close audit log"
              onClick={() => setShowAuditLog(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            />
          </div>

          {/* Modal Body */}
          <div className="p-6">
            {auditLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No audit logs found</p>
            ) : (
              <div className="space-y-4">
                {auditLogs.map((log) => (
                 <div key={log.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                 <div className="flex items-center justify-between">
                 <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                   ({ CREATE: 'bg-green-100 text-green-800', UPDATE: 'bg-blue-100 text-blue-800' } as Record<string, string>)[log.action] || 'bg-red-100 text-red-800'
                 }`}
                 >
                   {log.action}
                 </span>
                 <span className="text-sm text-gray-500">
                   {new Date(log.changed_at).toLocaleString()}
                 </span>
               </div>
                 <div className="text-sm">
                 <p>
                   <strong>Changed by:</strong>
                   {' '}
                   {log.changed_by.name}
                   {' '}
                   (
             {log.changed_by.email}
                   )
           </p>
                 {log.ip_address && (
                 <p>
                 <strong>IP:</strong>
                 {' '}
                 {log.ip_address}
               </p>
                 )}
               </div>
                 {log.old_value && log.new_value && (
               <div className="bg-gray-50 p-3 rounded text-xs space-y-2">
                 <p className="font-medium text-gray-700">Changes:</p>
                 {Object.keys(log.new_value).map((key) => (
                 (log.old_value?.[key] !== log.new_value?.[key]) && (
               <p key={key} className="text-gray-600">
               <strong>
                 {key}
                 :
       </strong>
               {' '}
               {String(log.old_value?.[key])}
               {' '}
               {String(log.new_value?.[key])}
             </p>
                 )
               ))}
               </div>
               )}
               </div>
               ))}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
            <button
              type="button"
              onClick={() => setShowAuditLog(false)}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Create Flag Modal */}
      {showCreateModal && isSystemAdmin && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-xl w-full max-h-screen overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Create Feature Flag</h2>
            <button
              type="button"
              aria-label="Close create modal"
              onClick={() => setShowCreateModal(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            />
          </div>

          {/* Modal Body */}
          <form onSubmit={handleCreateFlag} className="p-6 space-y-4">
            <div>
              <label htmlFor="key-2" className="block text-sm font-medium text-gray-700 mb-1">Key *</label>
              <input
id="key-2"
                type="text"
                required
                placeholder="e.g., new_feature_xyz"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Alphanumeric and underscores only, 5-50 chars</p>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
id="name"
                type="text"
                required
                placeholder="e.g., New Feature XYZ"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="description-2" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
id="description-2"
                placeholder="What does this feature do?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="scope-3" className="block text-sm font-medium text-gray-700 mb-1">Scope *</label>
                <select
id="scope-3"
                  required
                  value={formData.scope}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value as 'GLOBAL' | 'PER_COUNCIL' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="GLOBAL">Global</option>
                  <option value="PER_COUNCIL">Per Council</option>
                </select>
              </div>

              <div>
                <label htmlFor="category-3" className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
id="category-3"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="offers">Offers</option>
                  <option value="referrals">Referrals</option>
                  <option value="notifications">Notifications</option>
                  <option value="geo">Geo</option>
                  <option value="analytics">Analytics</option>
                  <option value="campaigns">Campaigns</option>
                  <option value="ui">UI</option>
                </select>
              </div>
            </div>

            <div className="flex items-center pt-4 border-t border-gray-200">
              <input
                type="checkbox"
                id="enabled"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="enabled" className="ml-3 text-sm text-gray-700">
                Enable this flag immediately (optional)
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                Create Flag
              </button>
            </div>
          </form>
        </div>
      </div>
      )}
    </div>
  );
}

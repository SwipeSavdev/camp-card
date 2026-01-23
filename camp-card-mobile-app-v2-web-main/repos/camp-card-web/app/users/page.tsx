'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useIsMobile } from '@/lib/hooks';
import { ApiErrorDisplay, LoadingState, EmptyState } from '../components/ApiErrorDisplay';

const themeColors = {
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray500: '#6b7280',
  gray600: '#4b5563',
  text: '#1f2937',
  primary50: '#eff6ff',
  primary100: '#dbeafe',
  primary300: '#93c5fd',
  primary600: '#2563eb',
  primary800: '#1e40af',
  primary900: '#1e3a8a',
  success50: '#f0fdf4',
  success200: '#bbf7d0',
  success600: '#16a34a',
  warning50: '#fefce8',
  warning600: '#eab308',
  info50: '#f0f9ff',
  info600: '#0284c7',
  error400: '#f87171',
  error500: '#ef4444',
};

const themeSpace = {
  xs: '3px', sm: '8px', md: '16px', lg: '24px', xl: '32px', '2xl': '40px', '3xl': '48px',
};
const themeRadius = { sm: '4px', card: '12px' };
const themeShadow = { xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' };

function Icon({
  name, size = 18, color = 'currentColor', ...props
}: { name: string; size?: number; color?: string; [key: string]: any }) {
  const icons: { [key: string]: JSX.Element } = {
    add: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
         </svg>,
    download: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>,
    upload: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>,
    file: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
       </svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>,
    delete: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
            </svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
            </svg>,
    back: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>,
    chevronLeft: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>,
    chevronRight: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>,
    dashboard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
               </svg>,
    users: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
           </svg>,
    organization: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M18 21H3v-2a6 6 0 0 1 6-6h3a6 6 0 0 1 6 6v2" />
      <circle cx="9" cy="7" r="4" />
                  </svg>,
    merchants: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>,
    offers: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M6 9h12M6 9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9z" /></svg>,
    cards: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
           </svg>,
    analytics: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <line x1="12" y1="2" x2="12" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
               </svg>,
    brain: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08A2.5 2.5 0 0 0 12 19.5a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 12 4.5" /></svg>,
    creditCard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
                </svg>,
    settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m3.08 3.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m3.08-3.08l4.24-4.24M19.78 19.78l-4.24-4.24m-3.08-3.08l-4.24-4.24" />
              </svg>,
    notifications: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                   </svg>,
    health: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
      <path d="M16.5 9l-5.5 5.5L7.5 12" />
            </svg>,
    config: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="3" /></svg>,
    logout: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>,
    menu: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>,
  };
  return <span {...props}>{icons[name] || null}</span>;
}

const navItems = [
  { name: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { name: 'users', label: 'Users', href: '/users' },
  { name: 'organization', label: 'Councils', href: '/councils' },
  { name: 'merchants', label: 'Merchants', href: '/merchants' },
  { name: 'offers', label: 'Offers', href: '/offers' },
  { name: 'cards', label: 'Cards', href: '/camp-cards' },
  { name: 'analytics', label: 'Analytics', href: '/analytics' },
  { name: 'brain', label: 'AI Marketing', href: '/ai-marketing' },
  { name: 'creditCard', label: 'Subscriptions', href: '/subscriptions' },
  { name: 'settings', label: 'Settings', href: '/settings' },
];

const bottomNavItems = [
  { name: 'notifications', label: 'Notifications', href: '/notifications' },
  { name: 'health', label: 'Health', href: '/health' },
  { name: 'config', label: 'Config', href: '/config' },
];

type UserRole = 'GLOBAL_SYSTEM_ADMIN' | 'ADMIN' | 'SUPPORT_REPRESENTATIVE' | 'SYSTEM_ANALYST' | 'SYSTEM_QA' | 'SECURITY_ANALYST' | 'NATIONAL_ADMIN' | 'COUNCIL_ADMIN' | 'UNIT_LEADER' | 'PARENT' | 'SCOUT';
type UnitType = 'PACK' | 'BSA_TROOP_BOYS' | 'BSA_TROOP_GIRLS' | 'SHIP' | 'CREW' | 'FAMILY_SCOUTING' | null;

// System-level roles that can only be assigned by Global System Admin
const SYSTEM_ROLES: UserRole[] = ['GLOBAL_SYSTEM_ADMIN', 'ADMIN', 'SUPPORT_REPRESENTATIVE', 'SYSTEM_ANALYST', 'SYSTEM_QA', 'SECURITY_ANALYST'];

interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  role: UserRole;
  unitType?: UnitType;
  unitNumber?: string;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserStatus, setNewUserStatus] = useState<'active' | 'inactive'>('active');
  const [newUserRole, setNewUserRole] = useState<UserRole>('SCOUT');
  const [newUserUnitType, setNewUserUnitType] = useState<UnitType>(null);
  const [newUserUnitNumber, setNewUserUnitNumber] = useState('');
  const [newUserCouncilId, setNewUserCouncilId] = useState<string>('');
  // COPPA compliance fields for Scouts
  const [newUserDateOfBirth, setNewUserDateOfBirth] = useState('');
  const [newUserParentName, setNewUserParentName] = useState('');
  const [newUserParentEmail, setNewUserParentEmail] = useState('');
  const [newUserParentPhone, setNewUserParentPhone] = useState('');
  const [councilSearchTerm, setCouncilSearchTerm] = useState('');
  const [councils, setCouncils] = useState<Array<{ id: string; uuid: string; name: string }>>([]);
  const [councilsLoading, setCouncilsLoading] = useState(false);
  const [showCouncilDropdown, setShowCouncilDropdown] = useState(false);
  const [_troopLeaderSearchTerm, _setTroopLeaderSearchTerm] = useState('');
  const [_showAddTroopLeaderForm, setShowAddTroopLeaderForm] = useState(false);
  const [newTroopLeaderName, setNewTroopLeaderName] = useState('');
  const [newTroopLeaderEmail, setNewTroopLeaderEmail] = useState('');

  // Edit user state
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserStatus, setEditUserStatus] = useState<'active' | 'inactive'>('active');
  const [editUserRole, setEditUserRole] = useState<UserRole>('SCOUT');
  const [editUserUnitType, setEditUserUnitType] = useState<UnitType>(null);
  const [editUserUnitNumber, setEditUserUnitNumber] = useState('');

  // Filter state
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sidebar state - collapse on mobile by default
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Collapse sidebar on mobile
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  // Import/Export state
  const [showImportModal, setShowImportModal] = useState(false);
  const [_importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState<number>(0);

  // All role options - system roles require Global System Admin to assign
  const allRoleOptions = [
    // System-level roles (only assignable by GLOBAL_SYSTEM_ADMIN)
    { value: 'GLOBAL_SYSTEM_ADMIN', label: 'Global System Admin', isSystemRole: true },
    { value: 'ADMIN', label: 'Admin (Full Access)', isSystemRole: true },
    { value: 'SUPPORT_REPRESENTATIVE', label: 'Support Representative', isSystemRole: true },
    { value: 'SYSTEM_ANALYST', label: 'System Analyst', isSystemRole: true },
    { value: 'SYSTEM_QA', label: 'System QA', isSystemRole: true },
    { value: 'SECURITY_ANALYST', label: 'Security Analyst', isSystemRole: true },
    // Organization-level roles
    { value: 'NATIONAL_ADMIN', label: 'National Admin', isSystemRole: false },
    { value: 'COUNCIL_ADMIN', label: 'Council Admin', isSystemRole: false },
    { value: 'UNIT_LEADER', label: 'Unit Leader', isSystemRole: false },
    { value: 'PARENT', label: 'Parent', isSystemRole: false },
    { value: 'SCOUT', label: 'Scout', isSystemRole: false },
  ];

  // Get current user's role from session
  const currentUserRole = (session?.user as any)?.role as UserRole | undefined;
  const isGlobalSystemAdmin = currentUserRole === 'GLOBAL_SYSTEM_ADMIN';

  // Filter role options based on current user's permissions
  // Only Global System Admin can see/assign system-level roles
  const roleOptions = allRoleOptions.filter((role) => !role.isSystemRole || isGlobalSystemAdmin);

  const unitTypeOptions = [
    { value: '', label: 'Select Unit Type' },
    { value: 'PACK', label: 'Pack' },
    { value: 'BSA_TROOP_BOYS', label: 'BSA Troop for Boys' },
    { value: 'BSA_TROOP_GIRLS', label: 'BSA Troop for Girls' },
    { value: 'SHIP', label: 'Ship' },
    { value: 'CREW', label: 'Crew' },
    { value: 'FAMILY_SCOUTING', label: 'Family Scouting' },
  ];

  useEffect(() => {
    // Wait for session to be authenticated before loading data
    if (status === 'authenticated' && session) {
      fetchData();
    }
  }, [status, session]);

  // Fetch councils when the form opens
  useEffect(() => {
    if (showAddForm && status === 'authenticated' && session) {
      fetchCouncils();
    }
  }, [showAddForm, status, session]);

  // Fetch councils with optional search term (debounced)
  useEffect(() => {
    if (!showAddForm) return;

    const debounceTimer = setTimeout(() => {
      if (councilSearchTerm.length >= 2 || councilSearchTerm.length === 0) {
        fetchCouncils(councilSearchTerm);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [councilSearchTerm, showAddForm]);

  const fetchCouncils = async (search?: string) => {
    try {
      setCouncilsLoading(true);
      const data = await api.getCouncils(session, search);
      const councilList = data.content || [];
      setCouncils(councilList.map((c: any) => ({
        id: c.id,
        uuid: c.uuid,
        name: c.name,
      })));
    } catch (err) {
      console.error('Failed to fetch councils:', err);
      setCouncils([]);
    } finally {
      setCouncilsLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getUsers(session);
      const rawUsers = data.content || data || [];
      // Map API response to frontend User interface
      const mappedUsers = rawUsers.map((u: any) => ({
        id: u.id,
        name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
        email: u.email,
        status: u.status || (u.isActive === false ? 'inactive' : 'active'),
        role: u.role || 'SCOUT',
      }));
      setItems(mappedUsers);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    try {
      console.log('[PAGE] Deleting user:', id);
      await api.deleteUser(id, session);
      console.log('[PAGE] User deleted successfully');
      setItems(items.filter((i) => i.id !== id));
      setError(null);
    } catch (err: any) {
      console.error('[PAGE] Delete error:', err);
      const errorMsg = err?.status === 403
        ? 'Permission denied. Only National Admins can delete users.'
        : err?.status === 404
        ? 'User not found.'
        : `Failed to delete user: ${err?.message || 'Unknown error'}`;
      setError(errorMsg);
    }
  };

  const handleEdit = (user: User) => {
    console.log('[PAGE] Editing user:', user);
    setEditingUser(user);
    setEditUserName(user.name || '');
    setEditUserEmail(user.email || '');
    setEditUserStatus(user.status || 'active');
    setEditUserRole(user.role || 'SCOUT');
    setEditUserUnitType(user.unitType || null);
    setEditUserUnitNumber(user.unitNumber || '');
    setShowEditForm(true);
  };

  const saveEditUser = async () => {
    if (!editingUser) return;
    if (!editUserName.trim() || !editUserEmail.trim()) {
      setError('Name and email are required');
      return;
    }

    try {
      const nameParts = editUserName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      const updateData: any = {
        firstName,
        lastName,
        isActive: editUserStatus === 'active',
        role: editUserRole,
      };

      // Include unit type and number only for Scouts
      if (editUserRole === 'SCOUT') {
        updateData.unitType = editUserUnitType;
        updateData.unitNumber = editUserUnitNumber;
      }

      console.log('[PAGE] Updating user:', editingUser.id, updateData);
      const updatedUser = await api.updateUser(editingUser.id, updateData, session);
      console.log('[PAGE] User updated successfully:', updatedUser);

      // Update local state
      setItems(items.map((item) => (item.id === editingUser.id
        ? {
          ...item,
          name: editUserName,
          email: editUserEmail,
          status: editUserStatus,
          role: editUserRole,
          unitType: editUserRole === 'SCOUT' ? editUserUnitType : undefined,
          unitNumber: editUserRole === 'SCOUT' ? editUserUnitNumber : undefined,
        }
        : item)));

      // Reset form
      setShowEditForm(false);
      setEditingUser(null);
      setEditUserName('');
      setEditUserEmail('');
      setEditUserStatus('active');
      setEditUserRole('SCOUT');
      setEditUserUnitType(null);
      setEditUserUnitNumber('');
      setError(null);
    } catch (err) {
      setError(`Failed to update user: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('[PAGE] Error updating user:', err);
    }
  };

  const addUser = async () => {
    if (!newUserName.trim() || !newUserEmail.trim()) {
      setError('Name and email are required');
      return;
    }

    // COPPA compliance validation for Scouts
    if (newUserRole === 'SCOUT') {
      if (!newUserDateOfBirth) {
        setError('Date of birth is required for Scout accounts (COPPA compliance)');
        return;
      }
      if (!newUserParentName.trim()) {
        setError('Parent/guardian name is required for Scout accounts');
        return;
      }
      if (!newUserParentEmail.trim()) {
        setError('Parent/guardian email is required for Scout accounts');
        return;
      }
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newUserParentEmail)) {
        setError('Please enter a valid parent/guardian email address');
        return;
      }
    }

    try {
      // Split name into firstName and lastName
      const nameParts = newUserName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      // Generate a temporary password for the new user
      const tempPassword = `TempPass${Math.random().toString(36).slice(-8)}!`;

      const userData: any = {
        firstName,
        lastName,
        email: newUserEmail,
        password: tempPassword,
        isActive: newUserStatus === 'active',
        role: newUserRole,
      };

      // Include council ID if selected
      if (newUserCouncilId) {
        userData.councilId = newUserCouncilId;
      }

      // Include unit type, number, and COPPA fields for Scouts
      if (newUserRole === 'SCOUT') {
        userData.unitType = newUserUnitType;
        userData.unitNumber = newUserUnitNumber;
        // COPPA compliance fields
        userData.dateOfBirth = newUserDateOfBirth;
        userData.parentName = newUserParentName.trim();
        userData.parentEmail = newUserParentEmail.trim();
        if (newUserParentPhone.trim()) {
          userData.parentPhone = newUserParentPhone.trim();
        }
      }

      console.log('[PAGE] Submitting user data:', userData);
      const newUser = await api.createUser(userData, session);
      console.log('[PAGE] User created successfully:', newUser);

      // Add to local state immediately
      if (newUser) {
        const user: User = {
          id: newUser.id || String(Math.floor(Math.random() * 10000)),
          name: `${newUser.firstName || firstName} ${newUser.lastName || lastName}`.trim(),
          email: newUser.email || newUserEmail,
          role: newUser.role || newUserRole,
          status: (newUser.isActive ? 'active' : 'inactive') as 'active' | 'inactive',
          unitType: newUserRole === 'SCOUT' ? newUserUnitType : undefined,
          unitNumber: newUserRole === 'SCOUT' ? newUserUnitNumber : undefined,
        };
        setItems([...items, user]);
      }

      // Don't refresh data - keep the optimistically added user

      // Reset form
      setNewUserName('');
      setNewUserEmail('');
      setNewUserStatus('active');
      setNewUserRole('SCOUT');
      setNewUserUnitType(null);
      setNewUserUnitNumber('');
      setNewUserDateOfBirth('');
      setNewUserParentName('');
      setNewUserParentEmail('');
      setNewUserParentPhone('');
      setNewUserCouncilId('');
      setCouncilSearchTerm('');
      setShowCouncilDropdown(false);
      setShowAddForm(false);
      setError(null);
    } catch (err) {
      setError(`Failed to create user: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('[PAGE] Error:', err);
    }
  };

  const filteredItems = (Array.isArray(items) ? items : []).filter((item) => {
    const matchesSearch = searchTerm === ''
 || item.name?.toLowerCase().includes(searchTerm.toLowerCase())
 || item.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === '' || item.role === roleFilter;
    const matchesStatus = statusFilter === '' || item.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter, itemsPerPage]);

  const troopLeaders = (Array.isArray(items) ? items : []).filter((item) => item.role === 'UNIT_LEADER');

  const _filteredTroopLeaders = troopLeaders.filter((leader) => leader.name?.toLowerCase().includes(_troopLeaderSearchTerm.toLowerCase())
 || leader.email?.toLowerCase().includes(_troopLeaderSearchTerm.toLowerCase()));

  const _addNewTroopLeader = async () => {
    if (!newTroopLeaderName.trim() || !newTroopLeaderEmail.trim()) {
      setError('Name and email are required for troop leader');
      return;
    }

    try {
      const nameParts = newTroopLeaderName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      // Generate a temporary password for the new troop leader
      const tempPassword = `TempPass${Math.random().toString(36).slice(-8)}!`;

      const userData = {
        firstName,
        lastName,
        email: newTroopLeaderEmail,
        password: tempPassword,
        isActive: true,
        role: 'UNIT_LEADER',
      };

      console.log('[PAGE] Creating new troop leader:', userData);
      const newTroopLeader = await api.createUser(userData, session);
      console.log('[PAGE] Troop leader created successfully:', newTroopLeader);

      // Add to local state immediately
      if (newTroopLeader) {
        const leader = {
          id: newTroopLeader.id || String(Math.floor(Math.random() * 10000)),
          name: `${newTroopLeader.firstName || firstName} ${newTroopLeader.lastName || lastName}`.trim(),
          email: newTroopLeader.email || newTroopLeaderEmail,
          role: 'UNIT_LEADER' as UserRole,
          status: 'active' as 'active' | 'inactive',
        };
        setItems([...items, leader]);
      }

      // Don't refresh data - keep the optimistically added troop leader

      // Reset form
      setNewTroopLeaderName('');
      setNewTroopLeaderEmail('');
      setShowAddTroopLeaderForm(false);
      setError(null);
    } catch (err) {
      setError(`Failed to create troop leader: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('[PAGE] Error:', err);
    }
  };

  // Export users to CSV
  const exportUsers = () => {
    const headers = ['Name', 'Email', 'Role', 'Status', 'CouncilName', 'UnitNumber', 'UnitType'];
    const csvContent = [
      headers.join(','),
      ...items.map((user: any) => [
        `"${user.name.replace(/"/g, '""')}"`,
        `"${user.email.replace(/"/g, '""')}"`,
        user.role,
        user.status,
        `"${(user.councilName || '').replace(/"/g, '""')}"`,
        user.unitNumber || '',
        user.unitType || '',
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download CSV template
  const downloadTemplate = () => {
    const csvContent = `Name,Email,Role,Status,CouncilName,UnitNumber,UnitType,DateOfBirth,ParentName,ParentEmail
# Example rows (delete these and add your own data):
John Smith,john.smith@example.com,UNIT_LEADER,active,Greater New York Councils,123,BSA_TROOP_BOYS,,,
Jane Doe,jane.doe@example.com,PARENT,active,Greater New York Councils,,,,,
Bob Johnson,bob.johnson@example.com,SCOUT,active,Greater New York Councils,123,BSA_TROOP_BOYS,2012-05-15,Mary Johnson,mary.johnson@example.com
Sarah Williams,sarah.williams@example.com,COUNCIL_ADMIN,active,Greater New York Councils,,,,,
Mike Davis,mike.davis@example.com,SCOUT,active,Greater New York Councils,456,PACK,2014-08-22,Tom Davis,tom.davis@example.com
#
# COLUMN DESCRIPTIONS:
# - Name: Full name (e.g., John Smith)
# - Email: Valid email address (must be unique)
# - Role: NATIONAL_ADMIN, COUNCIL_ADMIN, UNIT_LEADER, PARENT, or SCOUT
# - Status: active or inactive
# - CouncilName: Required for COUNCIL_ADMIN only (must match existing council exactly)
# - UnitNumber: Required for UNIT_LEADER and SCOUT (e.g., 123, 456)
# - UnitType: Required for SCOUT. Options: PACK, BSA_TROOP_BOYS, BSA_TROOP_GIRLS, SHIP, CREW, FAMILY_SCOUTING
#
# COPPA COMPLIANCE FIELDS (Required for SCOUT role - children under 13):
# - DateOfBirth: Scout's birth date in YYYY-MM-DD format (e.g., 2012-05-15)
# - ParentName: Full name of parent/guardian who will provide consent
# - ParentEmail: Parent/guardian email for consent verification
#
# NOTE: For SCOUT users, the system will send a parental consent request email.
# The Scout account will be pending until parent provides consent.
#
# Lines starting with # are comments and will be ignored`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'user_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle file selection for import
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportErrors([]);
    setImportSuccess(0);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n')
        .filter((line) => line.trim() && !line.trim().startsWith('#')); // Skip empty lines and comments

      if (lines.length < 2) {
        setImportErrors(['File must contain a header row and at least one data row']);
        setImportPreview([]);
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const requiredHeaders = ['name', 'email', 'role', 'status'];
      const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

      if (missingHeaders.length > 0) {
        setImportErrors([`Missing required columns: ${missingHeaders.join(', ')}`]);
        setImportPreview([]);
        return;
      }

      const nameIdx = headers.indexOf('name');
      const emailIdx = headers.indexOf('email');
      const roleIdx = headers.indexOf('role');
      const statusIdx = headers.indexOf('status');
      const councilNameIdx = headers.indexOf('councilname');
      const unitNumberIdx = headers.indexOf('unitnumber');
      const unitTypeIdx = headers.indexOf('unittype');
      // COPPA compliance fields for Scouts
      const dateOfBirthIdx = headers.indexOf('dateofbirth');
      const parentNameIdx = headers.indexOf('parentname');
      const parentEmailIdx = headers.indexOf('parentemail');

      const validRoles = ['NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'UNIT_LEADER', 'PARENT', 'SCOUT'];
      const validStatuses = ['active', 'inactive'];
      const validUnitTypes = ['PACK', 'BSA_TROOP_BOYS', 'BSA_TROOP_GIRLS', 'SHIP', 'CREW', 'FAMILY_SCOUTING'];
      const preview: any[] = [];
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parse CSV line (handle quoted values)
        const values: string[] = [];
        let current = '';
        let inQuotes = false;
        for (const char of line) {
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim());

        const name = values[nameIdx]?.replace(/^"|"$/g, '');
        const email = values[emailIdx]?.replace(/^"|"$/g, '');
        const role = values[roleIdx]?.toUpperCase();
        const status = values[statusIdx]?.toLowerCase();
        const councilName = councilNameIdx >= 0 ? values[councilNameIdx]?.replace(/^"|"$/g, '') : '';
        const unitNumber = unitNumberIdx >= 0 ? values[unitNumberIdx]?.replace(/^"|"$/g, '') : '';
        const unitType = unitTypeIdx >= 0 ? values[unitTypeIdx]?.toUpperCase().replace(/^"|"$/g, '') : '';
        // COPPA compliance fields
        const dateOfBirth = dateOfBirthIdx >= 0 ? values[dateOfBirthIdx]?.replace(/^"|"$/g, '') : '';
        const parentName = parentNameIdx >= 0 ? values[parentNameIdx]?.replace(/^"|"$/g, '') : '';
        const parentEmail = parentEmailIdx >= 0 ? values[parentEmailIdx]?.replace(/^"|"$/g, '') : '';

        const rowErrors: string[] = [];
        if (!name) rowErrors.push('Name is required');
        if (!email) rowErrors.push('Email is required');
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) rowErrors.push('Invalid email format');
        if (!validRoles.includes(role)) rowErrors.push(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
        if (!validStatuses.includes(status)) rowErrors.push('Invalid status. Must be: active or inactive');

        // Validate council-related fields based on role - only required for COUNCIL_ADMIN
        if (role === 'COUNCIL_ADMIN' && !councilName) {
          rowErrors.push('CouncilName is required for COUNCIL_ADMIN role');
        }
        if (['UNIT_LEADER', 'SCOUT'].includes(role) && !unitNumber) {
          rowErrors.push('UnitNumber is required for UNIT_LEADER and SCOUT roles');
        }
        // Validate UnitType for SCOUT (required) and UNIT_LEADER (optional but validated if provided)
        if (role === 'SCOUT' && !unitType) {
          rowErrors.push('UnitType is required for SCOUT role');
        }
        if (['UNIT_LEADER', 'SCOUT'].includes(role) && unitType && !validUnitTypes.includes(unitType)) {
          rowErrors.push(`Invalid UnitType. Must be one of: ${validUnitTypes.join(', ')}`);
        }

        // COPPA compliance validation for SCOUT role
        if (role === 'SCOUT') {
          if (!dateOfBirth) {
            rowErrors.push('DateOfBirth is required for SCOUT role (COPPA compliance)');
          } else {
            // Validate date format (YYYY-MM-DD)
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(dateOfBirth)) {
              rowErrors.push('DateOfBirth must be in YYYY-MM-DD format');
            } else {
              const parsedDate = new Date(dateOfBirth);
              if (isNaN(parsedDate.getTime())) {
                rowErrors.push('DateOfBirth is not a valid date');
              }
            }
          }
          if (!parentName) {
            rowErrors.push('ParentName is required for SCOUT role (COPPA compliance)');
          }
          if (!parentEmail) {
            rowErrors.push('ParentEmail is required for SCOUT role (COPPA compliance)');
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) {
            rowErrors.push('Invalid ParentEmail format');
          }
        }

        if (rowErrors.length > 0) {
          errors.push(`Row ${i + 1}: ${rowErrors.join('; ')}`);
        }

        preview.push({
          row: i + 1,
          name,
          email,
          role,
          status,
          councilName,
          unitNumber,
          unitType,
          dateOfBirth,
          parentName,
          parentEmail,
          valid: rowErrors.length === 0,
          errors: rowErrors,
        });
      }

      setImportPreview(preview);
      setImportErrors(errors);
    };
    reader.readAsText(file);
  };

  // Process import
  const processImport = async () => {
    const validRows = importPreview.filter((row) => row.valid);
    if (validRows.length === 0) {
      setImportErrors(['No valid rows to import']);
      return;
    }

    setImporting(true);
    setImportErrors([]);
    setImportSuccess(0);

    const errors: string[] = [];
    let successCount = 0;
    const newUsers: User[] = [];

    for (const row of validRows) {
      try {
        const nameParts = row.name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';
        const tempPassword = `TempPass${Math.random().toString(36).slice(-8)}!`;

        const userData: any = {
          firstName,
          lastName,
          email: row.email,
          password: tempPassword,
          isActive: row.status === 'active',
          role: row.role,
        };

        // Add council/unit fields if provided
        if (row.councilName) {
          userData.councilName = row.councilName;
        }
        if (row.unitNumber) {
          userData.unitNumber = row.unitNumber;
        }
        if (row.unitType) {
          userData.unitType = row.unitType;
        }

        // Add COPPA compliance fields for SCOUT role
        if (row.role === 'SCOUT') {
          if (row.dateOfBirth) {
            userData.dateOfBirth = row.dateOfBirth;
          }
          if (row.parentName) {
            userData.parentName = row.parentName;
          }
          if (row.parentEmail) {
            userData.parentEmail = row.parentEmail;
          }
        }

        const newUser = await api.createUser(userData, session);

        if (newUser) {
          newUsers.push({
            id: newUser.id || String(Math.floor(Math.random() * 10000)),
            name: `${newUser.firstName || firstName} ${newUser.lastName || lastName}`.trim(),
            email: newUser.email || row.email,
            role: newUser.role || row.role,
            status: (newUser.isActive ? 'active' : 'inactive') as 'active' | 'inactive',
            unitType: row.unitType || undefined,
            unitNumber: row.unitNumber || undefined,
          });
          successCount++;
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`Row ${row.row} (${row.email}): ${errorMsg}`);
      }
    }

    setItems([...items, ...newUsers]);
    setImportSuccess(successCount);
    setImportErrors(errors);
    setImporting(false);

    if (successCount > 0 && errors.length === 0) {
      setTimeout(() => {
        setShowImportModal(false);
        setImportFile(null);
        setImportPreview([]);
        setImportErrors([]);
        setImportSuccess(0);
      }, 2000);
    }
  };

  if (status === 'loading' || !session) {
    return (
      <div style={{
        display: 'flex', minHeight: '100vh', backgroundColor: themeColors.gray50, alignItems: 'center', justifyContent: 'center',
      }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px', height: '40px', border: `3px solid ${themeColors.gray200}`, borderTopColor: themeColors.primary600, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px',
          }}
          />
          <p style={{ color: themeColors.gray600, fontSize: '14px' }}>Loading...</p>
          <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: themeColors.gray50 }}>
      {/* Collapsible Sidebar */}
      <div
        style={{
          width: sidebarOpen ? '260px' : '70px',
          backgroundColor: themeColors.primary900,
          color: themeColors.white,
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 300ms ease',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div style={{
          padding: themeSpace.lg, display: 'flex', alignItems: 'center', gap: themeSpace.md, borderBottom: `1px solid ${themeColors.primary800}`,
        }}
        >
          <div style={{
            width: '36px', height: '36px', backgroundColor: themeColors.primary600, borderRadius: themeRadius.sm, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
          >
            <span style={{ fontWeight: '700', fontSize: '16px' }}>CC</span>
          </div>
          {sidebarOpen && <span style={{ fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap' }}>Camp Card</span>}
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, overflow: 'auto', paddingTop: themeSpace.md }}>
          {navItems.map((item) => {
            const isActive = item.href === '/users';
            return (
              <div
                key={item.href}
                onClick={() => router.push(item.href)}
                style={{
                  padding: `${themeSpace.md}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: themeSpace.md,
                  cursor: 'pointer',
                  color: isActive ? themeColors.white : themeColors.primary100,
                  fontSize: '14px',
                  transition: 'all 200ms',
                  borderLeft: isActive ? `3px solid ${themeColors.primary300}` : '3px solid transparent',
                  backgroundColor: isActive ? themeColors.primary800 : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = themeColors.primary800;
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px',
                }}
                >
                  <Icon name={item.name} size={18} color="currentColor" />
                </div>
                {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
              </div>
            );
          })}
        </div>

        {/* Bottom Navigation */}
        <div style={{ borderTop: `1px solid ${themeColors.primary800}`, padding: themeSpace.md }}>
          {bottomNavItems.map((item) => (
            <div
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                padding: themeSpace.md,
                display: 'flex',
                alignItems: 'center',
                gap: themeSpace.md,
                cursor: 'pointer',
                color: themeColors.primary100,
                fontSize: '13px',
                marginBottom: themeSpace.xs,
                borderRadius: '4px',
                transition: 'all 200ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = themeColors.primary800; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px',
              }}
              >
                <Icon name={item.name} size={18} color="currentColor" />
              </div>
              {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
            </div>
          ))}
          <div
            onClick={() => signOut({ redirect: true, callbackUrl: '/login' })}
            style={{
              padding: themeSpace.md,
              display: 'flex',
              alignItems: 'center',
              gap: themeSpace.md,
              cursor: 'pointer',
              color: themeColors.primary100,
              fontSize: '13px',
              marginTop: themeSpace.md,
              borderTop: `1px solid ${themeColors.primary800}`,
              paddingTop: themeSpace.lg,
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px',
            }}
            >
              <Icon name="logout" size={18} color="currentColor" />
            </div>
            {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>Logout</span>}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          padding: themeSpace.xl, backgroundColor: themeColors.white, borderBottom: `1px solid ${themeColors.gray200}`, boxShadow: themeShadow.xs,
        }}
        >
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: themeSpace.lg,
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: themeSpace.md }}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
  background: 'none', border: 'none', cursor: 'pointer', color: themeColors.primary600, padding: themeSpace.sm,
}}
              >
                <Icon name="menu" size={20} />
              </button>
              <h1 style={{
                fontSize: '28px', fontWeight: '700', color: themeColors.text, margin: 0,
              }}
              >
                Users
</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: themeSpace.sm }}>
              <span style={{ fontSize: '13px', color: themeColors.gray600, marginRight: themeSpace.sm }}>
                Showing
                {' '}
                {filteredItems.length > 0 ? startIndex + 1 : 0}
                -
                {Math.min(endIndex, filteredItems.length)}
                {' '}
                of
                {filteredItems.length}
              </span>
              <button
                onClick={() => setShowImportModal(true)}
                style={{
  background: themeColors.white, color: themeColors.gray600, border: `1px solid ${themeColors.gray200}`, padding: `${themeSpace.sm} ${themeSpace.md}`, borderRadius: themeRadius.sm, cursor: 'pointer', fontSize: '13px', fontWeight: '500', display: 'flex', gap: themeSpace.xs, alignItems: 'center',
}}
              >
                <Icon name="upload" size={16} color={themeColors.gray600} />
                Import
              </button>
              <button
                onClick={exportUsers}
                style={{
  background: themeColors.white, color: themeColors.gray600, border: `1px solid ${themeColors.gray200}`, padding: `${themeSpace.sm} ${themeSpace.md}`, borderRadius: themeRadius.sm, cursor: 'pointer', fontSize: '13px', fontWeight: '500', display: 'flex', gap: themeSpace.xs, alignItems: 'center',
}}
              >
                <Icon name="download" size={16} color={themeColors.gray600} />
                Export
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                style={{
  background: themeColors.primary600, color: themeColors.white, border: 'none', padding: `${themeSpace.sm} ${themeSpace.lg}`, borderRadius: themeRadius.sm, cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', gap: themeSpace.sm, alignItems: 'center',
}}
              >
                <Icon name="add" size={18} color={themeColors.white} />
                Add User
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div style={{
            display: 'flex', gap: themeSpace.md, flexWrap: 'wrap', alignItems: 'center',
          }}
          >
            <div style={{
              position: 'relative', flex: '1', minWidth: '200px', maxWidth: '300px',
            }}
            >
              <Icon name="search" size={18} color={themeColors.gray500} style={{ position: 'absolute', left: themeSpace.md, top: '12px' }} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: `${themeSpace.sm} ${themeSpace.md} ${themeSpace.sm} ${themeSpace.xl}`,
                  border: `1px solid ${themeColors.gray200}`,
                  borderRadius: themeRadius.sm,
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: `${themeSpace.sm} ${themeSpace.md}`,
                border: `1px solid ${themeColors.gray200}`,
                borderRadius: themeRadius.sm,
                fontSize: '14px',
                backgroundColor: themeColors.white,
                cursor: 'pointer',
                minWidth: '140px',
              }}
            >
              <option value="">All Roles</option>
              {allRoleOptions.map((role) => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: `${themeSpace.sm} ${themeSpace.md}`,
                border: `1px solid ${themeColors.gray200}`,
                borderRadius: themeRadius.sm,
                fontSize: '14px',
                backgroundColor: themeColors.white,
                cursor: 'pointer',
                minWidth: '120px',
              }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Items Per Page */}
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              style={{
                padding: `${themeSpace.sm} ${themeSpace.md}`,
                border: `1px solid ${themeColors.gray200}`,
                borderRadius: themeRadius.sm,
                fontSize: '14px',
                backgroundColor: themeColors.white,
                cursor: 'pointer',
              }}
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>

            {/* Clear Filters */}
            {(searchTerm || roleFilter || statusFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('');
                setStatusFilter('');
              }}
              style={{
                padding: `${themeSpace.sm} ${themeSpace.md}`,
                backgroundColor: themeColors.gray100,
                color: themeColors.gray600,
                border: 'none',
                borderRadius: themeRadius.sm,
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
              }}
            >
              Clear Filters
            </button>
            )}
          </div>
        </div>

        <div style={{ flex: 1, padding: themeSpace.xl, overflowY: 'auto' }}>
          <ApiErrorDisplay
            error={error}
            onRetry={fetchData}
            title="Failed to load users"
          />

          {loading ? (
            <LoadingState message="Loading users..." />
          ) : filteredItems.length === 0 ? (
            <EmptyState
              title={items.length === 0 ? 'No users found' : 'No users match your filters'}
              description={items.length === 0 ? 'Create your first user to get started.' : 'Try adjusting your search or filter criteria.'}
              action={items.length === 0 ? { label: 'Add User', onClick: () => setShowAddForm(true) } : undefined}
            />
          ) : (
            <>
              <div style={{
                backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `1px solid ${themeColors.gray200}`, overflow: 'hidden', boxShadow: themeShadow.sm,
              }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                   <tr style={{ backgroundColor: themeColors.gray50, borderBottom: `1px solid ${themeColors.gray200}` }}>
                   <th style={{
                   textAlign: 'left', padding: themeSpace.lg, fontSize: '13px', fontWeight: '600', color: themeColors.gray600,
                 }}
                 >
Name
                 </th>
                   <th style={{
                   textAlign: 'left', padding: themeSpace.lg, fontSize: '13px', fontWeight: '600', color: themeColors.gray600,
                 }}
                 >
Email
                 </th>
                   <th style={{
                   textAlign: 'left', padding: themeSpace.lg, fontSize: '13px', fontWeight: '600', color: themeColors.gray600,
                 }}
                 >
Role
                 </th>
                   <th style={{
                   textAlign: 'left', padding: themeSpace.lg, fontSize: '13px', fontWeight: '600', color: themeColors.gray600,
                 }}
                 >
Status
                 </th>
                   <th style={{
                   textAlign: 'center', padding: themeSpace.lg, fontSize: '13px', fontWeight: '600', color: themeColors.gray600,
                 }}
                 >
Actions
                 </th>
                 </tr>
                 </thead>
                  <tbody>
                   {paginatedItems.map((item) => (
                   <tr key={item.id} style={{ borderBottom: `1px solid ${themeColors.gray200}` }}>
                   <td style={{
                   padding: themeSpace.lg, fontSize: '14px', color: themeColors.text, fontWeight: '500',
                 }}
                 >
                   {item.name}
                 </td>
                   <td style={{ padding: themeSpace.lg, fontSize: '14px', color: themeColors.text }}>{item.email}</td>
                   <td style={{ padding: themeSpace.lg }}>
                   <span style={{
                   padding: `${themeSpace.xs} ${themeSpace.sm}`, backgroundColor: themeColors.primary50, color: themeColors.primary600, borderRadius: themeRadius.sm, fontSize: '12px', fontWeight: '500',
                 }}
                 >
                   {allRoleOptions.find((r) => r.value === item.role)?.label || item.role}
                 </span>
                 </td>
                   <td style={{ padding: themeSpace.lg }}>
                   <span style={{
                   padding: `${themeSpace.xs} ${themeSpace.sm}`, backgroundColor: item.status === 'active' ? themeColors.success50 : themeColors.gray100, color: item.status === 'active' ? themeColors.success600 : themeColors.gray600, borderRadius: themeRadius.sm, fontSize: '12px', fontWeight: '500',
                 }}
                 >
                   {item.status || 'active'}
                 </span>
                 </td>
                   <td style={{ padding: themeSpace.lg, textAlign: 'center' }}>
                   <div style={{ display: 'flex', gap: themeSpace.sm, justifyContent: 'center' }}>
                   <button
                     onClick={() => handleEdit(item)} style={{
                     background: themeColors.info50, border: 'none', color: themeColors.info600, width: '32px', height: '32px', borderRadius: themeRadius.sm, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                   }}
                   >
                     <Icon name="edit" size={16} color={themeColors.info600} />
                   </button>
                   <button
                     onClick={() => handleDelete(item.id)} style={{
                     background: '#fee2e2', border: 'none', color: themeColors.error500, width: '32px', height: '32px', borderRadius: themeRadius.sm, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                   }}
                   >
                     <Icon name="delete" size={16} color={themeColors.error500} />
                   </button>
                 </div>
                 </td>
                 </tr>
                 ))}
                 </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
              <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: themeSpace.sm, marginTop: themeSpace.xl, padding: themeSpace.lg, backgroundColor: themeColors.white, borderRadius: themeRadius.card, boxShadow: themeShadow.xs,
              }}
              >
                <button
                 onClick={() => setCurrentPage(1)}
                 disabled={currentPage === 1}
                 style={{
                 padding: `${themeSpace.sm} ${themeSpace.md}`,
                 backgroundColor: currentPage === 1 ? themeColors.gray100 : themeColors.white,
                 color: currentPage === 1 ? themeColors.gray500 : themeColors.primary600,
                 border: `1px solid ${currentPage === 1 ? themeColors.gray200 : themeColors.primary100}`,
                 borderRadius: themeRadius.sm,
                 cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                 fontSize: '13px',
                 fontWeight: '500',
               }}
               >
         First
               </button>
                <button
                 onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                 disabled={currentPage === 1}
                 style={{
                 padding: `${themeSpace.sm} ${themeSpace.md}`,
                 backgroundColor: currentPage === 1 ? themeColors.gray100 : themeColors.white,
                 color: currentPage === 1 ? themeColors.gray500 : themeColors.primary600,
                 border: `1px solid ${currentPage === 1 ? themeColors.gray200 : themeColors.primary100}`,
                 borderRadius: themeRadius.sm,
                 cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                 fontSize: '13px',
                 fontWeight: '500',
                 display: 'flex',
                 alignItems: 'center',
                 gap: themeSpace.xs,
               }}
               >
                 <Icon name="chevronLeft" size={16} />
                 {' '}
                 Prev
       </button>

                <div style={{ display: 'flex', gap: themeSpace.xs }}>
                 {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                 let pageNum;
                 if (totalPages <= 5) {
                   pageNum = i + 1;
                 } else if (currentPage <= 3) {
                   pageNum = i + 1;
                 } else if (currentPage >= totalPages - 2) {
                   pageNum = totalPages - 4 + i;
                 } else {
                   pageNum = currentPage - 2 + i;
                 }
                 return (
                 <button
                 key={pageNum}
                 onClick={() => setCurrentPage(pageNum)}
                 style={{
                 padding: `${themeSpace.sm} ${themeSpace.md}`,
                 backgroundColor: currentPage === pageNum ? themeColors.primary600 : themeColors.white,
                 color: currentPage === pageNum ? themeColors.white : themeColors.text,
                 border: `1px solid ${currentPage === pageNum ? themeColors.primary600 : themeColors.gray200}`,
                 borderRadius: themeRadius.sm,
                 cursor: 'pointer',
                 fontSize: '13px',
                 fontWeight: currentPage === pageNum ? '600' : '500',
                 minWidth: '36px',
               }}
               >
                 {pageNum}
               </button>
                 );
               })}
               </div>

                <button
                 onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                 disabled={currentPage === totalPages}
                 style={{
                 padding: `${themeSpace.sm} ${themeSpace.md}`,
                 backgroundColor: currentPage === totalPages ? themeColors.gray100 : themeColors.white,
                 color: currentPage === totalPages ? themeColors.gray500 : themeColors.primary600,
                 border: `1px solid ${currentPage === totalPages ? themeColors.gray200 : themeColors.primary100}`,
                 borderRadius: themeRadius.sm,
                 cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                 fontSize: '13px',
                 fontWeight: '500',
                 display: 'flex',
                 alignItems: 'center',
                 gap: themeSpace.xs,
               }}
               >
         Next
                 {' '}
                 <Icon name="chevronRight" size={16} />
               </button>
                <button
                 onClick={() => setCurrentPage(totalPages)}
                 disabled={currentPage === totalPages}
                 style={{
                 padding: `${themeSpace.sm} ${themeSpace.md}`,
                 backgroundColor: currentPage === totalPages ? themeColors.gray100 : themeColors.white,
                 color: currentPage === totalPages ? themeColors.gray500 : themeColors.primary600,
                 border: `1px solid ${currentPage === totalPages ? themeColors.gray200 : themeColors.primary100}`,
                 borderRadius: themeRadius.sm,
                 cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                 fontSize: '13px',
                 fontWeight: '500',
               }}
               >
         Last
               </button>
              </div>
              )}
            </>
          )}
        </div>

        {showAddForm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px',
        }}
        >
          <div style={{
            backgroundColor: themeColors.white, borderRadius: themeRadius.card, width: '100%', maxWidth: '380px', maxHeight: 'calc(100vh - 40px)', boxShadow: themeShadow.md, display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}
          >
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${themeColors.gray200}`, flexShrink: 0 }}>
              <h2 style={{
                fontSize: '16px', fontWeight: '700', color: themeColors.text, margin: 0,
              }}
              >
                Add New User
              </h2>
            </div>

            <div style={{
              display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 16px', overflowY: 'auto', flex: 1,
            }}
            >
              <div>
                <label style={{
                  display: 'block', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, marginBottom: '4px',
                }}
                >
Name
                </label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Enter user name"
                  style={{
                   width: '100%',
                   padding: '6px 10px',
                   border: `1px solid ${themeColors.gray200}`,
                   borderRadius: themeRadius.sm,
                   fontSize: '13px',
                   boxSizing: 'border-box',
                 }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, marginBottom: '4px',
                }}
                >
Email
                </label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="Enter email address"
                  style={{
                   width: '100%',
                   padding: '6px 10px',
                   border: `1px solid ${themeColors.gray200}`,
                   borderRadius: themeRadius.sm,
                   fontSize: '13px',
                   boxSizing: 'border-box',
                 }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, marginBottom: '4px',
                }}
                >
Status
                </label>
                <select
                  value={newUserStatus}
                  onChange={(e) => setNewUserStatus(e.target.value as 'active' | 'inactive')}
                  style={{
                   width: '100%',
                   padding: '6px 10px',
                   border: `1px solid ${themeColors.gray200}`,
                   borderRadius: themeRadius.sm,
                   fontSize: '13px',
                   boxSizing: 'border-box',
                   backgroundColor: themeColors.white,
                   cursor: 'pointer',
                 }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, marginBottom: '4px',
                }}
                >
Role
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => {
                    setNewUserRole(e.target.value as UserRole);
                    // Clear Scout-specific fields when switching away from Scout
                    if (e.target.value !== 'SCOUT') {
                      setNewUserUnitType(null);
                      setNewUserUnitNumber('');
                      setNewUserDateOfBirth('');
                      setNewUserParentName('');
                      setNewUserParentEmail('');
                      setNewUserParentPhone('');
                    }
                  }}
                  style={{
                   width: '100%',
                   padding: '6px 10px',
                   border: `1px solid ${themeColors.gray200}`,
                   borderRadius: themeRadius.sm,
                   fontSize: '13px',
                   boxSizing: 'border-box',
                   backgroundColor: themeColors.white,
                   cursor: 'pointer',
                 }}
                >
                  {roleOptions.map((role) => (
                   <option key={role.value} value={role.value}>
                   {role.label}
                 </option>
                 ))}
                </select>
              </div>

              {/* Council dropdown with search - shown only for Council Admin */}
              {newUserRole === 'COUNCIL_ADMIN' && (
                <div style={{ position: 'relative' }}>
                  <label style={{
                    display: 'block', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, marginBottom: '4px',
                  }}
                  >
                    Council
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={councilSearchTerm}
                      onChange={(e) => {
                        setCouncilSearchTerm(e.target.value);
                        setShowCouncilDropdown(true);
                      }}
                      onFocus={() => setShowCouncilDropdown(true)}
                      placeholder={newUserCouncilId ? councils.find(c => c.uuid === newUserCouncilId)?.name || 'Search councils...' : 'Search councils...'}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        border: `1px solid ${themeColors.gray200}`,
                        borderRadius: themeRadius.sm,
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                    {councilsLoading && (
                      <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: themeColors.gray500 }}>
                        Loading...
                      </div>
                    )}
                  </div>
                  {showCouncilDropdown && councils.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      maxHeight: '200px',
                      overflowY: 'auto',
                      backgroundColor: themeColors.white,
                      border: `1px solid ${themeColors.gray200}`,
                      borderRadius: themeRadius.sm,
                      boxShadow: themeShadow.md,
                      zIndex: 10,
                    }}>
                      {councils
                        .filter(c => !councilSearchTerm || c.name.toLowerCase().includes(councilSearchTerm.toLowerCase()))
                        .map((council) => (
                          <div
                            key={council.uuid}
                            onClick={() => {
                              setNewUserCouncilId(council.uuid);
                              setCouncilSearchTerm(council.name);
                              setShowCouncilDropdown(false);
                            }}
                            style={{
                              padding: `${themeSpace.sm} ${themeSpace.md}`,
                              cursor: 'pointer',
                              backgroundColor: newUserCouncilId === council.uuid ? themeColors.primary50 : 'transparent',
                              borderBottom: `1px solid ${themeColors.gray100}`,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = themeColors.gray50)}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = newUserCouncilId === council.uuid ? themeColors.primary50 : 'transparent')}
                          >
                            {council.name}
                          </div>
                        ))}
                    </div>
                  )}
                  {newUserCouncilId && (
                    <div style={{ marginTop: themeSpace.xs, fontSize: '12px', color: themeColors.primary600 }}>
                      Selected: {councils.find(c => c.uuid === newUserCouncilId)?.name || 'Loading...'}
                      <button
                        type="button"
                        onClick={() => {
                          setNewUserCouncilId('');
                          setCouncilSearchTerm('');
                        }}
                        style={{
                          marginLeft: themeSpace.sm,
                          background: 'none',
                          border: 'none',
                          color: themeColors.error500,
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Unit Type and Unit Number fields - shown only for Scouts */}
              {newUserRole === 'SCOUT' && (
                <>
                  <div>
                    <label style={{
                      display: 'block', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, marginBottom: '4px',
                    }}
                    >
Unit Type
                    </label>
                    <select
                      value={newUserUnitType || ''}
                      onChange={(e) => setNewUserUnitType(e.target.value as UnitType || null)}
                      style={{
                       width: '100%',
                       padding: '6px 10px',
                       border: `1px solid ${themeColors.gray200}`,
                       borderRadius: themeRadius.sm,
                       fontSize: '13px',
                       boxSizing: 'border-box',
                       backgroundColor: themeColors.white,
                       cursor: 'pointer',
                     }}
                    >
                      {unitTypeOptions.map((type) => (
                       <option key={type.value} value={type.value}>
                       {type.label}
                     </option>
                     ))}
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, marginBottom: '4px',
                    }}
                    >
Unit Number
                    </label>
                    <input
                      type="text"
                      value={newUserUnitNumber}
                      onChange={(e) => setNewUserUnitNumber(e.target.value)}
                      placeholder="Enter unit number"
                      style={{
                       width: '100%',
                       padding: '6px 10px',
                       border: `1px solid ${themeColors.gray200}`,
                       borderRadius: themeRadius.sm,
                       fontSize: '13px',
                       boxSizing: 'border-box',
                     }}
                    />
                  </div>

                  {/* COPPA Compliance: Date of Birth field */}
                  <div>
                    <label style={{
                      display: 'block', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, marginBottom: '4px',
                    }}
                    >
                      Date of Birth <span style={{ color: themeColors.error500 }}>*</span>
                    </label>
                    <input
                      type="date"
                      value={newUserDateOfBirth}
                      onChange={(e) => setNewUserDateOfBirth(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        border: `1px solid ${themeColors.gray200}`,
                        borderRadius: themeRadius.sm,
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                    <p style={{ fontSize: '10px', color: themeColors.gray500, marginTop: '2px', margin: '2px 0 0 0' }}>
                      Required for COPPA compliance. Minors require parental consent.
                    </p>
                  </div>

                  {/* COPPA Compliance: Parent/Guardian Information */}
                  <div style={{
                    backgroundColor: themeColors.info50,
                    border: `1px solid ${themeColors.info600}`,
                    borderRadius: themeRadius.sm,
                    padding: '10px',
                    marginTop: '4px',
                  }}>
                    <h4 style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: themeColors.info600,
                      marginBottom: '8px',
                      margin: '0 0 8px 0',
                    }}>
                      Parent/Guardian Information
                    </h4>
                    <p style={{ fontSize: '11px', color: themeColors.gray600, marginBottom: '8px', margin: '0 0 8px 0' }}>
                      A consent request email will be sent to the parent/guardian. The scout will have limited access until consent is granted.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div>
                        <label style={{
                          display: 'block', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, marginBottom: '4px',
                        }}
                        >
                          Parent/Guardian Name <span style={{ color: themeColors.error500 }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={newUserParentName}
                          onChange={(e) => setNewUserParentName(e.target.value)}
                          placeholder="Enter parent/guardian full name"
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            border: `1px solid ${themeColors.gray200}`,
                            borderRadius: themeRadius.sm,
                            fontSize: '13px',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{
                          display: 'block', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, marginBottom: '4px',
                        }}
                        >
                          Parent/Guardian Email <span style={{ color: themeColors.error500 }}>*</span>
                        </label>
                        <input
                          type="email"
                          value={newUserParentEmail}
                          onChange={(e) => setNewUserParentEmail(e.target.value)}
                          placeholder="Enter parent/guardian email"
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            border: `1px solid ${themeColors.gray200}`,
                            borderRadius: themeRadius.sm,
                            fontSize: '13px',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{
                          display: 'block', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, marginBottom: '4px',
                        }}
                        >
                          Parent/Guardian Phone (Optional)
                        </label>
                        <input
                          type="tel"
                          value={newUserParentPhone}
                          onChange={(e) => setNewUserParentPhone(e.target.value)}
                          placeholder="Enter parent/guardian phone"
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            border: `1px solid ${themeColors.gray200}`,
                            borderRadius: themeRadius.sm,
                            fontSize: '13px',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '12px 16px', borderTop: `1px solid ${themeColors.gray200}`, flexShrink: 0 }}>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewUserName('');
                  setNewUserEmail('');
                  setNewUserStatus('active');
                  setNewUserRole('SCOUT');
                  setNewUserUnitType(null);
                  setNewUserUnitNumber('');
                  setNewUserDateOfBirth('');
                  setNewUserParentName('');
                  setNewUserParentEmail('');
                  setNewUserParentPhone('');
                  setNewUserCouncilId('');
                  setCouncilSearchTerm('');
                  setShowCouncilDropdown(false);
                  setError(null);
                }}
                style={{
                  padding: '6px 14px',
                  border: `1px solid ${themeColors.gray200}`,
                  backgroundColor: themeColors.white,
                  borderRadius: themeRadius.sm,
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: themeColors.gray600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={addUser}
                style={{
                  padding: '6px 14px',
                  background: themeColors.primary600,
                  color: themeColors.white,
                  border: 'none',
                  borderRadius: themeRadius.sm,
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                }}
              >
                Create User
              </button>
            </div>
          </div>
        </div>
        )}

        {showEditForm && editingUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
        }}
        >
          <div style={{
            backgroundColor: themeColors.white, borderRadius: themeRadius.card, padding: themeSpace.xl, width: '90%', maxWidth: '500px', boxShadow: themeShadow.md,
          }}
          >
            <h2 style={{
              fontSize: '20px', fontWeight: '700', color: themeColors.text, marginBottom: themeSpace.lg, margin: 0,
            }}
            >
              Edit User
            </h2>

            <div style={{
              display: 'flex', flexDirection: 'column', gap: themeSpace.lg, marginBottom: themeSpace.xl,
            }}
            >
              <div>
                <label style={{
                  display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm,
                }}
                >
Name
                </label>
                <input
                  type="text"
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  placeholder="Enter user name"
                  style={{
                   width: '100%',
                   padding: `${themeSpace.sm} ${themeSpace.md}`,
                   border: `1px solid ${themeColors.gray200}`,
                   borderRadius: themeRadius.sm,
                   fontSize: '14px',
                   boxSizing: 'border-box',
                 }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm,
                }}
                >
Email
                </label>
                <input
                  type="email"
                  value={editUserEmail}
                  onChange={(e) => setEditUserEmail(e.target.value)}
                  placeholder="Enter email address"
                  disabled
                  style={{
                   width: '100%',
                   padding: `${themeSpace.sm} ${themeSpace.md}`,
                   border: `1px solid ${themeColors.gray200}`,
                   borderRadius: themeRadius.sm,
                   fontSize: '14px',
                   boxSizing: 'border-box',
                   backgroundColor: themeColors.gray100,
                   cursor: 'not-allowed',
                 }}
                />
                <span style={{ fontSize: '11px', color: themeColors.gray500 }}>Email cannot be changed</span>
              </div>

              <div>
                <label style={{
                  display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm,
                }}
                >
Status
                </label>
                <select
                  value={editUserStatus}
                  onChange={(e) => setEditUserStatus(e.target.value as 'active' | 'inactive')}
                  style={{
                   width: '100%',
                   padding: `${themeSpace.sm} ${themeSpace.md}`,
                   border: `1px solid ${themeColors.gray200}`,
                   borderRadius: themeRadius.sm,
                   fontSize: '14px',
                   boxSizing: 'border-box',
                   backgroundColor: themeColors.white,
                   cursor: 'pointer',
                 }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm,
                }}
                >
Role
                </label>
                <select
                  value={editUserRole}
                  onChange={(e) => {
                    setEditUserRole(e.target.value as UserRole);
                    // Clear unit fields when switching away from Scout
                    if (e.target.value !== 'SCOUT') {
                      setEditUserUnitType(null);
                      setEditUserUnitNumber('');
                    }
                  }}
                  style={{
                   width: '100%',
                   padding: `${themeSpace.sm} ${themeSpace.md}`,
                   border: `1px solid ${themeColors.gray200}`,
                   borderRadius: themeRadius.sm,
                   fontSize: '14px',
                   boxSizing: 'border-box',
                   backgroundColor: themeColors.white,
                   cursor: 'pointer',
                 }}
                >
                  {roleOptions.map((role) => (
                   <option key={role.value} value={role.value}>
                   {role.label}
                 </option>
                 ))}
                </select>
              </div>

              {/* Unit Type and Unit Number fields - shown only for Scouts */}
              {editUserRole === 'SCOUT' && (
                <>
                  <div>
                    <label style={{
                      display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm,
                    }}
                    >
Unit Type
                    </label>
                    <select
                      value={editUserUnitType || ''}
                      onChange={(e) => setEditUserUnitType(e.target.value as UnitType || null)}
                      style={{
                       width: '100%',
                       padding: `${themeSpace.sm} ${themeSpace.md}`,
                       border: `1px solid ${themeColors.gray200}`,
                       borderRadius: themeRadius.sm,
                       fontSize: '14px',
                       boxSizing: 'border-box',
                       backgroundColor: themeColors.white,
                       cursor: 'pointer',
                     }}
                    >
                      {unitTypeOptions.map((type) => (
                       <option key={type.value} value={type.value}>
                       {type.label}
                     </option>
                     ))}
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm,
                    }}
                    >
Unit Number
                    </label>
                    <input
                      type="text"
                      value={editUserUnitNumber}
                      onChange={(e) => setEditUserUnitNumber(e.target.value)}
                      placeholder="Enter unit number"
                      style={{
                       width: '100%',
                       padding: `${themeSpace.sm} ${themeSpace.md}`,
                       border: `1px solid ${themeColors.gray200}`,
                       borderRadius: themeRadius.sm,
                       fontSize: '14px',
                       boxSizing: 'border-box',
                     }}
                    />
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: themeSpace.md, justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setEditingUser(null);
                  setEditUserName('');
                  setEditUserEmail('');
                  setEditUserStatus('active');
                  setEditUserRole('SCOUT');
                  setEditUserUnitType(null);
                  setEditUserUnitNumber('');
                  setError(null);
                }}
                style={{
                  padding: `${themeSpace.sm} ${themeSpace.lg}`,
                  border: `1px solid ${themeColors.gray200}`,
                  backgroundColor: themeColors.white,
                  borderRadius: themeRadius.sm,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: themeColors.gray600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveEditUser}
                style={{
                  padding: `${themeSpace.sm} ${themeSpace.lg}`,
                  background: themeColors.primary600,
                  color: themeColors.white,
                  border: 'none',
                  borderRadius: themeRadius.sm,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Import Modal */}
        {showImportModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}
        >
          <div style={{
            background: themeColors.white, borderRadius: themeRadius.card, padding: themeSpace.xl, width: '700px', maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto', boxShadow: themeShadow.md,
          }}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: themeSpace.lg,
            }}
            >
              <h2 style={{
                margin: 0, fontSize: '20px', fontWeight: '600', color: themeColors.text,
              }}
              >
                Import Users
              </h2>
              <button
                onClick={() => { setShowImportModal(false); setImportFile(null); setImportPreview([]); setImportErrors([]); setImportSuccess(0); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: themeSpace.xs,
                }}
              >
                <Icon name="x" size={20} color={themeColors.gray500} />
              </button>
            </div>

            {/* Instructions Tab */}
            <div style={{ marginBottom: themeSpace.lg }}>
              <div style={{ display: 'flex', borderBottom: `1px solid ${themeColors.gray200}`, marginBottom: themeSpace.md }}>
                <button
                  onClick={() => {}}
                  style={{
                   padding: `${themeSpace.sm} ${themeSpace.md}`,
                   background: themeColors.primary50,
                   border: 'none',
                   borderBottom: `2px solid ${themeColors.primary600}`,
                   cursor: 'pointer',
                   fontSize: '13px',
                   fontWeight: '600',
                   color: themeColors.primary600,
                 }}
                >
           Instructions
                </button>
                <button
                  onClick={downloadTemplate}
                  style={{
                   padding: `${themeSpace.sm} ${themeSpace.md}`,
                   background: 'none',
                   border: 'none',
                   borderBottom: '2px solid transparent',
                   cursor: 'pointer',
                   fontSize: '13px',
                   fontWeight: '500',
                   color: themeColors.gray600,
                   display: 'flex',
                   alignItems: 'center',
                   gap: themeSpace.xs,
                 }}
                >
                  <Icon name="download" size={14} color={themeColors.gray600} />
                  Download Template
         </button>
              </div>

              <div style={{
                backgroundColor: themeColors.gray50, borderRadius: themeRadius.sm, padding: themeSpace.md, fontSize: '13px', color: themeColors.gray600, lineHeight: '1.6',
              }}
              >
                <p style={{ margin: 0, marginBottom: themeSpace.sm }}><strong>How to import users:</strong></p>
                <ol style={{ margin: 0, paddingLeft: themeSpace.lg, marginBottom: themeSpace.md }}>
                  <li>Click "Download Template" above to get the CSV file</li>
                  <li>Open the file in Excel or Google Sheets</li>
                  <li>Delete the example rows (lines starting with # are comments)</li>
                  <li>Add your user data following the column format</li>
                  <li>Save the file (keep it as CSV format)</li>
                  <li>Upload the file below</li>
                </ol>

                <p style={{ margin: 0, marginBottom: themeSpace.xs }}><strong>Required columns:</strong></p>
                <table style={{ width: '100%', fontSize: '12px', marginBottom: themeSpace.md }}>
                  <tbody>
                   <tr>
                   <td style={{ padding: '4px 8px', background: themeColors.white }}><strong>Name</strong></td>
                   <td style={{ padding: '4px 8px', background: themeColors.white }}>Full name (e.g., John Smith)</td>
                 </tr>
                   <tr>
                   <td style={{ padding: '4px 8px' }}><strong>Email</strong></td>
                   <td style={{ padding: '4px 8px' }}>Valid email address (must be unique)</td>
                 </tr>
                   <tr>
                   <td style={{ padding: '4px 8px', background: themeColors.white }}><strong>Role</strong></td>
                   <td style={{ padding: '4px 8px', background: themeColors.white }}>NATIONAL_ADMIN, COUNCIL_ADMIN, UNIT_LEADER, PARENT, or SCOUT</td>
                 </tr>
                   <tr>
                   <td style={{ padding: '4px 8px' }}><strong>Status</strong></td>
                   <td style={{ padding: '4px 8px' }}>active or inactive</td>
                 </tr>
                 </tbody>
                </table>

                <p style={{ margin: 0, marginBottom: themeSpace.xs }}><strong>Council/Unit columns (for hierarchy assignment):</strong></p>
                <table style={{ width: '100%', fontSize: '12px', marginBottom: themeSpace.md }}>
                  <tbody>
                   <tr>
                   <td style={{ padding: '4px 8px', background: themeColors.white }}><strong>CouncilName</strong></td>
                   <td style={{ padding: '4px 8px', background: themeColors.white }}>Council name (required for COUNCIL_ADMIN only)</td>
                 </tr>
                   <tr>
                   <td style={{ padding: '4px 8px' }}><strong>UnitNumber</strong></td>
                   <td style={{ padding: '4px 8px' }}>Unit/Troop number (required for UNIT_LEADER and SCOUT)</td>
                 </tr>
                   <tr>
                   <td style={{ padding: '4px 8px', background: themeColors.white }}><strong>UnitType</strong></td>
                   <td style={{ padding: '4px 8px', background: themeColors.white }}>Required for SCOUT: PACK, BSA_TROOP_BOYS, BSA_TROOP_GIRLS, SHIP, CREW, or FAMILY_SCOUTING</td>
                 </tr>
                 </tbody>
                </table>

                <p style={{ margin: 0, marginBottom: themeSpace.xs }}><strong>COPPA Compliance columns (required for SCOUT role):</strong></p>
                <table style={{ width: '100%', fontSize: '12px', marginBottom: themeSpace.md }}>
                  <tbody>
                   <tr>
                   <td style={{ padding: '4px 8px', background: themeColors.white }}><strong>DateOfBirth</strong></td>
                   <td style={{ padding: '4px 8px', background: themeColors.white }}>Scout&apos;s birth date in YYYY-MM-DD format (e.g., 2012-05-15)</td>
                 </tr>
                   <tr>
                   <td style={{ padding: '4px 8px' }}><strong>ParentName</strong></td>
                   <td style={{ padding: '4px 8px' }}>Full name of parent/guardian who will provide consent</td>
                 </tr>
                   <tr>
                   <td style={{ padding: '4px 8px', background: themeColors.white }}><strong>ParentEmail</strong></td>
                   <td style={{ padding: '4px 8px', background: themeColors.white }}>Parent/guardian email for consent verification</td>
                 </tr>
                 </tbody>
                </table>

                <p style={{ margin: 0, fontSize: '12px', color: themeColors.warning600, marginBottom: themeSpace.sm }}>
                  <strong>⚠️ COPPA Notice:</strong> For SCOUT users (children under 13), the system will send a parental consent request email. The Scout account will remain pending until the parent provides consent.
                </p>

                <p style={{ margin: 0, fontSize: '12px', color: themeColors.gray500 }}>
                  <em>Note: A temporary password will be generated for each user. They will need to reset it on first login.</em>
                </p>
              </div>
            </div>

            {/* File Upload */}
            <div style={{ marginBottom: themeSpace.lg }}>
              <label style={{
                display: 'block', marginBottom: themeSpace.sm, fontSize: '14px', fontWeight: '500', color: themeColors.text,
              }}
              >
                Select CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                style={{
                  width: '100%',
                  padding: themeSpace.md,
                  border: `2px dashed ${themeColors.gray200}`,
                  borderRadius: themeRadius.sm,
                  cursor: 'pointer',
                }}
              />
            </div>

            {/* Success Message */}
            {importSuccess > 0 && (
            <div style={{
              backgroundColor: themeColors.success50, border: `1px solid ${themeColors.success600}`, borderRadius: themeRadius.sm, padding: themeSpace.md, marginBottom: themeSpace.md,
            }}
            >
              <p style={{ margin: 0, fontSize: '14px', color: themeColors.success600 }}>
                Successfully imported
         {' '}
                {importSuccess}
                {' '}
                user
         {importSuccess !== 1 ? 's' : ''}
                !
       </p>
            </div>
            )}

            {/* Error Messages */}
            {importErrors.length > 0 && (
            <div style={{
              backgroundColor: themeColors.warning50, border: `1px solid ${themeColors.warning600}`, borderRadius: themeRadius.sm, padding: themeSpace.md, marginBottom: themeSpace.md, maxHeight: '150px', overflow: 'auto',
            }}
            >
              <p style={{
                margin: 0, marginBottom: themeSpace.sm, fontSize: '14px', fontWeight: '600', color: themeColors.warning600,
              }}
              >
         Validation Errors:
              </p>
              {importErrors.map((err, idx) => (
                <p
                 key={idx}
                 style={{
                 margin: 0, fontSize: '13px', color: themeColors.gray600, marginBottom: themeSpace.xs,
               }}
               >
                 {err}
               </p>
              ))}
            </div>
            )}

            {/* Preview Table */}
            {importPreview.length > 0 && (
            <div style={{ marginBottom: themeSpace.lg }}>
              <h3 style={{
                fontSize: '14px', fontWeight: '600', color: themeColors.text, marginBottom: themeSpace.sm,
              }}
              >
         Preview (
                {importPreview.filter((r) => r.valid).length}
                {' '}
                valid of
         {importPreview.length}
                {' '}
                rows)
       </h3>
              <div style={{
                maxHeight: '250px', overflow: 'auto', border: `1px solid ${themeColors.gray200}`, borderRadius: themeRadius.sm,
              }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                 <thead>
                 <tr style={{ backgroundColor: themeColors.gray50, position: 'sticky', top: 0 }}>
                 <th style={{ padding: themeSpace.sm, textAlign: 'left', borderBottom: `1px solid ${themeColors.gray200}` }}>Row</th>
                 <th style={{ padding: themeSpace.sm, textAlign: 'left', borderBottom: `1px solid ${themeColors.gray200}` }}>Name</th>
                 <th style={{ padding: themeSpace.sm, textAlign: 'left', borderBottom: `1px solid ${themeColors.gray200}` }}>Email</th>
                 <th style={{ padding: themeSpace.sm, textAlign: 'left', borderBottom: `1px solid ${themeColors.gray200}` }}>Role</th>
                 <th style={{ padding: themeSpace.sm, textAlign: 'left', borderBottom: `1px solid ${themeColors.gray200}` }}>Status</th>
                 <th style={{ padding: themeSpace.sm, textAlign: 'left', borderBottom: `1px solid ${themeColors.gray200}` }}>Council</th>
                 <th style={{ padding: themeSpace.sm, textAlign: 'left', borderBottom: `1px solid ${themeColors.gray200}` }}>Unit #</th>
                 <th style={{ padding: themeSpace.sm, textAlign: 'left', borderBottom: `1px solid ${themeColors.gray200}` }}>Unit Type</th>
                 <th style={{ padding: themeSpace.sm, textAlign: 'center', borderBottom: `1px solid ${themeColors.gray200}` }}>Valid</th>
               </tr>
               </thead>
                 <tbody>
                 {importPreview.map((row, idx) => (
                 <tr key={idx} style={{ backgroundColor: row.valid ? themeColors.white : `${themeColors.error400}20` }}>
                 <td style={{ padding: themeSpace.sm, borderBottom: `1px solid ${themeColors.gray100}` }}>{row.row}</td>
                 <td style={{ padding: themeSpace.sm, borderBottom: `1px solid ${themeColors.gray100}` }}>{row.name}</td>
                 <td style={{ padding: themeSpace.sm, borderBottom: `1px solid ${themeColors.gray100}`, maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.email}</td>
                 <td style={{ padding: themeSpace.sm, borderBottom: `1px solid ${themeColors.gray100}` }}>{row.role}</td>
                 <td style={{ padding: themeSpace.sm, borderBottom: `1px solid ${themeColors.gray100}` }}>{row.status}</td>
                 <td style={{ padding: themeSpace.sm, borderBottom: `1px solid ${themeColors.gray100}`, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.councilName || '-'}</td>
                 <td style={{ padding: themeSpace.sm, borderBottom: `1px solid ${themeColors.gray100}` }}>{row.unitNumber || '-'}</td>
                 <td style={{ padding: themeSpace.sm, borderBottom: `1px solid ${themeColors.gray100}` }}>{row.unitType || '-'}</td>
                 <td style={{ padding: themeSpace.sm, borderBottom: `1px solid ${themeColors.gray100}`, textAlign: 'center' }}>
                   {row.valid ? (
                   <span style={{ color: themeColors.success600 }}>✓</span>
                 ) : (
                 <span style={{ color: themeColors.error500 }} title={row.errors.join(', ')}>✗</span>
                 )}
                 </td>
               </tr>
               ))}
               </tbody>
               </table>
              </div>
            </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: themeSpace.md, justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setShowImportModal(false); setImportFile(null); setImportPreview([]); setImportErrors([]); setImportSuccess(0); }}
                style={{
                  padding: `${themeSpace.sm} ${themeSpace.lg}`,
                  background: themeColors.white,
                  border: `1px solid ${themeColors.gray200}`,
                  borderRadius: themeRadius.sm,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: themeColors.gray600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={processImport}
                disabled={importing || importPreview.filter((r) => r.valid).length === 0}
                style={{
                  padding: `${themeSpace.sm} ${themeSpace.lg}`,
                  background: importing || importPreview.filter((r) => r.valid).length === 0 ? themeColors.gray200 : themeColors.primary600,
                  color: importing || importPreview.filter((r) => r.valid).length === 0 ? themeColors.gray500 : themeColors.white,
                  border: 'none',
                  borderRadius: themeRadius.sm,
                  cursor: importing || importPreview.filter((r) => r.valid).length === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: themeSpace.sm,
                }}
              >
                {importing ? 'Importing...' : `Import ${importPreview.filter((r) => r.valid).length} Users`}
              </button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

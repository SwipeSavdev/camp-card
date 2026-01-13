'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';

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

const themeSpace = { xs: '3px', sm: '8px', md: '16px', lg: '24px', xl: '32px', '2xl': '40px', '3xl': '48px' };
const themeRadius = { sm: '4px', card: '12px' };
const themeShadow = { xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' };

const Icon = ({ name, size = 18, color = 'currentColor' }: { name: string; size?: number; color?: string }) => {
 const icons: { [key: string]: any } = {
 edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
 mail: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>,
 phone: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
 calendar: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
 logout: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
 back: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>,
 mapPin: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
 user: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
 };
 return icons[name] || null;
};

export default function ProfilePage() {
 const { data: session, status } = useSession();
 const router = useRouter();
 const [isEditing, setIsEditing] = useState(false);
 const [profile, setProfile] = useState({
 name: '',
 email: '',
 phone: '',
 address: '',
 city: '',
 state: '',
 zipCode: '',
 role: 'User',
 joinedDate: '',
 status: 'Active',
 profilePicture: '',
 });
 const [saved, setSaved] = useState(false);
 const fileInputRef = useRef<HTMLInputElement>(null);

 useEffect(() => {
 // Load profile data from session if available
 if (session?.user) {
 setProfile({
 name: session.user.name || 'User',
 email: session.user.email || '',
 phone: (session.user as any).phone || '',
 address: (session.user as any).address || '',
 city: (session.user as any).city || '',
 state: (session.user as any).state || '',
 zipCode: (session.user as any).zipCode || '',
 role: (session.user as any).role || 'User',
 joinedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
 status: 'Active',
 profilePicture: (session.user as any).profilePicture || '',
 });
 }
 }, [session]);

 const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (file) {
 const reader = new FileReader();
 reader.onloadend = () => {
 setProfile({ ...profile, profilePicture: reader.result as string });
 };
 reader.readAsDataURL(file);
 }
 };

 const handleSave = async () => {
 try {
   const userId = (session?.user as any)?.id;
   if (!userId) {
     console.error('No user ID found in session');
     return;
   }

   // Split name into firstName and lastName
   const nameParts = profile.name.trim().split(' ');
   const firstName = nameParts[0];
   const lastName = nameParts.slice(1).join(' ') || '';

   const updateData = {
     firstName,
     lastName,
     phoneNumber: profile.phone,
   };

   console.log('[PROFILE] Saving profile update:', updateData);
   await api.updateUser(userId, updateData, session);
   console.log('[PROFILE] Profile updated successfully');

   setSaved(true);
   setIsEditing(false);
   setTimeout(() => setSaved(false), 3000);
 } catch (error) {
   console.error('[PROFILE] Failed to save profile:', error);
   alert('Failed to save profile. Please try again.');
 }
 };

 const handleLogout = () => {
 signOut({ redirect: true, callbackUrl: '/login' });
 };

 if (status === 'loading') return null;

 return (
 <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: themeColors.gray50 }}>
 <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
 {/* Header */}
 <div style={{ padding: themeSpace.xl, backgroundColor: themeColors.white, borderBottom: `1px solid ${themeColors.gray200}`, boxShadow: themeShadow.xs }}>
 <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: themeColors.primary600, marginBottom: themeSpace.md }}>
 <Icon name="back" size={20} />
 </button>
 <h1 style={{ fontSize: '28px', fontWeight: '700', color: themeColors.text, margin: 0 }}>Profile</h1>
 </div>

 {/* Content */}
 <div style={{ flex: 1, padding: themeSpace.xl, overflowY: 'auto' }}>
 {saved && (
 <div style={{ backgroundColor: themeColors.success50, border: `1px solid ${themeColors.success600}`, borderRadius: themeRadius.card, padding: themeSpace.lg, marginBottom: themeSpace.lg, color: themeColors.success600 }}>
 Profile updated successfully!
 </div>
 )}

 {/* Profile Card */}
 <div style={{ backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `1px solid ${themeColors.gray200}`, overflow: 'hidden', boxShadow: themeShadow.sm, maxWidth: '800px' }}>
 {/* Profile Header */}
 <div style={{ padding: themeSpace.xl, background: `linear-gradient(135deg, ${themeColors.primary600} 0%, ${themeColors.info600} 100%)`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
 <div style={{ display: 'flex', gap: themeSpace.lg, alignItems: 'flex-start' }}>
 <div style={{ position: 'relative' }}>
 {isEditing && (
 <button
 onClick={() => fileInputRef.current?.click()}
 style={{
 position: 'absolute',
 bottom: 0,
 right: 0,
 width: '32px',
 height: '32px',
 borderRadius: '50%',
 background: themeColors.white,
 border: 'none',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 cursor: 'pointer',
 boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
 }}
 >
 <Icon name="edit" size={16} color={themeColors.primary600} />
 </button>
 )}
 <input
 ref={fileInputRef}
 type="file"
 accept="image/*"
 onChange={handleProfilePictureChange}
 style={{ display: 'none' }}
 />
 <div
 style={{
 width: '80px',
 height: '80px',
 borderRadius: '50%',
 background: profile.profilePicture ? 'transparent' : themeColors.white,
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 fontWeight: '700',
 fontSize: '32px',
 color: themeColors.primary600,
 overflow: 'hidden',
 backgroundImage: profile.profilePicture ? `url(${profile.profilePicture})` : 'none',
 backgroundSize: 'cover',
 backgroundPosition: 'center',
 }}
 >
 {!profile.profilePicture && (profile.name?.charAt(0).toUpperCase() || 'A')}
 </div>
 </div>
 <div style={{ color: themeColors.white }}>
 {isEditing ? (
 <input
 type="text"
 value={profile.name}
 onChange={(e) => setProfile({ ...profile, name: e.target.value })}
 style={{
 fontSize: '24px',
 fontWeight: '700',
 marginBottom: themeSpace.sm,
 padding: themeSpace.xs,
 border: `1px solid ${themeColors.white}`,
 borderRadius: themeRadius.sm,
 backgroundColor: 'rgba(255,255,255,0.1)',
 color: themeColors.white,
 width: '100%',
 }}
 placeholder="Enter your name"
 />
 ) : (
 <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', marginBottom: themeSpace.sm }}>{profile.name}</h2>
 )}
 <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>{profile.role}</p>
 </div>
 </div>
 <button
 onClick={() => setIsEditing(!isEditing)}
 style={{
 background: themeColors.white,
 color: themeColors.primary600,
 border: 'none',
 padding: `${themeSpace.sm} ${themeSpace.md}`,
 borderRadius: themeRadius.sm,
 cursor: 'pointer',
 fontSize: '14px',
 fontWeight: '500',
 display: 'flex',
 gap: themeSpace.sm,
 alignItems: 'center',
 }}
 >
 <Icon name="edit" size={16} color={themeColors.primary600} />
 {isEditing ? 'Cancel' : 'Edit'}
 </button>
 </div>

 {/* Profile Details */}
 <div style={{ padding: themeSpace.xl }}>
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: themeSpace.xl }}>
 {/* Contact Info - Full Width */}
 <div style={{ gridColumn: 'span 2' }}>
 <h3 style={{ fontSize: '14px', fontWeight: '600', color: themeColors.gray600, margin: '0 0 16px 0', textTransform: 'uppercase' }}>Contact Information</h3>

 {/* 2x2 Grid for Contact Fields */}
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: themeSpace.lg, marginBottom: themeSpace.lg }}>
 {/* Email */}
 <div>
 <label style={{ fontSize: '12px', color: themeColors.gray600, fontWeight: '500', display: 'block', marginBottom: themeSpace.xs }}>Email</label>
 {isEditing ? (
 <input
 type="email"
 value={profile.email}
 onChange={(e) => setProfile({ ...profile, email: e.target.value })}
 style={{
 width: '100%',
 padding: themeSpace.md,
 border: `1px solid ${themeColors.gray200}`,
 borderRadius: themeRadius.sm,
 fontSize: '14px',
 }}
 />
 ) : (
 <p style={{ margin: 0, fontSize: '14px', color: themeColors.text, display: 'flex', gap: themeSpace.sm, alignItems: 'center' }}>
 <Icon name="mail" size={16} color={themeColors.primary600} />
 {profile.email}
 </p>
 )}
 </div>

 {/* Phone */}
 <div>
 <label style={{ fontSize: '12px', color: themeColors.gray600, fontWeight: '500', display: 'block', marginBottom: themeSpace.xs }}>Phone</label>
 {isEditing ? (
 <input
 type="tel"
 value={profile.phone}
 onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
 placeholder="(555) 123-4567"
 style={{
 width: '100%',
 padding: themeSpace.md,
 border: `1px solid ${themeColors.gray200}`,
 borderRadius: themeRadius.sm,
 fontSize: '14px',
 }}
 />
 ) : (
 <p style={{ margin: 0, fontSize: '14px', color: profile.phone ? themeColors.text : themeColors.gray500, display: 'flex', gap: themeSpace.sm, alignItems: 'center' }}>
 <Icon name="phone" size={16} color={themeColors.primary600} />
 {profile.phone || 'Not provided'}
 </p>
 )}
 </div>

 {/* Address */}
 <div>
 <label style={{ fontSize: '12px', color: themeColors.gray600, fontWeight: '500', display: 'block', marginBottom: themeSpace.xs }}>Street Address</label>
 {isEditing ? (
 <input
 type="text"
 value={profile.address}
 onChange={(e) => setProfile({ ...profile, address: e.target.value })}
 placeholder="123 Main St"
 style={{
 width: '100%',
 padding: themeSpace.md,
 border: `1px solid ${themeColors.gray200}`,
 borderRadius: themeRadius.sm,
 fontSize: '14px',
 }}
 />
 ) : (
 <p style={{ margin: 0, fontSize: '14px', color: profile.address ? themeColors.text : themeColors.gray500, display: 'flex', gap: themeSpace.sm, alignItems: 'center' }}>
 <Icon name="mapPin" size={16} color={themeColors.primary600} />
 {profile.address || 'Not provided'}
 </p>
 )}
 </div>

 {/* City */}
 <div>
 <label style={{ fontSize: '12px', color: themeColors.gray600, fontWeight: '500', display: 'block', marginBottom: themeSpace.xs }}>City</label>
 {isEditing ? (
 <input
 type="text"
 value={profile.city}
 onChange={(e) => setProfile({ ...profile, city: e.target.value })}
 placeholder="San Francisco"
 style={{
 width: '100%',
 padding: themeSpace.md,
 border: `1px solid ${themeColors.gray200}`,
 borderRadius: themeRadius.sm,
 fontSize: '14px',
 }}
 />
 ) : (
 <p style={{ margin: 0, fontSize: '14px', color: profile.city ? themeColors.text : themeColors.gray500 }}>
 {profile.city || 'Not provided'}
 </p>
 )}
 </div>

 {/* State */}
 <div>
 <label style={{ fontSize: '12px', color: themeColors.gray600, fontWeight: '500', display: 'block', marginBottom: themeSpace.xs }}>State</label>
 {isEditing ? (
 <input
 type="text"
 value={profile.state}
 onChange={(e) => setProfile({ ...profile, state: e.target.value })}
 placeholder="CA"
 maxLength={2}
 style={{
 width: '100%',
 padding: themeSpace.md,
 border: `1px solid ${themeColors.gray200}`,
 borderRadius: themeRadius.sm,
 fontSize: '14px',
 }}
 />
 ) : (
 <p style={{ margin: 0, fontSize: '14px', color: profile.state ? themeColors.text : themeColors.gray500 }}>
 {profile.state || 'Not provided'}
 </p>
 )}
 </div>

 {/* Zip Code */}
 <div>
 <label style={{ fontSize: '12px', color: themeColors.gray600, fontWeight: '500', display: 'block', marginBottom: themeSpace.xs }}>Zip Code</label>
 {isEditing ? (
 <input
 type="text"
 value={profile.zipCode}
 onChange={(e) => setProfile({ ...profile, zipCode: e.target.value })}
 placeholder="94102"
 style={{
 width: '100%',
 padding: themeSpace.md,
 border: `1px solid ${themeColors.gray200}`,
 borderRadius: themeRadius.sm,
 fontSize: '14px',
 }}
 />
 ) : (
 <p style={{ margin: 0, fontSize: '14px', color: profile.zipCode ? themeColors.text : themeColors.gray500 }}>
 {profile.zipCode || 'Not provided'}
 </p>
 )}
 </div>
 </div>
 </div>

 {/* Account Info */}
 <div>
 <h3 style={{ fontSize: '14px', fontWeight: '600', color: themeColors.gray600, margin: '0 0 16px 0', textTransform: 'uppercase' }}>Account</h3>
 <div style={{ display: 'flex', flexDirection: 'column', gap: themeSpace.lg }}>
 <div>
 <label style={{ fontSize: '12px', color: themeColors.gray600, fontWeight: '500', display: 'block', marginBottom: themeSpace.xs }}>Role</label>
 <p style={{ margin: 0, fontSize: '14px', color: themeColors.text }}>
 <span style={{ padding: `${themeSpace.xs} ${themeSpace.sm}`, backgroundColor: themeColors.primary50, color: themeColors.primary600, borderRadius: themeRadius.sm, fontSize: '12px', fontWeight: '500', display: 'inline-block' }}>
 {profile.role}
 </span>
 </p>
 </div>
 <div>
 <label style={{ fontSize: '12px', color: themeColors.gray600, fontWeight: '500', display: 'block', marginBottom: themeSpace.xs }}>Joined</label>
 <p style={{ margin: 0, fontSize: '14px', color: themeColors.text, display: 'flex', gap: themeSpace.sm, alignItems: 'center' }}>
 <Icon name="calendar" size={16} color={themeColors.primary600} />
 {profile.joinedDate}
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* Action Buttons */}
 <div style={{ marginTop: themeSpace.xl, paddingTop: themeSpace.xl, borderTop: `1px solid ${themeColors.gray200}`, display: 'flex', gap: themeSpace.md }}>
 {isEditing && (
 <button
 onClick={handleSave}
 style={{
 padding: `${themeSpace.sm} ${themeSpace.lg}`,
 backgroundColor: themeColors.primary600,
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
 )}
 <button
 onClick={handleLogout}
 style={{
 padding: `${themeSpace.sm} ${themeSpace.lg}`,
 backgroundColor: '#fee2e2',
 color: themeColors.error500,
 border: 'none',
 borderRadius: themeRadius.sm,
 cursor: 'pointer',
 fontSize: '14px',
 fontWeight: '500',
 display: 'flex',
 gap: themeSpace.sm,
 alignItems: 'center',
 }}
 >
 <Icon name="logout" size={16} color={themeColors.error500} />
 Logout
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}

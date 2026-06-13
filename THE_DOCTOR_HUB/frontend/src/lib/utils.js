import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${minutes} ${ampm}`;
};

export const formatCurrency = (amount, currency = 'PKR') => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
  }).format(amount).replace('PKR', 'Rs.');
};

export const getInitials = (firstName, lastName) => {
  return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase();
};

export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-700',
    payment_pending: 'bg-orange-100 text-orange-700',
    payment_uploaded: 'bg-blue-100 text-blue-700',
    payment_verified: 'bg-cyan-100 text-cyan-700',
    confirmed: 'bg-green-100 text-green-700',
    in_progress: 'bg-purple-100 text-purple-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
    rejected: 'bg-red-100 text-red-700',
    no_show: 'bg-gray-100 text-gray-700',
    verified: 'bg-green-100 text-green-700',
    uploaded: 'bg-blue-100 text-blue-700',
    refunded: 'bg-purple-100 text-purple-700',
    active: 'bg-green-100 text-green-700',
    suspended: 'bg-red-100 text-red-700',
    approved: 'bg-green-100 text-green-700',
    pending_approval: 'bg-yellow-100 text-yellow-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

export const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    payment_pending: 'Payment Required',
    payment_uploaded: 'Payment Uploaded',
    payment_verified: 'Payment Verified',
    confirmed: 'Confirmed',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    rejected: 'Rejected',
    no_show: 'No Show',
    verified: 'Verified',
    uploaded: 'Uploaded',
    refunded: 'Refunded',
  };
  return labels[status] || status;
};

export const timeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diff = now - past;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
};

export const truncate = (str, length = 100) => {
  if (!str) return '';
  return str.length > length ? `${str.substring(0, length)}...` : str;
};

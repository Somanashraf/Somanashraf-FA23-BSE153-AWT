import Badge from '../ui/Badge';
import { getStatusColor, getStatusLabel } from '../../lib/utils';

const statusVariantMap = {
  pending: 'warning', payment_pending: 'warning', payment_uploaded: 'info',
  payment_verified: 'info', confirmed: 'success', in_progress: 'purple',
  completed: 'success', cancelled: 'danger', rejected: 'danger',
  no_show: 'default', verified: 'success', uploaded: 'info', refunded: 'purple',
};

const AppointmentStatusBadge = ({ status }) => (
  <Badge variant={statusVariantMap[status] || 'default'} dot>
    {getStatusLabel(status)}
  </Badge>
);
export default AppointmentStatusBadge;

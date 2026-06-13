import AuditLog from '../models/AuditLog.js';
import { logger } from '../utils/logger.js';

export const createAuditLog = async ({
  userId,
  action,
  resource,
  resourceId,
  details,
  ipAddress,
  userAgent,
  status = 'success',
  errorMessage,
  duration,
}) => {
  try {
    await AuditLog.create({
      user: userId,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
      status,
      errorMessage,
      duration,
    });
  } catch (err) {
    logger.error(`Audit log creation failed: ${err.message}`);
  }
};

export const auditMiddleware = (action, resource) => {
  return (req, res, next) => {
    const start = Date.now();
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      const duration = Date.now() - start;
      const status = res.statusCode >= 400 ? 'failure' : 'success';
      createAuditLog({
        userId: req.user?._id,
        action,
        resource,
        resourceId: req.params?.id,
        details: { method: req.method, path: req.path, query: req.query },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status,
        duration,
      });
      return originalJson(data);
    };
    next();
  };
};

const { query } = require('../config/db');

class AnalyticsRepository {
  summary() {
    return Promise.all([
      query('SELECT COUNT(*) AS total FROM appointments WHERE DATE(created_at) = CURDATE()'),
      query('SELECT COUNT(*) AS total FROM appointments WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())'),
      query('SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = "VERIFIED"'),
      query('SELECT COUNT(*) AS total FROM prescriptions')
    ]).then(([daily, monthly, revenue, prescriptions]) => ({
      dailyAppointments: daily[0].total,
      monthlyAppointments: monthly[0].total,
      revenue: revenue[0].total,
      prescriptions: prescriptions[0].total
    }));
  }

  revenueByMonth() {
    return query(`SELECT DATE_FORMAT(created_at, '%b') AS label, SUM(amount) AS value FROM payments WHERE status = 'VERIFIED' GROUP BY YEAR(created_at), MONTH(created_at), label ORDER BY MIN(created_at)`);
  }

  diseaseSearches() {
    return query('SELECT disease_name AS label, COUNT(*) AS value FROM search_logs GROUP BY disease_name ORDER BY value DESC LIMIT 8');
  }

  doctorPerformance() {
    return query(`SELECT u.full_name AS label, COUNT(a.id) AS appointments, AVG(d.rating) AS rating FROM doctors d JOIN users u ON u.id = d.user_id LEFT JOIN appointments a ON a.doctor_id = d.id GROUP BY d.id, u.full_name ORDER BY appointments DESC LIMIT 8`);
  }
}

module.exports = new AnalyticsRepository();

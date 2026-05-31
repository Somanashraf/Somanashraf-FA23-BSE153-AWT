const analyticsRepository = require('../repositories/analytics.repository');

class AnalyticsService {
  async dashboard() {
    const [summary, revenue, diseases, doctors] = await Promise.all([
      analyticsRepository.summary(),
      analyticsRepository.revenueByMonth(),
      analyticsRepository.diseaseSearches(),
      analyticsRepository.doctorPerformance()
    ]);
    return { summary, revenue, diseases, doctors };
  }
}

module.exports = new AnalyticsService();

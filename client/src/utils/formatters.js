/**
 * UI Data formatting utilities
 */
const formatters = {
  formatDuration(ms) {
    if (!ms && ms !== 0) return '0 ms';
    return ms < 1 ? '<1 ms' : `${ms} ms`;
  },

  formatNumber(num) {
    if (!num) return '0';
    return new Intl.NumberFormat().format(num);
  },

  formatDate(isoString) {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  },
};

window.formatters = formatters;

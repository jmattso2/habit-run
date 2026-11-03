// Local-calendar date helpers. Day keys are "YYYY-MM-DD" in the phone's local time, never UTC.
const Dates = (() => {
  const GRACE_HOUR = 12; // yesterday stays editable until noon today

  function toKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function fromKey(key) {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function todayKey(now = new Date()) {
    return toKey(now);
  }

  function yesterdayKey(now = new Date()) {
    return toKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  }

  function inGracePeriod(now = new Date()) {
    return now.getHours() < GRACE_HOUR;
  }

  function isEditable(key, now = new Date()) {
    return key === todayKey(now) || (key === yesterdayKey(now) && inGracePeriod(now));
  }

  function format(key) {
    return fromKey(key).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  }

  return { toKey, fromKey, todayKey, yesterdayKey, inGracePeriod, isEditable, format };
})();

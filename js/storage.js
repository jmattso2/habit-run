// Persists the whole app as one JSON object in localStorage.
const Storage = (() => {
  const KEY = 'habit-run';
  const SCHEMA_VERSION = 1;

  const DEFAULT_HABITS = [
    { id: 'workout', label: 'Worked out 30+ minutes', category: 'exercise', gold: 10, archived: false },
    { id: 'reading', label: 'Read 30+ pages', category: 'reading', gold: 10, archived: false },
    { id: 'water', label: 'Hit my water goal (8 cups)', category: 'food', gold: 5, archived: false },
    { id: 'whole_foods', label: 'Ate mostly whole foods, no processed snacks or fast food', category: 'food', gold: 5, archived: false },
    { id: 'fiber', label: 'Had a high-fiber food at 2+ meals', category: 'food', gold: 5, archived: false },
  ];

  function defaults() {
    return {
      schemaVersion: SCHEMA_VERSION,
      habits: DEFAULT_HABITS.map((h) => ({ ...h })),
      log: {},
      plans: {},
      settings: { bossTargets: { exercise: 5, reading: 5, food: 15 } },
    };
  }

  // Fill in anything missing so older or partial saves still load.
  // Future schema migrations go here, keyed on raw.schemaVersion.
  function normalize(raw) {
    const base = defaults();
    const data = { ...base, ...raw };
    if (!Array.isArray(data.habits)) data.habits = base.habits;
    if (!data.log || typeof data.log !== 'object') data.log = {};
    if (!data.plans || typeof data.plans !== 'object') data.plans = {};
    data.settings = { ...base.settings, ...data.settings };
    data.settings.bossTargets = { ...base.settings.bossTargets, ...data.settings.bossTargets };
    data.schemaVersion = SCHEMA_VERSION;
    return data;
  }

  // Returns { data, warning }. A corrupt save is copied aside rather than overwritten.
  function load() {
    let text;
    try {
      text = localStorage.getItem(KEY);
    } catch {
      return { data: defaults(), warning: "Storage is blocked, so check-ins won't be saved." };
    }
    if (text === null) return { data: defaults(), warning: null };

    try {
      const raw = JSON.parse(text);
      if (!raw || typeof raw !== 'object') throw new Error('not an object');
      return { data: normalize(raw), warning: null };
    } catch {
      try { localStorage.setItem(`${KEY}-corrupt-${Date.now()}`, text); } catch { /* nothing more to do */ }
      return { data: defaults(), warning: 'Saved data was unreadable. A backup was kept and defaults loaded.' };
    }
  }

  function save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }

  function clear() {
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  }

  return { load, save, clear, defaults };
})();

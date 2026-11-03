// In-memory app state and the actions that change it. Every change saves immediately.
const State = (() => {
  const CATEGORIES = {
    exercise: 'Exercise',
    reading: 'Reading',
    food: 'Food',
    other: 'Other',
  };

  let data;

  // Returns a warning message if saved data couldn't be loaded cleanly.
  function init() {
    const result = Storage.load();
    data = result.data;
    return result.warning;
  }

  function persist() {
    if (!Storage.save(data)) toast("Couldn't save. Storage may be full or blocked.");
  }

  function habit(id) {
    return data.habits.find((h) => h.id === id);
  }

  function activeHabits() {
    return data.habits.filter((h) => !h.archived);
  }

  function archivedHabits() {
    return data.habits.filter((h) => h.archived);
  }

  function isDone(dayKey, id) {
    return (data.log[dayKey] || []).includes(id);
  }

  // Returns the habit's new checked state, or null if that day can no longer be edited.
  function toggle(dayKey, id) {
    if (!Dates.isEditable(dayKey)) return null;
    const done = new Set(data.log[dayKey] || []);
    if (done.has(id)) done.delete(id);
    else done.add(id);
    if (done.size) data.log[dayKey] = [...done];
    else delete data.log[dayKey];
    persist();
    return done.has(id);
  }

  // Plans for days before dayKey, newest first.
  function recentPlans(dayKey, count = 4) {
    return Object.keys(data.plans)
      .filter((k) => k < dayKey)
      .sort()
      .reverse()
      .slice(0, count)
      .map((k) => data.plans[k]);
  }

  // Today's plan is created the first time it's viewed and then stays fixed.
  // Past days are never back-filled.
  function planFor(dayKey) {
    if (!data.plans[dayKey] && dayKey === Dates.todayKey()) {
      data.plans[dayKey] = Plan.generate(recentPlans(dayKey));
      persist();
    }
    return data.plans[dayKey] || null;
  }

  function swapPlan(dayKey, slot) {
    if (!data.plans[dayKey] || dayKey !== Dates.todayKey()) return;
    data.plans[dayKey] = Plan.swap(data.plans[dayKey], slot, recentPlans(dayKey));
    persist();
  }

  function uniqueId(label) {
    const base = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'habit';
    let id = base;
    for (let n = 2; habit(id); n++) id = `${base}_${n}`;
    return id;
  }

  function addHabit({ label, category, gold }) {
    const h = { id: uniqueId(label), label, category, gold, archived: false };
    data.habits.push(h);
    persist();
    return h;
  }

  // Ids never change, so renaming or archiving keeps the habit's history.
  function updateHabit(id, patch) {
    const h = habit(id);
    if (!h) return;
    Object.assign(h, patch);
    persist();
  }

  function setArchived(id, archived) {
    updateHabit(id, { archived });
  }

  function reset() {
    Storage.clear();
    data = Storage.defaults();
    persist();
  }

  return {
    CATEGORIES, init, habit, activeHabits, archivedHabits, isDone, toggle,
    planFor, swapPlan, addHabit, updateHabit, setArchived, reset,
  };
})();

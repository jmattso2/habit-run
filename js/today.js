// Today screen: one big toggle per active habit for the selected day.
const Today = (() => {
  const el = document.getElementById('today');
  let day = 'today'; // or 'yesterday', only offered during the grace period
  let shownKey;      // the day the buttons on screen belong to

  function habitButton(h, key) {
    return `
      <li>
        <button class="habit cat-${esc(h.category)}" data-id="${esc(h.id)}" aria-pressed="${State.isDone(key, h.id)}">
          <span class="check" aria-hidden="true"></span>
          <span class="habit-text">
            <span class="habit-label">${esc(h.label)}</span>
            <span class="habit-cat">${esc(State.CATEGORIES[h.category] || 'Other')}</span>
          </span>
        </button>
      </li>`;
  }

  function render() {
    const grace = Dates.inGracePeriod();
    if (!grace) day = 'today';
    shownKey = day === 'today' ? Dates.todayKey() : Dates.yesterdayKey();
    const habits = State.activeHabits();

    el.innerHTML = `
      <header class="screen-head">
        <p class="eyebrow">${esc(Dates.format(shownKey))}</p>
        <h1>${day === 'today' ? 'Today' : 'Yesterday'}</h1>
      </header>
      ${grace ? `
        <div class="segmented" role="group" aria-label="Day">
          <button type="button" data-day="today" aria-pressed="${day === 'today'}">Today</button>
          <button type="button" data-day="yesterday" aria-pressed="${day === 'yesterday'}">Yesterday</button>
        </div>
        ${day === 'yesterday' ? '<p class="note">You can fix yesterday until noon.</p>' : ''}
      ` : ''}
      ${habits.length ? `
        <div class="progress">
          <div class="progress-text"><span class="progress-count"></span><span class="progress-perfect"></span></div>
          <div class="progress-bar"><div class="progress-fill"></div></div>
        </div>
        <ul class="habit-list">${habits.map((h) => habitButton(h, shownKey)).join('')}</ul>
      ` : `
        <p class="empty">No habits yet. <a href="#settings">Add one in Settings</a>.</p>
      `}`;

    updateProgress();
  }

  function updateProgress() {
    const habits = State.activeHabits();
    if (!habits.length) return;
    const done = habits.filter((h) => State.isDone(shownKey, h.id)).length;
    el.querySelector('.progress-count').textContent = `${done} of ${habits.length} done`;
    el.querySelector('.progress-perfect').textContent = done === habits.length ? 'Perfect day!' : '';
    el.querySelector('.progress-fill').style.width = `${(done / habits.length) * 100}%`;
  }

  el.addEventListener('click', (e) => {
    const dayButton = e.target.closest('[data-day]');
    if (dayButton) {
      day = dayButton.dataset.day;
      render();
      return;
    }

    const button = e.target.closest('.habit');
    if (!button) return;
    const done = State.toggle(shownKey, button.dataset.id);
    if (done === null) {
      // The screen was left open past midnight or noon.
      toast('That day is locked now.');
      render();
      return;
    }
    // Update in place rather than re-rendering so the tap feels instant.
    button.setAttribute('aria-pressed', done);
    if (done) navigator.vibrate?.(10);
    updateProgress();
  });

  return { render };
})();

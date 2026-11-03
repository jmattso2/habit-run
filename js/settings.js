// Settings screen: add, edit, archive and restore habits. Edits save as soon as a field changes.
const Settings = (() => {
  const el = document.getElementById('settings');

  function clampGold(value) {
    return Math.min(100, Math.max(0, Math.round(Number(value) || 0)));
  }

  function categorySelect(selected) {
    const options = Object.entries(State.CATEGORIES)
      .map(([value, label]) => `<option value="${value}"${value === selected ? ' selected' : ''}>${label}</option>`)
      .join('');
    return `<select name="category">${options}</select>`;
  }

  function habitFields(h) {
    return `
      <label class="field">
        <span>Daily check-in</span>
        <input name="label" value="${esc(h.label)}" maxlength="80" required autocomplete="off"${h.label ? '' : ' placeholder="e.g. Stretched for 10 minutes"'}>
      </label>
      <div class="field-row">
        <label class="field"><span>Category</span>${categorySelect(h.category)}</label>
        <label class="field"><span>Gold</span><input name="gold" type="number" inputmode="numeric" min="0" max="100" value="${h.gold}"></label>
      </div>`;
  }

  function editRow(h) {
    return `
      <li class="card edit-row cat-${esc(h.category)}" data-id="${esc(h.id)}">
        ${habitFields(h)}
        <button type="button" class="btn btn-ghost" data-action="archive">Archive</button>
      </li>`;
  }

  function archivedRow(h) {
    return `
      <li data-id="${esc(h.id)}">
        <span>${esc(h.label)}</span>
        <button type="button" class="btn btn-ghost" data-action="restore">Restore</button>
      </li>`;
  }

  function render() {
    const active = State.activeHabits();
    const archived = State.archivedHabits();

    el.innerHTML = `
      <header class="screen-head">
        <h1>Settings</h1>
        <p class="sub">Your daily habits. Changes save automatically.</p>
      </header>

      <ul class="edit-list">${active.map(editRow).join('')}</ul>

      <form class="card add-form">
        <h2>Add a habit</h2>
        ${habitFields({ label: '', category: 'other', gold: 5 })}
        <button type="submit" class="btn btn-primary">Add habit</button>
      </form>

      ${archived.length ? `
        <details class="card archived">
          <summary>Archived (${archived.length})</summary>
          <ul>${archived.map(archivedRow).join('')}</ul>
        </details>
      ` : ''}

      <section class="card danger">
        <h2>Reset</h2>
        <p>Deletes all habits and check-ins on this phone and restores the defaults.</p>
        <button type="button" class="btn btn-danger" data-action="reset">Reset all data</button>
      </section>`;
  }

  // Field edits on existing habits. Handled in place so focus isn't lost to a re-render.
  el.addEventListener('change', (e) => {
    const row = e.target.closest('.edit-row');
    if (!row) return;
    const id = row.dataset.id;
    const input = e.target;

    if (input.name === 'label') {
      const label = input.value.trim();
      if (!label) {
        input.value = State.habit(id).label;
        toast('A habit needs a name.');
        return;
      }
      input.value = label;
      State.updateHabit(id, { label });
    } else if (input.name === 'category') {
      row.className = `card edit-row cat-${input.value}`;
      State.updateHabit(id, { category: input.value });
    } else if (input.name === 'gold') {
      const gold = clampGold(input.value);
      input.value = gold;
      State.updateHabit(id, { gold });
    }
    toast('Saved');
  });

  el.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const label = form.elements.label.value.trim();
    if (!label) return;
    State.addHabit({
      label,
      category: form.elements.category.value,
      gold: clampGold(form.elements.gold.value),
    });
    render();
    toast(`Added "${label}"`);
  });

  el.addEventListener('click', (e) => {
    const button = e.target.closest('[data-action]');
    if (!button) return;
    const id = button.closest('[data-id]')?.dataset.id;

    switch (button.dataset.action) {
      case 'archive':
        State.setArchived(id, true);
        render();
        toast('Archived. Its history is kept.');
        break;
      case 'restore':
        State.setArchived(id, false);
        render();
        toast('Restored');
        break;
      case 'reset':
        if (confirm("Delete all habits and check-ins on this phone? This can't be undone.")) {
          State.reset();
          render();
          toast('Reset to defaults');
        }
        break;
    }
  });

  return { render };
})();

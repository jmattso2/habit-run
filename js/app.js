// Boot, routing between screens, and app lifecycle.
(() => {
  const views = { today: Today, settings: Settings };

  function currentRoute() {
    const route = location.hash.slice(1);
    return views[route] ? route : 'today';
  }

  function show() {
    const route = currentRoute();
    for (const name of Object.keys(views)) {
      document.getElementById(name).hidden = name !== route;
    }
    document.querySelectorAll('.tabbar a').forEach((a) => {
      a.setAttribute('aria-current', a.dataset.route === route ? 'page' : 'false');
    });
    views[route].render();
    window.scrollTo(0, 0);
  }

  const warning = State.init();
  if (warning) toast(warning);

  window.addEventListener('hashchange', show);

  // Coming back to the app may cross midnight or the noon grace cutoff, so redraw Today.
  // Settings is left alone so an open text field isn't wiped mid-edit.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && currentRoute() === 'today') Today.render();
  });

  show();

  // Ask the browser not to evict our data under storage pressure.
  navigator.storage?.persist?.();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
  }
})();

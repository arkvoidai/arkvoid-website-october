(() => {
  'use strict';
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#primary-nav');
  const closeMenu = () => {
    if (!menu || !nav) return;
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Open navigation');
    nav.classList.remove('is-open');
  };
  if (menu && nav) {
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      nav.classList.toggle('is-open', open);
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
    document.addEventListener('click', event => {
      if (nav.classList.contains('is-open') && !nav.contains(event.target) && !menu.contains(event.target)) closeMenu();
    });
  }
  const reveal = [...document.querySelectorAll('.reveal')];
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries, obs) => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('revealed'); obs.unobserve(entry.target); }
    }), {threshold: .12, rootMargin: '0px 0px -24px 0px'});
    reveal.forEach(item => observer.observe(item));
  } else reveal.forEach(item => item.classList.add('revealed'));

  const stories = {
    meet: {stage:'DAY 01 / THE BRIDGE', heading:'You help someone. It matters later.', body:"You meet Lian on a stone bridge and help her recover a letter. The event is saved as part of the world's history, not left behind in a chat.", memory:'You met Lian. She has the letter. She knows you helped.'},
    away: {stage:'DAY 02 / AFTER YOU LEAVE', heading:'The world keeps moving.', body:'While you are away, Lian follows her own plans. Quiet routines can continue under simple rules, without asking a large AI model to reason about every passing minute.', memory:"Lian's plans continue. The letter stays with her. Nothing silently erases yesterday."},
    return: {stage:'DAY 03 / YOUR RETURN', heading:'You are not a stranger again.', body:'When you return, Lian can remember the letter and the help you gave. Her next response can reflect that shared history.', memory:'Your meeting still matters. Her next response can reflect it.'}
  };
  const tabs = [...document.querySelectorAll('[data-story]')];
  const fields = {
    stage: document.querySelector('#story-stage'),
    heading: document.querySelector('#story-heading'),
    body: document.querySelector('#story-body'),
    memory: document.querySelector('#story-memory')
  };
  function showStory(key) {
    const story = stories[key];
    if (!story) return;
    tabs.forEach(tab => {
      const active = tab.dataset.story === key;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    Object.keys(fields).forEach(field => { if (fields[field]) fields[field].textContent = story[field]; });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => showStory(tab.dataset.story));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      tabs[next].focus(); showStory(tabs[next].dataset.story);
    });
  });
  if (tabs.length) showStory('meet');
})();
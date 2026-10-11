(() => {
  const scene = document.getElementById('openingMobile');
  const curtain = document.getElementById('curtainStage');
  const enter = document.getElementById('curtainOpenButton');
  const layer = document.querySelector('.mobile-layer');
  const sun = document.getElementById('dropdownSun');
  const callout = document.getElementById('dontTouchCallout');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let opened = false;
  let finishTimer;
  const pieces = [...document.querySelectorAll('.hanger')].map((el, index) => ({
    el, arm: el.querySelector('.swing-arm'),
    amplitude: el.classList.contains('cloud') ? .55 : 1.1,
    speed: .0008 + index * .00004, phase: index * 1.7, push: 0, center: 0,
  }));
  let velocity = 0;
  let lastX;
  let pointerX = innerWidth / 2;
  let frame;

  function finishOpening() {
    clearTimeout(finishTimer);
    curtain.hidden = true;
    enter.disabled = true;
  }
  function openStage() {
    if (opened) return;
    opened = true;
    scene.classList.add('mobile-ready');
    layer.inert = false;
    enter.disabled = true;
    curtain.classList.add('is-open');
    if (motion.matches) finishOpening();
    else finishTimer = setTimeout(finishOpening, 2150);
    sun.focus({preventScroll:true});
  }
  layer.inert = true;
  enter.addEventListener('click', openStage, {once:true});
  curtain.addEventListener('transitionend', event => {
    if (opened && event.target.classList.contains('curtain-panel') && event.propertyName === 'transform') finishOpening();
  });
  if (motion.matches) openStage();

  let sunTimer;
  let popupTimer;
  let sunTaps = 0;
  sun.addEventListener('click', () => {
    const img = sun.querySelector('img');
    clearTimeout(sunTimer);
    img.src = img.dataset.angrySrc;
    sun.classList.add('is-angry');
    sun.setAttribute('aria-pressed','true');
    sun.setAttribute('aria-label','The sun is angry');
    if (++sunTaps >= 2 && callout) {
      clearTimeout(popupTimer);
      callout.classList.remove('is-showing');
      void callout.offsetWidth;
      callout.classList.add('is-showing');
      popupTimer = setTimeout(() => callout.classList.remove('is-showing'), 1900);
    }
    sunTimer = setTimeout(() => {
      img.src = img.dataset.smileSrc;
      sun.classList.remove('is-angry');
      sun.setAttribute('aria-pressed','false');
      sun.setAttribute('aria-label','Make the sun angry');
    }, 600);
  });

  function measure() {
    pieces.forEach(piece => {
      const rect = piece.el.getBoundingClientRect();
      piece.center = rect.left + rect.width / 2;
    });
    lastX = undefined;
  }
  measure();
  addEventListener('resize', measure, {passive:true});
  addEventListener('pointermove', event => {
    pointerX = event.clientX;
    velocity = lastX === undefined ? 0 : Math.max(-60,Math.min(60,pointerX-lastX));
    lastX = pointerX;
    if (!opened || motion.matches) return;
    for (const piece of pieces) {
      if (Math.abs(pointerX-piece.center) > 40 || event.clientY > innerHeight*.55) continue;
      if (performance.now()-(piece.lastWiggle || 0) < 700) continue;
      piece.lastWiggle = performance.now();
      piece.el.classList.remove('string-wiggle');
      void piece.el.offsetWidth;
      piece.el.classList.add('string-wiggle');
    }
  }, {passive:true});

  function animate(time) {
    if (motion.matches || document.hidden) {frame = undefined; return;}
    if (opened) pieces.forEach(piece => {
      const proximity = Math.max(0,1-Math.abs(pointerX-piece.center)/280);
      const force = velocity*.015*proximity;
      piece.push += (force-piece.push)*.06;
      const angle = Math.sin(time*piece.speed+piece.phase)*piece.amplitude+piece.push;
      piece.arm.style.transform = `rotate(${angle.toFixed(3)}deg)`;
    });
    velocity *= .87;
    frame = requestAnimationFrame(animate);
  }
  function resume() {
    if (motion.matches) {
      cancelAnimationFrame(frame); frame = undefined;
      pieces.forEach(piece => piece.arm.style.removeProperty('transform'));
      if (!opened) openStage(); else finishOpening();
    } else if (!document.hidden && frame === undefined) frame = requestAnimationFrame(animate);
  }
  motion.addEventListener('change',resume);
  document.addEventListener('visibilitychange',resume);
  resume();
})();


  // Platform logo set (SVG defs reused, duplicated x2 for seamless marquee loop)
  const platformLogos = `
    <div class="platform-logo"><svg viewBox="0 0 24 24" fill="currentColor" style="color:#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>Spotify</div>
    <div class="platform-logo"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.54 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>Apple Music</div>
    <div class="platform-logo"><svg viewBox="0 0 24 24" fill="currentColor" style="color:#FF0000"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>YouTube</div>
    <div class="platform-logo"><svg viewBox="0 0 24 24" fill="currentColor" style="color:#00A8E1"><path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.7-3.182v.685zm3.186 7.705c-.209.189-.512.201-.745.076-1.048-.872-1.236-1.276-1.814-2.106-1.734 1.767-2.962 2.297-5.209 2.297-2.66 0-4.731-1.641-4.731-4.925 0-2.565 1.391-4.309 3.37-5.164 1.715-.754 4.11-.891 5.942-1.099v-.41c0-.753.06-1.642-.384-2.294-.384-.578-1.124-.816-1.774-.816-1.205 0-2.277.618-2.54 1.897-.054.285-.261.567-.547.582l-3.065-.333c-.259-.058-.548-.266-.472-.661C5.769 1.851 8.976.5 11.838.5c1.532 0 3.534.407 4.744 1.567 1.534 1.431 1.387 3.342 1.387 5.422v4.908c0 1.476.612 2.126 1.189 2.923.204.285.249.626-.01.839l-2.004 1.636zm3.605 1.601C18.948 21.512 15.928 23 13.358 23c-3.484 0-6.614-1.288-8.987-3.43-.186-.169-.02-.399.204-.268 2.559 1.491 5.715 2.387 8.983 2.387 2.205 0 4.629-.457 6.859-1.4.337-.144.619.221.332.497zm.948-1.492c-.256-.328-1.685-.155-2.328-.078-.195.024-.225-.146-.049-.269 1.139-.8 3.009-.569 3.227-.301.219.269-.057 2.14-1.128 3.031-.164.137-.32.064-.247-.117.241-.601.78-1.938.525-2.266z"/></svg>Amazon Music</div>
    <div class="platform-logo"><svg viewBox="0 0 24 24" fill="currentColor" style="color:#FF0092"><path d="M18.944 16.107H24v1.94h-5.056zM18.944 13.025H24v1.94h-5.056zM18.944 9.943H24v1.94h-5.056zM18.944 19.19H24v1.939h-5.056zM.005 19.19h5.052v1.939H.005zM6.47 19.19h5.052v1.939H6.47zM12.944 19.19H18v1.939h-5.056zM12.944 16.107H18v1.94h-5.056zM6.47 16.107h5.052v1.94H6.47zM6.47 13.025h5.052v1.94H6.47zM12.944 13.025H18v1.94h-5.056zM12.944 9.943H18v1.94h-5.056z"/></svg>Deezer</div>
    <div class="platform-logo"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.012 3.992L8.008 7.996 4.004 3.992 0 7.996l4.004 4.004 4.004-4.004 4.004 4.004 4.004-4.004L20.02 12l4.004-4.004-4.004-4.004-4.004 4.004zM8.008 16.004l4.004 4.004 4.004-4.004-4.004-4.004z"/></svg>Tidal</div>
    <div class="platform-logo"><svg viewBox="0 0 24 24" fill="currentColor" style="color:#FA243C"><path d="M5.34 13.5c-.21-.13-.62-.4-1.11-.4-.84 0-1.46.6-1.46 1.42 0 .81.61 1.41 1.46 1.41.5 0 .92-.27 1.11-.4v.04h.04v-2.07h-.04zM12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm6.66 17.05c-.32.5-.97.65-1.46.32-3.99-2.44-9.02-2.99-15.05-1.64-.57.13-1.13-.23-1.26-.79-.13-.57.23-1.13.79-1.26 6.6-1.5 12.25-.86 16.81 1.91.49.32.65.97.32 1.46h-.15zm1.45-3.23c-.4.62-1.22.81-1.84.4-4.56-2.81-11.5-3.62-16.89-1.98-.71.21-1.46-.18-1.67-.89-.21-.71.18-1.46.89-1.67 6.16-1.87 13.82-.94 19.1 2.31.62.4.81 1.21.4 1.83h.01zm.13-3.36C15.83 7.05 7.97 6.74 3.45 8.12c-.85.26-1.74-.22-2-1.07-.26-.85.22-1.74 1.07-2 5.18-1.57 13.91-1.21 19.39 2.08.76.46 1.01 1.45.55 2.21-.46.76-1.45 1.01-2.21.55l-.01-.01z"/></svg>Anghami</div>
  `;
  document.getElementById('marquee-row-1').innerHTML = platformLogos + platformLogos;

  // Fade-in observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  // Waveform bars
  const waveContainer = document.getElementById('waveform-container');
  if (waveContainer) {
    let bars = '';
    for (let i = 0; i < 40; i++) {
      const h = Math.round(20 + Math.abs(Math.sin(i * 0.7)) * 40);
      const delay = (i * 0.04).toFixed(2);
      bars += `<div class="waveform-bar" style="height:${h}px;animation-delay:${delay}s;"></div>`;
    }
    waveContainer.innerHTML = bars;
  }

  // Royalty counter animation
  function animateCounter(target, duration) {
    const el = document.getElementById('royalty-counter');
    if (!el) return;
    let start = 0;
    const end = target;
    const step = end / (duration / 16);
    function update() {
      start = Math.min(start + step, end);
      el.textContent = '$' + start.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      if (start < end) requestAnimationFrame(update);
    }
    update();
  }
  const royaltyObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      animateCounter(24847.53, 2000);
      royaltyObserver.disconnect();
    }
  }, { threshold: 0.5 });
  const royaltyEl = document.getElementById('royalty-counter');
  if (royaltyEl) royaltyObserver.observe(royaltyEl);

  // Distribution dots
  const dotGrid = document.getElementById('dot-grid');
  if (dotGrid) {
    const active = [1,4,7,11,13,15,19,22,25,26,28,31,34,37,41,43,46,48,52,55,57,61,64,67,70];
    const semi = [0,2,5,8,12,14,17,20,23,27,30,33,36,39,42,45,49,53,56,59,62,65,68,71];
    for (let i = 0; i < 80; i++) {
      const dot = document.createElement('div');
      dot.className = 'dist-dot' + (active.includes(i) ? ' active' : semi.includes(i) ? ' semi' : '');
      dotGrid.appendChild(dot);
    }
  }

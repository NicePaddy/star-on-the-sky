document.addEventListener("DOMContentLoaded", () => {
    const envelope = document.getElementById("envelope");
    const envelopeWrapper = document.getElementById("envelopeWrapper");
    const closeBtn = document.getElementById("closeBtn");
    const decorationsContainer = document.getElementById("decorations");

    const clickSound = document.getElementById("clickSound");
    const bgmSound = document.getElementById("bgmSound");
    const musicToggle = document.getElementById("musicToggle");
    const musicIcon = document.getElementById("musicIcon");
    const musicLabel = document.getElementById("musicLabel");

    let isMuted = false;
    let bgmStarted = false;
    let audioCtx = null;

    if (bgmSound) {
        bgmSound.volume = 0.45;
    }

    // Play crisp spooky click sound on every click/tap (with Web Audio fallback)
    function playClickSound() {
        if (isMuted) return;

        if (clickSound) {
            const clone = clickSound.cloneNode();
            clone.volume = 0.65;
            clone.play().catch(() => {
                playSynthClick();
            });
        } else {
            playSynthClick();
        }
    }

    function playSynthClick() {
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === "suspended") {
                audioCtx.resume();
            }
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = "triangle";
            const now = audioCtx.currentTime;
            osc.frequency.setValueAtTime(750, now);
            osc.frequency.exponentialRampToValueAtTime(180, now + 0.075);

            gain.gain.setValueAtTime(0.35, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.08);
        } catch (e) {}
    }

    // Play magic chime when opening the envelope
    function playOpenEnvelopeSound() {
        if (isMuted) return;
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === "suspended") {
                audioCtx.resume();
            }
            const notes = [523.25, 622.25, 783.99, 1046.5]; // Spooky Cm arpeggio
            notes.forEach((freq, idx) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = "sine";
                const startTime = audioCtx.currentTime + idx * 0.07;
                osc.frequency.setValueAtTime(freq, startTime);

                gain.gain.setValueAtTime(0.2, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(startTime);
                osc.stop(startTime + 0.46);
            });
        } catch (e) {}
    }

    // Ensure background music starts on first interaction
    function ensureBgmPlaying() {
        if (isMuted || bgmStarted || !bgmSound) return;
        bgmSound.play().then(() => {
            bgmStarted = true;
        }).catch(() => {});
    }

    // Global click listener for click sound + visual ripple
    document.addEventListener("pointerdown", (e) => {
        // Spawn small visual spooky ripple
        const ripple = document.createElement("span");
        ripple.className = "click-ripple";
        ripple.style.left = e.clientX + "px";
        ripple.style.top = e.clientY + "px";
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 450);

        if (e.target.closest("#musicToggle")) return;
        playClickSound();
        ensureBgmPlaying();
    });

    // Music mute/unmute button
    musicToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        isMuted = !isMuted;
        if (isMuted) {
            if (bgmSound) bgmSound.pause();
            musicToggle.classList.add("muted");
            musicIcon.textContent = "🔇";
            musicLabel.textContent = "Nhạc: Tắt";
        } else {
            musicToggle.classList.remove("muted");
            musicIcon.textContent = "🔊";
            musicLabel.textContent = "Nhạc: Bật";
            playClickSound();
            if (bgmSound) {
                bgmSound.play().then(() => {
                    bgmStarted = true;
                }).catch(() => {});
            }
        }
    });

    // Open envelope when clicking or tapping on the wrapper
    envelopeWrapper.addEventListener("click", (e) => {
        if (e.target === closeBtn || e.target.closest("#closeBtn")) return;
        if (!envelope.classList.contains("open")) {
            envelope.classList.add("open");
            document.body.classList.add("card-open");
            playOpenEnvelopeSound();
            burstSpookyConfetti();
        }
    });

    // Close envelope button
    closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        envelope.classList.remove("open");
        document.body.classList.remove("card-open");
    });

    // Generate floating Halloween background elements
    const icons = ["🎃", "👻", "🦇", "🍬", "🍭", "🕷️", "🕸️", "💀"];
    const itemCount = window.innerWidth < 480 ? 12 : 18;
    for (let i = 0; i < itemCount; i++) {
        const span = document.createElement("span");
        span.classList.add("floating-item");
        span.innerText = icons[Math.floor(Math.random() * icons.length)];
        span.style.left = Math.random() * 94 + "vw";
        span.style.animationDuration = (Math.random() * 8 + 7) + "s";
        span.style.animationDelay = (Math.random() * 5) + "s";
        span.style.fontSize = (Math.random() * 0.9 + 1) + "rem";
        decorationsContainer.appendChild(span);
    }

    // Mini burst effect when opening card
    function burstSpookyConfetti() {
        const rect = envelopeWrapper.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 12; i++) {
            const particle = document.createElement("span");
            particle.innerText = icons[Math.floor(Math.random() * icons.length)];
            particle.style.position = "fixed";
            particle.style.left = centerX + "px";
            particle.style.top = centerY + "px";
            particle.style.fontSize = "1.4rem";
            particle.style.pointerEvents = "none";
            particle.style.zIndex = "999";
            particle.style.transform = "translate(-50%, -50%)";
            particle.style.transition = "transform 0.9s ease-out, opacity 0.9s ease-out";
            document.body.appendChild(particle);

            const angle = Math.random() * Math.PI * 2;
            const maxDist = Math.min(window.innerWidth, 360) * 0.35;
            const distance = 50 + Math.random() * maxDist;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance - 30;

            requestAnimationFrame(() => {
                particle.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(1.25) rotate(${Math.random() * 360}deg)`;
                particle.style.opacity = "0";
            });

            setTimeout(() => particle.remove(), 950);
        }
    }
});

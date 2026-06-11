document.addEventListener('DOMContentLoaded', () => {
    // MOBILE MENU TOGGLE
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menuToggle.classList.toggle('active');
            nav.classList.toggle('active');
        });

        // Close when clicking links
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                nav.classList.remove('active');
            });
        });

        // Close menu if clicking outside of the header/nav
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
                menuToggle.classList.remove('active');
                nav.classList.remove('active');
            }
        });
    }

    // ACCORDION LOGIC
    const accordionItems = document.querySelectorAll('.accordion-item');

    accordionItems.forEach(item => {
        const trigger = item.querySelector('.accordion-trigger');
        const icon = item.querySelector('.accordion-icon');

        if (trigger) {
            trigger.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                // Collapse all
                accordionItems.forEach(i => {
                    i.classList.remove('active');
                    const iIcon = i.querySelector('.accordion-icon');
                    if (iIcon) iIcon.textContent = '+';
                });

                // Open clicked one if it was closed
                if (!isActive) {
                    item.classList.add('active');
                    if (icon) icon.textContent = '-';
                }
            });
        }
    });

    // SCROLL PARALLAX LOGIC
    const parallaxElements = [
        { containerSelector: '.ncard', imgSelector: '.ncard-img', factor: 35 }
    ];

    function handleParallax() {
        const viewHeight = window.innerHeight;
        parallaxElements.forEach(({ containerSelector, imgSelector, factor }) => {
            const containers = document.querySelectorAll(containerSelector);
            containers.forEach(container => {
                const img = container.querySelector(imgSelector);
                if (!img) return;
                const rect = container.getBoundingClientRect();
                if (rect.top < viewHeight && rect.bottom > 0) {
                    const relativeY = (rect.top + rect.height / 2) / viewHeight - 0.5; // -0.5 to 0.5
                    const translateVal = relativeY * factor;
                    img.style.transform = `translateY(${translateVal}px)`;
                }
            });
        });
    }

    window.addEventListener('scroll', handleParallax);
    // Trigger once on load
    handleParallax();

    // ERA DRIVE AI SATELLITE SWARM INTERACTIVE CANVAS
    const introSection = document.getElementById('intro');
    const canvas = document.getElementById('swarm-canvas');
    if (introSection && canvas) {
        const ctx = canvas.getContext('2d');
        let width = introSection.clientWidth;
        let height = introSection.clientHeight;
        const satellites = [];
        const numSatellites = 45;
        let time = 0;

        function initSatellites() {
            satellites.length = 0;
            for (let i = 0; i < numSatellites; i++) {
                const anchorX = Math.random() * width;
                const anchorY = Math.random() * height;
                satellites.push({
                    x: anchorX,
                    y: anchorY,
                    vx: 0,
                    vy: 0,
                    anchorX: anchorX,
                    anchorY: anchorY,
                    angleOffset: Math.random() * Math.PI * 2,
                    driftSpeed: 0.002 + Math.random() * 0.003,
                    driftRadius: 10 + Math.random() * 15,
                    size: 1.5 + Math.random() * 2
                });
            }
        }

        const resizeCanvas = () => {
            const rect = introSection.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
            initSatellites();
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        let mouse = { x: -1000, y: -1000, active: false };

        const updateInteractionCoords = (clientX, clientY) => {
            const rect = introSection.getBoundingClientRect();
            mouse.x = clientX - rect.left;
            mouse.y = clientY - rect.top;
            mouse.active = true;
        };

        const deactivateInteraction = () => {
            mouse.active = false;
            mouse.x = -1000;
            mouse.y = -1000;
        };

        // Mouse Listeners
        introSection.addEventListener('mousemove', (e) => {
            updateInteractionCoords(e.clientX, e.clientY);
        });

        introSection.addEventListener('mouseleave', deactivateInteraction);

        // Touch Listeners (Mobile & Tablet)
        introSection.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches.length > 0) {
                updateInteractionCoords(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        introSection.addEventListener('touchmove', (e) => {
            if (e.touches && e.touches.length > 0) {
                updateInteractionCoords(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        introSection.addEventListener('touchend', deactivateInteraction, { passive: true });
        introSection.addEventListener('touchcancel', deactivateInteraction, { passive: true });

        function animateSwarm() {
            time += 1;
            ctx.clearRect(0, 0, width, height);

            // 1. Update satellite physics
            satellites.forEach(sat => {
                // Drift the anchor point slightly over time (simulates orbital drift)
                const driftX = sat.anchorX + Math.cos(time * sat.driftSpeed + sat.angleOffset) * sat.driftRadius;
                const driftY = sat.anchorY + Math.sin(time * sat.driftSpeed + sat.angleOffset) * sat.driftRadius;

                // Return-to-anchor spring force (elastic anchor)
                const k = 0.035; // Spring constant
                const fx_spring = -k * (sat.x - driftX);
                const fy_spring = -k * (sat.y - driftY);

                // Mouse force (elastic pull towards cursor)
                let fx_mouse = 0;
                let fy_mouse = 0;
                if (mouse.active) {
                    const dx = mouse.x - sat.x;
                    const dy = mouse.y - sat.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const maxDist = 220;
                    if (dist < maxDist) {
                        const force = (maxDist - dist) / maxDist; // 0 to 1
                        const strength = 0.22; // pull factor
                        fx_mouse = dx * force * strength;
                        fy_mouse = dy * force * strength;
                    }
                }

                // Damping/Friction for the elastic bouncy effect
                const damping = 0.86;
                sat.vx = (sat.vx + fx_spring + fx_mouse) * damping;
                sat.vy = (sat.vy + fy_spring + fy_mouse) * damping;

                // Move satellite
                sat.x += sat.vx;
                sat.y += sat.vy;
            });

            // 2. Draw connection lines using a Minimum Spanning Tree (MST) to guarantee the swarm is always 100% connected
            ctx.lineWidth = 0.5;
            
            const numNodes = satellites.length;
            const inMST = new Array(numNodes).fill(false);
            const minDist = new Array(numNodes).fill(Infinity);
            const parent = new Array(numNodes).fill(-1);
            
            minDist[0] = 0;
            
            for (let step = 0; step < numNodes; step++) {
                let u = -1;
                let uDist = Infinity;
                for (let i = 0; i < numNodes; i++) {
                    if (!inMST[i] && minDist[i] < uDist) {
                        uDist = minDist[i];
                        u = i;
                    }
                }
                
                if (u === -1) break;
                inMST[u] = true;
                
                for (let v = 0; v < numNodes; v++) {
                    if (!inMST[v]) {
                        const dx = satellites[u].x - satellites[v].x;
                        const dy = satellites[u].y - satellites[v].y;
                        const distSq = dx * dx + dy * dy;
                        if (distSq < minDist[v]) {
                            minDist[v] = distSq;
                            parent[v] = u;
                        }
                    }
                }
            }

            // Draw MST backbone connections (faded at longer distances, but always visible to keep them united)
            for (let i = 1; i < numNodes; i++) {
                const p = parent[i];
                if (p !== -1) {
                    const s1 = satellites[i];
                    const s2 = satellites[p];
                    const dx = s1.x - s2.x;
                    const dy = s1.y - s2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const opacity = Math.max(0.04, 0.22 - (dist / 350) * 0.17);
                    ctx.strokeStyle = `rgba(232, 124, 62, ${opacity})`;
                    ctx.beginPath();
                    ctx.moveTo(s1.x, s1.y);
                    ctx.lineTo(s2.x, s2.y);
                    ctx.stroke();
                }
            }

            // Draw extra proximity lines (up to 130px) to build a richer mesh look
            for (let i = 0; i < numNodes; i++) {
                for (let j = i + 1; j < numNodes; j++) {
                    // Skip if they are already connected via the MST backbone to avoid drawing twice
                    if (parent[i] === j || parent[j] === i) continue;
                    
                    const s1 = satellites[i];
                    const s2 = satellites[j];
                    const dx = s1.x - s2.x;
                    const dy = s1.y - s2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < 130) {
                        const opacity = (1 - dist / 130) * 0.18;
                        ctx.strokeStyle = `rgba(232, 124, 62, ${opacity})`;
                        ctx.beginPath();
                        ctx.moveTo(s1.x, s1.y);
                        ctx.lineTo(s2.x, s2.y);
                        ctx.stroke();
                    }
                }
            }

            // 2.5 Draw connection lines from the mouse cursor to nearby satellites to show connection
            if (mouse.active) {
                ctx.lineWidth = 0.6;
                satellites.forEach(sat => {
                    const dx = mouse.x - sat.x;
                    const dy = mouse.y - sat.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const maxMouseConnectDist = 200;
                    if (dist < maxMouseConnectDist) {
                        const opacity = (1 - dist / maxMouseConnectDist) * 0.38;
                        ctx.strokeStyle = `rgba(232, 124, 62, ${opacity})`;
                        ctx.beginPath();
                        ctx.moveTo(mouse.x, mouse.y);
                        ctx.lineTo(sat.x, sat.y);
                        ctx.stroke();
                    }
                });
            }

            // 3. Draw satellites (nodes)
            satellites.forEach(sat => {
                ctx.fillStyle = 'rgba(232, 124, 62, 0.85)';
                ctx.beginPath();
                ctx.arc(sat.x, sat.y, sat.size, 0, Math.PI * 2);
                ctx.fill();

                // Draw delicate radar/orbit rings for larger nodes
                if (sat.size > 2.8) {
                    ctx.strokeStyle = 'rgba(232, 124, 62, 0.2)';
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.arc(sat.x, sat.y, sat.size * 2.5, 0, Math.PI * 2);
                    ctx.stroke();
                }
            });

            requestAnimationFrame(animateSwarm);
        }
        animateSwarm();
    }
});

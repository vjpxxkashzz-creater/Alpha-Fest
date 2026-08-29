/* =====================================================================
   ALPHA EVENTS — script.js
   Frontend-only demo. All data lives in localStorage. No backend.
   ===================================================================== */

(function () {
  "use strict";

  /* ---------------------------------------------------------------
     0. STORAGE KEYS + HELPERS
  --------------------------------------------------------------- */
  const LS = {
    theme: "alpha_theme",
    users: "alpha_users",
    currentUser: "alpha_currentUser",
    events: "alpha_events",
    registrations: "alpha_registrations",
    notifications: "alpha_notifications",
    gallery: "alpha_gallery",
    saved: "alpha_saved",
    seeded: "alpha_seeded_v1"
  };

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) { return fallback; }
    },
    set(key, val) {
      try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* storage full/unavailable */ }
    }
  };

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const uid = (p) => p + "_" + Math.random().toString(36).slice(2, 9);

  function fmtDate(d) {
    const dt = new Date(d + "T00:00:00");
    if (isNaN(dt)) return d;
    return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.remove("hidden");
    requestAnimationFrame(() => t.classList.add("show"));
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => t.classList.add("hidden"), 350);
    }, 2600);
  }

  /* ---------------------------------------------------------------
     1. DEMO DATA SEED
  --------------------------------------------------------------- */
  const CATEGORIES = ["Cultural","Technical","Sports","Symposium","Workshop","Seminar",
    "Competition","Hackathon","Quiz","Photography","Business","Club Activities","Department Events"];

  const GRADIENTS = [
    "linear-gradient(135deg,#FF3D6E,#6C5CE7)",
    "linear-gradient(135deg,#6C5CE7,#22D3EE)",
    "linear-gradient(135deg,#FF9F43,#FF3D6E)",
    "linear-gradient(135deg,#22D3EE,#2ECC71)",
    "linear-gradient(135deg,#A29BFE,#FF3D6E)",
    "linear-gradient(135deg,#2ECC71,#6C5CE7)"
  ];
  function gradientFor(seed) {
    let h = 0; for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    return GRADIENTS[h % GRADIENTS.length];
  }

  function seedEvents() {
    const base = [
      { title: "Alpha Cultural Fest", category: "Cultural", date: "2026-09-18", time: "10:00", endTime: "18:00",
        venue: "Main Auditorium", organizer: "Cultural Committee", faculty: "Dr. Meera Krishnan", student: "Sanjay R (III B.Com)",
        deadline: "2026-09-14", max: 400, current: 268, featured: true, trending: true, status: "Open",
        description: "A campus-wide celebration of music, dance and drama bringing every department together for one unforgettable evening.",
        objective: "Showcase student talent across performing arts and build cross-department camaraderie.",
        rules: ["Each act limited to 6 minutes","Props must be pre-approved by the committee","Explicit content is not permitted"],
        eligibility: "Open to all current Alpha students.",
        materials: "Own costumes and props; sound system provided.",
        participationType: "Individual & Team",
        prizes: "Trophies for top 3 acts + certificates for all participants.",
        instructions: "Report to backstage 30 minutes before your slot.",
        contact: "cultural@alphacollege.edu.in" },

      { title: "Alpha Tech Symposium", category: "Symposium", date: "2026-09-25", time: "09:30", endTime: "16:00",
        venue: "Seminar Hall B", organizer: "Dept. of Computer Science", faculty: "Prof. Arvind Nair", student: "Divya S (II B.Sc CS)",
        deadline: "2026-09-20", max: 200, current: 142, featured: true, trending: false, status: "Open",
        description: "Paper presentations, guest talks and panel discussions on emerging technology trends.",
        objective: "Give students a platform to present technical research and hear from industry speakers.",
        rules: ["Abstracts due before the deadline","Presentation limited to 10 minutes + 5 minutes Q&A"],
        eligibility: "Open to all UG and PG students.",
        materials: "Bring your own laptop for presentations.",
        participationType: "Individual",
        prizes: "Best Paper and Best Presenter awards.",
        instructions: "Submit slides 24 hours in advance.",
        contact: "cs.symposium@alphacollege.edu.in" },

      { title: "Code Clash", category: "Competition", date: "2026-09-12", time: "11:00", endTime: "14:00",
        venue: "Computer Lab 3", organizer: "Coding Club", faculty: "Mr. Ramesh Babu", student: "Karthik M (III B.Sc CS)",
        deadline: "2026-09-10", max: 80, current: 63, featured: false, trending: true, status: "Open",
        description: "A timed competitive programming contest across three difficulty tiers.",
        objective: "Sharpen algorithmic thinking under time pressure.",
        rules: ["Individual participation only","No internet access other than the contest platform"],
        eligibility: "Open to all departments.",
        materials: "Laptops provided in the lab.",
        participationType: "Individual",
        prizes: "Cash prize for top 3 + certificates.",
        instructions: "Arrive 15 minutes early for login setup.",
        contact: "codingclub@alphacollege.edu.in" },

      { title: "Web Wizard", category: "Hackathon", date: "2026-10-02", time: "09:00", endTime: "21:00",
        venue: "Innovation Lab", organizer: "Web Dev Club", faculty: "Ms. Priya Suresh", student: "Ashwin T (II BCA)",
        deadline: "2026-09-27", max: 60, current: 41, featured: true, trending: true, status: "Open",
        description: "A 12-hour build sprint where teams design and ship a working web product from scratch.",
        objective: "Encourage rapid prototyping and full-stack collaboration.",
        rules: ["Teams of 2–4","All code must be written during the event window"],
        eligibility: "Open to all UG students.",
        materials: "Bring your own laptop and charger.",
        participationType: "Team",
        prizes: "Winning team gets internship referrals + trophies.",
        instructions: "Team registration closes strictly at the deadline.",
        contact: "webdev@alphacollege.edu.in" },

      { title: "Debugging Challenge", category: "Technical", date: "2026-09-15", time: "13:00", endTime: "15:30",
        venue: "Computer Lab 1", organizer: "Dept. of Computer Science", faculty: "Prof. Arvind Nair", student: "Divya S (II B.Sc CS)",
        deadline: "2026-09-12", max: 70, current: 30, featured: false, trending: false, status: "Open",
        description: "Find, fix and explain bugs planted across a series of real-world style codebases.",
        objective: "Build sharper debugging and code-reading instincts.",
        rules: ["Individual participation","Scoring based on speed and accuracy"],
        eligibility: "Open to Computer Science and BCA students.",
        materials: "Nil — systems provided.",
        participationType: "Individual",
        prizes: "Certificates + department recognition.",
        instructions: "Report 10 minutes early with your ID card.",
        contact: "cs.dept@alphacollege.edu.in" },

      { title: "AI Innovation Workshop", category: "Workshop", date: "2026-09-20", time: "10:00", endTime: "13:00",
        venue: "Seminar Hall A", organizer: "AI & Data Science Club", faculty: "Dr. Lakshmi Iyer", student: "Rahul V (III B.Sc DS)",
        deadline: "2026-09-17", max: 120, current: 95, featured: false, trending: true, status: "Open",
        description: "Hands-on session introducing practical machine learning workflows for beginners.",
        objective: "Demystify applied AI through guided, hands-on exercises.",
        rules: ["Bring a laptop with Python installed"],
        eligibility: "Open to all students with basic programming knowledge.",
        materials: "Laptop with Python 3 installed.",
        participationType: "Individual",
        prizes: "Certificate of participation.",
        instructions: "Pre-workshop setup guide will be shared after registration.",
        contact: "aiclub@alphacollege.edu.in" },

      { title: "Quiz Master", category: "Quiz", date: "2026-09-11", time: "15:00", endTime: "17:00",
        venue: "Seminar Hall B", organizer: "Quiz Club", faculty: "Ms. Nithya Raman", student: "Vignesh S (I B.Com)",
        deadline: "2026-09-09", max: 100, current: 54, featured: false, trending: false, status: "Open",
        description: "A general knowledge and current affairs quiz spanning prelims and a live final.",
        objective: "Celebrate curiosity and quick thinking across disciplines.",
        rules: ["Teams of 2","Prelims are written, finals are on stage"],
        eligibility: "Open to all Alpha students.",
        materials: "Nil.",
        participationType: "Team",
        prizes: "Trophies for winning team.",
        instructions: "Report to the venue 15 minutes before start.",
        contact: "quizclub@alphacollege.edu.in" },

      { title: "Photography Contest", category: "Photography", date: "2026-09-28", time: "00:00", endTime: "23:59",
        venue: "Campus-wide", organizer: "Photography Club", faculty: "Mr. Selvam K", student: "Aparna J (II BCA)",
        deadline: "2026-09-24", max: 150, current: 88, featured: false, trending: false, status: "Open",
        description: "Capture campus life on the theme 'Everyday Alpha' — submissions judged the following week.",
        objective: "Encourage visual storytelling of college life.",
        rules: ["Max 3 entries per participant","Minimal editing only, no compositing"],
        eligibility: "Open to all students.",
        materials: "Any camera or smartphone.",
        participationType: "Individual",
        prizes: "Featured in the Alpha gallery + certificates.",
        instructions: "Submit high-resolution JPEGs by the deadline.",
        contact: "photoclub@alphacollege.edu.in" },

      { title: "Sports Meet", category: "Sports", date: "2026-10-05", time: "08:00", endTime: "17:00",
        venue: "College Ground", organizer: "Sports Department", faculty: "Mr. Suresh Kumar", student: "Deepak R (III B.Com)",
        deadline: "2026-09-30", max: 500, current: 310, featured: false, trending: true, status: "Open",
        description: "Annual inter-department athletics and team sports meet across track and field events.",
        objective: "Promote fitness, teamwork and department spirit.",
        rules: ["Report in department jersey","Follow event-specific rules briefed on the day"],
        eligibility: "Open to all students; medical fitness recommended.",
        materials: "Sportswear and shoes.",
        participationType: "Individual & Team",
        prizes: "Medals and the Alpha Sports Trophy for top department.",
        instructions: "Warm-up sessions begin 30 minutes before each event.",
        contact: "sports@alphacollege.edu.in" },

      { title: "Business Idea Challenge", category: "Business", date: "2026-10-08", time: "10:00", endTime: "16:00",
        venue: "Conference Hall", organizer: "Dept. of Business Administration", faculty: "Dr. Kavitha Ramesh", student: "Naveen K (III BBA)",
        deadline: "2026-10-03", max: 90, current: 22, featured: false, trending: false, status: "Open",
        description: "Pitch an original business idea to a panel of faculty and alumni judges.",
        objective: "Build entrepreneurial thinking and pitching confidence.",
        rules: ["Teams of up to 3","Pitch limited to 8 minutes"],
        eligibility: "Open to all UG and PG students.",
        materials: "Pitch deck (max 10 slides).",
        participationType: "Team",
        prizes: "Seed-funding referral for the winning idea.",
        instructions: "Submit your deck 48 hours before the event.",
        contact: "bba.dept@alphacollege.edu.in" }
    ];

    return base.map((e, i) => {
      const id = "evt_" + (i + 1);
      return Object.assign({ id, image: gradientFor(e.title) }, e);
    });
  }

  function seedGallery() {
    const cats = ["Cultural","Technical","Sports","Workshops","Symposium","College Life"];
    const names = ["Cultural Fest Highlights","Hackathon Night","Inter-Dept Football Final","AI Workshop Session",
      "Tech Symposium Keynote","Campus Morning","Quiz Finals","Dance Showcase","Sports Day Relay","Photography Walk",
      "Freshers Welcome","Graduation Day","Debate Finals","Coding Bootcamp","Annual Day Celebrations","Library Reading Corner"];
    return names.map((n, i) => ({
      id: "gal_" + (i + 1),
      image: GRADIENTS[i % GRADIENTS.length],
      event: n,
      date: `2026-0${(i % 8) + 1}-1${i % 9}`,
      category: cats[i % cats.length]
    }));
  }

  function seedNotifications() {
    return [
      { id: uid("n"), text: "Welcome to Alpha Events! Explore what's happening on campus this month.", time: Date.now() - 1000 * 60 * 60 * 3, read: false },
      { id: uid("n"), text: "New event added: Business Idea Challenge — registrations now open.", time: Date.now() - 1000 * 60 * 60 * 20, read: false },
      { id: uid("n"), text: "Registration deadline approaching for Code Clash.", time: Date.now() - 1000 * 60 * 60 * 30, read: true },
      { id: uid("n"), text: "New gallery photos uploaded from the AI Innovation Workshop.", time: Date.now() - 1000 * 60 * 60 * 50, read: true }
    ];
  }

  function seedIfNeeded() {
    if (store.get(LS.seeded, false)) return;
    store.set(LS.events, seedEvents());
    store.set(LS.gallery, seedGallery());
    store.set(LS.notifications, seedNotifications());
    store.set(LS.registrations, []);
    store.set(LS.users, []);
    store.set(LS.saved, []);
    store.set(LS.seeded, true);
  }
  seedIfNeeded();

  /* ---------------------------------------------------------------
     2. THEME
  --------------------------------------------------------------- */
  function initTheme() {
    const saved = store.get(LS.theme, "dark");
    document.body.setAttribute("data-theme", saved);
  }
  initTheme();
  $("#themeToggle").addEventListener("click", () => {
    const cur = document.body.getAttribute("data-theme");
    const next = cur === "dark" ? "light" : "dark";
    document.body.setAttribute("data-theme", next);
    store.set(LS.theme, next);
  });

  /* ---------------------------------------------------------------
     3. CINEMATIC INTRO + PARTICLES
  --------------------------------------------------------------- */
  function runIntroParticles() {
    const canvas = $("#introParticles");
    const ctx = canvas.getContext("2d");
    let w, h, particles = [];
    function resize() {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);
    const COUNT = window.innerWidth < 600 ? 40 : 80;
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.15,
        a: Math.random() * 0.5 + 0.15
      });
    }
    let raf;
    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.a})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }

  function endIntro() {
    const intro = $("#intro");
    if (intro.classList.contains("intro-out")) return;
    intro.classList.add("intro-out");
    $("#app").classList.remove("hidden");
    setTimeout(() => { intro.style.display = "none"; }, 950);
  }

  const stopParticles = runIntroParticles();
  $("#skipIntro").addEventListener("click", endIntro);
  setTimeout(endIntro, 3600);
  document.body.style.overflow = "hidden";
  setTimeout(() => { document.body.style.overflow = ""; }, 3700);

  /* ---------------------------------------------------------------
     4. ROUTING
  --------------------------------------------------------------- */
  const VIEWS = ["home","events","register","success","signin","profile","notifications","gallery","dashboard","contact"];
  let currentView = "home";

  function goTo(view, opts) {
    opts = opts || {};
    if (!VIEWS.includes(view)) return;
    $$(".view").forEach(v => v.classList.remove("active"));
    const target = $("#view-" + view);
    if (target) target.classList.add("active");
    currentView = view;

    $$(".bnav-item").forEach(b => b.classList.toggle("active", b.dataset.view === view));
    $$(".tnav-item").forEach(b => b.classList.toggle("active", b.dataset.view === view));
    positionBnavPill();

    if (view === "events") renderEventsPage();
    if (view === "gallery") renderGallery();
    if (view === "dashboard") renderDashboard();
    if (view === "notifications") renderNotifications();
    if (view === "profile") renderProfile();
    if (view === "register" && opts.eventId) {
      $("#regEventSelect").value = opts.eventId;
      $("#regEventSelect").dispatchEvent(new Event("change"));
    }
    if (view === "register" && !opts.keepStep) resetRegForm(!!opts.eventId);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function positionBnavPill() {
    const pill = $("#bnavPill");
    const active = $(".bnav-item.active:not(.bnav-center)");
    if (!active || !pill) { if (pill) pill.style.opacity = 0; return; }
    pill.style.opacity = 1;
    const rect = active.getBoundingClientRect();
    const parentRect = active.parentElement.getBoundingClientRect();
    pill.style.left = (rect.left - parentRect.left + rect.width / 2 - 13) + "px";
  }
  window.addEventListener("resize", positionBnavPill);

  document.addEventListener("click", (e) => {
    const navBtn = e.target.closest("[data-view]");
    if (navBtn) {
      e.preventDefault();
      goTo(navBtn.dataset.view);
    }
    const closeBtn = e.target.closest("[data-close]");
    if (closeBtn) {
      closeBtn.closest(".modal-overlay").classList.add("hidden");
    }
  });

  /* ---------------------------------------------------------------
     5. HOME + EVENTS RENDERING
  --------------------------------------------------------------- */
  function seatsLeft(ev) { return Math.max(ev.max - ev.current, 0); }
  function isOpen(ev) { return new Date(ev.deadline) >= new Date(new Date().toDateString()); }

  function eventCardHTML(ev, compact) {
    const left = seatsLeft(ev);
    return `
    <article class="event-card" data-event-id="${ev.id}" tabindex="0" role="button" aria-label="View ${ev.title}">
      <div class="thumb" style="background-image:${ev.image}">
        <span class="badge">${ev.category}</span>
        <span class="badge badge-status">${left <= 15 ? "Filling Fast" : ev.status}</span>
      </div>
      <div class="body">
        <span class="cat">${ev.category}</span>
        <h3>${ev.title}</h3>
        <div class="meta">
          <span>📅 ${fmtDate(ev.date)} &nbsp; ⏰ ${ev.time}</span>
          <span>📍 ${ev.venue}</span>
          <span>🎟️ ${left} seats left &middot; Closes ${fmtDate(ev.deadline)}</span>
        </div>
        <div class="cta-row">
          <button class="btn btn-ghost view-details-btn" data-event-id="${ev.id}">View Details</button>
          <button class="btn btn-primary register-btn" data-event-id="${ev.id}">Register</button>
        </div>
      </div>
    </article>`;
  }

  function renderHome() {
    const events = store.get(LS.events, []);
    $("#featuredRow").innerHTML = events.filter(e => e.featured).map(e => eventCardHTML(e)).join("") || emptyRow("No featured events yet.");
    $("#upcomingRow").innerHTML = [...events].sort((a,b) => new Date(a.date)-new Date(b.date)).slice(0,6).map(e => eventCardHTML(e)).join("");
    $("#trendingRow").innerHTML = events.filter(e => e.trending).map(e => eventCardHTML(e)).join("") || emptyRow("Nothing trending right now.");

    $("#categoryRow").innerHTML = CATEGORIES.map(c => `<button class="chip" data-goto-category="${c}">${c}</button>`).join("");

    const announcements = [
      { h: "Registrations now open", p: "Alpha Cultural Fest 2026 registrations are live — limited seats." },
      { h: "New workshop added", p: "AI Innovation Workshop joins this month's schedule." },
      { h: "Deadline reminder", p: "Code Clash registrations close soon — don't miss out." }
    ];
    $("#announceList").innerHTML = announcements.map(a => `
      <div class="announce-item"><span class="dot-ic"></span><div><h4>${a.h}</h4><p>${a.p}</p></div></div>`).join("");

    const gallery = store.get(LS.gallery, []).slice(0, 8);
    $("#memoriesRow").innerHTML = gallery.map(g => `
      <div class="memory-card" style="background-image:${g.image}" data-label="${g.event}"></div>`).join("");

    $$("#categoryRow .chip").forEach(chip => chip.addEventListener("click", () => {
      goTo("events");
      setTimeout(() => filterEventsByCategory(chip.dataset.gotoCategory), 60);
    }));

    attachEventCardHandlers();
    initReveal();
  }
  function emptyRow(msg) { return `<p class="muted" style="padding:20px 4px;">${msg}</p>`; }

  function attachEventCardHandlers() {
    $$(".event-card").forEach(card => {
      card.addEventListener("click", (e) => {
        if (e.target.closest(".register-btn") || e.target.closest(".view-details-btn")) return;
        openEventModal(card.dataset.eventId);
      });
    });
    $$(".view-details-btn").forEach(b => b.addEventListener("click", (e) => { e.stopPropagation(); openEventModal(b.dataset.eventId); }));
    $$(".register-btn").forEach(b => b.addEventListener("click", (e) => { e.stopPropagation(); goTo("register", { eventId: b.dataset.eventId }); }));
  }

  let eventsCategoryActive = "";
  function renderEventsPage() {
    const filterRow = $("#eventsCategoryFilter");
    filterRow.innerHTML = `<button class="chip ${eventsCategoryActive===""?"active":""}" data-cat="">All</button>` +
      CATEGORIES.map(c => `<button class="chip ${eventsCategoryActive===c?"active":""}" data-cat="${c}">${c}</button>`).join("");
    $$("#eventsCategoryFilter .chip").forEach(chip => chip.addEventListener("click", () => filterEventsByCategory(chip.dataset.cat)));
    drawEventsGrid();
  }
  function filterEventsByCategory(cat) {
    eventsCategoryActive = cat || "";
    $$("#eventsCategoryFilter .chip").forEach(c => c.classList.toggle("active", c.dataset.cat === eventsCategoryActive));
    drawEventsGrid();
  }
  function drawEventsGrid() {
    const events = store.get(LS.events, []);
    const filtered = eventsCategoryActive ? events.filter(e => e.category === eventsCategoryActive) : events;
    $("#eventsGrid").innerHTML = filtered.map(e => eventCardHTML(e)).join("") || emptyRow("No events in this category yet.");
    attachEventCardHandlers();
  }

  /* ---------------------------------------------------------------
     6. EVENT DETAILS MODAL
  --------------------------------------------------------------- */
  function openEventModal(id) {
    const ev = store.get(LS.events, []).find(e => e.id === id);
    if (!ev) return;
    const left = seatsLeft(ev);
    const pct = Math.min(100, Math.round((ev.current / ev.max) * 100));
    $("#eventModalBody").innerHTML = `
      <div class="em-hero" style="background-image:${ev.image}"></div>
      <span class="em-cat">${ev.category}</span>
      <h2 class="em-title">${ev.title}</h2>
      <div class="em-grid">
        <div class="em-field"><div class="k">Date</div><div class="v">${fmtDate(ev.date)}</div></div>
        <div class="em-field"><div class="k">Time</div><div class="v">${ev.time} – ${ev.endTime}</div></div>
        <div class="em-field"><div class="k">Venue</div><div class="v">${ev.venue}</div></div>
        <div class="em-field"><div class="k">Organizer</div><div class="v">${ev.organizer}</div></div>
        <div class="em-field"><div class="k">Faculty Coordinator</div><div class="v">${ev.faculty}</div></div>
        <div class="em-field"><div class="k">Student Coordinator</div><div class="v">${ev.student}</div></div>
        <div class="em-field"><div class="k">Registration Deadline</div><div class="v">${fmtDate(ev.deadline)}</div></div>
        <div class="em-field"><div class="k">Participation Type</div><div class="v">${ev.participationType}</div></div>
        <div class="em-field"><div class="k">Contact</div><div class="v">${ev.contact}</div></div>
      </div>
      <div class="em-block">
        <h4>Seats — ${ev.current}/${ev.max} filled (${left} available)</h4>
        <div class="seats-bar"><div style="width:${pct}%"></div></div>
      </div>
      <div class="em-block"><h4>Description</h4><p>${ev.description}</p></div>
      <div class="em-block"><h4>Objective</h4><p>${ev.objective}</p></div>
      <div class="em-block"><h4>Rules &amp; Regulations</h4><ul>${ev.rules.map(r => `<li>${r}</li>`).join("")}</ul></div>
      <div class="em-block"><h4>Eligibility</h4><p>${ev.eligibility}</p></div>
      <div class="em-block"><h4>Required Materials</h4><p>${ev.materials}</p></div>
      <div class="em-block"><h4>Prizes / Certificates</h4><p>${ev.prizes}</p></div>
      <div class="em-block"><h4>Important Instructions</h4><p>${ev.instructions}</p></div>
      <div class="em-block"><h4>Venue Location</h4><p><a href="https://www.google.com/maps/search/?api=1&query=Alpha+Arts+and+Science+College%2C+No.30+Tundalam+Road%2C+Porur%2C+Chennai+600116" target="_blank" rel="noopener" style="color:var(--accent-1); font-weight:600;">Open in Maps ↗</a></p></div>
      <div class="form-actions">
        <button class="btn btn-ghost" id="saveEventBtn" data-event-id="${ev.id}">${isSaved(ev.id) ? "★ Saved" : "☆ Save Event"}</button>
        <button class="btn btn-primary btn-glow" id="modalRegisterBtn" data-event-id="${ev.id}">Register Now</button>
      </div>
    `;
    $("#eventModal").classList.remove("hidden");
    $("#modalRegisterBtn").addEventListener("click", () => {
      $("#eventModal").classList.add("hidden");
      goTo("register", { eventId: ev.id });
    });
    $("#saveEventBtn").addEventListener("click", () => toggleSaveEvent(ev.id));
  }

  function isSaved(eventId) {
    const saved = store.get(LS.saved, []);
    const user = store.get(LS.currentUser, null);
    if (!user) return false;
    return saved.some(s => s.userEmail === user.email && s.eventId === eventId);
  }
  function toggleSaveEvent(eventId) {
    const user = store.get(LS.currentUser, null);
    if (!user) { toast("Sign in to save events"); goTo("signin"); return; }
    let saved = store.get(LS.saved, []);
    const exists = saved.find(s => s.userEmail === user.email && s.eventId === eventId);
    if (exists) { saved = saved.filter(s => s !== exists); toast("Removed from saved events"); }
    else { saved.push({ userEmail: user.email, eventId }); toast("Event saved"); }
    store.set(LS.saved, saved);
    openEventModal(eventId);
  }

  /* ---------------------------------------------------------------
     7. REGISTRATION MULTI-STEP FORM
  --------------------------------------------------------------- */
  const regForm = $("#regForm");
  let regStep = 1;
  const TOTAL_STEPS = 6;

  function populateEventSelect() {
    const events = store.get(LS.events, []);
    $("#regEventSelect").innerHTML = `<option value="">Select an event</option>` +
      events.map(e => `<option value="${e.id}">${e.title} — ${fmtDate(e.date)}</option>`).join("");
  }
  populateEventSelect();

  $("#regEventSelect").addEventListener("change", (e) => {
    const ev = store.get(LS.events, []).find(x => x.id === e.target.value);
    regForm.category.value = ev ? ev.category : "";
  });
  $("#regParticipationType").addEventListener("change", (e) => {
    const isTeam = e.target.value === "Team";
    $("#teamNameWrap").classList.toggle("hidden", !isTeam);
    $("#teamMembersWrap").classList.toggle("hidden", !isTeam);
  });

  function showStep(n) {
    regStep = n;
    $$(".form-panel").forEach(p => p.classList.toggle("active", Number(p.dataset.panel) === n));
    $$(".step").forEach(s => {
      const sn = Number(s.dataset.step);
      s.classList.toggle("active", sn === n);
      s.classList.toggle("done", sn < n);
    });
    $("#prevStepBtn").classList.toggle("hidden", n === 1);
    $("#nextStepBtn").classList.toggle("hidden", n === TOTAL_STEPS);
    $("#submitRegBtn").classList.toggle("hidden", n !== TOTAL_STEPS);
    if (n === TOTAL_STEPS) buildRegSummary();
  }

  function validateStep(n) {
    const panel = $(`.form-panel[data-panel="${n}"]`);
    const fields = $$("input[required], select[required], textarea[required]", panel);
    for (const f of fields) {
      if (!f.value || (f.type === "checkbox" && !f.checked)) {
        f.reportValidity ? f.reportValidity() : null;
        f.focus();
        return false;
      }
    }
    return true;
  }

  $("#nextStepBtn").addEventListener("click", () => {
    if (!validateStep(regStep)) return;
    if (regStep < TOTAL_STEPS) showStep(regStep + 1);
  });
  $("#prevStepBtn").addEventListener("click", () => { if (regStep > 1) showStep(regStep - 1); });

  function buildRegSummary() {
    const fd = new FormData(regForm);
    const ev = store.get(LS.events, []).find(e => e.id === fd.get("eventId"));
    const rows = [
      ["Name", fd.get("fullName")], ["Register No.", fd.get("regNumber")], ["Email", fd.get("email")],
      ["Mobile", fd.get("mobile")], ["Department", fd.get("department")], ["Year", fd.get("year")],
      ["Event", ev ? ev.title : "—"], ["Category", fd.get("category")], ["Participation", fd.get("participationType")],
      ["Emergency Contact", `${fd.get("emergencyName")} (${fd.get("emergencyRelation")}) — ${fd.get("emergencyContact")}`]
    ];
    $("#regSummary").innerHTML = rows.map(r => `<div class="srow"><b>${r[0]}</b><span>${r[1] || "—"}</span></div>`).join("");
  }

  function resetRegForm(keepEvent) {
    const evId = keepEvent ? regForm.eventId.value : "";
    regForm.reset();
    if (evId) { setTimeout(() => { $("#regEventSelect").value = evId; $("#regEventSelect").dispatchEvent(new Event("change")); }, 0); }
    $("#teamNameWrap").classList.add("hidden");
    $("#teamMembersWrap").classList.add("hidden");
    showStep(1);
  }

  function nextRegId() {
    const regs = store.get(LS.registrations, []);
    const year = new Date().getFullYear();
    const seq = String(regs.length + 1).padStart(4, "0");
    return `ALPHA-EVT-${year}-${seq}`;
  }

  regForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateStep(TOTAL_STEPS)) return;
    const fd = new FormData(regForm);
    const events = store.get(LS.events, []);
    const ev = events.find(x => x.id === fd.get("eventId"));
    if (!ev) { toast("Please select a valid event"); return; }

    const regId = nextRegId();
    const record = { id: regId, status: "Confirmed", createdAt: Date.now() };
    for (const [k, v] of fd.entries()) record[k] = v;
    record.eventTitle = ev.title;
    record.category = ev.category;
    record.eventDate = ev.date;
    record.venue = ev.venue;

    const regs = store.get(LS.registrations, []);
    regs.push(record);
    store.set(LS.registrations, regs);

    ev.current = Math.min(ev.max, ev.current + 1);
    store.set(LS.events, events);

    const notifs = store.get(LS.notifications, []);
    notifs.unshift({ id: uid("n"), text: `Registration confirmed for ${ev.title} — ID ${regId}.`, time: Date.now(), read: false });
    store.set(LS.notifications, notifs);

    const user = store.get(LS.currentUser, null);
    if (user) {
      const users = store.get(LS.users, []);
      const u = users.find(x => x.email === user.email);
      if (u) { u.registrations = u.registrations || []; u.registrations.push(regId); store.set(LS.users, users); }
    }

    showSuccess(record);
    goTo("success", { keepStep: true });
    updateNotifDot();
  });

  function showSuccess(r) {
    $("#successCard").innerHTML = `
      <div class="srow"><b>Student</b><span>${r.fullName}</span></div>
      <div class="srow"><b>Register No.</b><span>${r.regNumber}</span></div>
      <div class="srow"><b>Department</b><span>${r.department}</span></div>
      <div class="srow"><b>Event</b><span>${r.eventTitle}</span></div>
      <div class="srow"><b>Date</b><span>${fmtDate(r.eventDate)}</span></div>
      <div class="srow"><b>Venue</b><span>${r.venue}</span></div>
      <div class="srow"><b>Registration ID</b><span class="regid">${r.id}</span></div>
      <div class="srow"><b>Status</b><span>${r.status}</span></div>
    `;
  }

  /* ---------------------------------------------------------------
     8. AUTH (demo only — plain localStorage, no real security)
  --------------------------------------------------------------- */
  $("#showCreateAccount").addEventListener("click", () => {
    $("#signinForm").classList.add("hidden"); $(".auth-links").classList.add("hidden");
    $("#forgotBox").classList.add("hidden"); $("#createForm").classList.remove("hidden");
  });
  $("#backToSignin").addEventListener("click", () => {
    $("#createForm").classList.add("hidden");
    $("#signinForm").classList.remove("hidden"); $(".auth-links").classList.remove("hidden");
  });
  $("#showForgot").addEventListener("click", () => $("#forgotBox").classList.toggle("hidden"));

  $("#createForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const users = store.get(LS.users, []);
    if (users.some(u => u.email === fd.get("email"))) { toast("An account with this email already exists"); return; }
    const user = {
      name: fd.get("name"), regNumber: fd.get("regNumber"), department: fd.get("department"),
      year: fd.get("year"), email: fd.get("email"), phone: fd.get("phone"), password: fd.get("password"),
      registrations: []
    };
    users.push(user);
    store.set(LS.users, users);
    store.set(LS.currentUser, { email: user.email });
    toast("Account created — welcome to Alpha Events!");
    e.target.reset();
    $("#createForm").classList.add("hidden"); $("#signinForm").classList.remove("hidden"); $(".auth-links").classList.remove("hidden");
    goTo("profile");
  });

  $("#signinForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const id = fd.get("identifier"), pw = fd.get("password");
    const users = store.get(LS.users, []);
    const user = users.find(u => (u.email === id || u.regNumber === id) && u.password === pw);
    if (!user) { toast("No matching account — check your details or create an account"); return; }
    store.set(LS.currentUser, { email: user.email });
    toast(`Welcome back, ${user.name.split(" ")[0]}!`);
    e.target.reset();
    goTo("profile");
  });

  /* ---------------------------------------------------------------
     9. PROFILE
  --------------------------------------------------------------- */
  function currentUserRecord() {
    const cu = store.get(LS.currentUser, null);
    if (!cu) return null;
    return store.get(LS.users, []).find(u => u.email === cu.email) || null;
  }

  function renderProfile() {
    const user = currentUserRecord();
    if (!user) {
      $("#profileSignedOut").classList.remove("hidden");
      $("#profileSignedIn").classList.add("hidden");
      return;
    }
    $("#profileSignedOut").classList.add("hidden");
    $("#profileSignedIn").classList.remove("hidden");

    const initials = user.name.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase();
    $("#profileAvatar").textContent = initials;
    $("#topAvatar").textContent = initials;
    $("#profileName").textContent = user.name;
    $("#profileMeta").textContent = `${user.regNumber} · ${user.department} · ${user.year}`;

    const regs = store.get(LS.registrations, []).filter(r => r.email === user.email || (user.registrations||[]).includes(r.id));
    $("#profileRegList").innerHTML = regs.length ? regs.map(regCardHTML).join("") : `<p class="muted">No registrations yet — explore events to get started.</p>`;

    const savedIds = store.get(LS.saved, []).filter(s => s.userEmail === user.email).map(s => s.eventId);
    const events = store.get(LS.events, []);
    const savedEvents = events.filter(e => savedIds.includes(e.id));
    $("#profileSavedList").innerHTML = savedEvents.length ? savedEvents.map(e => `
      <div class="reg-card" data-event-id="${e.id}">
        <div class="thumb-sm" style="background-image:${e.image}"></div>
        <div class="info"><h4>${e.title}</h4><p>${fmtDate(e.date)} · ${e.venue}</p></div>
        <span class="status-pill">Saved</span>
      </div>`).join("") : `<p class="muted">No saved events yet.</p>`;

    $("#profileHistoryList").innerHTML = regs.length ? regs.slice().reverse().map(regCardHTML).join("") : `<p class="muted">Your registration history will appear here.</p>`;

    $$(".reg-card").forEach(c => c.addEventListener("click", () => openEventModal(c.dataset.eventId)));
  }

  function regCardHTML(r) {
    const ev = store.get(LS.events, []).find(e => e.id === r.eventId);
    return `
    <div class="reg-card" data-event-id="${r.eventId}">
      <div class="thumb-sm" style="background-image:${ev ? ev.image : GRADIENTS[0]}"></div>
      <div class="info"><h4>${r.eventTitle}</h4><p>${r.id} · ${fmtDate(r.eventDate)} · ${r.venue}</p></div>
      <span class="status-pill">${r.status}</span>
    </div>`;
  }

  $$(".ptab").forEach(tab => tab.addEventListener("click", () => {
    $$(".ptab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    const map = { events: "profileRegList", saved: "profileSavedList", history: "profileHistoryList" };
    Object.values(map).forEach(id => $("#" + id).classList.add("hidden"));
    $("#" + map[tab.dataset.ptab]).classList.remove("hidden");
  }));

  $("#signOutBtn").addEventListener("click", () => {
    localStorage.removeItem(LS.currentUser);
    toast("Signed out");
    goTo("home");
  });

  /* ---------------------------------------------------------------
     10. NOTIFICATIONS
  --------------------------------------------------------------- */
  function timeAgo(ts) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return "just now";
    const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24); return `${d}d ago`;
  }
  function updateNotifDot() {
    const notifs = store.get(LS.notifications, []);
    $("#notifDot").classList.toggle("hidden", !notifs.some(n => !n.read));
  }
  function renderNotifications() {
    const notifs = store.get(LS.notifications, []).sort((a,b) => b.time - a.time);
    $("#notifList").innerHTML = notifs.map(n => `
      <div class="notif-item ${n.read ? "" : "unread"}" data-id="${n.id}">
        <div class="notif-ic">🔔</div>
        <div><p>${n.text}</p><time>${timeAgo(n.time)}</time></div>
        ${n.read ? "" : `<span class="unread-dot"></span>`}
      </div>`).join("") || `<p class="muted">No notifications yet.</p>`;
    updateNotifDot();
  }
  $("#markAllReadBtn").addEventListener("click", () => {
    const notifs = store.get(LS.notifications, []).map(n => ({ ...n, read: true }));
    store.set(LS.notifications, notifs);
    renderNotifications();
    toast("All notifications marked as read");
  });

  /* ---------------------------------------------------------------
     11. GALLERY + LIGHTBOX
  --------------------------------------------------------------- */
  const GAL_CATS = ["All","Cultural","Technical","Sports","Workshops","Symposium","College Life"];
  let galleryFilter = "All";
  let lbIndex = 0, lbList = [];

  function renderGallery() {
    $("#galleryFilter").innerHTML = GAL_CATS.map(c => `<button class="chip ${c===galleryFilter?"active":""}" data-gcat="${c}">${c}</button>`).join("");
    $$("#galleryFilter .chip").forEach(chip => chip.addEventListener("click", () => {
      galleryFilter = chip.dataset.gcat;
      renderGallery();
    }));
    const gallery = store.get(LS.gallery, []);
    lbList = galleryFilter === "All" ? gallery : gallery.filter(g => g.category === galleryFilter);
    $("#galleryGrid").innerHTML = lbList.map((g, i) => `
      <div class="gallery-item" data-idx="${i}">
        <div style="background:${g.image}; width:100%; padding-top:${70 + (i%3)*20}%;"></div>
        <div class="g-meta"><strong>${g.event}</strong><br>${g.category} · ${fmtDate(g.date)}</div>
      </div>`).join("");
    $$(".gallery-item").forEach(item => item.addEventListener("click", () => openLightbox(Number(item.dataset.idx))));
  }

  function openLightbox(i) {
    lbIndex = i;
    updateLightbox();
    $("#lightbox").classList.remove("hidden");
  }
  function updateLightbox() {
    const g = lbList[lbIndex];
    if (!g) return;
    const img = $("#lbImage");
    img.style.display = "none";
    $("#lbMeta").innerHTML = `<strong>${g.event}</strong> — ${g.category} · ${fmtDate(g.date)}`;
    let ph = $("#lbPlaceholder");
    if (!ph) {
      ph = document.createElement("div");
      ph.id = "lbPlaceholder";
      ph.style.cssText = "width:min(90vw,520px); height:min(60vh,360px); border-radius:16px;";
      img.parentElement.insertBefore(ph, img);
    }
    ph.style.background = g.image;
  }
  $("#lbPrev").addEventListener("click", () => { lbIndex = (lbIndex - 1 + lbList.length) % lbList.length; updateLightbox(); });
  $("#lbNext").addEventListener("click", () => { lbIndex = (lbIndex + 1) % lbList.length; updateLightbox(); });

  /* ---------------------------------------------------------------
     12. DASHBOARD
  --------------------------------------------------------------- */
  function renderDashboard() {
    const regs = store.get(LS.registrations, []);
    const events = store.get(LS.events, []);
    const now = new Date();

    const upcoming = events.filter(e => new Date(e.date) >= now).length;
    const completed = events.filter(e => new Date(e.date) < now).length;
    const totalSeatsLeft = events.reduce((s, e) => s + seatsLeft(e), 0);
    const uniqueStudents = new Set(regs.map(r => r.regNumber)).size;

    const stats = [
      ["Total Students", uniqueStudents],
      ["Total Registrations", regs.length],
      ["Upcoming Events", upcoming],
      ["Completed Events", completed],
      ["Total Events", events.length],
      ["Available Seats", totalSeatsLeft]
    ];
    $("#statCards").innerHTML = stats.map(([lbl, num]) => `
      <div class="stat-card"><div class="num" data-count="${num}">0</div><div class="lbl">${lbl}</div></div>`).join("");
    animateCounts();

    // charts
    const deptCounts = groupCount(regs, "department");
    const eventCounts = groupCount(regs, "eventTitle");
    $("#chartDept").innerHTML = barChartHTML(deptCounts);
    $("#chartEvent").innerHTML = barChartHTML(eventCounts);
    requestAnimationFrame(() => { requestAnimationFrame(() => $$(".bar-row .fill").forEach(f => f.style.width = f.dataset.w + "%")); });

    // filter dropdown population
    const depts = [...new Set(events.length ? ["Computer Science","Commerce","Business Administration","English Literature","Mathematics","Visual Communication","Physics","Biotechnology"] : [])];
    fillSelect("#filterDept", depts);
    fillSelect("#filterYear", ["1st Year","2nd Year","3rd Year"]);
    fillSelect("#filterEvent", events.map(e => e.title));
    fillSelect("#filterCategory", CATEGORIES);

    drawStudentTable();
  }

  function groupCount(regs, key) {
    const map = {};
    regs.forEach(r => { const k = r[key] || "Unknown"; map[k] = (map[k] || 0) + 1; });
    return Object.entries(map).sort((a,b) => b[1]-a[1]).slice(0, 8);
  }
  function barChartHTML(entries) {
    if (!entries.length) return `<p class="muted" style="font-size:.8rem;">No registrations yet.</p>`;
    const max = Math.max(...entries.map(e => e[1]), 1);
    return entries.map(([label, count]) => `
      <div class="bar-row">
        <span class="lbl">${label}</span>
        <div class="track"><div class="fill" data-w="${Math.round((count/max)*100)}"></div></div>
        <span>${count}</span>
      </div>`).join("");
  }
  function animateCounts() {
    $$("#statCards .num").forEach(el => {
      const target = Number(el.dataset.count);
      let cur = 0;
      const step = Math.max(1, Math.ceil(target / 30));
      const iv = setInterval(() => {
        cur += step;
        if (cur >= target) { cur = target; clearInterval(iv); }
        el.textContent = cur;
      }, 24);
    });
  }
  function fillSelect(sel, values) {
    const el = $(sel);
    const current = el.value;
    el.innerHTML = `<option value="">${el.options[0].textContent}</option>` + values.map(v => `<option value="${v}">${v}</option>`).join("");
    el.value = current;
  }

  function drawStudentTable() {
    const q = ($("#studentSearch").value || "").toLowerCase().trim();
    const fDept = $("#filterDept").value, fYear = $("#filterYear").value, fEvent = $("#filterEvent").value,
          fCat = $("#filterCategory").value, fStatus = $("#filterStatus").value, sortBy = $("#sortBy").value;

    let regs = store.get(LS.registrations, []);
    if (q) {
      regs = regs.filter(r => [r.fullName, r.regNumber, r.studentId, r.email, r.mobile, r.department, r.year, r.eventTitle, r.id]
        .some(v => (v || "").toLowerCase().includes(q)));
    }
    if (fDept) regs = regs.filter(r => r.department === fDept);
    if (fYear) regs = regs.filter(r => r.year === fYear);
    if (fEvent) regs = regs.filter(r => r.eventTitle === fEvent);
    if (fCat) regs = regs.filter(r => r.category === fCat);
    if (fStatus) regs = regs.filter(r => r.status === fStatus);

    const sorters = {
      date: (a,b) => b.createdAt - a.createdAt,
      name: (a,b) => (a.fullName||"").localeCompare(b.fullName||""),
      event: (a,b) => (a.eventTitle||"").localeCompare(b.eventTitle||""),
      department: (a,b) => (a.department||"").localeCompare(b.department||"")
    };
    regs = regs.slice().sort(sorters[sortBy] || sorters.date);

    $("#dashEmpty").classList.toggle("hidden", regs.length !== 0);

    $("#studentTableBody").innerHTML = regs.map(r => `
      <tr data-id="${r.id}">
        <td>${r.fullName}</td><td>${r.regNumber}</td><td>${r.department}</td><td>${r.year}</td>
        <td>${r.eventTitle}</td><td>${r.category}</td><td class="regid">${r.id}</td>
        <td>${fmtDate(r.eventDate)}</td><td><span class="status-pill">${r.status}</span></td>
        <td><button class="btn btn-ghost view-student-btn" data-id="${r.id}" style="padding:6px 12px;font-size:.72rem;">View</button></td>
      </tr>`).join("");

    $("#studentCardList").innerHTML = regs.map(r => `
      <div class="student-card" data-id="${r.id}">
        <div class="stop"><div><h4>${r.fullName}</h4><p>${r.department} · ${r.year}</p></div><span class="status-pill">${r.status}</span></div>
        <p>${r.eventTitle} · <span class="regid" style="font-family:var(--font-mono);">${r.id}</span></p>
      </div>`).join("");

    $$(".view-student-btn, .student-card, #studentTableBody tr").forEach(el => {
      el.addEventListener("click", () => openStudentModal(el.dataset.id));
    });
  }

  ["studentSearch","filterDept","filterYear","filterEvent","filterCategory","filterStatus","sortBy"].forEach(id => {
    $("#" + id).addEventListener("input", drawStudentTable);
    $("#" + id).addEventListener("change", drawStudentTable);
  });

  function openStudentModal(id) {
    const r = store.get(LS.registrations, []).find(x => x.id === id);
    if (!r) return;
    const fields = [
      ["Full Name", r.fullName], ["Date of Birth", r.dob], ["Gender", r.gender], ["Email", r.email],
      ["Mobile", r.mobile], ["Alt. Contact", r.altContact], ["Register No.", r.regNumber], ["Student ID", r.studentId],
      ["College", r.college], ["Department", r.department], ["Degree", r.degree], ["Year", r.year],
      ["Semester", r.semester], ["Section", r.section], ["Roll No.", r.rollNumber],
      ["Event", r.eventTitle], ["Category", r.category], ["Participation", r.participationType],
      ["Team Name", r.teamName], ["Team Members", r.teamMembers], ["Session", r.session],
      ["Skills", r.skills], ["Interests", r.interests], ["Experience", r.experience],
      ["Special Requirements", r.specialReq], ["Notes", r.notes],
      ["Emergency Contact", `${r.emergencyName} (${r.emergencyRelation}) — ${r.emergencyContact}`],
      ["Registration ID", r.id], ["Registered On", new Date(r.createdAt).toLocaleString("en-IN")], ["Status", r.status]
    ];
    $("#studentModalBody").innerHTML = `<h2 style="margin-bottom:14px;">${r.fullName}</h2>
      <div class="em-grid">${fields.map(([k,v]) => `<div class="em-field"><div class="k">${k}</div><div class="v">${v || "—"}</div></div>`).join("")}</div>`;
    $("#studentModal").classList.remove("hidden");
  }

  /* ---------------------------------------------------------------
     13. SCROLL REVEAL
  --------------------------------------------------------------- */
  function initReveal() {
    $$(".section-head, .hscroll, .announce-list").forEach(el => el.classList.add("reveal"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.1 });
    $$(".reveal").forEach(el => io.observe(el));
  }

  /* ---------------------------------------------------------------
     14. INIT
  --------------------------------------------------------------- */
  populateEventSelect();
  renderHome();
  updateNotifDot();
  goTo("home");
  showStep(1);

})();

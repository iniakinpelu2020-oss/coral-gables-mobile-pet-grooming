/* Coral Gables Mobile Pet Grooming — van-to-door deck */
(function () {
  "use strict";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var money = function (n) { return "$" + n; };

  var PHONE = "+13058426190";
  var TZ = "America/New_York";

  var SIZES = {
    small: { label: "Small / Medium Full Groom", short: "Small / Medium", price: 95 },
    large: { label: "Large Full Groom", short: "Large", price: 125 }
  };
  var ADDONS = {
    deshed: { label: "De-Shedding Bath", note: "Undercoat work", price: 80 },
    puppy: { label: "Puppy Intro", note: "First gentle visit", price: 65 },
    nails: { label: "Nail / Ear / Teeth", note: "Finishing details", price: 40 }
  };
  var ORDER = ["deshed", "puppy", "nails"];

  var state = { size: "small", addons: [] };

  /* ---------- boot failsafe ---------- */
  var boot = $("#boot");
  if (boot) {
    window.setTimeout(function () {
      if (boot && boot.parentNode) { boot.parentNode.removeChild(boot); }
    }, 2600);
  }

  /* ---------- today in Miami ---------- */
  (function today() {
    var rows = $$(".hours__table tr[data-day]");
    if (!rows.length) { return; }
    var label;
    try {
      label = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: TZ }).format(new Date());
    } catch (err) {
      label = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];
    }
    rows.forEach(function (row) {
      var cell = $(".hours__now", row);
      if (row.getAttribute("data-day") === label) {
        row.classList.add("is-today");
        if (cell) { cell.textContent = "Today"; }
      } else if (cell && !cell.textContent) {
        cell.textContent = "";
      }
    });
  })();

  /* ---------- elements ---------- */
  var panelTotal = $("#panelTotal");
  var panelSub = $("#panelSub");
  var panelRef = $("#panelRef");
  var panelCall = $("#panelCall");

  var drawerTotal = $("#drawerTotal");
  var drawerSub = $("#drawerSub");
  var drawerList = $("#drawerList");
  var drawerText = $("#drawerText");
  var drawerCall = $("#drawerCall");

  var barTotal = $("#barTotal");
  var deckNote = $("#deckNote");

  function chosen() {
    return ORDER.filter(function (k) { return state.addons.indexOf(k) !== -1; });
  }

  function total() {
    return chosen().reduce(function (sum, k) { return sum + ADDONS[k].price; }, SIZES[state.size].price);
  }

  function subText() {
    var picked = chosen();
    var out = SIZES[state.size].short + " groom";
    if (picked.length) { out += " · " + picked.length + (picked.length === 1 ? " add-on" : " add-ons"); }
    return out;
  }

  function message() {
    var picked = chosen();
    var parts = [SIZES[state.size].label + " " + money(SIZES[state.size].price)].concat(
      picked.map(function (k) { return ADDONS[k].label + " " + money(ADDONS[k].price); })
    );
    return "Hi Coral Gables Mobile Pet Grooming — booking from your site: " + parts.join(" · ") +
      " = " + money(total()) + " (starting). Can you confirm an arrival window?";
  }

  function rowsHtml() {
    var out = "<li><span>" + SIZES[state.size].label + "<small>Full groom</small></span><b>" +
      money(SIZES[state.size].price) + "</b></li>";
    chosen().forEach(function (k) {
      out += "<li><span>" + ADDONS[k].label + "<small>" + ADDONS[k].note + "</small></span><b>" +
        money(ADDONS[k].price) + "</b></li>";
    });
    return out;
  }

  function render(pop) {
    var t = total();
    var rows = rowsHtml();
    var href = "sms:" + PHONE + "?&body=" + encodeURIComponent(message());

    if (panelTotal) {
      panelTotal.textContent = money(t);
      if (pop) {
        panelTotal.classList.add("pop");
        window.setTimeout(function () { panelTotal.classList.remove("pop"); }, 220);
      }
    }
    if (panelSub) { panelSub.textContent = subText(); }
    if (panelRef) { panelRef.textContent = "CG-" + t; }
    if (panelCall) { panelCall.href = "tel:" + PHONE; }

    if (drawerTotal) { drawerTotal.textContent = money(t); }
    if (drawerSub) { drawerSub.textContent = subText(); }
    if (drawerList) { drawerList.innerHTML = rows; }
    if (drawerText) { drawerText.href = href; }
    if (drawerCall) { drawerCall.href = "tel:" + PHONE; }
    if (barTotal) { barTotal.textContent = money(t); }

    $$(".size[data-size]").forEach(function (btn) {
      var on = btn.getAttribute("data-size") === state.size;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });

    $$(".addon[data-addon]").forEach(function (btn) {
      var on = state.addons.indexOf(btn.getAttribute("data-addon")) !== -1;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  /* ---------- size ---------- */
  $$(".size[data-size]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.size = btn.getAttribute("data-size") === "large" ? "large" : "small";
      render(true);
    });
  });

  /* ---------- add-ons ---------- */
  $$(".addon[data-addon]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.getAttribute("data-addon");
      var i = state.addons.indexOf(key);
      if (i === -1) { state.addons.push(key); } else { state.addons.splice(i, 1); }
      render(i === -1);
    });
  });

  /* ---------- van-to-door deck ---------- */
  var DECK_NOTES = {
    park: "01 · It pulls up outside your building with its own water tank, power and dryers.",
    bath: "02 · Warm water, a proper table, forced-air drying and a hand finish — inside the van.",
    door: "03 · Your dog is walked back finished and brushed out, and the street is left as it was."
  };

  $$(".vcard[data-vcard]").forEach(function (card) {
    var act = function () {
      var key = card.getAttribute("data-vcard");
      $$(".vcard[data-vcard]").forEach(function (c) {
        var on = c === card;
        c.classList.toggle("is-front", on);
        c.setAttribute("aria-pressed", on ? "true" : "false");
      });
      if (deckNote && DECK_NOTES[key]) { deckNote.textContent = DECK_NOTES[key]; }
    };
    card.addEventListener("click", act);
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(); }
    });
    card.addEventListener("focus", act);
  });

  render(false);

  /* ---------- drawer ---------- */
  var drawer = $("#drawer");
  var scrim = $("#scrim");
  var drawerClose = $("#drawerClose");
  var lastFocus = null;

  function openDrawer() {
    if (!drawer) { return; }
    lastFocus = document.activeElement;
    render(false);
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    if (scrim) {
      scrim.hidden = false;
      window.requestAnimationFrame(function () { scrim.classList.add("is-open"); });
    }
    document.body.style.overflow = "hidden";
    if (drawerClose) { drawerClose.focus(); }
  }

  function closeDrawer() {
    if (!drawer) { return; }
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    if (scrim) {
      scrim.classList.remove("is-open");
      window.setTimeout(function () {
        if (!drawer.classList.contains("is-open")) { scrim.hidden = true; }
      }, 400);
    }
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
  }

  $$("[data-open-book]").forEach(function (b) { b.addEventListener("click", openDrawer); });
  if (drawerClose) { drawerClose.addEventListener("click", closeDrawer); }
  if (scrim) { scrim.addEventListener("click", closeDrawer); }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer && drawer.classList.contains("is-open")) { closeDrawer(); }
  });
})();

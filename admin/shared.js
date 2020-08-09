window.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth < 800) {
    var nv = $(".navbar_wrapper");
    if (!nv) return;
    nv.classList.add("expandY");
    nv.classList.add("hidden");
    nv.insertAdjacentHTML(
      "beforebegin",
      `
            <div class="btn secondary fill medium" onclick='expandWithArrow(this.next(),$(this).find(".expand"))'>
                <b>Menu</b> <div class='btn expand'><i class='fas fa-chevron-right'></i></div>
            </div>
        `
    );
  }
});

/* set defaults */
datepicker(".datepicker", {
  firstDayOfWeek: 1,
  months: {
    short: [
      "Sty",
      "Lut",
      "Mar",
      "Kwi",
      "Maj",
      "Cze",
      "Lip",
      "Sie",
      "Wrz",
      "Paź",
      "Lis",
      "Gru",
    ],
    long: [
      "Styczeń",
      "Luty",
      "Marzec",
      "Kwiecień",
      "Maj",
      "Czerwiec",
      "Lipiec",
      "Sierpień",
      "Wrzesień",
      "Październik",
      "Listopad",
      "Grudzień",
    ],
  },
  weekdays: {
    short: ["Pon", "Wto", "Śro", "Czw", "Pią", "Sob", "Nie"],
    long: [
      "Poniedziałek",
      "Wtorek",
      "Środa",
      "Czwartek",
      "Piątek",
      "Sobota",
      "Niedziela",
    ],
  },
});

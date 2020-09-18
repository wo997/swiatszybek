/* js[product] */

var swiper;
var galleryThumbs;

var RATING = 0;

window.addEventListener("DOMContentLoaded", function () {
  if ($(".swiper-container") != null) {
    galleryThumbs = new Swiper(".gallery-thumbs", {
      centerInsufficientSlides: true,
      // spaceBetween: 10,
      slidesPerView: 4,
      freeMode: true,
      watchSlidesVisibility: true,
      watchSlidesProgress: true,
    });

    swiper = new Swiper(".product-main-slider", {
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      thumbs: {
        swiper: galleryThumbs,
        autoScrollOffset: 1,
      },
    });

    setTimeout(() => {
      setCustomHeights();
    });
  }

  // rating
  var r = $$(".my-rating span");
  for (i = 0; i < r.length; i++) {
    r[i].setAttribute("data-rating", 5 - i);
    r[i].addEventListener("click", function () {
      var rating = this.getAttribute("data-rating");
      RATING = rating;
      $(".my-rating").className = "rating my-rating rating" + rating;
    });
  }
  var variantButtons = $$(".boxy");
  for (var i = 0; i < variants.length; i++) {
    var variant = variants[i];

    var basket_item = user_basket.find((b) => {
      return b.variant_id == variant.variant_id;
    });
    variant.quantity = basket_item ? basket_item.quantity : 0;
    var left = variant.stock - variant.quantity;

    if (left > 0) {
      variantButtons[i].click();
      break;
    }
  }

  youAlreadyHaveIt();

  userBasketUpdated();
});

function userBasketUpdated() {
  for (basket_item of user_basket) {
    var variant = variants.find((v) => {
      return v.variant_id == basket_item.variant_id;
    });
    if (variant) {
      variant.quantity = basket_item.quantity;
    }
  }
}

function youAlreadyHaveIt(animate_variant_id = null) {
  var juzMasz = "";
  var total = 0;
  for (basket_item of user_basket) {
    var variant = variants.find((v) => {
      return v.variant_id == basket_item.variant_id;
    });

    if (!variant) continue;

    var animate =
      animate_variant_id == basket_item.variant_id
        ? "style='animation: blink 0.5s'"
        : "";

    var total_price = 0;
    for (p = 0; p < basket_item.quantity; p++) {
      total_price += parseFloat(variant.price);
      total++;
    }

    var remove = `<button class='removeBtn' onclick='addItem(${basket_item.variant_id},-1)'>-</button>`;
    var add = `<button class='addBtn' ${
      basket_item.quantity <= 0 ? "style='visibility:hidden'" : ""
    } onclick='addItem(${basket_item.variant_id},1)'>+</button>`;

    juzMasz += `<tr ${animate}><td>${variant.name}</td><td class='oneline'>${remove}${basket_item.quantity} szt.${add}</td><td class='pln oneline'>${total_price} zł</td></tr>`;
  }

  clickVariant(VARIANT_ID);

  if (juzMasz != "") {
    juzMasz =
      "<h3 style='margin:25px 0 10px'>W Twoim koszyku już " +
      (total == 1 && false ? "jest" : "są") +
      ":</h3><table class='item-list'>" +
      juzMasz +
      "</table>";
    juzMasz += `<a class="btn primary medium fill" href="/zakup" style="margin-top: 20px">
                    Przejdź do koszyka
                    <i class="fa fa-chevron-right"></i>
                  </a>`;
  }
  $("#juzMasz").innerHTML = juzMasz;

  setTimeout(function () {
    removeClasses("seethrough");
  }, 10);
}

function addItem(variant_id, diff) {
  addItemtoBasket(variant_id, diff, (json) => {
    user_basket = json.basket;
    userBasketUpdated();

    youAlreadyHaveIt(variant_id);

    var variant = variants.find((v) => {
      return v.variant_id == VARIANT_ID;
    });
    if (diff == 1 && variant && variant.quantity == 1) {
      showPopup();
    }
  });
}

var variant_to_image = [];

var VARIANT_ID = null;

function clickVariant(variant_id) {
  $("#buyNow").toggleAttribute("disabled", true);

  if (!variant_id) return;

  var variant = variants.find((v) => {
    return v.variant_id == variant_id;
  });
  var basket_item = user_basket.find((b) => {
    return b.variant_id == variant_id;
  });
  variant.quantity = basket_item ? basket_item.quantity : 0;

  VARIANT_ID = variant_id;
  if (swiper != null && variant_to_image[VARIANT_ID] != -1)
    swiper.slideTo(variant_to_image[VARIANT_ID], 300, null);

  $("#updateChoosenImage").setAttribute("data-src", variant.zdjecie);
  lazyLoadImages();

  $("#updateChoosenVariant").innerHTML = " " + variant.name;
  $("#updateChoosenAmountCost").innerHTML =
    variant.price - variant.rabat + " zł";

  var left = variant.stock - variant.quantity;

  var low = left < 5 ? "style='font-weight:bold;color:red'" : "";

  $(
    "#quantity"
  ).innerHTML = `Dostępność: <span class="pln" ${low}>${left} szt.</span>`;

  $("#buyNow").toggleAttribute("disabled", left == 0);

  $("#caseLast").style.display =
    left == 0 && variant.stock > 0 ? "block" : "none";
  $("#caseZero").style.display = left == 0 ? "block" : "none";

  $$(".caseZero").forEach((e) => {
    e.style.display = left == 0 ? "block" : "none";
  });
  $$(".caseMore").forEach((e) => {
    e.style.display = left > 0 ? "block" : "none";
  });
}

// komentarze start

document.addEventListener("DOMContentLoaded", function () {
  createDatatable({
    name: "comments",
    lang: {
      subject: "komentarzy",
    },
    url: "/search_comments",
    params: () => {
      return {
        product_id: PRODUCT_ID,
      };
    },
    renderRow: (r) => {
      var canDelete = r.user_id == USER_ID;
      var canAccept = r.accepted == 0;
      if (!IS_ADMIN) canAccept = false;
      if (IS_ADMIN) canDelete = true;

      var buttons = "";
      if (canDelete)
        buttons += `<button class='btn red' style='margin-left:10px' onclick='commentAction(${r.comment_id},-1)'>Usuń</button>`;
      if (canAccept)
        buttons += `<button class='btn primary' style='margin-left:10px' onclick='commentAction(${r.comment_id},1)'>Akceptuj</button>`;

      return `<div class='comment_header'><div class='pseudonim'>${r.pseudonim} ${r.rating} ${buttons}</div><div class='dodano'>${r.dodano}</div></div><div class='text-wrap'>${r.tresc}</div>`;
    },
    controls: ``,
  });
});

function commentAction(i, action) {
  if (action == -1 && !confirm("Czy aby na pewno chcesz usunąć komentarz?"))
    return;
  ajax(
    "/commentAction",
    {
      comment_id: i,
      action: action,
    },
    () => {
      comments.search(() => {
        $("#formComment").style.display = "block";
        $("#commentSent").style.display = "none";
      });
    },
    () => {}
  );
}

function newComment() {
  var req = document.getElementsByClassName("required");
  for (i = 0; i < req.length; i++) {
    var input = req[i];
    if (input.value == "") {
      input.style.borderColor = "red";
      input.oninput = function () {
        this.style.borderColor = "";
      };
      return;
    }
  }

  xhr({
    url: "/addComment",
    params: {
      product_id: PRODUCT_ID,
      pseudonim: $("#pseudonim").value,
      tresc: $("#tresc").value,
      rating: RATING,
    },
    success: (res) => {
      comments.search(() => {
        $("#formComment").style.display = "none";

        var out = "<h3>Dziękujemy za przekazaną opinię!</h3>";
        try {
          if (res.kod_rabatowy) {
            out += `<div style='font-size: 24px;margin: 10px 0;display:block;'>Twój kod rabatowy: <span style='font-weight: bold;color: #37f;'>${res.kod_rabatowy}</span></div>`;
            out += `<div>Kopię otrzymasz na skrzynkę pocztową</div>`;
          }
        } catch (e) {}

        $("#commentSent").innerHTML = out;
        $("#commentSent").style.display = "block";
      });
    },
  });
}

// komentarze end

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function sendNotification() {
  var e = $("#notification_email");
  var email = e.value;
  $("#user_email").innerHTML = email;
  if (!validateEmail(email)) {
    e.style.borderColor = "red";
    return;
  }
  ajax(
    "/user_notify_variant",
    {
      variant_id: ids[VARIANT_ID],
      email: email,
    },
    () => {
      $("#whenNotificationAdded").style.display = "block";
      $("#hideWhenNotificationAdded").style.display = "none";
    },
    null
  );
}

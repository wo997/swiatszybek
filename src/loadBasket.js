document.addEventListener("DOMContentLoaded", reloadBasket);

function reloadBasket() {
  var basket = localStorage.getItem('basket');
  if (basket == null) basket = "";
  var req = new XMLHttpRequest();
  req.open('POST', '/showBasket', true);
  req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  req.onreadystatechange = function (aEvt) {
    if (req.readyState == 4) {
      if(req.status == 200)
      {
        var res = JSON.parse(req.responseText);
        var basketContent = res[1];
        var total = res[0];

        document.getElementById("basketContent").innerHTML = basketContent;

        var items = document.getElementsByClassName("items")[0];
        if (items != null && items.querySelectorAll('.items > *').length > 4)
        {
          items.classList.add("moreThanOneRow");
        }
        else
        {
          items.classList.remove("moreThanOneRow");
        }
      }
    }
  };
  req.send("basket="+basket);
}

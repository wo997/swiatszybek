/* js[global] */

function addItemtoBasket(variant_id, diff, callback) {
  if (diff > 0) url = "/basket/add/" + variant_id + "/" + diff;
  else url = "/basket/remove/" + variant_id + "/" + -diff;

  xhr({
    url: url,
    success: (res) => {
      setContent($("#basketContent"), res.basket_content_html);

      $("#amount").innerHTML = res.item_count; // header basket

      if (callback) {
        callback(res);
      }
    },
  });
}

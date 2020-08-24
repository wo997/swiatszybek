/* js[global] */

function dateToString(d, type = "") {
  var mon = d.getMonth() + 1;
  var day = d.getDate();

  if (mon < 10) mon = "0" + mon;
  if (day < 10) day = "0" + day;

  return type == "dmy"
    ? day + "-" + mon + "-" + d.getFullYear()
    : d.getFullYear() + "-" + mon + "-" + day;
}

function reverseDateString(dateString, splitter) {
  return dateString.split(splitter).reverse().join(splitter);
}

/* js[global] */

function dateToString(datetime, type = "") {
  var mon = datetime.getMonth() + 1;
  var day = datetime.getDate();

  if (mon < 10) mon = "0" + mon;
  if (day < 10) day = "0" + day;

  return type == "dmy"
    ? day + "-" + mon + "-" + datetime.getFullYear()
    : datetime.getFullYear() + "-" + mon + "-" + day;
}

function reverseDateString(dateString, splitter) {
  return dateString.split(splitter).reverse().join(splitter);
}

function changeDatetime(datetimeString, diff) {
  var datetime = new Date(datetimeString);
  datetime.setTime(datetime.getTime() + diff);
  return dateToString(datetime);
}

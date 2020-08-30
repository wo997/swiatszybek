/* js[global] */

function scrollToElement(elem, options = {}) {
  if (!elem) return;
  var rect = elem.getBoundingClientRect();
  var diff =
    (options.parent ? position(elem) : rect).top - nonull(options.offset, 0);
  if (options.parent) {
    diff -= options.parent.scrollTop;
  }
  if (!options.top) {
    diff += (rect.height - window.innerHeight) * 0.5;
  }
  var sag = nonull(options.sag, 100);
  if (Math.abs(diff) > sag) {
    diff -= sag * Math.sign(diff);
    scrollFromTo(options.parent, diff, nonull(options.duration, 50));
  }
}
function scrollFromTo(parent, diff, time, t = 0) {
  if (time < 2) {
    time = 2;
  }
  var d = (4 * diff * (time / 2 - Math.abs(time / 2 - t))) / (time * time);
  if (parent) {
    parent.scrollTop += d;
  } else window.scrollBy(0, d);

  if (t < time)
    window.requestAnimationFrame(function () {
      scrollFromTo(parent, diff, time, t + 1);
    });
}

function getWindowScroll() {
  var doc = document.documentElement;
  var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
  var top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
  return { left: left, top: top };
}

function smoothScroll(diff, params = {}) {
  var time = 40;
  var t = 0;
  if (params.time) time = params.time;
  if (params.t) t = params.t;

  window.scrollBy(
    0,
    (4 * diff * (time / 2 - Math.abs(time / 2 - t))) / (time * time)
  );
  if (t < time) {
    requestAnimationFrame(() => {
      smoothScroll(diff, { time: time, t: t + 1 });
    });
  } else if (params.callback) {
    params.callback();
  }
}

function scrollToView(elem, params = {}) {
  var time = 40;
  var offset = 0;
  var margin = 0.2;
  if (params.time) time = params.time;
  if (params.offset) time = params.offset;
  if (params.margin) margin = params.margin;

  var r = elem.getBoundingClientRect();

  var top = r.top + offset;
  var bottom = r.top + r.height + offset;

  var topMin = window.innerHeight * margin;
  var bottomMin = window.innerHeight * (1 - margin);

  var diff = 0;

  if (top < topMin) {
    diff = top - topMin;
  } else if (bottom > bottomMin) {
    diff = bottom - bottomMin;
  }

  smoothScroll(diff, { time: time, callback: params.callback });
}

function scrollToBottom(node) {
  node.scrollTop = node.scrollHeight;
}

function toggleBodyScroll(disable) {
  if (!window.tempScrollTop) {
    window.tempScrollTop = window.pageYOffset;
  }
  if (disable) {
    document.body.classList.add("disable-scroll");
    document.body.style.top = `-${window.tempScrollTop}px`;
  } else {
    document.body.classList.remove("disable-scroll");
    document.body.style.top = `0px`;
    window.scrollTo({ top: window.tempScrollTop });
    window.tempScrollTop = null;
  }
}

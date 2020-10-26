/* js[global] */

function loadScript(src, options = {}) {
  var script = document.createElement("script");
  Object.entries(options).forEach(([key, value]) => {
    script.setAttribute(key, value);
  });
  script.src = src;
  document.head.appendChild(script);
}

function loadStylesheet(href, options = {}) {
  var link = document.createElement("link");
  Object.entries(options).forEach(([key, value]) => {
    link.setAttribute(key, value);
  });
  link.href = href;
  document.head.appendChild(link);
}

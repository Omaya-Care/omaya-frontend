var render, fill;

render = function (fillColor, el) {
  var svg = el;
  if (typeof el === "string") svg = document.querySelector(el);
  if (!svg) return;
  var ns = "http://www.w3.org/2000/svg";
  var size = svg.getAttribute("viewBox")
    ? Math.max.apply(
        null,
        svg.getAttribute("viewBox").split(" ").slice(2).map(Number)
      )
    : 40;
  var cx = size / 2;
  var hw = size * 0.33;
  var tipFraction = 0.28;
  var tipY = size * tipFraction;
  var midOffset = size * 0.14;
  var frondCount = 6;
  var paths = [];
  var i;
  for (i = 0; i < frondCount; i++) {
    var t = i / (frondCount - 1);
    var y = tipY + t * (size - tipY - midOffset * 2);
    var curve = t < 0.5 ? 0.15 + t * 0.18 : 0.24 - (t - 0.5) * 0.18;
    var leftX = cx - hw * curve;
    var rightX = cx + hw * curve;
    var midY = y + midOffset;
    var cpX = cx;
    var cpY1 = y + midOffset * (1 - t * 0.3);
    var cpY2 = midY + midOffset * (1 - (1 - t) * 0.3);
    paths.push(
      "M" +
        leftX.toFixed(1) +
        " " +
        y.toFixed(1) +
        " Q" +
        cpX.toFixed(1) +
        " " +
        cpY1.toFixed(1) +
        " " +
        cx.toFixed(1) +
        " " +
        midY.toFixed(1) +
        " Q" +
        cpX.toFixed(1) +
        " " +
        cpY2.toFixed(1) +
        " " +
        rightX.toFixed(1) +
        " " +
        y.toFixed(1)
    );
  }
  var stem = "M" + cx.toFixed(1) + " " + tipY.toFixed(1) + " L" + cx.toFixed(1) + " " + (size - midOffset).toFixed(1);
  svg.innerHTML =
    '<path d="' +
    stem +
    '" stroke="' +
    fillColor +
    '" stroke-width="' +
    Math.max(size / 22, 2).toFixed(1) +
    '" fill="none" stroke-linecap="round"/>' +
    paths
      .map(function (d) {
        return (
          '<path d="' +
          d +
          '" stroke="' +
          fillColor +
          '" stroke-width="' +
          Math.max(size / 28, 1.6).toFixed(1) +
          '" fill="none" stroke-linecap="round"/>'
        );
      })
      .join("");
};

fill = function (el) {
  var target = typeof el === "string" ? document.querySelector(el) : el;
  if (!target) return;
  var style = getComputedStyle(target);
  var color = style.color;
  if (!color || color === "transparent" || color === "rgba(0, 0, 0, 0)") {
    color = "#7A2850";
  }
  render(color, target);
};

if (typeof window !== "undefined" && window === window.top) {
  if (document.readyState !== "loading") {
    fill(document.getElementById("omaya-mark"));
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      fill(document.getElementById("omaya-mark"));
    });
  }
}

export { render, fill };

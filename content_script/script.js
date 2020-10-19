var canvas, ctx, startElem;
var canvasx = canvasy = last_mousex = last_mousey = mousex = mousey = 0;
var mousedown = false;

var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "PICK_POSITION":
      mousedown = true;
      canvas.style.cursor = 'crosshair';
      break;
    default:
      console.log("nothing to do.");
  }
  return true;
});

function setupHorizontalRuler() {
  const marker_5 = "<div style='left:{lt};' class='horizontal__markers h5'></div>";
  const marker_10 = "<div style='left:{lt};' class='horizontal__markers h10'></div>";
  const marker_15 = "<div style='left:{lt};' class='horizontal__markers h15'></div>";

  const horizontalElem = document.getElementById("main-horizontal");

  return new Promise(resolve => {
    let count = 1;
    for (let i = 0; i < windowWidth; i += 10) {
      if (count % 10 === 0) {
        horizontalElem.innerHTML += marker_15.replace("{lt}", `${i}px`);
      } else if (count % 5 === 0) {
        horizontalElem.innerHTML += marker_10.replace("{lt}", `${i}px`);
      } else {
        horizontalElem.innerHTML += marker_5.replace("{lt}", `${i}px`);
      }
      count++;
    }
    return resolve(true);
  });
}

function setupVerticalRuler() {
  const marker_5 = "<div style='top:{tp};' class='vertical__markers w5'></div>";
  const marker_10 = "<div style='top:{tp};' class='vertical__markers w10'></div>";
  const marker_15 = "<div style='top:{tp};' class='vertical__markers w15'></div>";

  const verticalElem = document.getElementById("main-vertical");

  return new Promise(resolve => {
    let count = 1;
    for (let i = 0; i < windowHeight; i += 10) {
      if (count % 10 === 0) {
        verticalElem.innerHTML += marker_15.replace("{tp}", `${i}px`);
      } else if (count % 5 === 0) {
        verticalElem.innerHTML += marker_10.replace("{tp}", `${i}px`);
      } else {
        verticalElem.innerHTML += marker_5.replace("{tp}", `${i}px`);
      }
      count++;
    }
    return resolve(true);
  });
}

function handleVerticalDrag(e) {
  e.target.style.left = `${Math.abs(e.clientX)}px`;
}

function handleHorizontalDrag(e) {
  e.target.style.top = `${Math.abs(e.clientY)}px`;
}

Promise.all([fetch(chrome.runtime.getURL("/content_script/rulers.html")), fetch(chrome.runtime.getURL("/content_script/styles.css"))])
  .then(([resp1, resp2]) => Promise.all([resp1.text(), resp2.text()]))
  .then(([html, css]) => {
    const gridify = document.getElementById("grid-master");
    if (gridify) {
      gridify.remove();
      throw new Error("Cancel gridify..............");
    }

    document.body.innerHTML += html.replace("{{style}}", css);
  })
  .catch(err => {
    console.error(err);
  })
  .then(() => {
    return Promise.all([setupHorizontalRuler(), setupVerticalRuler()]);
  })
  .then(() => {
    const horizontalElem = document.getElementById("horizontal-drag");
    horizontalElem.ondragend = handleHorizontalDrag;

    const verticalElem = document.getElementById("vertical-drag");
    verticalElem.ondragend = handleVerticalDrag;
  })
  .then(() => {
    canvas = document.getElementById("main-canvas");
    ctx = canvas.getContext('2d');

    canvasx = canvas.offsetLeft;
    canvasy = canvas.offsetTop;
    canvas.width = windowWidth - canvasx;
    canvas.height = windowHeight - canvasy;

    document.body.oncontextmenu = function (e) {
      last_mousex = parseInt(e.clientX - canvasx);
      last_mousey = parseInt(e.clientY - canvasy);
      mousedown = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (startElem) {
        startElem.classList.remove("gridify__border");
      }

      [, startElem] = document.elementsFromPoint(last_mousex, last_mousey);
      startElem.classList.add("gridify__border");
    };

    canvas.onmousemove = function (e) {
      if (mousedown) {
        mousex = parseInt(e.clientX - canvasx);
        mousey = parseInt(e.clientY - canvasy);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(last_mousex, last_mousey);
        ctx.lineTo(last_mousex, mousey);
        ctx.textBaseline = "middle";
        ctx.font = "bold 10pt Sans Serif"
        const yDiff = mousey - last_mousey;
        const absYDiff = Math.abs(yDiff);
        const yTextSize = ctx.measureText(absYDiff);
        ctx.fillStyle = "#F35E3C";
        ctx.fillRect(last_mousex - (`${absYDiff}`.length * 10) - 3, (last_mousey + (yDiff / 2) - 5), yTextSize.width + 6, 15);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(absYDiff, last_mousex - (`${absYDiff}`.length * 10), (last_mousey + (yDiff / 2)));
        ctx.lineTo(mousex, mousey);
        const xDiff = mousex - last_mousex;
        const absXDiff = Math.abs(xDiff);
        const xTextSize = ctx.measureText(absXDiff);
        ctx.fillStyle = "#F35E3C";
        ctx.fillRect((last_mousex + (xDiff / 2) - 3), mousey - 15, xTextSize.width + 6, 15);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(absXDiff, (last_mousex + (xDiff / 2)), mousey - 10);
        ctx.strokeStyle = '#F35E3C';
        ctx.lineWidth = 1;
        ctx.lineJoin = ctx.lineCap = 'round';
        ctx.stroke();
      }
    };

    function getRecalcPosition({ lastXPosition, xPosition, lastYPosition, yPosition }) {
      const elemPosition = startElem.getBoundingClientRect();
      if (lastXPosition > xPosition) {
        lastXPosition = parseInt(elemPosition.left);
      } else {
        lastXPosition = parseInt(elemPosition.right);
      }

      if (lastYPosition > yPosition) {
        lastYPosition = parseInt(elemPosition.top);
      } else {
        lastYPosition = parseInt(elemPosition.bottom);
      }

      return { lastXPosition, xPosition, lastYPosition, yPosition };
    }
  });
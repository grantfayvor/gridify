function setupHorizontalRuler() {
  const marker_5 = "<div class='horizontal__markers h5'></div>";
  const marker_10 = "<div class='horizontal__markers h10'></div>";
  const marker_15 = "<div class='horizontal__markers h15'></div>";

  const windowWidth = window.innerWidth;
  const horizontalElem = document.getElementById("main-horizontal");

  for (let i = 0; i < windowWidth; i += 5) {
    if ((i * 5) % 15 === 0) {
      horizontalElem.innerHTML += marker_15;
    } else if ((i * 5) % 10 === 0) {
      horizontalElem.innerHTML += marker_10;
    } else {
      horizontalElem.innerHTML += marker_5;
    }
  }
}

window.onload = () => {
  setupHorizontalRuler();
}
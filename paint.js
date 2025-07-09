const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const colorPicker = document.getElementById("colorPicker");
const brushSize = document.getElementById("brushSize");
const clearButton = document.getElementById("clear");

let painting = false;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function startPosition(e) {
  painting = true;
  draw(e);
}

function endPosition() {
  painting = false;
  ctx.beginPath();
}

function draw(e) {
  if (!painting) return;

  ctx.lineWidth = brushSize.value;
  ctx.lineCap = "round";
  ctx.strokeStyle = colorPicker.value;

  ctx.lineTo(e.clientX, e.clientY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.clientX, e.clientY);
}

canvas.addEventListener("mousedown", startPosition);
canvas.addEventListener("mouseup", endPosition);
canvas.addEventListener("mousemove", draw);

clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

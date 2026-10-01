const canvas = document.querySelector("#ticketCanvas");
const context = canvas.getContext("2d");
const numberInput = document.querySelector("#numberInput");
const downloadButton = document.querySelector("#downloadButton");
const shareButton = document.querySelector("#shareButton");
const shareMessageInput = document.querySelector("#shareMessage");
const copyMessageButton = document.querySelector("#copyMessageButton");
const statusMessage = document.querySelector("#montageStatus");
const ticketImage = new Image();

const params = new URLSearchParams(window.location.search);
const requestedNumber = params.get("numero") || "";
const requestedPerson = (params.get("compartidoCon") || "").trim();
const givenAmountParam = params.get("dado");
const givenAmount = givenAmountParam === null ? null : Number(givenAmountParam);
const hasGivenAmount = givenAmount !== null && Number.isFinite(givenAmount) && givenAmount > 0;
let shareMessageEdited = false;
if (/^\d{1,5}$/.test(requestedNumber)) numberInput.value = requestedNumber.padStart(5, "0");
shareMessageInput.value = suggestedShareMessage();
if (typeof navigator.share === "function") shareButton.hidden = false;

ticketImage.addEventListener("load", drawMontage);
ticketImage.addEventListener("error", () => {
  statusMessage.textContent = "No se ha podido cargar la imagen del décimo.";
});
ticketImage.src = "img/fondodecimo.jpg";

numberInput.addEventListener("input", () => {
  const digits = numberInput.value.replace(/\D/g, "").slice(0, 5);
  if (numberInput.value !== digits) numberInput.value = digits;
  if (!shareMessageEdited) shareMessageInput.value = suggestedShareMessage();
  drawMontage();
});
shareMessageInput.addEventListener("input", () => { shareMessageEdited = true; });

downloadButton.addEventListener("click", async () => {
  try {
    const blob = await makeImageBlob();
    downloadBlob(blob);
    statusMessage.textContent = `Imagen del ${numberInput.value} descargada.`;
  } catch {
    statusMessage.textContent = "No se ha podido generar la imagen.";
  }
});

shareButton.addEventListener("click", async () => {
  try {
    const file = new File([await makeImageBlob()], `decimo-${numberInput.value}.jpg`, { type: "image/jpeg" });
    if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: `Décimo ${numberInput.value}` });
    } else {
      downloadBlob(file);
      statusMessage.textContent = "Tu navegador no permite compartir archivos; se ha descargado la imagen.";
    }
  } catch (error) {
    if (error.name !== "AbortError") statusMessage.textContent = "No se ha podido compartir la imagen.";
  }
});

copyMessageButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(shareMessageInput.value);
    statusMessage.textContent = "Mensaje copiado.";
  } catch {
    shareMessageInput.focus();
    shareMessageInput.select();
    statusMessage.textContent = "No se pudo copiar automáticamente. El texto está seleccionado para copiarlo.";
  }
});

function suggestedShareMessage() {
  const number = numberInput.value || "_____";
  const greeting = requestedPerson ? `Hola, ${requestedPerson}. ` : "";
  return `${greeting}Te comparto el décimo de Navidad número ${number}. ¡Mucha suerte!`;
}

function drawMontage() {
  if (!ticketImage.complete || !ticketImage.naturalWidth) return;
  canvas.width = ticketImage.naturalWidth;
  canvas.height = ticketImage.naturalHeight;
  context.drawImage(ticketImage, 0, 0);

  const number = numberInput.value;
  const validNumber = /^\d{5}$/.test(number);
  downloadButton.disabled = !validNumber;
  shareButton.disabled = !validNumber;
  copyMessageButton.disabled = !validNumber;
  statusMessage.textContent = validNumber ? "La imagen está lista para compartir." : "Introduce un número de cinco cifras.";
  if (!validNumber) return;


    const digitWords = ["CERO", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
    const firstBomboX = canvas.width * 0.389;
    const bomboSpacing = canvas.width * 0.086;
    const digitY = canvas.height * 0.179;
  context.save();
  context.textAlign = "center";
  context.textBaseline = "middle";
    context.font = `700 ${Math.round(canvas.height * 0.13)}px Arial, Helvetica, Calibri, sans-serif`;
    context.lineJoin = "round";
    context.lineWidth = canvas.width * 0.0025;
    context.strokeStyle = "rgba(255, 254, 250, 0.88)";
    context.fillStyle = "#1d1b16";
    [...number].forEach((digit, index) => {
      const centerX = firstBomboX + bomboSpacing * index;
      context.strokeText(digit, centerX, digitY);
      context.fillText(digit, centerX, digitY);
    });
    context.font = `700 ${Math.round(canvas.height * 0.022)}px "DM Sans", Arial, sans-serif`;
    context.textBaseline = "alphabetic";
    [...number].forEach((digit, index) => {
      context.fillText(digitWords[Number(digit)], firstBomboX + bomboSpacing * index, canvas.height * 0.252);
    });
  if (hasGivenAmount) drawGivenAmount();
  context.restore();
}

function drawGivenAmount() {
  const boxWidth = canvas.width * 0.112;
  const boxHeight = canvas.height * 0.1;
  const centerX = canvas.width * 0.898;
  const centerY = canvas.height * 0.676;
  const boxX = centerX - boxWidth / 2;
  const boxY = centerY - boxHeight / 2;

  context.fillStyle = "#fffefa";
  context.fillRect(boxX, boxY, boxWidth, boxHeight);
  context.strokeStyle = "#c39342";
  context.lineWidth = canvas.width * 0.0018;
  context.strokeRect(boxX, boxY, boxWidth, boxHeight);
  context.fillStyle = "#1d1b16";
  context.font = `700 ${Math.round(boxHeight * 0.72)}px Arial, Helvetica, Calibri, sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 }).format(givenAmount), centerX, centerY, boxWidth * 0.9);
}

function makeImageBlob() {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Image export failed")), "image/jpeg", 0.94);
  });
}

function downloadBlob(blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `decimo-${numberInput.value}.jpg`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

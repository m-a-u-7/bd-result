const form = document.getElementById("resultForm");
const container = document.getElementById("resultContainer");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const roll = document.getElementById("roll").value.trim();
  const reg = document.getElementById("reg").value.trim();

  const payload = { roll };
  if (reg) payload.reg = reg;

  try {
    const res = await fetch("https://your-render-backend.onrender.com/api/result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!data.success) {
      container.innerHTML = `<p style="color:red">${data.error}</p>`;
      return;
    }

    container.innerHTML = data.partial
      ? `<p><i>Partial result shown.</i></p>${data.html}`
      : data.html;
  } catch (err) {
    container.innerHTML = `<p style="color:red">Fetch failed!</p>`;
  }
});

const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

app.post("/api/result", async (req, res) => {
  const { roll, reg } = req.body;

  if (!roll) {
    return res.status(400).json({ error: "Roll number is required" });
  }

  const formData = new URLSearchParams();
  formData.append("roll", roll);
  if (reg) formData.append("regno", reg);

  try {
    const response = await fetch("https://www.jessoreboard.gov.bd/resultjbs25/result.php", {
      method: "POST",
      body: formData,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const html = await response.text();

    res.json({
      success: true,
      html,
      partial: !reg,
    });
  } catch (error) {
    res.status(500).json({ error: "Result fetch failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

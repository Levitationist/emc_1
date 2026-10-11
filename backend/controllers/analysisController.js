import * as analysisService from "../services/analysisService.js";

export async function analyze(req, res) {
  try {
    const result = await analysisService.runAnalysis({
      file: req.file,
      jd: (req.body.jd || "").trim(),
      userId: req.user.id,
    });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

export async function history(req, res) {
  try {
    res.json(await analysisService.getHistory(req.user.id));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

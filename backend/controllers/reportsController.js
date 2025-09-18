// backend/controllers/reportsController.js
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import Pickup from "../models/Pickup.js";
import Stop from "../models/Stop.js";
import Dropoff from "../models/Dropoff.js";

export async function getDailyReport(req, res) {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const uid = req.user?.uid || process.env.DEV_UID || "demo-driver-uid";

    const stops = await Stop.find({ date, driverUid: uid }).lean();
    const pickups = await Pickup.find({ date, driverUid: uid })
      .sort({ createdAt: -1 })
      .lean();
    const dropoffs = await Dropoff.find({ date, driverUid: uid })
      .sort({ time: 1 })
      .lean();

    // Remove name resolution to avoid collisions; show uid only in JSON
    

    const totals = {
      assigned: stops.length,
      collected: pickups.filter(p => p.action === "collected").length,
      missed:    pickups.filter(p => p.action === "missed").length,
      skipped:   pickups.filter(p => p.action === "skipped").length,
    };

    const stopById = new Map(stops.map(s => [String(s._id), s]));
    const activity = pickups.map(p => ({
      id: String(p._id),
      action: p.action,
      createdAt: p.createdAt,                 // ISO string
      stopId: String(p.stopId),
      stopTitle: stopById.get(String(p.stopId))?.title ?? `Stop ${p.stopId}`,
      reason: p.reason ?? null,
    }));

    const dropoffTotals = {
      count: dropoffs.length,
      weightKg: dropoffs.reduce((sum, d) => sum + (d.weightKg || 0), 0)
    };

    res.json({ date, totals, activity, dropoffs, dropoffTotals });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to get daily report" });
  }
}

export async function getDailyReportPdf(req, res) {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const uid = req.user?.uid || process.env.DEV_UID || "demo-driver-uid";

    const stops = await Stop.find({ date, driverUid: uid }).lean();
    const pickups = await Pickup.find({ date, driverUid: uid })
      .sort({ createdAt: -1 })
      .lean();
    const dropoffs = await Dropoff.find({ date, driverUid: uid })
      .sort({ time: 1 })
      .lean();

    const totals = {
      assigned: stops.length,
      collected: pickups.filter(p => p.action === "collected").length,
      missed:    pickups.filter(p => p.action === "missed").length,
      skipped:   pickups.filter(p => p.action === "skipped").length,
    };

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="EcoGrid_Daily_${date}_${uid}.pdf"`);

    const margin = 48;
    const doc = new PDFDocument({ margin, layout: "landscape" });
    doc.pipe(res);

    const pageWidth = doc.page.width;
    const contentRight = pageWidth - margin;
    const tableLeft = margin;
    const tableRight = contentRight - 2; // a bit inset
    const tableWidth = tableRight - tableLeft;

    // Helper: header with optional logo
    function drawHeader() {
      const startY = doc.y;
      const logoCandidates = [
        path.resolve(process.cwd(), "../frontend/public/Eco.png"),
        path.resolve(process.cwd(), "public/Eco.png"),
      ];
      const logoPath = logoCandidates.find(p => {
        try { return fs.existsSync(p); } catch { return false; }
      });

      const titleX = margin;
      let textX = titleX;
      let y = startY;
      if (logoPath) {
        try {
          const logoHeight = 20; // slightly taller for visibility
          // Try to measure image to avoid overlap
          let logoWidth = logoHeight;
          try {
            const img = doc.openImage ? doc.openImage(logoPath) : null;
            if (img && img.width && img.height) {
              logoWidth = Math.max(logoHeight * (img.width / img.height), logoHeight);
            }
          } catch {}
          doc.image(logoPath, margin, y, { height: logoHeight });
          textX = margin + logoWidth + 10;
        } catch { /* ignore logo errors */ }
      }

      doc.fillColor("#228B22").font("Helvetica-Bold").fontSize(18).text("Daily Driver Report", textX, y);
      doc.font("Helvetica").fontSize(11).fillColor("#333");
      const meta = `Date: ${date}    Driver: ${uid}`;
      doc.text(meta, textX, doc.y + 2);
      doc.moveDown(0.9);
      // hairline
      const lineY = doc.y + 2;
      doc.moveTo(tableLeft, lineY).lineTo(tableRight, lineY).strokeColor("#e2e8f0").lineWidth(1).stroke();
      doc.moveDown(1.0);
    }

    function sectionTitle(text) {
      doc.font("Helvetica-Bold").fontSize(13).fillColor("#228B22").text(text);
      doc.moveDown(0.3);
      doc.font("Helvetica").fillColor("#333").fontSize(12);
    }

    function ensureSpace(height, headerFn) {
      const bottom = doc.page.height - margin;
      if (doc.y + height > bottom) {
        doc.addPage({ margin, layout: "landscape" });
        if (headerFn) headerFn();
      }
    }

    function drawSummary() {
      // four small blocks in a row
      const labels = [
        ["Assigned", totals.assigned],
        ["Collected", totals.collected],
        ["Missed", totals.missed],
        ["Skipped", totals.skipped],
      ];
      const boxWidth = tableWidth / 4 - 6;
      const boxHeight = 40;
      const startY = doc.y;
      labels.forEach((pair, idx) => {
        const x = tableLeft + idx * (boxWidth + 8);
        doc.roundedRect(x, startY, boxWidth, boxHeight, 8).strokeColor("#e2e8f0").lineWidth(1).stroke();
        doc.font("Helvetica-Bold").fontSize(16).fillColor("#0f172a").text(String(pair[1]), x + 10, startY + 8, { width: boxWidth - 20, align: "left" });
        doc.font("Helvetica").fontSize(11).fillColor("#64748b").text(String(pair[0]), x + 10, startY + 24, { width: boxWidth - 20 });
      });
      doc.y = startY + boxHeight + 10;
    }

    function timeFmt(iso) {
      try {
        return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } catch { return String(iso); }
    }

    function trunc(text, max) {
      if (!text) return "-";
      const s = String(text);
      return s.length > max ? s.slice(0, max - 1) + "…" : s;
    }

    function drawActivityTable() {
      // Title aligned to top-right of table
      const title = "Activity";
      doc.font("Helvetica-Bold").fontSize(12).fillColor("#228B22");
      const titleWidth = doc.widthOfString(title);
      doc.text(title, tableRight - titleWidth, doc.y);
      doc.moveDown(0.2);

      const cols = [
        { key: "time", label: "Time", width: 120 },
        { key: "action", label: "Action", width: 80 },
        { key: "title", label: "Stop", width: 240 },
        { key: "reason", label: "Reason", width: tableWidth - (120 + 80 + 240) },
      ];

      const headerY = doc.y;
      // header row
      // header background
      doc.rect(tableLeft, headerY, tableWidth, 22).fill("#f1f5f9");
      let x = tableLeft;
      doc.fillColor("#334155").font("Helvetica-Bold").fontSize(11);
      cols.forEach(c => {
        doc.text(c.label, x + 6, headerY + 6, { width: c.width - 12 });
        x += c.width;
      });
      const headerLineY = headerY + 22;
      doc.moveTo(tableLeft, headerLineY).lineTo(tableRight, headerLineY).strokeColor("#cbd5e1").lineWidth(1).stroke();
      doc.font("Helvetica").fillColor("#0f172a").fontSize(12);

      if (pickups.length === 0) {
        doc.moveDown().text("No activity.");
        return;
      }

      let y = headerLineY + 2;
      const rowH = 20;
      const stopById = new Map(stops.map(s => [String(s._id), s]));
      pickups.forEach((p, idx) => {
        ensureSpace(rowH + 12, () => {
          // repeat header on new page
          const t = "Activity"; const tw = doc.widthOfString(t); doc.font("Helvetica-Bold").fillColor("#228B22").fontSize(12).text(t, tableRight - tw, doc.y);
          doc.moveDown(0.2);
          const hx = tableLeft; let tx = hx; const hy = doc.y;
          doc.rect(hx, hy, tableWidth, 22).fill("#f1f5f9");
          doc.fillColor("#334155").font("Helvetica-Bold").fontSize(11);
          cols.forEach(c => { doc.text(c.label, tx + 6, hy + 6, { width: c.width - 12 }); tx += c.width; });
          const hline = hy + 22; doc.moveTo(tableLeft, hline).lineTo(tableRight, hline).strokeColor("#cbd5e1").lineWidth(1).stroke();
          doc.font("Helvetica").fillColor("#0f172a").fontSize(12);
          y = hline + 2;
        });

        // zebra
        if (idx % 2 === 0) {
          doc.save();
          doc.fillOpacity(0.04).rect(tableLeft, y - 1, tableWidth, rowH).fill("#334155");
          doc.restore();
        }
        let x = tableLeft;
        const title = stopById.get(String(p.stopId))?.title ?? `Stop ${p.stopId}`;
        const cells = [
          timeFmt(p.createdAt),
          (p.action ? p.action[0].toUpperCase() + p.action.slice(1) : ""),
          trunc(title, 48),
          trunc(p.reason ?? "-", 32),
        ];
        cells.forEach((val, i) => {
          const w = cols[i].width;
          doc.text(String(val), x + 6, y + 4, { width: w - 12 });
          x += w;
        });
        y += rowH;
        doc.y = y;
      });
      doc.moveDown(0.4);
    }

    function drawDropoffsTable() {
      const title = "Drop-offs";
      doc.font("Helvetica-Bold").fontSize(12).fillColor("#228B22");
      const titleWidth = doc.widthOfString(title);
      doc.text(title, tableRight - titleWidth, doc.y);
      doc.moveDown(0.2);
      const cols = [
        { label: "Time", width: 140 },
        { label: "Facility", width: 220 },
        { label: "Weight (kg)", width: 100 },
        { label: "Notes", width: tableWidth - (140 + 220 + 100) },
      ];
      const headerY = doc.y;
      let x = tableLeft;
      doc.rect(tableLeft, headerY, tableWidth, 22).fill("#f1f5f9");
      doc.fillColor("#334155").font("Helvetica-Bold").fontSize(11);
      cols.forEach(c => { doc.text(c.label, x + 6, headerY + 6, { width: c.width - 12 }); x += c.width; });
      const headerLineY = headerY + 22;
      doc.moveTo(tableLeft, headerLineY).lineTo(tableRight, headerLineY).strokeColor("#cbd5e1").lineWidth(1).stroke();
      doc.font("Helvetica").fillColor("#0f172a").fontSize(12);

      if (dropoffs.length === 0) {
        doc.moveDown().text("No drop-offs recorded.");
        return;
      }

      let y = headerLineY + 2;
      const rowH = 20;
      let totalKg = 0;
      dropoffs.forEach((d, idx) => {
        ensureSpace(rowH + 12, () => {
          const t = "Drop-offs"; const tw = doc.widthOfString(t); doc.font("Helvetica-Bold").fillColor("#228B22").fontSize(12).text(t, tableRight - tw, doc.y);
          doc.moveDown(0.2);
          const hx = tableLeft; let tx = hx; const hy = doc.y;
          doc.rect(hx, hy, tableWidth, 22).fill("#f1f5f9");
          doc.fillColor("#334155").font("Helvetica-Bold").fontSize(11);
          cols.forEach(c => { doc.text(c.label, tx + 6, hy + 6, { width: c.width - 12 }); tx += c.width; });
          const hline = hy + 22; doc.moveTo(tableLeft, hline).lineTo(tableRight, hline).strokeColor("#cbd5e1").lineWidth(1).stroke();
          doc.font("Helvetica").fillColor("#0f172a").fontSize(12);
          y = hline + 2;
        });
        if (idx % 2 === 0) {
          doc.save();
          doc.fillOpacity(0.04).rect(tableLeft, y - 1, tableWidth, rowH).fill("#334155");
          doc.restore();
        }
        totalKg += d.weightKg || 0;
        const cells = [
          d.time ? `${new Date(d.time).toLocaleDateString()} ${timeFmt(d.time)}` : "-",
          trunc(d.facility || "-", 36),
          (d.weightKg ?? 0).toFixed(2),
          trunc(d.notes || "-", 40),
        ];
        let x = tableLeft;
        cols.forEach((c, i) => { doc.text(String(cells[i]), x + 6, y + 4, { width: c.width - 12 }); x += c.width; });
        y += rowH; doc.y = y;
      });
      doc.moveDown(0.5).font("Helvetica-Bold").text(`Total drop-offs: ${dropoffs.length}    Total weight: ${totalKg.toFixed(2)} kg`);
      doc.font("Helvetica");
    }

    // Render
    drawHeader();
    sectionTitle("Summary");
    drawSummary();
    drawActivityTable();
    doc.moveDown(0.5);
    drawDropoffsTable();

    doc.end();
    function cap(s){ return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
}

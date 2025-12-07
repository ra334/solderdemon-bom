import puppeteer from "puppeteer";
import fs from "fs";
import Handlebars from "handlebars";
import path from "path";

function renderTemplate(templatePath, data) {
    const templateSource = fs.readFileSync(templatePath, "utf8");
    const template = Handlebars.compile(templateSource);
    return template(data);
}

(async function () {
    const browser = await puppeteer.launch({
        headless: "new",
    });

    const page = await browser.newPage();

    const qrPath = path.join(process.cwd(), "qr-code.png");
    const qrBitmap = fs.readFileSync(qrPath);
    const qrBase64 = qrBitmap.toString('base64');
    const qrSrc = `data:image/png;base64,${qrBase64}`;

    const logoPath = path.join(process.cwd(), "logo.png");
    const logoBitmap = fs.readFileSync(logoPath);
    const logoBase64 = logoBitmap.toString('base64');
    const LOGO_URL = `data:image/png;base64,${logoBase64}`;

    const html = renderTemplate("bom.html", {
        KIT_NAME: "Rosco M68K Kit",
        SKU: "rosco-m68k-through-hole-kit",
        DATE: new Date().toISOString().slice(0, 10),
        REV: "2.4",
        QR_URL: qrSrc, 
        LOGO_URL: LOGO_URL,
        BOM: [
            { index: 1, component: "Resistor", value: "470Ω", qty: 3, notes: "" },
            { index: 2, component: "CPU", value: "MC68010P10", qty: 1, notes: "Tested" },
        ],
    });

    await page.setContent(html, { waitUntil: ["networkidle0", "load", "domcontentloaded"] });

    await page.pdf({
        path: "bom.pdf",
        format: "A4",
        printBackground: true,
        margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
    });

    await browser.close();
})();
import puppeteer from "puppeteer";
import fs from "fs";
import Handlebars from "handlebars";
import path from "path";
import BOM from './BOM_rosco_m68k.json' with { type: "json" };

function renderTemplate(templatePath, data) {
    const templateSource = fs.readFileSync(templatePath, "utf8");
    const template = Handlebars.compile(templateSource);
    return template(data);
}

(async function () {
    const browser = await puppeteer.launch({
        headless: "new",
    });

    const qrPath = path.join(process.cwd(), "qr-code.png");
    const qrBitmap = fs.readFileSync(qrPath);
    const qrBase64 = qrBitmap.toString('base64');
    const qrSrc = `data:image/png;base64,${qrBase64}`;

    const logoPath = path.join(process.cwd(), "logo.png");
    const logoBitmap = fs.readFileSync(logoPath);
    const logoBase64 = logoBitmap.toString('base64');
    const LOGO_URL = `data:image/png;base64,${logoBase64}`;

    const data = {
        KIT_NAME: "Rosco M68K Kit",
        SKU: "rosco-m68k-through-hole-kit",
        DATE: new Date().toISOString().slice(0, 10),
        REV: "2.4",
        QR_URL: qrSrc, 
        LOGO_URL: LOGO_URL,
        BOM
    };

    const page1 = await browser.newPage();
    const coverHtml = renderTemplate("bom-cover.html", data);
    await page1.setContent(coverHtml, { 
        waitUntil: ["networkidle0", "load", "domcontentloaded"] 
    });
    
    const coverPdfBuffer = await page1.pdf({
        format: "A4",
        margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
    });
    await page1.close();

    const page2 = await browser.newPage();
    const bomHtml = renderTemplate("bom-table.html", data);
    await page2.setContent(bomHtml, { 
        waitUntil: ["networkidle0", "load", "domcontentloaded"] 
    });
    
    const bomPdfBuffer = await page2.pdf({
        format: "A4",
        margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
    });
    await page2.close();

    await browser.close();

    const { PDFDocument } = await import('pdf-lib');
    
    const finalPdf = await PDFDocument.create();
    
    const coverPdf = await PDFDocument.load(coverPdfBuffer);
    const [coverPage] = await finalPdf.copyPages(coverPdf, [0]);
    finalPdf.addPage(coverPage);
    
    const bomPdf = await PDFDocument.load(bomPdfBuffer);
    const [bomPage] = await finalPdf.copyPages(bomPdf, [0]);
    finalPdf.addPage(bomPage);
    
    const pdfBytes = await finalPdf.save();
    fs.writeFileSync("bom.pdf", pdfBytes);
    
    console.log("✅ PDF created successfully with 2 pages!");
    console.log("   Page 1: Cover page with metadata and info");
    console.log("   Page 2: BOM table");
})();
import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';

const generateBillPDF = async (billData: any) => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Generate HTML content for the bill
    const htmlContent = `
        <html>
            <head>
                <title>Bill</title>
            </head>
            <body>
                <h1>Bill Details</h1>
                <p>Patient Name: ${billData.patientName}</p>
                <p>Amount: ${billData.amount}</p>
                <!-- Add more bill details here -->
            </body>
        </html>
    `;

    await page.setContent(htmlContent);

    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    return pdfBuffer;
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const billData = req.body;

    try {
        const pdfBuffer = await generateBillPDF(billData);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=bill.pdf');
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Failed to generate PDF', error);
        res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
    }
};

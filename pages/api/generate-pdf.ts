import { NextApiRequest, NextApiResponse } from 'next';
import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

const generateBillPDF = async (billData: any) => {
    const doc = new jsPDF();

    // Set title
    doc.setFontSize(18);
    doc.text('Bill Details', 20, 20);

    // Set patient details
    doc.setFontSize(12);
    doc.text(`Patient Name: ${billData.patientName}`, 20, 30);
    doc.text(`Amount: $${billData.amount}`, 20, 40);

    // Add more bill details if needed

    // Return the generated PDF buffer
    return doc.output('arraybuffer');
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const billData = req.body;

    try {
        const pdfBuffer = await generateBillPDF(billData);

        const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
        const billNumber = billData.billNumber || 'default_bill_number'; // Ensure billNumber is provided in billData

        const directoryPath = path.join(process.cwd(), 'bills', date);
        const filePath = path.join(directoryPath, `${billNumber}.pdf`);

        // Ensure the directory exists
        fs.mkdirSync(directoryPath, { recursive: true });

        // Write the PDF to the file system
        fs.writeFileSync(filePath, Buffer.from(pdfBuffer));

        res.status(200).json({ message: 'PDF generated and saved successfully', filePath });
    } catch (error) {
        console.error('Failed to generate PDF', error);
        res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
    }
};

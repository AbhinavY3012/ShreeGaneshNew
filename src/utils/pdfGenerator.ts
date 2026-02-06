import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Purchase, Sale } from '@/types';

const getTodayDate = () => new Date().toISOString().split('T')[0];

const drawHeader = (doc: jsPDF, title: string) => {
    // Business Name in Red
    doc.setTextColor(200, 0, 0); // Red color like the image
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('SHREE GANESH FRUIT SUPPLIERS, TASGAON', 105, 18, { align: 'center' });

    // Address & Contact
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Tal. Tasgaon, Dist. Sangli, Pin 416312, Maharashtra', 105, 24, { align: 'center' });
    doc.text('Prop. Suhas Patil | Mo. 9730793507, 8788845042', 105, 29, { align: 'center' });

    // Title Bar
    doc.setFillColor(200, 0, 0);
    doc.rect(20, 42, 170, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 105, 47.5, { align: 'center' });
    doc.setTextColor(0, 0, 0);
};

const drawFooter = (doc: jsPDF, yPos: number) => {
    const pageHeight = doc.internal.pageSize.height;
    let finalY = yPos;

    if (finalY > pageHeight - 40) {
        doc.addPage();
        finalY = 20;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Driver\'s Signature', 20, finalY + 20);

    doc.setFont('helvetica', 'bold');
    doc.text('For, SHREE GANESH FRUIT SUPPLIERS, TASGAON', 110, finalY + 15);
    doc.setDrawColor(0, 0, 150); // Blue stamp color
    doc.rect(130, finalY + 18, 50, 20); // Stamp box
    doc.setFontSize(8);
    doc.text('Proprietor', 155, finalY + 35, { align: 'center' });
};

export const generatePurchaseReceiptPDF = (
    farmerName: string,
    farmerMobile: string,
    farmerAddress: string,
    purchases: Purchase[]
) => {
    const doc = new jsPDF();
    drawHeader(doc, 'PURCHASE BILL / RECEIPT');

    // Farmer Details
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Farmer / Party Name:', 20, 58);
    doc.setFont('helvetica', 'normal');
    doc.text(farmerName, 65, 58);

    doc.setFont('helvetica', 'bold');
    doc.text('Address:', 20, 64);
    doc.setFont('helvetica', 'normal');
    doc.text(farmerAddress, 65, 64);

    doc.setFont('helvetica', 'bold');
    doc.text('Mobile:', 130, 58);
    doc.setFont('helvetica', 'normal');
    doc.text(farmerMobile, 145, 58);

    doc.setFont('helvetica', 'bold');
    doc.text('Date:', 130, 64);
    doc.setFont('helvetica', 'normal');
    doc.text(getTodayDate(), 145, 64);

    doc.setDrawColor(0);
    doc.line(20, 68, 190, 68);

    let yPosition = 75;

    purchases.forEach((purchase, index) => {
        const tableData = purchase.items.map((item, i) => [
            i + 1,
            item.quality,
            `${item.totalWeight} kg`,
            `Rs. ${item.pricePerKg}`,
            `Rs. ${item.totalAmount.toLocaleString()}`
        ]);

        autoTable(doc, {
            startY: yPosition,
            head: [['Sr.', 'PARTICULARS', 'Weight', 'Rate', 'Amount']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
            margin: { left: 20, right: 20 },
            styles: { fontSize: 9 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 5;

        doc.setFont('helvetica', 'bold');
        doc.text(`Total: Rs. ${purchase.totalAmount.toLocaleString()}`, 190, yPosition, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.text(`Paid: Rs. ${purchase.advanceAmount.toLocaleString()}`, 190, yPosition + 5, { align: 'right' });
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(200, 0, 0); // Red color
        doc.text(`Balance / Pending: Rs. ${purchase.pendingAmount.toLocaleString()}`, 190, yPosition + 10, { align: 'right' });
        doc.setTextColor(0, 0, 0); // Reset to black
        yPosition += 20;
    });

    drawFooter(doc, yPosition);

    const safeName = farmerName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`Purchase_Bill_${safeName}_${getTodayDate()}.pdf`);
};

export const generateSaleReceiptPDF = (
    buyerName: string,
    buyerMobile: string,
    buyerAddress: string,
    sales: Sale[]
) => {
    const doc = new jsPDF();
    drawHeader(doc, 'SALE BILL / INVOICE');

    // Buyer Details
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Party Name:', 20, 58);
    doc.setFont('helvetica', 'normal');
    doc.text(buyerName, 65, 58);

    doc.setFont('helvetica', 'bold');
    doc.text('Address:', 20, 64);
    doc.setFont('helvetica', 'normal');
    doc.text(buyerAddress, 65, 64);

    doc.setFont('helvetica', 'bold');
    doc.text('Mobile:', 130, 58);
    doc.setFont('helvetica', 'normal');
    doc.text(buyerMobile, 145, 58);

    doc.setFont('helvetica', 'bold');
    doc.text('Date:', 130, 64);
    doc.setFont('helvetica', 'normal');
    doc.text(getTodayDate(), 145, 64);

    doc.line(20, 68, 190, 68);

    let yPosition = 75;

    sales.forEach((sale) => {
        const tableData = sale.items.map((item, i) => [
            i + 1,
            item.quality,
            `${item.totalWeight} kg`,
            `Rs. ${item.pricePerKg}`,
            `Rs. ${item.totalAmount.toLocaleString()}`
        ]);

        // Add additional charges to particulars
        if (sale.additions && sale.totalAdditions > 0) {
            sale.additions.forEach(add => {
                tableData.push(['-', add.label, `${add.quantity}`, `Rs. ${add.rate}`, `Rs. ${add.totalAmount.toLocaleString()}`]);
            });
        }

        autoTable(doc, {
            startY: yPosition,
            head: [['Sr.', 'PARTICULARS', 'Qty/Weight', 'Rate', 'Amount']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
            margin: { left: 20, right: 20 },
            styles: { fontSize: 9 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 5;

        doc.setFont('helvetica', 'bold');
        doc.text(`Grand Total: Rs. ${sale.totalAmount.toLocaleString()}`, 190, yPosition, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.text(`Received: Rs. ${sale.receivedAmount.toLocaleString()}`, 190, yPosition + 5, { align: 'right' });
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(200, 0, 0); // Red color
        doc.text(`Balance / Pending: Rs. ${sale.pendingAmount.toLocaleString()}`, 190, yPosition + 10, { align: 'right' });
        doc.setTextColor(0, 0, 0); // Reset to black
        yPosition += 20;
    });

    drawFooter(doc, yPosition);

    const safeName = buyerName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`Sale_Bill_${safeName}_${getTodayDate()}.pdf`);
};

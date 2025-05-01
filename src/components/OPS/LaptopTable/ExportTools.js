import React from 'react';
import { Tooltip, IconButton } from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import PrintIcon from '@mui/icons-material/Print';
import TableChartIcon from '@mui/icons-material/TableChart';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const ExportTools = ({ data }) => {
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const padding = 10;
    const cardWidth = pageWidth - padding * 2;
    const cardHeight = 100;
    let yPosition = 20;
  
    data.forEach((laptop) => {
      doc.setDrawColor(0);
      doc.rect(padding, yPosition, cardWidth, cardHeight);
  
      doc.setFontSize(12);
      doc.text(`ID: ${laptop.ID}`, padding + 5, yPosition + 10);
      doc.text(`Donor Company: ${laptop["Donor Company Name"]}`, padding + 5, yPosition + 20);
      doc.text(`RAM: ${laptop.RAM}`, padding + 5, yPosition + 30);
      doc.text(`ROM: ${laptop.ROM}`, padding + 5, yPosition + 40);
      doc.text(`Manufacturer Model: ${laptop["Manufacturer Model"]}`, padding + 5, yPosition + 50);
      doc.text(`Minor Issues: ${laptop["Minor Issues"]}`, padding + 5, yPosition + 60);
      doc.text(`Major Issues: ${laptop["Major Issues"]}`, padding + 5, yPosition + 70);
      doc.text(`Mac address: ${laptop["Mac address"]}`, padding + 5, yPosition + 80);
  
      yPosition += cardHeight + 10;
  
      if (yPosition + cardHeight > doc.internal.pageSize.getHeight() - padding) {
        doc.addPage();
        yPosition = 20;
      }
    });
  
    doc.save("laptop_data_cards.pdf");
  };
  
  const handlePrint = () => {
    const WindowPrint = window.open('', '', 'width=900,height=650');
    
    WindowPrint.document.write(`
      <html>
        <head>
          <title>Print Laptop Data</title>
          <style>
            body {
              font-family: Arial, sans-serif;
            }
            .card {
              width: 800px;
              padding: 20px;
              margin-bottom: 20px;
              position: relative;
              page-break-inside: avoid;
            }
            .barcode {
              position: absolute;
              top: 20px;
              right: 30px;
              width: 150px;
              height: 50px;
              border: 1px dashed black;
              padding: 10px;
            }
            table {
              width: 100%;
              bottom: 50px;
              left: 10px;
            }
            th, td {
              padding: 8px 0;
              text-align: left;
            }
            th {
              text-align: right;
            }
          </style>
        </head>
        <body>
          ${data.map(laptop => `
            <div class="card">
              <img src="${laptop.barcodeUrl}" class="barcode" />
              <table>
                <tr>
                  <th>Donor Company:</th>
                  <td>${laptop["Donor Company Name"]}</td>
                </tr>
                <tr>
                  <th>RAM:</th>
                  <td>${laptop.RAM}</td>
                </tr>
                <tr>
                  <th>ROM:</th>
                  <td>${laptop.ROM}</td>
                </tr>
                <tr>
                  <th>Manufacturer Model:</th>
                  <td>${laptop["Manufacturer Model"]}</td>
                </tr>
                <tr>
                  <th>Minor Issues:</th>
                  <td>${laptop["Minor Issues"]}</td>
                </tr>
                <tr>
                  <th>Major Issues:</th>
                  <td>${laptop["Major Issues"]}</td>
                </tr>
                <tr>
                  <th>Mac Address:</th>
                  <td>${laptop["Mac address"]}</td>
                </tr>
              </table>
            </div>
          `).join('')}
        </body>
      </html>
    `);
    
    WindowPrint.document.close();
    WindowPrint.print();
  };

  const handleDownloadExcel = () => {
    // Create a worksheet from the filtered data
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Create a workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laptop Data");
    
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, "laptop_data.xlsx");
  };

  return (
    <React.Fragment>
      <Tooltip title={"Download PDF"}>
        <IconButton onClick={handleDownloadPDF}>
          <GetAppIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title={"Print"}>
        <IconButton onClick={handlePrint}>
          <PrintIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title={"Download Excel"}>
        <IconButton onClick={handleDownloadExcel}>
          <TableChartIcon />
        </IconButton>
      </Tooltip>
    </React.Fragment>
  );
};

export default ExportTools;
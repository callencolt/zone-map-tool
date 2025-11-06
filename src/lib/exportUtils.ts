import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { ControllerData } from './controllerStorage';

export const exportToExcel = (controller: ControllerData) => {
  const worksheetData = [
    ['Controller Documentation Sheet'],
    [],
    ['Campus', controller.campus],
    ['Building', controller.building],
    ['Floor', controller.floor],
    ['Zone', controller.zone],
    ['Controller Number', controller.controllerNumber],
    ['Power Limit (W)', controller.powerLimit?.toString() || ''],
    [],
    ['Channel', 'Fixture Type', 'Voltage (V)', 'Current (A)', 'Qty Parallel', 'Power (W)'],
  ];

  controller.channels.forEach(channel => {
    const power = (parseFloat(channel.voltage) || 0) * (parseFloat(channel.current) || 0) * (channel.parallelCount || 1);
    worksheetData.push([
      channel.channelNumber.toString(),
      channel.fixtureType,
      channel.voltage,
      channel.current,
      (channel.parallelCount || 1).toString(),
      power.toFixed(2),
    ]);
  });

  const totalPower = controller.channels.reduce((total, channel) => {
    return total + ((parseFloat(channel.voltage) || 0) * (parseFloat(channel.current) || 0) * (channel.parallelCount || 1));
  }, 0);

  worksheetData.push([]);
  worksheetData.push(['', '', '', '', 'Total Power:', totalPower.toFixed(2) + ' W']);

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Controller');

  const fileName = `Controller_${controller.controllerNumber || 'Doc'}_${controller.building}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const exportToPDF = async (elementId: string, controller: ControllerData) => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 15;

  // Title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Controller Documentation', 15, y);
  y += 12;

  // Horizontal line
  pdf.setDrawColor(200, 200, 200);
  pdf.line(15, y, pageWidth - 15, y);
  y += 10;

  // Controller Information Section
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Controller Information', 15, y);
  y += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const infoFields = [
    ['Campus:', controller.campus || ''],
    ['Building:', controller.building || ''],
    ['Floor:', controller.floor || ''],
    ['Zone:', controller.zone || ''],
    ['Controller #:', controller.controllerNumber || ''],
    ['Power Limit (W):', controller.powerLimit?.toString() || ''],
  ];

  const colWidth = (pageWidth - 30) / 3;
  infoFields.forEach((field, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const x = 15 + (col * colWidth);
    const rowY = y + (row * 10);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text(field[0], x, rowY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(field[1], x + 32, rowY);
  });

  y += Math.ceil(infoFields.length / 3) * 10 + 5;

  // Channel Configuration Section
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Channel Configuration', 15, y);
  y += 8;

  // Table headers
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setFillColor(240, 240, 240);
  pdf.rect(15, y - 5, pageWidth - 30, 7, 'F');
  
  const headers = ['Channel', 'Fixture Type', 'Voltage (V)', 'Current (A)', 'Qty Parallel', 'Power (W)'];
  const colWidths = [20, 45, 25, 25, 25, 25];
  let x = 15;
  
  headers.forEach((header, index) => {
    pdf.text(header, x + 2, y);
    x += colWidths[index];
  });
  y += 8;

  // Table rows
  pdf.setFont('helvetica', 'normal');
  let totalPower = 0;

  controller.channels.forEach((channel) => {
    const power = (parseFloat(channel.voltage) || 0) * (parseFloat(channel.current) || 0) * (channel.parallelCount || 1);
    totalPower += power;

    x = 15;
    const rowData = [
      channel.channelNumber.toString(),
      channel.fixtureType || '',
      channel.voltage || '',
      channel.current || '',
      (channel.parallelCount || 1).toString(),
      power.toFixed(2),
    ];

    // Draw row background
    if (controller.channels.indexOf(channel) % 2 === 0) {
      pdf.setFillColor(250, 250, 250);
      pdf.rect(15, y - 5, pageWidth - 30, 7, 'F');
    }

    rowData.forEach((data, index) => {
      pdf.text(data, x + 2, y);
      x += colWidths[index];
    });
    y += 7;

    // Check if we need a new page
    if (y > 270) {
      pdf.addPage();
      y = 15;
    }
  });

  // Total Power
  y += 3;
  pdf.setDrawColor(200, 200, 200);
  pdf.line(15, y, pageWidth - 15, y);
  y += 7;

  pdf.setFont('helvetica', 'bold');
  pdf.text('Total Power Output:', pageWidth - 80, y);
  pdf.text(totalPower.toFixed(2) + ' W', pageWidth - 25, y, { align: 'right' });
  y += 10;

  // Note
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(100, 100, 100);
  const noteText = 'Note: Total power output is used to determine controller limits and expected heat generation. Ensure the total does not exceed the controller\'s maximum rated capacity.';
  const splitNote = pdf.splitTextToSize(noteText, pageWidth - 30);
  pdf.text(splitNote, 15, y);

  const fileName = `Controller_${controller.controllerNumber || 'Doc'}_${controller.building}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};

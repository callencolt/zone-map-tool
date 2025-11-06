import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
    [],
    ['Channel', 'Fixture Type', 'Voltage (V)', 'Current (A)', 'Power (W)'],
  ];

  controller.channels.forEach(channel => {
    const power = (parseFloat(channel.voltage) || 0) * (parseFloat(channel.current) || 0);
    worksheetData.push([
      channel.channelNumber.toString(),
      channel.fixtureType,
      channel.voltage,
      channel.current,
      power.toFixed(2),
    ]);
  });

  const totalPower = controller.channels.reduce((total, channel) => {
    return total + ((parseFloat(channel.voltage) || 0) * (parseFloat(channel.current) || 0));
  }, 0);

  worksheetData.push([]);
  worksheetData.push(['', '', '', 'Total Power:', totalPower.toFixed(2) + ' W']);

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Controller');

  const fileName = `Controller_${controller.controllerNumber || 'Doc'}_${controller.building}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const exportToPDF = async (elementId: string, controller: ControllerData) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Clone the element to avoid modifying the original
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  clone.style.width = '1200px';
  document.body.appendChild(clone);

  // Replace all input elements with divs containing their values
  const inputs = clone.querySelectorAll('input');
  inputs.forEach(input => {
    const div = document.createElement('div');
    div.textContent = input.value;
    div.className = input.className;
    div.style.cssText = window.getComputedStyle(input).cssText;
    div.style.border = window.getComputedStyle(input).border;
    div.style.padding = window.getComputedStyle(input).padding;
    div.style.height = window.getComputedStyle(input).height;
    div.style.whiteSpace = 'nowrap';
    div.style.overflow = 'visible';
    input.parentNode?.replaceChild(div, input);
  });

  const canvas = await html2canvas(clone, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  // Remove the clone
  document.body.removeChild(clone);

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const imgX = (pdfWidth - imgWidth * ratio) / 2;
  const imgY = 10;

  pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
  
  const fileName = `Controller_${controller.controllerNumber || 'Doc'}_${controller.building}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};

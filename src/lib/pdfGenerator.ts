import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ReportData } from '@/hooks/useReports';

export function generateAccessReportPDF(
  data: ReportData,
  startDate: Date,
  endDate: Date,
  siteName?: string
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(20);
  doc.setTextColor(33, 37, 41);
  doc.text('Rapport d\'Accès', pageWidth / 2, 20, { align: 'center' });

  // Subtitle with dates
  doc.setFontSize(12);
  doc.setTextColor(108, 117, 125);
  const dateRange = `Du ${format(startDate, 'dd MMMM yyyy', { locale: fr })} au ${format(endDate, 'dd MMMM yyyy', { locale: fr })}`;
  doc.text(dateRange, pageWidth / 2, 28, { align: 'center' });

  if (siteName) {
    doc.text(`Site: ${siteName}`, pageWidth / 2, 35, { align: 'center' });
  }

  // Summary section
  doc.setFontSize(14);
  doc.setTextColor(33, 37, 41);
  doc.text('Résumé', 14, 50);

  const summaryData = [
    ['Total des accès', data.totalAccess.toString()],
    ['Entrées', data.totalEntries.toString()],
    ['Sorties', data.totalExits.toString()],
    ['Accès employés', data.totalEmployees.toString()],
    ['Accès visiteurs', data.totalVisitors.toString()],
  ];

  autoTable(doc, {
    startY: 55,
    head: [['Métrique', 'Valeur']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 },
  });

  // Access by day table
  const currentY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text('Accès par jour', 14, currentY);

  const dayData = data.accessByDay.map(d => [
    format(new Date(d.date), 'dd MMM yyyy', { locale: fr }),
    d.entries.toString(),
    d.exits.toString(),
    (d.entries + d.exits).toString()
  ]);

  autoTable(doc, {
    startY: currentY + 5,
    head: [['Date', 'Entrées', 'Sorties', 'Total']],
    body: dayData.length > 0 ? dayData : [['Aucune donnée', '-', '-', '-']],
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 },
  });

  // Top companies
  if (data.topCompanies.length > 0) {
    const companyY = (doc as any).lastAutoTable.finalY + 15;
    
    // Check if we need a new page
    if (companyY > 250) {
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Top entreprises par accès', 14, 20);
      
      autoTable(doc, {
        startY: 25,
        head: [['Entreprise', 'Nombre d\'accès']],
        body: data.topCompanies.map(c => [c.name, c.count.toString()]),
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 14, right: 14 },
      });
    } else {
      doc.setFontSize(14);
      doc.text('Top entreprises par accès', 14, companyY);

      autoTable(doc, {
        startY: companyY + 5,
        head: [['Entreprise', 'Nombre d\'accès']],
        body: data.topCompanies.map(c => [c.name, c.count.toString()]),
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 14, right: 14 },
      });
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(108, 117, 125);
    doc.text(
      `Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })} - Page ${i}/${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const fileName = `rapport-acces-${format(startDate, 'yyyy-MM-dd')}-${format(endDate, 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}

type ExportRow = Record<string, string | number | boolean | null | undefined>;

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export const ExportService = {
  async toExcel(rows: ExportRow[], filename: string) {
    const { default: writeXlsxFile } = await import("write-excel-file/browser");
    const headers = rows[0] ? Object.keys(rows[0]) : [];
    const sheetRows = [
      headers.map((header) => ({ value: header })),
      ...rows.map((row) =>
        headers.map((header) => ({ value: row[header] ?? "" })),
      ),
    ];

    const blob = await writeXlsxFile(sheetRows).toBlob();
    downloadBlob(blob, `${filename}.xlsx`);
  },

  async toPdf(rows: ExportRow[], filename: string, title: string) {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);
    const document = new jsPDF();
    const headers = rows[0] ? Object.keys(rows[0]) : [];
    const body = rows.map((row) =>
      headers.map((header) => String(row[header] ?? "")),
    );

    document.setFontSize(16);
    document.text(title, 14, 18);
    autoTable(document, {
      head: [headers],
      body,
      startY: 26,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [255, 90, 31] },
    });

    downloadBlob(document.output("blob"), `${filename}.pdf`);
  },
};

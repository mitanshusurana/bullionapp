// src/app/services/print.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  printDocument(documentName: string, documentData: any) {
    const printContent = this.createPrintContent(documentName, documentData);
    const WindowPrt = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
    // WindowPrt.document.write(printContent);
    // WindowPrt.document.close();
    // WindowPrt.focus();
    // WindowPrt.print();
    // WindowPrt.close();
  }

  private createPrintContent(documentName: string, documentData: any): string {
    return `
      <html>
        <head>
          <title>${documentName}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { width: 100%; margin: 0 auto; }
            .header, .footer { text-align: center; padding: 10px; }
            .content { padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            table, th, td { border: 1px solid black; }
            th, td { padding: 10px; text-align: left; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${documentName}</h1>
            </div>
            <div class="content">
              <p>Party: ${documentData.party.name}</p>
              <p>Date: ${documentData.date}</p>
              <p>Type: ${documentData.type}</p>
              <p>Metal Quantity: ${documentData.metalQuantity}</p>
              <p>Cash Amount: ${documentData.cashAmount}</p>
              <p>Rate: ${documentData.rate}</p>
            </div>
            <div class="footer">
              <p>Thank you for your business!</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

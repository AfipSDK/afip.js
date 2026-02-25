const Afip = require('../src/Afip');

const afip = new Afip({
  CUIT: 20409378472,
  access_token: process.env.AFIPSDK_ACCESS_TOKEN,
  production: false
});

async function main () {
  const response = await afip.ElectronicBilling.createPDF({
    template: 'invoice_b',
    params: {
      voucherNumber: '00000001',
      issueDate: '25/02/2026',
      issuerCuit: '20409378472',
      cae: '86080011752811',
      caeDueDate: '07/03/2026',
      ivaAmount: '21,00',
      qrCode: 'https://www.afip.gob.ar/fe/qr/?p=...'
    },
    file_name: 'factura-b-ejemplo'
  });

  console.log(response);
}

main().catch(console.error);

#!/usr/bin/env node
/**
 * generate-png.js (CLI)
 * 
 * Interactive CLI to generate SEPA EPC QR code PNGs for invoices.
 * 
 * Usage:
 *   node generate-png.js
 * 
 * Security considerations:
 * - Validates user input to prevent malformed EPC payloads.
 * - Generates ISO 11649 RF Creditor Reference for Zahlungsreferenz compliance.
 * 
 * Performance:
 * - Lightweight, synchronous prompts; QR generation is fast.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const QRCode = require('qrcode');
const generateQrCode = require('.'); // EPC text generator
const generateRFCreditorReference = require('./src/rf-creditor-reference');

/**
 * Generate ISO 11649 RF Creditor Reference from a base string.
 * Ensures EPC-compliant "Zahlungsreferenz" field.
 */
// kept for backwards compatibility: the implementation now lives in src/

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt helper
const ask = (question) => new Promise((resolve) => rl.question(question, resolve));

(async () => {
  try {
    console.log('=== SEPA EPC QR Code Generator ===');

    // 1. Ask for amount
    let amountStr = await ask('Enter amount in EUR (e.g., 580.00): ');
    let amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('❌ Invalid amount. Must be a positive number.');
    }

    // 2. Ask for Rechnungsnummer
    let invoiceNum = await ask('Enter Rechnungsnummer (format R0xxxx): ');
    if (!/^R0\d{4}$/.test(invoiceNum)) {
      throw new Error('❌ Invalid Rechnungsnummer. Must match R0 followed by 4 digits.');
    }

    rl.close();

    // 3. Generate structured reference
    const structuredRef = generateRFCreditorReference(invoiceNum);

    // 4. Prepare payment data
    const paymentData = {
      name: process.env.SEPA_NAME,
      iban: process.env.SEPA_IBAN,
      bic: process.env.SEPA_BIC,
      amount: amount,
      structuredReference: structuredRef,
      information: `Payment for invoice ${invoiceNum}`
    };

    if (!paymentData.name) throw new Error('❌ Missing SEPA_NAME env var (beneficiary name).')
    if (!paymentData.iban) throw new Error('❌ Missing SEPA_IBAN env var (beneficiary IBAN).')

    // 5. Safe filename
    const safeFileName = invoiceNum.toLowerCase() + '.png';

    // 6. Ensure output directory exists
    const outputDir = path.join(__dirname, 'qr-codes');
    fs.mkdirSync(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, safeFileName);

    // 7. Generate EPC text
    const epcText = generateQrCode(paymentData);

    // 8. Render QR code to PNG
    await QRCode.toFile(outputPath, epcText, {
      type: 'png',
      errorCorrectionLevel: 'M',
      margin: 1,
      color: { dark: '#000000', light: '#FFFFFF' }
    });

    console.log(`✅ QR code generated: ${outputPath}`);
    console.log(`Structured Reference (Zahlungsreferenz): ${structuredRef}`);
    console.log('You can now embed this PNG on your invoice.');
  } catch (err) {
    console.error(err.message || err);
    rl.close();
    process.exit(1);
  }
})();
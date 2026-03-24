#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')
const QRCode = require('qrcode')

const generateEpcQrPayload = require('..')
const generateRFCreditorReference = require('../src/rf-creditor-reference')

const printHelp = () => {
	process.stdout.write(`\
sepa-payment-qr-code

Generate an EPC/SEPA (SCT) QR payload string, optionally render it as a PNG.

Usage
  sepa-payment-qr-code --name <NAME> --iban <IBAN> [options]

Options
  --name <str>               Beneficiary name (required unless in --from)
  --iban <str>               Beneficiary IBAN (required unless in --from)
  --bic <str>                Beneficiary bank BIC (optional)
  --amount <number>          Amount in EUR (optional; omit to leave blank)
  --purpose <code>           Purpose code (max 4 chars)
  --structured <str>         Structured reference (max 35)
  --unstructured <str>       Unstructured reference (max 140)
  --rf-from <str>            Generate structured reference (RF creditor ref) from base
  --info <str>               Additional info (max 70)
  --from <file.json>         Read payment data from JSON file
  --png <file.png>           Render QR code into a PNG file
  --help                     Show this help

Environment defaults
  SEPA_NAME, SEPA_IBAN, SEPA_BIC can be used as defaults.
\n`)
}

const parseArgs = argv => {
	const args = {}
	for (let i = 0; i < argv.length; i++) {
		const key = argv[i]
		if (!key.startsWith('--')) continue
		const name = key.slice(2)
		if (name === 'help') {
			args.help = true
			continue
		}
		const val = argv[i + 1]
		if (!val || val.startsWith('--')) {
			args[name] = true
			continue
		}
		args[name] = val
		i++
	}
	return args
}

const readJsonFile = filePath => {
	const abs = path.resolve(process.cwd(), filePath)
	const raw = fs.readFileSync(abs, 'utf8')
	return JSON.parse(raw)
}

const main = async () => {
	const argv = process.argv.slice(2)
	const args = parseArgs(argv)

	if (args.help) {
		printHelp()
		process.exit(0)
	}

	let data = null
	if (args.from) {
		data = readJsonFile(args.from)
	} else {
		data = {
			name: args.name || process.env.SEPA_NAME,
			iban: args.iban || process.env.SEPA_IBAN,
			bic: args.bic || process.env.SEPA_BIC,
			amount: args.amount ? Number.parseFloat(args.amount) : null,
			purposeCode: args.purpose,
			structuredReference: args.structured,
			unstructuredReference: args.unstructured,
			information: args.info,
		}

		if (args['rf-from']) {
			if (data.unstructuredReference) {
				throw new Error('Use --rf-from with structured reference; do not combine with --unstructured.')
			}
			data.structuredReference = generateRFCreditorReference(String(args['rf-from']))
		}

		if (data.bic === undefined || data.bic === '') delete data.bic
		if (data.purposeCode === undefined || data.purposeCode === '') delete data.purposeCode
		if (data.structuredReference === undefined || data.structuredReference === '') delete data.structuredReference
		if (data.unstructuredReference === undefined || data.unstructuredReference === '') delete data.unstructuredReference
		if (data.information === undefined || data.information === '') delete data.information
	}

	const payload = generateEpcQrPayload(data)
	process.stdout.write(payload + '\n')

	if (args.png) {
		const outPath = path.resolve(process.cwd(), args.png)
		fs.mkdirSync(path.dirname(outPath), {recursive: true})
		await QRCode.toFile(outPath, payload, {
			type: 'png',
			errorCorrectionLevel: 'M',
			margin: 1,
			color: {dark: '#000000', light: '#FFFFFF'},
		})
		process.stderr.write(`Wrote ${outPath}\n`)
	}
}

main().catch(err => {
	process.stderr.write((err && err.message) ? err.message + '\n' : String(err) + '\n')
	process.exit(1)
})
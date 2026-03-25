# sepa-payment-qr-code

**Generate a [QR code to initiate a SEPA credit transfer](https://en.wikipedia.org/wiki/EPC_QR_code)** a.k.a. bank transfer.

[![npm version](https://img.shields.io/npm/v/sepa-payment-qr-code.svg)](https://www.npmjs.com/package/sepa-payment-qr-code)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/sepa-payment-qr-code.svg)
[![support me via GitHub Sponsors](https://img.shields.io/badge/support%20me-donate-fa7664.svg)](https://github.com/sponsors/derhuerst)
[![chat with me on Twitter](https://img.shields.io/badge/chat%20with%20me-on%20Twitter-1da1f2.svg)](https://twitter.com/derhuerst)


## Installation

```shell
npm install sepa-payment-qr-code
```

Using pnpm:

```shell
pnpm add sepa-payment-qr-code
```


## Usage (library)

```js
// generate-qr-code.js
const generateQrCode = require('sepa-payment-qr-code')

const qr = generateQrCode({
	name: 'Red Cross of Belgium',
	iban: 'BE72000000001616',
	amount: 123.45,
	unstructuredReference: 'Urgency fund',
	information: 'Sample QR code'
})

process.stdout.write(qr)
```

```shell
node generate-qr-code.js | qrencode -t ansiutf8 -l M
# prints QR code to the terminal
```

This library only generates the text input to be QR-encoded. Use the library of your choice to render the QR code to PNG/SVG/React/etc.

## Usage (CLI)

This package ships a CLI named `sepa-payment-qr-code`.

### When installed as a dependency

```shell
# after pnpm add / npm install
pnpm exec sepa-payment-qr-code --help

# print EPC payload to stdout
pnpm exec sepa-payment-qr-code --name "Red Cross of Belgium" --iban "BE72000000001616" --amount 123.45 --unstructured "Urgency fund" --info "Sample QR code"

# render as PNG
pnpm exec sepa-payment-qr-code --name "Red Cross of Belgium" --iban "BE72000000001616" --amount 123.45 --unstructured "Urgency fund" --info "Sample QR code" --png qr.png
```

### In this repository (local development)

`pnpm exec sepa-payment-qr-code` does not resolve the package’s own bin in-place; use one of these instead:

```shell
pnpm run cli -- --help

pnpm run cli -- --name "Red Cross of Belgium" --iban "BE72000000001616" --amount 123.45 --unstructured "Urgency fund" --info "Sample QR code" --png qr.png
```

### CLI options

- `--name` Beneficiary name
- `--iban` Beneficiary IBAN
- `--bic` Beneficiary BIC (optional)
- `--amount` Amount in EUR (optional; omit to leave blank)
- `--purpose` Purpose code (max 4 chars)
- `--structured` Structured reference (max 35)
- `--unstructured` Unstructured reference (max 140)
- `--rf-from` Generate an ISO 11649 `RF..` structured reference from a base string (do not combine with `--unstructured`)
- `--info` Additional information (max 70)
- `--from` Load the payment data from a JSON file
- `--png` Write a PNG file

Environment defaults:

- `SEPA_NAME`, `SEPA_IBAN`, `SEPA_BIC`

Example with a JSON file:

```json
{
	"name": "Red Cross of Belgium",
	"iban": "BE72000000001616",
	"amount": 123.45,
	"unstructuredReference": "Urgency fund",
	"information": "Sample QR code"
}
```

```shell
pnpm exec sepa-payment-qr-code --from payment.json --png qr.png
```

## Repo scripts

```shell
pnpm run example

# local-only example (gitignored by default)
SEPA_NAME="..." SEPA_IBAN="..." pnpm run example:local

# interactive PNG helper (writes to qr-codes/, which is gitignored)
SEPA_NAME="..." SEPA_IBAN="..." pnpm run png:interactive
```

## API

`generateQrCode(data)` returns the EPC payload string.

Fields:

- `name` (required, non-empty, max 70)
- `iban` (required, valid IBAN)
- `bic` (optional, max 11)
- `amount` (number, or `null` to omit)
- `purposeCode` (optional, max 4)
- `structuredReference` (optional, max 35) or `unstructuredReference` (optional, max 140)
- `information` (optional, max 70)

Note: use either `structuredReference` or `unstructuredReference`.

Note the following limitations posed by [European Payments Council's (EPC) *Quick Response Code: Guidelines to Enable Data Capture
for The Initiation of a Sepa Credit Transfer* document](https://www.europeanpaymentscouncil.eu/sites/default/files/KB/files/EPC069-12%20v2.1%20Quick%20Response%20Code%20-%20Guidelines%20to%20Enable%20the%20Data%20Capture%20for%20the%20Initiation%20of%20a%20SCT.pdf):

> 2 2D Code Guidelines
> Definition:
> - QR code error level `M` (15% of code words can be restored)
> - Maximum QR code version `13`, equivalent to module size `69` or 331 byte payload
> - Character sets:
> 	- UTF-8
> 	- ISO 8859-1
> 	- ISO 8859-2
> 	- ISO 8859-4
> 	- ISO 8859-5
> 	- ISO 8859-7
> 	- ISO 8859-10
> 	- ISO 8859-15

Also note that EPC QR codes are always in euros (`EUR`).


## Development

```shell
pnpm install
pnpm test
pnpm run lint
```


## See also

- [EPC QR code – Wikipedia](https://en.wikipedia.org/wiki/EPC_QR_code)
- [*Quick Response Code: Guidelines to Enable Data Capture for the Initiation of a SEPA Credit Transfer* EPC document](https://www.europeanpaymentscouncil.eu/document-library/guidance-documents/quick-response-code-guidelines-enable-data-capture-initiation)
- [Credit Transfer Payment API – W3C](https://w3c.github.io/payment-method-credit-transfer/)


## Contributing

If you have a question or need support using `sepa-payment-qr-code`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, refer to [the issues page](https://github.com/derhuerst/sepa-payment-qr-code/issues).

'use strict'

// ISO 11649 (RF creditor reference), commonly used as a structured reference.
// Input is sanitized to A-Z0-9; output is like RFxx<BASE>.
const generateRFCreditorReference = base => {
	if ('string' !== typeof base || !base) throw new Error('base must be a non-empty string.')

	const cleaned = base.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
	if (!cleaned) throw new Error('base must contain at least one alphanumeric character.')

	const temp = cleaned + 'RF00'
	const converted = temp.replace(/[A-Z]/g, c => (c.charCodeAt(0) - 55).toString())
	const checksum = (98n - (BigInt(converted) % 97n)).toString().padStart(2, '0')
	return `RF${checksum}${cleaned}`
}

module.exports = generateRFCreditorReference
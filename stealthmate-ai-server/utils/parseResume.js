
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const atob = require('atob');

const parseResume = async (base64, type) => {
  const buffer = Buffer.from(base64, 'base64');

  if (type === 'pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (type === 'docx') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (type === 'txt') {
    return buffer.toString('utf-8');
  }

  throw new Error('Unsupported file type');
};

module.exports = parseResume;


const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const parseResume = async (buffer, type) => {
  if (type === "pdf") {
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (type === "docx") {
    // FIX: mammoth expects an object { buffer: <Buffer> }
    const result = await mammoth.extractRawText({ buffer: buffer });
    return result.value;
  }

  if (type === "txt") {
    return buffer.toString("utf-8");
  }

  throw new Error("Unsupported file type");
};

module.exports = parseResume;

const axios = require("axios");
const FormData = require("form-data");

async function request_to_read_pdf_with_docling(pdfBuffer, nomeArquivo = "documento.pdf", API_DOCLING_IPADDRES="localhost", API_DOCLING_PORT = "8080") {
  const form = new FormData();
  form.append("file", pdfBuffer, {
    filename: nomeArquivo,
    contentType: "application/pdf"
  });

  try {
    const response = await axios.post(
      `http://${API_DOCLING_IPADDRES}:${API_DOCLING_PORT}/parse/file`,
      form,
      {
        headers: form.getHeaders()
      }
    );

    // Axios já faz o parsing JSON automaticamente
    console.log(response.data);
    return response.data;

  } catch (error) {
    console.error("Erro ao enviar PDF para Docling:", error.response?.data || error.message);
  }
}

module.exports = { request_to_read_pdf_with_docling };

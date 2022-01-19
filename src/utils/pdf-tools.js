import PdfPrinter from 'pdfmake'
import path from 'path'
import imageToBase64 from 'image-to-base64'

export const encodeImage = async (imgUrl) => {
  try {
    const base64Image = await imageToBase64(imgUrl);
    return base64Image;
  } catch (error) {
    console.log(error);
  }
};

export const getPDFReadableStream = (data, encodedImage) => {
  const fonts = {
    Helvetica: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Oblique",
      bolditalics: "Helvetica-BoldOblique",
    },
  };

  const printer = new PdfPrinter(fonts);

  const docDefinition = {
    content: [
      // Profile header and profile image
      {
        alignment: "justify",
        columns: [
          {
            text: `${data.name} ${data.surname}`,
            style: {
              fontSize: 45,
              bold: true,
              margin: [0, 20],
              alignment: "left",
              color: "blue",
              decoration: "underline",
            },
          },
          {
            image: `data:image/${path.extname(
              data.image
            )};base64,${encodedImage}`,
            width: 150,
            height: 150,
            style: {
              alignment: "right",
            },
          },
        ],
      },
      {
        text: `Bio`,
        style: "header",
      },
      {
        text: `${data.bio}`,
      },

      //experiences
      {
        text: `Experiences`,
        style: "header",
      },
      data.experiences.map(exp => {
        return { text: `${exp.role}`}
      }),
    ],
    styles: {
      header: {
        fontSize: 15,
        bold: true,
        marginBottom: 12,
        marginTop: 12,
        alignment: "left",
        color: "blue",
      },
    },
    defaultStyle: {
      font: "Helvetica",
      columnGap: 10,
      margintop: 20,
    },
  };
  console.log(docDefinition.content.image);
  const pdfReadableStream = printer.createPdfKitDocument(docDefinition);
  pdfReadableStream.end();

  return pdfReadableStream;
};

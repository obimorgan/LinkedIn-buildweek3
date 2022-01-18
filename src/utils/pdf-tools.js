import PdfPrinter from 'pdfmake'
import path from 'path'
import imageToBase64 from 'image-to-base64'
import { pipeline } from 'stream'
import { promisify } from 'util'
import fs from 'fs'
import { join, dirname } from "path"
import { fileURLToPath } from 'url'

export const encodeImage = async (imgUrl = 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50') => {
    try {
        const base64Image = await imageToBase64(imgUrl)
        return base64Image
    } catch (error) {
        console.log(error)
    }
}

export const getPDFReadableStream = (data, encodedImage) => {

    const fonts = {
        Helvetica: {
            normal: 'Helvetica',
            bold: 'Helvetica-Bold',
            italics: 'Helvetica-Oblique',
            bolditalics: 'Helvetica-BoldOblique'
        },
    }

    const printer = new PdfPrinter(fonts)

    const docDefinition = {
        content: [
            {
                text: `${ data.name }`,
                style: 'header'
            },
            {
                text: `by ${ data.surname }`,
                style: 'subheader'
            },
            {
                image: `data:image/${ path.extname(data.image) };base64,${ encodedImage }`,
                width: 250,
                height: 250,
                style: 'centerme'
            },
            {
                text: `${ data.bio }`,
                style: 'description'
            }
        ],
        styles: {
            header: {
                fontSize: 22,
                bold: true,
                marginBottom: 8,
                alignment: 'center'
            },
            subheader: {
                fontSize: 15,
                bold: true,
                marginBottom: 8,
                alignment: 'center'
            },
            description: {
                marginTop: 8,
                alignment: 'center'
            },
            centerme: {
                alignment: 'center'
            }
        },
        defaultStyle: {
            font: "Helvetica",
        }
    }
    console.log(docDefinition.content.image)
    const pdfReadableStream = printer.createPdfKitDocument(docDefinition)
    pdfReadableStream.end()

    return pdfReadableStream
}
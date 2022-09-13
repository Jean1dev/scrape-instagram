const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')

function gerar(filename = 'stefany.pdf') {
    const doc = new PDFDocument()
    const imagesDir = 'images_insta'

    doc.pipe(fs.createWriteStream(path.resolve(__dirname, '..', 'pdf', filename)))

    const directoryPath = path.resolve(__dirname, '..', imagesDir)

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }

        files.forEach(function (file) {
            const instaUser = file.replace('.jpg', '')

            doc.image(path.resolve(__dirname, '..', imagesDir, file), {
                fit: [50, 50],
                align: 'right',
                valign: 'right'
            })

            doc.text(instaUser, {
                width: 300,
                align: 'center'
            })

        });

        doc.end()

        const deleteFolderRecursive = function (path) {
            if (fs.existsSync(path)) {
                fs.readdirSync(path).forEach(function (file, index) {
                    var curPath = path + "/" + file;
                    if (fs.lstatSync(curPath).isDirectory()) { // recurse
                        deleteFolderRecursive(curPath);
                    } else { // delete file
                        fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(path);
            }
        };

        deleteFolderRecursive(directoryPath)
    })
}

module.exports = gerar
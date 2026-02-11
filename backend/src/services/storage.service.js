const ImageKit = require("imagekit");
const { v4: uuid } = require("uuid");


const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

async function uploadFile(file, originalName) {

    const extension = originalName.split('.').pop();  // gets mp4

    const result = await imagekit.upload({
        file: file,
        fileName: uuid() + "." + extension,   // auto add extension
    });

    return result;
}

module.exports = {
    uploadFile
}
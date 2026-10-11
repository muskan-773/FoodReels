const ImageKit = require("imagekit");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const path = require("path");

// Ensure the local uploads directory exists
const UPLOADS_DIR = path.join(__dirname, "../../uploads/videos");

function isImageKitConfigured() {
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    if (!publicKey || !privateKey || !urlEndpoint) {
        return false;
    }

    // Guard against unedited placeholder values
    if (
        publicKey.includes("your_imagekit") ||
        privateKey.includes("your_imagekit") ||
        urlEndpoint.includes("your_id")
    ) {
        return false;
    }

    return true;
}

function getImageKitClient() {
    if (!isImageKitConfigured()) {
        return null;
    }

    return new ImageKit({
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    });
}

/**
 * Saves file locally to /uploads/videos/ and returns accessible URL
 */
async function saveLocally(fileBuffer, fileName, req) {
    if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    const filePath = path.join(UPLOADS_DIR, fileName);
    await fs.promises.writeFile(filePath, fileBuffer);

    // Build accessible URL based on incoming request host
    let baseUrl = '';
    if (req && req.get) {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
        const host = req.get('host');
        baseUrl = `${protocol}://${host}`;
    } else {
        const port = process.env.PORT || 3001;
        baseUrl = `http://localhost:${port}`;
    }

    const publicUrl = `${baseUrl}/uploads/videos/${fileName}`;
    return {
        url: publicUrl,
        fileId: fileName,
        storage: 'local'
    };
}

/**
 * Uploads video file buffer either to ImageKit or to local static storage
 */
async function uploadFile(fileBuffer, originalName = "video.mp4", req = null) {
    const extension = originalName.includes(".") ? originalName.split(".").pop().toLowerCase() : "mp4";
    const fileName = `${uuid()}.${extension}`;

    const imagekit = getImageKitClient();

    if (imagekit) {
        try {
            console.log(`[Storage] Uploading ${fileName} to ImageKit CDN...`);
            const result = await imagekit.upload({
                file: fileBuffer,
                fileName: fileName,
                folder: "/foodreels/videos"
            });
            return {
                url: result.url,
                fileId: result.fileId,
                storage: 'imagekit'
            };
        } catch (err) {
            console.warn(`[Storage] ImageKit upload failed (${err.message}). Falling back to local disk storage.`);
        }
    }

    // Local disk storage fallback
    console.log(`[Storage] Storing ${fileName} locally in /uploads/videos/`);
    return await saveLocally(fileBuffer, fileName, req);
}

module.exports = {
    uploadFile,
    saveLocally,
    isImageKitConfigured
};
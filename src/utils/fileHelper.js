const fs = require("fs");

const deleteFile = (filePath) => {
    if (!filePath) return;

    fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete file:", err);
    });
};

module.exports = { deleteFile };
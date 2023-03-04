const fs = require("fs");
const config = require("config");

let FileService = {
    createDir(req, file) {
        const filePath = this.getPath(req, file);
        return new Promise((resolve, reject) => {
            try {
                if (!fs.existsSync(filePath)) {
                    fs.mkdirSync(filePath);
                    return resolve({message: "Файл был создан"});
                } else {
                    return reject({message: "Файл по такому пути уже существует."});
                }
            } catch (err) {
                console.log(err, 'err')
            }
        })
    },
    deleteFile(req, file) {
        const path = this.getPath(req, file);
        if (file.type === "dir") {
            fs.rmdirSync(path)
        } else {
            fs.unlinkSync(path)
        }
    },
    getPath(req, file) {
        return req.filePath + "\\" + file.user + "\\" + file.path;
    }
}

module.exports = FileService;
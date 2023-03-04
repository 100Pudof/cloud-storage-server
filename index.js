const express = require("express");
const mongoose = require("mongoose").default;
const config = require("config");
const fileUpload = require("express-fileupload");
const authRouter = require("./routes/auth.routes");
const fileRouter = require("./routes/file.routes");
const app = express();
const PORT = process.env.PORT || 3000;
const middlewareCors = require("./middleware/cors.middleware");
const middlewareFilePath = require("./middleware/filepath.middleware");
const path = require("path");

app.use(fileUpload({}));
app.use(middlewareCors);
app.use(middlewareFilePath(path.resolve(__dirname, "files")));
app.use(express.json());
app.use(express.static("static"));
app.use("/api/auth", authRouter);
app.use("/api/files", fileRouter);

const start = async () => {
    try {
        await mongoose.connect(config.get("dbUrl"))
        app.listen(PORT, () => {
                console.log(PORT, "server run")
            }
        )
    } catch (e) {
        console.log(e, 'err this')
    }
}
start();
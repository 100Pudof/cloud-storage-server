const Router = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const config = require("config");

const router = new Router();
const jwt = require("jsonwebtoken");
const {check, validationResult} = require("express-validator");
const authMiddleware = require("../middleware/auth.middleware");
const fileService = require("../services/fileService");
const File = require("../models/File");

router.post("/registration",
    [
        check("email", "Некорректный email").isEmail(),
        check("password", "Пароль должен быть не менее 3 символов и не более 12").isLength({min: 3, max: 12}),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({message: "Некорректный запрос", errors})
            }

            const {email, password} = req.body;
            const candidate = await User.findOne({email});

            if (candidate) {
                return res.status(400).json({message: `Пользователь с почтой "${email}" уже существует`});
            }

            const hashPassword = await bcrypt.hash(password, 8);
            const user = new User({email, password: hashPassword});
            await user.save()
            await fileService.createDir(req, new File({user: user.id, name: ""}));
            return res.json(
                {
                    id: user.id,
                    email: user.email,
                    message: "Пользователь успешно создан."
                }
            );
        } catch (e) {
            console.log(e)
            res.send({message: `Server error ${e}`})
        }
    });

router.post("/login",
    async (req, res) => {
        try {
            const {email, password} = req.body;
            const user = await User.findOne({email});

            if (!user) {
                return res.status(400).json({message: "Пользователь не найден"});
            }

            const isPassValid = bcrypt.compareSync(password, user.password);

            if (!isPassValid) {
                return res.status(400).json({message: "Неверный пароль"});
            }

            const token = jwt.sign({id: user.id}, config.get("secretKey"), {expiresIn: "3h"});
            return res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    diskSpace: user.diskSpace,
                    usedSpace: user.usedSpace,
                    avatar: user.avatar
                }
            })
        } catch (e) {
            console.log(e)
            res.send({message: `Server error ${e}`})
        }
    });

router.get("/auth", authMiddleware,
    async (req, res) => {
        try {
            if (!req.user) {
                return  res.status(401).json({})
            }
            const user = await User.findOne({id: req.user.id})
            const token = jwt.sign({id: user.id}, config.get("secretKey"), {expiresIn: "1h"});
            return res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    diskSpace: user.diskSpace,
                    usedSpace: user.usedSpace,
                    avatar: user.avatar
                }
            })
        } catch (e) {
            console.log(e)
            res.send({message: `Server error ${e}`})
        }
    });

module.exports = router;
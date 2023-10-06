const jwt = require("jsonwebtoken");
const db = require("../model");
const User = db.user;
const Role = db.role;

const config = process.env.SECRET

const verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({ message: "No token provided!" });
    }

    jwt.verify(token,
        config,
        (err, decoded) => {
            if (err) {
                return res.status(401).send({
                    message: "Unauthorized!",
                });
            }
            req.userId = decoded.id;
            next();
        });
};

const isAdmin = (req, res, next) => {
    User.findById(req.userId).exec().then((user) => {
        Role.find(
            {
                _id: { $in: user.roles }
            }).then((roles) => {
                for (let i = 0; i < roles.length; i++) {
                    if (roles[i].name === "admin") {
                        next();
                        return;
                    }
                }

                res.status(403).send({ message: "Require Admin Role!" });

            }
        );
    });
};

isModerator = (req, res, next) => {
    User.findById(req.userId).exec().then((user) => {
        Role.find(
            {
                _id: { $in: user.roles }
            }).then((roles) => {
                for (let i = 0; i < roles.length; i++) {
                    if (roles[i].name === "moderator") {
                        next();
                        return;
                    }
                }

                res.status(403).send({ message: "Require Moderator Role!" });
            }
        );
    });
};

const authJwt = {
    verifyToken,
    isAdmin,
    isModerator
};
module.exports = authJwt;
const db = require("../model");
const User = db.user;
const Role = db.role;

let jwt = require("jsonwebtoken");
let bcrypt = require("bcryptjs");

const config = process.env.SECRET

exports.signup = (req, res) => {
    console.log(req.body)
    const user = new User({
        username: req.body.username, email: req.body.email, password: bcrypt.hashSync(req.body.password, 8)
    });

    user.save().then((user) => {
        if (req.body.roles) {
            Role.find({
                name: {$in: req.body.roles}
            }).then(( roles) => {
                user.roles = roles.map(role => role._id);
                user.save().then(() => {
                    res.send({message: "User was registered successfully!"});
                });
            })
        } else {
            Role.findOne({name: "user"}).then((role) => {

                user.roles = [role._id];
                user.save().then(() => {

                    res.send({message: "User was registered successfully!"});
                });
            });
        }
    });
};

exports.signin = (req, res) => {
    User.findOne({
        username: req.body.username
    })
        .populate("roles", "-__v")
        .exec().then( (user) => {

        if (!user) {
            return res.status(404).send({message: "User Not found."});
        }

        let passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

        if (!passwordIsValid) {
            console.log("password is invalid");
            return res.status(401).send({
                accessToken: null, message: "Invalid Password!"
            });
        }
        console.log("password is valid");
        const token = jwt.sign({id: user.id}, config, {
            algorithm: 'HS256', allowInsecureKeySizes: true, expiresIn: 86400, // 24 hours
        });

        const authorities = [];

        for (let i = 0; i < user.roles.length; i++) {
            authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
        }
        res.status(200).send({
            id: user._id, username: user.username, email: user.email, roles: authorities, accessToken: token
        });
    });
};
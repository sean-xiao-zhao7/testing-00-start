const expect = require("chai").expect;
const sinon = require("sinon");
const mongoose = require("mongoose");
const MONGODB_URI = require("../secrets/mongodb");

const User = require("../models/user");
const AuthController = require("../controllers/auth");

describe("Auth controller - login", function () {
    it("should throw an error if accessing database fails", function (done) {
        sinon.stub(User, "findOne");
        User.findOne.throws();

        const req = {
            body: {
                email: "test@test.com",
                password: "testtest2",
            },
        };
        AuthController.login(req, {}, () => {}).then((result) => {
            expect(result).to.be.an("error");
            expect(result).to.have.property("statusCode", 500);
            done();
        });

        User.findOne.restore();
    });

    it("should send a response with user status for valid user", function (done) {
        mongoose
            .connect(MONGODB_URI)
            .then((result) => {
                const user = new User({
                    _id: "60a6d466fc6a1514f42e2b60",
                    email: "test@test1.com",
                    password: "asdfasdfasdfasdf",
                    name: "adsfasdfasdf",
                    posts: [],
                });
                return user;
            })
            .then((user) => {
                const req = { userId: user._id };
                const res = {
                    statusCode: 500,
                    userStatus: null,
                    status: function (code) {
                        this.statusCode = code;
                        return this;
                    },
                    json: function (data) {
                        this.userStatus = data.status;
                    },
                };

                AuthController.getUserStatus()
                    .then(req, res, () => {
                        
                    })
                    .then((_) => {
                        expect(res.statusCode).to.be.equal(200);
                        expect(res.userStatus).to.be.equal("I am new");
                    });
            })
            .catch((err) => console.log(err));
    });
});

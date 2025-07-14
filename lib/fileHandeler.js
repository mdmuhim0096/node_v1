const fs = require("fs");

const deletePreviusFile = (path) => {
   fs.unlink(`./public${path}`, (err) => { console.log("error is:- ", err) })
}

module.exports = { deletePreviusFile }

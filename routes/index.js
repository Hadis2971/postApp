const express = require("express"),
      router  = express.Router(),
      multer = require("multer"),
      GridFsStorage = require("multer-gridfs-storage"),
      Grid = require("gridfs-stream"),
      mongoose = require("mongoose"),
      ImageCard = require("../models/imageCard"),
      crypto = require("crypto"),
      path = require("path");

const mongoURI = "mongodb://localhost:27017/postApp";

let gfs;
var conn = mongoose.createConnection(mongoURI);
conn.once('open', function () {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
})

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash("error_msg", "Please Login First!!!");
        res.redirect(303, "/users/login");
    }
}

router.get("/", ensureAuthenticated, (req, res) => {
    ImageCard.find({}, (err, files) => {
        if(err) throw err;
        else{
            if(!files){
                res.render("index", {files: false});
            }else{
                res.render("index", {files: files});
            }
        }
    });
});

var storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
});
  const upload = multer({ storage });


router.post('/upload', upload.single('imageFile'), function (req, res, next) {
    let newImageCard = new ImageCard({textArea: req.body.textArea, filename: req.file.filename});
    newImageCard.save((err, obj) => {
        if(err) throw err;
        else{
            console.log(obj);
            res.redirect(303, "/");
        }
    });
});

router.delete("/remove/:id", (req, res) => {
    ImageCard.findOne({_id: req.params.id}).remove((err) => {
        if(err) throw err;
        else res.redirect(303, "/");
    });
});

router.get("/image/:filename", (req, res) => {
    gfs.files.findOne({filename: req.params.filename}, (err, file) => {
        if(err) throw err;
        else{
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        }
    });
});

module.exports = router;
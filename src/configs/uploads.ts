import multer = require('multer');
import fs = require('fs');
import path = require('path');
var moment = require('moment-timezone');


const timezone_name = "Asia/Kolkata";
function serverDateTime(format) {
  var jun = moment(new Date());
  jun.tz(timezone_name).format();
  return jun.format(format);
}

const fileNameGenerate =  (extension) => {
  var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  var result = '';
  for (let i = 10; i > 0; i--) result += chars[Math.floor(Math.random() * chars.length)];
  return serverDateTime('YYYYMMDDHHmmssms') + result + '.' + extension;
}
var files = [];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/Marchands/');
  },
  filename: function (req, file, cb) {
    console.log("TYYTRTY ===> ", req["files"])
    console.log("YYYUUTUTUYTY ===> ", file)
    const nmbre = file.originalname.split(".");
    file.originalname = fileNameGenerate(nmbre[nmbre.length - 1]);
    cb(null, file.originalname);
    files.push(file);
  },
});

const storageParcelle = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/Parcelles/');
  },
  filename: function (req, file, cb) {
    console.log("TYYTRTY ===> ", req["files"])
    console.log("YYYUUTUTUYTY ===> ", file)
    const nmbre = file.originalname.split(".");
    file.originalname = fileNameGenerate(nmbre[nmbre.length - 1]);
    cb(null, file.originalname);
    files.push(file);
  },
});

const storageParametre = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/Parametres/');
  },
  filename: function (req, file, cb) {
    console.log("TYYTRTY ===> ", req["files"])
    console.log("YYYUUTUTUYTY ===> ", file)
    const nmbre = file.originalname.split(".");
    file.originalname = fileNameGenerate(nmbre[nmbre.length - 1]);
    cb(null, file.originalname);
    files.push(file);
  },
});


// export const storage = multer({ storage: multer.memoryStorage() });

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 //5Mo
  },
  fileFilter: fileFilter
});

export const listen = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 115 //5Mo
    },
    fileFilter: fileFilter
});

export const uploadParcelle = multer({
  storage: storageParcelle,
  limits: {
    fileSize: 1024 * 1024 * 115 //5Mo
  },
  fileFilter: fileFilter
});


export const uploadParametre = multer({
  storage: storageParametre,
  limits: {
    fileSize: 1024 * 1024 * 115 //5Mo
  },
  fileFilter: fileFilter
});

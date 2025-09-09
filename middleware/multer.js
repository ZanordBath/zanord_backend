
const multer = require("multer");
const path = require("path");
const Client = require("basic-ftp");
const ftp = require("basic-ftp");
const { Readable } = require("stream");
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error("Only images (JPEG, JPG, PNG, GIF) and PDFs are allowed"));
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
  fileFilter: fileFilter,
});

const uploadEBrochure = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 20,
  },
  fileFilter: fileFilter,
});

const ftpConfig = {
  user: 'zanord1@zanordbath.com',
  host: 'ftp.zanordbath.com',
  password: 'Yky-yoiD;@=f',
  port: 21,
  secure: false, // Try true or 'implicit' if FTPS is required
  passive: true,
  connTimeout: 100000, // Increase to 100 seconds
  pasvTimeout: 100000, // Increase to 100 seconds
  keepalive: 10000, // Keepalive interval set to 10 seconds
};

const uploadFileToCPanel = async (file) => {
  const client = new ftp.Client(300000);
  client.ftp.verbose = true;

  const timestamp = Date.now();
  const filename = `${timestamp}${path.extname(file.originalname)}`;
  const remotePath = `/${filename}`;
  const fileUrl = `https://zanordbath.com/uploads/${filename}`;

  try {
    console.log("Connecting to:", ftpConfig.host, "on port:", ftpConfig.port);

    await client.access({
      host: ftpConfig.host,
      user: ftpConfig.user,
      password: ftpConfig.password,
      port: ftpConfig.port,
      secure: ftpConfig.secure,
      connTimeout: ftpConfig.connTimeout,
      pasvTimeout: ftpConfig.pasvTimeout,
      keepalive: ftpConfig.keepalive,
    });
    console.log("FTP connection successful");

    await client.ensureDir("/");
    console.log("Changed to directory: /");

    console.log("Attempting to upload file:", remotePath);
    const stream = Readable.from(file.buffer);

    await client.uploadFrom(stream, remotePath);

    // ✅ Close immediately to avoid waiting on control socket
    client.close();

    console.log("File uploaded successfully to:", remotePath);
    console.log("Returning file URL:", fileUrl);

    return fileUrl;
  } catch (error) {
    console.error("FTP error details:", error);

    // ✅ If timeout happens after upload, still return URL
    if (error.message.includes("Timeout (control socket)")) {
      console.warn("Timeout after upload, returning file URL anyway:", fileUrl);
      return fileUrl;
    }

    throw new Error(`Failed to upload file to cPanel: ${error.message}`);
  } finally {
    if (!client.closed) client.close();
  }
};


const handleFtpUploadSingle = (fieldName) => async (req, res, next) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  });
  const uploadMiddleware = upload.single(fieldName);

  uploadMiddleware(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err.message);
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return next();
    }
    try {
      const imageUrl = await uploadFileToCPanel(req.file);
      req.file.imageUrl = imageUrl;
      next();
    } catch (error) {
      console.error("FTP upload middleware error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });
};

const handleFtpUploadMultiple = (fieldName, maxCount) => async (req, res, next) => {
  const uploadMiddleware = upload.array(fieldName, maxCount);
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err.message);
      return res.status(400).json({ error: err.message });
    }
    if (!req.files || req.files.length === 0) {
      return next();
    }
    try {
      const imageUrls = [];
      for (const file of req.files) {
        const imageUrl = await uploadFileToCPanel(file);
        imageUrls.push(imageUrl);
      }
      req.files.imageUrls = imageUrls;
      next();
    } catch (error) {
      console.error("FTP upload middleware error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });
};

const handleFtpUploadFields = (fields, uploadInstance) => async (req, res, next) => {
  const uploadMiddleware = uploadInstance.fields(fields);
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err.message);
      return res.status(400).json({ error: err.message });
    }
    try {
      const uploadedFiles = {};
      for (const field of fields) {
        const fieldName = field.name;
        if (req.files[fieldName]) {
          const imageUrls = [];
          for (const file of req.files[fieldName]) {
            console.log(`Uploading file for field ${fieldName}:`, file.originalname);
            const imageUrl = await uploadFileToCPanel(file);
            imageUrls.push(imageUrl);
          }
          uploadedFiles[fieldName] = imageUrls;
        }
      }
      req.files.uploadedFiles = uploadedFiles;
      console.log("Uploaded files:", uploadedFiles);
      next();
    } catch (error) {
      console.error("FTP upload middleware error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });
};

module.exports = {
  uploadSingle: handleFtpUploadSingle("image"),
  uploadLogo: handleFtpUploadSingle("logo"),
  uploadMultiple: handleFtpUploadMultiple("image", 10),
  uploadCustom: upload,
  uploadSubCategoryFields: handleFtpUploadFields([
    { name: "image", maxCount: 1 },
    { name: "subimg1", maxCount: 1 },
    { name: "subimg2", maxCount: 1 },
    { name: "subimg3", maxCount: 1 },
    { name: "subimg4", maxCount: 1 },
  ], upload),
  uploadEBrochureFields: handleFtpUploadFields([
    { name: "cover_image", maxCount: 1 },
    { name: "pdf_file", maxCount: 1 },
  ], uploadEBrochure),
};
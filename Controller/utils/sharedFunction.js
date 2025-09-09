import { Client } from 'basic-ftp';

const ftpConfig = {
  user: 'zanord1@zanordbath.com',
  host: 'ftp.zanordbath.com',
  password: 'Yky-yoiD;@=f',
  port: 21,
  secure: false
};

export const deleteFileFromCPanel = async (imageUrl) => {
  const client = new Client(10000); 
  client.verbose = true; 

  try {
    // Validate imageUrl
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.includes('uploads/')) {
      throw new Error('Invalid or missing image URL');
    }

    // Connect to cPanel via FTP
    await client.access(ftpConfig);
    console.log("FTP connection successful for deletion");

    // Navigate to the uploads directory
    await client.ensureDir("/"); // 

    // Extract the filename from the image URL
    const filename = imageUrl.split("/").pop(); // e.g., timestamp.jpg
    const remotePath = filename; // Relative path in public_html/uploads
    console.log(`Attempting to delete file: ${remotePath}`);

    // Delete the file from cPanel
    await client.remove(remotePath);
    console.log(`File deleted successfully: ${remotePath}`);

    return true; // Indicate success
  } catch (error) {
    console.error("Error deleting file from cPanel:", error.message);
    throw new Error(`Failed to delete file from cPanel: ${error.message}`);
  } finally {
    client.close(); // Ensure connection is closed
  }
};
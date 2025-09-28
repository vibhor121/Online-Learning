const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to Cloudinary
const uploadImage = async (filePath, folder = 'courses') => {
  try {
    // Try with upload preset first (unsigned)
    let uploadOptions = {
      upload_preset: 'edulearn_courses',
      resource_type: 'image',
      transformation: [
        { width: 800, height: 600, crop: 'fill' },
        { quality: 'auto' },
        { format: 'auto' }
      ]
    };

    let result;
    try {
      // Try unsigned upload with preset
      result = await cloudinary.uploader.upload(filePath, uploadOptions);
    } catch (presetError) {
      console.log('Upload preset failed, trying signed upload:', presetError.message);
      // Fallback to signed upload
      uploadOptions = {
        folder: `edulearn/${folder}`,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 600, crop: 'fill' },
          { quality: 'auto' },
          { format: 'auto' }
        ]
      };
      result = await cloudinary.uploader.upload(filePath, uploadOptions);
    }

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result: result.result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Upload multiple images
const uploadMultipleImages = async (filePaths, folder = 'courses') => {
  try {
    const uploadPromises = filePaths.map(filePath => uploadImage(filePath, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Multiple upload error:', error);
    return [];
  }
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
  uploadMultipleImages
};

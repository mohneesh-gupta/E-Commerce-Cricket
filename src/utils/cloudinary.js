// Cloudinary configuration for unsigned uploads
export const cloudinaryConfig = {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'durnerinx',
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default',
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
};

/**
 * Upload an image to Cloudinary
 * @param {File} file - The image file to upload
 * @param {Object} options - Additional upload options
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
export const uploadToCloudinary = async (file, options = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);

    // Optional: Add folder organization
    if (options.folder) {
        formData.append('folder', options.folder);
    }

    // Optional: Add tags for better organization
    if (options.tags) {
        formData.append('tags', options.tags.join(','));
    }

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
        {
            method: 'POST',
            body: formData,
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
};

/**
 * Upload multiple images to Cloudinary
 * @param {File[]} files - Array of image files to upload
 * @param {Object} options - Additional upload options
 * @returns {Promise<string[]>} - Array of secure URLs
 */
export const uploadMultipleToCloudinary = async (files, options = {}) => {
    const uploadPromises = files.map(file => uploadToCloudinary(file, options));
    return Promise.all(uploadPromises);
};

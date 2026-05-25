/**
 * Generate a signature for client-side uploads
 * This runs on the server to keep the API secret secure
 */
export async function getCloudinarySignature() {
    "use server";

    // Dynamically import cloudinary to avoid including it in the client bundle
    const { v2: cloudinary } = await import('cloudinary');

    // Configure Cloudinary
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const timestamp = Math.round((new Date()).getTime() / 1000);

    // Parameters to sign
    const params = {
        timestamp: timestamp,
        folder: 'users', // Organize uploads in a 'users' folder
    };

    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!);

    return {
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY
    };
}

/**
 * Delete an image from Cloudinary
 * This runs on the server
 */
export async function deleteFromCloudinary(publicId: string) {
    "use server";

    try {
        // Dynamically import cloudinary
        const { v2: cloudinary } = await import('cloudinary');

        // Configure Cloudinary
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        const result = await cloudinary.uploader.destroy(publicId);
        return { success: true, result };
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        return { success: false, error };
    }
}

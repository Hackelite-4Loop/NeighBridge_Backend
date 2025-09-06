import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary (only API secret needed on backend)
cloudinary.config({
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('🔧 Cloudinary configured');
console.log('🔑 CLOUDINARY_API_SECRET loaded:', process.env.CLOUDINARY_API_SECRET ? 'YES' : 'NO');
console.log('🔑 API Secret length:', process.env.CLOUDINARY_API_SECRET?.length);
console.log('🔑 API Secret (first 10 chars):', process.env.CLOUDINARY_API_SECRET?.substring(0, 10));

// Generate signed upload parameters for secure uploads
export const generateUploadSignature = (folder: string, userId: string, cloudName: string, apiKey: string) => {
  const timestamp = Math.round(Date.now() / 1000);
  
  // Check if API secret is loaded correctly
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  console.log('🔧 Environment check:');
  console.log('  - NODE_ENV:', process.env.NODE_ENV);
  console.log('  - API Secret exists:', !!apiSecret);
  console.log('  - API Secret length:', apiSecret?.length);
  console.log('  - API Secret (first 10):', apiSecret?.substring(0, 10));
  
  if (!apiSecret) {
    throw new Error('CLOUDINARY_API_SECRET environment variable is not set');
  }
  
  // Parameters that will be included in the signature - ORDER MATTERS!
  // Cloudinary expects alphabetical order for signature generation
  const paramsForSignature = {
    allowed_formats: 'jpg,jpeg,png,webp',
    folder: `neighbridge/${folder}/${userId}`,
    timestamp: timestamp,
    transformation: folder === 'profiles' 
      ? 'w_400,h_400,c_fill,g_face,q_auto,f_auto' // Profile image optimization
      : 'w_800,h_600,c_limit,q_auto,f_auto', // General post image optimization
  };

  console.log('🔐 Generating signature for params (ordered):', paramsForSignature);

  // Generate signature (only for parameters that require signing)
  const signature = cloudinary.utils.api_sign_request(paramsForSignature, apiSecret);
  
  console.log('✅ Generated signature:', signature);

  const result = {
    signature,
    timestamp,
    api_key: apiKey,
    cloud_name: cloudName,
    folder: paramsForSignature.folder,
    transformation: paramsForSignature.transformation,
    allowed_formats: paramsForSignature.allowed_formats,
    max_file_size: 5000000, // 5MB limit - sent but not signed
  };

  console.log('📤 Returning signature data:', result);
  return result;
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Extract public ID from Cloudinary URL
export const extractPublicId = (url: string): string => {
  // Example URL: https://res.cloudinary.com/cloud/image/upload/v1234567890/neighbridge/profiles/userId/image.jpg
  const matches = url.match(/\/v\d+\/(.+)\.[^.]+$/);
  return matches ? matches[1] : '';
};

export default cloudinary;

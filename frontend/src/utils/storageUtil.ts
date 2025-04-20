import supabaseClient from "@/hooks/supabaseClient";


/**
 * Uploads a file to Supabase storage
 * @param file - The file to upload
 * @param bucket - The bucket name (defaults to env variable)
 * @param folder - Optional folder path within the bucket
 * @returns URL of the uploaded file or null if upload failed
 */
export const uploadFile = async (
  file: File | string | null,
  folder: string = 'general'
): Promise<string | null> => {
  if (!file) return null;
  
  // If the file is already a URL string, return it as is
  if (typeof file === 'string') {
    // Check if it's already a Supabase URL to avoid re-uploading
    // if (file.includes(supabaseClient.storage.url)) {
    //   return file;
    // }
    const bucketName = import.meta.env.VITE_SUPABASE_BUCKET || 'election-result';
    const { data: urlData } = supabaseClient.storage.from(bucketName).getPublicUrl('');
    if (file.includes(urlData.publicUrl)) {
      return file;
    }
    // For external URLs, we could download and re-upload, but for simplicity we'll just return the URL
    return file;
  }
  
  const bucketName = import.meta.env.VITE_SUPABASE_BUCKET || 'election-result';
  
  try {
    // Create a unique file name to avoid collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    // Upload file to Supabase
    const { data, error } = await supabaseClient.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }
    
    // Get public URL
    const { data: urlData } = supabaseClient.storage
      .from(bucketName)
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Unexpected error during file upload:', error);
    return null;
  }
};

/**
 * Deletes a file from Supabase storage
 * @param fileUrl - The public URL of the file to delete
 * @returns boolean indicating success/failure
 */
export const deleteFile = async (fileUrl: string): Promise<boolean> => {
    // if (!fileUrl || !fileUrl.includes(supabaseClient.storage.url)) {
    //     return false;
    //   }
  const bucketName = import.meta.env.VITE_SUPABASE_BUCKET || 'election-result';
  const { data: urlData } = supabaseClient.storage.from(bucketName).getPublicUrl('');
  if (!fileUrl || !fileUrl.includes(urlData.publicUrl)) {
    return false;
  }
  
  try {
    // Extract the path from the URL
    const urlObj = new URL(fileUrl);
    const pathParts = urlObj.pathname.split('/');
    const filePath = pathParts.slice(pathParts.indexOf(bucketName) + 1).join('/');
    
    const { error } = await supabaseClient.storage
      .from(bucketName)
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error during file deletion:', error);
    return false;
  }
};
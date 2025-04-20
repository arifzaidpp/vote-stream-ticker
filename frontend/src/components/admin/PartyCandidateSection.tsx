import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDropzone } from 'react-dropzone';
import { Image, X } from 'lucide-react';
import { uploadFile, deleteFile } from '@/utils/storageUtil';

interface Candidate {
  position: string;
  name: string;
  photo: string | File | null;
}

interface PartyCandidateSectionProps {
  partyName: string;
  candidates: Candidate[];
  onCandidateChange: (position: string, field: 'name' | 'photo', value: string | File | null) => void;
}

const PartyCandidateSection: React.FC<PartyCandidateSectionProps> = ({
  partyName,
  candidates,
  onCandidateChange
}) => {
  // Keep track of preview URLs for File objects
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});

  // Generate preview URLs when candidates change
  useEffect(() => {
    // Clear old FileReader operations
    const urlsToUpdate: Record<string, string> = {};
    
    candidates.forEach(candidate => {
      if (candidate.photo instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setPreviewUrls(prev => ({
              ...prev,
              [candidate.position]: e.target?.result as string
            }));
          }
        };
        reader.readAsDataURL(candidate.photo);
      }
    });
    
    return () => {
      // Clean up any preview URLs when component unmounts
      Object.values(previewUrls).forEach(url => {
        if (url.startsWith('data:')) {
          // No need to revoke data URLs
        }
      });
    };
  }, [candidates]);

  const getDropzone = (position: string) => {
    const { getRootProps, getInputProps } = useDropzone({
      accept: {
        'image/*': ['.jpeg', '.jpg', '.png']
      },
      maxFiles: 1,
      onDrop: files => {
        if (files[0]) {
          onCandidateChange(position, 'photo', files[0]);
        }
      }
    });

    return { getRootProps, getInputProps };
  };

  const handleRemovePhoto = async (position: string, photo: string | File | null) => {
    // If the photo is a URL (string), attempt to delete it from storage
    if (typeof photo === 'string') {
      try {
        await deleteFile(photo);
      } catch (error) {
        console.error(`Error deleting candidate photo: ${error}`);
      }
    }
    
    // Update state to remove the photo
    onCandidateChange(position, 'photo', null);
    
    // Remove preview URL
    setPreviewUrls(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[position];
      return newPreviews;
    });
  };

  // Helper to get the correct image source
  const getImageSrc = (candidate: Candidate) => {
    if (!candidate.photo) return null;
    
    if (typeof candidate.photo === 'string') {
      return candidate.photo; // Return the URL directly
    }
    
    // Return data URL from our previewUrls state
    return previewUrls[candidate.position];
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <h3 className="text-lg font-semibold">{partyName} Candidates</h3>
      </CardHeader>
      <CardContent className="space-y-6">
        {candidates.map((candidate) => {
          const { getRootProps, getInputProps } = getDropzone(candidate.position);
          const imageSrc = getImageSrc(candidate);

          return (
            <div key={candidate.position} className="space-y-4">
              <Label>{candidate.position}</Label>
              <div className="flex gap-4">
                <Input
                  placeholder={`Enter ${candidate.position} name`}
                  value={candidate.name}
                  onChange={(e) => onCandidateChange(candidate.position, 'name', e.target.value)}
                  className="flex-1"
                />
                <div className="relative w-32 h-32">
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg h-full flex items-center justify-center cursor-pointer
                      ${candidate.photo ? 'border-none' : 'border-gray-300 hover:border-gray-400'}`}
                  >
                    <input {...getInputProps()} />
                    {imageSrc ? (
                      <>
                        <img
                          src={imageSrc}
                          alt={`${candidate.name} photo`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePhoto(candidate.position, candidate.photo);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center">
                        <Image className="mx-auto h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-500">Upload photo</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default PartyCandidateSection;
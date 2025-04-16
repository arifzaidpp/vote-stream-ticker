import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDropzone } from 'react-dropzone';
import { Image, X } from 'lucide-react';

interface Candidate {
  position: string;
  name: string;
  photo: File | null;
}

interface PartyCandidateSectionProps {
  partyName: string;
  candidates: Candidate[];
  onCandidateChange: (position: string, field: 'name' | 'photo', value: string | File) => void;
}

const PartyCandidateSection: React.FC<PartyCandidateSectionProps> = ({
  partyName,
  candidates,
  onCandidateChange
}) => {
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

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <h3 className="text-lg font-semibold">{partyName} Candidates</h3>
      </CardHeader>
      <CardContent className="space-y-6">
        {candidates.map((candidate) => {
          const { getRootProps, getInputProps } = getDropzone(candidate.position);
          const photoUrl = candidate.photo ? URL.createObjectURL(candidate.photo) : null;

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
                      ${photoUrl ? 'border-none' : 'border-gray-300 hover:border-gray-400'}`}
                  >
                    <input {...getInputProps()} />
                    {photoUrl ? (
                      <>
                        <img
                          src={photoUrl}
                          alt={`${candidate.name} photo`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCandidateChange(candidate.position, 'photo', null);
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
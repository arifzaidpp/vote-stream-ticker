import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDropzone } from 'react-dropzone';
import { HexColorPicker } from "react-colorful";
import { Image, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { uploadFile, deleteFile } from '@/utils/storageUtil';

interface PartyFormProps {
  partyName: string;
  logo: File | null | string;
  color: string;
  isEditMode?: boolean;
  onPartyChange: (field: 'name' | 'logo' | 'color', value: string | File | null) => void;
  onRemove: () => void;
}

const PartyForm: React.FC<PartyFormProps> = ({
  partyName,
  logo,
  color,
  isEditMode = false,
  onPartyChange,
  onRemove
}) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Generate data URL preview for File objects
  useEffect(() => {
    if (logo instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setLogoPreview(e.target?.result as string);
        }
      };
      reader.readAsDataURL(logo);
    } else if (typeof logo === 'string') {
      setLogoPreview(logo);
    } else {
      setLogoPreview(null);
    }
    
    // Clean up if needed
    return () => {
      // No clean up needed for data URLs
    };
  }, [logo]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    onDrop: files => {
      if (files[0]) {
        onPartyChange('logo', files[0]);
      }
    }
  });

  const handleRemoveLogo = async () => {
    // If the logo is a URL (string), attempt to delete it from storage
    if (typeof logo === 'string') {
      try {
        await deleteFile(logo);
      } catch (error) {
        console.error(`Error deleting party logo: ${error}`);
      }
    }
    
    // Update state to remove the logo
    onPartyChange('logo', null);
    setLogoPreview(null);
  };

  const handleRemoveParty = async () => {
    // If the logo is a URL (string), attempt to delete it from storage before removing the party
    if (typeof logo === 'string') {
      try {
        await deleteFile(logo);
      } catch (error) {
        console.error(`Error deleting party logo during party removal: ${error}`);
      }
    }
    
    // Call the parent's onRemove function
    onRemove();
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Party Details</h3>
        {!isEditMode && <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-700"
          onClick={handleRemoveParty}
        >
          Remove Party
        </Button>}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Party Name</Label>
          <Input
            placeholder="Enter party name"
            value={partyName}
            onChange={(e) => onPartyChange('name', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Party Logo</Label>
          <div className="relative w-32 h-32">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg h-full flex items-center justify-center cursor-pointer
                ${logo ? 'border-none' : 'border-gray-300 hover:border-gray-400'}`}
            >
              <input {...getInputProps()} />
              {logoPreview ? (
                <>
                  <img
                    src={logoPreview}
                    alt="Party logo"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveLogo();
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <Image className="mx-auto h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-500">Upload logo</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Party Color</Label>
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[220px] justify-start text-left font-normal"
                >
                  <div
                    className="h-4 w-4 rounded mr-2"
                    style={{ backgroundColor: color }}
                  />
                  {color}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3">
                <HexColorPicker
                  color={color}
                  onChange={(newColor) => onPartyChange('color', newColor)}
                />
              </PopoverContent>
            </Popover>
            <Input
              value={color}
              onChange={(e) => onPartyChange('color', e.target.value)}
              className="w-[150px]"
              placeholder="#000000"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PartyForm;
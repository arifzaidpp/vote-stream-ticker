import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, gql } from '@apollo/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDropzone } from 'react-dropzone';
import { Image, X, ArrowLeft, Plus, Minus } from 'lucide-react';
import PartyForm from '@/components/admin/PartyForm';
import PartyCandidateSection from '@/components/admin/PartyCandidateSection';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { uploadFile } from '@/utils/storageUtil';


const CREATE_ELECTION = gql`
  mutation CreateElection($input: CreateElectionDto!) {
    createElection(input: $input) {
      id
      name
      logo
      status
      totalVoters
      votingCompletion
      accessCode
      createdAt
      updatedAt
      parties {
        id
        name
        logo
        color
        candidates {
          id
          name
          photo
          position
        }
      }
      booths {
        id
        boothNumber
        voterCount
        totalVotesCounted
      }
    }
  }
`;

const UPDATE_ELECTION = gql`
  mutation UpdateElection($input: UpdateElectionDto!) {
    updateElection(input: $input) {
      id
      name
      logo
      status
      totalVoters
      votingCompletion
      createdAt
      updatedAt
      parties {
        id
        name
        logo
        color
        candidates {
          id
          name
          photo
          position
        }
      }
      booths {
        id
        boothNumber
        voterCount
        totalVotesCounted
      }
    }
  }
`;

const GET_ELECTION_BY_ID = gql`
  query ElectionById($electionByIdId: String!) {
    electionById(id: $electionByIdId) {
      id
      name
      logo
      status
      totalVoters
      votingCompletion
      createdAt
      updatedAt
      booths {
        id
        boothNumber
        voterCount
        totalVotesCounted
      }
      parties {
        id
        name
        logo
        color
        candidates {
          id
          name
          photo
          position
        }
      }
    }
  }
`;

const formSchema = z.object({
  electionName: z.string().min(1, 'Election name is required'),
  boothCount: z.number().min(1, 'At least one booth is required'),
});

interface Party {
  id: string;
  name: string;
  logo: File | null | string;
  logoPreview?: string; // Added preview URL
  color: string;
  candidates: {
    id?: string;
    position: string;
    name: string;
    photo: File | null | string;
    photoPreview?: string; // Added preview URL
  }[];
}

interface BoothVoters {
  id: string;
  boothNumber?: number;
  name: string;
  totalVoters: number;
  totalVotesCounted?: number;
}

interface ElectionData {
  electionById: {
    id: string;
    name: string;
    logo: string;
    status: string;
    totalVoters: number;
    votingCompletion: number;
    createdAt: string;
    updatedAt: string;
    booths: {
      id: string;
      boothNumber: number;
      voterCount: number;
      totalVotesCounted: number;
    }[];
    parties: {
      id: string;
      name: string;
      logo: string;
      color: string;
      candidates: {
        id: string;
        name: string;
        photo: string;
        position: string;
      }[];
    }[];
  };
}

// Helper function to convert File to data URL
const fileToDataUrl = (file) => {
  return new Promise((resolve) => {
    if (!file || typeof file === 'string') {
      resolve(file); // Return the string URL if it's already a URL
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
};

const ElectionSetup = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const [logo, setLogo] = useState<File | null | string>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [parties, setParties] = useState<Party[]>([]);
  const [booths, setBooths] = useState<BoothVoters[]>([
    { id: '1', name: 'Booth 1', totalVoters: 0 }
  ]);
  const [isUploading, setIsUploading] = useState(false);
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      electionName: '',
      boothCount: 1,
    }
  });

  // Update preview when logo changes
  useEffect(() => {
    const updateLogoPreview = async () => {
      const preview = await fileToDataUrl(logo);
      setLogoPreview(preview as string);
    };
    
    updateLogoPreview();
  }, [logo]);

  // Query election data if in edit mode
  const { loading: loadingElection, error: errorElection, data: electionData } = useQuery<ElectionData>(
    GET_ELECTION_BY_ID,
    {
      variables: { electionByIdId: id },
      skip: !isEditMode,
      onCompleted: (data) => {
        if (data && data.electionById) {
          // Populate form with existing data
          const election = data.electionById;
          
          // Set form values
          reset({
            electionName: election.name,
            boothCount: election.booths.length,
          });
          
          // Set logo
          setLogo(election.logo);
          setLogoPreview(election.logo);
          
          // Set booths
          const formattedBooths = election.booths.map(booth => ({
            id: booth.id,
            boothNumber: booth.boothNumber,
            name: `Booth ${booth.boothNumber}`,
            totalVoters: booth.voterCount,
            totalVotesCounted: booth.totalVotesCounted
          }));
          setBooths(formattedBooths);
          
          // Set parties
          const formattedParties = election.parties.map(party => ({
            id: party.id,
            name: party.name,
            logo: party.logo,
            logoPreview: party.logo,
            color: party.color,
            candidates: party.candidates.map(candidate => ({
              id: candidate.id,
              position: candidate.position,
              name: candidate.name,
              photo: candidate.photo,
              photoPreview: candidate.photo
            }))
          }));
          setParties(formattedParties);
        }
      }
    }
  );

  const boothCount = watch('boothCount');

  const [createElection, { loading: loadingCreate }] = useMutation(CREATE_ELECTION, {
    onCompleted: (data) => {
      toast({
        title: "Success",
        description: "Election created successfully",
      });
      navigate('/admin/elections');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const [updateElection, { loading: loadingUpdate }] = useMutation(UPDATE_ELECTION, {
    onCompleted: (data) => {
      toast({
        title: "Success",
        description: "Election updated successfully",
      });
      navigate('/admin/elections');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update booths when booth count changes (only in create mode or when manually adjusting in edit mode)
  useEffect(() => {
    if (loadingElection) return; // Don't update booths while election data is loading
    
    const currentCount = parseInt(boothCount as unknown as string) || 1;
    
    if (currentCount > booths.length) {
      // Add new booths
      const newBooths = Array.from({ length: currentCount - booths.length }, (_, index) => ({
        id: `new-${Date.now()}-${index}`, // Temporary ID for new booths
        name: `Booth ${booths.length + index + 1}`,
        totalVoters: 0
      }));
      setBooths([...booths, ...newBooths]);
    } else if (currentCount > booths.length) {
      // Add new booths WITH proper booth numbers
      const newBooths = Array.from({ length: currentCount - booths.length }, (_, index) => ({
        id: `new-${Date.now()}-${index}`,
        name: `Booth ${booths.length + index + 1}`,
        boothNumber: booths.length + index + 1, // Add this line to set proper booth numbers
        totalVoters: 0
      }));
      setBooths([...booths, ...newBooths]);
    }
  }, [boothCount, booths.length, isEditMode, loadingElection]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    onDrop: async files => {
      if (files.length > 0) {
        setLogo(files[0]);
      }
    }
  });

  const addParty = () => {
    const newParty: Party = {
      id: `new-${Date.now()}`,
      name: '',
      logo: null,
      logoPreview: null,
      color: '#000000',
      candidates: [
        { position: 'President', name: '', photo: null, photoPreview: null },
        { position: 'Secretary', name: '', photo: null, photoPreview: null },
        { position: 'Treasurer', name: '', photo: null, photoPreview: null }
      ]
    };
    setParties([...parties, newParty]);
  };

  const handlePartyChange = async (partyId: string, field: 'name' | 'logo' | 'color', value: string | File | null) => {
    if (field === 'logo' && value instanceof File) {
      // Convert to data URL for preview
      const preview = await fileToDataUrl(value);
      
      setParties(parties.map(party => 
        party.id === partyId ? { 
          ...party, 
          [field]: value,
          logoPreview: preview as string 
        } : party
      ));
    } else {
      setParties(parties.map(party => 
        party.id === partyId ? { ...party, [field]: value } : party
      ));
    }
  };

  const handleCandidateChange = async (
    partyId: string,
    position: string,
    field: 'name' | 'photo',
    value: string | File | null
  ) => {
    if (field === 'photo' && value instanceof File) {
      // Convert to data URL for preview
      const preview = await fileToDataUrl(value);
      
      setParties(parties.map(party => {
        if (party.id === partyId) {
          return {
            ...party,
            candidates: party.candidates.map(candidate => 
              candidate.position === position ? { 
                ...candidate, 
                [field]: value,
                photoPreview: preview as string
              } : candidate
            )
          };
        }
        return party;
      }));
    } else {
      setParties(parties.map(party => {
        if (party.id === partyId) {
          return {
            ...party,
            candidates: party.candidates.map(candidate => 
              candidate.position === position ? { ...candidate, [field]: value } : candidate
            )
          };
        }
        return party;
      }));
    }
  };

  const handleBoothVotersChange = (boothId: string, value: string) => {
    const voters = parseInt(value) || 0;
    setBooths(prevBooths => 
      prevBooths.map(booth => 
        booth.id === boothId ? { ...booth, totalVoters: voters } : booth
      )
    );
  };

  const removeParty = (partyId: string) => {
    setParties(parties.filter(party => party.id !== partyId));
  };
  
  const generateAccessCode = (): string => {
    // Generate a random 6-digit code
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const onSubmit = async (data: any) => {
    // Validate parties
    if (parties.length === 0) {
      toast({
        title: "Error",
        description: "At least one party is required",
        variant: "destructive",
      });
      return;
    }

    // Validate booth voters
    const totalVoters = booths.reduce((sum, booth) => sum + booth.totalVoters, 0);
    if (totalVoters === 0) {
      toast({
        title: "Error",
        description: "Total voters must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    // Validate party details
    for (const party of parties) {
      if (!party.name || !party.logo || !party.color) {
        toast({
          title: "Error",
          description: `Please fill all details for party: ${party.name || 'Unnamed Party'}`,
          variant: "destructive",
        });
        return;
      }

      // Validate candidates
      for (const candidate of party.candidates) {
        if (!candidate.name || !candidate.photo) {
          toast({
            title: "Error",
            description: `Please fill all details for ${candidate.position} candidate in party: ${party.name}`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    try {
      setIsUploading(true);
      
      // Upload election logo (if it's a File object)
      const logoUrl = await uploadFile(logo, 'election-logos');
      
      // Process parties
      const formattedParties = await Promise.all(parties.map(async (party) => {
        const partyLogoUrl = await uploadFile(party.logo, 'party-logos');
        
        // Process candidates
        const formattedCandidates = await Promise.all(party.candidates.map(async (candidate) => {
          const photoUrl = await uploadFile(candidate.photo, 'candidate-photos');
          console.log('Candidate photo URL:', photoUrl);
          
          
          return {
            ...(candidate.id && { id: candidate.id }), // Include ID if available (for edit mode)
            name: candidate.name,
            photo: photoUrl,
            position: candidate.position.toUpperCase()
          };
        }));
        
        return {
          ...(party.id && !party.id.startsWith('new-') && { id: party.id }), // Include ID if available and not temporary
          name: party.name,
          logo: partyLogoUrl,
          color: party.color,
          candidates: formattedCandidates
        };
      }));
      
      // Format booths
// Format booths
const formattedBooths = booths.map((booth, index) => {
  // Create the basic booth data without ID
  const boothData = {
    boothNumber: booth.boothNumber || index + 1, // Use existing number or generate sequential number
    voterCount: booth.totalVoters
  };
  
  return boothData;
});
      
      if (isEditMode) {
        // Update existing election
        await updateElection({
          variables: {
            input: {
              id: id,
              name: data.electionName,
              logo: logoUrl,
              booths: formattedBooths,
              parties: formattedParties,
            }
          }
        });
      } else {
        // Create new election
        const input = {
          name: data.electionName,
          logo: logoUrl,
          booths: formattedBooths,
          parties: formattedParties,
          status: "DRAFT",
          totalVoters: totalVoters,
          accessCode: generateAccessCode(),
        };

        console.log('Create election input:', input);
        
        
        await createElection({ 
          variables: { input },
          onError: (error) => {
            console.error('Detailed error:', error);
            // Check if there are validation errors in the response
            const validationErrors = error.graphQLErrors?.[0]?.extensions?.validationErrors;
            if (validationErrors) {
              console.error('Validation errors:', validationErrors);
            }
          }
        });
      }
      
    } catch (error) {
      console.error('Error saving election:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? 'update' : 'create'} election. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Show loading state while fetching election data in edit mode
  if (isEditMode && loadingElection) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Loading Election Data...</h1>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-32" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  // Show error if election data fetch failed
  if (isEditMode && errorElection) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/elections')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Elections
        </Button>
        <div className="p-4 bg-red-50 text-red-500 rounded-lg">
          Error loading election: {errorElection.message}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="ghost"
        onClick={() => navigate('/admin/elections')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Elections
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">{isEditMode ? 'Edit Election' : 'Setup New Election'}</h1>
        <p className="text-gray-500 mt-1">{isEditMode ? 'Update election details' : 'Fill in the details for the new election'}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold">General Information</h2>
          
          <div className="space-y-2">
            <Label htmlFor="electionName">Election Name</Label>
            <Input
              id="electionName"
              {...register('electionName')}
              className={errors.electionName ? 'border-red-500' : ''}
            />
            {errors.electionName && (
              <p className="text-red-500 text-sm">{errors.electionName.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Election Logo</Label>
            <div className="relative w-32 h-32">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg h-full flex items-center justify-center cursor-pointer
                  ${logoPreview ? 'border-none' : 'border-gray-300 hover:border-gray-400'}`}
              >
                <input {...getInputProps()} />
                {logoPreview ? (
                  <>
                    <img
                      src={logoPreview}
                      alt="Election logo"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLogo(null);
                        setLogoPreview(null);
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

          <div className="space-y-4">
            {!isEditMode && <div className="space-y-2">
              <Label htmlFor="boothCount">Number of Booths</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setValue('boothCount', Math.max(1, (boothCount as number) - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="boothCount"
                  type="number"
                  min="1"
                  {...register('boothCount', { valueAsNumber: true })}
                  className={errors.boothCount ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setValue('boothCount', (boothCount as number) + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {errors.boothCount && (
                <p className="text-red-500 text-sm">{errors.boothCount.message as string}</p>
              )}
            </div>}

            <div className="space-y-4 border rounded-lg p-4">
              <h3 className="font-medium">Booth Details</h3>
              <div className="grid gap-4">
                {booths.map((booth) => (
                  <div key={booth.id} className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label htmlFor={`booth-${booth.id}`}>{booth.name}</Label>
                      <Input
                        id={`booth-${booth.id}`}
                        type="number"
                        min="0"
                        value={booth.totalVoters}
                        onChange={(e) => handleBoothVotersChange(booth.id, e.target.value)}
                        placeholder="Enter total voters"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-500">
                Total Voters Across All Booths: {booths.reduce((sum, booth) => sum + booth.totalVoters, 0)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Party Management</h2>
            {!isEditMode && <Button type="button" onClick={addParty}>Add Party</Button>}
          </div>

          {parties.length === 0 ? (
            <div className="text-center p-10 border-2 border-dashed rounded-lg">
              <p className="text-gray-500">No parties added yet. Click "Add Party" to start.</p>
            </div>
          ) : (
            parties.map(party => (
              <div key={party.id} className="mb-8">
                <PartyForm
                  partyName={party.name}
                  logo={party.logo}
                  isEditMode={isEditMode}
                  // logoPreview={party.logoPreview}
                  color={party.color}
                  onPartyChange={(field, value) => handlePartyChange(party.id, field, value)}
                  onRemove={() => removeParty(party.id)}
                />
                <PartyCandidateSection
                  partyName={party.name || 'Unnamed Party'}
                  candidates={party.candidates}
                  onCandidateChange={(position, field, value) => 
                    handleCandidateChange(party.id, position, field, value)
                  }
                />
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/elections')}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loadingCreate || loadingUpdate || isUploading}
          >
            {isUploading ? 'Uploading Files...' : 
              (loadingCreate || loadingUpdate 
                ? (isEditMode ? 'Updating...' : 'Saving...') 
                : (isEditMode ? 'Update Election' : 'Save Election'))}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ElectionSetup;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDropzone } from 'react-dropzone';
import { Image, X, ArrowLeft, Plus, Minus } from 'lucide-react';
import PartyForm from '@/components/admin/PartyForm';
import PartyCandidateSection from '@/components/admin/PartyCandidateSection';
import { toast } from '@/components/ui/use-toast';

const formSchema = z.object({
  electionName: z.string().min(1, 'Election name is required'),
  boothCount: z.number().min(1, 'At least one booth is required'),
});

interface Party {
  id: string;
  name: string;
  logo: File | null;
  color: string;
  candidates: {
    position: string;
    name: string;
    photo: File | null;
  }[];
}

interface BoothVoters {
  id: string;
  name: string;
  totalVoters: number;
}

const ElectionSetup = () => {
  const navigate = useNavigate();
  const [logo, setLogo] = useState<File | null>(null);
  const [parties, setParties] = useState<Party[]>([]);
  const [booths, setBooths] = useState<BoothVoters[]>([
    { id: '1', name: 'Booth 1', totalVoters: 0 }
  ]);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      electionName: '',
      boothCount: 1,
    }
  });

  const boothCount = watch('boothCount');

  // Update booths when booth count changes
  React.useEffect(() => {
    const currentCount = parseInt(boothCount as any) || 1;
    if (currentCount > booths.length) {
      // Add new booths
      const newBooths = Array.from({ length: currentCount - booths.length }, (_, index) => ({
        id: (booths.length + index + 1).toString(),
        name: `Booth ${booths.length + index + 1}`,
        totalVoters: 0
      }));
      setBooths([...booths, ...newBooths]);
    } else if (currentCount < booths.length) {
      // Remove excess booths
      setBooths(booths.slice(0, currentCount));
    }
  }, [boothCount]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    onDrop: files => setLogo(files[0])
  });

  const addParty = () => {
    const newParty: Party = {
      id: Date.now().toString(),
      name: '',
      logo: null,
      color: '#000000',
      candidates: [
        { position: 'President', name: '', photo: null },
        { position: 'Secretary', name: '', photo: null },
        { position: 'Treasurer', name: '', photo: null }
      ]
    };
    setParties([...parties, newParty]);
  };

  const handlePartyChange = (partyId: string, field: 'name' | 'logo' | 'color', value: string | File | null) => {
    setParties(parties.map(party => 
      party.id === partyId ? { ...party, [field]: value } : party
    ));
  };

  const handleCandidateChange = (
    partyId: string,
    position: string,
    field: 'name' | 'photo',
    value: string | File | null
  ) => {
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

  const onSubmit = (data) => {
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

    // TODO: Submit the form data
    console.log('Form data:', { ...data, logo, parties, booths });
    
    toast({
      title: "Success",
      description: "Election setup completed successfully",
    });
    
    navigate('/admin/elections');
  };

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
        <h1 className="text-3xl font-bold">Setup New Election</h1>
        <p className="text-gray-500 mt-1">Fill in the details for the new election</p>
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
              <p className="text-red-500 text-sm">{errors.electionName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Election Logo</Label>
            <div className="relative w-32 h-32">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg h-full flex items-center justify-center cursor-pointer
                  ${logo ? 'border-none' : 'border-gray-300 hover:border-gray-400'}`}
              >
                <input {...getInputProps()} />
                {logo ? (
                  <>
                    <img
                      src={URL.createObjectURL(logo)}
                      alt="Election logo"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLogo(null);
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
            <div className="space-y-2">
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
                <p className="text-red-500 text-sm">{errors.boothCount.message}</p>
              )}
            </div>

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
            <Button type="button" onClick={addParty}>Add Party</Button>
          </div>

          {parties.map(party => (
            <div key={party.id} className="mb-8">
              <PartyForm
                partyName={party.name}
                logo={party.logo}
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
          ))}
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/elections')}
          >
            Cancel
          </Button>
          <Button type="submit">Save Election</Button>
        </div>
      </form>
    </div>
  );
};

export default ElectionSetup;
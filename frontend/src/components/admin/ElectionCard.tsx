import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit2, Trash2, Vote } from 'lucide-react';

interface ElectionCardProps {
  title: string;
  date: string;
  status: 'Draft' | 'Ongoing' | 'Completed';
  voterCount: number;
  accessCode: string;
  onClickCount: () => void;
  onClickEdit: () => void;
  onClickDelete: () => void;
  isDeleting?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Draft':
      return 'bg-yellow-100 text-yellow-800';
    case 'Ongoing':
      return 'bg-green-100 text-green-800';
    case 'Completed':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const ElectionCard: React.FC<ElectionCardProps> = ({
  title,
  date,
  status,
  voterCount,
  accessCode,
  onClickCount,
  onClickEdit,
  onClickDelete,
  isDeleting
}) => {
  return (
    <Card className="w-full transition-all hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="font-bold text-lg">{title}</h3>
        <Badge className={getStatusColor(status)}>{status}</Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">
          Created At: {date}
        </p>
        <p className="text-sm text-gray-500">
          Total Voters: {voterCount}
        </p>
        <p className="text-sm text-gray-500">
          Election Access Code: {accessCode}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onClickCount}
          className="flex items-center gap-1"
        >
          <Vote className="h-4 w-4" />
          Count Votes
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onClickEdit}
          className="flex items-center gap-1"
        >
          <Edit2 className="h-4 w-4" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onClickDelete}
          disabled={isDeleting}
          className={`flex items-center gap-1 text-red-600 hover:text-red-700 ${
            isDeleting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isDeleting ? (
            <span>Deleting...</span>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              Delete
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ElectionCard;
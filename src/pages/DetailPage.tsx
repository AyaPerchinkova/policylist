import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PolicyList } from './listSlice';
import { Button, Table, TableCell, TableColumn, TableRow, Text } from '@ui5/webcomponents-react';

interface PolicyDetailPageProps {}

const PolicyDetailPage: React.FC<PolicyDetailPageProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedPolicyList, setSelectedPolicyList] = useState<PolicyList | null>(null);

  useEffect(() => {
    const storedPolicyList = sessionStorage.getItem('selectedPolicyList');

    if (storedPolicyList) {
      setSelectedPolicyList(JSON.parse(storedPolicyList));
      sessionStorage.removeItem('selectedPolicyList'); 
    } else {
      const fetchData = async () => {
        try {
          const response = await fetch(`/api/lists/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch policy details');
          }

          const responseData = await response.json();
          setSelectedPolicyList(responseData);
        } catch (error) {
          console.error('Error fetching policy details:', error);
        }
      };

      fetchData();
    }
  }, [id]);

  const handleClose = () => {
    navigate('/'); // Navigate back to the home page
  };

  if (!selectedPolicyList) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <Button onClick={handleClose}>Back</Button>
      <h1>Policy Details</h1>
      <Table>
        <TableRow>
          <TableCell>
            <Text>Name</Text>
          </TableCell>
          <TableCell>
            <Text>{selectedPolicyList.name}</Text>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Text>Type</Text>
          </TableCell>
          <TableCell>
            <Text>{selectedPolicyList.type}</Text>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Text>Size</Text>
          </TableCell>
          <TableCell>
            <Text>{selectedPolicyList.size}</Text>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Text>ID</Text>
          </TableCell>
          <TableCell>
            <Text>{selectedPolicyList.id}</Text>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Text>Created At</Text>
          </TableCell>
          <TableCell>
            <Text>{new Date(selectedPolicyList.createdAt).toLocaleString()}</Text>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Text>Ranges</Text>
          </TableCell>
          <TableCell>
            <Text>{selectedPolicyList.ranges.join(', ')}</Text>
          </TableCell>
        </TableRow>
      </Table>
    </div>
  );
};

export default PolicyDetailPage;
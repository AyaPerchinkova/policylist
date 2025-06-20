import React, { useEffect, useState } from 'react';
import {
  Dialog,
  FlexBox,
  Label,
  Input,
  Form,
  FormItem,
  Button,
  Bar,
  Option,
  Select,
  Ui5CustomEvent,
  SelectDomRef,
  InputDomRef,
  ButtonDesign,
  FlexBoxDirection,
  FlexBoxAlignItems
} from '@ui5/webcomponents-react';
import { PolicyList, PolicyListType, cidrRegex } from '../../pages/listSlice';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { use } from 'i18next';

interface ViewDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (editedPolicyList: PolicyList) => void;
  policyList: PolicyList | null;
}

const ViewDialog: React.FC<ViewDialogProps> = ({ open, onClose, onSave, policyList }) => {
  const { t } = useTranslation(); // Initialize the translation hook
  const [name, setName] = useState<string>(policyList?.name || '');
  const [ipRanges, setIpRanges] = useState<string[]>(policyList?.ranges || ['']);

  const [type, setType] = useState<PolicyListType>(
    (policyList?.type as PolicyListType) || PolicyListType.Allow
  );
  const [region, setRegion] = useState<string>(policyList?.region || ''); // Add region state
  const [username, setUsername] = useState<string>('');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false); // State for error dialog
  const [errorMessage, setErrorMessage] = useState(''); // State for error message
  const navigate = useNavigate();

  useEffect(() => {
    if (policyList) {
      setName(policyList.name || '');
      setIpRanges(policyList.ranges || ['']);
      setType(policyList.type || PolicyListType.Allow);
      setRegion(policyList.region || ''); // Initialize region
      setUsername(policyList.username || ''); // Initialize username
    }
  }, [policyList]);

  useEffect(() => {
    const storedData = localStorage.getItem('viewDialogData');
    console.log('Stored data:', storedData); // Debugging line
    if (storedData) {
      const { name: storedName, ipRanges: storedIpRanges, type: storedType, region: storedRegion } = JSON.parse(storedData);
      setName(storedName || '');
      setIpRanges(storedIpRanges || ['']);
      setType(storedType || PolicyListType.Allow);
      setRegion(storedRegion || ''); // Restore region from localStorage
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('viewDialogData', JSON.stringify({ name, ipRanges, type, region, username }));
  }, [name, ipRanges, type, region, username]);

  const handleSave = () => {
    if (policyList) {
      // Validate each range against the CIDR regex before saving
      const isValidRanges = ipRanges.every((range) => cidrRegex.test(range.trim()));

      if (!isValidRanges) {
        // Display an error or prevent saving if any range is invalid
           // Set the error message and open the error dialog
          setErrorMessage(t('viewDialog.invalidIPRange')); // Translated error message
          setErrorDialogOpen(true); // Open the error dialog
      return;

      }

      const editedPolicyList: PolicyList = {
        ...policyList,
        username: localStorage.getItem('username') || '',
        name: name !== '' ? name : policyList.name,
        ranges: ipRanges.filter((range) => range.trim() !== ''),
        type: type,
        region: region, // Include region in the saved policy
        updatedAt: new Date().toISOString(),
      };
      
      console.log("Edited policy list being saved:", editedPolicyList); // Debugging
      onSave(editedPolicyList);
      onClose();
      // Navigate back to the original page
      navigate('/');
    }
  };

  const onTypeSelect = (event: Ui5CustomEvent<SelectDomRef, { selectedOption: HTMLElement }>) => {
    const selectedValue = event.detail.selectedOption?.getAttribute("value");
    if (selectedValue) {
      setType(selectedValue as PolicyListType); // Ensure the type is updated correctly
    }
  };

  const onRegionSelect = (event: Ui5CustomEvent<SelectDomRef, { selectedOption: HTMLElement }>) => {
    const selectedValue = event.detail.selectedOption?.getAttribute("value");
    if (selectedValue) {
      console.log("Selected region:", selectedValue); // Debugging
      setRegion(selectedValue); // Update the selected region
    }
  };

  const handleAddRange = () => {
    // Create a new range with an initial value (e.g., an empty string)
    const newRange = '';
    const isValidCIDR = !newRange || cidrRegex.test(newRange);

    if (isValidCIDR) {
      setIpRanges((prevRanges) => [...prevRanges, newRange]);
    } else {
          // Set the error message and open the error dialog
    setErrorMessage(t('viewDialog.invalidIPRange')); // Translated error message
    setErrorDialogOpen(true); // Open the error dialog
    }
  };

  const handleRemoveRange = (index: number) => {
    setIpRanges((prevRanges) => {
      if (prevRanges.length === 1) {
        return [''];
      } else {
        return prevRanges.filter((_, i) => i !== index);
      }
    });
  };

  const handleRangeChange = (index: number, value: string) => {
    setIpRanges((prevRanges) =>
      prevRanges.map((range, i) => (i === index ? value : range))
    );
  };

  return (
    <>
    <Dialog
      open={open}
      onAfterClose={onClose}
      headerText={t("viewDialog.headerText")} // Translated header text
      footer={
        <Bar
          endContent={
            <>
              <Button onClick={handleSave} data-testid="save-button">{t("viewDialog.save")} {/* Translated */}
              </Button>
              <Button onClick={onClose} data-testid="close-button">{t("viewDialog.cancel")} {/* Translated */}
              </Button>
            </>
          }
        />
      }
      style={{ width: '50%' }}
    >
      <Form style={{ width: '100%' }}>
        <FormItem label={<Label required showColon>{t("viewDialog.name")}</Label>}>
          <Input
            data-testid="input-name"
            value={name}
            onChange={(event: Ui5CustomEvent<InputDomRef, never>) => {
              setName(event.target.value!);
            }}
            style={{ width: '100%' }}
          />
        </FormItem>
        <FormItem label={<Label required showColon>{t("viewDialog.ipRanges")}</Label>}>
          <div>
            {ipRanges.map((range, index) => (
              <FlexBox key={index} direction={FlexBoxDirection.Row} alignItems={FlexBoxAlignItems.Center}>
                <Input
                  data-testid={`input-ip-range-${index}`}
                  value={range}
                  onChange={(event: Ui5CustomEvent<InputDomRef, never>) => handleRangeChange(index, event.target.value!)}
                  style={{ width: '100%' }}
                />
                {ipRanges.length > 1 && (
                  <Button
                    onClick={() => handleRemoveRange(index)}
                    icon="decline"
                    design={ButtonDesign.Transparent}
                    style={{ marginLeft: '8px' }}
                  />
                )}
              </FlexBox>
            ))}
            <Button 
              onClick={handleAddRange}   
              data-testid="add-button"   
              icon="add" 
              design={ButtonDesign.Transparent} 
            />
          </div>
        </FormItem>
        <FormItem label={<Label required showColon>{t("viewDialog.policyType")}</Label>}>
          <Select 
            data-testid="select-type" 
            required 
            onChange={onTypeSelect} 
            style={{ width: '100%' }}
          >
            <Option value={PolicyListType.Allow} selected={type === PolicyListType.Allow}>
            {t("viewDialog.allow")}
            </Option>
            <Option value={PolicyListType.Block} selected={type === PolicyListType.Block}>
            {t("viewDialog.block")}
            </Option>
            <Option value={PolicyListType.restricted} selected={type === PolicyListType.restricted}>
            {t("viewDialog.restricted")}
            </Option>
          </Select>
        </FormItem>
        <FormItem label={<Label required showColon>{t("viewDialog.region")}</Label>}>
          <Select
            data-testid="select-region"
            required
            onChange={onRegionSelect}
            style={{ width: '100%' }}
          >
            <Option value="" disabled selected={!region}>
              {t("viewDialog.selectRegion")} {/* Translated */}
         </Option>
            <Option value="NA">{t("viewDialog.NA")}</Option>
            <Option value="EU">{t("viewDialog.EU")}</Option>
            <Option value="APAC">{t("viewDialog.APAC")}</Option>
            <Option value="LATAM">{t("viewDialog.LATAM")}</Option>
            <Option value="MEA">{t("viewDialog.MEA")}</Option>
            <Option value="ANZ">{t("viewDialog.ANZ")}</Option>
          </Select>
        </FormItem> 
      </Form>
    </Dialog>
     {/* Error Dialog */}
     <Dialog
      open={errorDialogOpen}
      onAfterClose={() => setErrorDialogOpen(false)} // Close the dialog when dismissed
      headerText={t("viewDialog.error")} // Translated header text
      style={{ width: '30%' }}
    >
      <div style={{ padding: '1rem' }}>
        <p>{errorMessage}</p>
        <Button
          design={ButtonDesign.Emphasized}
          onClick={() => setErrorDialogOpen(false)} // Close the dialog on button click
        >
          {t("viewDialog.ok")} {/* Translated "OK" button */}
        </Button>
      </div>
    </Dialog>
  </>
  );
};

export default ViewDialog;
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  Input,
  Form,
  FormItem,
  Button,
  Label,
  Bar,
  Option,
  FlexBox,
  Select,
  FlexBoxAlignItems,
  FlexBoxDirection,
  FlexBoxJustifyContent,
  FlexBoxWrap,
  Ui5CustomEvent,
  SelectDomRef,
  DialogDomRef,
  InputDomRef,
  ButtonDesign,
  MessageBoxTypes,
  MessageBox,
} from '@ui5/webcomponents-react';
import { PolicyList, PolicyListType, cidrRegex } from '../../pages/listSlice';
import '@ui5/webcomponents-icons/dist/add';
import { useTranslation } from 'react-i18next';

interface DialogProps {
  isOpen: boolean,
  createList: (newList: PolicyList) => void,
  handleClose: () => void,
  onClose?: ((event: Ui5CustomEvent<DialogDomRef, never>) => void) | undefined
}

const CreateDialog: React.FunctionComponent<DialogProps> = ({ isOpen, createList, handleClose, onClose }) => {

  const { t } = useTranslation(); // Initialize the translation hook
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<PolicyListType>(PolicyListType.Allow);
  const [additionalRanges, setAdditionalRanges] = useState<string[]>(['']);
  const [fetchedId, setFetchedId] = useState<string>('');
  const [region, setRegion] = useState<string>(''); // State for selected region
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>(''); // State for username

  const handleAddRange = () => {
    setAdditionalRanges((prevRanges) => [...prevRanges, '']);
  };

  const handleRemoveRange = (index: number) => {
    setAdditionalRanges((prevRanges) => {
      if (prevRanges.length === 1) {
        return [''];
      } else {
        return prevRanges.filter((_, i) => i !== index);
      }
    });
  };

  const handleRangeChange = (index: number, value: string) => {
    setAdditionalRanges((prevRanges) =>
      prevRanges.map((range, i) => (i === index ? value : range))
    );
  };

  const handleDialogClose = () => {
    setError(null);
  };

  useEffect(() => {
    if (isOpen) {
      setName('');
      setFetchedId('');
      setAdditionalRanges(['']);
      setType(PolicyListType.Allow);
      setRegion(''); // Reset region when dialog opens
      setUsername('');
    }
  }, [isOpen]);

  const handleCreate = () => {
    const username = localStorage.getItem("username"); // Retrieve the username from localStorage

    console.log("Creating policy with:", { name, type, region, additionalRanges, username});
    if (!username) {
      console.error("Username is missing. Cannot create policy.");
      setError("Username is missing. Please log in again.");
      return;
    }

    if (!name) {
      setError(t("error.enterName"));
    } else if (additionalRanges.every((range) => cidrRegex.test(range))) {
      const newList: PolicyList = {
        username : username,
        id: fetchedId || `${Date.now()}`,
        name,
        ranges: additionalRanges,
        type,
        region,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        size: additionalRanges.length,
      };
      console.log("Payload being sent:", {
        username: username,
        id: fetchedId || `${Date.now()}`,
        name,
        ranges: additionalRanges,
        type,
        region,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        size: additionalRanges.length,
      });
      console.log("Payload being sent:", newList); // Debugging
      //newList.username = username; // Set the username in the policy list
      console.log("Payload being sent:", newList); // Debugging
      createList(newList);
      setError(null);
      handleClose();
    } else {
      setError(t("error.invalidIPRange"));
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
      setRegion(selectedValue); // Update the selected region
    }
  };
  

  return (
    <>
      <Dialog
        footer={
          <Bar endContent={
            <>
              <Button
                data-testid="create-button"
                onClick={handleCreate}
              >
                {t("create")} {/* Translate "Create" */}
                </Button>
              <Button
                onClick={handleClose}
              >
                {t("close")} {/* Translate "Close" */}
                </Button>
            </>
          }
          />
        }
        headerText={t("createPolicyList")} // Translate "Create Policy List"
        open={isOpen}
        onAfterClose={onClose}
        data-testid="policylist-create-dialog"
        style={{ width: '600px', height: '400px' }}
      >
        <FlexBox
          alignItems={FlexBoxAlignItems.Center}
          direction={FlexBoxDirection.Row}
          justifyContent={FlexBoxJustifyContent.Center}
          wrap={FlexBoxWrap.NoWrap}
          style={{ display: 'block' }}
        >
          <Form data-testid="form">
            <FormItem label={<Label required showColon id="name-label">{t("name")}</Label>}>
              <Input
                data-testid="input-name"
                value={name}
                onChange={(event: Ui5CustomEvent<InputDomRef, never>) => { setName(event.target.value!); }}
                style={{ width: '100%' }}
                aria-labelledby="name-label"
              />
            </FormItem>
            <FormItem label={<Label required showColon>{t("ipRange")}</Label>}>
              <div>
                {additionalRanges.map((range, index) => (
                  <FlexBox
                    key={index}
                    direction={FlexBoxDirection.Row}
                    alignItems={FlexBoxAlignItems.Center}>
                    <Input
                      data-testid={`input-ip-range-${index}`}
                      value={range}
                      onChange={(event: Ui5CustomEvent<InputDomRef, never>) => handleRangeChange(index, event.target.value!)}
                      style={{ width: '80%' }}
                    />
                    {additionalRanges.length > 1 && (
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
                  icon="add"
                  design={ButtonDesign.Transparent} />
              </div>
            </FormItem>
            <FormItem label={<Label required showColon>{t("type")}</Label>}>
              <Select
                data-testid="select-type"
                required onChange={onTypeSelect}
                style={{ width: '100%' }}>
                <Option value={PolicyListType.Allow} selected={type === PolicyListType.Allow}>
                {t('allow')} {/* Translate "Allow" */}
              </Option>
              <Option value={PolicyListType.Block} selected={type === PolicyListType.Block}>
                {t('block')} {/* Translate "Block" */}
              </Option>
              <Option value={PolicyListType.restricted} selected={type === PolicyListType.restricted}>
                {t('restricted')} {/* Translate "Restricted" */}
              </Option>
              </Select>
            </FormItem>
            <FormItem label={<Label required showColon>{t("Region")}</Label>}>
              <Select
                data-testid="select-region"
                required
                onChange={onRegionSelect}
                style={{ width: '100%' }}
              >
                <Option value="" disabled selected={!region}>
                  {t("selectRegion")} {/* Translate "Select Region" */}
                </Option>
                <Option value="NA">{t("NA")}</Option>
                <Option value="EU">{t("EU")}</Option>
                <Option value="APAC">{t("APAC")}</Option>
                <Option value="LATAM">{t("LATAM")}</Option>
                <Option value="MEA">{t("MEA")}</Option>
                <Option value="ANZ">{t("ANZ")}</Option>
              </Select> 
            </FormItem>
          </Form>
        </FlexBox>
      </Dialog>

      <MessageBox
        type={MessageBoxTypes.Error}
        open={!!error}
        onClose={handleDialogClose}
      >
        {error}
      </MessageBox>
    </>
  );
};

export default CreateDialog;
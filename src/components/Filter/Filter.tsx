import React from 'react';
import { Select, Option } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next'; // Import the translation hook

interface FilterProps {
  selectedType: string;
  handleTypeChange: (event: any) => void;
}

const Filter: React.FC<FilterProps> = ({ selectedType, handleTypeChange }) => {
  const { t } = useTranslation(); // Initialize the translation hook

  return (
    <div className="filter-container" data-testid="filter-component">
      <Select onChange={handleTypeChange} data-testid="filter-dropdown">
        <Option data-sap-ui-value="All" data-testid="option-all">
          {t("filter.all")} {/* Translated */}
        </Option>
        <Option data-sap-ui-value="allow" data-testid="option-allow">
          {t("filter.allow")} {/* Translated */}
        </Option>
        <Option data-sap-ui-value="block" data-testid="option-block">
          {t("filter.block")} {/* Translated */}
        </Option>
        <Option data-sap-ui-value="restricted" data-testid="option-restricted">
          {t("filter.restricted")} {/* Translated */}
        </Option>
      </Select>
    </div>
  );
};

export default Filter;
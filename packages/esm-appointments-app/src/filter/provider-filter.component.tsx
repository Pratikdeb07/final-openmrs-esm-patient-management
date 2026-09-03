import React from 'react';
import { useTranslation } from 'react-i18next';
import FilterDropdown from './filter-dropdown.component';

interface ProviderFilterProps {
  options: Array<{ uuid: string; label: string }>;
  selected: string[];
  onChange: (selected: string[]) => void;
}

const ProviderFilter: React.FC<ProviderFilterProps> = ({ options, selected, onChange }) => {
  const { t } = useTranslation();
  return (
    <FilterDropdown
      id="calendar-provider-filter"
      titleText={t('filterByProvider', 'Provider')}
      label={t('allProviders', 'All providers')}
      options={options}
      selected={selected}
      onChange={onChange}
    />
  );
};

export default ProviderFilter;

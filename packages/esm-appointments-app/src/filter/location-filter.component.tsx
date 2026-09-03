import React from 'react';
import { useTranslation } from 'react-i18next';
import FilterDropdown from './filter-dropdown.component';

interface LocationFilterProps {
  options: Array<{ uuid: string; label: string }>;
  selected: string[];
  onChange: (selected: string[]) => void;
}

const LocationFilter: React.FC<LocationFilterProps> = ({ options, selected, onChange }) => {
  const { t } = useTranslation();
  return (
    <FilterDropdown
      id="calendar-location-filter"
      titleText={t('filterByLocation', 'Location')}
      label={t('allLocations', 'All locations')}
      options={options}
      selected={selected}
      onChange={onChange}
    />
  );
};

export default LocationFilter;

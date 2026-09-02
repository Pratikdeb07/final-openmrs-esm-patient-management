import React from 'react';
import { useTranslation } from 'react-i18next';
import { MultiSelect } from '@carbon/react';

interface LocationFilterProps {
  options: Array<{ uuid: string; label: string }>;
  selected: string[];
  onChange: (selected: string[]) => void;
}

/** Renders the location MultiSelect filter. */
const LocationFilter: React.FC<LocationFilterProps> = ({ options, selected, onChange }) => {
  const { t } = useTranslation();

  const items = options.map((o) => ({ id: o.uuid, label: o.label }));
  const selectedItems = items.filter((i) => selected.includes(i.id));

  return (
    <MultiSelect
      id="calendar-location-filter"
      items={items}
      itemToString={(item) => item?.label ?? ''}
      titleText={t('filterByLocation', 'Location')}
      label={t('allLocations', 'All locations')}
      selectedItems={selectedItems}
      onChange={({ selectedItems: s }) => onChange(s.map((i) => i.id))}
    />
  );
};

export default LocationFilter;

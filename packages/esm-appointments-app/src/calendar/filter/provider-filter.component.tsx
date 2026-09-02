import React from 'react';
import { useTranslation } from 'react-i18next';
import { MultiSelect } from '@carbon/react';

interface ProviderFilterProps {
  options: Array<{ uuid: string; label: string }>;
  selected: string[];
  onChange: (selected: string[]) => void;
}

/** Renders the provider MultiSelect filter. */
const ProviderFilter: React.FC<ProviderFilterProps> = ({ options, selected, onChange }) => {
  const { t } = useTranslation();

  const items = options.map((o) => ({ id: o.uuid, label: o.label }));
  const selectedItems = items.filter((i) => selected.includes(i.id));

  return (
    <MultiSelect
      id="calendar-provider-filter"
      items={items}
      itemToString={(item) => item?.label ?? ''}
      titleText={t('filterByProvider', 'Provider')}
      label={t('allProviders', 'All providers')}
      selectedItems={selectedItems}
      onChange={({ selectedItems: s }) => onChange(s.map((i) => i.id))}
    />
  );
};

export default ProviderFilter;

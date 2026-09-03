import React from 'react';
import { MultiSelect } from '@carbon/react';

export interface FilterDropdownOption {
  uuid: string;
  label: string;
  color?: string;
}

interface FilterDropdownProps {
  id: string;
  titleText: string;
  label: string;
  options: FilterDropdownOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  itemToElement?: (item: FilterDropdownOption & { id: string; label: string }) => React.ReactNode | null;
}

/** Single generic MultiSelect for all calendar filters — provider/location/service use this. */
const FilterDropdown: React.FC<FilterDropdownProps> = ({
  id,
  titleText,
  label,
  options,
  selected,
  onChange,
  itemToElement,
}) => {
  const items = options.map((o) => ({ id: o.uuid, label: o.label, color: o.color }));
  const selectedItems = items.filter((i) => selected.includes(i.id));

  return (
    <MultiSelect
      id={id}
      items={items}
      itemToString={(item) => item?.label ?? ''}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      itemToElement={itemToElement as any}
      titleText={titleText}
      label={label}
      selectedItems={selectedItems}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onChange={({ selectedItems: s }) => onChange(s.map((i) => (i as any).id))}
    />
  );
};

export default FilterDropdown;

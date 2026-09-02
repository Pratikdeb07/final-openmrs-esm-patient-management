import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MultiSelect } from '@carbon/react';
import styles from './calendar-filter.scss';

interface ServiceOption {
  uuid: string;
  label: string;
  color?: string;
}

interface ServiceFilterProps {
  options: ServiceOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

/** Renders the service type MultiSelect with optional color swatches per item. */
const ServiceFilter: React.FC<ServiceFilterProps> = ({ options, selected, onChange }) => {
  const { t } = useTranslation();

  const items = options.map((o) => ({ id: o.uuid, label: o.label, color: o.color }));
  const selectedItems = items.filter((i) => selected.includes(i.id));

  const renderItemWithColor = useCallback((item: { id: string; label: string; color?: string }) => {
    if (!item) return null;
    return (
      <span className={styles.filterOptionLabel}>
        {item.color && <span className={styles.serviceColorSwatch} style={{ backgroundColor: item.color }} />}
        <span className={item.color ? styles.filterOptionTextWithColor : ''}>{item.label}</span>
      </span>
    );
  }, []);

  return (
    <MultiSelect
      id="calendar-service-filter"
      items={items}
      itemToString={(item) => item?.label ?? ''}
      itemToElement={renderItemWithColor}
      titleText={t('filterByService', 'Service')}
      label={t('allServices', 'All services')}
      selectedItems={selectedItems}
      onChange={({ selectedItems: s }) => onChange(s.map((i) => i.id))}
    />
  );
};

export default ServiceFilter;

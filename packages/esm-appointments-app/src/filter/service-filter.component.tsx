import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import FilterDropdown from './filter-dropdown.component';
import styles from './filter.scss';

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

const ServiceFilter: React.FC<ServiceFilterProps> = ({ options, selected, onChange }) => {
  const { t } = useTranslation();

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
    <FilterDropdown
      id="calendar-service-filter"
      titleText={t('filterByService', 'Service')}
      label={t('allServices', 'All services')}
      options={options}
      selected={selected}
      onChange={onChange}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      itemToElement={renderItemWithColor as any}
    />
  );
};

export default ServiceFilter;

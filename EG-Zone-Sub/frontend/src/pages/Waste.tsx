import React from 'react';
import { Dashboard } from '../vendor/waste/pages/Dashboard';
import { CustomersPage } from '../vendor/waste/pages/CustomersPage';
import { ZonesPage } from '../vendor/waste/pages/ZonesPage';
import { SubsPage } from '../vendor/waste/pages/SubsPage';
import { MapView } from '../vendor/waste/pages/MapView';
import { UpdateZonePage } from '../vendor/waste/pages/UpdateZonePage';
import { UpdateSubscriptionPage } from '../vendor/waste/pages/UpdateSubscriptionPage';

// Re-export all waste management pages
export { Dashboard, CustomersPage, ZonesPage, SubsPage, MapView, UpdateZonePage, UpdateSubscriptionPage };

// Default export for main waste management interface
export default function Waste() {
  return <Dashboard />;
}

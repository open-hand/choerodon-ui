import React from 'react';
import { StoreProvider } from './QuickFilterDataSet';
import QuickFilterMenu from './QuickFilterMenu';

export default props => (
  <StoreProvider {...props}>
    <QuickFilterMenu />
  </StoreProvider>
);

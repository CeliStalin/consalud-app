import React from 'react';
import { Layout } from '@consalud/core';

export const SyncedLayout: React.FC<{ children: React.ReactNode, logo: string }> = ({ children, logo }) => {
  return (
    <Layout logoSrc={logo}>
      {children}
    </Layout>
  );
}; 
---
to: apps/web/src/presentation/components/<%= name %>/index.tsx
---
"use client";

import React from 'react';
<% if (withHook) { -%>
import { use<%= h.capitalize(name) %> } from '@/presentation/hooks/use-<%= h.inflection.dasherize(name).toLowerCase() %>';
<% } -%>
import { containerStyles } from './<%= name %>.styles';
import { <%= name %>Props } from './<%= name %>.types';

export function <%= name %>({ className }: <%= name %>Props) {
<% if (withHook) { -%>
  const { ...state } = use<%= h.capitalize(name) %>();
<% } -%>

  return (
    <div className={containerStyles({ className })}>
      <h1><%= name %></h1>
    </div>
  );
}

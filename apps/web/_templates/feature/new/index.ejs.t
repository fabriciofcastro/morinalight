import React from 'react';
<% if (withTypes) { %>
import { <%= name %>Props } from './<%= name %>.types';
<% } %>
import clsx from 'clsx';

export const <%= name %> = (<% if (withTypes) { %>props: <%= name %>Props<% } else { %>props<% } %>) => {
  return (
    <div className={clsx('p-4 bg-white dark:bg-gray-800 rounded-md shadow')}>
      <p className="text-gray-900 dark:text-gray-100">{'<%= name %> component'}</p>
    </div>
  );
};

<% if (withTest) { %>
import { render, screen } from '@testing-library/react';
import { <%= name %> } from './<%= name %>';

describe('<%= name %> Component', () => {
  it('deve renderizar sem erros', () => {
    render(<<%= name %> />);
    expect(screen.getByText(/<%= name %> component/i)).toBeInTheDocument();
  });
});
<% } %>

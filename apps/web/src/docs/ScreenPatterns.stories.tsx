
export default {
  title: 'Docs/ScreenPatterns',
};

export const FormsIntroduction = () => (
  <div className="prose dark:prose-invert max-w-none p-8">
    <h1>Padrões de Tela: Formulários</h1>
    <p>
      Utilizamos o <code>FormFactory</code> para garantir consistência em todas as telas de cadastro e edição.
      Ele integra <code>react-hook-form</code> e <code>zod</code> de forma transparente.
    </p>
    <h2>Exemplo de Uso</h2>
    <pre className="p-4 bg-muted rounded">
{`const schema = z.object({ name: z.string().min(3) });

<FormFactory schema={schema} onSubmit={data => console.log(data)}>
  {(form) => (
    <FormFactory.Field form={form} name="name" label="Nome" />
  )}
</FormFactory>`}
    </pre>
  </div>
);

export const ReportsIntroduction = () => (
  <div className="prose dark:prose-invert max-w-none p-8">
    <h1>Padrões de Tela: Relatórios</h1>
    <p>
      O <code>ReportingWidget</code> abstrai a complexidade do <code>TanStack Table</code> v8,
      fornecendo busca global, paginação e hooks de exportação prontos para uso.
    </p>
    <h2>Exemplo de Uso</h2>
    <pre className="p-4 bg-muted rounded">
{`<ReportingWidget 
  title="Vendas" 
  columns={columns} 
  data={data} 
  onExport={() => ...} 
/>`}
    </pre>
  </div>
);

type TableDefinition = { name: string; createSQL: string };

export const registerTables = (tables: TableDefinition[]) => {
  return tables.map(table => `${table.name}: registered`);
};

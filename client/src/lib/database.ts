import { useToast } from "@/hooks/use-toast";

// Constants
export const SQL_SERVER_PORT = 1433;

// Sample SQL query templates
export const SQL_QUERY_TEMPLATES = {
  selectAll: "SELECT * FROM [table_name]",
  selectWhere: "SELECT * FROM [table_name] WHERE [condition]",
  insert: "INSERT INTO [table_name] ([columns]) VALUES ([values])",
  update: "UPDATE [table_name] SET [column] = [value] WHERE [condition]",
  delete: "DELETE FROM [table_name] WHERE [condition]",
  countAll: "SELECT COUNT(*) FROM [table_name]",
  createTable: `CREATE TABLE [table_name] (
  [column1] INT PRIMARY KEY,
  [column2] VARCHAR(100) NOT NULL,
  [column3] DATETIME DEFAULT GETDATE()
)`,
  createView: "CREATE VIEW [view_name] AS SELECT * FROM [table_name] WHERE [condition]",
  joinTables: `SELECT a.[column1], b.[column2]
FROM [table1] a
JOIN [table2] b ON a.[id] = b.[foreign_key]`
};

// Format SQL query with proper indentation
export function formatSqlQuery(sql: string): string {
  // This is a very simplified formatter
  // In a real app, you might use a dedicated SQL formatter library
  return sql
    .replace(/\s+/g, " ")
    .replace(/ (SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|ORDER BY|GROUP BY|HAVING|UNION|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP) /gi, "\n$1 ")
    .replace(/ (AND|OR) /gi, "\n  $1 ");
}

// Format SQL values for display (add commas to numbers, format dates, etc.)
export function formatSqlValue(value: any, type?: string): string {
  if (value === null || value === undefined) {
    return "NULL";
  }
  
  // Format based on SQL Server data types
  if (typeof value === "number") {
    // Format numbers with commas for thousands
    return value.toLocaleString();
  } else if (value instanceof Date) {
    // Format dates
    return value.toISOString().replace("T", " ").substring(0, 19);
  } else if (typeof value === "boolean") {
    return value ? "TRUE" : "FALSE";
  } else {
    // Default to string representation
    return String(value);
  }
}

// Generate create table SQL from a data structure
export function generateCreateTableSql(tableName: string, columns: { name: string; type: string; nullable?: boolean; defaultValue?: string }[]): string {
  const columnDefinitions = columns.map(col => {
    let def = `[${col.name}] ${col.type}`;
    if (col.nullable === false) def += " NOT NULL";
    else def += " NULL";
    if (col.defaultValue) def += ` DEFAULT ${col.defaultValue}`;
    return def;
  });

  return `CREATE TABLE [${tableName}] (\n  ${columnDefinitions.join(",\n  ")}\n)`;
}

// SQL Server connection string builder
export function buildConnectionString(config: {
  server: string;
  database: string;
  username: string;
  password: string;
  port?: number;
  encrypt?: boolean;
  trustServerCertificate?: boolean;
}): string {
  const { server, database, username, password, port = SQL_SERVER_PORT, encrypt = true, trustServerCertificate = false } = config;
  
  return `Server=${server}${port ? `,${port}` : ''};Database=${database};User Id=${username};Password=${password};Encrypt=${encrypt ? 'Yes' : 'No'};TrustServerCertificate=${trustServerCertificate ? 'Yes' : 'No'};`;
}

// SQL error helper functions
export function isConnectionError(error: any): boolean {
  return error.message?.includes("Login failed") || 
         error.message?.includes("Cannot connect") ||
         error.message?.includes("network-related") ||
         error.message?.includes("Connection timeout");
}

export function isProgrammingError(error: any): boolean {
  return error.message?.includes("Incorrect syntax") ||
         error.message?.includes("Invalid object name") ||
         error.message?.includes("multi-part identifier") ||
         error.message?.includes("Invalid column name");
}

export function isPermissionError(error: any): boolean {
  return error.message?.includes("permission") ||
         error.message?.includes("denied") ||
         error.message?.includes("authorization");
}

// Helper to convert query results to CSV format
export function resultsToCsv(columns: string[], rows: any[]): string {
  // Create CSV header
  let csv = columns.map(c => `"${c}"`).join(',') + '\n';
  
  // Add rows
  rows.forEach(row => {
    const rowValues = columns.map(col => {
      const value = row[col];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
      return value;
    });
    csv += rowValues.join(',') + '\n';
  });
  
  return csv;
}

// Helper to prompt download of query results as CSV
export function downloadCsv(data: string, filename: string = 'query_results.csv'): void {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

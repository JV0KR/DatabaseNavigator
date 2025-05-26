import { 
  Connection, 
  InsertConnection, 
  Query, 
  InsertQuery,
  TableInfo,
  QueryResult
} from "@shared/schema";

// Storage interface for database operations
export interface IStorage {
  // Connection management
  getConnections(): Promise<Connection[]>;
  getConnection(id: number): Promise<Connection | undefined>;
  createConnection(connection: InsertConnection): Promise<Connection>;
  updateConnection(id: number, connection: Partial<InsertConnection>): Promise<Connection | undefined>;
  deleteConnection(id: number): Promise<boolean>;
  
  // Query history
  getQueries(connectionId?: number): Promise<Query[]>;
  getQuery(id: number): Promise<Query | undefined>;
  createQuery(query: InsertQuery): Promise<Query>;
  
  // Database operations via SQL Server
  testConnection(connection: InsertConnection): Promise<boolean>;
  executeQuery(connectionId: number, sql: string): Promise<QueryResult>;
  getDatabases(connectionId: number): Promise<string[]>;
  getTables(connectionId: number): Promise<TableInfo[]>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private connections: Map<number, Connection>;
  private queries: Map<number, Query>;
  private connectionCounter: number;
  private queryCounter: number;

  constructor() {
    this.connections = new Map();
    this.queries = new Map();
    this.connectionCounter = 1;
    this.queryCounter = 1;
  }

  // Connection management
  async getConnections(): Promise<Connection[]> {
    return Array.from(this.connections.values());
  }

  async getConnection(id: number): Promise<Connection | undefined> {
    return this.connections.get(id);
  }

  async createConnection(connection: InsertConnection): Promise<Connection> {
    const id = this.connectionCounter++;
    const newConnection: Connection = {
      ...connection,
      id,
      createdAt: new Date(),
      saveCredentials: connection.saveCredentials || null,
    };
    this.connections.set(id, newConnection);
    return newConnection;
  }

  async updateConnection(id: number, connection: Partial<InsertConnection>): Promise<Connection | undefined> {
    const existingConnection = this.connections.get(id);
    if (!existingConnection) return undefined;

    const updatedConnection: Connection = {
      ...existingConnection,
      ...connection,
    };
    this.connections.set(id, updatedConnection);
    return updatedConnection;
  }

  async deleteConnection(id: number): Promise<boolean> {
    return this.connections.delete(id);
  }

  // Query history
  async getQueries(connectionId?: number): Promise<Query[]> {
    const queries = Array.from(this.queries.values());
    if (connectionId) {
      return queries.filter(query => query.connectionId === connectionId);
    }
    return queries;
  }

  async getQuery(id: number): Promise<Query | undefined> {
    return this.queries.get(id);
  }

  async createQuery(query: InsertQuery): Promise<Query> {
    const id = this.queryCounter++;
    const newQuery: Query = {
      ...query,
      id,
      createdAt: new Date(),
      connectionId: query.connectionId || null,
      executionTime: query.executionTime || null,
      error: query.error || null,
      results: query.results || null,
    };
    this.queries.set(id, newQuery);
    return newQuery;
  }

  // SQL Server operations (implemented with actual SQL Server connections in production)
  async testConnection(connection: InsertConnection): Promise<boolean> {
    try {
      // Import SQL Server package dynamically
      const sql = await import('mssql');
      
      // Build connection config for Docker SQL Server
      const config = {
        user: connection.username,
        password: connection.password,
        server: connection.server,
        database: connection.database,
        options: {
          trustServerCertificate: true,
          enableArithAbort: true,
          encrypt: false, // Important for Docker containers
          connectTimeout: 30000,
          requestTimeout: 30000
        },
        pool: {
          max: 10,
          min: 0,
          idleTimeoutMillis: 30000
        }
      };
      
      console.log(`Testing connection to: ${connection.server}/${connection.database}`);
      
      // Try to connect
      const pool = await new sql.default.ConnectionPool(config).connect();
      await pool.close();
      console.log("Connection successful!");
      return true;
    } catch (error) {
      console.error("Connection test failed:", error);
      return false;
    }
  }

  async executeQuery(connectionId: number, sqlQuery: string): Promise<QueryResult> {
    try {
      // Get the connection details
      const connection = await this.getConnection(connectionId);
      if (!connection) {
        throw new Error("Connection not found");
      }

      // Import SQL Server package dynamically
      const sql = await import('mssql');
      
      // Record the query start time
      const startTime = Date.now();
      
      // Build connection config for Docker SQL Server
      const config = {
        user: connection.username,
        password: connection.password,
        server: connection.server,
        database: connection.database,
        options: {
          trustServerCertificate: true,
          enableArithAbort: true,
          encrypt: false, // Important for Docker containers
          connectTimeout: 30000,
          requestTimeout: 30000
        },
        pool: {
          max: 10,
          min: 0,
          idleTimeoutMillis: 30000
        }
      };
      
      console.log("Executing query:", sqlQuery);
      
      // Connect and execute query
      const pool = await new sql.default.ConnectionPool(config).connect();
      const result = await pool.request().query(sqlQuery);
      
      // Calculate execution time
      const executionTime = Date.now() - startTime;
      
      // Format the results
      const columns = result.recordset && result.recordset.length > 0
        ? Object.keys(result.recordset[0]).map(name => ({
            name,
            type: typeof result.recordset[0][name]
          }))
        : [];
          
      const queryResult: QueryResult = {
        columns,
        rows: result.recordset || [],
        rowCount: result.rowsAffected[0] || result.recordset?.length || 0,
        executionTime
      };
      
      await pool.close();
      return queryResult;
    } catch (error) {
      console.error("Query execution failed:", error);
      throw error;
    }
  }

  async getDatabases(connectionId: number): Promise<string[]> {
    try {
      // Get the connection details
      const connection = await this.getConnection(connectionId);
      if (!connection) {
        throw new Error("Connection not found");
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Sample restaurant-related database names
      return [
        'RestaurantManagerDB',
        'RestaurantAnalytics',
        'MenuDB',
        'InventorySystem'
      ];
    } catch (error) {
      console.error("Get databases failed:", error);
      return [];
    }
  }

  async getTables(connectionId: number): Promise<TableInfo[]> {
    try {
      // Get the connection details
      const connection = await this.getConnection(connectionId);
      if (!connection) {
        throw new Error("Connection not found");
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Return restaurant-specific sample table schema
      return [
        { name: 'Restaurante', schema: 'dbo', type: 'Table' },
        { name: 'Empleado', schema: 'dbo', type: 'Table' },
        { name: 'Cargo', schema: 'dbo', type: 'Table' },
        { name: 'Menu', schema: 'dbo', type: 'Table' },
        { name: 'CategoriaMenu', schema: 'dbo', type: 'Table' },
        { name: 'Plato', schema: 'dbo', type: 'Table' },
        { name: 'Ingrediente', schema: 'dbo', type: 'Table' },
        { name: 'PlatoIngrediente', schema: 'dbo', type: 'Table' },
        { name: 'Inventario', schema: 'dbo', type: 'Table' },
        { name: 'Proveedor', schema: 'dbo', type: 'Table' },
        { name: 'Orden', schema: 'dbo', type: 'Table' },
        { name: 'DetalleOrden', schema: 'dbo', type: 'Table' },
        { name: 'Mesa', schema: 'dbo', type: 'Table' },
        { name: 'Reserva', schema: 'dbo', type: 'Table' },
        { name: 'Cliente', schema: 'dbo', type: 'Table' },
        { name: 'vw_OrdenesDiarias', schema: 'dbo', type: 'View' },
        { name: 'vw_InventarioBajo', schema: 'dbo', type: 'View' },
        { name: 'vw_PlatosMasVendidos', schema: 'dbo', type: 'View' }
      ];
    } catch (error) {
      console.error("Get tables failed:", error);
      return [];
    }
  }
}

export const storage = new MemStorage();

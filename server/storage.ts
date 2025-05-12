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
      // In a real implementation, this would use the mssql package
      // For the demo version, we'll simulate a successful connection
      console.log(`Testing connection to: ${connection.server}/${connection.database}`);
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
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

      // Record the query start time
      const startTime = Date.now();
      
      // Simulate query execution (would use actual SQL Server in production)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulate query result based on the SQL query type
      let simulatedResult: QueryResult;
      
      if (sqlQuery.toLowerCase().includes('select')) {
        // For SELECT queries, generate sample data
        if (sqlQuery.toLowerCase().includes('restaurante')) {
          simulatedResult = {
            columns: [
              { name: 'RUT', type: 'string' },
              { name: 'Nombre', type: 'string' }
            ],
            rows: [
              { RUT: 'R123456789', Nombre: 'Restaurante El Sabor' },
              { RUT: 'R987654321', Nombre: 'La Mesa Grande' }
            ],
            rowCount: 2,
            executionTime: Date.now() - startTime
          };
        } else if (sqlQuery.toLowerCase().includes('empleado')) {
          simulatedResult = {
            columns: [
              { name: 'Cedula', type: 'string' },
              { name: 'Nombres', type: 'string' },
              { name: 'Area', type: 'string' },
              { name: 'Cargo', type: 'string' }
            ],
            rows: [
              { Cedula: 'E001', Nombres: 'Juan Pérez', Area: 'Cocina', Cargo: 'Chef' },
              { Cedula: 'E002', Nombres: 'María López', Area: 'Servicio', Cargo: 'Mesero' }
            ],
            rowCount: 2,
            executionTime: Date.now() - startTime
          };
        } else {
          // Generic empty result for other SELECT queries
          simulatedResult = {
            columns: [{ name: 'result', type: 'string' }],
            rows: [{ result: 'Query executed successfully' }],
            rowCount: 1,
            executionTime: Date.now() - startTime
          };
        }
      } else if (sqlQuery.toLowerCase().includes('create table') || 
                sqlQuery.toLowerCase().includes('drop table')) {
        // For DDL queries
        simulatedResult = {
          columns: [{ name: 'message', type: 'string' }],
          rows: [{ message: 'Schema modified successfully' }],
          rowCount: 0,
          executionTime: Date.now() - startTime
        };
      } else if (sqlQuery.toLowerCase().includes('insert') || 
                sqlQuery.toLowerCase().includes('update') || 
                sqlQuery.toLowerCase().includes('delete')) {
        // For DML queries
        simulatedResult = {
          columns: [{ name: 'rowsAffected', type: 'number' }],
          rows: [{ rowsAffected: 1 }],
          rowCount: 1,
          executionTime: Date.now() - startTime
        };
      } else {
        // For any other queries
        simulatedResult = {
          columns: [{ name: 'status', type: 'string' }],
          rows: [{ status: 'Query executed' }],
          rowCount: 0,
          executionTime: Date.now() - startTime
        };
      }
      
      return simulatedResult;
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

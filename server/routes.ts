import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { connectionFormSchema, executeQuerySchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for SQL Server database management
  const apiRouter = app.route("/api");

  // Connection management
  app.get("/api/connections", async (req: Request, res: Response) => {
    try {
      const connections = await storage.getConnections();
      // Don't return passwords in the response
      const safeConnections = connections.map(conn => {
        const { password, ...safeConn } = conn;
        return safeConn;
      });
      res.json(safeConnections);
    } catch (error) {
      console.error("Error fetching connections:", error);
      res.status(500).json({ message: "Failed to fetch connections" });
    }
  });

  app.get("/api/connections/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid connection ID" });
      }

      const connection = await storage.getConnection(id);
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }

      // Don't return password in the response
      const { password, ...safeConnection } = connection;
      res.json(safeConnection);
    } catch (error) {
      console.error("Error fetching connection:", error);
      res.status(500).json({ message: "Failed to fetch connection" });
    }
  });

  app.post("/api/connections", async (req: Request, res: Response) => {
    try {
      const connectionData = connectionFormSchema.parse(req.body);
      const connection = await storage.createConnection(connectionData);
      
      // Don't return password in the response
      const { password, ...safeConnection } = connection;
      res.status(201).json(safeConnection);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Error creating connection:", error);
      res.status(500).json({ message: "Failed to create connection" });
    }
  });

  app.put("/api/connections/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid connection ID" });
      }

      const connectionData = connectionFormSchema.parse(req.body);
      const updatedConnection = await storage.updateConnection(id, connectionData);
      
      if (!updatedConnection) {
        return res.status(404).json({ message: "Connection not found" });
      }

      // Don't return password in the response
      const { password, ...safeConnection } = updatedConnection;
      res.json(safeConnection);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Error updating connection:", error);
      res.status(500).json({ message: "Failed to update connection" });
    }
  });

  app.delete("/api/connections/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid connection ID" });
      }

      const success = await storage.deleteConnection(id);
      if (!success) {
        return res.status(404).json({ message: "Connection not found" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting connection:", error);
      res.status(500).json({ message: "Failed to delete connection" });
    }
  });

  // Test connection
  app.post("/api/connections/test", async (req: Request, res: Response) => {
    try {
      const connectionData = connectionFormSchema.parse(req.body);
      const success = await storage.testConnection(connectionData);
      
      if (success) {
        res.json({ message: "Connection successful" });
      } else {
        res.status(400).json({ message: "Connection failed" });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Error testing connection:", error);
      res.status(500).json({ message: "Failed to test connection" });
    }
  });

  // Database operations
  app.post("/api/query", async (req: Request, res: Response) => {
    try {
      const { connectionId, query } = executeQuerySchema.parse(req.body);
      
      // Start measuring execution time
      const startTime = Date.now();
      
      try {
        const result = await storage.executeQuery(connectionId, query);
        
        // Record the query in history with success status
        await storage.createQuery({
          connectionId,
          query,
          executionTime: result.executionTime,
          status: "success",
          results: result,
          error: null
        });
        
        res.json(result);
      } catch (queryError: any) {
        // Calculate execution time
        const executionTime = Date.now() - startTime;
        
        // Record the query in history with error status
        await storage.createQuery({
          connectionId,
          query,
          executionTime,
          status: "error",
          results: null,
          error: queryError.message
        });
        
        res.status(400).json({ 
          message: "Query execution failed", 
          error: queryError.message 
        });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Error executing query:", error);
      res.status(500).json({ message: "Failed to execute query" });
    }
  });

  // Get databases for a connection
  app.get("/api/connections/:id/databases", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid connection ID" });
      }

      const databases = await storage.getDatabases(id);
      res.json(databases);
    } catch (error) {
      console.error("Error fetching databases:", error);
      res.status(500).json({ message: "Failed to fetch databases" });
    }
  });

  // Get tables for a connection
  app.get("/api/connections/:id/tables", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid connection ID" });
      }

      const tables = await storage.getTables(id);
      res.json(tables);
    } catch (error) {
      console.error("Error fetching tables:", error);
      res.status(500).json({ message: "Failed to fetch tables" });
    }
  });

  // Query history
  app.get("/api/queries", async (req: Request, res: Response) => {
    try {
      const connectionId = req.query.connectionId ? parseInt(req.query.connectionId as string) : undefined;
      const queries = await storage.getQueries(connectionId);
      res.json(queries);
    } catch (error) {
      console.error("Error fetching queries:", error);
      res.status(500).json({ message: "Failed to fetch queries" });
    }
  });

  app.get("/api/queries/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid query ID" });
      }

      const query = await storage.getQuery(id);
      if (!query) {
        return res.status(404).json({ message: "Query not found" });
      }

      res.json(query);
    } catch (error) {
      console.error("Error fetching query:", error);
      res.status(500).json({ message: "Failed to fetch query" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

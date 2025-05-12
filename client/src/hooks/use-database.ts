import { useState, useCallback } from "react";
import { useDatabase } from "@/contexts/database-context";
import { Connection, QueryResult } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export function useConnections() {
  return useQuery({
    queryKey: ['/api/connections'],
    queryFn: async () => {
      const res = await fetch('/api/connections', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch connections');
      return res.json() as Promise<Connection[]>;
    }
  });
}

export function useConnectionMutation() {
  const { setCurrentConnection } = useDatabase();
  
  return useMutation({
    mutationFn: async (connection: any) => {
      const res = await apiRequest('POST', '/api/connections', connection);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/connections'] });
      setCurrentConnection(data);
    }
  });
}

export function useTestConnection() {
  const [isLoading, setIsLoading] = useState(false);
  const { testConnection } = useDatabase();
  
  const testConnectionFn = useCallback(async (connectionData: any) => {
    setIsLoading(true);
    try {
      return await testConnection(connectionData);
    } finally {
      setIsLoading(false);
    }
  }, [testConnection]);
  
  return { 
    testConnection: testConnectionFn, 
    isLoading 
  };
}

export function useQueryExecution() {
  const { executeQuery, queryResults, isExecutingQuery, resetQueryResults } = useDatabase();
  
  const executeSql = useCallback(async (sql: string) => {
    return await executeQuery(sql);
  }, [executeQuery]);
  
  return {
    executeQuery: executeSql,
    queryResults,
    isExecutingQuery,
    resetQueryResults
  };
}

export function useDatabases(connectionId?: number) {
  return useQuery({
    queryKey: ['/api/connections', connectionId, 'databases'],
    queryFn: async () => {
      if (!connectionId) return [];
      const res = await fetch(`/api/connections/${connectionId}/databases`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch databases');
      return res.json() as Promise<string[]>;
    },
    enabled: !!connectionId
  });
}

export function useTables(connectionId?: number) {
  return useQuery({
    queryKey: ['/api/connections', connectionId, 'tables'],
    queryFn: async () => {
      if (!connectionId) return [];
      const res = await fetch(`/api/connections/${connectionId}/tables`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch tables');
      return res.json() as Promise<any[]>;
    },
    enabled: !!connectionId
  });
}

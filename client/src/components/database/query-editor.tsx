import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQueryExecution } from '@/hooks/use-database';
import { useDatabase } from '@/contexts/database-context';
import { formatSqlQuery } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QueryEditorProps {
  query: string;
  onChange: (query: string) => void;
}

export default function QueryEditor({ query, onChange }: QueryEditorProps) {
  const { executeQuery, isExecutingQuery } = useQueryExecution();
  const { isConnected } = useDatabase();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle Ctrl+Enter shortcut for executing query
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        onRunQuery();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [query]);

  const onRunQuery = useCallback(async () => {
    if (!isConnected) {
      toast({
        title: "Not Connected",
        description: "Please connect to a database first.",
        variant: "destructive"
      });
      return;
    }

    if (!query.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter a SQL query to execute.",
        variant: "destructive"
      });
      return;
    }

    await executeQuery(query);
  }, [query, executeQuery, isConnected, toast]);

  const handleFormatQuery = () => {
    if (!query.trim()) return;
    
    try {
      const formattedQuery = formatSqlQuery(query);
      onChange(formattedQuery);
      toast({
        title: "Query Formatted",
        description: "SQL query has been formatted.",
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "Format Failed",
        description: "Could not format the SQL query.",
        variant: "destructive"
      });
    }
  };

  // Load saved queries
  const handleLoadQuery = () => {
    // In a real app, this would open a modal with saved queries
    toast({
      title: "Load Query",
      description: "This feature would load a saved query.",
      variant: "default"
    });
  };

  // Save current query
  const handleSaveQuery = () => {
    // In a real app, this would open a save modal
    toast({
      title: "Save Query",
      description: "This feature would save the current query.",
      variant: "default"
    });
  };

  return (
    <div className="w-full lg:w-1/2 flex flex-col border-r border-secondary-200 overflow-hidden">
      <div className="bg-white p-4 border-b border-secondary-200 flex justify-between">
        <h2 className="text-lg font-medium">Query Editor</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLoadQuery}
            className="text-sm px-3 py-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Load
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSaveQuery}
            className="text-sm px-3 py-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            Save
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1 p-4 bg-white overflow-hidden">
          {/* Query Editor */}
          <div className="border border-secondary-200 rounded-md h-full overflow-hidden">
            <div className="bg-secondary-50 p-2 border-b border-secondary-200 flex items-center">
              <span className="text-xs font-medium text-secondary-600">SQL Query</span>
            </div>
            {/* Code Editor */}
            <div className="p-4 h-[calc(100%-40px)] overflow-auto custom-scrollbar bg-white">
              <textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => onChange(e.target.value)}
                className="font-mono text-sm text-secondary-800 w-full h-full outline-none resize-none"
                spellCheck="false"
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-secondary-200">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button
                onClick={onRunQuery}
                disabled={isExecutingQuery || !isConnected}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
              >
                {isExecutingQuery ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Run Query
                  </>
                )}
              </Button>
              <Button
                onClick={handleFormatQuery}
                variant="outline"
                className="px-4 py-2 border border-secondary-300 text-secondary-700 rounded-md hover:bg-secondary-50 transition"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                Format
              </Button>
            </div>
            <div>
              <span className="text-xs text-secondary-500">Ctrl+Enter to run</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

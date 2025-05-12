import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious
} from "@/components/ui/pagination";
import { Button } from '@/components/ui/button';
import { useQueryExecution } from '@/hooks/use-database';
import { useToast } from '@/hooks/use-toast';
import { resultsToCsv, downloadCsv } from '@/lib/database';
import { formatSqlValue } from '@/lib/database';

export default function QueryResults() {
  const { queryResults, isExecutingQuery } = useQueryExecution();
  const { toast } = useToast();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const exportResults = () => {
    if (!queryResults || !queryResults.rows || queryResults.rows.length === 0) {
      toast({
        title: "No Data to Export",
        description: "There are no query results to export.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get column names from the first row
      const columnNames = queryResults.columns.map(col => col.name);
      
      // Generate CSV and download
      const csvData = resultsToCsv(columnNames, queryResults.rows);
      downloadCsv(csvData, 'query_results.csv');
      
      toast({
        title: "Export Successful",
        description: "Query results have been exported to CSV.",
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export query results.",
        variant: "destructive"
      });
    }
  };

  // Calculate pagination
  const totalRows = queryResults?.rows?.length || 0;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
  
  const paginatedRows = queryResults?.rows?.slice(startIndex, endIndex) || [];

  // Generate pagination links
  const paginationLinks = [];
  if (totalPages <= 7) {
    // Show all pages if there are 7 or fewer
    for (let i = 1; i <= totalPages; i++) {
      paginationLinks.push(i);
    }
  } else {
    // Show a subset with ellipsis for many pages
    if (currentPage <= 3) {
      // Near the start
      paginationLinks.push(1, 2, 3, 4, "ellipsis", totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Near the end
      paginationLinks.push(1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      // In the middle
      paginationLinks.push(1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages);
    }
  }

  return (
    <div className="w-full lg:w-1/2 flex flex-col overflow-hidden">
      <div className="bg-white p-4 border-b border-secondary-200 flex justify-between">
        <h2 className="text-lg font-medium">Results</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportResults}
            disabled={!queryResults || queryResults.rows?.length === 0}
            className="text-sm px-3 py-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-4">
        <div className="bg-white border border-secondary-200 rounded-md overflow-hidden shadow-sm">
          <div className="border-b border-secondary-200 bg-secondary-50 py-2 px-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-secondary-600">Results</span>
              {queryResults && queryResults.rows && (
                <span className="text-xs bg-secondary-200 text-secondary-800 px-2 py-0.5 rounded-full">
                  {queryResults.rows.length} rows
                </span>
              )}
            </div>
            {queryResults && (
              <div className="text-xs text-secondary-500">
                Query completed in {queryResults.executionTime}ms
              </div>
            )}
          </div>

          {/* Table with results */}
          <div className="overflow-x-auto custom-scrollbar">
            {queryResults && queryResults.columns && queryResults.columns.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary-50">
                    {queryResults.columns.map((column, index) => (
                      <TableHead key={index} className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        {column.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRows.map((row, rowIndex) => (
                    <TableRow key={rowIndex} className="hover:bg-secondary-50">
                      {queryResults.columns.map((column, colIndex) => (
                        <TableCell key={colIndex} className="px-4 py-2 whitespace-nowrap text-sm text-secondary-800">
                          {row[column.name] !== null && row[column.name] !== undefined ? (
                            typeof row[column.name] === 'string' && row[column.name].toLowerCase() === 'red' ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                {formatSqlValue(row[column.name])}
                              </span>
                            ) : (
                              formatSqlValue(row[column.name])
                            )
                          ) : (
                            <span className="text-secondary-400">NULL</span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}

                  {/* Empty state */}
                  {(!queryResults || !queryResults.rows || queryResults.rows.length === 0) && (
                    <TableRow>
                      <TableCell 
                        colSpan={queryResults?.columns?.length || 1} 
                        className="px-4 py-8 text-center text-secondary-500"
                      >
                        {isExecutingQuery ? (
                          <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700 mb-2"></div>
                            <p>Executing query...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-secondary-400 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="8" x2="12" y2="12"></line>
                              <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <p>No results to display. Execute a query to see results.</p>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            ) : (
              <div className="px-4 py-8 text-center text-secondary-500">
                {isExecutingQuery ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700 mb-2"></div>
                    <p>Executing query...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-secondary-400 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <p>No results to display. Execute a query to see results.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {queryResults && queryResults.rows && queryResults.rows.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-secondary-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-secondary-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{endIndex}</span> of{' '}
                    <span className="font-medium">{totalRows}</span> results
                  </p>
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {paginationLinks.map((page, index) => (
                      page === "ellipsis" ? (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-secondary-700">
                            ...
                          </span>
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={index}>
                          <PaginationLink
                            onClick={() => setCurrentPage(Number(page))}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

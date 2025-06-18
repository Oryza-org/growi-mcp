import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { getConfig } from './config/index.js';
import { createApiClient } from './api/index.js';
import { handleToolCall } from './tools/index.js';

async function callTool(apiClient: any, toolName: string, args: any): Promise<CallToolResult> {
  const result = await handleToolCall(apiClient, toolName, args);
  
  // Convert the legacy format to MCP CallToolResult format
  const content = result.content.map((item: any) => ({
    type: item.type as "text",
    text: item.text as string
  }));
  
  return {
    content,
    isError: result.isError
  };
}

export function createServer() {
  const config = getConfig();
  const apiClient = createApiClient(config);
  
  const server = new McpServer({
    name: 'growi-mcp',
    version: '1.0.0'
  }, {
    capabilities: {
      tools: {}
    }
  });

  // Register growi_list_pages tool
  server.tool('growi_list_pages', 'Get a list of pages from Growi with optional filters', {
    limit: z.number().optional().describe('Maximum number of pages to return'),
    path: z.string().optional().describe('Filter pages by path')
  }, async (args) => {
    return await callTool(apiClient, 'growi_list_pages', args);
  });

  // Register growi_get_page tool
  server.tool('growi_get_page', 'Get a single page from Growi by path', {
    path: z.string().describe('The path of the page to retrieve')
  }, async (args) => {
    return await callTool(apiClient, 'growi_get_page', args);
  });

  // Register growi_create_page tool
  server.tool('growi_create_page', 'Create a new page in Growi', {
    path: z.string().describe('The path where the page will be created'),
    body: z.string().describe('The content/body of the page')
  }, async (args) => {
    return await callTool(apiClient, 'growi_create_page', args);
  });

  // Register growi_update_page tool
  server.tool('growi_update_page', 'Update an existing page in Growi', {
    path: z.string().describe('The path of the page to update'),
    body: z.string().describe('The new content/body for the page')
  }, async (args) => {
    return await callTool(apiClient, 'growi_update_page', args);
  });

  // Register growi_search_pages tool
  server.tool('growi_search_pages', 'Search for pages in Growi', {
    q: z.string().describe('Search query'),
    limit: z.number().optional().describe('Maximum number of pages to return'),
    offset: z.number().optional().describe('Offset for pagination')
  }, async (args) => {
    return await callTool(apiClient, 'growi_search_pages', args);
  });
  
  return server;
}

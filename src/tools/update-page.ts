import { UpdatePageArgs } from '../types/index.js';
import { ApiClient } from '../api/index.js';
import { normalizePath, debugLog } from '../utils/index.js';

export async function handleUpdatePage(apiClient: ApiClient, args: UpdatePageArgs) {
  const path = normalizePath(args.path);
  const body = args.body;
  
  let debugInfo = "";
  debugInfo += debugLog("UPDATE PAGE REQUEST", { path, bodyLength: body.length });
  
  try {
    const updateResponse = await apiClient.updatePage(path, body);
    
    debugInfo += debugLog("UPDATE PAGE RESPONSE", updateResponse.data);
    
    if (updateResponse.data && updateResponse.data.page) {
      const page = updateResponse.data.page;
      
      return {
        content: [{ 
          type: "text", 
          text: `Successfully updated page at ${page.path}` 
        }],
        isError: false,
      };
    }
    
    return {
      content: [{ 
        type: "text", 
        text: `Failed to update page: Unexpected response format\n\n${debugInfo}` 
      }],
      isError: true,
    };
  } catch (error) {
    debugInfo += debugLog("UPDATE PAGE ERROR", {
      message: error instanceof Error ? error.message : String(error),
      response: error instanceof Error && 'response' in error ? (error as any).response?.data : null
    });
    
    return {
      content: [{ 
        type: "text", 
        text: `Error updating page: ${error instanceof Error ? error.message : String(error)}\n\n${debugInfo}` 
      }],
      isError: true,
    };
  }
}

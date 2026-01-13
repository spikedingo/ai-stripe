#!/usr/bin/env node
/**
 * Extract Agent-related APIs from api.html documentation
 */
const fs = require('fs');
const path = require('path');

// Simple HTML parser using regex (for basic extraction)
class AgentAPIExtractor {
  constructor(htmlFile) {
    this.htmlFile = htmlFile;
    this.apis = [];
  }

  extract() {
    console.log(`[extract-agent-apis] Reading ${this.htmlFile}...`);
    const htmlContent = fs.readFileSync(this.htmlFile, 'utf-8');
    
    // Find all Agent operation sections using regex
    const operationPattern = /<div[^>]*id="tag\/Agent\/operation\/([^"]+)"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g;
    let match;
    
    while ((match = operationPattern.exec(htmlContent)) !== null) {
      const operationId = match[1];
      const sectionHtml = match[2];
      
      const api = this.extractAPIInfo(operationId, sectionHtml);
      if (api) {
        this.apis.push(api);
        console.log(`[extract-agent-apis] Extracted: ${api.method.toUpperCase()} ${api.path} - ${api.name}`);
      }
    }
    
    // Alternative: find sections by data-section-id
    if (this.apis.length === 0) {
      const sectionPattern = /<div[^>]*data-section-id="tag\/Agent\/operation\/([^"]+)"[^>]*>([\s\S]*?)(?=<div[^>]*data-section-id="tag\/Agent\/operation\/|<div[^>]*id="tag\/[^A])/g;
      let sectionMatch;
      
      while ((sectionMatch = sectionPattern.exec(htmlContent)) !== null) {
        const operationId = sectionMatch[1];
        const sectionHtml = sectionMatch[2];
        
        const api = this.extractAPIInfo(operationId, sectionHtml);
        if (api && !this.apis.find(a => a.id === api.id)) {
          this.apis.push(api);
          console.log(`[extract-agent-apis] Extracted: ${api.method.toUpperCase()} ${api.path} - ${api.name}`);
        }
      }
    }
    
    console.log(`[extract-agent-apis] Found ${this.apis.length} Agent API sections`);
    return this.apis;
  }

  extractAPIInfo(operationId, html) {
    try {
      // Extract name from h2
      const nameMatch = html.match(/<h2[^>]*>[\s\S]*?<a[^>]*><\/a>([^<]+)</);
      const name = nameMatch ? nameMatch[1].trim() : operationId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      // Extract description
      const descMatch = html.match(/<div[^>]*class="[^"]*hzUya[^"]*"[^>]*>([\s\S]*?)<\/div>/);
      let description = '';
      if (descMatch) {
        const descHtml = descMatch[1];
        const pMatches = descHtml.match(/<p[^>]*>([^<]+)<\/p>/g);
        if (pMatches) {
          description = pMatches.map(p => p.replace(/<[^>]+>/g, '').trim()).join(' ');
        }
      }
      
      // Extract method and path
      const { method, path } = this.extractMethodAndPath(html);
      
      // Extract parameters
      const parameters = this.extractParameters(html);
      
      // Extract request body
      const requestBody = this.extractRequestBody(html);
      
      // Extract responses
      const responses = this.extractResponses(html);
      
      // Extract authorization
      const authorization = html.includes('HTTPBearer') ? 'HTTPBearer' : undefined;
      
      return {
        id: operationId,
        name,
        description,
        method,
        path,
        parameters,
        requestBody,
        responses,
        authorization,
      };
    } catch (error) {
      console.error(`[extract-agent-apis] Error extracting API ${operationId}:`, error.message);
      return null;
    }
  }

  extractMethodAndPath(html) {
    // Find http-verb span - look in the sc-iGgWBj section which contains the actual endpoint
    // Extract the section that contains the endpoint button
    const endpointSection = html.match(/<div[^>]*class="[^"]*sc-iGgWBj[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/);
    const searchHtml = endpointSection ? endpointSection[1] : html;
    
    // Find http-verb span - look for class containing "http-verb" and method name
    // Try multiple patterns to find the method, prioritizing type attribute
    let method = 'get';
    const verbPatterns = [
      // Pattern 1: type attribute first (most reliable) - in button section
      /<span[^>]*type="(\w+)"[^>]*class="[^"]*http-verb[^"]*"[^>]*>(\w+)<\/span>/i,
      // Pattern 2: class first, then type
      /<span[^>]*class="[^"]*http-verb[^"]*"[^>]*type="(\w+)"[^>]*>(\w+)<\/span>/i,
      // Pattern 3: method in class name (e.g., "http-verb put")
      /<span[^>]*class="[^"]*http-verb\s+(\w+)[^"]*"[^>]*>(\w+)<\/span>/i,
      // Pattern 4: just the text content
      /<span[^>]*class="[^"]*http-verb[^"]*"[^>]*>(\w+)<\/span>/i,
    ];
    
    for (const pattern of verbPatterns) {
      const match = searchHtml.match(pattern);
      if (match) {
        // For patterns with type attribute, match[1] is the type, match[2] is the text
        // For patterns without type, match[1] is the text
        if (match[1] && match[2] && match[1] !== match[2]) {
          // Has both type attribute and text - prefer type attribute
          method = match[1].toLowerCase();
        } else if (match[1]) {
          // Only one match - use it
          method = match[1].toLowerCase();
        }
        if (method !== 'get' || pattern === verbPatterns[verbPatterns.length - 1]) {
          break;
        }
      }
    }
    
    // Find path span - look for class containing "lmuCWo" or "sc-iEXKAA"
    // Use the same section as method extraction
    let path = '';
    const pathPatterns = [
      /<span[^>]*class="[^"]*lmuCWo[^"]*"[^>]*>([^<]+)<\/span>/,
      /<span[^>]*class="[^"]*sc-iEXKAA[^"]*lmuCWo[^"]*"[^>]*>([^<]+)<\/span>/,
      /class="[^"]*lmuCWo[^"]*"[^>]*>\s*([\/\w\{\}]+)\s*</,
    ];
    
    for (const pattern of pathPatterns) {
      const match = searchHtml.match(pattern);
      if (match) {
        path = match[1].trim();
        if (path) break;
      }
    }
    
    // If still no path, try to find it near the http-verb span in the original html
    if (!path) {
      const verbSection = html.match(/<span[^>]*http-verb[^>]*>[\s\S]{0,500}/);
      if (verbSection) {
        const pathInSection = verbSection[0].match(/<span[^>]*class="[^"]*lmuCWo[^"]*"[^>]*>([^<]+)<\/span>/);
        if (pathInSection) {
          path = pathInSection[1].trim();
        }
      }
    }
    
    return { method, path };
  }

  extractParameters(html) {
    const params = {
      query: [],
      path: [],
      header: [],
    };
    
    // Find parameter sections
    const paramSections = html.match(/<h5[^>]*>([^<]*Parameters[^<]*)<\/h5>([\s\S]*?)(?=<h5|<h3|$)/g);
    
    if (paramSections) {
      paramSections.forEach(section => {
        let paramType = 'query';
        if (section.includes('path Parameters')) {
          paramType = 'path';
        } else if (section.includes('header')) {
          paramType = 'header';
        }
        
        // Extract table rows
        const tableMatch = section.match(/<table[^>]*>([\s\S]*?)<\/table>/);
        if (tableMatch) {
          const tableHtml = tableMatch[1];
          const rowMatches = tableHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/g);
          
          if (rowMatches) {
            rowMatches.forEach(row => {
              const param = this.extractParameterFromRow(row);
              if (param) {
                params[paramType].push(param);
              }
            });
          }
        }
      });
    }
    
    return params;
  }

  extractParameterFromRow(row) {
    // Extract name
    const nameMatch = row.match(/<span[^>]*class="[^"]*property-name[^"]*"[^>]*>([^<]+)<\/span>/);
    if (!nameMatch) return null;
    
    const name = nameMatch[1].trim();
    
    // Check if required
    const required = row.includes('required');
    
    // Extract type - look for class containing "iHgalF" or "sc-gFAWRd"
    const typeMatch = row.match(/<span[^>]*class="[^"]*iHgalF[^"]*"[^>]*>([^<]+)<\/span>/) ||
                     row.match(/<span[^>]*class="[^"]*sc-gFAWRd[^"]*"[^>]*>([^<]+)<\/span>/);
    let paramType = 'string';
    if (typeMatch) {
      paramType = typeMatch[1].trim();
      // Clean up type string - remove parenthetical descriptions like "(Is Archived)"
      paramType = paramType.replace(/\s*\([^)]+\)\s*/g, '').trim();
      // Handle cases like "Description (string) or Description (null)"
      if (paramType.includes(' or ')) {
        const firstType = paramType.split(' or ')[0].match(/\((\w+)\)/);
        paramType = firstType ? firstType[1] : 'string';
      }
      // Normalize common types
      if (paramType.toLowerCase() === 'integer' || paramType.toLowerCase() === 'int') {
        paramType = 'number';
      }
    }
    
    // Extract description - look for <p> tags or divs with description
    let description = '';
    const descPMatch = row.match(/<p[^>]*>([^<]+)<\/p>/);
    if (descPMatch) {
      description = descPMatch[1].trim();
    } else {
      // Try to find description in div with class containing "FDQvA"
      const descDivMatch = row.match(/<div[^>]*class="[^"]*FDQvA[^"]*"[^>]*>[\s\S]*?<p[^>]*>([^<]+)<\/p>/);
      if (descDivMatch) {
        description = descDivMatch[1].trim();
      }
    }
    
    // Extract default value
    const defaultMatch = row.match(/<span[^>]*class="[^"]*dEQDjv[^"]*"[^>]*>([^<]+)<\/span>/);
    const defaultValue = defaultMatch ? defaultMatch[1].trim() : undefined;
    
    return {
      name,
      type: paramType,
      required,
      description,
      default: defaultValue,
    };
  }

  extractRequestBody(html) {
    // Find request body section
    if (!html.includes('Request Body')) {
      return undefined;
    }
    
    const bodyMatch = html.match(/<h5[^>]*>Request Body[\s\S]*?<table[^>]*>([\s\S]*?)<\/table>/);
    if (!bodyMatch) {
      return undefined;
    }
    
    const tableHtml = bodyMatch[1];
    const rowMatches = tableHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/g);
    
    if (!rowMatches) {
      return undefined;
    }
    
    const properties = [];
    rowMatches.forEach(row => {
      const prop = this.extractParameterFromRow(row);
      if (prop) {
        properties.push(prop);
      }
    });
    
    if (properties.length === 0) {
      return undefined;
    }
    
    return {
      contentType: 'application/json',
      required: true,
      properties,
    };
  }

  extractResponses(html) {
    const responses = [];
    
    // Find responses section
    if (!html.includes('Responses')) {
      return responses;
    }
    
    // Find all response buttons
    const responsePattern = /<button[^>]*class="[^"]*kzqdkY[^"]*"[^>]*>[\s\S]*?<strong[^>]*>(\d+)\s*<\/strong>[\s\S]*?<div[^>]*class="[^"]*ctYaUb[^"]*"[^>]*>[\s\S]*?<p[^>]*>([^<]+)<\/p>/g;
    let match;
    
    while ((match = responsePattern.exec(html)) !== null) {
      responses.push({
        statusCode: parseInt(match[1], 10),
        description: match[2].trim(),
      });
    }
    
    return responses;
  }

  saveToJSON(outputFile) {
    const outputPath = path.resolve(outputFile);
    const outputDir = path.dirname(outputPath);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const data = {
      tag: 'Agent',
      apis: this.apis,
      total: this.apis.length,
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`[extract-agent-apis] Saved ${this.apis.length} APIs to ${outputPath}`);
  }

  saveToTypeScript(outputFile) {
    const outputPath = path.resolve(outputFile);
    const outputDir = path.dirname(outputPath);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const lines = [
      '// Auto-generated Agent API definitions',
      '// Extracted from api.html documentation',
      '',
      'export interface AgentAPIParameter {',
      '  name: string;',
      '  type: string;',
      '  required: boolean;',
      '  description?: string;',
      '  default?: string;',
      '}',
      '',
      'export interface AgentAPIRequestBody {',
      '  contentType: string;',
      '  required: boolean;',
      '  properties: AgentAPIParameter[];',
      '}',
      '',
      'export interface AgentAPIResponse {',
      '  statusCode: number | string;',
      '  description: string;',
      '}',
      '',
      'export interface AgentAPI {',
      '  id: string;',
      '  name: string;',
      '  description: string;',
      '  method: string;',
      '  path: string;',
      '  parameters: {',
      '    query: AgentAPIParameter[];',
      '    path: AgentAPIParameter[];',
      '    header: AgentAPIParameter[];',
      '  };',
      '  requestBody?: AgentAPIRequestBody;',
      '  responses: AgentAPIResponse[];',
      '  authorization?: string;',
      '}',
      '',
      `export const agentAPIs: AgentAPI[] = ${JSON.stringify(this.apis, null, 2)};`,
      '',
      `export const agentAPIsTotal = ${this.apis.length};`,
      '',
    ];
    
    fs.writeFileSync(outputPath, lines.join('\n'), 'utf-8');
    console.log(`[extract-agent-apis] Saved TypeScript definitions to ${outputPath}`);
  }
}

function main() {
  const scriptDir = __dirname;
  const projectRoot = path.resolve(scriptDir, '..');
  const htmlFile = path.join(projectRoot, 'docs', 'api.html');
  const apiDir = path.join(projectRoot, 'api');
  
  if (!fs.existsSync(htmlFile)) {
    console.error(`[extract-agent-apis] Error: ${htmlFile} not found`);
    process.exit(1);
  }
  
  const extractor = new AgentAPIExtractor(htmlFile);
  const apis = extractor.extract();
  
  if (apis.length === 0) {
    console.error('[extract-agent-apis] No APIs extracted');
    process.exit(1);
  }
  
  // Save to JSON (in data subdirectory to avoid conflicts with TS files)
  const dataDir = path.join(apiDir, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const jsonFile = path.join(dataDir, 'agent-apis.json');
  extractor.saveToJSON(jsonFile);
  
  // Save to TypeScript
  const tsFile = path.join(apiDir, 'agent-apis.ts');
  extractor.saveToTypeScript(tsFile);
  
  console.log(`[extract-agent-apis] Extraction complete! Found ${apis.length} Agent APIs`);
}

if (require.main === module) {
  main();
}

module.exports = { AgentAPIExtractor };


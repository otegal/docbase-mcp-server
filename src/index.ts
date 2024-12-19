import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv'
dotenv.config()

const ACCESS_TOKEN = process.env.DOCBASE_ACCESS_TOKEN as string
const TEAM_NAME = process.env.DOCBASE_TEAM_NAME as string

type PostsResponse = {
  posts: Post[],
  meta: {
    previous_page?: number;
    next_page?: string;
    total: number
  }
}

type Post = {
  id: number;
  title: string;
  body: string;
  draft: boolean;
  archived: boolean;
  url: string;
  created_at: string;
  updated_at: string;
}

export const fetchPosts = async (query: string): Promise<PostsResponse> => {
  try {
    const url = new URL(`https://api.docbase.io/teams/${TEAM_NAME}/posts`)
    url.searchParams.append('q', query)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-DocBaseToken': ACCESS_TOKEN
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch posts. HTTP status: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching DocBase posts:', error);
    throw error;
  }
}



const PostsSearch = 'docbase-posts-search';

const server = new Server(
  {
    name: 'docbase-mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {
        [PostsSearch]: {
          description: 'DocBase search tool',
        }
      },
    },
  }
);


server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: PostsSearch,
    description: 'Search posts in DocBase using the official API. Returns post titles, content, and metadata matching the search query. Requires a valid DocBase API token.',
    inputSchema: {
      type: 'object',
      properties: {
        q: {
          type: 'string',
          description: 'Search query' // あとでタグ検索のルールも追加したい
        },
        page: {
          type: 'number',
          description: 'Number of current page in pagination',
        },
        per_page: {
          type: 'number',
          description: 'Number of per page in pagination (max 100)',
          default: 10
        }
      },
    }
  }]
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;
    if (!args) {
      throw new Error('No arguments provided');
    }

    switch (name) {
      case PostsSearch: {
        const { q } = args;
        const results = await fetchPosts(q as string);
        return {
          content: [{ type: 'text', text: JSON.stringify(results, null, 2) }],
          isError: false,
        };
      }
      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  }
  catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Social API",
    version: "1.0.0",
    description: "Backend API for auth, ebooks, videos, and AI apologist chat."
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local server"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      SignupRequest: {
        type: "object",
        required: ["username", "email", "password"],
        properties: {
          username: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 6 }
        }
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" }
        }
      },
      CreateVideoRequest: {
        type: "object",
        required: ["title", "youtubeUrl", "latest", "description", "thumbnailUrl", "category"],
        properties: {
          title: { type: "string" },
          youtubeUrl: { type: "string" },
          latest: { type: "string", enum: ["new", "old"] },
          category: {
            type: "string",
            enum: [
              "theology",
              "textual criticism",
              "defense for God",
              "islam apologetics",
              "defense for Jesus"
            ]
          },
          description: { type: "string" },
          thumbnailUrl: { type: "string" }
        }
      },
      AskApologistRequest: {
        type: "object",
        required: ["question"],
        properties: {
          question: { type: "string" },
          conversationId: { type: "string" },
          conversationTitle: { type: "string" }
        }
      },
      RecordDownloadRequest: {
        type: "object",
        required: ["archiveIdentifier"],
        properties: {
          archiveIdentifier: { type: "string", description: "Internet Archive identifier" },
          title: { type: "string" },
          workId: { type: "string" },
          author: { type: "string" }
        }
      }
    }
  },
  tags: [
    { name: "Auth" },
    { name: "Ebooks" },
    { name: "Videos" },
    { name: "AI" }
  ],
  paths: {
    "/api/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "Create a user account",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/SignupRequest" } }
          }
        },
        responses: {
          201: { description: "Signup success" },
          409: { description: "User exists / validation issue" }
        }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login user",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } }
          }
        },
        responses: {
          200: { description: "Login success" },
          400: { description: "Invalid credentials" }
        }
      }
    },
    "/api/auth/users": {
      get: {
        tags: ["Auth"],
        summary: "List all users (username + email)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "User list returned" },
          401: { description: "Unauthorized" }
        }
      }
    },
    "/api/auth/profile": {
      get: {
        tags: ["Auth"],
        summary: "Current user profile (downloads + recent watched videos)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Profile returned" },
          401: { description: "Unauthorized" }
        }
      }
    },
    "/api/auth/profile/downloads": {
      post: {
        tags: ["Auth"],
        summary: "Record a downloaded book for current user",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RecordDownloadRequest" } }
          }
        },
        responses: {
          200: { description: "Saved" },
          400: { description: "Bad request" },
          401: { description: "Unauthorized" }
        }
      }
    },
    "/api/ebooks/subject/apologetics": {
      get: {
        tags: ["Ebooks"],
        summary: "Fetch apologetics books by subject",
        parameters: [
          { in: "query", name: "limit", schema: { type: "integer", default: 20 } },
          { in: "query", name: "offset", schema: { type: "integer", default: 0 } }
        ],
        responses: { 200: { description: "Books returned" } }
      }
    },
    "/api/ebooks/search": {
      get: {
        tags: ["Ebooks"],
        summary: "Search ebooks by q/title/author",
        parameters: [
          { in: "query", name: "q", schema: { type: "string" } },
          { in: "query", name: "title", schema: { type: "string" } },
          { in: "query", name: "author", schema: { type: "string" } },
          { in: "query", name: "page", schema: { type: "integer", default: 1 } }
        ],
        responses: { 200: { description: "Search result returned" } }
      }
    },
    "/api/ebooks/work/{workId}": {
      get: {
        tags: ["Ebooks"],
        summary: "Get work details",
        parameters: [{ in: "path", name: "workId", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Work details returned" } }
      }
    },
    "/api/ebooks/edition/{editionId}": {
      get: {
        tags: ["Ebooks"],
        summary: "Get edition details",
        parameters: [{ in: "path", name: "editionId", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Edition details returned" } }
      }
    },
    "/api/ebooks/cover/{coverId}": {
      get: {
        tags: ["Ebooks"],
        summary: "Build cover URL",
        parameters: [
          { in: "path", name: "coverId", required: true, schema: { type: "string" } },
          { in: "query", name: "size", schema: { type: "string", enum: ["S", "M", "L"], default: "L" } }
        ],
        responses: { 200: { description: "Cover url returned" } }
      }
    },
    "/api/ebooks/download/{identifier}": {
      get: {
        tags: ["Ebooks"],
        summary: "Get PDF and EPUB download links",
        parameters: [{ in: "path", name: "identifier", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Download links returned" } }
      }
    },
    "/api/videos": {
      get: {
        tags: ["Videos"],
        summary: "List videos",
        parameters: [
          { in: "query", name: "search", schema: { type: "string" } },
          { in: "query", name: "title", schema: { type: "string" } },
          { in: "query", name: "latest", schema: { type: "string", enum: ["new", "old"] } },
          { in: "query", name: "category", schema: { type: "string" } },
          { in: "query", name: "page", schema: { type: "integer", default: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", default: 6 } }
        ],
        responses: { 200: { description: "Videos returned" } }
      },
      post: {
        tags: ["Videos"],
        summary: "Create video",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/CreateVideoRequest" } }
          }
        },
        responses: { 201: { description: "Video created" } }
      }
    },
    "/api/videos/{id}": {
      put: {
        tags: ["Videos"],
        summary: "Update video",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        requestBody: {
          required: false,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/CreateVideoRequest" } }
          }
        },
        responses: { 200: { description: "Video updated" } }
      }
    },
    "/api/videos/{id}/watch": {
      post: {
        tags: ["Videos"],
        summary: "Record video watch (for recent history on profile)",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: {
          201: { description: "Watch recorded" },
          401: { description: "Unauthorized" },
          404: { description: "Video not found" }
        }
      }
    },
    "/api/ai/apologist": {
      post: {
        tags: ["AI"],
        summary: "Ask AI apologist and save chat",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/AskApologistRequest" } }
          }
        },
        responses: { 200: { description: "AI answer returned" }, 401: { description: "Unauthorized" } }
      }
    },
    "/api/ai/conversations": {
      get: {
        tags: ["AI"],
        summary: "List user conversation summaries",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Conversations returned" } }
      }
    },
    "/api/ai/history": {
      get: {
        tags: ["AI"],
        summary: "Get paginated chat history",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", default: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", default: 20 } },
          { in: "query", name: "conversationId", schema: { type: "string" } }
        ],
        responses: { 200: { description: "History returned" } }
      },
      delete: {
        tags: ["AI"],
        summary: "Clear user chat history",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "History cleared" } }
      }
    },
    "/api/ai/history/{chatId}": {
      delete: {
        tags: ["AI"],
        summary: "Delete one chat message",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "chatId", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Chat deleted" }, 404: { description: "Not found" } }
      }
    }
  }
};

export default swaggerDefinition;
